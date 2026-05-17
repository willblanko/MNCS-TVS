import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
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
import { useRealtime } from '@/hooks/use-realtime'
import { useAuth } from '@/hooks/use-auth'
import { extractFieldErrors } from '@/lib/pocketbase/errors'

export default function TVs() {
  const { user } = useAuth()
  const [playlists, setPlaylists] = useState<any[]>([])
  const [tvs, setTvs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newTvName, setNewTvName] = useState('')
  const [newTvCode, setNewTvCode] = useState('')
  const [fieldErrors, setFieldErrors] = useState<any>({})

  const fetchTVs = async () => {
    try {
      const data = await pb.collection('tvs').getFullList({ sort: 'created' })
      setTvs(data)
    } catch {
      /* intentionally ignored */
    }
    setLoading(false)
  }

  const fetchPlaylists = async () => {
    try {
      const data = await pb.collection('playlists').getFullList({ sort: 'name' })
      setPlaylists(data)
    } catch {
      /* intentionally ignored */
    }
  }

  useEffect(() => {
    fetchTVs()
    fetchPlaylists()
  }, [])

  useRealtime('tvs', () => {
    fetchTVs()
  })
  useRealtime('playlists', () => {
    fetchPlaylists()
  })

  const handleAddTV = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    try {
      let code = newTvCode || newTvName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      if (!code) code = Math.random().toString(36).substring(7)

      await pb.collection('tvs').create({
        name: newTvName,
        code: code,
        status: 'offline',
        user: user?.id,
      })

      setIsAddDialogOpen(false)
      setNewTvName('')
      setNewTvCode('')
    } catch (err: any) {
      setFieldErrors(extractFieldErrors(err))
    }
  }

  const handleUpdateTV = async (id: string, updates: any) => {
    try {
      await pb.collection('tvs').update(id, updates)
    } catch (err) {
      console.error(err)
    }
  }

  const handleRemoveTV = async (id: string) => {
    try {
      await pb.collection('tvs').delete(id)
    } catch (err) {
      console.error(err)
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

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <form onSubmit={handleAddTV}>
            <DialogHeader>
              <DialogTitle>Adicionar Nova TV</DialogTitle>
              <DialogDescription>Informe o nome e o código de acesso para a TV.</DialogDescription>
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
                {fieldErrors.name && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.name}</p>
                )}
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
                  Será gerado automaticamente se vazio.
                </p>
                {fieldErrors.code && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.code}</p>
                )}
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
