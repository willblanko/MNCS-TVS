import { useState, useCallback } from 'react'
import { UploadCloud } from 'lucide-react'
import useMainStore, { MediaFile } from '@/stores/main'

export function UploadZone() {
  const [isDragging, setIsDragging] = useState(false)
  const { addFile, updateFile } = useMainStore()

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    simulateUpload()
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const simulateUpload = () => {
    const isVideo = Math.random() > 0.5
    const originalSize = Math.floor(Math.random() * 50000000) + 1000000
    const newFile: MediaFile = {
      id: Math.random().toString(36).substring(7),
      name: `Upload_${Math.floor(Math.random() * 1000)}${isVideo ? '.mp4' : '.jpg'}`,
      type: isVideo ? 'video' : 'image',
      originalSize,
      optimizedSize: Math.floor(originalSize * 0.4),
      status: 'optimizing',
      url: `https://img.usecurling.com/p/800/600?q=${isVideo ? 'nature' : 'city'}`,
      thumbnail: `https://img.usecurling.com/p/200/200?q=${isVideo ? 'nature' : 'city'}`,
      createdAt: Date.now(),
    }
    addFile(newFile)

    setTimeout(() => {
      updateFile(newFile.id, { status: 'ready' })
    }, 3000)
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={simulateUpload}
      className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
        isDragging
          ? 'border-primary bg-primary/10'
          : 'border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/50'
      }`}
    >
      <div className="flex flex-col items-center gap-2">
        <UploadCloud className="h-10 w-10 text-muted-foreground" />
        <p className="text-lg font-medium">
          Arraste e solte arquivos aqui ou clique para fazer upload
        </p>
        <p className="text-sm text-muted-foreground">
          Vídeos (MP4) e Imagens (JPG, PNG) até 100MB.
        </p>
      </div>
    </div>
  )
}
