import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  signUp: (email: string, password: string) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<{ error: any }>
  updateProfile: (updates: { name?: string; avatar_url?: string }) => Promise<{ error: any }>
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ error: any }>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    })
    return { error }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const updateProfile = async (updates: { name?: string; avatar_url?: string }) => {
    const { error } = await supabase.auth.updateUser({
      data: updates,
    })

    if (error) return { error }

    if (user) {
      const { error: dbError } = await supabase.from('profiles').update(updates).eq('id', user.id)

      if (dbError) console.error('Error updating profile in DB:', dbError)
    }

    return { error: null }
  }

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!user?.email) return { error: new Error('Usuário sem e-mail definido.') }

    // Valida a senha atual antes de permitir a alteração
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    })

    if (signInError) {
      return { error: new Error('A senha atual está incorreta.') }
    }

    // Atualiza para a nova senha
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    return { error: updateError }
  }

  return (
    <AuthContext.Provider
      value={{ user, session, signUp, signIn, signOut, updateProfile, updatePassword, loading }}
    >
      {children}
    </AuthContext.Provider>
  )
}
