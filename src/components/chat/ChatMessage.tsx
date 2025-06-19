
import { Bot } from 'lucide-react';

interface ChatMessageProps {
  message: string;
  isBot: boolean;
  time: string;
}

const ChatMessage = ({ message, isBot, time }: ChatMessageProps) => {
  if (isBot) {
    return (
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="bg-white rounded-lg rounded-tl-sm p-3 max-w-xs shadow-sm">
          <p className="text-sm">{message}</p>
          <p className="text-xs text-gray-500 mt-1">{time}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-end">
      <div className="bg-orange-600 text-white rounded-lg rounded-tr-sm p-3 max-w-xs">
        <p className="text-sm">{message}</p>
        <p className="text-xs opacity-70 mt-1">{time} ✓✓</p>
      </div>
    </div>
  );
};

export default ChatMessage;
