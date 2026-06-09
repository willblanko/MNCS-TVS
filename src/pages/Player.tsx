import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { AlertCircle, MonitorOff, VolumeX } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { cn } from '@/lib/utils'

export default function Player() {
  const { tvId } = useParams()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentTV, setCurrentTV] = useState<any | null>(null)
  const [playlistItems, setPlaylistItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isMuted, setIsMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  const fetchData = async () => {
    try {
      const tv = await pb.collection('tvs').getFirstListItem(`code="${tvId}"`, { code: tvId })
      setCurrentTV(tv)

      if (tv.status === 'offline') {
        setPlaylistItems([])
        setLoading(false)
        return
      }

      const schedules = await pb.collection('playlist_schedules').getFullList({
        filter: `tv="${tv.id}" && active=true`,
      })

      const now = new Date()
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
      const currentDay = days[now.getDay()]
      const currentHour = now.getHours().toString().padStart(2, '0')
      const currentMinute = now.getMinutes().toString().padStart(2, '0')
      const currentTime = `${currentHour}:${currentMinute}`

      let targetPlaylist = tv.current_playlist

      for (const schedule of schedules) {
        if (
          schedule.days_of_week.includes(currentDay) &&
          schedule.start_time <= currentTime &&
          schedule.end_time >= currentTime
        ) {
          targetPlaylist = schedule.playlist
          break
        }
      }

      if (targetPlaylist) {
        const items = await pb.collection('playlist_items').getFullList({
          filter: `playlist="${targetPlaylist}"`,
          sort: 'sort_order',
          expand: 'file',
        })
        const mappedItems = items
          .map((item: any) => ({ ...item, file: item.expand?.file }))
          .filter((i) => i.file)

        setPlaylistItems(mappedItems)
      } else {
        setPlaylistItems([])
      }
    } catch (err) {
      console.error('Player fetch error:', err)
      setCurrentTV(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!tvId) return
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [tvId])

  useRealtime('tvs', (e) => {
    if (e.action === 'update' && e.record.code === tvId) {
      fetchData()
    }
  })

  useRealtime('playlists', () => fetchData())
  useRealtime('playlist_schedules', () => fetchData())
  useRealtime('playlist_items', () => fetchData())

  useEffect(() => {
    if (playlistItems.length > 0 && currentIndex >= playlistItems.length) {
      setCurrentIndex(0)
    }
  }, [playlistItems.length, currentIndex])

  const currentItem = playlistItems[currentIndex]
  const currentFile = currentItem?.file

  const extractYouTubeId = (url: string) => {
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([^&?]{11})/,
    )
    return match ? match[1] : null
  }

  useEffect(() => {
    if (!currentFile || !currentItem || playlistItems.length <= 1) return

    let timeout: ReturnType<typeof setTimeout>
    const nextIndex = (currentIndex + 1) % playlistItems.length

    const isYoutube = currentFile.type === 'video' && !!extractYouTubeId(currentFile.url)

    if (currentFile.type === 'video' && !isYoutube) {
      // Legacy HTML5 video uses onEnded event below
    } else {
      let duration = currentItem.duration > 0 ? currentItem.duration * 1000 : 10000
      if (isYoutube && currentItem.duration === 0) {
        duration = (currentFile.duration > 0 ? currentFile.duration : 60) * 1000
      }
      timeout = setTimeout(() => setCurrentIndex(nextIndex), duration)
    }

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [currentIndex, currentItem, currentFile, playlistItems.length])

  useEffect(() => {
    if (currentFile?.type === 'video' && videoRef.current) {
      const video = videoRef.current
      video.muted = isMuted
      const promise = video.play()
      if (promise !== undefined) {
        promise.catch((error) => {
          if (error.name === 'NotAllowedError') {
            video.muted = true
            setIsMuted(true)
            video.play().catch(console.error)
          }
        })
      }
    }
  }, [currentIndex, currentFile, isMuted])

  const handleVideoEnded = () => {
    if (playlistItems.length > 1) {
      setCurrentIndex((currentIndex + 1) % playlistItems.length)
    } else {
      const video = document.querySelector('video')
      if (video) {
        video.currentTime = 0
        video.play().catch(() => {})
      }
    }
  }

  const handleInteraction = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }

    if (isMuted) {
      setIsMuted(false)
      if (videoRef.current) {
        videoRef.current.muted = false
        videoRef.current.play().catch(console.error)
      }
    }
  }

  if (loading) {
    return (
      <div
        className="fixed inset-0 flex h-screen w-screen items-center justify-center bg-black text-white text-xl"
        style={{ zIndex: 2147483647 }}
      >
        Carregando...
      </div>
    )
  }

  if (!currentTV) {
    return (
      <div
        className="fixed inset-0 flex h-screen w-screen items-center justify-center bg-black text-white text-xl text-center p-4"
        style={{ zIndex: 2147483647 }}
      >
        TV Code {tvId} não encontrado. Por favor, verifique o código e tente novamente.
      </div>
    )
  }

  if (currentTV.status === 'offline') {
    return (
      <div
        className="fixed inset-0 flex h-screen w-screen flex-col items-center justify-center bg-black text-white/50 cursor-pointer select-none"
        style={{ zIndex: 2147483647 }}
        onClick={handleInteraction}
      >
        <MonitorOff className="h-16 w-16 mb-4 opacity-50" />
        <h1 className="text-2xl font-bold">{currentTV.name}</h1>
        <p className="mt-2 text-lg">Esta tela está temporariamente desligada.</p>
        <p className="mt-8 text-sm opacity-30">Toque para alternar tela cheia</p>
      </div>
    )
  }

  if (playlistItems.length === 0 || !currentFile) {
    return (
      <div
        className="fixed inset-0 flex h-screen w-screen flex-col items-center justify-center bg-black text-white/50 cursor-pointer select-none"
        style={{ zIndex: 2147483647 }}
        onClick={handleInteraction}
      >
        <AlertCircle className="h-16 w-16 mb-4 opacity-50" />
        <h1 className="text-2xl font-bold">{currentTV.name}</h1>
        <p className="mt-2 text-lg">Aguardando conteúdo na playlist...</p>
        <p className="mt-8 text-sm opacity-30">Toque para alternar tela cheia</p>
      </div>
    )
  }

  return (
    <div
      className="fixed inset-0 h-screen w-screen bg-black overflow-hidden select-none cursor-none"
      style={{ zIndex: 2147483647 }}
      onClick={handleInteraction}
    >
      {playlistItems.map((item, index) => {
        const file = item.file
        if (!file) return null
        const isActive = index === currentIndex
        const isYoutube = file.type === 'video' && !!extractYouTubeId(file.url)

        if (file.type === 'video') {
          if (!isActive) return null

          if (isYoutube) {
            return (
              <iframe
                key={item.id}
                src={`https://www.youtube.com/embed/${extractYouTubeId(file.url)}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&rel=0&showinfo=0&modestbranding=1&loop=${playlistItems.length === 1 ? 1 : 0}&playlist=${extractYouTubeId(file.url)}&disablekb=1&iv_load_policy=3`}
                className="absolute inset-0 h-full w-full pointer-events-none animate-fade-in duration-1000 ease-in-out"
                allow="autoplay; encrypted-media"
                frameBorder="0"
              />
            )
          } else {
            return (
              <video
                ref={videoRef}
                key={item.id}
                src={file.url}
                className="absolute inset-0 h-full w-full object-contain pointer-events-none animate-fade-in duration-1000 ease-in-out"
                playsInline
                loop={playlistItems.length === 1}
                onEnded={handleVideoEnded}
                onError={handleVideoEnded}
                muted={isMuted}
              />
            )
          }
        } else {
          return (
            <img
              key={item.id}
              src={file.url}
              alt=""
              className={cn(
                'absolute inset-0 h-full w-full object-contain pointer-events-none transition-opacity duration-1000 ease-in-out',
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0',
              )}
            />
          )
        }
      })}

      {isMuted && currentFile.type === 'video' && (
        <div className="absolute bottom-8 right-8 z-50 flex items-center gap-2 rounded-full bg-black/50 px-4 py-2 text-white/70 backdrop-blur-md animate-pulse">
          <VolumeX className="h-5 w-5" />
          <span className="text-sm font-medium">Toque na tela para ativar o som</span>
        </div>
      )}
    </div>
  )
}
