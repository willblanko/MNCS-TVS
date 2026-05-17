import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
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
import { Search } from 'lucide-react'

export default function Library() {
  const [files, setFiles] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  const fetchFiles = async (showLoading = true) => {
    if (showLoading) setIsLoading(true)
    try {
      const data = await pb.collection('files').getFullList({ sort: '-created' })
      setFiles(data)
    } catch (err) {
      console.error(err)
    } finally {
      if (showLoading) setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles(true)
  }, [])

  useRealtime('files', () => {
    fetchFiles(false)
  })

  const filteredFiles = files.filter((f) => {
    if (filterType !== 'all' && f.type !== filterType) return false
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Biblioteca</h1>
        <p className="text-muted-foreground">Gerencie suas mídias, vídeos e imagens.</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col space-y-3">
              <Skeleton className="h-[200px] w-full rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredFiles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
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
