
import { Button } from "@/components/ui/button";
import { X, Bot } from 'lucide-react';

interface ChatHeaderProps {
  onClose: () => void;
}

const ChatHeader = ({ onClose }: ChatHeaderProps) => {
  return (
    <div className="envia-lead-gradient text-white p-4 rounded-t-lg flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
          <Bot className="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <p className="font-medium">Assistente Envia Lead</p>
          <p className="text-xs opacity-90 flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            Online agora
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="text-white hover:bg-white/20"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default ChatHeader;
