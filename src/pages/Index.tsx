
import { useState } from 'react';
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
  Monitor
} from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import DashboardMetrics from '@/components/DashboardMetrics';
import FlowManager from '@/components/FlowManager';
import LeadsTable from '@/components/LeadsTable';
import FlowEditor from '@/components/FlowEditor';
import ChatPreview from '@/components/ChatPreview';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [isEditingFlow, setIsEditingFlow] = useState(false);

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
              <FlowEditor flow={selectedFlow} isEditing={isEditingFlow} />
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
                    <ChatPreview device="desktop" />
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
                    <ChatPreview device="mobile" />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Index;
