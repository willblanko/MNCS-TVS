import { useEffect, useState } from 'react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  getTVs,
  addTV as addSupabaseTV,
  removeTV as removeSupabaseTV,
  updateTV as updateSupabaseTV,
  SupabaseTV,
} from '@/services/tvs'
import { supabase } from '@/lib/supabase/client'

export default function TVs() {
  const { playlists } = useMainStore()
  const [tvs, setTvs] = useState<SupabaseTV[]>([])
  const [loading, setLoading] = useState(true)

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newTvName, setNewTvName] = useState('')
  const [newTvLocation, setNewTvLocation] = useState('')

  useEffect(() => {
    fetchTVs()

    const sub = supabase
      .channel('tvs-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tvs' }, () => {
        fetchTVs()
      })
      .subscribe()

    return () => {
      sub.unsubscribe()
    }
  }, [])

  const fetchTVs = async () => {
    const { data } = await getTVs()
    if (data) {
      setTvs(data)
    }
    setLoading(false)
  }

  const handleAddTV = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newTvName) return

    let baseId = newTvName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')

    if (!baseId) {
      baseId = Math.random().toString(36).substring(7)
    }

    const existing = tvs.find((t) => t.id === baseId)
    const finalId = existing ? `${baseId}-${Math.random().toString(36).substring(7)}` : baseId

    const newTV: SupabaseTV = {
      id: finalId,
      name: newTvName,
      location: newTvLocation || 'Não especificado',
      status: 'offline',
      playlist_id: null,
    }

    setTvs((prev) => [...prev, newTV])
    await addSupabaseTV(newTV)

    setIsAddDialogOpen(false)
    setNewTvName('')
    setNewTvLocation('')
  }

  const handleUpdateTV = async (id: string, updates: Partial<SupabaseTV>) => {
    setTvs((prev) => prev.map((tv) => (tv.id === id ? { ...tv, ...updates } : tv)))
    await updateSupabaseTV(id, updates)
  }

  const handleRemoveTV = async (id: string) => {
    setTvs((prev) => prev.filter((tv) => tv.id !== id))
    await removeSupabaseTV(id)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">TVs</h1>
          <p className="text-muted-foreground">Gerencie seus dispositivos e atribua playlists.</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Adicionar TV
        </Button>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <form onSubmit={handleAddTV}>
            <DialogHeader>
              <DialogTitle>Adicionar Nova TV</DialogTitle>
              <DialogDescription>
                Informe o nome da TV. A URL do player será gerada com base neste nome.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome da TV *</Label>
                <Input
                  id="name"
                  value={newTvName}
                  onChange={(e) => setNewTvName(e.target.value)}
                  placeholder="Ex: Recepção, Refeitório..."
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Localização (Opcional)</Label>
                <Input
                  id="location"
                  value={newTvLocation}
                  onChange={(e) => setNewTvLocation(e.target.value)}
                  placeholder="Ex: Térreo, Prédio B..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar TV</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
              <TVRow
                key={tv.id}
                tv={tv}
                playlists={playlists}
                onUpdate={handleUpdateTV}
                onRemove={handleRemoveTV}
              />
            ))}
            {!loading && tvs.length === 0 && (
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
