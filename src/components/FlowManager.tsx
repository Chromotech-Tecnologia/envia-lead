
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Copy, Pause, Play, Trash2, Eye } from 'lucide-react';
import FlowEditor from "@/components/FlowEditor";
import ChatPreviewModal from "@/components/ChatPreviewModal";
import { useFlowOperations } from "@/hooks/useFlowOperations";

const FlowManager = () => {
  const {
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
  } = useFlowOperations();

  const handleDuplicateFlow = async (flowId: string) => {
    await duplicateFlow(flowId);
  };

  const handleToggleActive = async (flow: any) => {
    await updateFlow(flow.id, { is_active: !flow.is_active });
  };

  const handleDeleteFlow = async (flowId: string) => {
    if (window.confirm('Tem certeza que deseja excluir este fluxo?')) {
      await deleteFlow(flowId);
    }
  };

  if (isEditorOpen && selectedFlow) {
    return (
      <FlowEditor 
        flow={selectedFlow}
        isEditing={true}
        flowData={flowData}
        setFlowData={setFlowData}
        onSave={handleSaveFlow}
        onSaveAndExit={handleSaveAndExit}
        onPreview={handlePreviewFlowFromEditor}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fluxos de Chat</h1>
          <p className="text-gray-600 mt-2">Gerencie seus fluxos de captura de leads</p>
        </div>
        <Button onClick={handleCreateFlow} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Criar Fluxo
        </Button>
      </div>

      {flows.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum fluxo encontrado
              </h3>
              <p className="text-gray-600 mb-4">
                Comece criando seu primeiro fluxo de captura de leads
              </p>
              <Button onClick={handleCreateFlow} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Criar Primeiro Fluxo
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {flows.map((flow) => (
            <Card key={flow.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{flow.name}</CardTitle>
                  <Badge variant={flow.is_active ? "default" : "secondary"}>
                    {flow.is_active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
                <CardDescription>{flow.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditFlow(flow)}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreviewFlow(flow)}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicateFlow(flow.id)}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Duplicar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleActive(flow)}
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
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteFlow(flow.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isPreviewOpen && previewFlow && (
        <ChatPreviewModal
          isOpen={isPreviewOpen}
          onClose={handleClosePreview}
          flowData={previewFlow}
          device="desktop"
        />
      )}
    </div>
  );
};

export default FlowManager;
