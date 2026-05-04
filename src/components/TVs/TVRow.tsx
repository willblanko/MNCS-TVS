import { Playlist } from '@/stores/main'
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
import { ExternalLink, Copy, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { SupabaseTV } from '@/services/tvs'

interface TVRowProps {
  tv: SupabaseTV
  playlists: Playlist[]
  onUpdate: (id: string, updates: Partial<SupabaseTV>) => void
  onRemove: (id: string) => void
}

export function TVRow({ tv, playlists, onUpdate, onRemove }: TVRowProps) {
  const [copied, setCopied] = useState(false)

  const playerUrl = `${window.location.origin}/player/${tv.id}`

  const copyUrl = () => {
    navigator.clipboard.writeText(playerUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <TableRow>
      <TableCell className="font-medium">
        <div className="text-base">{tv.name}</div>
        <div className="text-xs text-muted-foreground">{tv.location}</div>
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
          onValueChange={(val) => onUpdate(tv.id, { playlist_id: val === 'none' ? null : val })}
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
          <Button variant="outline" size="sm" onClick={copyUrl} className="h-9" title="Copiar Link">
            {copied ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
          <Button variant="secondary" size="sm" asChild className="h-9">
            <a
              href={`/player/${tv.id}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Abrir Player"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(tv.id)}
            className="h-9 text-destructive hover:bg-destructive/10"
          >
            Remover
          </Button>
        </div>
      </TableCell>
    </TableRow>
  )
}
