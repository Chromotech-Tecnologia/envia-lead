
import { X } from 'lucide-react';


interface ChatPreviewWindowProps {
  device: 'desktop' | 'mobile';
  onClose: () => void;
  children: React.ReactNode;
  flowData: any;
  position?: string;
}

const ChatPreviewWindow = ({ device, onClose, children, flowData, position = 'bottom-right' }: ChatPreviewWindowProps) => {
  return (
    <div className={`bg-white rounded-lg shadow-xl border flex flex-col overflow-hidden ${
      device === 'mobile' ? 'w-80 h-96' : 'w-96 h-[500px]'
    }`}>
      <div 
        className="flex items-center justify-between p-4 border-b text-white"
        style={{
          background: `linear-gradient(45deg, ${flowData?.colors?.primary || '#FF6B35'}, ${flowData?.colors?.secondary || '#3B82F6'})`
        }}
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-sm overflow-hidden">
            {flowData?.avatar_url ? (
              flowData.avatar_url.startsWith('http') || flowData.avatar_url.startsWith('blob:') ? (
                <img 
                  src={flowData.avatar_url} 
                  alt="Avatar" 
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-sm">{flowData.avatar_url}</span>
              )
            ) : (
              '👤'
            )}
          </div>
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
      {children}
    </div>
  );
};

export default ChatPreviewWindow;
