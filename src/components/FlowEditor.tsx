
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Eye } from 'lucide-react';
import FlowEditorHeader from './flow-editor/FlowEditorHeader';
import BasicSettings from './flow-editor/BasicSettings';
import UrlSettings from './flow-editor/UrlSettings';
import EmailSettings from './flow-editor/EmailSettings';
import QuestionEditor from './flow-editor/QuestionEditor';
import DesignSettings from './flow-editor/DesignSettings';
import IntegrationCode from './flow-editor/IntegrationCode';

interface FlowEditorProps {
  flow?: any;
  isEditing: boolean;
}

const FlowEditor = ({ flow, isEditing }: FlowEditorProps) => {
  const [flowData, setFlowData] = useState({
    name: flow?.name || 'Novo Fluxo',
    description: flow?.description || '',
    emails: flow?.emails || [''],
    whatsapp: flow?.whatsapp || '',
    avatar: flow?.avatar || '',
    position: flow?.position || 'bottom-right',
    urls: flow?.urls || [''],
    colors: {
      primary: flow?.colors?.primary || '#FF6B35',
      secondary: flow?.colors?.secondary || '#3B82F6',
      text: flow?.colors?.text || '#1F2937',
      background: flow?.colors?.background || '#FFFFFF'
    },
    questions: flow?.questions || [
      {
        id: 1,
        type: 'text',
        title: 'Qual é o seu nome?',
        placeholder: 'Digite seu nome completo',
        required: true,
        order: 1
      }
    ],
    minimumQuestion: flow?.minimumQuestion || 3
  });

  return (
    <div className="space-y-6">
      <FlowEditorHeader isEditing={isEditing} />

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

      <div className="flex justify-end gap-4">
        <Button variant="outline">
          <Eye className="w-4 h-4 mr-2" />
          Visualizar
        </Button>
        <Button className="envia-lead-gradient hover:opacity-90">
          <Save className="w-4 h-4 mr-2" />
          Salvar Fluxo
        </Button>
      </div>
    </div>
  );
};

export default FlowEditor;
