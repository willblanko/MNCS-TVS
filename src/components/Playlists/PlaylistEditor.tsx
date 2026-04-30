import { useState, useMemo } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import useMainStore, { Playlist } from '@/stores/main'
import { Trash2, GripVertical, Plus } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

interface Props {
  playlist: Playlist | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PlaylistEditor({ playlist, open, onOpenChange }: Props) {
  const { files, addPlaylist, updatePlaylist } = useMainStore()
  const [name, setName] = useState('')
  const [items, setItems] = useState<Playlist['items']>([])

  useMemo(() => {
    if (playlist) {
      setName(playlist.name)
      setItems(playlist.items)
    } else {
      setName('Nova Playlist')
      setItems([])
    }
  }, [playlist, open])

  const handleSave = () => {
    if (playlist) {
      updatePlaylist(playlist.id, { name, items })
    } else {
      addPlaylist({
        id: Math.random().toString(36).substring(7),
        name,
        items,
      })
    }
    onOpenChange(false)
  }

  const addRandomFile = () => {
    if (files.length === 0) return
    const randomFile = files[Math.floor(Math.random() * files.length)]
    setItems([
      ...items,
      {
        id: Math.random().toString(),
        fileId: randomFile.id,
        duration: randomFile.type === 'video' ? 0 : 15,
      },
    ])
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col h-full">
        <SheetHeader>
          <SheetTitle>{playlist ? 'Editar Playlist' : 'Criar Playlist'}</SheetTitle>
          <SheetDescription>Organize a ordem e duração dos arquivos.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 flex flex-col gap-4 mt-6 overflow-hidden">
          <div className="space-y-2">
            <Label>Nome da Playlist</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="flex items-center justify-between mt-4">
            <Label>Arquivos da Playlist</Label>
            <Button size="sm" variant="outline" onClick={addRandomFile}>
              <Plus className="h-4 w-4 mr-2" /> Adicionar Mídia
            </Button>
          </div>

          <ScrollArea className="flex-1 border rounded-md p-2">
            {items.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground text-sm">
                Nenhum arquivo na playlist. Adicione arquivos da biblioteca.
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item, idx) => {
                  const file = files.find((f) => f.id === item.fileId)
                  if (!file) return null
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 bg-muted/50 p-2 rounded-md"
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab shrink-0" />
                      <img
                        src={file.thumbnail}
                        alt=""
                        className="h-10 w-10 object-cover rounded shrink-0"
                      />
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-medium truncate">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
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
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive shrink-0"
                        onClick={() => setItems(items.filter((i) => i.id !== item.id))}
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

        <SheetFooter className="mt-4 pt-4 border-t shrink-0">
          <SheetClose asChild>
            <Button variant="outline">Cancelar</Button>
          </SheetClose>
          <Button onClick={handleSave}>Salvar Playlist</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
