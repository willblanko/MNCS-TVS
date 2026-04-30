import { useState } from 'react'
import useMainStore, { Playlist } from '@/stores/main'
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

export default function Playlists() {
  const { playlists, removePlaylist, files } = useMainStore()
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null)

  const handleEdit = (playlist: Playlist) => {
    setEditingPlaylist(playlist)
    setEditorOpen(true)
  }

  const handleCreate = () => {
    setEditingPlaylist(null)
    setEditorOpen(true)
  }

  const getPlaylistDuration = (playlist: Playlist) => {
    let total = 0
    playlist.items.forEach((item) => {
      if (item.duration > 0) {
        total += item.duration
      } else {
        total += 30 // Estimated duration for videos
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
                      onClick={() => removePlaylist(playlist.id)}
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
                      src={file.thumbnail}
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-background object-cover"
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
      </div>

      <PlaylistEditor playlist={editingPlaylist} open={editorOpen} onOpenChange={setEditorOpen} />
    </div>
  )
}
