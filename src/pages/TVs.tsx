import useMainStore from '@/stores/main'
import { TVRow } from '@/components/TVs/TVRow'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function TVs() {
  const { tvs, playlists, addTV } = useMainStore()

  const handleAddTV = () => {
    addTV({
      id: Math.random().toString(36).substring(7),
      name: `Nova TV ${tvs.length + 1}`,
      location: 'Sem local',
      status: 'offline',
      playlistId: null,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">TVs</h1>
          <p className="text-muted-foreground">Gerencie seus dispositivos e atribua playlists.</p>
        </div>
        <Button onClick={handleAddTV}>
          <Plus className="mr-2 h-4 w-4" /> Adicionar TV
        </Button>
      </div>

      <div className="rounded-md border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Dispositivo</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Playlist Ativa</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tvs.map((tv) => (
              <TVRow key={tv.id} tv={tv} playlists={playlists} />
            ))}
            {tvs.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  Nenhuma TV registrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
