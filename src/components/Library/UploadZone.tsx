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

  const uploadToCloudinary = async (file: File, isVideo: boolean) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'ml_default')

    const resourceType = isVideo ? 'video' : 'image'
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/djr83woxh/${resourceType}/upload`,
      {
        method: 'POST',
        body: formData,
      },
    )

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      console.error('Cloudinary Upload Error:', err)
      throw new Error(err?.error?.message || 'Falha ao fazer upload para o Cloudinary')
    }

    return await response.json()
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

      const cloudData = await uploadToCloudinary(file, isVideo)
      const fileUrl = cloudData.secure_url

      let thumbnailUrl = fileUrl
      if (isVideo) {
        // Substituir a extensão por .jpg para pegar a miniatura do vídeo via Cloudinary
        thumbnailUrl = fileUrl.replace(/\.[^/.]+$/, '.jpg')
      } else {
        // Para imagens, usa as transformações do cloudinary para reduzir o tamanho da miniatura
        const urlParts = fileUrl.split('/upload/')
        if (urlParts.length === 2) {
          thumbnailUrl = `${urlParts[0]}/upload/c_scale,w_800/${urlParts[1]}`
        }
      }

      const { error: dbError } = await supabase.from('files').insert({
        name: file.name,
        url: fileUrl,
        thumbnail: thumbnailUrl,
        type: type,
        original_size: file.size,
        optimized_size: cloudData.bytes || file.size,
        status: 'ready',
      })

      if (dbError) throw dbError

      toast({ title: 'Upload concluído!', description: 'O arquivo foi salvo na biblioteca.' })
      if (onUploadSuccess) onUploadSuccess()
    } catch (error: any) {
      console.error('Erro no uploadFile:', error)
      toast({
        title: 'Erro no upload',
        description: error.message || 'Não foi possível salvar o arquivo.',
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
