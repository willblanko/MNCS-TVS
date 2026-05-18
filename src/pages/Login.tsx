import { useState } from 'react'
import { Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import pb from '@/lib/pocketbase/client'
import logoBlack from '../assets/meida-icon-black-1f9f5.png'
import logoWhite from '../assets/meida-icon-white-a3ca9.png'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Login() {
  const { isAuthenticated, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()

  const [mode, setMode] = useState<'login' | 'email' | 'reset'>('login')

  // Login state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Reset state
  const [resetEmail, setResetEmail] = useState('')
  const [resetQuestion, setResetQuestion] = useState('')
  const [resetAnswer, setResetAnswer] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const from = location.state?.from?.pathname || '/biblioteca'

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setIsLoading(true)
    const { error } = await signIn(email, password)
    setIsLoading(false)
    if (error) {
      setErrorMsg('E-mail ou senha inválidos. Tente novamente.')
    } else {
      navigate(from, { replace: true })
    }
  }

  const handleGetQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setIsLoading(true)
    try {
      const res = await pb.send('/backend/v1/users/security-question', {
        method: 'POST',
        body: JSON.stringify({ email: resetEmail }),
      })
      setResetQuestion(res.question)
      setMode('reset')
    } catch (err: any) {
      // Fallback dummy to prevent enumeration if API returns error
      setResetQuestion('Qual era o nome do seu primeiro animal de estimação?')
      setMode('reset')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (newPassword !== confirmNewPassword) {
      setErrorMsg('As senhas não coincidem.')
      return
    }

    setIsLoading(true)
    try {
      await pb.send('/backend/v1/users/security-reset', {
        method: 'POST',
        body: JSON.stringify({
          email: resetEmail,
          answer: resetAnswer,
          password: newPassword,
          passwordConfirm: confirmNewPassword,
        }),
      })
      toast({
        title: 'Senha alterada com sucesso!',
        description: 'Você já pode fazer login com a nova senha.',
      })
      setMode('login')
      setResetEmail('')
      setResetAnswer('')
      setNewPassword('')
      setConfirmNewPassword('')
    } catch (err: any) {
      setErrorMsg(
        err.response?.message || err.message || 'Resposta incorreta ou erro ao redefinir a senha.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
      <div className="w-full max-w-sm p-8 bg-card rounded-xl shadow-lg border">
        <div className="flex items-center justify-center mb-6">
          <img src={logoBlack} alt="MNCS Logo" className="h-24 w-auto object-contain dark:hidden" />
          <img
            src={logoWhite}
            alt="MNCS Logo"
            className="h-24 w-auto object-contain hidden dark:block"
          />
        </div>

        {mode === 'login' && (
          <>
            <h1 className="text-2xl font-bold text-center mb-2">MNCS Valqueire - TV Show</h1>
            <p className="text-center text-sm text-muted-foreground mb-6">
              Use as credenciais de administrador para acessar o painel.
            </p>
            <form onSubmit={handleLogin} className="space-y-4">
              {errorMsg && (
                <div className="p-3 text-sm text-red-500 bg-red-100 dark:bg-red-900/30 rounded">
                  {errorMsg}
                </div>
              )}
              <div>
                <Input
                  type="email"
                  placeholder="E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Entrar
              </Button>
              <div className="text-center mt-4">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => {
                    setMode('email')
                    setErrorMsg('')
                  }}
                  className="text-sm"
                >
                  Esqueci minha senha
                </Button>
              </div>
            </form>
          </>
        )}

        {mode === 'email' && (
          <>
            <h1 className="text-2xl font-bold text-center mb-2">Recuperar Senha</h1>
            <p className="text-center text-sm text-muted-foreground mb-6">
              Digite seu e-mail para continuar.
            </p>
            <form onSubmit={handleGetQuestion} className="space-y-4">
              {errorMsg && (
                <div className="p-3 text-sm text-red-500 bg-red-100 dark:bg-red-900/30 rounded">
                  {errorMsg}
                </div>
              )}
              <div>
                <Input
                  type="email"
                  placeholder="E-mail"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Continuar
              </Button>
              <div className="text-center mt-4">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setMode('login')}
                  className="text-sm"
                >
                  Voltar para o Login
                </Button>
              </div>
            </form>
          </>
        )}

        {mode === 'reset' && (
          <>
            <h1 className="text-2xl font-bold text-center mb-2">Pergunta de Segurança</h1>
            <p className="text-center text-sm text-muted-foreground mb-6">
              Se o e-mail estiver cadastrado, responda à pergunta abaixo.
            </p>
            <form onSubmit={handleResetPassword} className="space-y-4">
              {errorMsg && (
                <div className="p-3 text-sm text-red-500 bg-red-100 dark:bg-red-900/30 rounded">
                  {errorMsg}
                </div>
              )}
              <div className="space-y-1">
                <Label className="text-sm font-semibold text-foreground/80">{resetQuestion}</Label>
                <Input
                  type="text"
                  placeholder="Sua resposta secreta"
                  value={resetAnswer}
                  onChange={(e) => setResetAnswer(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1 pt-2">
                <Input
                  type="password"
                  placeholder="Nova senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div className="space-y-1">
                <Input
                  type="password"
                  placeholder="Confirme a nova senha"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <Button type="submit" className="w-full mt-2" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Redefinir Senha
              </Button>
              <div className="text-center mt-4">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setMode('login')}
                  className="text-sm"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
