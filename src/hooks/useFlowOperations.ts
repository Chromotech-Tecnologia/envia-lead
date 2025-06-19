
import { useFlows } from "@/hooks/useFlows";
import { useFlowPersistence } from "@/hooks/useFlowPersistence";
import { useState } from 'react';

export const useFlowOperations = () => {
  const { flows, loading, createFlow, updateFlow, deleteFlow, duplicateFlow } = useFlows();
  const [selectedFlow, setSelectedFlow] = useState<any>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewFlow, setPreviewFlow] = useState<any>(null);
  const [flowData, setFlowData] = useState<any>({});
  
  const { saveCompleteFlow } = useFlowPersistence(selectedFlow?.id);

  const handleCreateFlow = async () => {
    const newFlow = await createFlow({
      name: "Novo Fluxo",
      description: "Descrição do fluxo",
    });

    if (newFlow) {
      setSelectedFlow(newFlow);
      setFlowData({
        name: newFlow.name || 'Novo Fluxo',
        description: newFlow.description || '',
        emails: [''],
        whatsapp: newFlow.whatsapp || '',
        avatar: newFlow.avatar_url || '',
        position: newFlow.position || 'bottom-right',
        urls: [''],
        colors: newFlow.colors || {
          primary: '#FF6B35',
          secondary: '#3B82F6',
          text: '#1F2937',
          background: '#FFFFFF'
        },
        questions: [
          {
            id: 1,
            type: 'text',
            title: 'Qual é o seu nome?',
            placeholder: 'Digite seu nome completo',
            required: true,
            order: 1
          }
        ],
        minimumQuestion: newFlow.minimum_question || 1
      });
      setIsEditorOpen(true);
    }
  };

  const handleEditFlow = (flow: any) => {
    setSelectedFlow(flow);
    setFlowData({
      name: flow.name || 'Novo Fluxo',
      description: flow.description || '',
      emails: flow.emails || [''],
      whatsapp: flow.whatsapp || '',
      avatar: flow.avatar_url || '',
      position: flow.position || 'bottom-right',
      urls: flow.urls || [''],
      colors: flow.colors || {
        primary: '#FF6B35',
        secondary: '#3B82F6',
        text: '#1F2937',
        background: '#FFFFFF'
      },
      questions: flow.questions || [
        {
          id: 1,
          type: 'text',
          title: 'Qual é o seu nome?',
          placeholder: 'Digite seu nome completo',
          required: true,
          order: 1
        }
      ],
      minimumQuestion: flow.minimum_question || 1
    });
    setIsEditorOpen(true);
  };

  const handleSaveFlow = async () => {
    if (selectedFlow && flowData) {
      return await saveCompleteFlow(flowData);
    }
    return false;
  };

  const handleSaveAndExit = async () => {
    const success = await handleSaveFlow();
    if (success) {
      setIsEditorOpen(false);
      setSelectedFlow(null);
    }
  };

  const handlePreviewFlow = (flow: any) => {
    setPreviewFlow(flow);
    setIsPreviewOpen(true);
  };

  const handlePreviewFlowFromEditor = () => {
    setPreviewFlow({ ...selectedFlow, ...flowData });
    setIsPreviewOpen(true);
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
    handlePreviewFlow,
    handlePreviewFlowFromEditor,
    handleClosePreview,
    duplicateFlow,
    updateFlow,
    deleteFlow
  };
};
