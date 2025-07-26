
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search } from 'lucide-react';
import FlowEditor from "@/components/FlowEditor";
import ChatPreviewModal from "@/components/ChatPreviewModal";
import FlowCard from "@/components/FlowCard";
import EmptyFlowState from "@/components/EmptyFlowState";
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando fluxos...</p>
        </div>
      </div>
    );
  }

  console.log('FlowManager renderizado - flows:', flows.length, 'loading:', loading);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fluxos</h1>
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
        <EmptyFlowState 
          hasFlows={flows.length > 0}
          onCreateFlow={handleCreateFlow}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredFlows.map((flow) => (
            <FlowCard
              key={flow.id}
              flow={flow}
              onEdit={() => handleEditFlow(flow)}
              onDelete={() => handleDeleteFlow(flow.id)}
              onDuplicate={() => handleDuplicateFlow(flow.id)}
            />
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
