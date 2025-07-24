
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
      return 'bottom: 80px; right: 80px; left: auto; max-width: 250px; width: max-content;';
    } else if (position.includes('left')) {
      return 'bottom: 80px; left: 80px; right: auto; max-width: 250px; width: max-content;';
    }
    return 'bottom: 80px; right: 80px; left: auto; max-width: 250px; width: max-content;';
  };

  if (!showWelcomeBubble) return null;

  return (
    <div 
      className="absolute p-4 bg-white border rounded-lg shadow-lg"
      style={{ 
        ...Object.fromEntries(getWelcomeBubblePosition().split('; ').map(s => s.split(': '))),
        borderColor: '#e5e7eb',
        color: colors.text,
        wordWrap: 'break-word'
      }}
    >
      <button 
        onClick={onClose}
        className="absolute -top-2 -right-2 w-5 h-5 bg-gray-200 rounded-full text-xs flex items-center justify-center hover:bg-gray-300"
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
