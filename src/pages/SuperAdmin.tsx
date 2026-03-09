import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Building2, Users, MessageSquare, BarChart3 } from 'lucide-react';
import AdminOverview from '@/components/admin/AdminOverview';
import AdminCompanies from '@/components/admin/AdminCompanies';
import AdminUsers from '@/components/admin/AdminUsers';
import AdminFlows from '@/components/admin/AdminFlows';

const SuperAdmin = () => {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      const { data, error } = await supabase.rpc('is_global_admin');
      if (error || !data) {
        navigate('/');
        return;
      }
      setIsAdmin(true);
    };
    check();
  }, [navigate]);

  if (isAdmin === null) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Verificando permissões...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary">Painel Administrativo</h1>
          <p className="text-muted-foreground text-sm">Gerenciamento global do sistema</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="glass-card">
          <TabsTrigger value="overview" className="gap-2"><BarChart3 className="h-4 w-4" />Visão Geral</TabsTrigger>
          <TabsTrigger value="companies" className="gap-2"><Building2 className="h-4 w-4" />Empresas</TabsTrigger>
          <TabsTrigger value="users" className="gap-2"><Users className="h-4 w-4" />Usuários</TabsTrigger>
          <TabsTrigger value="flows" className="gap-2"><MessageSquare className="h-4 w-4" />Fluxos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview"><AdminOverview /></TabsContent>
        <TabsContent value="companies"><AdminCompanies /></TabsContent>
        <TabsContent value="users"><AdminUsers /></TabsContent>
        <TabsContent value="flows"><AdminFlows /></TabsContent>
      </Tabs>
    </div>
  );
};

export default SuperAdmin;
