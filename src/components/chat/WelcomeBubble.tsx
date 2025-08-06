
interface WelcomeBubbleProps {
  showWelcomeBubble: boolean;
  position: string;
  colors: any;
  flowData: any;
  onClose: () => void;
}

const WelcomeBubble = ({ showWelcomeBubble, position, colors, flowData, onClose }: WelcomeBubbleProps) => {
  const getWelcomeBubblePosition = () => {
    if (position.includes('right')) {
      return { bottom: '80px', right: '80px', left: 'auto', maxWidth: '250px', width: 'max-content' };
    } else if (position.includes('left')) {
      return { bottom: '80px', left: '80px', right: 'auto', maxWidth: '250px', width: 'max-content' };
    } else if (position.includes('center')) {
      return { bottom: '80px', left: '50%', transform: 'translateX(-50%)', right: 'auto', maxWidth: '250px', width: 'max-content' };
    }
    return { bottom: '80px', right: '80px', left: 'auto', maxWidth: '250px', width: 'max-content' };
  };

  if (!showWelcomeBubble) return null;

  return (
    <div 
      className="fixed p-4 bg-white border rounded-lg shadow-lg z-40"
      style={{ 
        ...getWelcomeBubblePosition(),
        borderColor: '#e5e7eb',
        color: colors.text || '#374151',
        wordWrap: 'break-word'
      }}
    >
      <button 
        onClick={onClose}
        className="absolute -top-2 -right-2 w-5 h-5 bg-gray-200 rounded-full text-xs flex items-center justify-center hover:bg-gray-300 transition-colors"
        title="Fechar"
      >
        ×
      </button>
      <p className="text-sm m-0 pr-4">
        {flowData?.welcome_message || 'Olá! Como posso ajudá-lo hoje?'}
      </p>
    </div>
  );
};

export default WelcomeBubble;
