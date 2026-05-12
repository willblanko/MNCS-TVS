import { useState } from 'react'
import { MediaFile } from '@/stores/main'
import { Card, CardContent } from '@/components/ui/card'
import { Video, Image as ImageIcon, Trash2, Edit2, Play, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

export function MediaCard({
  file,
  onDeleteSuccess,
}: {
  file: MediaFile | any
  onDeleteSuccess?: () => void
}) {
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isRenameOpen, setIsRenameOpen] = useState(false)
  const [newName, setNewName] = useState(file.name)
  const [isRenaming, setIsRenaming] = useState(false)

  const formatSize = (bytes: number) => (bytes / (1024 * 1024)).toFixed(1) + ' MB'

  const handleRename = async () => {
    if (!newName.trim() || newName.trim() === file.name) {
      setIsRenameOpen(false)
      return
    }
    setIsRenaming(true)
    try {
      const { error } = await supabase
        .from('files')
        .update({ name: newName.trim() })
        .eq('id', file.id)

      if (error) throw error

      toast({
        title: 'Arquivo renomeado',
        description: 'O arquivo foi renomeado com sucesso.',
      })

      onDeleteSuccess?.()
      setIsRenameOpen(false)
    } catch (error) {
      console.error(error)
      toast({
        title: 'Erro ao renomear',
        description: 'Ocorreu um erro ao tentar renomear o arquivo.',
        variant: 'destructive',
      })
    } finally {
      setIsRenaming(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      // Remove from Storage (somente se for do Supabase, Cloudinary não permite exclusão via frontend sem assinatura)
      const attemptStorageRemove = async (urlStr: string) => {
        if (!urlStr.includes('supabase.co')) return
        let cleanUrl = urlStr
        if (cleanUrl.includes('?')) {
          cleanUrl = cleanUrl.split('?')[0]
        }
        const match = cleanUrl.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)$/)
        if (match) {
          const bucketName = match[1]
          const filePath = decodeURIComponent(match[2])
          await supabase.storage.from(bucketName).remove([filePath])
        }
      }

      await attemptStorageRemove(file.url)
      if (file.thumbnail) {
        await attemptStorageRemove(file.thumbnail)
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
    <>
      <Card className="overflow-hidden group flex flex-col">
        <div
          className="relative aspect-video bg-muted shrink-0 cursor-pointer overflow-hidden"
          onClick={() => setIsPreviewOpen(true)}
        >
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors z-10 flex items-center justify-center">
            <Play className="h-10 w-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
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
          <div className="flex justify-between items-start mb-2 gap-2">
            <h3
              className="font-medium truncate text-sm flex-1 cursor-pointer hover:underline"
              title={file.name}
              onClick={() => setIsPreviewOpen(true)}
            >
              {file.name}
            </h3>
            <div className="flex gap-1 shrink-0 -mt-1 -mr-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                disabled={isDeleting || isRenaming}
                onClick={async () => {
                  try {
                    if (file.url.includes('cloudinary.com')) {
                      const urlParts = file.url.split('/upload/')
                      if (urlParts.length === 2) {
                        const downloadUrl = `${urlParts[0]}/upload/fl_attachment/${urlParts[1]}`
                        const link = document.createElement('a')
                        link.href = downloadUrl
                        link.download = file.name
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                        return
                      }
                    }

                    const response = await fetch(file.url)
                    const blob = await response.blob()
                    const url = window.URL.createObjectURL(blob)
                    const link = document.createElement('a')
                    link.href = url
                    link.download = file.name
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                    window.URL.revokeObjectURL(url)
                  } catch (err) {
                    console.error('Download failed', err)
                    toast({
                      title: 'Erro no download',
                      description: 'Não foi possível baixar o arquivo.',
                      variant: 'destructive',
                    })
                  }
                }}
                title="Baixar arquivo"
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                disabled={isDeleting || isRenaming}
                onClick={() => {
                  setNewName(file.name)
                  setIsRenameOpen(true)
                }}
                title="Renomear arquivo"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
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

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl bg-black border-none h-[80vh] flex flex-col items-center justify-center p-0">
          <DialogTitle className="sr-only">Visualizar Mídia</DialogTitle>
          {file.type === 'video' ? (
            <video src={file.url} controls autoPlay className="w-full h-full object-contain" />
          ) : (
            <img src={file.url} alt={file.name} className="w-full h-full object-contain" />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renomear arquivo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="filename">Nome do arquivo</Label>
              <Input
                id="filename"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Digite o novo nome..."
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameOpen(false)} disabled={isRenaming}>
              Cancelar
            </Button>
            <Button onClick={handleRename} disabled={isRenaming}>
              {isRenaming ? 'Renomeando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
