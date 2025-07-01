
interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: number;
}

interface ChatMessagesProps {
  messages: Message[];
  colors: any;
  isTyping: boolean;
}

const ChatMessages = ({ messages, colors, isTyping }: ChatMessagesProps) => {
  return (
    <>
      {messages.map((message) => (
        <div key={message.id} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} mb-3`}>
          <div 
            className="max-w-xs px-3 py-2 rounded-lg text-sm"
            style={message.isBot ? { 
              backgroundColor: 'white',
              color: colors.text,
              border: '1px solid #e5e7eb',
              borderRadius: '18px 18px 18px 4px'
            } : {
              background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
              color: 'white',
              borderRadius: '18px 18px 4px 18px'
            }}
          >
            {message.text}
          </div>
        </div>
      ))}
      
      {isTyping && (
        <div className="flex justify-start mb-3">
          <div 
            className="px-3 py-2 rounded-lg text-sm flex items-center space-x-1"
            style={{ 
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '18px 18px 18px 4px'
            }}
          >
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatMessages;
