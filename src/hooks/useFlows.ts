
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Flow {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  company_id: string;
  created_at: string;
  updated_at: string;
  avatar_url: string | null;
  colors: any;
  position: string | null;
  whatsapp: string | null;
  minimum_question: number | null;
}

export const useFlows = () => {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      fetchFlows();
    }
  }, [profile]);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        return;
      }

      console.log('Perfil carregado:', profileData);
      setProfile(profileData);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    }
  };

  const fetchFlows = async () => {
    try {
      setLoading(true);
      console.log('Buscando flows para company_id:', profile?.company_id);

      const { data, error } = await supabase
        .from('flows')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar flows:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar fluxos",
          description: error.message,
        });
        return;
      }

      console.log('Flows carregados:', data);
      setFlows(data || []);
    } catch (error: any) {
      console.error('Erro inesperado ao buscar flows:', error);
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Não foi possível carregar os fluxos",
      });
    } finally {
      setLoading(false);
    }
  };

  const createFlow = async (flowData: Partial<Flow>) => {
    try {
      if (!profile?.company_id) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Perfil não carregado",
        });
        return null;
      }

      console.log('Criando flow com dados:', flowData);

      const { data, error } = await supabase
        .from('flows')
        .insert({
          ...flowData,
          company_id: profile.company_id,
          colors: flowData.colors || {
            text: "#1F2937",
            primary: "#FF6B35", 
            secondary: "#3B82F6",
            background: "#FFFFFF"
          }
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao criar flow:', error);
        toast({
          variant: "destructive",
          title: "Erro ao criar fluxo",
          description: error.message,
        });
        return null;
      }

      console.log('Flow criado:', data);
      setFlows(prev => [data, ...prev]);
      
      toast({
        title: "Fluxo criado!",
        description: "O fluxo foi criado com sucesso.",
      });

      return data;
    } catch (error: any) {
      console.error('Erro inesperado ao criar flow:', error);
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Não foi possível criar o fluxo",
      });
      return null;
    }
  };

  const updateFlow = async (id: string, updates: Partial<Flow>) => {
    try {
      console.log('Atualizando flow:', id, updates);

      const { data, error } = await supabase
        .from('flows')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar flow:', error);
        toast({
          variant: "destructive",
          title: "Erro ao atualizar fluxo",
          description: error.message,
        });
        return false;
      }

      console.log('Flow atualizado:', data);
      setFlows(prev => prev.map(flow => flow.id === id ? data : flow));
      
      toast({
        title: "Fluxo atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });

      return true;
    } catch (error: any) {
      console.error('Erro inesperado ao atualizar flow:', error);
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Não foi possível atualizar o fluxo",
      });
      return false;
    }
  };

  const duplicateFlow = async (id: string) => {
    try {
      const originalFlow = flows.find(flow => flow.id === id);
      if (!originalFlow) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Fluxo não encontrado",
        });
        return null;
      }

      const { id: _, created_at, updated_at, ...flowData } = originalFlow;
      
      const duplicatedFlow = await createFlow({
        ...flowData,
        name: `${originalFlow.name} (Cópia)`,
      });

      return duplicatedFlow;
    } catch (error: any) {
      console.error('Erro ao duplicar flow:', error);
      toast({
        variant: "destructive",
        title: "Erro ao duplicar fluxo",
        description: "Não foi possível duplicar o fluxo",
      });
      return null;
    }
  };

  const deleteFlow = async (id: string) => {
    try {
      console.log('Deletando flow:', id);

      const { error } = await supabase
        .from('flows')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao deletar flow:', error);
        toast({
          variant: "destructive",
          title: "Erro ao excluir fluxo",
          description: error.message,
        });
        return false;
      }

      console.log('Flow deletado com sucesso');
      setFlows(prev => prev.filter(flow => flow.id !== id));
      
      toast({
        title: "Fluxo excluído!",
        description: "O fluxo foi removido com sucesso.",
      });

      return true;
    } catch (error: any) {
      console.error('Erro inesperado ao deletar flow:', error);
      toast({
        variant: "destructive",
        title: "Erro inesperado",
        description: "Não foi possível excluir o fluxo",
      });
      return false;
    }
  };

  const toggleFlowStatus = async (id: string) => {
    try {
      const flow = flows.find(f => f.id === id);
      if (!flow) return false;

      return await updateFlow(id, { is_active: !flow.is_active });
    } catch (error: any) {
      console.error('Erro ao alterar status do flow:', error);
      return false;
    }
  };

  return {
    flows,
    loading,
    profile,
    fetchFlows,
    createFlow,
    updateFlow,
    duplicateFlow,
    deleteFlow,
    toggleFlowStatus,
  };
};
