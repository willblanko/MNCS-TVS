import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Image as ImageIcon, ListVideo, MonitorPlay } from 'lucide-react'
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

  const navItems = [
    { title: 'Início', path: '/', icon: LayoutDashboard },
    { title: 'Biblioteca', path: '/biblioteca', icon: ImageIcon },
    { title: 'Playlists', path: '/playlists', icon: ListVideo },
    { title: 'TVs', path: '/tvs', icon: MonitorPlay },
  ]

  return (
    <Sidebar>
      <SidebarHeader className="h-16 flex items-center px-4 border-b">
        <span className="font-bold text-lg text-primary tracking-tight">Gestão Mídia</span>
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
