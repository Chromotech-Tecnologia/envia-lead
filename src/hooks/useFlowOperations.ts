
import { useFlows } from "@/hooks/useFlows";
import { useFlowPersistence } from "@/hooks/useFlowPersistence";
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";

export const useFlowOperations = () => {
  const { flows, loading, createFlow, updateFlow, deleteFlow, duplicateFlow, refetch } = useFlows();
  const [selectedFlow, setSelectedFlow] = useState<any>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewFlow, setPreviewFlow] = useState<any>(null);
  const [flowData, setFlowData] = useState<any>({});
  const { toast } = useToast();
  
  const { saveCompleteFlow } = useFlowPersistence(selectedFlow?.id);

  const initializeFlowData = (flow: any) => {
    return {
      name: flow?.name || 'Novo Fluxo',
      description: flow?.description || '',
      emails: flow?.emails && flow.emails.length > 0 ? flow.emails : [''],
      whatsapp: flow?.whatsapp || '',
      avatar: flow?.avatar_url || '',
      position: flow?.position || 'bottom-right',
      buttonPosition: flow?.position || 'bottom-right',
      chatPosition: flow?.position || 'bottom-right',
      urls: flow?.urls && flow.urls.length > 0 ? flow.urls : [''],
      colors: flow?.colors || {
        primary: '#FF6B35',
        secondary: '#3B82F6',
        text: '#1F2937',
        background: '#FFFFFF'
      },
      questions: flow?.questions && flow.questions.length > 0 ? flow.questions : [
        {
          id: Date.now(),
          type: 'text',
          title: 'Qual é o seu nome?',
          placeholder: 'Digite seu nome completo',
          required: true,
          order: 1
        }
      ],
      minimumQuestion: flow?.minimum_question || 1,
      welcomeMessage: flow?.welcome_message || 'Olá! Como posso ajudá-lo?',
      showWhatsappButton: flow?.show_whatsapp_button !== false,
      attendant_name: flow?.attendant_name || 'Atendimento',
      final_message: flow?.final_message || 'Obrigado pelo seu contato! Em breve entraremos em contato.',
      whatsapp_message_template: flow?.whatsapp_message_template || 'Olá, meu nome é #nome e gostaria de mais informações.'
    };
  };

  const handleCreateFlow = async () => {
    const newFlow = await createFlow({
      name: "Novo Fluxo",
      description: "Descrição do fluxo",
    });

    if (newFlow) {
      setSelectedFlow(newFlow);
      const initialData = initializeFlowData(newFlow);
      setFlowData(initialData);
      setIsEditorOpen(true);
    }
  };

  const handleEditFlow = (flow: any) => {
    console.log('Editando fluxo:', flow);
    setSelectedFlow(flow);
    const initialData = initializeFlowData(flow);
    console.log('Dados iniciais do fluxo:', initialData);
    setFlowData(initialData);
    setIsEditorOpen(true);
  };

  const handleSaveFlow = async () => {
    if (selectedFlow && flowData) {
      console.log('Salvando fluxo com dados:', flowData);
      const success = await saveCompleteFlow(flowData);
      if (success) {
        // Recarregar os dados automaticamente após salvar
        await refetch();
        toast({
          title: "Sucesso!",
          description: "Fluxo salvo e dados atualizados!",
          className: "border-green-500 bg-green-50 text-green-900",
        });
      }
      return success;
    }
    return false;
  };

  const handleSaveAndExit = async () => {
    const success = await handleSaveFlow();
    if (success) {
      setIsEditorOpen(false);
      setSelectedFlow(null);
      setFlowData({});
    }
  };

  const handleExitEditor = () => {
    setIsEditorOpen(false);
    setSelectedFlow(null);
    setFlowData({});
  };

  const handlePreviewFlow = (flow: any) => {
    // Garantir que o fluxo tenha todos os dados necessários para o preview
    const previewData = {
      ...flow,
      urls: flow.urls || [''],
      emails: flow.emails || [''],
      questions: flow.questions || [],
      colors: flow.colors || {
        primary: '#FF6B35',
        secondary: '#3B82F6',
        text: '#1F2937',
        background: '#FFFFFF'
      }
    };
    setPreviewFlow(previewData);
    setIsPreviewOpen(true);
  };

  const handlePreviewFlowFromEditor = () => {
    if (selectedFlow && flowData) {
      const previewData = { 
        ...selectedFlow, 
        ...flowData,
        urls: flowData.urls || [''],
        emails: flowData.emails || [''],
        questions: flowData.questions || []
      };
      setPreviewFlow(previewData);
      setIsPreviewOpen(true);
    }
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewFlow(null);
  };

  return {
    flows,
    loading,
    selectedFlow,
    isEditorOpen,
    isPreviewOpen,
    previewFlow,
    flowData,
    setFlowData,
    handleCreateFlow,
    handleEditFlow,
    handleSaveFlow,
    handleSaveAndExit,
    handleExitEditor,
    handlePreviewFlow,
    handlePreviewFlowFromEditor,
    handleClosePreview,
    duplicateFlow,
    updateFlow,
    deleteFlow
  };
};
