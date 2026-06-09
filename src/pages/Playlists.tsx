import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock, Film, MoreVertical, Plus, Trash2, Edit2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { PlaylistEditor } from '@/components/Playlists/PlaylistEditor'
import { useToast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/lib/pocketbase/errors'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export interface PlaylistData {
  id: string
  name: string
  items: {
    id: string
    fileId: string
    duration: number
    order: number
  }[]
}

export default function Playlists() {
  const { toast } = useToast()
  const [playlists, setPlaylists] = useState<PlaylistData[]>([])
  const [files, setFiles] = useState<any[]>([])
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingPlaylist, setEditingPlaylist] = useState<PlaylistData | null>(null)
  const [playlistToDelete, setPlaylistToDelete] = useState<PlaylistData | null>(null)

  const fetchData = async () => {
    try {
      const filesData = await pb.collection('files').getFullList()
      setFiles(filesData)

      const playlistsData = await pb.collection('playlists').getFullList()
      const itemsData = await pb.collection('playlist_items').getFullList({ sort: 'sort_order' })

      const mappedPlaylists = playlistsData.map((p) => ({
        id: p.id,
        name: p.name,
        items: itemsData
          .filter((i) => i.playlist === p.id)
          .map((i) => ({
            id: i.id,
            fileId: i.file,
            duration: i.duration || 10,
            order: i.sort_order,
          })),
      }))
      setPlaylists(mappedPlaylists)
    } catch (err: any) {
      if (!err.isAbort) {
        toast({
          title: 'Erro',
          description: getErrorMessage(err) || 'Falha ao carregar playlists.',
          variant: 'destructive',
        })
      }
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useRealtime('playlists', () => {
    fetchData()
  })
  useRealtime('playlist_items', () => {
    fetchData()
  })

  const handleEdit = (playlist: PlaylistData) => {
    setEditingPlaylist(playlist)
    setEditorOpen(true)
  }

  const handleCreate = () => {
    setEditingPlaylist(null)
    setEditorOpen(true)
  }

  const removePlaylist = async (id: string) => {
    try {
      await pb.collection('playlists').delete(id)
      fetchData()
      toast({ title: 'Sucesso', description: 'Playlist removida com sucesso!' })
      setPlaylistToDelete(null)
    } catch (err: any) {
      toast({
        title: 'Erro',
        description: getErrorMessage(err) || 'Não foi possível remover a playlist',
        variant: 'destructive',
      })
    }
  }

  const getPlaylistDuration = (playlist: PlaylistData) => {
    let total = 0
    playlist.items.forEach((item) => {
      const file = files.find((f) => f.id === item.fileId)
      if (file?.type === 'video') {
        total += file.duration || item.duration || 30 // Aproximação de duração para vídeos
      } else {
        total += item.duration
      }
    })
    const m = Math.floor(total / 60)
    const s = total % 60
    return `${m}m ${s}s`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Playlists</h1>
          <p className="text-muted-foreground">Gerencie as sequências de exibição das suas TVs.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Nova Playlist
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {playlists.map((playlist) => (
          <Card key={playlist.id} className="group hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1 pr-4">
                  <h3 className="font-semibold text-lg leading-none">{playlist.name}</h3>
                  <div className="flex items-center text-sm text-muted-foreground gap-3 pt-2">
                    <span className="flex items-center gap-1">
                      <Film className="h-3 w-3" /> {playlist.items.length} itens
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {getPlaylistDuration(playlist)} (aprox)
                    </span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(playlist)}>
                      <Edit2 className="h-4 w-4 mr-2" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setPlaylistToDelete(playlist)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" /> Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex -space-x-2 overflow-hidden mt-4 pt-2">
                {playlist.items.slice(0, 5).map((item, i) => {
                  const file = files.find((f) => f.id === item.fileId)
                  return file ? (
                    <img
                      key={i}
                      src={file.thumbnail || file.url}
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-background object-cover bg-muted"
                      alt=""
                    />
                  ) : null
                })}
                {playlist.items.length > 5 && (
                  <div className="inline-flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-background bg-muted text-xs font-medium">
                    +{playlist.items.length - 5}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {playlists.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center space-y-4 text-center text-muted-foreground border rounded-lg border-dashed">
            <p>Nenhuma playlist encontrada. Crie sua primeira playlist!</p>
            <Button onClick={handleCreate} variant="outline">
              <Plus className="mr-2 h-4 w-4" /> Nova Playlist
            </Button>
          </div>
        )}
      </div>

      <PlaylistEditor
        playlist={editingPlaylist}
        open={editorOpen}
        onOpenChange={setEditorOpen}
        onSaveSuccess={fetchData}
      />

      <AlertDialog
        open={!!playlistToDelete}
        onOpenChange={(open) => !open && setPlaylistToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Playlist</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta playlist? Isso removerá permanentemente a lista e
              suas associações.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => playlistToDelete && removePlaylist(playlistToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
