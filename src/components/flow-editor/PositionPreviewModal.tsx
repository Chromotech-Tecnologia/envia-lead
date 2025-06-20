
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle } from 'lucide-react';

interface PositionPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  flowData: any;
}

const PositionPreviewModal = ({ isOpen, onClose, flowData }: PositionPreviewModalProps) => {
  const getButtonPositionStyles = () => {
    const position = flowData.buttonPosition || 'bottom-right';
    switch (position) {
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'top-right':
        return 'top-6 right-6';
      case 'top-left':
        return 'top-6 left-6';
      case 'center-right':
        return 'top-1/2 right-6 -translate-y-1/2';
      case 'center-left':
        return 'top-1/2 left-6 -translate-y-1/2';
      default:
        return 'bottom-6 right-6';
    }
  };

  const getChatPositionStyles = () => {
    const position = flowData.chatPosition || 'bottom-right';
    switch (position) {
      case 'bottom-left':
        return 'bottom-20 left-6';
      case 'center':
        return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
      default:
        return 'bottom-20 right-6';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[600px]">
        <DialogHeader>
          <DialogTitle>Preview de Posicionamento</DialogTitle>
        </DialogHeader>
        
        <div className="relative bg-gray-100 rounded-lg h-full overflow-hidden">
          {/* Simulação do site */}
          <div className="h-full bg-gradient-to-b from-blue-50 to-white p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Seu Site</h2>
              <p className="text-gray-600">Esta é uma simulação de como o chat aparecerá no seu site</p>
            </div>
          </div>

          {/* Botão flutuante */}
          <div className={`absolute ${getButtonPositionStyles()}`}>
            <Button
              className="w-14 h-14 rounded-full shadow-lg"
              style={{ 
                backgroundColor: flowData?.colors?.primary || '#FF6B35',
                border: 'none'
              }}
            >
              <MessageCircle className="w-6 h-6 text-white" />
            </Button>
          </div>

          {/* Janela do chat (preview) */}
          <div className={`absolute ${getChatPositionStyles()}`}>
            <div className="w-80 h-96 bg-white rounded-lg shadow-xl border flex flex-col opacity-80">
              <div 
                className="p-4 text-white rounded-t-lg"
                style={{ backgroundColor: flowData?.colors?.primary || '#FF6B35' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full"></div>
                  <div>
                    <div className="font-semibold">Atendimento</div>
                    <div className="text-sm opacity-90">Online</div>
                  </div>
                </div>
              </div>
              <div className="flex-1 bg-gray-50 p-4">
                <div className="text-sm text-gray-600">
                  Preview da janela do chat
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PositionPreviewModal;
