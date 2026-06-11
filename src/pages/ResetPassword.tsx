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
  const [ready, setReady] = useState<'loading' | 'ok' | 'invalid'>('loading')

  useEffect(() => {
    // Listen for PASSWORD_RECOVERY event — fires when Supabase processes the URL hash token
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady('ok')
      } else if (event === 'SIGNED_IN' && session) {
        // Already signed in with a valid session (e.g. page refresh after recovery)
        setReady('ok')
      }
    })

    // Also check if there's already a valid session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady('ok')
      } else {
        // Give onAuthStateChange time to fire before declaring invalid
        setTimeout(() => {
          setReady((prev) => (prev === 'loading' ? 'invalid' : prev))
        }, 1500)
      }
    })

    return () => subscription.unsubscribe()
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
      await supabase.auth.signOut()
      setTimeout(() => navigate('/login'), 2500)
    }
  }

  return (
    <div className="flex h-[100dvh] w-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900 px-4">
      <div className="w-full max-w-sm p-6 sm:p-8 bg-card rounded-xl shadow-lg border">
        <div className="flex items-center justify-center mb-6">
          <img src={logoBlack} alt="MNCS Logo" className="h-24 w-auto object-contain dark:hidden" />
          <img src={logoWhite} alt="MNCS Logo" className="h-24 w-auto object-contain hidden dark:block" />
        </div>

        <h1 className="text-2xl font-bold text-center mb-2">Redefinir Senha</h1>

        {done ? (
          <p className="text-center text-sm text-emerald-600 mt-4">
            Senha redefinida com sucesso! Redirecionando para o login…
          </p>
        ) : ready === 'loading' ? (
          <div className="flex justify-center mt-6">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : ready === 'invalid' ? (
          <div className="mt-4 space-y-4">
            <p className="text-center text-sm text-red-500">
              Link inválido ou expirado. Solicite um novo link de redefinição de senha.
            </p>
            <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>
              Voltar para o Login
            </Button>
          </div>
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
