import { Outlet } from 'react-router-dom'
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import { SidebarNav } from './SidebarNav'
import { Bell, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import useMainStore from '@/stores/main'

export default function Layout() {
  const { files } = useMainStore()
  const optimizingCount = files.filter((f) => f.status === 'optimizing').length

  return (
    <SidebarProvider>
      <SidebarNav />
      <SidebarInset className="flex flex-col min-h-screen">
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 lg:px-6 bg-background z-10">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            {optimizingCount > 0 && (
              <div className="ml-4 flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                <span className="flex h-2 w-2 rounded-full bg-primary" />
                Otimizando {optimizingCount} arquivo(s)...
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <UserCircle className="h-5 w-5" />
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6 bg-muted/20 overflow-auto">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
