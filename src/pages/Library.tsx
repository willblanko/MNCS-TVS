import { useState } from 'react'
import useMainStore from '@/stores/main'
import { UploadZone } from '@/components/Library/UploadZone'
import { MediaCard } from '@/components/Library/MediaCard'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search } from 'lucide-react'

export default function Library() {
  const { files } = useMainStore()
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')

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

      <UploadZone />

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

      {filteredFiles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFiles.map((file) => (
            <MediaCard key={file.id} file={file} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">Nenhum arquivo encontrado.</div>
      )}
    </div>
  )
}
