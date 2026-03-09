
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando fluxos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary">Fluxos</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus fluxos de captura de leads</p>
        </div>
        <Button 
          onClick={handleCreateFlow} 
          className="envia-lead-gradient hover:opacity-90 shadow-glow-primary rounded-xl px-6 text-primary-foreground"
        >
          <Plus className="w-4 h-4 mr-2" />
          Criar Fluxo
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 items-center glass-card rounded-xl p-4 shadow-3d">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por nome..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="pl-10 rounded-xl border-border bg-background/50"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 rounded-xl border-border bg-background/50">
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
        <div 
          className="envialead-flow-cards-grid"
          style={{
            display: 'grid',
            gap: '1.5rem',
            gridTemplateRows: '1fr',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))'
          }}
        >
          {filteredFlows.map((flow, index) => (
            <div key={flow.id} className="animate-fade-in-up" style={{ animationDelay: `${index * 80}ms` }}>
              <FlowCard
                flow={flow}
                onEdit={() => handleEditFlow(flow)}
                onDelete={() => handleDeleteFlow(flow.id)}
                onDuplicate={() => handleDuplicateFlow(flow.id)}
                onFlowUpdate={() => window.location.reload()}
              />
            </div>
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
