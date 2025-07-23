
import { Button } from "@/components/ui/button";
import { Eye, Edit } from 'lucide-react';

interface FlowCardActionsProps {
  flow: any;
  showPreview: boolean;
  onPreviewToggle: () => void;
  onEdit: (id: string) => void;
}

const FlowCardActions = ({ flow, showPreview, onPreviewToggle, onEdit }: FlowCardActionsProps) => {
  return (
    <div className="flex gap-2">
      <Button
        onClick={onPreviewToggle}
        variant="outline"
        size="sm"
        className="flex-1"
      >
        <Eye className="w-4 h-4 mr-2" />
        {showPreview ? 'Ocultar' : 'Visualizar'}
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
