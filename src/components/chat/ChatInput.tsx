
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder: string;
  type?: 'text' | 'email' | 'number';
}

const ChatInput = ({ value, onChange, onSend, placeholder, type = 'text' }: ChatInputProps) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (type === 'number') {
      const numericValue = e.target.value.replace(/\D/g, '');
      onChange(numericValue);
    } else {
      onChange(e.target.value);
    }
  };

  return (
    <div className="p-4 border-t bg-white">
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          onKeyPress={handleKeyPress}
          className="rounded-full"
        />
        <Button 
          onClick={onSend} 
          size="sm"
          className="rounded-full envia-lead-gradient hover:opacity-90"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
