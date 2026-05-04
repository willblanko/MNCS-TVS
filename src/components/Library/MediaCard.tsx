import { MediaFile } from '@/stores/main'
import { Card, CardContent } from '@/components/ui/card'
import { Video, Image as ImageIcon, Trash2, Edit2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import useMainStore from '@/stores/main'

export function MediaCard({ file }: { file: MediaFile }) {
  const { removeFile } = useMainStore()

  const formatSize = (bytes: number) => (bytes / (1024 * 1024)).toFixed(1) + ' MB'

  return (
    <Card className="overflow-hidden group flex flex-col">
      <div className="relative aspect-video bg-muted shrink-0">
        <img
          src={file.thumbnail || file.url}
          alt={file.name}
          className="w-full h-full object-cover transition-transform group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            if (target.src !== file.url) {
              target.src = file.url
            }
          }}
        />
        <div className="absolute top-2 left-2 flex gap-1">
          <Badge
            variant="secondary"
            className="bg-black/50 text-white hover:bg-black/50 backdrop-blur-sm border-0"
          >
            {file.type === 'video' ? (
              <Video className="h-3 w-3 mr-1" />
            ) : (
              <ImageIcon className="h-3 w-3 mr-1" />
            )}
            {file.type === 'video' ? 'Vídeo' : 'Imagem'}
          </Badge>
        </div>
        {file.status === 'optimizing' && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 animate-pulse">
              <span className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              <span className="text-sm font-medium">Otimizando...</span>
            </div>
          </div>
        )}
      </div>
      <CardContent className="p-4 flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium truncate pr-2 text-sm" title={file.name}>
            {file.name}
          </h3>
          <div className="flex gap-1 shrink-0 -mt-1 -mr-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={() => removeFile(file.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
          <span>{formatSize(file.originalSize || (file as any).original_size || 0)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
