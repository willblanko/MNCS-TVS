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

  const addFileToPlaylist = (file: any) => {
    setItems([
      ...items,
      {
        id: Math.random().toString(),
        fileId: file.id,
        duration: file.type === 'video' ? 0 : 15,
      },
    ])
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl flex flex-col h-full">
        <SheetHeader>
          <SheetTitle>{playlist ? 'Editar Playlist' : 'Criar Playlist'}</SheetTitle>
          <SheetDescription>
            Selecione as mídias da biblioteca e organize a ordem e duração.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 flex flex-col gap-4 mt-6 overflow-hidden">
          <div className="space-y-2 shrink-0">
            <Label>Nome da Playlist</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-hidden min-h-0 mt-2">
            {/* Left side: Available files from library */}
            <div className="flex-1 flex flex-col gap-2 overflow-hidden w-full md:w-1/2">
              <Label>Biblioteca de Mídias</Label>
              <ScrollArea className="flex-1 border rounded-md p-2 bg-muted/10">
                {files.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    Nenhuma mídia encontrada.
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
                          <p className="text-[10px] text-white truncate">{file.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>

            {/* Right side: Current playlist items */}
            <div className="flex-1 flex flex-col gap-2 overflow-hidden w-full md:w-1/2">
              <Label>Itens na Playlist</Label>
              <ScrollArea className="flex-1 border rounded-md p-2">
                {items.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    Nenhum arquivo na playlist. Clique nas mídias ao lado para adicionar.
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
                            src={file.thumbnail || file.url}
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
          </div>
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
