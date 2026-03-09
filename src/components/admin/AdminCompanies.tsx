import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Power, PowerOff, Unlock, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Company {
  id: string;
  name: string;
  email: string | null;
  status: string | null;
  trial_end_date: string | null;
  created_at: string | null;
}

const AdminCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = async () => {
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setCompanies(data as Company[]);
    setLoading(false);
  };

  useEffect(() => { fetchCompanies(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('companies').update({ status } as any).eq('id', id);
    if (error) { toast.error('Erro ao atualizar status'); return; }
    toast.success('Status atualizado');
    fetchCompanies();
  };

  const setTrialDate = async (id: string, date: Date | undefined) => {
    const { error } = await supabase
      .from('companies')
      .update({ trial_end_date: date?.toISOString() || null, status: date ? 'trial' : 'active' } as any)
      .eq('id', id);
    if (error) { toast.error('Erro ao definir trial'); return; }
    toast.success(date ? 'Período de teste definido' : 'Trial removido');
    fetchCompanies();
  };

  const statusBadge = (status: string | null) => {
    const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      active: { label: 'Ativo', variant: 'default' },
      trial: { label: 'Trial', variant: 'secondary' },
      inactive: { label: 'Inativo', variant: 'destructive' },
    };
    const s = map[status || 'trial'] || map.trial;
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  if (loading) return <div className="text-center py-8 text-muted-foreground">Carregando...</div>;

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Fim do Trial</TableHead>
            <TableHead>Criado em</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow key={company.id}>
              <TableCell className="font-medium">{company.name}</TableCell>
              <TableCell>{company.email || '-'}</TableCell>
              <TableCell>{statusBadge(company.status)}</TableCell>
              <TableCell>
                {company.trial_end_date ? format(new Date(company.trial_end_date), 'dd/MM/yyyy') : '-'}
              </TableCell>
              <TableCell>
                {company.created_at ? format(new Date(company.created_at), 'dd/MM/yyyy') : '-'}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {company.status !== 'active' && (
                    <Button size="sm" variant="ghost" onClick={() => updateStatus(company.id, 'active')} title="Ativar">
                      <Power className="h-4 w-4 text-emerald-500" />
                    </Button>
                  )}
                  {company.status !== 'inactive' && (
                    <Button size="sm" variant="ghost" onClick={() => updateStatus(company.id, 'inactive')} title="Desativar">
                      <PowerOff className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button size="sm" variant="ghost" title="Definir trial">
                        <Clock className="h-4 w-4 text-blue-500" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={company.trial_end_date ? new Date(company.trial_end_date) : undefined}
                        onSelect={(date) => setTrialDate(company.id, date)}
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                  <Button size="sm" variant="ghost" onClick={() => setTrialDate(company.id, undefined)} title="Liberar permanente">
                    <Unlock className="h-4 w-4 text-purple-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AdminCompanies;
