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

  const handleAddTV = async () => {
    const newTV: SupabaseTV = {
      id: Math.random().toString(36).substring(7),
      name: `Nova TV ${tvs.length + 1}`,
      location: 'Sem local',
      status: 'offline',
      playlist_id: null,
    }

    setTvs((prev) => [...prev, newTV])
    await addSupabaseTV(newTV)
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
