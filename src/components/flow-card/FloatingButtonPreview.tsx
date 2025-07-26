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
      {/* Botão para fechar o preview */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-gray-100 z-60"
      >
        ✕
      </button>
      
      {/* Texto informativo */}
      <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg z-60">
        <p className="text-sm font-medium">Preview: {flow.name}</p>
        <p className="text-xs text-gray-600">Clique no botão para testar o chat</p>
      </div>

      {/* FloatingChatButton funcional */}
      <FloatingChatButton
        flowData={flowData}
        position={position}
        isPreview={true}
      />
    </div>
  );
};

export default FloatingButtonPreview;