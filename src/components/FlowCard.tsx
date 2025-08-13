
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
  onFlowUpdate?: () => void;
}

const FlowCard = ({ flow, onEdit, onDelete, onDuplicate, onFlowUpdate }: FlowCardProps) => {
  const [showPreview, setShowPreview] = useState(false);

  const handlePreviewToggle = () => {
    setShowPreview(!showPreview);
  };

  return (
    <>
      <Card 
        className="hover:shadow-lg transition-shadow duration-200"
        data-card="flow"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          minHeight: '300px'
        }}
      >
        <CardHeader className="pb-3">
          <FlowCardHeader
            flow={flow}
            onEdit={onEdit}
            onDelete={onDelete}
            onDuplicate={onDuplicate}
            onFlowUpdate={onFlowUpdate}
          />
        </CardHeader>
        
        <CardContent 
          className="pt-0"
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: '1',
            paddingTop: '0'
          }}
        >
          <div style={{ flex: '1' }}>
            <FlowCardStats flow={flow} />
          </div>
          
          <div 
            style={{
              marginTop: 'auto',
              paddingTop: '1rem'
            }}
          >
            <FlowCardActions
              flow={flow}
              showPreview={showPreview}
              onPreviewToggle={handlePreviewToggle}
              onEdit={onEdit}
            />
          </div>
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
