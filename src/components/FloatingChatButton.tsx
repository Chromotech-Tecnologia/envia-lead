
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { MessageCircle } from 'lucide-react';
import ChatPreviewModal from './ChatPreviewModal';

interface FloatingChatButtonProps {
  flowData: any;
  position?: 'bottom-right' | 'bottom-left' | 'center';
}

const FloatingChatButton = ({ flowData, position = 'bottom-right' }: FloatingChatButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'center':
        return 'bottom-6 left-1/2 transform -translate-x-1/2';
      default:
        return 'bottom-6 right-6';
    }
  };

  return (
    <>
      <div className={`fixed ${getPositionClasses()} z-50`}>
        <Button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          style={{ 
            backgroundColor: flowData?.colors?.primary || '#FF6B35',
            border: 'none'
          }}
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </Button>
      </div>

      <ChatPreviewModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        flowData={flowData}
        device="desktop"
      />
    </>
  );
};

export default FloatingChatButton;
