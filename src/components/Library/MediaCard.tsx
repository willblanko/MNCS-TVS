import { useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Video, Image as ImageIcon, Trash2, Edit2, Play, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

export function MediaCard({ file, onDeleteSuccess }: { file: any; onDeleteSuccess?: () => void }) {
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
      await pb.collection('files').update(file.id, { name: newName.trim() })

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
      await pb.collection('files').delete(file.id)

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
          <div className="absolute top-1 left-1 sm:top-2 sm:left-2 flex gap-1">
            <Badge
              variant="secondary"
              className="bg-black/50 text-white hover:bg-black/50 backdrop-blur-sm border-0 text-[10px] sm:text-xs px-1.5 py-0 sm:px-2 sm:py-0.5"
            >
              {file.type === 'video' ? (
                <Video className="h-3 w-3 mr-1 hidden sm:block" />
              ) : (
                <ImageIcon className="h-3 w-3 mr-1 hidden sm:block" />
              )}
              {file.type === 'video' ? 'Vídeo' : 'Imagem'}
            </Badge>
          </div>
        </div>
        <CardContent className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2 gap-1 sm:gap-2">
            <h3
              className="font-medium truncate text-xs sm:text-sm flex-1 cursor-pointer hover:underline"
              title={file.name}
              onClick={() => setIsPreviewOpen(true)}
            >
              {file.name}
            </h3>
            <div className="flex sm:gap-1 shrink-0 -mt-1 -mr-2 flex-wrap justify-end">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-primary"
                disabled={isDeleting || isRenaming}
                onClick={async () => {
                  try {
                    if (file.url.includes('youtube.com') || file.url.includes('youtu.be')) {
                      window.open(file.url, '_blank')
                      return
                    }
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
                title={
                  file.url.includes('youtube') || file.url.includes('youtu.be')
                    ? 'Abrir no YouTube'
                    : 'Baixar arquivo'
                }
              >
                {file.url.includes('youtube') || file.url.includes('youtu.be') ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-primary"
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
                    className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-destructive"
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
                      permanentemente.
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
            <span>{formatSize(file.size || 0)}</span>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl bg-black border-none h-[80vh] flex flex-col items-center justify-center p-0">
          <DialogTitle className="sr-only">Visualizar Mídia</DialogTitle>
          {file.type === 'video' ? (
            file.url.includes('youtube.com') || file.url.includes('youtu.be') ? (
              <iframe
                src={`https://www.youtube.com/embed/${file.url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/)?.[1]}?autoplay=1&rel=0`}
                className="w-full h-full"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            ) : (
              <video src={file.url} controls autoPlay className="w-full h-full object-contain" />
            )
          ) : (
            <img src={file.url} alt={file.name} className="w-full h-full object-contain" />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isRenameOpen} onOpenChange={setIsRenameOpen}>
        <DialogContent className="max-w-md max-sm:w-[100vw] max-sm:h-[100dvh] max-sm:max-w-none max-sm:rounded-none max-sm:border-none p-0 sm:p-6">
          <div className="flex flex-col h-full">
            <DialogHeader className="p-4 sm:p-0 pb-0">
              <DialogTitle>Renomear arquivo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 p-4 sm:p-0 py-4 flex-1 overflow-y-auto content-start">
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
            <DialogFooter className="p-4 sm:p-0 border-t sm:border-0 mt-auto">
              <Button
                variant="outline"
                onClick={() => setIsRenameOpen(false)}
                disabled={isRenaming}
              >
                Cancelar
              </Button>
              <Button onClick={handleRename} disabled={isRenaming}>
                {isRenaming ? 'Renomeando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
