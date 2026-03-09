import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Power, PowerOff } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useAdminView } from '@/contexts/AdminViewContext';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
  is_active: boolean | null;
  company_id: string | null;
  created_at: string | null;
  company_name?: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { setViewingAs } = useAdminView();
  const navigate = useNavigate();

  const fetchUsers = async () => {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error || !profiles) { setLoading(false); return; }

    const companyIds = [...new Set(profiles.map(p => p.company_id).filter(Boolean))];
    const { data: companies } = await supabase
      .from('companies')
      .select('id, name')
      .in('id', companyIds as string[]);

    const companyMap = new Map(companies?.map(c => [c.id, c.name]) || []);
    
    setUsers(profiles.map(p => ({
      ...p,
      company_name: p.company_id ? companyMap.get(p.company_id) || 'Desconhecida' : '-',
    })));
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const toggleActive = async (userId: string, currentActive: boolean | null) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !currentActive })
      .eq('id', userId);
    if (error) { toast.error('Erro ao atualizar usuário'); return; }
    toast.success(!currentActive ? 'Usuário ativado' : 'Usuário desativado');
    fetchUsers();
  };

  const viewAs = (companyId: string | null, companyName: string) => {
    if (!companyId) return;
    setViewingAs(companyId, companyName);
    navigate('/');
    toast.success(`Visualizando como: ${companyName}`);
  };

  if (loading) return <div className="text-center py-8 text-muted-foreground">Carregando...</div>;

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Função</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.full_name || '-'}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.company_name}</TableCell>
              <TableCell>
                <Badge variant="outline">{user.role || 'user'}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={user.is_active ? 'default' : 'destructive'}>
                  {user.is_active ? 'Ativo' : 'Inativo'}
                </Badge>
              </TableCell>
              <TableCell>
                {user.created_at ? format(new Date(user.created_at), 'dd/MM/yyyy') : '-'}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleActive(user.id, user.is_active)}
                    title={user.is_active ? 'Desativar' : 'Ativar'}
                  >
                    {user.is_active
                      ? <PowerOff className="h-4 w-4 text-destructive" />
                      : <Power className="h-4 w-4 text-emerald-500" />
                    }
                  </Button>
                  {user.company_id && user.company_id !== '00000000-0000-0000-0000-000000000001' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => viewAs(user.company_id, user.company_name || user.email)}
                      title="Ver como este usuário"
                    >
                      <Eye className="h-4 w-4 text-blue-500" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminUsers;
