import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Flow {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  avatar_url: string | null;
  position: string | null;
  whatsapp: string | null;
  minimum_question: number | null;
  company_id: string;
  colors: any;
  attendant_name?: string | null;
  welcome_message?: string | null;
  final_message?: string | null;
  final_message_custom?: string | null;
  button_position?: string | null;
  chat_position?: string | null;
  button_size?: number | null;
  chat_width?: number | null;
  chat_height?: number | null;
  button_offset_x?: number | null;
  button_offset_y?: number | null;
  chat_offset_x?: number | null;
  chat_offset_y?: number | null;
  show_whatsapp_button?: boolean | null;
  whatsapp_message_template?: string | null;
  button_avatar_url?: string | null;
  urls?: string[];
  emails?: string[];
  questions?: any[];
}

export const useFlows = () => {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchFlowDetails = async (flowId: string) => {
    try {
      // Buscar URLs do fluxo
      const { data: urlsData } = await supabase
        .from('flow_urls')
        .select('url')
        .eq('flow_id', flowId);

      // Buscar emails do fluxo
      const { data: emailsData } = await supabase
        .from('flow_emails')
        .select('email')
        .eq('flow_id', flowId);

      // Buscar perguntas do fluxo
      const { data: questionsData } = await supabase
        .from('questions')
        .select('*')
        .eq('flow_id', flowId)
        .order('order_index');

      return {
        urls: urlsData?.map(item => item.url) || [''],
        emails: emailsData?.map(item => item.email) || [''],
        questions: questionsData?.map(q => ({
          id: q.id,
          type: q.type,
          title: q.title,
          placeholder: q.placeholder,
          required: q.required,
          order: q.order_index,
          options: q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : []
        })) || []
      };
    } catch (error) {
      console.error('Erro ao buscar detalhes do fluxo:', error);
      return {
        urls: [''],
        emails: [''],
        questions: []
      };
    }
  };

  const fetchUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('useFlows: Usuário não autenticado');
      return null;
    }

    console.log('useFlows: Buscando perfil para usuário:', user.id);
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('useFlows: Erro ao buscar perfil:', error);
      throw error;
    }

    if (!profile) {
      console.log('useFlows: Perfil não encontrado, usuário pode não ter perfil ainda');
      return null;
    }

    console.log('useFlows: Perfil encontrado:', profile);
    return profile;
  };

  const fetchFlows = async () => {
    try {
      const profile = await fetchUserProfile();
      if (!profile) {
        console.log('useFlows: Sem perfil, não é possível carregar fluxos');
        setFlows([]);
        setLoading(false);
        return;
      }

      console.log('useFlows: Buscando fluxos para empresa:', profile.company_id);

      const { data, error } = await supabase
        .from('flows')
        .select('*')
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('useFlows: Erro ao buscar fluxos:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar os fluxos: " + error.message,
        });
        return;
      }

      console.log('useFlows: Fluxos carregados:', data?.length || 0);

      // Carregar detalhes de cada fluxo
      const flowsWithDetails = await Promise.all(
        (data || []).map(async (flow) => {
          const details = await fetchFlowDetails(flow.id);
          return {
            ...flow,
            ...details
          };
        })
      );

      setFlows(flowsWithDetails);
    } catch (error) {
      console.error('useFlows: Erro inesperado:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro inesperado",
      });
    } finally {
      setLoading(false);
    }
  };

  const createFlow = async (flowData: Partial<Flow>) => {
    try {
      const profile = await fetchUserProfile();
      if (!profile) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Perfil do usuário não encontrado. Tente fazer logout e login novamente.",
        });
        return null;
      }

      // Verificar se o usuário tem permissão para criar fluxos
      if (profile.role !== 'admin') {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Apenas administradores podem criar fluxos",
        });
        return null;
      }

      console.log('useFlows: Criando fluxo para empresa:', profile.company_id);

      const newFlow = {
        name: flowData.name || "Novo Fluxo",
        description: flowData.description,
        company_id: profile.company_id,
        is_active: flowData.is_active || false,
        colors: flowData.colors || {
          primary: '#FF6B35',
          secondary: '#3B82F6',
          text: '#1F2937',
          background: '#FFFFFF'
        },
        avatar_url: flowData.avatar_url,
        position: flowData.position || 'bottom-right',
        whatsapp: flowData.whatsapp,
        minimum_question: flowData.minimum_question || 1,
      };

      const { data, error } = await supabase
        .from('flows')
        .insert([newFlow])
        .select()
        .single();

      if (error) {
        console.error('useFlows: Erro ao criar fluxo:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível criar o fluxo: " + error.message,
        });
        return null;
      }

      await fetchFlows();
      toast({
        title: "Sucesso!",
        description: "Fluxo criado com sucesso",
      });

      return data;
    } catch (error) {
      console.error('useFlows: Erro inesperado:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro inesperado",
      });
      return null;
    }
  };

  const updateFlow = async (id: string, updates: Partial<Flow>) => {
    try {
      const { error } = await supabase
        .from('flows')
        .update(updates)
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar fluxo:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível atualizar o fluxo",
        });
        return false;
      }

      await fetchFlows();
      toast({
        title: "Sucesso!",
        description: "Fluxo atualizado com sucesso",
      });

      return true;
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro inesperado",
      });
      return false;
    }
  };

  const deleteFlow = async (id: string) => {
    try {
      const { error } = await supabase
        .from('flows')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao excluir fluxo:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível excluir o fluxo",
        });
        return false;
      }

      await fetchFlows();
      toast({
        title: "Sucesso!",
        description: "Fluxo excluído com sucesso",
      });

      return true;
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro inesperado",
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
          description: "Não foi possível encontrar o fluxo",
        });
        return null;
      }

      const profile = await fetchUserProfile();
      if (!profile) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Perfil do usuário não encontrado",
        });
        return null;
      }

      // 1. Criar o fluxo principal
      const newFlow = {
        name: `${originalFlow.name} (Cópia)`,
        description: originalFlow.description,
        company_id: profile.company_id,
        is_active: originalFlow.is_active,
        colors: originalFlow.colors,
        avatar_url: originalFlow.avatar_url,
        position: originalFlow.position,
        whatsapp: originalFlow.whatsapp,
        minimum_question: originalFlow.minimum_question,
        attendant_name: originalFlow.attendant_name,
        welcome_message: originalFlow.welcome_message,
        final_message: originalFlow.final_message,
        final_message_custom: originalFlow.final_message_custom,
        button_position: originalFlow.button_position,
        chat_position: originalFlow.chat_position,
        button_size: originalFlow.button_size,
        chat_width: originalFlow.chat_width,
        chat_height: originalFlow.chat_height,
        button_offset_x: originalFlow.button_offset_x,
        button_offset_y: originalFlow.button_offset_y,
        chat_offset_x: originalFlow.chat_offset_x,
        chat_offset_y: originalFlow.chat_offset_y,
        show_whatsapp_button: originalFlow.show_whatsapp_button,
        whatsapp_message_template: originalFlow.whatsapp_message_template,
        button_avatar_url: originalFlow.button_avatar_url,
      };

      const { data: createdFlow, error: flowError } = await supabase
        .from('flows')
        .insert([newFlow])
        .select()
        .single();

      if (flowError) {
        console.error('Erro ao duplicar fluxo:', flowError);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível duplicar o fluxo: " + flowError.message,
        });
        return null;
      }

      // 2. Duplicar perguntas
      if (originalFlow.questions && originalFlow.questions.length > 0) {
        const questionsToInsert = originalFlow.questions.map(question => ({
          flow_id: createdFlow.id,
          type: question.type,
          title: question.title,
          placeholder: question.placeholder,
          required: question.required,
          order_index: question.order,
          options: question.options,
        }));

        const { error: questionsError } = await supabase
          .from('questions')
          .insert(questionsToInsert);

        if (questionsError) {
          console.error('Erro ao duplicar perguntas:', questionsError);
          // Reverter criação do fluxo se houver erro
          await supabase.from('flows').delete().eq('id', createdFlow.id);
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Erro ao duplicar perguntas do fluxo",
          });
          return null;
        }
      }

      // 3. Duplicar URLs
      if (originalFlow.urls && originalFlow.urls.length > 0) {
        const urlsToInsert = originalFlow.urls
          .filter(url => url && url.trim() !== '')
          .map(url => ({
            flow_id: createdFlow.id,
            url: url.trim(),
          }));

        if (urlsToInsert.length > 0) {
          const { error: urlsError } = await supabase
            .from('flow_urls')
            .insert(urlsToInsert);

          if (urlsError) {
            console.error('Erro ao duplicar URLs:', urlsError);
          }
        }
      }

      // 4. Duplicar emails
      if (originalFlow.emails && originalFlow.emails.length > 0) {
        const emailsToInsert = originalFlow.emails
          .filter(email => email && email.trim() !== '')
          .map(email => ({
            flow_id: createdFlow.id,
            email: email.trim(),
          }));

        if (emailsToInsert.length > 0) {
          const { error: emailsError } = await supabase
            .from('flow_emails')
            .insert(emailsToInsert);

          if (emailsError) {
            console.error('Erro ao duplicar emails:', emailsError);
          }
        }
      }

      await fetchFlows();
      toast({
        title: "Sucesso!",
        description: "Fluxo duplicado com sucesso",
      });

      return createdFlow;
    } catch (error) {
      console.error('Erro inesperado ao duplicar fluxo:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro inesperado ao duplicar o fluxo",
      });
      return null;
    }
  };

  useEffect(() => {
    fetchFlows();
  }, []);

  return {
    flows,
    loading,
    createFlow,
    updateFlow,
    deleteFlow,
    duplicateFlow,
    refetch: fetchFlows,
  };
};
