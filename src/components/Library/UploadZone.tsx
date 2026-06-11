import { useState, useRef } from 'react'
import { UploadCloud, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface UploadZoneProps {
  onUploadSuccess: () => void
}

export function UploadZone({ onUploadSuccess }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files?.length) {
      await handleFiles(Array.from(e.dataTransfer.files))
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      await handleFiles(Array.from(e.target.files))
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleFiles = async (files: File[]) => {
    setIsUploading(true)
    let uploadedCount = 0

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Formato não suportado',
          description: `${file.name} não é uma imagem. Para vídeos, use a opção do YouTube.`,
          variant: 'destructive',
        })
        continue
      }

      try {
        const ext = file.name.split('.').pop()
        const path = `${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`

        const { error: uploadError } = await supabase.storage.from('media').upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        })
        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path)

        const { error: dbError } = await supabase.from('files').insert({
          name: file.name,
          url: publicUrl,
          thumbnail: publicUrl,
          type: 'image',
          original_size: file.size,
          optimized_size: file.size,
          duration: 0,
        })
        if (dbError) throw dbError

        uploadedCount++
      } catch (err: any) {
        toast({
          title: `Erro ao enviar ${file.name}`,
          description: err.message || 'Falha no upload.',
          variant: 'destructive',
        })
      }
    }

    setIsUploading(false)
    if (uploadedCount > 0) {
      toast({
        title: 'Upload concluído',
        description: `${uploadedCount} arquivo(s) enviado(s) com sucesso.`,
      })
      onUploadSuccess()
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
        accept="image/*"
        onChange={handleFileSelect}
      />
      {isUploading ? (
        <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
      ) : (
        <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
      )}
      <h3 className="font-semibold text-lg mb-1">
        {isUploading ? 'Enviando arquivos...' : 'Clique ou arraste imagens aqui'}
      </h3>
      <p className="text-sm text-muted-foreground max-w-sm">
        Suporta imagens (JPG, PNG, WebP). Para vídeos, use o botão "Adicionar Vídeo do YouTube".
      </p>
    </div>
  )
}
