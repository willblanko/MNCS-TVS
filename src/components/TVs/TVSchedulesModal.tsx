import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'
import { extractFieldErrors, getErrorMessage, type FieldErrors } from '@/lib/pocketbase/errors'
import { useToast } from '@/hooks/use-toast'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

export function TVSchedulesModal({ tv, playlists, isOpen, onClose }: any) {
  const { user } = useAuth()
  const { toast } = useToast()

  const [schedules, setSchedules] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<'list' | 'form'>('list')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const [formData, setFormData] = useState({
    playlist: '',
    days_of_week: [] as string[],
    start_time: '08:00',
    end_time: '18:00',
    active: true,
  })

  useEffect(() => {
    if (isOpen && tv) {
      loadSchedules()
      setView('list')
    }
  }, [isOpen, tv])

  const loadSchedules = async () => {
    try {
      const res = await pb.collection('playlist_schedules').getFullList({
        filter: `tv="${tv.id}"`,
        sort: '-created',
        expand: 'playlist',
      })
      setSchedules(res)
    } catch (err) {
      console.error(err)
    }
  }

  const openForm = (schedule?: any) => {
    setFieldErrors({})
    if (schedule) {
      setEditingId(schedule.id)
      setFormData({
        playlist: schedule.playlist,
        days_of_week: schedule.days_of_week || [],
        start_time: schedule.start_time,
        end_time: schedule.end_time,
        active: schedule.active,
      })
    } else {
      setEditingId(null)
      setFormData({
        playlist: '',
        days_of_week: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        start_time: '08:00',
        end_time: '18:00',
        active: true,
      })
    }
    setView('form')
  }

  const checkOverlap = () => {
    for (const existing of schedules) {
      if (editingId && existing.id === editingId) continue

      const dayOverlap = formData.days_of_week.some((d) => existing.days_of_week.includes(d))
      if (dayOverlap) {
        if (formData.start_time < existing.end_time && formData.end_time > existing.start_time) {
          return true
        }
      }
    }
    return false
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

      if (checkOverlap()) {
        toast({
          title: 'Conflito de Horário',
          description: 'Já existe um agendamento para este horário nos dias selecionados.',
          variant: 'destructive',
        })
        setLoading(false)
        return
      }

      const payload = { ...formData, tv: tv.id, user: user?.id }

      if (editingId) {
        await pb.collection('playlist_schedules').update(editingId, payload)
        toast({ title: 'Agendamento atualizado com sucesso' })
      } else {
        await pb.collection('playlist_schedules').create(payload)
        toast({ title: 'Agendamento criado com sucesso' })
      }
      await loadSchedules()
      setView('list')
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
      await pb.collection('playlist_schedules').delete(id)
      toast({ title: 'Agendamento removido' })
      await loadSchedules()
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] w-[100vw] h-[100dvh] sm:h-auto max-sm:p-0 flex flex-col sm:rounded-lg">
        <DialogHeader className="p-4 sm:p-6 pb-2 sm:pb-4 border-b sm:border-none">
          <DialogTitle className="flex items-center gap-2">
            {view === 'form' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 -ml-2"
                onClick={() => setView('list')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            {view === 'list'
              ? `Agendamentos: ${tv?.name}`
              : editingId
                ? 'Editar Agendamento'
                : 'Novo Agendamento'}
          </DialogTitle>
          <DialogDescription>
            {view === 'list'
              ? 'Gerencie quando as playlists devem ser exibidas.'
              : 'Defina os dias e horários para a exibição desta playlist.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pt-2 sm:pt-0">
          {view === 'list' ? (
            <div className="space-y-4">
              <Button onClick={() => openForm()} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Novo Agendamento
              </Button>

              {schedules.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground border rounded-lg border-dashed">
                  Nenhum agendamento encontrado.
                </div>
              ) : (
                <div className="space-y-3">
                  {schedules.map((s) => (
                    <div
                      key={s.id}
                      className={`p-4 border rounded-lg ${!s.active ? 'opacity-60 bg-muted/50' : 'bg-card'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold line-clamp-1">
                            {s.expand?.playlist?.name || 'Playlist Desconhecida'}
                          </h4>
                          <div className="text-sm text-muted-foreground flex gap-1 flex-wrap mt-1">
                            {DAYS_OF_WEEK.map(
                              (d) =>
                                s.days_of_week?.includes(d.value) && (
                                  <Badge
                                    key={d.value}
                                    variant="secondary"
                                    className="text-[10px] px-1.5"
                                  >
                                    {d.label}
                                  </Badge>
                                ),
                            )}
                          </div>
                        </div>
                        <Badge variant={s.active ? 'default' : 'secondary'}>
                          {s.active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center mt-4">
                        <div className="text-sm font-medium">
                          {s.start_time} - {s.end_time}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openForm(s)}
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
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
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
                    {playlists.map((pl: any) => (
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
                      className="cursor-pointer select-none"
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
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, start_time: e.target.value }))
                    }
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
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, active: checked }))
                  }
                />
                <Label htmlFor="active" className="cursor-pointer">
                  Agendamento Ativo
                </Label>
              </div>

              <div className="pt-4 flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setView('list')}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={loading || !formData.playlist || formData.days_of_week.length === 0}
                >
                  {loading ? 'Salvando...' : 'Salvar'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
