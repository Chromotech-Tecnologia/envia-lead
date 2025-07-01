import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Eye, ArrowLeft } from 'lucide-react';
import FlowEditorHeader from './flow-editor/FlowEditorHeader';
import BasicSettings from './flow-editor/BasicSettings';
import UrlSettings from './flow-editor/UrlSettings';
import EmailSettings from './flow-editor/EmailSettings';
import QuestionEditor from './flow-editor/QuestionEditor';
import DesignSettings from './flow-editor/DesignSettings';
import IntegrationCode from './flow-editor/IntegrationCode';
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
        avatar: flow.avatar_url || '',
        position: flow.position || 'bottom-right',
        buttonPosition: flow.position || 'bottom-right',
        chatPosition: flow.position || 'bottom-right',
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

          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Configurações Básicas</TabsTrigger>
              <TabsTrigger value="questions">Perguntas</TabsTrigger>
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="integration">Integração</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6">
              <BasicSettings flowData={flowData} setFlowData={setFlowData} />
              <UrlSettings flowData={flowData} setFlowData={setFlowData} />
              <EmailSettings flowData={flowData} setFlowData={setFlowData} />
            </TabsContent>

            <TabsContent value="questions" className="space-y-6">
              <QuestionEditor flowData={flowData} setFlowData={setFlowData} />
            </TabsContent>

            <TabsContent value="design" className="space-y-6">
              <DesignSettings flowData={flowData} setFlowData={setFlowData} />
            </TabsContent>

            <TabsContent value="integration" className="space-y-6">
              <IntegrationCode flow={flow} flowData={flowData} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Preview do botão flutuante */}
      {showPreview && (
        <FloatingChatButton 
          flowData={flowData} 
          position={flowData.buttonPosition || 'bottom-right'}
        />
      )}

      {/* Botões fixos no rodapé */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={handleGoBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleTogglePreview}>
                <Eye className="w-4 h-4 mr-2" />
                {showPreview ? 'Ocultar Preview' : 'Visualizar'}
              </Button>
              <Button onClick={handleSave} variant="outline" disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button onClick={handleSaveAndExit} className="envia-lead-gradient hover:opacity-90" disabled={isSaving}>
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Salvando...' : 'Salvar e Sair'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowEditor;
