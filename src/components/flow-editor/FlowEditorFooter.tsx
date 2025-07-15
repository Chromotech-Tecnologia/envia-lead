
import { Button } from "@/components/ui/button";
import { Save, Eye, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FlowEditorFooterProps {
  showPreview: boolean;
  isSaving: boolean;
  onGoBack: () => void;
  onTogglePreview: () => void;
  onSave: () => void;
  onSaveAndExit: () => void;
}

const FlowEditorFooter = ({
  showPreview,
  isSaving,
  onGoBack,
  onTogglePreview,
  onSave,
  onSaveAndExit
}: FlowEditorFooterProps) => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/flows');
  };
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={handleGoBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Fluxos
          </Button>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={onTogglePreview}>
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? 'Ocultar Preview' : 'Visualizar'}
            </Button>
            <Button onClick={onSave} variant="outline" disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button onClick={onSaveAndExit} className="envia-lead-gradient hover:opacity-90" disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar e Sair'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowEditorFooter;
