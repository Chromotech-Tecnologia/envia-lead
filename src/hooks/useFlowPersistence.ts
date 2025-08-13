
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useFlowPersistence = (flowId: string) => {
  const { toast } = useToast();

  const saveFlowUrls = async (flowId: string, urls: string[]) => {
    try {
      console.log('Salvando URLs para flow:', flowId, urls);
      
      // Deletar URLs existentes
      const { error: deleteError } = await supabase
        .from('flow_urls')
        .delete()
        .eq('flow_id', flowId);

      if (deleteError) {
        console.error('Erro ao deletar URLs existentes:', deleteError);
        throw deleteError;
      }

      // Inserir novas URLs (apenas as que não estão vazias)
      const validUrls = urls.filter(url => url && url.trim() !== '');
      if (validUrls.length > 0) {
        const urlsToInsert = validUrls.map(url => ({
          flow_id: flowId,
          url: url.trim()
        }));

        const { error: insertError } = await supabase
          .from('flow_urls')
          .insert(urlsToInsert);
        
        if (insertError) {
          console.error('Erro ao inserir URLs:', insertError);
          throw insertError;
        }
      }

      console.log('URLs salvas com sucesso');
    } catch (error) {
      console.error('Erro ao salvar URLs:', error);
      throw error;
    }
  };

  const saveFlowEmails = async (flowId: string, emails: string[]) => {
    try {
      console.log('Salvando emails para flow:', flowId, emails);
      
      // Deletar emails existentes
      const { error: deleteError } = await supabase
        .from('flow_emails')
        .delete()
        .eq('flow_id', flowId);

      if (deleteError) {
        console.error('Erro ao deletar emails existentes:', deleteError);
        throw deleteError;
      }

      // Inserir novos emails (apenas os que não estão vazios)
      const validEmails = emails.filter(email => email && email.trim() !== '');
      if (validEmails.length > 0) {
        const emailsToInsert = validEmails.map(email => ({
          flow_id: flowId,
          email: email.trim()
        }));

        const { error: insertError } = await supabase
          .from('flow_emails')
          .insert(emailsToInsert);
        
        if (insertError) {
          console.error('Erro ao inserir emails:', insertError);
          throw insertError;
        }
      }

      console.log('Emails salvos com sucesso');
    } catch (error) {
      console.error('Erro ao salvar emails:', error);
      throw error;
    }
  };

  const saveFlowQuestions = async (flowId: string, questions: any[]) => {
    try {
      console.log('Salvando perguntas para flow:', flowId, questions);
      
      // Deletar perguntas existentes
      const { error: deleteError } = await supabase
        .from('questions')
        .delete()
        .eq('flow_id', flowId);

      if (deleteError) {
        console.error('Erro ao deletar perguntas existentes:', deleteError);
        throw deleteError;
      }

      // Inserir novas perguntas
      if (questions && questions.length > 0) {
        const questionsToInsert = questions.map((question, index) => ({
          flow_id: flowId,
          type: question.type || 'text',
          title: question.title || 'Pergunta sem título',
          placeholder: question.placeholder || null,
          options: question.options ? JSON.stringify(question.options) : null,
          required: question.required || false,
          order_index: question.order || (index + 1),
          variable_name: question.variable_name || null
        }));

        const { error: insertError } = await supabase
          .from('questions')
          .insert(questionsToInsert);
        
        if (insertError) {
          console.error('Erro ao inserir perguntas:', insertError);
          throw insertError;
        }
      }

      console.log('Perguntas salvas com sucesso');
    } catch (error) {
      console.error('Erro ao salvar perguntas:', error);
      throw error;
    }
  };

  const saveCompleteFlow = async (flowData: any) => {
    try {
      console.log('=== INICIANDO SALVAMENTO COMPLETO ===');
      console.log('FlowId:', flowId);
      console.log('FlowData completo:', JSON.stringify(flowData, null, 2));
      console.log('whatsapp_message_template no flowData:', flowData.whatsapp_message_template);

      // Salvar dados principais do fluxo
      const flowUpdateData = {
        name: flowData.name || 'Novo Fluxo',
        description: flowData.description || null,
        whatsapp: flowData.whatsapp || null,
        avatar_url: flowData.avatar_url || flowData.avatar || null,
        button_avatar_url: flowData.button_avatar_url || null,
        attendant_name: flowData.attendant_name || 'Atendimento',
        position: flowData.position || 'bottom-right',
        button_position: flowData.button_position || 'bottom-right',
        chat_position: flowData.chat_position || 'bottom-right',
        button_offset_x: flowData.button_offset_x || 0,
        button_offset_y: flowData.button_offset_y || 0,
        chat_offset_x: flowData.chat_offset_x || 0,
        chat_offset_y: flowData.chat_offset_y || 0,
        chat_width: flowData.chat_width || 400,
        chat_height: flowData.chat_height || 500,
        button_size: flowData.button_size || 60,
        colors: flowData.colors || {
          primary: '#FF6B35',
          secondary: '#3B82F6',
          text: '#1F2937',
          background: '#FFFFFF'
        },
        minimum_question: flowData.minimumQuestion || flowData.minimum_question || 1,
        welcome_message: flowData.welcomeMessage || flowData.welcome_message || 'Olá! Como posso ajudá-lo?',
        final_message: flowData.final_message || 'Obrigado pelo seu contato! Em breve entraremos em contato.',
        final_message_custom: flowData.final_message_custom || null,
        show_whatsapp_button: flowData.showWhatsappButton !== false,
        whatsapp_message_template: flowData.whatsapp_message_template || 'Olá, meu nome é #nome e gostaria de mais informações.',
      };

      console.log('Atualizando dados principais do fluxo:', flowUpdateData);

      const { error: flowError } = await supabase
        .from('flows')
        .update(flowUpdateData)
        .eq('id', flowId);

      if (flowError) {
        console.error('Erro ao atualizar fluxo:', flowError);
        throw flowError;
      }

      console.log('Dados principais do fluxo atualizados com sucesso');

      // Salvar URLs, emails e perguntas em paralelo
      await Promise.all([
        saveFlowUrls(flowId, flowData.urls || ['']),
        saveFlowEmails(flowId, flowData.emails || ['']),
        saveFlowQuestions(flowId, flowData.questions || [])
      ]);

      console.log('Todos os dados salvos com sucesso');

      toast({
        title: "Fluxo salvo com sucesso!",
        description: "Todas as configurações foram atualizadas.",
      });

      return true;
    } catch (error) {
      console.error('Erro ao salvar fluxo completo:', error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar fluxo",
        description: `Ocorreu um erro ao salvar as configurações: ${error.message}`,
      });
      return false;
    }
  };

  const updateFlow = async (flowId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('flows')
        .update(updates)
        .eq('id', flowId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Erro ao atualizar fluxo:', error);
      throw error;
    }
  };

  return {
    saveCompleteFlow,
    saveFlowUrls,
    saveFlowEmails,
    saveFlowQuestions,
    updateFlow
  };
};
