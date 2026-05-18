import { useState, useRef } from 'react'
import { UploadCloud, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface UploadZoneProps {
  onUploadSuccess: () => void
}

export function UploadZone({ onUploadSuccess }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()
  const { toast } = useToast()

  const CLOUD_NAME = 'djr83woxh'
  const UPLOAD_PRESET = 'ml_default'

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFiles(Array.from(e.target.files))
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleFiles = async (files: File[]) => {
    if (!user) {
      toast({
        title: 'Não autenticado',
        description: 'Você precisa estar logado para fazer upload.',
        variant: 'destructive',
      })
      return
    }

    setIsUploading(true)
    let uploadedCount = 0

    try {
      for (const file of files) {
        const isVideo = file.type.startsWith('video/')
        const isImage = file.type.startsWith('image/')

        if (!isVideo && !isImage) {
          toast({
            title: 'Formato não suportado',
            description: `O arquivo ${file.name} não é uma imagem ou vídeo válido.`,
            variant: 'destructive',
          })
          continue
        }

        const resourceType = isVideo ? 'video' : 'image'
        const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`

        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', UPLOAD_PRESET)

        const res = await fetch(endpoint, {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          throw new Error('Falha ao fazer upload para o Cloudinary')
        }

        const data = await res.json()

        const thumbnailUrl = isVideo
          ? data.secure_url
              .replace('/upload/', '/upload/w_300,c_fill,q_auto/')
              .replace(/\.[^/.]+$/, '.jpg')
          : data.secure_url.replace('/upload/', '/upload/w_300,c_fill,q_auto/')

        await pb.collection('files').create({
          name: file.name,
          url: data.secure_url,
          thumbnail: thumbnailUrl,
          type: resourceType,
          size: data.bytes,
          duration: isVideo && data.duration ? Math.round(data.duration) : 0,
          user: user.id,
        })

        uploadedCount++
      }

      if (uploadedCount > 0) {
        toast({
          title: 'Upload concluído',
          description: `${uploadedCount} arquivo(s) enviado(s) com sucesso.`,
        })
        onUploadSuccess()
      }
    } catch (err: any) {
      console.error('Upload error', err)
      toast({
        title: 'Erro no upload',
        description: 'Não foi possível enviar os arquivos. Verifique a conexão com o Cloudinary.',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div
      className={cn(
        'border-2 border-dashed rounded-xl p-8 transition-colors flex flex-col items-center justify-center text-center cursor-pointer',
        isDragging
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
        isUploading ? 'opacity-50 pointer-events-none' : '',
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !isUploading && fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        accept="image/*,video/*"
        onChange={handleFileSelect}
      />
      {isUploading ? (
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
      ) : (
        <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
      )}
      <h3 className="font-semibold text-lg mb-1">
        {isUploading ? 'Enviando arquivos...' : 'Clique ou arraste arquivos aqui'}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Suporta imagens (JPG, PNG, WebP) e vídeos (MP4, WebM). O upload é feito diretamente para o
        Cloudinary.
      </p>
    </div>
  )
}
