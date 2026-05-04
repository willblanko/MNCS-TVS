import { useState } from 'react'
import { MediaFile } from '@/stores/main'
import { Card, CardContent } from '@/components/ui/card'
import { Video, Image as ImageIcon, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function MediaCard({
  file,
  onDeleteSuccess,
}: {
  file: MediaFile | any
  onDeleteSuccess?: () => void
}) {
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)

  const formatSize = (bytes: number) => (bytes / (1024 * 1024)).toFixed(1) + ' MB'

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      // Remove from Storage
      const match = file.url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/)
      if (match) {
        const bucketName = match[1]
        const filePath = match[2]
        await supabase.storage.from(bucketName).remove([filePath])
      }

      if (file.thumbnail) {
        const thumbMatch = file.thumbnail.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/)
        if (thumbMatch) {
          const thumbBucket = thumbMatch[1]
          const thumbPath = thumbMatch[2]
          await supabase.storage.from(thumbBucket).remove([thumbPath])
        }
      }

      // Remove from Database
      const { error } = await supabase.from('files').delete().eq('id', file.id)

      if (error) throw error

      toast({
        title: 'Arquivo removido',
        description: 'O arquivo foi removido com sucesso da biblioteca.',
      })

      onDeleteSuccess?.()
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erro ao remover',
        description: 'Não foi possível remover o arquivo.',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Card className="overflow-hidden group flex flex-col">
      <div className="relative aspect-video bg-muted shrink-0">
        <img
          src={file.thumbnail || file.url}
          alt={file.name}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            if (target.src !== file.url) {
              target.src = file.url
            }
          }}
        />
        <div className="absolute top-2 left-2 flex gap-1">
          <Badge
            variant="secondary"
            className="bg-black/50 text-white hover:bg-black/50 backdrop-blur-sm border-0"
          >
            {file.type === 'video' ? (
              <Video className="h-3 w-3 mr-1" />
            ) : (
              <ImageIcon className="h-3 w-3 mr-1" />
            )}
            {file.type === 'video' ? 'Vídeo' : 'Imagem'}
          </Badge>
        </div>
        {(file.status === 'optimizing' || isDeleting) && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="flex flex-col items-center gap-2 animate-pulse">
              <span className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <span className="text-sm font-medium">
                {isDeleting ? 'Removendo...' : 'Otimizando...'}
              </span>
            </div>
          </div>
        )}
      </div>
      <CardContent className="p-4 flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium truncate pr-2 text-sm" title={file.name}>
            {file.name}
          </h3>
          <div className="flex gap-1 shrink-0 -mt-1 -mr-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir arquivo</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir "{file.name}"? Esta ação removerá o arquivo
                    permanentemente da biblioteca e do armazenamento.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Remover
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
          <span>{formatSize(file.originalSize || (file as any).original_size || 0)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
