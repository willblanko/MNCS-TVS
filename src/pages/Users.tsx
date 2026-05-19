import { useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MoreHorizontal, Key, Trash, Edit, Loader2, UserPlus, Eye, EyeOff } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { extractFieldErrors } from '@/lib/pocketbase/errors'

const SECURITY_QUESTIONS = [
  'Qual o nome da sua primeira escola?',
  'Qual era o nome do seu primeiro animal de estimação?',
  'Qual o nome da rua onde você cresceu?',
  'Qual o nome da sua primeira professora?',
  'Qual o nome do seu filme favorito?',
]

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isPasswordOpen, setIsPasswordOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [fieldErrors, setFieldErrors] = useState<any>({})

  const [showSecurityAnswer, setShowSecurityAnswer] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
    security_question: '',
    security_answer: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const data = await pb.collection('users').getFullList({ sort: '-created' })
      setUsers(data)
    } catch {
      /* intentionally ignored */
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    let hasError = false
    const errors: any = {}

    if (!formData.name.trim()) {
      errors.name = 'Este campo é obrigatório'
      hasError = true
    }
    if (!formData.email.trim()) {
      errors.email = 'Este campo é obrigatório'
      hasError = true
    }
    if (!formData.password) {
      errors.password = 'Este campo é obrigatório'
      hasError = true
    } else if (formData.password.length < 8) {
      errors.password = 'A senha deve ter no mínimo 8 caracteres'
      hasError = true
    }
    if (!formData.passwordConfirm) {
      errors.passwordConfirm = 'Este campo é obrigatório'
      hasError = true
    } else if (formData.password !== formData.passwordConfirm) {
      errors.passwordConfirm = 'As senhas não coincidem.'
      hasError = true
    }

    if (!formData.security_question) {
      errors.security_question = 'Este campo é obrigatório'
      hasError = true
    }
    if (!formData.security_answer?.trim()) {
      errors.security_answer = 'Este campo é obrigatório'
      hasError = true
    }

    setFieldErrors(errors)

    if (hasError) {
      setIsSubmitting(false)
      return
    }

    try {
      await pb.collection('users').create({
        email: formData.email.trim(),
        password: formData.password,
        passwordConfirm: formData.passwordConfirm,
        name: formData.name.trim(),
        security_question: formData.security_question,
        security_answer: formData.security_answer.trim(),
      })
      toast({ title: 'Sucesso', description: 'Usuário criado!' })
      setIsAddOpen(false)
      fetchUsers()
    } catch (err: any) {
      setFieldErrors(extractFieldErrors(err))
      toast({ title: 'Erro', description: 'Falha ao criar usuário.', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    let hasError = false
    const errors: any = {}

    if (!formData.name.trim()) {
      errors.name = 'Este campo é obrigatório'
      hasError = true
    }
    if (!formData.security_question) {
      errors.security_question = 'Este campo é obrigatório'
      hasError = true
    }

    setFieldErrors(errors)

    if (hasError) {
      setIsSubmitting(false)
      return
    }

    const payload: any = {
      name: formData.name.trim(),
      security_question: formData.security_question,
    }

    if (formData.security_answer?.trim()) {
      payload.security_answer = formData.security_answer.trim()
    }

    try {
      await pb.collection('users').update(selectedUser.id, payload)
      toast({ title: 'Sucesso', description: 'Usuário atualizado!' })
      setIsEditOpen(false)
      fetchUsers()
    } catch (err: any) {
      setFieldErrors(extractFieldErrors(err))
      toast({ title: 'Erro', description: 'Falha ao atualizar usuário.', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    let hasError = false
    const errors: any = {}

    if (!formData.password) {
      errors.password = 'Este campo é obrigatório'
      hasError = true
    } else if (formData.password.length < 8) {
      errors.password = 'A senha deve ter no mínimo 8 caracteres'
      hasError = true
    }

    if (!formData.passwordConfirm) {
      errors.passwordConfirm = 'Este campo é obrigatório'
      hasError = true
    } else if (formData.password !== formData.passwordConfirm) {
      errors.passwordConfirm = 'As senhas não coincidem.'
      hasError = true
    }

    setFieldErrors(errors)

    if (hasError) {
      setIsSubmitting(false)
      return
    }

    try {
      await pb.send(`/backend/v1/users/${selectedUser.id}/password`, {
        method: 'POST',
        body: JSON.stringify({
          password: formData.password,
          passwordConfirm: formData.passwordConfirm,
        }),
      })
      toast({ title: 'Sucesso', description: 'Senha alterada com sucesso' })
      setIsPasswordOpen(false)
    } catch (err: any) {
      setFieldErrors(extractFieldErrors(err))
      toast({ title: 'Erro', description: 'Falha ao alterar a senha.', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      await pb.collection('users').delete(selectedUser.id)
      toast({ title: 'Sucesso', description: 'Usuário removido!' })
      setIsDeleteOpen(false)
      fetchUsers()
    } catch (err: any) {
      toast({ title: 'Erro', description: 'Falha ao remover usuário.', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Gestão de Acessos</h1>
        <Button
          onClick={() => {
            setFormData({
              name: '',
              email: '',
              password: '',
              passwordConfirm: '',
              security_question: '',
              security_answer: '',
            })
            setFieldErrors({})
            setShowSecurityAnswer(false)
            setIsAddOpen(true)
          }}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Adicionar Usuário
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Usuários do Sistema</CardTitle>
          <CardDescription>
            Devido as regras de isolamento, você só poderá ver as suas próprias informações por
            aqui.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead>Acesso</TableHead>
                <TableHead className="w-[100px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>{user.name || '---'}</TableCell>
                    <TableCell>{new Date(user.created).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge className="bg-emerald-500 hover:bg-emerald-600 border-0 text-white">
                        Ativo
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user)
                              setFormData({
                                name: user.name || '',
                                email: user.email,
                                password: '',
                                passwordConfirm: '',
                                security_question: user.security_question || '',
                                security_answer: user.security_answer || '',
                              })
                              setFieldErrors({})
                              setShowSecurityAnswer(false)
                              setIsEditOpen(true)
                            }}
                          >
                            <Edit className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedUser(user)
                              setFormData({
                                name: '',
                                email: '',
                                password: '',
                                passwordConfirm: '',
                                security_question: '',
                                security_answer: '',
                              })
                              setFieldErrors({})
                              setIsPasswordOpen(true)
                            }}
                          >
                            <Key className="mr-2 h-4 w-4" /> Alterar Senha
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              setSelectedUser(user)
                              setIsDeleteOpen(true)
                            }}
                          >
                            <Trash className="mr-2 h-4 w-4" /> Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md">
          <form onSubmit={handleCreate} noValidate>
            <DialogHeader>
              <DialogTitle>Novo Usuário</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                {fieldErrors.name && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                {fieldErrors.email && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Senha</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                {fieldErrors.password && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.password}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Confirmar Senha</Label>
                <Input
                  type="password"
                  value={formData.passwordConfirm}
                  onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                />
                {fieldErrors.passwordConfirm && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.passwordConfirm}</p>
                )}
              </div>

              <div className="border-t pt-4 mt-2">
                <h4 className="text-sm font-medium mb-3">Recuperação de Conta</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Pergunta de Segurança</Label>
                    <Select
                      value={formData.security_question}
                      onValueChange={(v) => setFormData({ ...formData, security_question: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma pergunta" />
                      </SelectTrigger>
                      <SelectContent>
                        {SECURITY_QUESTIONS.map((q) => (
                          <SelectItem key={q} value={q}>
                            {q}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldErrors.security_question && (
                      <p className="text-sm text-red-500 mt-1">{fieldErrors.security_question}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Resposta de Segurança</Label>
                    <div className="relative">
                      <Input
                        type={showSecurityAnswer ? 'text' : 'password'}
                        value={formData.security_answer}
                        onChange={(e) =>
                          setFormData({ ...formData, security_answer: e.target.value })
                        }
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecurityAnswer(!showSecurityAnswer)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showSecurityAnswer ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {fieldErrors.security_answer && (
                      <p className="text-sm text-red-500 mt-1">{fieldErrors.security_answer}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Criar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <form onSubmit={handleEdit} noValidate>
            <DialogHeader>
              <DialogTitle>Editar Usuário</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                {fieldErrors.name && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={formData.email} disabled />
                <p className="text-xs text-muted-foreground">O email não pode ser alterado.</p>
              </div>
              <div className="border-t pt-4 mt-2">
                <h4 className="text-sm font-medium mb-3">Recuperação de Conta</h4>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Pergunta de Segurança</Label>
                    <Select
                      value={formData.security_question}
                      onValueChange={(v) => setFormData({ ...formData, security_question: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma pergunta" />
                      </SelectTrigger>
                      <SelectContent>
                        {SECURITY_QUESTIONS.map((q) => (
                          <SelectItem key={q} value={q}>
                            {q}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldErrors.security_question && (
                      <p className="text-sm text-red-500 mt-1">{fieldErrors.security_question}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Resposta de Segurança</Label>
                    <div className="relative">
                      <Input
                        type={showSecurityAnswer ? 'text' : 'password'}
                        value={formData.security_answer}
                        onChange={(e) =>
                          setFormData({ ...formData, security_answer: e.target.value })
                        }
                        placeholder="Deixe em branco para manter a atual"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecurityAnswer(!showSecurityAnswer)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showSecurityAnswer ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {fieldErrors.security_answer && (
                      <p className="text-sm text-red-500 mt-1">{fieldErrors.security_answer}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent>
          <form onSubmit={handlePassword} noValidate>
            <DialogHeader>
              <DialogTitle>Alterar Senha</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Alterando senha para <strong>{selectedUser?.email}</strong>
              </p>
              <div className="space-y-2">
                <Label>Nova Senha</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                {fieldErrors.password && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.password}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Confirmar Nova Senha</Label>
                <Input
                  type="password"
                  value={formData.passwordConfirm}
                  onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                />
                {fieldErrors.passwordConfirm && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.passwordConfirm}</p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsPasswordOpen(false)}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  !formData.password ||
                  formData.password !== formData.passwordConfirm ||
                  formData.password.length < 8
                }
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Atualizar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Usuário?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{selectedUser?.email}</strong>? Esta ação não
              pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
