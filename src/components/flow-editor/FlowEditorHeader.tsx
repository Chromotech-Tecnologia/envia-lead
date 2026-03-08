
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, Save, EyeOff } from 'lucide-react';

interface FlowEditorHeaderProps {
  flowName: string;
  onSave: () => void;
  isSaving: boolean;
  showPreview: boolean;
  onTogglePreview: () => void;
  onExit: () => void;
}

const FlowEditorHeader = ({ 
  flowName, 
  onSave, 
  isSaving, 
  showPreview, 
  onTogglePreview,
  onExit
}: FlowEditorHeaderProps) => {

  return (
    <div className="flex items-center justify-between p-4 bg-white border-b">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={onExit}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 p-2"
        >
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
