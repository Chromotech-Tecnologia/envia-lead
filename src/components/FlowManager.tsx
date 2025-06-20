
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Copy, Trash2, Eye, Search } from 'lucide-react';
import FlowEditor from "@/components/FlowEditor";
import ChatPreviewModal from "@/components/ChatPreviewModal";
import { useFlowOperations } from "@/hooks/useFlowOperations";
import { useState } from 'react';

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
    handleExitEditor,
    handlePreviewFlow,
    handlePreviewFlowFromEditor,
    handleClosePreview,
    duplicateFlow,
    updateFlow,
    deleteFlow
  } = useFlowOperations();

  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  // Filtrar fluxos
  const filteredFlows = flows.filter(flow => {
    const matchesSearch = flow.name.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && flow.is_active) ||
      (statusFilter === 'inactive' && !flow.is_active);
    
    return matchesSearch && matchesStatus;
  });

  if (isEditorOpen && selectedFlow) {
    return (
      <FlowEditor 
        flow={selectedFlow}
        isEditing={true}
        flowData={flowData}
        setFlowData={setFlowData}
        onSave={handleSaveFlow}
        onSaveAndExit={handleSaveAndExit}
        onExit={handleExitEditor}
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

      {/* Filtros */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nome..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="active">Ativos</SelectItem>
            <SelectItem value="inactive">Inativos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filteredFlows.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {flows.length === 0 ? 'Nenhum fluxo encontrado' : 'Nenhum fluxo corresponde aos filtros'}
              </h3>
              <p className="text-gray-600 mb-4">
                {flows.length === 0 ? 'Comece criando seu primeiro fluxo de captura de leads' : 'Tente ajustar os filtros de busca'}
              </p>
              {flows.length === 0 && (
                <Button onClick={handleCreateFlow} className="bg-purple-600 hover:bg-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Fluxo
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredFlows.map((flow) => (
            <Card key={flow.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{flow.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={flow.is_active}
                      onCheckedChange={() => handleToggleActive(flow)}
                    />
                    <Badge variant={flow.is_active ? "default" : "secondary"}>
                      {flow.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </div>
                <CardDescription>{flow.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditFlow(flow)}
                    className="w-full"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePreviewFlow(flow)}
                    className="w-full"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicateFlow(flow.id)}
                    className="w-full"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Duplicar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteFlow(flow.id)}
                    className="w-full text-red-600 hover:text-red-700"
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
