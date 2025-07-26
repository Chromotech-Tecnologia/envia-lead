import { useState } from 'react';
import ChatButton from '../chat/ChatButton';

interface FloatingButtonPreviewProps {
  isOpen: boolean;
  flow: any;
  onClose: () => void;
}

const FloatingButtonPreview = ({ isOpen, flow, onClose }: FloatingButtonPreviewProps) => {
  const [buttonOpen, setButtonOpen] = useState(false);

  if (!isOpen) return null;

  // Preparar cores do fluxo
  const colors = flow.colors || {
    primary: '#FF6B35',
    secondary: '#3B82F6'
  };

  // Preparar dados do fluxo
  const flowData = {
    avatar_url: flow.avatar_url,
    button_avatar_url: flow.button_avatar_url,
    attendant_name: flow.attendant_name || 'Atendimento'
  };

  const position = flow.position || flow.button_position || 'bottom-right';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Preview do Botão - {flow.name}</h3>
            <p className="text-sm text-gray-600">
              Visualização do botão flutuante
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>
        
        <div className="relative bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg h-80 border-2 border-dashed border-gray-300 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">
            Simulação da página do cliente
          </div>
          
          <ChatButton
            isOpen={buttonOpen}
            colors={colors}
            flowData={flowData}
            position={position}
            onClick={() => setButtonOpen(!buttonOpen)}
          />
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Clique no botão para ver a animação de abertura/fechamento
          </p>
        </div>
      </div>
    </div>
  );
};

export default FloatingButtonPreview;