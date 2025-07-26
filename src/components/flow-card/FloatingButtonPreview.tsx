import { useEffect } from 'react';
import FloatingChatButton from '../FloatingChatButton';

interface FloatingButtonPreviewProps {
  isOpen: boolean;
  flow: any;
  onClose: () => void;
}

const FloatingButtonPreview = ({ isOpen, flow, onClose }: FloatingButtonPreviewProps) => {
  useEffect(() => {
    if (isOpen) {
      // Adicionar classe para esconder o overflow do body
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Preparar dados do fluxo para o FloatingChatButton
  const flowData = {
    ...flow,
    questions: flow.questions || [],
    bot_messages: flow.bot_messages || [],
    colors: flow.colors || {
      primary: '#FF6B35',
      secondary: '#3B82F6'
    }
  };

  const position = flow.position || flow.button_position || 'bottom-right';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
      {/* FloatingChatButton funcional */}
      <FloatingChatButton
        flowData={flowData}
        position={position}
        isPreview={true}
        onHidePreview={onClose}
      />
    </div>
  );
};

export default FloatingButtonPreview;