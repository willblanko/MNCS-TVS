import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { UploadZone } from '@/components/Library/UploadZone'
import { MediaCard } from '@/components/Library/MediaCard'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, Youtube } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/lib/supabase/errors'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'

export default function Library() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [files, setFiles] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [isYoutubeOpen, setIsYoutubeOpen] = useState(false)
  const [ytName, setYtName] = useState('')
  const [ytUrl, setYtUrl] = useState('')
  const [ytDuration, setYtDuration] = useState('60')
  const [isSavingYt, setIsSavingYt] = useState(false)
  const [filterType, setFilterType] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  const extractYouTubeId = (url: string) => {
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([^&?]{11})/,
    )
    return match ? match[1] : null
  }

  const fetchFiles = async (showLoading = true) => {
    if (showLoading) setIsLoading(true)
    const { data, error } = await supabase.from('files').select().order('created_at', { ascending: false })
    if (error && showLoading) {
      toast({ title: 'Erro', description: getErrorMessage(error), variant: 'destructive' })
    }
    setFiles(data ?? [])
    if (showLoading) setIsLoading(false)
  }

  useEffect(() => { fetchFiles(true) }, [])
  useRealtime('files', () => fetchFiles(false))

  const handleSaveYoutube = async () => {
    if (!ytName.trim() || !ytUrl.trim() || !ytDuration) {
      toast({ title: 'Erro', description: 'Preencha todos os campos.', variant: 'destructive' })
      return
    }
    const ytId = extractYouTubeId(ytUrl)
    if (!ytId) {
      toast({ title: 'Erro', description: 'URL do YouTube inválida.', variant: 'destructive' })
      return
    }

    setIsSavingYt(true)
    const duration = parseInt(ytDuration, 10)
    const { error } = await supabase.from('files').insert({
      name: ytName.trim(),
      url: ytUrl.trim(),
      thumbnail: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
      type: 'video',
      original_size: 0,
      optimized_size: 0,
      duration: isNaN(duration) ? 60 : duration,
    })
    setIsSavingYt(false)

    if (error) {
      toast({ title: 'Erro', description: getErrorMessage(error), variant: 'destructive' })
    } else {
      toast({ title: 'Vídeo adicionado', description: 'O vídeo foi adicionado à biblioteca.' })
      setIsYoutubeOpen(false)
      setYtName('')
      setYtUrl('')
      setYtDuration('60')
      fetchFiles(false)
    }
  }

  const filteredFiles = files.filter((f) => {
    if (filterType !== 'all' && f.type !== filterType) return false
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Biblioteca</h1>
          <p className="text-muted-foreground">Gerencie suas imagens e vídeos do YouTube.</p>
        </div>

        <Dialog open={isYoutubeOpen} onOpenChange={setIsYoutubeOpen}>
          <DialogTrigger asChild>
            <Button className="shrink-0 gap-2">
              <Youtube className="w-4 h-4" />
              Adicionar Vídeo do YouTube
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar Vídeo do YouTube</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="yt-name">Nome do Vídeo</Label>
                <Input
                  id="yt-name"
                  placeholder="Ex: Institucional 2024"
                  value={ytName}
                  onChange={(e) => setYtName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="yt-url">URL do YouTube</Label>
                <Input
                  id="yt-url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={ytUrl}
                  onChange={(e) => setYtUrl(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="yt-duration">Duração (segundos)</Label>
                <Input
                  id="yt-duration"
                  type="number"
                  placeholder="60"
                  value={ytDuration}
                  onChange={(e) => setYtDuration(e.target.value)}
                  min="1"
                />
                <p className="text-xs text-muted-foreground">
                  Tempo que o vídeo será exibido na tela antes de passar para o próximo.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsYoutubeOpen(false)} disabled={isSavingYt}>
                Cancelar
              </Button>
              <Button onClick={handleSaveYoutube} disabled={isSavingYt}>
                {isSavingYt ? 'Salvando...' : 'Adicionar Vídeo'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <UploadZone onUploadSuccess={() => fetchFiles(false)} />

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between pt-4">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar arquivos..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-auto">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Tipo de arquivo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="video">Vídeos</SelectItem>
              <SelectItem value="image">Imagens</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[120px] sm:h-[160px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-3 sm:h-4 w-full" />
                <Skeleton className="h-3 sm:h-4 w-[80%]" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredFiles.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {filteredFiles.map((file) => (
            <MediaCard key={file.id} file={file} onDeleteSuccess={() => fetchFiles(false)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 flex flex-col items-center justify-center space-y-3 text-muted-foreground border rounded-lg border-dashed">
          <p>Nenhum arquivo encontrado.</p>
          <p className="text-sm">Use a área de upload acima para adicionar novas mídias.</p>
        </div>
      )}
    </div>
  )
}
