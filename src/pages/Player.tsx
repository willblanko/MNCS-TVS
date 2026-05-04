import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AlertCircle, MonitorOff } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function Player() {
  const { tvId } = useParams()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [currentTV, setCurrentTV] = useState<any | null>(null)
  const [playlistItems, setPlaylistItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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
        setPlaylistItems(items)
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

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black text-white text-xl">
        Carregando...
      </div>
    )
  }

  if (!currentTV) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black text-white text-xl">
        TV não encontrada.
      </div>
    )
  }

  if (currentTV.status === 'offline') {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-black text-white/50">
        <MonitorOff className="h-16 w-16 mb-4 opacity-50" />
        <h1 className="text-2xl font-bold">{currentTV.name}</h1>
        <p className="mt-2 text-lg">Esta tela está temporariamente desligada.</p>
      </div>
    )
  }

  if (playlistItems.length === 0 || !currentFile) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-black text-white/50">
        <AlertCircle className="h-16 w-16 mb-4 opacity-50" />
        <h1 className="text-2xl font-bold">{currentTV.name}</h1>
        <p className="mt-2 text-lg">Aguardando conteúdo na playlist...</p>
      </div>
    )
  }

  return (
    <div className="relative h-screen w-screen bg-black overflow-hidden select-none cursor-none pointer-events-none">
      {currentFile.type === 'video' ? (
        <video
          key={currentItem.id}
          src={currentFile.url}
          className="absolute inset-0 h-full w-full object-cover animate-fade-in duration-1000 ease-in-out"
          autoPlay
          muted
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
          className="absolute inset-0 h-full w-full object-cover animate-fade-in duration-1000 ease-in-out"
        />
      )}
    </div>
  )
}
