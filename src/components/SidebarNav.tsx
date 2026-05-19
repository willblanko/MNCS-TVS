import { Link, useLocation } from 'react-router-dom'
import { Image as ImageIcon, ListVideo, MonitorPlay, Users } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from '@/components/ui/sidebar'

export function SidebarNav() {
  const location = useLocation()
  const { user } = useAuth()

  const navItems = [
    { title: 'Biblioteca', path: '/biblioteca', icon: ImageIcon },
    { title: 'Playlists', path: '/playlists', icon: ListVideo },
    { title: 'TVs', path: '/tvs', icon: MonitorPlay },
  ]

  if (user?.role === 'admin') {
    navItems.push({ title: 'Usuários', path: '/usuarios', icon: Users })
  }

  return (
    <Sidebar>
      <SidebarHeader className="h-16 flex items-center px-4 border-b">
        <span className="font-bold text-base text-primary tracking-tight">
          MNCS Valqueire - TV Show
        </span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.path}
                    tooltip={item.title}
                  >
                    <Link to={item.path}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
