
import { applyMask } from '@/utils/inputMasks';

interface ChatPreviewInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder: string;
  type: 'text' | 'email' | 'number' | 'phone';
}

const ChatPreviewInput = ({ value, onChange, onSend, placeholder, type }: ChatPreviewInputProps) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSend();
    }
  };

  return (
    <div className="p-4 border-t bg-white">
      <div className="flex space-x-2">
        <input
          type={type === 'phone' ? 'tel' : type}
          value={value}
          onChange={(e) => {
            const maskedValue = applyMask(e.target.value, type);
            onChange(maskedValue);
          }}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          onClick={onSend}
          className="w-8 h-8 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-all duration-300 hover:scale-110 flex items-center justify-center"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 11L12 6L17 11M12 18V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" transform="rotate(90 12 12)"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatPreviewInput;
