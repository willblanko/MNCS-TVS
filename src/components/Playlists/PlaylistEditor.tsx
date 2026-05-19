import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2, Plus, ChevronUp, ChevronDown } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { useToast } from '@/hooks/use-toast'
import { extractFieldErrors, getErrorMessage } from '@/lib/pocketbase/errors'
import type { PlaylistData } from '@/pages/Playlists'

interface Props {
  playlist: PlaylistData | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaveSuccess: () => void
}

export function PlaylistEditor({ playlist, open, onOpenChange, onSaveSuccess }: Props) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [items, setItems] = useState<PlaylistData['items']>([])
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<any>({})
  const { toast } = useToast()

  useEffect(() => {
    if (open) {
      if (playlist) {
        setName(playlist.name)
        setItems(playlist.items)
      } else {
        setName('Nova Playlist')
        setItems([])
      }
      setFieldErrors({})
      fetchFiles()
    }
  }, [playlist, open])

  const fetchFiles = async () => {
    try {
      const data = await pb.collection('files').getFullList({ sort: '-created' })
      setFiles(data)
    } catch {
      /* intentionally ignored */
    }
  }

  const handleSave = async () => {
    setLoading(true)
    setFieldErrors({})

    if (!name.trim()) {
      setFieldErrors({ name: 'O nome da playlist não pode estar em branco.' })
      setLoading(false)
      return
    }

    if (items.length === 0) {
      toast({
        title: 'Atenção',
        description: 'Adicione pelo menos uma mídia à playlist.',
        variant: 'destructive',
      })
      setLoading(false)
      return
    }

    if (items.some((item) => !item.duration || item.duration < 1 || !item.fileId)) {
      toast({
        title: 'Atenção',
        description: 'Todas as mídias devem ter duração e arquivo válidos.',
        variant: 'destructive',
      })
      setLoading(false)
      return
    }

    try {
      let currentPlaylistId = playlist?.id

      if (playlist) {
        await pb.collection('playlists').update(playlist.id, { name })
      } else {
        const data = await pb.collection('playlists').create({ name, user: user?.id })
        currentPlaylistId = data.id
      }

      if (currentPlaylistId) {
        const oldItems = playlist
          ? await pb
              .collection('playlist_items')
              .getFullList({ filter: `playlist='${currentPlaylistId}'` })
          : []

        const newIds = new Set(items.map((i) => i.id))

        // Delete removed items
        for (const old of oldItems) {
          if (!newIds.has(old.id)) {
            await pb.collection('playlist_items').delete(old.id)
          }
        }

        // Create or Update items
        for (let i = 0; i < items.length; i++) {
          const item = items[i]
          const exists = oldItems.find((o) => o.id === item.id)
          const durationToSave = Math.max(1, Number(item.duration) || 10)

          if (exists) {
            await pb.collection('playlist_items').update(item.id, {
              playlist: currentPlaylistId,
              file: item.fileId,
              sort_order: i,
              duration: durationToSave,
            })
          } else {
            await pb.collection('playlist_items').create({
              playlist: currentPlaylistId,
              file: item.fileId,
              sort_order: i,
              duration: durationToSave,
            })
          }
        }
      }

      onSaveSuccess()
      onOpenChange(false)
      toast({ title: 'Sucesso', description: 'Playlist salva com sucesso!' })
    } catch (err: any) {
      setFieldErrors(extractFieldErrors(err))
      toast({
        title: 'Erro',
        description: getErrorMessage(err) || 'Não foi possível salvar a playlist',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const addFileToPlaylist = (file: any) => {
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        fileId: file.id,
        duration: file.type === 'video' ? file.duration || 10 : 10,
        order: prev.length,
      },
    ])
    toast({
      title: 'Arquivo adicionado',
      description: `"${file.name}" foi adicionado à playlist.`,
    })
  }

  const moveUp = (idx: number) => {
    if (idx === 0) return
    const newItems = [...items]
    const temp = newItems[idx]
    newItems[idx] = newItems[idx - 1]
    newItems[idx - 1] = temp
    setItems(newItems)
  }

  const moveDown = (idx: number) => {
    if (idx === items.length - 1) return
    const newItems = [...items]
    const temp = newItems[idx]
    newItems[idx] = newItems[idx + 1]
    newItems[idx + 1] = temp
    setItems(newItems)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-4xl h-[90vh] sm:h-[80vh] flex flex-col overflow-hidden p-4 sm:p-6">
        <DialogHeader className="shrink-0">
          <DialogTitle>{playlist ? 'Editar Playlist' : 'Criar Playlist'}</DialogTitle>
          <DialogDescription>
            Selecione as mídias da biblioteca e organize a ordem e duração.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 mt-2 overflow-hidden min-h-0">
          <div className="space-y-2 shrink-0">
            <Label>Nome da Playlist</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
            {fieldErrors.name && <p className="text-sm text-red-500 mt-1">{fieldErrors.name}</p>}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 flex-1 overflow-hidden min-h-0">
            <div className="flex-1 flex flex-col gap-2 overflow-hidden w-full sm:w-1/2 min-w-0">
              <Label>Biblioteca de Mídias</Label>
              <ScrollArea className="flex-1 border rounded-md p-2 bg-muted/10">
                {files.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    Nenhuma mídia encontrada no seu storage.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                    {files.map((file) => (
                      <div
                        key={file.id}
                        className="group relative rounded-md overflow-hidden border cursor-pointer hover:ring-2 hover:ring-primary transition-all aspect-square bg-black/5"
                        onClick={() => addFileToPlaylist(file)}
                      >
                        <img
                          src={file.thumbnail || file.url}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Plus className="text-white h-8 w-8" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                          <p className="text-[10px] text-white truncate" title={file.name}>
                            {file.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            <div className="flex-1 flex flex-col gap-2 overflow-hidden w-full sm:w-1/2 min-w-0">
              <Label>Itens na Playlist</Label>
              <ScrollArea className="flex-1 border rounded-md p-2">
                {items.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    Nenhum arquivo na playlist. Clique nas mídias ao lado para adicionar.
                  </div>
                ) : (
                  <div className="space-y-2 pr-3 max-w-full">
                    {items.map((item, idx) => {
                      const file = files.find((f) => f.id === item.fileId)
                      if (!file) return null
                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 sm:gap-3 bg-muted/50 p-2 rounded-md max-w-full overflow-hidden"
                        >
                          <div className="flex flex-col items-center gap-1 shrink-0 px-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 hover:bg-muted"
                              disabled={idx === 0}
                              onClick={() => moveUp(idx)}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5 hover:bg-muted"
                              disabled={idx === items.length - 1}
                              onClick={() => moveDown(idx)}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </div>
                          <img
                            src={file.thumbnail || file.url}
                            alt=""
                            className="h-10 w-10 object-cover rounded shrink-0 bg-background"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate block" title={file.name}>
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate block">
                              {file.type === 'video' ? 'Vídeo completo' : `${item.duration}s`}
                            </p>
                          </div>
                          {file.type === 'image' && (
                            <div className="flex items-center shrink-0">
                              <Input
                                type="number"
                                className="w-16 h-8 text-xs text-center"
                                value={item.duration}
                                min={1}
                                onChange={(e) => {
                                  const newItems = [...items]
                                  newItems[idx].duration = Number(e.target.value) || 1
                                  setItems(newItems)
                                }}
                              />
                            </div>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive shrink-0"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setItems(items.filter((i) => i.id !== item.id))
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 pt-4 border-t shrink-0">
          <DialogClose asChild>
            <Button variant="outline" disabled={loading}>
              Cancelar
            </Button>
          </DialogClose>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Playlist'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
