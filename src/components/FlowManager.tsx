
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFlows } from "@/hooks/useFlows";
import { Plus, Edit, Copy, Pause, Play, Trash2, Eye, MessageSquare } from 'lucide-react';
import ChatPreviewModal from "@/components/ChatPreviewModal";

const FlowManager = () => {
  const { 
    flows, 
    loading, 
    createFlow, 
    updateFlow, 
    duplicateFlow, 
    deleteFlow, 
    toggleFlowStatus 
  } = useFlows();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingFlow, setEditingFlow] = useState<any>(null);
  const [previewFlow, setPreviewFlow] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    whatsapp: '',
  });

  const handleCreateFlow = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newFlow = await createFlow({
      name: formData.name,
      description: formData.description,
      whatsapp: formData.whatsapp,
      is_active: true,
    });

    if (newFlow) {
      setIsCreateDialogOpen(false);
      resetForm();
    }
  };

  const handleEditFlow = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingFlow) return;

    const success = await updateFlow(editingFlow.id, {
      name: formData.name,
      description: formData.description,
      whatsapp: formData.whatsapp,
    });

    if (success) {
      setIsEditDialogOpen(false);
      setEditingFlow(null);
      resetForm();
    }
  };

  const handleDuplicate = async (flowId: string) => {
    await duplicateFlow(flowId);
  };

  const handleDelete = async (flowId: string) => {
    if (!confirm('Tem certeza que deseja excluir este fluxo?')) {
      return;
    }
    await deleteFlow(flowId);
  };

  const handleToggleStatus = async (flowId: string) => {
    await toggleFlowStatus(flowId);
  };

  const openEditDialog = (flow: any) => {
    setEditingFlow(flow);
    setFormData({
      name: flow.name,
      description: flow.description || '',
      whatsapp: flow.whatsapp || '',
    });
    setIsEditDialogOpen(true);
  };

  const openPreview = (flow: any) => {
    setPreviewFlow(flow);
    setIsPreviewOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      whatsapp: '',
    });
    setEditingFlow(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Fluxos de Chat</h2>
          <p className="text-gray-600">Gerencie seus fluxos de conversa</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Novo Fluxo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Fluxo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateFlow} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome do Fluxo</Label>
                <Input
                  id="name"
                  placeholder="Ex: Captura de Leads"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o objetivo deste fluxo..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  placeholder="5511999999999"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Criar Fluxo
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {flows.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum fluxo encontrado
            </h3>
            <p className="text-gray-600 mb-4">
              Crie seu primeiro fluxo de chat para começar a capturar leads
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Fluxo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flows.map((flow) => (
            <Card key={flow.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{flow.name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {flow.description || 'Sem descrição'}
                    </p>
                  </div>
                  <Badge variant={flow.is_active ? "default" : "secondary"}>
                    {flow.is_active ? 'Ativo' : 'Pausado'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <p>Criado em: {new Date(flow.created_at).toLocaleDateString('pt-BR')}</p>
                    {flow.whatsapp && (
                      <p>WhatsApp: {flow.whatsapp}</p>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(flow)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openPreview(flow)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDuplicate(flow.id)}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Duplicar
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleStatus(flow.id)}
                    >
                      {flow.is_active ? (
                        <>
                          <Pause className="w-4 h-4 mr-1" />
                          Pausar
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-1" />
                          Ativar
                        </>
                      )}
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(flow.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Fluxo</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditFlow} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome do Fluxo</Label>
              <Input
                id="edit-name"
                placeholder="Ex: Captura de Leads"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                placeholder="Descreva o objetivo deste fluxo..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-whatsapp">WhatsApp</Label>
              <Input
                id="edit-whatsapp"
                placeholder="5511999999999"
                value={formData.whatsapp}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                Salvar Alterações
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Preview */}
      <ChatPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        flow={previewFlow}
      />
    </div>
  );
};

export default FlowManager;
