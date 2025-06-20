
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone } from 'lucide-react';
import { useState } from 'react';
import ChatPreview from './ChatPreview';

interface ChatPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  flowData: any;
  device: 'desktop' | 'mobile';
}

const ChatPreviewModal = ({ isOpen, onClose, flowData, device: initialDevice }: ChatPreviewModalProps) => {
  const [device, setDevice] = useState<'desktop' | 'mobile'>(initialDevice);
  const [horizontalPosition, setHorizontalPosition] = useState<'left' | 'center' | 'right'>('right');
  const [verticalPosition, setVerticalPosition] = useState<'top' | 'center' | 'bottom'>('bottom');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle>Preview do Chat</DialogTitle>
            <div className="flex items-center gap-4">
              {/* Controles de Posição */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Horizontal:</span>
                <select 
                  value={horizontalPosition} 
                  onChange={(e) => setHorizontalPosition(e.target.value as any)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="left">Esquerda</option>
                  <option value="center">Centro</option>
                  <option value="right">Direita</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Vertical:</span>
                <select 
                  value={verticalPosition} 
                  onChange={(e) => setVerticalPosition(e.target.value as any)}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="top">Topo</option>
                  <option value="center">Centro</option>
                  <option value="bottom">Inferior</option>
                </select>
              </div>
              
              {/* Controles de Dispositivo */}
              <div className="flex items-center gap-2 border rounded-lg p-1">
                <Button
                  variant={device === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDevice('desktop')}
                >
                  <Monitor className="w-4 h-4" />
                </Button>
                <Button
                  variant={device === 'mobile' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDevice('mobile')}
                >
                  <Smartphone className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 p-6 pt-4">
          <div 
            className={`mx-auto border rounded-lg overflow-hidden h-full relative ${
              device === 'mobile' ? 'max-w-sm' : 'max-w-4xl'
            }`}
            style={{ 
              aspectRatio: device === 'mobile' ? '9/16' : '16/9',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            {/* Simulação de Site */}
            <div className="h-full bg-white relative overflow-hidden">
              {/* Header do site simulado */}
              <div className="bg-white border-b p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-600 rounded"></div>
                    <span className="font-semibold">Minha Empresa</span>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>Home</span>
                    <span>Produtos</span>
                    <span>Contato</span>
                  </div>
                </div>
              </div>

              {/* Conteúdo do site simulado */}
              <div className="p-6 space-y-4">
                <h1 className="text-2xl font-bold text-gray-800">
                  Bem-vindo à Nossa Empresa
                </h1>
                <p className="text-gray-600">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-100 p-4 rounded">
                    <h3 className="font-semibold mb-2">Produto 1</h3>
                    <p className="text-sm text-gray-600">
                      Descrição do produto aqui...
                    </p>
                  </div>
                  <div className="bg-gray-100 p-4 rounded">
                    <h3 className="font-semibold mb-2">Produto 2</h3>
                    <p className="text-sm text-gray-600">
                      Descrição do produto aqui...
                    </p>
                  </div>
                </div>
              </div>

              {/* Chat Widget */}
              <div 
                className="absolute"
                style={{
                  [horizontalPosition === 'left' ? 'left' : horizontalPosition === 'right' ? 'right' : 'left']: 
                    horizontalPosition === 'center' ? '50%' : '20px',
                  [verticalPosition === 'top' ? 'top' : verticalPosition === 'bottom' ? 'bottom' : 'top']: 
                    verticalPosition === 'center' ? '50%' : '20px',
                  transform: horizontalPosition === 'center' || verticalPosition === 'center' ? 
                    `translate(${horizontalPosition === 'center' ? '-50%' : '0'}, ${verticalPosition === 'center' ? '-50%' : '0'})` : 
                    'none'
                }}
              >
                <ChatPreview 
                  flowData={flowData} 
                  device={device}
                  position={`${verticalPosition}-${horizontalPosition}`}
                />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatPreviewModal;
