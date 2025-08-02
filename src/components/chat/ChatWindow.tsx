
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
  replaceVariables?: (text: string, responses: Record<string, string>) => string;
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
  onSendAnswer,
  replaceVariables 
}: ChatWindowProps) => {
  const getChatWindowPosition = () => {
    const offsetX = flowData?.chat_offset_x || 0;
    const offsetY = flowData?.chat_offset_y || 0;
    
    const positions = {
      'bottom-right': { bottom: `${100 + offsetY}px`, right: `${20 + offsetX}px` },
      'bottom-left': { bottom: `${100 + offsetY}px`, left: `${20 + offsetX}px` },
      'bottom-center': { bottom: `${100 + offsetY}px`, left: '50%', transform: `translateX(calc(-50% + ${offsetX}px))` },
      'top-right': { top: `${90 + offsetY}px`, right: `${20 + offsetX}px` },
      'top-left': { top: `${90 + offsetY}px`, left: `${20 + offsetX}px` },
      'top-center': { top: `${90 + offsetY}px`, left: '50%', transform: `translateX(calc(-50% + ${offsetX}px))` },
      'center-right': { top: '50%', right: `${100 + offsetX}px`, transform: `translateY(calc(-50% + ${offsetY}px))` },
      'center-left': { top: '50%', left: `${100 + offsetX}px`, transform: `translateY(calc(-50% + ${offsetY}px))` },
      'center-center': { top: '50%', left: '50%', transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))` }
    };
    return positions[position as keyof typeof positions] || positions['bottom-right'];
  };

  const chatWidth = flowData?.chat_width || 320;
  const chatHeight = flowData?.chat_height || 400;

  return (
    <div
      className="fixed bg-white rounded-lg shadow-xl flex flex-col overflow-hidden z-40"
      style={{
        width: `${chatWidth}px`,
        height: `${chatHeight}px`,
        ...getChatWindowPosition()
      }}
    >
      {/* Header */}
      <div 
        className="p-4 flex items-center justify-between"
        style={{ 
          background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
          color: colors.headerText || '#FFFFFF'
        }}
      >
        <div className="flex items-center space-x-3">
          {flowData?.avatar_url ? (
            // Check if it's an emoji (single character that's not a URL)
            flowData.avatar_url.length <= 2 && !flowData.avatar_url.startsWith('http') ? (
              <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center" style={{ fontSize: '20px' }}>
                {flowData.avatar_url}
              </div>
            ) : (
              <img 
                src={flowData.avatar_url} 
                alt="Avatar" 
                className="w-8 h-8 rounded-full object-cover" 
                onError={(e) => {
                  console.error('Erro ao carregar avatar do chat:', flowData.avatar_url);
                  e.currentTarget.style.display = 'none';
                }}
              />
            )
          ) : (
            <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-sm">
              👤
            </div>
          )}
          <div>
            <div className="font-semibold text-sm">{flowData?.attendant_name || 'Atendimento'}</div>
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
      <div 
        className="flex-1 p-4 overflow-y-auto"
        style={{ backgroundColor: colors.background || '#F9FAFB' }}
      >
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
        replaceVariables={replaceVariables}
      />
    </div>
  );
};

export default ChatWindow;
