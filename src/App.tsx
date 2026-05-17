import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import Library from './pages/Library'
import Playlists from './pages/Playlists'
import TVs from './pages/TVs'
import Player from './pages/Player'
import UsersPage from './pages/Users'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import { AuthProvider, useAuth } from './hooks/use-auth'
import { ThemeProvider } from '@/components/theme-provider'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { useState } from 'react'
import logoBlack from './assets/meida-icon-black-1f9f5.png'
import logoWhite from './assets/meida-icon-white-a3ca9.png'

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (loading)
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black text-white">
        Carregando...
      </div>
    )

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-50 dark:bg-zinc-900">
        <div className="w-full max-w-sm p-8 bg-card rounded-xl shadow-lg border">
          <div className="flex items-center justify-center mb-6">
            <img
              src={logoBlack}
              alt="MNCS Logo"
              className="h-24 w-auto object-contain dark:hidden"
            />
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
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              const { error } = await signIn(email, password)
              if (error) alert('Falha no login. Verifique as credenciais.')
            }}
            className="space-y-4"
          >
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

  return <>{children}</>
}

const App = () => (
  <ThemeProvider defaultTheme="system" storageKey="mncs-theme">
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route
              element={
                <AuthGuard>
                  <Layout />
                </AuthGuard>
              }
            >
              <Route path="/" element={<Navigate to="/biblioteca" replace />} />
              <Route path="/biblioteca" element={<Library />} />
              <Route path="/playlists" element={<Playlists />} />
              <Route path="/tvs" element={<TVs />} />
              <Route path="/usuarios" element={<UsersPage />} />
              <Route path="/perfil" element={<Profile />} />
            </Route>
            <Route path="/player/:tvId" element={<Player />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
)

export default App
