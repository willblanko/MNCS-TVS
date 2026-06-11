import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
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
import { TVSchedulesModal } from '@/components/TVs/TVSchedulesModal'
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
import { useRealtime } from '@/hooks/use-realtime'
import { getErrorMessage } from '@/lib/supabase/errors'
import { useToast } from '@/hooks/use-toast'

function generateId(name: string): string {
  const base = name
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const suffix = Math.random().toString(36).substring(2, 6)
  return base ? `${base}-${suffix}` : suffix
}

export default function TVs() {
  const { toast } = useToast()
  const [playlists, setPlaylists] = useState<any[]>([])
  const [tvs, setTvs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newTvName, setNewTvName] = useState('')
  const [newTvCode, setNewTvCode] = useState('')
  const [newTvLocation, setNewTvLocation] = useState('')
  const [generalError, setGeneralError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [scheduleTv, setScheduleTv] = useState<any>(null)

  const fetchTVs = async () => {
    const { data } = await supabase.from('tvs').select().order('created_at')
    setTvs(data ?? [])
    setLoading(false)
  }

  const fetchPlaylists = async () => {
    const { data } = await supabase.from('playlists').select('id, name').order('name')
    setPlaylists(data ?? [])
  }

  useEffect(() => {
    fetchTVs()
    fetchPlaylists()
  }, [])

  useRealtime('tvs', fetchTVs)
  useRealtime('playlists', fetchPlaylists)

  const handleAddTV = async (e: React.FormEvent) => {
    e.preventDefault()
    setGeneralError('')
    setSubmitting(true)

    try {
      const id = newTvCode || generateId(newTvName)
      const { error } = await supabase.from('tvs').insert({
        id,
        name: newTvName,
        location: newTvLocation || '',
        status: 'offline',
      })
      if (error) throw error

      setIsAddDialogOpen(false)
      setNewTvName('')
      setNewTvCode('')
      setNewTvLocation('')
    } catch (err) {
      setGeneralError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateTV = async (id: string, updates: any) => {
    const { error } = await supabase.from('tvs').update(updates).eq('id', id)
    if (error) {
      toast({ title: 'Erro', description: getErrorMessage(error), variant: 'destructive' })
    }
  }

  const handleRemoveTV = async (id: string) => {
    const { error } = await supabase.from('tvs').delete().eq('id', id)
    if (error) {
      toast({ title: 'Erro', description: 'Não foi possível remover a TV.', variant: 'destructive' })
    } else {
      toast({ title: 'TV removida', description: 'A TV foi removida com sucesso.' })
    }
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

      <Dialog
        open={isAddDialogOpen}
        onOpenChange={(open) => {
          if (!open) { setGeneralError(''); setNewTvName(''); setNewTvCode(''); setNewTvLocation('') }
          setIsAddDialogOpen(open)
        }}
      >
        <DialogContent className="max-w-md max-sm:w-[100vw] max-sm:h-[100dvh] max-sm:max-w-none max-sm:rounded-none max-sm:border-none p-0 sm:p-6">
          <form onSubmit={handleAddTV} className="flex flex-col h-full">
            <DialogHeader className="p-4 sm:p-0 pb-0">
              <DialogTitle>Adicionar Nova TV</DialogTitle>
              <DialogDescription>Informe o nome e o código de acesso para a TV.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 p-4 sm:p-0 py-4 flex-1 overflow-y-auto content-start">
              {generalError && (
                <p className="text-sm text-red-500 rounded-md border border-red-200 bg-red-50 px-3 py-2">
                  {generalError}
                </p>
              )}
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
                  placeholder="Ex: Andar 2, Corredor B..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="code">Código de Acesso (Opcional)</Label>
                <Input
                  id="code"
                  value={newTvCode}
                  onChange={(e) => setNewTvCode(e.target.value)}
                  placeholder="Ex: recepcao-1"
                />
                <p className="text-xs text-muted-foreground">
                  Gerado automaticamente se vazio. Usado na URL do player.
                </p>
              </div>
            </div>
            <DialogFooter className="p-4 sm:p-0 border-t sm:border-0 mt-auto">
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Salvando...' : 'Salvar TV'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="hidden md:block rounded-md border bg-card shadow-sm overflow-hidden">
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
                onManageSchedules={() => setScheduleTv(tv)}
                isMobile={false}
              />
            ))}
            {!loading && tvs.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <p>Nenhuma TV registrada.</p>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" /> Adicionar Primeira TV
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="grid grid-cols-1 gap-4 md:hidden">
        {tvs.map((tv) => (
          <TVRow
            key={tv.id}
            tv={tv}
            playlists={playlists}
            onUpdate={handleUpdateTV}
            onRemove={handleRemoveTV}
            onManageSchedules={() => setScheduleTv(tv)}
            isMobile={true}
          />
        ))}
        {!loading && tvs.length === 0 && (
          <div className="text-center py-12 text-muted-foreground border rounded-lg bg-card">
            <div className="flex flex-col items-center justify-center space-y-3">
              <p>Nenhuma TV registrada.</p>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Adicionar Primeira TV
              </Button>
            </div>
          </div>
        )}
      </div>

      {scheduleTv && (
        <TVSchedulesModal
          tv={scheduleTv}
          playlists={playlists}
          isOpen={!!scheduleTv}
          onClose={() => setScheduleTv(null)}
        />
      )}
    </div>
  )
}
