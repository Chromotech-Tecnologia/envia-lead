
import { X, MessageCircle } from 'lucide-react';

interface ChatButtonProps {
  isOpen: boolean;
  colors: any;
  flowData: any;
  position: string;
  onClick: () => void;
}

const ChatButton = ({ isOpen, colors, flowData, position, onClick }: ChatButtonProps) => {
  const getPositionStyles = () => {
    const offsetX = flowData?.button_offset_x || 0;
    const offsetY = flowData?.button_offset_y || 0;
    
    const positions = {
      'bottom-right': { bottom: `${30 + offsetY}px`, right: `${20 + offsetX}px` },
      'bottom-left': { bottom: `${30 + offsetY}px`, left: `${20 + offsetX}px` },
      'bottom-center': { bottom: `${30 + offsetY}px`, left: '50%', transform: `translateX(calc(-50% + ${offsetX}px))` },
      'top-right': { top: `${20 + offsetY}px`, right: `${20 + offsetX}px` },
      'top-left': { top: `${20 + offsetY}px`, left: `${20 + offsetX}px` },
      'top-center': { top: `${20 + offsetY}px`, left: '50%', transform: `translateX(calc(-50% + ${offsetX}px))` },
      'center-right': { top: '50%', right: `${20 + offsetX}px`, transform: `translateY(calc(-50% + ${offsetY}px))` },
      'center-left': { top: '50%', left: `${20 + offsetX}px`, transform: `translateY(calc(-50% + ${offsetY}px))` },
      'center-center': { top: '50%', left: '50%', transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))` }
    };
    return positions[position as keyof typeof positions] || positions['bottom-right'];
  };

  const buttonSize = flowData?.button_size || 64;

  return (
    <button
      onClick={onClick}
      className="fixed rounded-full shadow-lg flex items-center justify-center text-white transition-transform hover:scale-110 overflow-hidden z-50"
      style={{ 
        background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
        width: `${buttonSize}px`,
        height: `${buttonSize}px`,
        ...getPositionStyles()
      }}
    >
      {isOpen ? (
        <X size={Math.min(24, buttonSize * 0.4)} />
      ) : flowData?.button_avatar_url ? (
        // Check if it's an emoji (single character that's not a URL)
        flowData.button_avatar_url.length <= 2 && !flowData.button_avatar_url.startsWith('http') ? (
          <span style={{ fontSize: `${buttonSize * 0.5}px` }}>{flowData.button_avatar_url}</span>
        ) : (
          <img 
            src={flowData.button_avatar_url} 
            alt="Avatar" 
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              console.error('Erro ao carregar avatar do botão:', flowData.button_avatar_url);
              e.currentTarget.style.display = 'none';
            }}
          />
        )
      ) : (
        <MessageCircle size={Math.min(24, buttonSize * 0.4)} />
      )}
    </button>
  );
};

export default ChatButton;
