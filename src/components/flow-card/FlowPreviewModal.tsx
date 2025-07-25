
import { Button } from "@/components/ui/button";
import ChatPreview from '../ChatPreview';
import WelcomeBubble from '../chat/WelcomeBubble';
import { useState } from 'react';

interface FlowPreviewModalProps {
  isOpen: boolean;
  flow: any;
  onClose: () => void;
}

const FlowPreviewModal = ({ isOpen, flow, onClose }: FlowPreviewModalProps) => {
  const [showWelcomeBubble, setShowWelcomeBubble] = useState(true);

  if (!isOpen) return null;

  // Preparar dados do fluxo para o ChatPreview
  const prepareFlowDataForPreview = () => {
    return {
      id: flow.id,
      name: flow.name,
      description: flow.description,
      welcome_message: flow.welcome_message || 'Olá! Como posso ajudá-lo hoje?',
      welcomeMessage: flow.welcome_message || 'Olá! Como posso ajudá-lo hoje?',
      avatar_url: flow.avatar_url,
      button_avatar_url: flow.button_avatar_url,
      whatsapp: flow.whatsapp,
      show_whatsapp_button: flow.show_whatsapp_button,
      position: flow.position || 'bottom-right',
      button_position: flow.button_position || 'bottom-right',
      chat_position: flow.chat_position || 'bottom-right',
      attendant_name: flow.attendant_name || 'Atendimento',
      colors: flow.colors || {
        primary: '#FF6B35',
        secondary: '#3B82F6',
        text: '#1F2937',
        background: '#FFFFFF',
        headerText: '#FFFFFF'
      },
      // Aplicar offsets e dimensões
      button_offset_x: flow.button_offset_x || 0,
      button_offset_y: flow.button_offset_y || 0,
      chat_offset_x: flow.chat_offset_x || 0,
      chat_offset_y: flow.chat_offset_y || 0,
      button_size: flow.button_size || 60,
      chat_width: flow.chat_width || 400,
      chat_height: flow.chat_height || 500,
      questions: flow.questions || []
    };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full h-[600px] relative">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Preview do Chat - {flow.name}</h3>
            <p className="text-sm text-gray-600">
              Visualização do chat com suas configurações
            </p>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
          >
            ✕
          </Button>
        </div>
        
        <div className="relative bg-gradient-to-b from-gray-50 to-white rounded-lg h-full overflow-hidden border">
          <ChatPreview 
            device="desktop" 
            flowData={prepareFlowDataForPreview()}
            position={flow.position || 'bottom-right'}
          />
          
          <WelcomeBubble
            showWelcomeBubble={showWelcomeBubble}
            position={flow.position || 'bottom-right'}
            colors={flow.colors || { text: '#1F2937' }}
            flowData={prepareFlowDataForPreview()}
            onClose={() => setShowWelcomeBubble(false)}
          />
        </div>
      </div>
    </div>
  );
};

export default FlowPreviewModal;
