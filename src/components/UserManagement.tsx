
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
  company_id: string;
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

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
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

  const createUser = async () => {
    try {
      console.log('Criando usuário:', formData);

      if (!currentUserProfile) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Perfil não encontrado",
        });
        return;
      }

      // Usar edge function para criar usuário
      const { data, error } = await supabase.functions.invoke('create-user', {
        body: {
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          role: formData.role,
          company_id: currentUserProfile.company_id,
        }
      });

      if (error) {
        console.error('Erro ao criar usuário:', error);
        toast({
          variant: "destructive",
          title: "Erro ao criar usuário",
          description: error.message,
        });
        return;
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
    if (!editingUser) return;

    try {
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
        description: "As informações do usuário foram atualizadas.",
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
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Erro ao excluir usuário:', error);
        toast({
          variant: "destructive",
          title: "Erro ao excluir usuário",
          description: error.message,
        });
        return;
      }

      toast({
        title: "Usuário excluído!",
        description: "O usuário foi excluído com sucesso.",
      });

      fetchUsers();
    } catch (error: any) {
      console.error('Erro inesperado ao excluir usuário:', error);
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Não foi possível excluir o usuário",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      full_name: '',
      role: 'user',
      password: '',
    });
  };

  const openCreateDialog = () => {
    resetForm();
    setEditingUser(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (user: UserProfile) => {
    setFormData({
      email: user.email,
      full_name: user.full_name || '',
      role: user.role,
      password: '',
    });
    setEditingUser(user);
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (editingUser) {
      updateUser();
    } else {
      createUser();
    }
  };

  const canManageUsers = currentUserProfile?.role === 'admin';
  const isGlobalAdmin = currentUserProfile?.company_id === '00000000-0000-0000-0000-000000000001';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
          <p className="text-gray-600 mt-2">Gerencie os usuários da sua organização</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Editar Usuário' : 'Criar Novo Usuário'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!!editingUser}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome Completo</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Função</Label>
                <Select value={formData.role} onValueChange={(value: any) => setFormData({ ...formData, role: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma função" />
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
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSubmit} className="flex-1">
                  {editingUser ? 'Atualizar' : 'Criar'} Usuário
                </Button>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.full_name || 'Sem nome'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                      {user.role === 'admin' ? 'Admin' : user.role === 'manager' ? 'Gerente' : 'Usuário'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? 'default' : 'destructive'}>
                      {user.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(user)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {user.id !== currentUserProfile?.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-700"
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
        </CardContent>
      </Card>
    </div>
  );
};

export default UserManagement;
