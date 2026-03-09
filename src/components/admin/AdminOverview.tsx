import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, MessageSquare, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const AdminOverview = () => {
  const [metrics, setMetrics] = useState({ companies: 0, users: 0, flows: 0, leads: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      const [companiesRes, usersRes, flowsRes, leadsRes] = await Promise.all([
        supabase.from('companies').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('flows').select('id', { count: 'exact', head: true }),
        supabase.from('leads').select('id', { count: 'exact', head: true }),
      ]);
      setMetrics({
        companies: companiesRes.count || 0,
        users: usersRes.count || 0,
        flows: flowsRes.count || 0,
        leads: leadsRes.count || 0,
      });
      setLoading(false);
    };
    fetchMetrics();
  }, []);

  const cards = [
    { label: 'Empresas', value: metrics.companies, icon: Building2, gradient: 'from-blue-500 to-blue-600' },
    { label: 'Usuários', value: metrics.users, icon: Users, gradient: 'from-emerald-500 to-emerald-600' },
    { label: 'Fluxos', value: metrics.flows, icon: MessageSquare, gradient: 'from-purple-500 to-purple-600' },
    { label: 'Leads', value: metrics.leads, icon: Target, gradient: 'from-orange-500 to-orange-600' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, i) => (
        <Card key={card.label} className="glass-card animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{card.label}</CardTitle>
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center`}>
              <card.icon className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {loading ? '...' : card.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminOverview;
