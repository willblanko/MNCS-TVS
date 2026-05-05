import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Upload, Loader2, Moon, Sun, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useTheme } from '@/components/theme-provider'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/lib/supabase/client'

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user?.user_metadata) {
      setName(user.user_metadata.name || '')
      setAvatarUrl(user.user_metadata.avatar_url || '')
    }
  }, [user])

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast({ title: 'O nome não pode estar vazio', variant: 'destructive' })
      return
    }

    setIsSaving(true)
    const { error } = await updateProfile({ name })

    if (error) {
      toast({ title: 'Erro ao salvar perfil', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Perfil atualizado com sucesso!' })
    }
    setIsSaving(false)
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) return

      setIsUploading(true)
      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${user?.id}-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)

      setAvatarUrl(data.publicUrl)
      await updateProfile({ avatar_url: data.publicUrl })

      toast({ title: 'Foto atualizada com sucesso!' })
    } catch (error: any) {
      toast({ title: 'Erro ao enviar foto', description: error.message, variant: 'destructive' })
    } finally {
      setIsUploading(false)
    }
  }

  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up pb-10">
      <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>

      <Card>
        <CardHeader>
          <CardTitle>Informações do Usuário</CardTitle>
          <CardDescription>Visualize e edite os dados da sua conta.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative group">
              <Avatar className="h-24 w-24 border-2 border-muted">
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl} alt={name || 'Avatar'} className="object-cover" />
                ) : null}
                <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                  <User className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              <div
                className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                {isUploading ? (
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                ) : (
                  <Upload className="h-6 w-6 text-white" />
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarUpload}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="space-y-4 flex-1 w-full">
              <div className="space-y-2">
                <Label htmlFor="name">Nome de exibição</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="max-w-md"
                />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input value={user?.email || ''} disabled className="max-w-md bg-muted" />
                <p className="text-xs text-muted-foreground">
                  O e-mail não pode ser alterado por aqui.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t p-6">
          <Button onClick={handleSaveProfile} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Salvar Alterações
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferências do Sistema</CardTitle>
          <CardDescription>Personalize a sua experiência na plataforma.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <h3 className="font-medium flex items-center gap-2">
                Modo Escuro
                {isDark ? (
                  <Moon className="h-4 w-4 text-primary" />
                ) : (
                  <Sun className="h-4 w-4 text-orange-500" />
                )}
              </h3>
              <p className="text-sm text-muted-foreground">
                Inverte a paleta de cores do sistema para ambientes com pouca luz.
              </p>
            </div>
            <Switch
              checked={isDark}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
