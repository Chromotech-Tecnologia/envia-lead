
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Mail, User, Shield } from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'manager' | 'user';
  is_active: boolean;
  created_at: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: 'user' as 'admin' | 'manager' | 'user',
    password: '',
  });

  useEffect(() => {
    fetchCurrentUserProfile();
    fetchUsers();
  }, []);

  const fetchCurrentUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil atual:', error);
        return;
      }

      setCurrentUserProfile(data);
    } catch (error) {
      console.error('Erro ao buscar perfil atual:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!profile) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar usuários:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar usuários",
          description: error.message,
        });
        return;
      }

      setUsers(data || []);
    } catch (error: any) {
      console.error('Erro inesperado:', error);
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Não foi possível carregar os usuários",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUser) {
      await updateUser();
    } else {
      await createUser();
    }
  };

  const createUser = async () => {
    try {
      console.log('Criando usuário:', formData);

      // Criar usuário no auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true,
        user_metadata: {
          full_name: formData.full_name,
        }
      });

      if (authError) {
        console.error('Erro ao criar usuário no auth:', authError);
        toast({
          variant: "destructive",
          title: "Erro ao criar usuário",
          description: authError.message,
        });
        return;
      }

      // Atualizar perfil criado automaticamente pelo trigger
      if (authData.user) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            role: formData.role,
          })
          .eq('id', authData.user.id);

        if (updateError) {
          console.error('Erro ao atualizar perfil:', updateError);
        }
      }

      toast({
        title: "Usuário criado!",
        description: "O usuário foi criado com sucesso.",
      });

      resetForm();
      setIsDialogOpen(false);
      fetchUsers();
    } catch (error: any) {
      console.error('Erro inesperado ao criar usuário:', error);
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Não foi possível criar o usuário",
      });
    }
  };

  const updateUser = async () => {
    try {
      if (!editingUser) return;

      console.log('Atualizando usuário:', editingUser.id, formData);

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          role: formData.role,
        })
        .eq('id', editingUser.id);

      if (error) {
        console.error('Erro ao atualizar usuário:', error);
        toast({
          variant: "destructive",
          title: "Erro ao atualizar usuário",
          description: error.message,
        });
        return;
      }

      toast({
        title: "Usuário atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });

      resetForm();
      setIsDialogOpen(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error: any) {
      console.error('Erro inesperado ao atualizar usuário:', error);
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Não foi possível atualizar o usuário",
      });
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      if (userId === currentUserProfile?.id) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Você não pode excluir sua própria conta",
        });
        return;
      }

      if (!confirm('Tem certeza que deseja excluir este usuário?')) {
        return;
      }

      console.log('Deletando usuário:', userId);

      // Deletar do profiles (o RLS vai cuidar da permissão)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Erro ao deletar usuário:', error);
        toast({
          variant: "destructive",
          title: "Erro ao excluir usuário",
          description: error.message,
        });
        return;
      }

      toast({
        title: "Usuário excluído!",
        description: "O usuário foi removido com sucesso.",
      });

      fetchUsers();
    } catch (error: any) {
      console.error('Erro inesperado ao deletar usuário:', error);
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Não foi possível excluir o usuário",
      });
    }
  };

  const openEditDialog = (user: UserProfile) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      full_name: user.full_name || '',
      role: user.role,
      password: '',
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      email: '',
      full_name: '',
      role: 'user',
      password: '',
    });
    setEditingUser(null);
  };

  const canManageUsers = currentUserProfile?.role === 'admin';

  if (!canManageUsers) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Acesso Negado</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Você não tem permissão para gerenciar usuários.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gerenciar Usuários</h2>
          <p className="text-gray-600">Gerencie os usuários da sua empresa</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="usuario@empresa.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                    disabled={!!editingUser}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="full_name"
                    type="text"
                    placeholder="Nome completo do usuário"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Função</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value: 'admin' | 'manager' | 'user') => 
                    setFormData(prev => ({ ...prev, role: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a função" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuário</SelectItem>
                    <SelectItem value="manager">Gerente</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!editingUser && (
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    minLength={6}
                  />
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingUser ? 'Atualizar' : 'Criar Usuário'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Criação</TableHead>
                  <TableHead className="w-24">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.full_name || 'Sem nome'}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={
                        user.role === 'admin' ? 'destructive' : 
                        user.role === 'manager' ? 'default' : 'secondary'
                      }>
                        <Shield className="w-3 h-3 mr-1" />
                        {user.role === 'admin' ? 'Admin' : 
                         user.role === 'manager' ? 'Gerente' : 'Usuário'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? 'default' : 'secondary'}>
                        {user.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEditDialog(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {user.id !== currentUserProfile?.id && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteUser(user.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
