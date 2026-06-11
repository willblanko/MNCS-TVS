import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { ExternalLink, Copy, CheckCircle2, CalendarClock } from 'lucide-react'
import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface TVRowProps {
  tv: any
  playlists: { id: string; name: string }[]
  onUpdate: (id: string, updates: any) => void
  onRemove: (id: string) => void
  onManageSchedules: () => void
  isMobile?: boolean
}

export function TVRow({ tv, playlists, onUpdate, onRemove, onManageSchedules, isMobile }: TVRowProps) {
  const [copied, setCopied] = useState(false)

  const playerUrl = `${window.location.origin}/player/${tv.id}`

  const copyUrl = () => {
    navigator.clipboard.writeText(playerUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isMobile) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4 space-y-4">
          <div className="flex justify-between items-start gap-2">
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-base truncate">{tv.name}</div>
              {tv.location && (
                <div className="text-xs text-muted-foreground">{tv.location}</div>
              )}
              <div className="text-xs text-muted-foreground font-mono mt-0.5">
                Código: {tv.id}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-medium text-muted-foreground">
                {tv.status === 'online' ? 'Online' : 'Offline'}
              </span>
              <span
                className={`h-2.5 w-2.5 rounded-full transition-colors ${tv.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'}`}
              />
              <Switch
                checked={tv.status === 'online'}
                onCheckedChange={(checked) =>
                  onUpdate(tv.id, { status: checked ? 'online' : 'offline' })
                }
                aria-label="Alternar status"
                className="ml-1"
              />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Playlist Ativa</span>
            <Select
              value={tv.playlist_id || 'none'}
              onValueChange={(val) =>
                onUpdate(tv.id, { playlist_id: val === 'none' ? null : val })
              }
            >
              <SelectTrigger className="w-full h-10 text-sm">
                <SelectValue placeholder="Sem Playlist" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem Playlist</SelectItem>
                {playlists.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-2 border-t mt-4">
            <Button variant="outline" className="flex-1" onClick={onManageSchedules} title="Agendamentos">
              <CalendarClock className="h-4 w-4 mr-2" /> Agendamentos
            </Button>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={copyUrl} title="Copiar Link">
              {copied ? (
                <><CheckCircle2 className="h-4 w-4 mr-2 text-emerald-500" /> Copiado</>
              ) : (
                <><Copy className="h-4 w-4 mr-2" /> Copiar Link</>
              )}
            </Button>
            <Button variant="secondary" className="flex-1" asChild>
              <a href={`/player/${tv.id}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" /> Abrir
              </a>
            </Button>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" className="w-full text-destructive hover:bg-destructive/10 mt-2">
                Remover TV
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remover TV</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja remover esta TV? O código de acesso será invalidado.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onRemove(tv.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Remover
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    )
  }

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="text-base">{tv.name}</div>
        {tv.location && <div className="text-xs text-muted-foreground">{tv.location}</div>}
        <div className="text-xs text-muted-foreground font-mono">Código: {tv.id}</div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <Switch
            checked={tv.status === 'online'}
            onCheckedChange={(checked) =>
              onUpdate(tv.id, { status: checked ? 'online' : 'offline' })
            }
            aria-label="Alternar status da TV"
          />
          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full transition-colors ${tv.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground'}`}
            />
            <span className="capitalize text-sm font-medium">
              {tv.status === 'online' ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Select
          value={tv.playlist_id || 'none'}
          onValueChange={(val) =>
            onUpdate(tv.id, { playlist_id: val === 'none' ? null : val })
          }
        >
          <SelectTrigger className="w-full sm:w-[200px] h-9 text-sm">
            <SelectValue placeholder="Sem Playlist" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sem Playlist</SelectItem>
            {playlists.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onManageSchedules} className="h-9" title="Agendamentos">
            <CalendarClock className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={copyUrl} className="h-9" title="Copiar Link">
            {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
          </Button>
          <Button variant="secondary" size="sm" asChild className="h-9">
            <a href={`/player/${tv.id}`} target="_blank" rel="noopener noreferrer" title="Abrir Player">
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 text-destructive hover:bg-destructive/10">
                Remover
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remover TV</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja remover esta TV? O código de acesso será invalidado.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onRemove(tv.id)}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Remover
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  )
}
