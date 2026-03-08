
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, Save, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FlowEditorHeaderProps {
  flowName: string;
  onSave: () => void;
  isSaving: boolean;
  showPreview: boolean;
  onTogglePreview: () => void;
}

const FlowEditorHeader = ({ 
  flowName, 
  onSave, 
  isSaving, 
  showPreview, 
  onTogglePreview 
}: FlowEditorHeaderProps) => {
  const navigate = useNavigate();

  const handleBackToFlows = () => {
    navigate('/flows');
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={handleBackToFlows}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 p-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Fluxos</span>
        </Button>
        <h1 className="text-xl font-semibold text-gray-900">
          {flowName || 'Novo Fluxo'}
        </h1>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          onClick={onTogglePreview}
          variant="outline"
          className="flex items-center gap-2"
        >
          {showPreview ? (
            <>
              <EyeOff className="w-4 h-4" />
              Ocultar Preview
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              Visualizar
            </>
          )}
        </Button>
        
        <Button
          onClick={onSave}
          disabled={isSaving}
          className="envia-lead-gradient hover:opacity-90 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </div>
  );
};

export default FlowEditorHeader;
