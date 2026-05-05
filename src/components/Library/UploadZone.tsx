import { useState, useCallback, useRef } from 'react'
import { UploadCloud } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

export function UploadZone({ onUploadSuccess }: { onUploadSuccess?: () => void }) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFile(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFile(e.target.files[0])
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const generateThumbnail = async (file: File): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const isVideo = file.type.startsWith('video/')
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (isVideo) {
        const video = document.createElement('video')
        video.autoplay = false
        video.muted = true
        video.playsInline = true
        video.src = URL.createObjectURL(file)
        video.onloadedmetadata = () => {
          video.currentTime = Math.min(1, video.duration / 2 || 0.5)
        }
        video.onseeked = () => {
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)
          canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.7)
          URL.revokeObjectURL(video.src)
        }
        video.onerror = () => resolve(null)
      } else {
        const img = new Image()
        img.src = URL.createObjectURL(file)
        img.onload = () => {
          const maxSize = 800
          let width = img.width
          let height = img.height

          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width
              width = maxSize
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height
              height = maxSize
            }
          }

          canvas.width = width
          canvas.height = height
          ctx?.drawImage(img, 0, 0, width, height)
          canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.7)
          URL.revokeObjectURL(img.src)
        }
        img.onerror = () => resolve(null)
      }
    })
  }

  const uploadFile = async (file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O limite é de 50MB por arquivo.',
        variant: 'destructive',
      })
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    try {
      setIsUploading(true)
      const isVideo = file.type.startsWith('video/')
      const type = isVideo ? 'video' : 'image'

      const fileExt = file.name.split('.').pop()
      const rawBaseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
      const safeBaseName = rawBaseName
        .replace(/[^a-zA-Z0-9-_\s]/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase()
      const uniqueSuffix = Date.now()

      const fileName = `${safeBaseName}-${uniqueSuffix}.${fileExt}`
      const thumbName = `thumbnails/${safeBaseName}-${uniqueSuffix}.jpg`

      const thumbBlob = await generateThumbnail(file)

      const { error: uploadError } = await supabase.storage.from('media').upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(fileName)
      let thumbnailUrl = publicUrlData.publicUrl

      if (thumbBlob) {
        const { error: thumbError } = await supabase.storage
          .from('media')
          .upload(thumbName, thumbBlob)
        if (!thumbError) {
          const { data: thumbUrlData } = supabase.storage.from('media').getPublicUrl(thumbName)
          thumbnailUrl = thumbUrlData.publicUrl
        }
      }

      const { error: dbError } = await supabase.from('files').insert({
        name: file.name,
        url: publicUrlData.publicUrl,
        thumbnail: thumbnailUrl,
        type: type,
        original_size: file.size,
        optimized_size: file.size,
        status: 'ready',
      })

      if (dbError) throw dbError

      toast({ title: 'Upload concluído!', description: 'O arquivo foi salvo na biblioteca.' })
      if (onUploadSuccess) onUploadSuccess()
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erro no upload',
        description: 'Não foi possível salvar o arquivo.',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={() => !isUploading && fileInputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
        isDragging
          ? 'border-primary bg-primary/10'
          : 'border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/50'
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
        accept="video/mp4,image/jpeg,image/png"
      />
      <div className="flex flex-col items-center gap-2 pointer-events-none">
        <UploadCloud
          className={`h-10 w-10 ${isUploading ? 'text-primary animate-bounce' : 'text-muted-foreground'}`}
        />
        <p className="text-lg font-medium">
          {isUploading
            ? 'Enviando arquivo...'
            : 'Arraste e solte arquivos aqui ou clique para fazer upload'}
        </p>
        <p className="text-sm text-muted-foreground">Vídeos (MP4) e Imagens (JPG, PNG) até 50MB.</p>
      </div>
    </div>
  )
}
