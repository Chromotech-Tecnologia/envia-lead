
import { X } from 'lucide-react';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: number;
}

interface ChatWindowProps {
  position: string;
  colors: any;
  flowData: any;
  messages: Message[];
  isTyping: boolean;
  currentQuestion: any;
  showCompletion: boolean;
  waitingForInput: boolean;
  responses: Record<string, string>;
  onClose: () => void;
  onSendAnswer: (answer: string) => void;
}

const ChatWindow = ({ 
  position, 
  colors, 
  flowData, 
  messages, 
  isTyping, 
  currentQuestion, 
  showCompletion, 
  waitingForInput, 
  responses, 
  onClose, 
  onSendAnswer 
}: ChatWindowProps) => {
  const getChatWindowPosition = () => {
    const positions = {
      'bottom-right': 'bottom: 190px; right: 20px;',
      'bottom-left': 'bottom: 190px; left: 20px;',
      'top-right': 'top: 90px; right: 20px;',
      'top-left': 'top: 90px; left: 20px;',
      'center-right': 'top: 50%; right: 90px; transform: translateY(-50%);',
      'center-left': 'top: 50%; left: 90px; transform: translateY(-50%);'
    };
    return positions[position as keyof typeof positions] || positions['bottom-right'];
  };

  return (
    <div
      className="absolute w-80 h-96 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden"
      style={{ 
        ...Object.fromEntries(getChatWindowPosition().split('; ').map(s => s.split(': ')))
      }}
    >
      {/* Header */}
      <div 
        className="p-4 text-white flex items-center justify-between"
        style={{ 
          background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})` 
        }}
      >
        <div className="flex items-center space-x-3">
          {flowData?.avatar_url ? (
            <img src={flowData.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-sm">
              👤
            </div>
          )}
          <div>
            <div className="font-semibold text-sm">{flowData?.name || 'Atendimento'}</div>
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

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        <ChatMessages messages={messages} colors={colors} isTyping={isTyping} />
      </div>

      {/* Input */}
      <ChatInput
        currentQuestion={currentQuestion}
        colors={colors}
        flowData={flowData}
        showCompletion={showCompletion}
        waitingForInput={waitingForInput}
        isTyping={isTyping}
        responses={responses}
        onSendAnswer={onSendAnswer}
      />
    </div>
  );
};

export default ChatWindow;
