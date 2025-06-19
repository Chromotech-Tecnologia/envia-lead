
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  TrendingUp, 
  Settings, 
  Plus, 
  BarChart3,
  Globe,
  Smartphone,
  Monitor,
  Eye
} from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Sidebar from '@/components/Sidebar';
import DashboardMetrics from '@/components/DashboardMetrics';
import FlowManager from '@/components/FlowManager';
import LeadsTable from '@/components/LeadsTable';
import FlowEditor from '@/components/FlowEditor';
import ChatPreviewModal from '@/components/ChatPreviewModal';
import FloatingChatButton from '@/components/FloatingChatButton';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [isEditingFlow, setIsEditingFlow] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [flowData, setFlowData] = useState({
    name: 'Novo Fluxo',
    description: '',
    emails: [''],
    whatsapp: '',
    avatar: '',
    position: 'bottom-right',
    urls: [''],
    colors: {
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
    minimumQuestion: 1
  });
  const { toast } = useToast();

  const handleCreateFlow = () => {
    setSelectedFlow(null);
    setIsEditingFlow(true);
    setActiveTab('editor');
  };

  const handleEditFlow = (flow) => {
    setSelectedFlow(flow);
    setIsEditingFlow(true);
    setActiveTab('editor');
  };

  const handlePreviewFlow = (device: 'desktop' | 'mobile' = 'desktop') => {
    setPreviewDevice(device);
    setShowPreview(true);
  };

  const handleSaveFlow = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar o company_id do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!profile?.company_id) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Empresa não encontrada. Entre em contato com o suporte.",
        });
        return;
      }

      const flowPayload = {
        name: flowData.name,
        description: flowData.description,
        avatar_url: flowData.avatar,
        position: flowData.position,
        whatsapp: flowData.whatsapp,
        colors: flowData.colors,
        minimum_question: flowData.minimumQuestion,
        company_id: profile.company_id
      };

      let flowId;

      if (selectedFlow) {
        // Atualizar fluxo existente
        const { error } = await supabase
          .from('flows')
          .update(flowPayload)
          .eq('id', selectedFlow.id);

        if (error) throw error;
        flowId = selectedFlow.id;
      } else {
        // Criar novo fluxo
        const { data: newFlow, error } = await supabase
          .from('flows')
          .insert(flowPayload)
          .select()
          .single();

        if (error) throw error;
        flowId = newFlow.id;
      }

      // Salvar URLs
      await supabase.from('flow_urls').delete().eq('flow_id', flowId);
      if (flowData.urls.length > 0 && flowData.urls[0]) {
        const urlsData = flowData.urls
          .filter(url => url.trim())
          .map(url => ({ flow_id: flowId, url: url.trim() }));
        
        if (urlsData.length > 0) {
          await supabase.from('flow_urls').insert(urlsData);
        }
      }

      // Salvar emails
      await supabase.from('flow_emails').delete().eq('flow_id', flowId);
      if (flowData.emails.length > 0 && flowData.emails[0]) {
        const emailsData = flowData.emails
          .filter(email => email.trim())
          .map(email => ({ flow_id: flowId, email: email.trim() }));
        
        if (emailsData.length > 0) {
          await supabase.from('flow_emails').insert(emailsData);
        }
      }

      // Salvar perguntas
      await supabase.from('questions').delete().eq('flow_id', flowId);
      if (flowData.questions.length > 0) {
        const questionsData = flowData.questions.map((q, index) => ({
          flow_id: flowId,
          type: q.type,
          title: q.title,
          placeholder: q.placeholder,
          options: q.options || null,
          required: q.required,
          order_index: index + 1
        }));
        
        await supabase.from('questions').insert(questionsData);
      }

      toast({
        title: "Sucesso!",
        description: `Fluxo ${selectedFlow ? 'atualizado' : 'criado'} com sucesso.`,
      });

      setActiveTab('flows');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar fluxo",
        description: error.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 flex w-full">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2 envia-lead-text-gradient">
                  Envia Lead
                </h1>
                <p className="text-gray-600">
                  Plataforma de Geração e Envio de Leads via Chat Inteligente
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Online
                </Badge>
                <Button onClick={handleCreateFlow} className="envia-lead-gradient hover:opacity-90 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Fluxo
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5 mb-8 bg-white shadow-sm">
              <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
                <BarChart3 className="w-4 h-4" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="flows" className="flex items-center gap-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
                <Settings className="w-4 h-4" />
                Fluxos
              </TabsTrigger>
              <TabsTrigger value="leads" className="flex items-center gap-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
                <Users className="w-4 h-4" />
                Leads
              </TabsTrigger>
              <TabsTrigger value="editor" className="flex items-center gap-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
                <Settings className="w-4 h-4" />
                Editor
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center gap-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
                <Globe className="w-4 h-4" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <DashboardMetrics />
            </TabsContent>

            <TabsContent value="flows" className="space-y-6">
              <FlowManager onEditFlow={handleEditFlow} />
            </TabsContent>

            <TabsContent value="leads" className="space-y-6">
              <LeadsTable />
            </TabsContent>

            <TabsContent value="editor" className="space-y-6">
              <FlowEditor 
                flow={selectedFlow} 
                isEditing={isEditingFlow}
                flowData={flowData}
                setFlowData={setFlowData}
                onSave={handleSaveFlow}
                onPreview={handlePreviewFlow}
              />
            </TabsContent>

            <TabsContent value="preview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Monitor className="w-5 h-5 text-purple-600" />
                      Preview Desktop
                    </CardTitle>
                    <CardDescription>
                      Visualização do chat em dispositivos desktop
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Button 
                        onClick={() => handlePreviewFlow('desktop')}
                        className="w-full envia-lead-gradient hover:opacity-90"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Visualizar Desktop
                      </Button>
                      <FloatingChatButton flowData={flowData} position="bottom-right" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-purple-600" />
                      Preview Mobile
                    </CardTitle>
                    <CardDescription>
                      Visualização do chat em dispositivos móveis
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      onClick={() => handlePreviewFlow('mobile')}
                      className="w-full envia-lead-gradient hover:opacity-90"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Visualizar Mobile
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <ChatPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        flowData={flowData}
        device={previewDevice}
      />
    </div>
  );
};

export default Index;
