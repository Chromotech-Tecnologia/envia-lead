
import { useState, useEffect } from 'react';
import FlowEditorHeader from './flow-editor/FlowEditorHeader';
import FlowEditorTabs from './flow-editor/FlowEditorTabs';
import FlowEditorFooter from './flow-editor/FlowEditorFooter';
import FloatingChatButton from './FloatingChatButton';

interface FlowEditorProps {
  flow?: any;
  isEditing: boolean;
  flowData: any;
  setFlowData: (data: any) => void;
  onSave: () => Promise<boolean>;
  onSaveAndExit: () => Promise<void>;
  onExit: () => void;
  onPreview: (device?: 'desktop' | 'mobile') => void;
}

const FlowEditor = ({ flow, isEditing, flowData, setFlowData, onSave, onSaveAndExit, onExit, onPreview }: FlowEditorProps) => {
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Inicializar dados do fluxo quando um fluxo for selecionado para edição
  useEffect(() => {
    if (flow && isEditing) {
      setFlowData({
        name: flow.name || 'Novo Fluxo',
        description: flow.description || '',
        emails: flow.emails || [''],
        whatsapp: flow.whatsapp || '',
        avatar_url: flow.avatar_url || '',
        position: flow.position || 'bottom-right',
        button_position: flow.button_position || 'bottom-right',
        chat_position: flow.chat_position || 'bottom-right',
        button_offset_x: flow.button_offset_x || 0,
        button_offset_y: flow.button_offset_y || 0,
        chat_offset_x: flow.chat_offset_x || 0,
        chat_offset_y: flow.chat_offset_y || 0,
        chat_width: flow.chat_width || 400,
        chat_height: flow.chat_height || 500,
        button_size: flow.button_size || 60,
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
        minimumQuestion: flow.minimum_question || 1,
        welcomeMessage: flow.welcome_message || 'Olá! Como posso ajudá-lo?',
        showWhatsappButton: flow.show_whatsapp_button !== false
      });
    }
  }, [flow, isEditing, setFlowData]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave();
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAndExit = async () => {
    setIsSaving(true);
    try {
      await onSaveAndExit();
    } finally {
      setIsSaving(false);
    }
  };

  const handleGoBack = () => {
    onExit();
  };

  const handleTogglePreview = () => {
    setShowPreview(!showPreview);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Conteúdo principal com padding bottom para os botões fixos */}
      <div className="pb-20">
        <div className="container mx-auto px-4 py-6 space-y-6">
          <FlowEditorHeader 
            flowName={flowData.name || 'Novo Fluxo'}
            onSave={handleSave}
            isSaving={isSaving}
            showPreview={showPreview}
            onTogglePreview={handleTogglePreview}
          />

          <FlowEditorTabs 
            flow={flow}
            flowData={flowData}
            setFlowData={setFlowData}
          />
        </div>
      </div>

      {/* Preview do botão flutuante */}
      {showPreview && (
        <div style={{ zIndex: 1000 }}>
          <FloatingChatButton 
            flowData={flowData} 
            position={flowData.position || 'bottom-right'}
          />
        </div>
      )}

      {/* Botões fixos no rodapé */}
      <FlowEditorFooter
        showPreview={showPreview}
        isSaving={isSaving}
        onGoBack={handleGoBack}
        onTogglePreview={handleTogglePreview}
        onSave={handleSave}
        onSaveAndExit={handleSaveAndExit}
      />
    </div>
  );
};

export default FlowEditor;
