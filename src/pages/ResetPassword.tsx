import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import logoBlack from '../assets/meida-icon-black-1f9f5.png'
import logoWhite from '../assets/meida-icon-white-a3ca9.png'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [hasSession, setHasSession] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setHasSession(!!session)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.')
      return
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }
    setIsLoading(true)
    const { error: err } = await supabase.auth.updateUser({ password })
    setIsLoading(false)
    if (err) {
      setError(err.message)
    } else {
      setDone(true)
      setTimeout(() => navigate('/login'), 2500)
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

        <h1 className="text-2xl font-bold text-center mb-2">Redefinir Senha</h1>

        {done ? (
          <p className="text-center text-sm text-emerald-600 mt-4">
            Senha redefinida com sucesso! Redirecionando para o login…
          </p>
        ) : !hasSession ? (
          <p className="text-center text-sm text-red-500 mt-4">
            Link inválido ou expirado. Solicite um novo link de redefinição de senha.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-100 dark:bg-red-900/30 rounded">
                {error}
              </div>
            )}
            <Input
              type="password"
              placeholder="Nova senha (mín. 8 caracteres)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Confirmar nova senha"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar nova senha
            </Button>
          </form>
        )}
      </div>
    </div>
  )
}
