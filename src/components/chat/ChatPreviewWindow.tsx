
import { X } from 'lucide-react';


interface ChatPreviewWindowProps {
  device: 'desktop' | 'mobile';
  onClose: () => void;
  children: React.ReactNode;
  flowData: any;
  position?: string;
}

const ChatPreviewWindow = ({ device, onClose, children, flowData, position = 'bottom-right' }: ChatPreviewWindowProps) => {
  // Determinar posição para o chat baseado na posição do botão
  const getPositionClasses = () => {
    const isBottom = position.includes('bottom');
    const isRight = position.includes('right');
    
    let classes = 'fixed ';
    
    if (isBottom) {
      classes += 'bottom-24 ';
    } else {
      classes += 'top-24 ';
    }
    
    if (isRight) {
      classes += 'right-6 ';
    } else {
      classes += 'left-6 ';
    }
    
    return classes;
  };

  return (
    <div className={`${getPositionClasses()} bg-white rounded-lg shadow-xl border flex flex-col overflow-hidden z-50 ${
      device === 'mobile' ? 'w-80 h-96' : 'w-96 h-[500px]'
    }`}>
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-sm overflow-hidden">
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
            <div className="font-semibold text-sm">Atendimento</div>
            <div className="text-xs opacity-90 flex items-center gap-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              Online agora
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
      {children}
    </div>
  );
};

export default ChatPreviewWindow;
