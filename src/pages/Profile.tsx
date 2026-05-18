import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import pb from '@/lib/pocketbase/client'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { User, Upload, Loader2, Moon, Sun, Save, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTheme } from '@/components/theme-provider'
import { useToast } from '@/hooks/use-toast'
import { extractFieldErrors } from '@/lib/pocketbase/errors'

const SECURITY_QUESTIONS = [
  'Qual o nome da sua primeira escola?',
  'Qual era o nome do seu primeiro animal de estimação?',
  'Qual o nome da rua onde você cresceu?',
  'Qual o nome da sua primeira professora?',
  'Qual o nome do seu filme favorito?',
]

export default function Profile() {
  const { user } = useAuth()
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()

  const [name, setName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<any>({})

  const [securityQuestion, setSecurityQuestion] = useState('')
  const [securityAnswer, setSecurityAnswer] = useState('')
  const [showSecurityAnswer, setShowSecurityAnswer] = useState(false)
  const [isSavingSecurity, setIsSavingSecurity] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (user) {
      setName(user.name || '')
      if (user.avatar) {
        setAvatarUrl(pb.files.getURL(user, user.avatar))
      }
      setSecurityQuestion(user.security_question || '')
      setSecurityAnswer(user.security_answer || '')
    }
  }, [user])

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast({ title: 'O nome não pode estar vazio', variant: 'destructive' })
      return
    }

    setIsSaving(true)
    try {
      await pb.collection('users').update(user.id, { name })
      toast({ title: 'Perfil atualizado com sucesso!' })
    } catch (error: any) {
      toast({ title: 'Erro ao salvar perfil', description: error.message, variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || event.target.files.length === 0) return

      setIsUploading(true)
      const file = event.target.files[0]

      const formData = new FormData()
      formData.append('avatar', file)

      const updatedUser = await pb.collection('users').update(user.id, formData)

      if (updatedUser.avatar) {
        setAvatarUrl(pb.files.getURL(updatedUser, updatedUser.avatar))
      }

      toast({ title: 'Foto atualizada com sucesso!' })
    } catch (error: any) {
      toast({ title: 'Erro ao enviar foto', description: error.message, variant: 'destructive' })
    } finally {
      setIsUploading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword) {
      toast({ title: 'Informe a senha atual', variant: 'destructive' })
      return
    }
    if (newPassword.length < 8) {
      toast({ title: 'A nova senha deve ter no mínimo 8 caracteres', variant: 'destructive' })
      return
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'As senhas não coincidem', variant: 'destructive' })
      return
    }

    setIsChangingPassword(true)
    setFieldErrors({})
    try {
      await pb.collection('users').update(user.id, {
        oldPassword: currentPassword,
        password: newPassword,
        passwordConfirm: confirmPassword,
      })
      toast({ title: 'Senha alterada com sucesso!' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      setFieldErrors(extractFieldErrors(error))
      toast({ title: 'Erro ao alterar senha', description: error.message, variant: 'destructive' })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleSaveSecurity = async () => {
    if (!securityQuestion || !securityAnswer) {
      toast({ title: 'Preencha a pergunta e a resposta de segurança', variant: 'destructive' })
      return
    }

    setIsSavingSecurity(true)
    try {
      await pb.collection('users').update(user.id, {
        security_question: securityQuestion,
        security_answer: securityAnswer,
      })
      toast({ title: 'Segurança atualizada com sucesso!' })
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar segurança',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsSavingSecurity(false)
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
            {fieldErrors.oldPassword && (
              <p className="text-sm text-red-500 mt-1">{fieldErrors.oldPassword}</p>
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
            {fieldErrors.password && (
              <p className="text-sm text-red-500 mt-1">{fieldErrors.password}</p>
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
            {fieldErrors.passwordConfirm && (
              <p className="text-sm text-red-500 mt-1">{fieldErrors.passwordConfirm}</p>
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
          <CardTitle>Recuperação de Conta</CardTitle>
          <CardDescription>
            Configure uma pergunta de segurança para recuperar sua senha caso esqueça.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Pergunta de Segurança</Label>
            <Select value={securityQuestion} onValueChange={setSecurityQuestion}>
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Selecione uma pergunta" />
              </SelectTrigger>
              <SelectContent>
                {SECURITY_QUESTIONS.map((q) => (
                  <SelectItem key={q} value={q}>
                    {q}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Resposta de Segurança</Label>
            <div className="relative max-w-md">
              <Input
                type={showSecurityAnswer ? 'text' : 'password'}
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                placeholder="Sua resposta secreta"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSecurityAnswer(!showSecurityAnswer)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showSecurityAnswer ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t p-6">
          <Button
            onClick={handleSaveSecurity}
            disabled={isSavingSecurity || !securityQuestion || !securityAnswer}
            variant="secondary"
          >
            {isSavingSecurity ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Salvar Segurança
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
