import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { AlertCircle, MonitorOff, VolumeX } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function Player() {
  const { tvId } = useParams()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentTV, setCurrentTV] = useState<any | null>(null)
  const [playlistItems, setPlaylistItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!tvId) return

    const fetchTV = async () => {
      const { data: tv } = await supabase.from('tvs').select('*').eq('id', tvId).single()
      if (tv) {
        setCurrentTV(tv)
        if (tv.playlist_id) {
          await fetchPlaylistItems(tv.playlist_id)
        }
      }
      setLoading(false)
    }

    const fetchPlaylistItems = async (playlistId: string) => {
      const { data: items } = await supabase
        .from('playlist_items')
        .select(`
          id,
          order,
          duration,
          file:files (
            id,
            url,
            type
          )
        `)
        .eq('playlist_id', playlistId)
        .order('order', { ascending: true })

      if (items) {
        const validItems = items.filter((item) => {
          const f = Array.isArray(item.file) ? item.file[0] : item.file
          return !!f
        })
        setPlaylistItems(validItems)
      }
    }

    fetchTV()

    const subTV = supabase
      .channel(`tv-${tvId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tvs', filter: `id=eq.${tvId}` },
        (payload) => {
          if (payload.new) {
            setCurrentTV(payload.new)
            if (payload.new.playlist_id && payload.new.playlist_id !== currentTV?.playlist_id) {
              fetchPlaylistItems(payload.new.playlist_id)
              setCurrentIndex(0)
            } else if (!payload.new.playlist_id) {
              setPlaylistItems([])
            }
          }
        },
      )
      .subscribe()

    const subItems = supabase
      .channel(`items-${tvId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'playlist_items' },
        (payload) => {
          if (currentTV?.playlist_id) {
            fetchPlaylistItems(currentTV.playlist_id)
          }
        },
      )
      .subscribe()

    return () => {
      subTV.unsubscribe()
      subItems.unsubscribe()
    }
  }, [tvId, currentTV?.playlist_id])

  useEffect(() => {
    if (playlistItems.length > 0 && currentIndex >= playlistItems.length) {
      setCurrentIndex(0)
    }
  }, [playlistItems.length, currentIndex])

  const currentItem = playlistItems[currentIndex]
  const currentFile = Array.isArray(currentItem?.file) ? currentItem.file[0] : currentItem?.file

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
        className="fixed inset-0 flex h-screen w-screen items-center justify-center bg-black text-white text-xl"
        style={{ zIndex: 2147483647 }}
      >
        TV não encontrada.
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
