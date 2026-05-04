import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import useMainStore from '@/stores/main'
import { AlertCircle, MonitorOff } from 'lucide-react'

export default function Player() {
  const { tvId } = useParams()
  const { tvs, playlists, files } = useMainStore()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [playlistId, setPlaylistId] = useState<string | null>(null)

  const currentTV = tvs.find((t) => t.id === tvId)

  useEffect(() => {
    if (currentTV && currentTV.playlistId !== playlistId) {
      setPlaylistId(currentTV.playlistId)
      setCurrentIndex(0)
    }
  }, [currentTV?.playlistId, playlistId])

  const playlist = playlists.find((p) => p.id === playlistId)
  const items = playlist?.items || []

  useEffect(() => {
    if (items.length > 0 && currentIndex >= items.length) {
      setCurrentIndex(0)
    }
  }, [items.length, currentIndex])

  const currentItem = items[currentIndex]
  const currentFile = currentItem ? files.find((f) => f.id === currentItem.fileId) : null

  useEffect(() => {
    if (!currentFile || !currentItem || items.length <= 1) return

    let timeout: ReturnType<typeof setTimeout>
    const nextIndex = (currentIndex + 1) % items.length

    if (currentFile.type === 'video') {
      // Simulate video duration as 5 seconds for demonstration purposes
      timeout = setTimeout(() => setCurrentIndex(nextIndex), 5000)
    } else {
      const duration = currentItem.duration > 0 ? currentItem.duration * 1000 : 5000
      timeout = setTimeout(() => setCurrentIndex(nextIndex), duration)
    }

    return () => clearTimeout(timeout)
  }, [currentIndex, currentItem, currentFile, items.length])

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

  if (!playlist || items.length === 0 || !currentFile) {
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
      <img
        key={currentItem.id}
        src={currentFile.url}
        alt=""
        className="absolute inset-0 h-full w-full object-cover animate-fade-in duration-1000 ease-in-out"
      />
    </div>
  )
}
