
import { Button } from "@/components/ui/button";
import { Phone } from 'lucide-react';
import ChatMessage from './ChatMessage';

interface ChatEndMessageProps {
  flowData?: any;
  onResetChat: () => void;
}

const ChatEndMessage = ({ flowData, onResetChat }: ChatEndMessageProps) => {
  return (
    <div className="space-y-4">
      <ChatMessage
        message="Perfeito! Recebi todas as suas informações. Em breve nossa equipe entrará em contato! 🎉"
        isBot={true}
        time="09:05"
      />
      
      {flowData?.showWhatsappButton !== false && flowData?.whatsapp && (
        <div className="text-center">
          <Button 
            onClick={onResetChat}
            className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
          >
            <Phone className="w-4 h-4" />
            Conversar no WhatsApp
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChatEndMessage;
