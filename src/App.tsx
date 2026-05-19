import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
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
import Login from './pages/Login'
import { AuthProvider, useAuth } from './hooks/use-auth'
import { ThemeProvider } from '@/components/theme-provider'

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading)
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
        Carregando...
      </div>
    )

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth()

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />
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
            <Route path="/login" element={<Login />} />
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
              <Route
                path="/usuarios"
                element={
                  <AdminGuard>
                    <UsersPage />
                  </AdminGuard>
                }
              />
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
