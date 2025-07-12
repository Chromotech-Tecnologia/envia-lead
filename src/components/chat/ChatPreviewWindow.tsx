
import { X } from 'lucide-react';

interface ChatPreviewWindowProps {
  device: 'desktop' | 'mobile';
  onClose: () => void;
  children: React.ReactNode;
}

const ChatPreviewWindow = ({ device, onClose, children }: ChatPreviewWindowProps) => {
  return (
    <div className={`bg-white rounded-lg shadow-xl border flex flex-col overflow-hidden ${
      device === 'mobile' ? 'w-80 h-96' : 'w-96 h-[500px]'
    }`}>
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-sm">
            {/* Avatar será adicionado posteriormente com props */}
            👤
          </div>
          <div>
            <div className="font-semibold text-sm">Atendimento</div>
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
      {children}
    </div>
  );
};

export default ChatPreviewWindow;
