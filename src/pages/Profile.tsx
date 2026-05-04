import { useAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { User } from 'lucide-react'

export default function Profile() {
  const { user } = useAuth()

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
      <h1 className="text-3xl font-bold tracking-tight">Meu Perfil</h1>
      <Card>
        <CardHeader>
          <CardTitle>Informações do Usuário</CardTitle>
          <CardDescription>Visualize os dados da sua conta.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-8">
          <Avatar className="h-24 w-24">
            <AvatarFallback className="text-3xl bg-primary/10 text-primary">
              <User className="h-12 w-12" />
            </AvatarFallback>
          </Avatar>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nome</p>
              <p className="text-lg font-medium">{user?.user_metadata?.name || 'Não informado'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">E-mail</p>
              <p className="text-lg">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Data de Criação</p>
              <p className="text-lg">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '-'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
