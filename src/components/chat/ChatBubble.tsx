
import { Button } from "@/components/ui/button";
import { X, Bot } from 'lucide-react';

interface ChatBubbleProps {
  isOpen: boolean;
  onClick: () => void;
  device: 'desktop' | 'mobile';
}

const ChatBubble = ({ isOpen, onClick, device }: ChatBubbleProps) => {
  const chatBubbleClass = device === 'mobile'
    ? 'fixed bottom-4 right-4 w-14 h-14 z-50'
    : 'fixed bottom-6 right-6 w-16 h-16 z-50';

  return (
    <div className={chatBubbleClass}>
      <Button
        onClick={onClick}
        className="w-full h-full rounded-full envia-lead-gradient hover:opacity-90 shadow-lg border-0"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <Bot className="w-6 h-6 text-white" />
        )}
      </Button>
    </div>
  );
};

export default ChatBubble;
