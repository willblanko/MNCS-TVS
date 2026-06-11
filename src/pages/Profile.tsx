import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Upload, Loader2, Moon, Sun, Save, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useTheme } from '@/components/theme-provider'
import { useToast } from '@/hooks/use-toast'

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [nameError, setNameError] = useState('')

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordErrors, setPasswordErrors] = useState<any>({})

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      setAvatarUrl(user.avatar_url || '')
    }
  }, [user])

  const handleSaveProfile = async () => {
    setNameError('')
    if (!name.trim()) {
      setNameError('Este campo é obrigatório')
      return
    }

    setIsSaving(true)
    const { error } = await supabase.from('profiles').update({ name: name.trim() }).eq('id', user.id)
    setIsSaving(false)

    if (error) {
      toast({ title: 'Erro ao salvar perfil', description: error.message, variant: 'destructive' })
    } else {
      await refreshUser()
      toast({ title: 'Perfil atualizado com sucesso!' })
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return

    setIsUploading(true)
    try {
      const file = event.target.files[0]
      const ext = file.name.split('.').pop()
      const path = `${user.id}/avatar.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)

      const { error: dbError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)
      if (dbError) throw dbError

      setAvatarUrl(publicUrl)
      await refreshUser()
      toast({ title: 'Foto atualizada com sucesso!' })
    } catch (error: any) {
      toast({ title: 'Erro ao enviar foto', description: error.message, variant: 'destructive' })
    } finally {
      setIsUploading(false)
    }
  }

  const handleChangePassword = async () => {
    const errors: any = {}
    if (!currentPassword) errors.currentPassword = 'Este campo é obrigatório'
    if (!newPassword) errors.newPassword = 'Este campo é obrigatório'
    else if (newPassword.length < 8) errors.newPassword = 'A nova senha deve ter no mínimo 8 caracteres'
    if (!confirmPassword) errors.confirmPassword = 'Este campo é obrigatório'
    else if (newPassword !== confirmPassword) errors.confirmPassword = 'As senhas não coincidem'

    setPasswordErrors(errors)
    if (Object.keys(errors).length > 0) return

    setIsChangingPassword(true)
    try {
      // Verify current password by re-signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: currentPassword,
      })
      if (signInError) {
        setPasswordErrors({ currentPassword: 'Senha atual incorreta' })
        setIsChangingPassword(false)
        return
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error

      toast({ title: 'Senha alterada com sucesso!' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordErrors({})
    } catch (error: any) {
      toast({ title: 'Erro ao alterar senha', description: error.message, variant: 'destructive' })
    } finally {
      setIsChangingPassword(false)
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
                {nameError && <p className="text-sm text-red-500 mt-1">{nameError}</p>}
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input value={user?.email || ''} disabled className="max-w-md bg-muted" />
                <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado por aqui.</p>
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
          <CardTitle>Segurança</CardTitle>
          <CardDescription>Altere a sua senha de acesso ao sistema.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha Atual</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Sua senha atual"
              className="max-w-md"
            />
            {passwordErrors.currentPassword && (
              <p className="text-sm text-red-500 mt-1">{passwordErrors.currentPassword}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova Senha</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Sua nova senha"
              className="max-w-md"
            />
            {passwordErrors.newPassword && (
              <p className="text-sm text-red-500 mt-1">{passwordErrors.newPassword}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirme a nova senha"
              className="max-w-md"
            />
            {passwordErrors.confirmPassword && (
              <p className="text-sm text-red-500 mt-1">{passwordErrors.confirmPassword}</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t p-6">
          <Button onClick={handleChangePassword} disabled={isChangingPassword} variant="secondary">
            {isChangingPassword ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Lock className="mr-2 h-4 w-4" />
            )}
            Alterar Senha
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
