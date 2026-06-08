import { useState, useEffect } from 'react'
import { CalendarClock, Plus, Pencil, Trash2 } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import useRealtime from '@/hooks/use-realtime'
import {
  getPlaylistSchedules,
  createPlaylistSchedule,
  updatePlaylistSchedule,
  deletePlaylistSchedule,
  type PlaylistSchedule,
} from '@/services/playlist_schedules'
import { extractFieldErrors, getErrorMessage, type FieldErrors } from '@/lib/pocketbase/errors'
import { useToast } from '@/hooks/use-toast'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Seg' },
  { value: 'tuesday', label: 'Ter' },
  { value: 'wednesday', label: 'Qua' },
  { value: 'thursday', label: 'Qui' },
  { value: 'friday', label: 'Sex' },
  { value: 'saturday', label: 'Sáb' },
  { value: 'sunday', label: 'Dom' },
]

export default function Schedules() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [schedules, setSchedules] = useState<PlaylistSchedule[]>([])
  const [playlists, setPlaylists] = useState<any[]>([])
  const [tvs, setTvs] = useState<any[]>([])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const [formData, setFormData] = useState({
    playlist: '',
    tv: '',
    days_of_week: [] as string[],
    start_time: '08:00',
    end_time: '18:00',
    active: true,
  })

  const loadData = async () => {
    try {
      const [schedulesRes, playlistsRes, tvsRes] = await Promise.all([
        getPlaylistSchedules(),
        pb.collection('playlists').getFullList({ sort: 'name' }),
        pb.collection('tvs').getFullList({ sort: 'name' }),
      ])
      setSchedules(schedulesRes)
      setPlaylists(playlistsRes)
      setTvs(tvsRes)
    } catch (err) {
      toast({
        title: 'Erro ao carregar dados',
        description: getErrorMessage(err),
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('playlist_schedules', () => loadData())
  useRealtime('playlists', () => loadData())
  useRealtime('tvs', () => loadData())

  const openDialog = (schedule?: PlaylistSchedule) => {
    setFieldErrors({})
    if (schedule) {
      setEditingId(schedule.id)
      setFormData({
        playlist: schedule.playlist,
        tv: schedule.tv,
        days_of_week: schedule.days_of_week || [],
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        active: schedule.active,
      })
    } else {
      setEditingId(null)
      setFormData({
        playlist: '',
        tv: '',
        days_of_week: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        start_time: '08:00',
        end_time: '18:00',
        active: true,
      })
    }
    setIsDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      setFieldErrors({})

      if (formData.start_time >= formData.end_time) {
        setFieldErrors({ end_time: 'A hora de término deve ser após a hora de início.' })
        setLoading(false)
        return
      }

      const payload = { ...formData, user: user?.id }

      if (editingId) {
        await updatePlaylistSchedule(editingId, payload)
        toast({ title: 'Agendamento atualizado com sucesso' })
      } else {
        await createPlaylistSchedule(payload)
        toast({ title: 'Agendamento criado com sucesso' })
      }
      setIsDialogOpen(false)
    } catch (err) {
      setFieldErrors(extractFieldErrors(err))
      toast({ title: 'Erro ao salvar', description: getErrorMessage(err), variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja remover este agendamento?')) return
    try {
      await deletePlaylistSchedule(id)
      toast({ title: 'Agendamento removido' })
    } catch (err) {
      toast({ title: 'Erro ao remover', description: getErrorMessage(err), variant: 'destructive' })
    }
  }

  const toggleDay = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter((d) => d !== day)
        : [...prev.days_of_week, day],
    }))
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agendamentos</h1>
          <p className="text-muted-foreground">
            Programe quando suas playlists devem tocar em cada TV.
          </p>
        </div>
        <Button onClick={() => openDialog()}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {schedules.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground border rounded-lg border-dashed">
            Nenhum agendamento encontrado. Clique em "Novo Agendamento" para começar.
          </div>
        )}

        {schedules.map((s) => (
          <Card key={s.id} className={!s.active ? 'opacity-60' : ''}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-2">
                <CardTitle className="text-lg line-clamp-1">
                  {s.expand?.playlist?.name || 'Playlist Desconhecida'}
                </CardTitle>
                <Badge variant={s.active ? 'default' : 'secondary'}>
                  {s.active ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-1 line-clamp-1">
                <CalendarClock className="w-3 h-3 flex-shrink-0" />
                <span>{s.expand?.tv?.name || 'TV Desconhecida'}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-1">
                  {DAYS_OF_WEEK.map((d) => {
                    const isSelected = s.days_of_week?.includes(d.value)
                    if (!isSelected) return null
                    return (
                      <Badge key={d.value} variant="outline" className="text-xs bg-muted">
                        {d.label}
                      </Badge>
                    )
                  })}
                </div>

                <div className="flex justify-between items-center text-sm font-medium">
                  <span>
                    {s.start_time} - {s.end_time}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openDialog(s)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(s.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px] w-[95vw]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar Agendamento' : 'Novo Agendamento'}</DialogTitle>
            <DialogDescription>
              Defina os dias e horários para a exibição desta playlist.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto px-1">
            <div className="grid gap-2">
              <Label htmlFor="tv">TV</Label>
              <Select
                value={formData.tv}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, tv: val }))}
              >
                <SelectTrigger id="tv" className={fieldErrors.tv ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Selecione a TV" />
                </SelectTrigger>
                <SelectContent>
                  {tvs.map((tv) => (
                    <SelectItem key={tv.id} value={tv.id}>
                      {tv.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.tv && <p className="text-xs text-destructive">{fieldErrors.tv}</p>}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="playlist">Playlist</Label>
              <Select
                value={formData.playlist}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, playlist: val }))}
              >
                <SelectTrigger
                  id="playlist"
                  className={fieldErrors.playlist ? 'border-destructive' : ''}
                >
                  <SelectValue placeholder="Selecione a Playlist" />
                </SelectTrigger>
                <SelectContent>
                  {playlists.map((pl) => (
                    <SelectItem key={pl.id} value={pl.id}>
                      {pl.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.playlist && (
                <p className="text-xs text-destructive">{fieldErrors.playlist}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Dias da Semana</Label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <Badge
                    key={day.value}
                    variant={formData.days_of_week.includes(day.value) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleDay(day.value)}
                  >
                    {day.label}
                  </Badge>
                ))}
              </div>
              {fieldErrors.days_of_week && (
                <p className="text-xs text-destructive">{fieldErrors.days_of_week}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start_time">Hora de Início</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData((prev) => ({ ...prev, start_time: e.target.value }))}
                  className={fieldErrors.start_time ? 'border-destructive' : ''}
                />
                {fieldErrors.start_time && (
                  <p className="text-xs text-destructive">{fieldErrors.start_time}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end_time">Hora de Término</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData((prev) => ({ ...prev, end_time: e.target.value }))}
                  className={fieldErrors.end_time ? 'border-destructive' : ''}
                />
                {fieldErrors.end_time && (
                  <p className="text-xs text-destructive">{fieldErrors.end_time}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, active: checked }))}
              />
              <Label htmlFor="active" className="cursor-pointer">
                Agendamento Ativo
              </Label>
            </div>
          </div>

          <DialogFooter className="sm:justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                loading || !formData.tv || !formData.playlist || formData.days_of_week.length === 0
              }
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
