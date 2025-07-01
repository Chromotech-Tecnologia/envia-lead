
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle } from 'lucide-react';

interface PositionPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  flowData: any;
}

const PositionPreviewModal = ({ isOpen, onClose, flowData }: PositionPreviewModalProps) => {
  const getButtonPositionClasses = () => {
    const position = flowData.buttonPosition || 'bottom-right';
    const classes = {
      'top-left': 'top-6 left-6',
      'top-center': 'top-6 left-1/2 -translate-x-1/2',
      'top-right': 'top-6 right-6',
      'center-left': 'top-1/2 left-6 -translate-y-1/2',
      'center-center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
      'center-right': 'top-1/2 right-6 -translate-y-1/2',
      'bottom-left': 'bottom-6 left-6',
      'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
      'bottom-right': 'bottom-6 right-6'
    };
    return classes[position as keyof typeof classes] || classes['bottom-right'];
  };

  const getChatPositionClasses = () => {
    const position = flowData.chatPosition || 'bottom-right';
    const classes = {
      'top-left': 'top-20 left-6',
      'top-center': 'top-20 left-1/2 -translate-x-1/2',
      'top-right': 'top-20 right-6',
      'center-left': 'top-1/2 left-20 -translate-y-1/2',
      'center-center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
      'center-right': 'top-1/2 right-20 -translate-y-1/2',
      'bottom-left': 'bottom-20 left-6',
      'bottom-center': 'bottom-20 left-1/2 -translate-x-1/2',
      'bottom-right': 'bottom-20 right-6'
    };
    return classes[position as keyof typeof classes] || classes['bottom-right'];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[700px]">
        <DialogHeader>
          <DialogTitle>Preview de Posicionamento</DialogTitle>
        </DialogHeader>
        
        <div className="relative bg-gray-100 rounded-lg h-full overflow-hidden">
          {/* Simulação do site */}
          <div className="h-full bg-gradient-to-b from-blue-50 to-white p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Seu Site</h2>
              <p className="text-gray-600 mb-4">
                Simulação de como o chat aparecerá no seu site
              </p>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="bg-white p-3 rounded shadow">
                  <strong>Botão:</strong> {flowData.buttonPosition || 'bottom-right'}
                </div>
                <div className="bg-white p-3 rounded shadow">
                  <strong>Chat:</strong> {flowData.chatPosition || 'bottom-right'}
                </div>
              </div>
            </div>
          </div>

          {/* Botão flutuante */}
          <div className={`absolute ${getButtonPositionClasses()}`}>
            <Button
              className="w-14 h-14 rounded-full shadow-lg"
              style={{ 
                backgroundColor: flowData?.colors?.primary || '#FF6B35',
                border: 'none'
              }}
            >
              {flowData?.avatar_url ? (
                <img 
                  src={flowData.avatar_url} 
                  alt="Avatar" 
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <MessageCircle className="w-6 h-6 text-white" />
              )}
            </Button>
          </div>

          {/* Janela do chat (preview) */}
          <div className={`absolute ${getChatPositionClasses()}`}>
            <div className="w-80 h-96 bg-white rounded-lg shadow-xl border flex flex-col">
              <div 
                className="p-4 text-white rounded-t-lg"
                style={{ 
                  background: `linear-gradient(45deg, ${flowData?.colors?.primary || '#FF6B35'}, ${flowData?.colors?.secondary || '#3B82F6'})` 
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    {flowData?.avatar_url ? (
                      <img 
                        src={flowData.avatar_url} 
                        alt="Avatar" 
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      '👤'
                    )}
                  </div>
                  <div>
                    <div className="font-semibold">{flowData?.name || 'Atendimento'}</div>
                    <div className="text-sm opacity-90">Online</div>
                  </div>
                </div>
              </div>
              <div className="flex-1 bg-gray-50 p-4 flex items-center justify-center">
                <div className="text-sm text-gray-600 text-center">
                  <div className="mb-2">Preview da janela do chat</div>
                  <div className="text-xs">
                    {flowData.questions?.length || 0} pergunta(s) configurada(s)
                  </div>
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
