
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useFlowPersistence = (flowId: string) => {
  const { toast } = useToast();

  const saveFlowUrls = async (flowId: string, urls: string[]) => {
    try {
      // Deletar URLs existentes
      await supabase
        .from('flow_urls')
        .delete()
        .eq('flow_id', flowId);

      // Inserir novas URLs
      const urlsToInsert = urls.filter(url => url.trim()).map(url => ({
        flow_id: flowId,
        url: url.trim()
      }));

      if (urlsToInsert.length > 0) {
        const { error } = await supabase
          .from('flow_urls')
          .insert(urlsToInsert);
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Erro ao salvar URLs:', error);
      throw error;
    }
  };

  const saveFlowEmails = async (flowId: string, emails: string[]) => {
    try {
      // Deletar emails existentes
      await supabase
        .from('flow_emails')
        .delete()
        .eq('flow_id', flowId);

      // Inserir novos emails
      const emailsToInsert = emails.filter(email => email.trim()).map(email => ({
        flow_id: flowId,
        email: email.trim()
      }));

      if (emailsToInsert.length > 0) {
        const { error } = await supabase
          .from('flow_emails')
          .insert(emailsToInsert);
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Erro ao salvar emails:', error);
      throw error;
    }
  };

  const saveFlowQuestions = async (flowId: string, questions: any[]) => {
    try {
      // Deletar perguntas existentes
      await supabase
        .from('questions')
        .delete()
        .eq('flow_id', flowId);

      // Inserir novas perguntas
      const questionsToInsert = questions.map((question, index) => ({
        flow_id: flowId,
        type: question.type,
        title: question.title,
        placeholder: question.placeholder || null,
        options: question.options || null,
        required: question.required || false,
        order_index: index + 1
      }));

      if (questionsToInsert.length > 0) {
        const { error } = await supabase
          .from('questions')
          .insert(questionsToInsert);
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Erro ao salvar perguntas:', error);
      throw error;
    }
  };

  const saveCompleteFlow = async (flowData: any) => {
    try {
      // Salvar dados principais do fluxo
      const { error: flowError } = await supabase
        .from('flows')
        .update({
          name: flowData.name,
          description: flowData.description,
          whatsapp: flowData.whatsapp,
          avatar_url: flowData.avatar,
          position: flowData.position,
          colors: flowData.colors,
          minimum_question: flowData.minimumQuestion,
        })
        .eq('id', flowId);

      if (flowError) throw flowError;

      // Salvar URLs, emails e perguntas
      await Promise.all([
        saveFlowUrls(flowId, flowData.urls || []),
        saveFlowEmails(flowId, flowData.emails || []),
        saveFlowQuestions(flowId, flowData.questions || [])
      ]);

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
        description: "Ocorreu um erro ao salvar as configurações.",
      });
      return false;
    }
  };

  return {
    saveCompleteFlow,
    saveFlowUrls,
    saveFlowEmails,
    saveFlowQuestions
  };
};
