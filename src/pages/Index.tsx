import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MonitorPlay, HardDrive, ListVideo, Images } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default function Index() {
  const [tvs, setTvs] = useState<any[]>([])
  const [files, setFiles] = useState<any[]>([])
  const [playlists, setPlaylists] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: tvData }, { data: fileData }, { data: playlistData }] = await Promise.all([
        supabase.from('tvs').select('*'),
        supabase.from('files').select('*').order('created_at', { ascending: false }),
        supabase.from('playlists').select('*'),
      ])

      if (tvData) setTvs(tvData)
      if (fileData) setFiles(fileData)
      if (playlistData) setPlaylists(playlistData)
    }

    fetchData()
  }, [])

  const onlineTvs = tvs.filter((tv) => tv.status === 'online').length
  const usedStorage = files.reduce((acc, f) => acc + (f.optimized_size || f.original_size || 0), 0)
  const totalStorage = 5 * 1024 * 1024 * 1024 // 5GB limit

  const formatSize = (bytes: number) => (bytes / (1024 * 1024)).toFixed(1) + ' MB'

  const recentFiles = files.slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Visão Geral</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">TVs Registradas</CardTitle>
            <MonitorPlay className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tvs.length}</div>
            <p className="text-xs text-muted-foreground">{onlineTvs} online agora</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Arquivos na Biblioteca</CardTitle>
            <Images className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{files.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Armazenamento Usado</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatSize(usedStorage)}</div>
            <p className="text-xs text-muted-foreground">
              de {formatSize(totalStorage)} ({((usedStorage / totalStorage) * 100).toFixed(1)}%)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Playlists Ativas</CardTitle>
            <ListVideo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{playlists.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimos Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Arquivo</TableHead>
                <TableHead>Tamanho Original</TableHead>
                <TableHead>Otimizado</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentFiles.map((file) => (
                <TableRow key={file.id}>
                  <TableCell className="font-medium">{file.name}</TableCell>
                  <TableCell>{formatSize(file.original_size)}</TableCell>
                  <TableCell>{formatSize(file.optimized_size)}</TableCell>
                  <TableCell>
                    {file.status === 'ready' ? (
                      <Badge
                        variant="default"
                        className="bg-emerald-500 hover:bg-emerald-600 border-0"
                      >
                        Pronto
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="animate-pulse">
                        Otimizando
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {recentFiles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                    Nenhum arquivo enviado ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
