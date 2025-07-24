
import { Button } from "@/components/ui/button";
import { Eye, Edit } from 'lucide-react';

interface FlowCardActionsProps {
  flow: any;
  showPreview: boolean;
  onPreviewToggle: () => void;
  onEdit: (id: string) => void;
}

const FlowCardActions = ({ flow, showPreview, onPreviewToggle, onEdit }: FlowCardActionsProps) => {
  const handleVisualizarClick = () => {
    // Redireciona para a página do editor e ativa o preview automaticamente
    window.location.href = `/flow-editor/${flow.id}?preview=true`;
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleVisualizarClick}
        variant="outline"
        size="sm"
        className="flex-1"
      >
        <Eye className="w-4 h-4 mr-2" />
        Visualizar
      </Button>
      
      <Button
        onClick={() => onEdit(flow.id)}
        size="sm"
        className="flex-1 envia-lead-gradient hover:opacity-90"
      >
        <Edit className="w-4 h-4 mr-2" />
        Editar
      </Button>
    </div>
  );
};

export default FlowCardActions;
