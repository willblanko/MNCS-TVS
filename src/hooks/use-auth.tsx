import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export interface AuthUser extends User {
  name?: string | null
  role?: string | null
  avatar_url?: string | null
}

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => void
  loading: boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

async function mergeProfile(authUser: User): Promise<AuthUser> {
  const { data } = await supabase
    .from('profiles')
    .select('name, role, avatar_url')
    .eq('id', authUser.id)
    .single()
  return { ...authUser, name: data?.name, role: data?.role, avatar_url: data?.avatar_url }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUser = async (authUser: User | null) => {
    if (!authUser) {
      setUser(null)
      return
    }
    const merged = await mergeProfile(authUser)
    setUser(merged)
  }

  const refreshUser = async () => {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()
    await loadUser(authUser)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadUser(session?.user ?? null).finally(() => setLoading(false))
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }

  const signOut = () => {
    supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, signIn, signOut, loading, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}
