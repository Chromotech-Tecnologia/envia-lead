
import { useState } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import FlowCardHeader from './flow-card/FlowCardHeader';
import FlowCardStats from './flow-card/FlowCardStats';
import FlowCardActions from './flow-card/FlowCardActions';
import FlowPreviewModal from './flow-card/FlowPreviewModal';

interface FlowCardProps {
  flow: any;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

const FlowCard = ({ flow, onEdit, onDelete, onDuplicate }: FlowCardProps) => {
  const [showPreview, setShowPreview] = useState(false);

  const handlePreviewToggle = () => {
    setShowPreview(!showPreview);
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="pb-3">
          <FlowCardHeader
            flow={flow}
            onEdit={onEdit}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
          />
        </CardHeader>
        
        <CardContent className="pt-0">
          <FlowCardStats flow={flow} />
          
          <FlowCardActions
            flow={flow}
            showPreview={showPreview}
            onPreviewToggle={handlePreviewToggle}
            onEdit={onEdit}
          />
        </CardContent>
      </Card>

      <FlowPreviewModal
        isOpen={showPreview}
        flow={flow}
        onClose={handlePreviewToggle}
      />
    </>
  );
};

export default FlowCard;
