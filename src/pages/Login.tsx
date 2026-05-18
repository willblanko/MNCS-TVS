import { useState } from 'react'
import { Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import logoBlack from '../assets/meida-icon-black-1f9f5.png'
import logoWhite from '../assets/meida-icon-white-a3ca9.png'

export default function Login() {
  const { isAuthenticated, signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const from = location.state?.from?.pathname || '/biblioteca'

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    const { error } = await signIn(email, password)
    if (error) {
      setErrorMsg('E-mail ou senha inválidos. Tente novamente.')
    } else {
      navigate(from, { replace: true })
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
        <h1 className="text-2xl font-bold text-center mb-2">MNCS Valqueire - TV Show</h1>
        <p className="text-center text-sm text-muted-foreground mb-6">
          Use as credenciais de administrador para acessar o painel.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <Button type="submit" className="w-full">
            Entrar
          </Button>
        </form>
      </div>
    </div>
  )
}
