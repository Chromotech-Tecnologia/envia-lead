
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
    const positions = {
      'bottom-right': 'bottom: 120px; right: 20px;',
      'bottom-left': 'bottom: 120px; left: 20px;',
      'top-right': 'top: 20px; right: 20px;',
      'top-left': 'top: 20px; left: 20px;',
      'center-right': 'top: 50%; right: 20px; transform: translateY(-50%);',
      'center-left': 'top: 50%; left: 20px; transform: translateY(-50%);'
    };
    return positions[position as keyof typeof positions] || positions['bottom-right'];
  };

  return (
    <button
      onClick={onClick}
      className="w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-white text-2xl transition-transform hover:scale-110 overflow-hidden"
      style={{ 
        background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
        ...Object.fromEntries(getPositionStyles().split('; ').map(s => s.split(': ')))
      }}
    >
      {isOpen ? (
        <X size={24} />
      ) : flowData?.avatar_url ? (
        <img 
          src={flowData.avatar_url} 
          alt="Avatar" 
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        <MessageCircle size={24} />
      )}
    </button>
  );
};

export default ChatButton;
