
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Smartphone, Monitor } from 'lucide-react';
import { useState } from 'react';
import ChatConversation from './chat/ChatConversation';

interface ChatPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  flowData: any;
  device?: 'desktop' | 'mobile';
}

const ChatPreviewModal = ({ isOpen, onClose, flowData, device = 'desktop' }: ChatPreviewModalProps) => {
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'mobile'>(device);
  const [chatPosition, setChatPosition] = useState({ x: 'right', y: 'bottom' });
  const [buttonPosition, setButtonPosition] = useState({ x: 'right', y: 'bottom' });
  const [isChatOpen, setIsChatOpen] = useState(false);

  const getButtonPositionClasses = () => {
    const xClass = buttonPosition.x === 'right' ? 'right-6' : 'left-6';
    const yClass = buttonPosition.y === 'bottom' ? 'bottom-6' : 
                   buttonPosition.y === 'top' ? 'top-6' : 'top-1/2 -translate-y-1/2';
    return `${xClass} ${yClass}`;
  };

  const getChatPositionClasses = () => {
    const xClass = chatPosition.x === 'right' ? 'right-6' : 'left-6';
    const yClass = chatPosition.y === 'bottom' ? 'bottom-20' : 
                   chatPosition.y === 'top' ? 'top-20' : 'top-1/2 -translate-y-1/2';
    return `${xClass} ${yClass}`;
  };

  const handleSubmitResponses = (responses: any) => {
    console.log('Respostas enviadas:', responses);
    setIsChatOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0">
        <div className="flex h-full">
          {/* Controles laterais */}
          <div className="w-80 border-r bg-gray-50 p-4 overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Preview do Chat</h3>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Seletor de dispositivo */}
              <div>
                <label className="text-sm font-medium mb-2 block">Dispositivo</label>
                <div className="flex gap-2">
                  <Button
                    variant={selectedDevice === 'desktop' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDevice('desktop')}
                  >
                    <Monitor className="w-4 h-4 mr-2" />
                    Desktop
                  </Button>
                  <Button
                    variant={selectedDevice === 'mobile' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDevice('mobile')}
                  >
                    <Smartphone className="w-4 h-4 mr-2" />
                    Mobile
                  </Button>
                </div>
              </div>

              {/* Posição do botão */}
              <div>
                <label className="text-sm font-medium mb-2 block">Posição do Botão</label>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-gray-600">Eixo X:</span>
                    <div className="flex gap-1 mt-1">
                      <Button
                        variant={buttonPosition.x === 'left' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setButtonPosition(prev => ({ ...prev, x: 'left' }))}
                      >
                        Esquerda
                      </Button>
                      <Button
                        variant={buttonPosition.x === 'right' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setButtonPosition(prev => ({ ...prev, x: 'right' }))}
                      >
                        Direita
                      </Button>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600">Eixo Y:</span>
                    <div className="flex gap-1 mt-1">
                      <Button
                        variant={buttonPosition.y === 'top' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setButtonPosition(prev => ({ ...prev, y: 'top' }))}
                      >
                        Topo
                      </Button>
                      <Button
                        variant={buttonPosition.y === 'center' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setButtonPosition(prev => ({ ...prev, y: 'center' }))}
                      >
                        Centro
                      </Button>
                      <Button
                        variant={buttonPosition.y === 'bottom' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setButtonPosition(prev => ({ ...prev, y: 'bottom' }))}
                      >
                        Inferior
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Posição do chat */}
              <div>
                <label className="text-sm font-medium mb-2 block">Posição do Chat</label>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs text-gray-600">Eixo X:</span>
                    <div className="flex gap-1 mt-1">
                      <Button
                        variant={chatPosition.x === 'left' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setChatPosition(prev => ({ ...prev, x: 'left' }))}
                      >
                        Esquerda
                      </Button>
                      <Button
                        variant={chatPosition.x === 'right' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setChatPosition(prev => ({ ...prev, x: 'right' }))}
                      >
                        Direita
                      </Button>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-600">Eixo Y:</span>
                    <div className="flex gap-1 mt-1">
                      <Button
                        variant={chatPosition.y === 'top' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setChatPosition(prev => ({ ...prev, y: 'top' }))}
                      >
                        Topo
                      </Button>
                      <Button
                        variant={chatPosition.y === 'center' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setChatPosition(prev => ({ ...prev, y: 'center' }))}
                      >
                        Centro
                      </Button>
                      <Button
                        variant={chatPosition.y === 'bottom' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setChatPosition(prev => ({ ...prev, y: 'bottom' }))}
                      >
                        Inferior
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Área de preview */}
          <div className="flex-1 relative bg-gradient-to-br from-blue-50 to-purple-50">
            <div className={`${selectedDevice === 'mobile' ? 'max-w-sm mx-auto mt-8' : 'w-full h-full'} relative bg-white ${selectedDevice === 'mobile' ? 'rounded-lg shadow-xl' : ''}`}>
              <div className={`${selectedDevice === 'mobile' ? 'h-[600px]' : 'h-full'} relative overflow-hidden`}>
                {/* Conteúdo simulado da página */}
                <div className="p-8 text-center">
                  <h1 className="text-2xl font-bold mb-4">Página de Exemplo</h1>
                  <p className="text-gray-600 mb-8">Esta é uma simulação de como o chat aparecerá no seu site.</p>
                  <div className="space-y-4 text-left max-w-2xl mx-auto">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>

                {/* Botão flutuante */}
                <div className={`fixed ${getButtonPositionClasses()} z-50`}>
                  <Button
                    onClick={() => setIsChatOpen(!isChatOpen)}
                    className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                    style={{ 
                      backgroundColor: flowData?.colors?.primary || '#3B82F6',
                      border: 'none'
                    }}
                  >
                    {isChatOpen ? (
                      <X className="w-6 h-6 text-white" />
                    ) : (
                      <span className="text-xl">💬</span>
                    )}
                  </Button>
                </div>

                {/* Chat aberto */}
                {isChatOpen && (
                  <div className={`fixed ${getChatPositionClasses()} z-40`}>
                    <div className={`bg-white rounded-lg shadow-xl border ${selectedDevice === 'mobile' ? 'w-80 h-96' : 'w-96 h-[500px]'} flex flex-col`}>
                      {/* Header do chat */}
                      <div 
                        className="p-4 rounded-t-lg text-white flex justify-between items-center"
                        style={{ backgroundColor: flowData?.colors?.primary || '#3B82F6' }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold">A</span>
                          </div>
                          <div>
                            <h4 className="font-semibold">{flowData?.name || 'Chat'}</h4>
                            <p className="text-xs opacity-80">Online</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsChatOpen(false)}
                          className="text-white hover:bg-white/20 h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Conversa */}
                      <ChatConversation 
                        flowData={flowData}
                        onSubmit={handleSubmitResponses}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatPreviewModal;
