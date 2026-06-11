import { useState } from 'react'
import { Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import logoBlack from '../assets/meida-icon-black-1f9f5.png'
import logoWhite from '../assets/meida-icon-white-a3ca9.png'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Login() {
  const { isAuthenticated, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()

  const [mode, setMode] = useState<'login' | 'email'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [resetEmail, setResetEmail] = useState('')
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
      setErrorMsg('E-mail ou senha inválidos. Verifique suas credenciais e tente novamente.')
    } else {
      navigate(from, { replace: true })
    }
  }

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/redefinir-senha`,
      })
      if (error) throw error
      toast({
        title: 'E-mail enviado',
        description:
          'Se houver uma conta com este e-mail, você receberá um link para redefinir a senha.',
      })
      setMode('login')
      setResetEmail('')
    } catch {
      setErrorMsg(
        'Não foi possível enviar o e-mail. Verifique o endereço e tente novamente.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-[100dvh] w-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-4">
      <div className="w-full max-w-sm p-6 sm:p-8 bg-card rounded-xl shadow-lg border">
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
              <Input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Entrar
              </Button>
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => { setMode('email'); setErrorMsg('') }}
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
              Digite seu e-mail para receber um link de redefinição de senha.
            </p>
            <form onSubmit={handleRequestReset} className="space-y-4">
              {errorMsg && (
                <div className="p-3 text-sm text-red-500 bg-red-100 dark:bg-red-900/30 rounded">
                  {errorMsg}
                </div>
              )}
              <Input
                type="email"
                placeholder="E-mail"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar link de redefinição
              </Button>
              <div className="text-center">
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
      </div>
    </div>
  )
}
