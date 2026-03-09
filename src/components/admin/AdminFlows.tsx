import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

interface Flow {
  id: string;
  name: string;
  is_active: boolean | null;
  company_id: string | null;
  created_at: string | null;
  company_name?: string;
  question_count?: number;
  lead_count?: number;
}

interface Company {
  id: string;
  name: string;
}

const AdminFlows = () => {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filterCompany, setFilterCompany] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const [flowsRes, companiesRes, questionsRes, leadsRes] = await Promise.all([
        supabase.from('flows').select('*').order('created_at', { ascending: false }),
        supabase.from('companies').select('id, name'),
        supabase.from('questions').select('flow_id'),
        supabase.from('leads').select('flow_id'),
      ]);

      const companyMap = new Map(companiesRes.data?.map(c => [c.id, c.name]) || []);
      
      const qCount = new Map<string, number>();
      questionsRes.data?.forEach(q => {
        if (q.flow_id) qCount.set(q.flow_id, (qCount.get(q.flow_id) || 0) + 1);
      });
      
      const lCount = new Map<string, number>();
      leadsRes.data?.forEach(l => {
        if (l.flow_id) lCount.set(l.flow_id, (lCount.get(l.flow_id) || 0) + 1);
      });

      setFlows((flowsRes.data || []).map(f => ({
        ...f,
        company_name: f.company_id ? companyMap.get(f.company_id) || 'Desconhecida' : '-',
        question_count: qCount.get(f.id) || 0,
        lead_count: lCount.get(f.id) || 0,
      })));
      setCompanies(companiesRes.data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  const filtered = filterCompany === 'all' ? flows : flows.filter(f => f.company_id === filterCompany);

  if (loading) return <div className="text-center py-8 text-muted-foreground">Carregando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Filtrar por empresa:</span>
        <Select value={filterCompany} onValueChange={setFilterCompany}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Todas as empresas" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as empresas</SelectItem>
            {companies.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Perguntas</TableHead>
              <TableHead>Leads</TableHead>
              <TableHead>Criado em</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((flow) => (
              <TableRow key={flow.id}>
                <TableCell className="font-medium">{flow.name}</TableCell>
                <TableCell>{flow.company_name}</TableCell>
                <TableCell>
                  <Badge variant={flow.is_active ? 'default' : 'destructive'}>
                    {flow.is_active ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell>{flow.question_count}</TableCell>
                <TableCell>{flow.lead_count}</TableCell>
                <TableCell>
                  {flow.created_at ? format(new Date(flow.created_at), 'dd/MM/yyyy') : '-'}
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Nenhum fluxo encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminFlows;
