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
import { Trash2, GripVertical, Plus } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import type { PlaylistData } from '@/pages/Playlists'

interface Props {
  playlist: PlaylistData | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaveSuccess: () => void
}

export function PlaylistEditor({ playlist, open, onOpenChange, onSaveSuccess }: Props) {
  const [name, setName] = useState('')
  const [items, setItems] = useState<PlaylistData['items']>([])
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
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
      fetchFiles()
    }
  }, [playlist, open])

  const fetchFiles = async () => {
    const { data } = await supabase
      .from('files')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setFiles(data)
  }

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: 'Aviso',
        description: 'O nome da playlist é obrigatório.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)
    try {
      let currentPlaylistId = playlist?.id

      if (playlist) {
        const { error: updateError } = await supabase
          .from('playlists')
          .update({ name })
          .eq('id', playlist.id)
        if (updateError) throw updateError

        const { error: deleteError } = await supabase
          .from('playlist_items')
          .delete()
          .eq('playlist_id', playlist.id)
        if (deleteError) throw deleteError
      } else {
        const { data, error: insertError } = await supabase
          .from('playlists')
          .insert({ name })
          .select()
          .single()
        if (insertError) throw insertError
        if (data) currentPlaylistId = data.id
      }

      if (currentPlaylistId && items.length > 0) {
        const insertItems = items.map((item, index) => ({
          playlist_id: currentPlaylistId,
          file_id: item.fileId,
          order: index,
          duration: item.duration,
        }))
        const { error: itemsError } = await supabase.from('playlist_items').insert(insertItems)
        if (itemsError) throw itemsError
      }

      onSaveSuccess()
      onOpenChange(false)
      toast({ title: 'Sucesso', description: 'Playlist salva com sucesso!' })
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
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
        duration: file.type === 'video' ? 0 : 15,
        order: prev.length,
      },
    ])
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
          </div>

          <div className="flex flex-col sm:flex-row gap-4 flex-1 overflow-hidden min-h-0">
            {/* Left side: Available files from library */}
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

            {/* Right side: Current playlist items */}
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
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />
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
