import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { AlertCircle, MonitorOff, VolumeX } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'

export default function Player() {
  const { tvId } = useParams()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentTV, setCurrentTV] = useState<any | null>(null)
  const [playlistItems, setPlaylistItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
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

  useEffect(() => {
    if (!currentFile || !currentItem || playlistItems.length <= 1) return

    let timeout: ReturnType<typeof setTimeout>
    const nextIndex = (currentIndex + 1) % playlistItems.length

    if (currentFile.type === 'video') {
      // Allow video element to control duration via onEnded
    } else {
      const duration = currentItem.duration > 0 ? currentItem.duration * 1000 : 10000
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
      {currentFile.type === 'video' ? (
        <video
          ref={videoRef}
          key={currentItem.id}
          src={currentFile.url}
          className="absolute inset-0 h-full w-full object-contain animate-fade-in duration-1000 ease-in-out"
          playsInline
          loop={playlistItems.length === 1}
          onEnded={handleVideoEnded}
          onError={handleVideoEnded}
        />
      ) : (
        <img
          key={currentItem.id}
          src={currentFile.url}
          alt=""
          className="absolute inset-0 h-full w-full object-contain animate-fade-in duration-1000 ease-in-out"
        />
      )}

      {isMuted && currentFile.type === 'video' && (
        <div className="absolute bottom-8 right-8 z-50 flex items-center gap-2 rounded-full bg-black/50 px-4 py-2 text-white/70 backdrop-blur-md animate-pulse">
          <VolumeX className="h-5 w-5" />
          <span className="text-sm font-medium">Toque na tela para ativar o som</span>
        </div>
      )}
    </div>
  )
}
