
import { Button } from "@/components/ui/button";
import { Eye, Edit } from 'lucide-react';
import { useState } from 'react';
import FloatingButtonPreview from './FloatingButtonPreview';

interface FlowCardActionsProps {
  flow: any;
  showPreview: boolean;
  onPreviewToggle: () => void;
  onEdit: (id: string) => void;
}

const FlowCardActions = ({ flow, showPreview, onPreviewToggle, onEdit }: FlowCardActionsProps) => {
  const [showFloatingPreview, setShowFloatingPreview] = useState(false);

  const handleVisualizarClick = () => {
    setShowFloatingPreview(true);
  };

  return (
    <>
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

      <FloatingButtonPreview
        isOpen={showFloatingPreview}
        flow={flow}
        onClose={() => setShowFloatingPreview(false)}
      />
    </>
  );
};

export default FlowCardActions;
