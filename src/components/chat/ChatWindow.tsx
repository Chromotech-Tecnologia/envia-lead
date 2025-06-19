
import { ReactNode } from 'react';
import ChatHeader from './ChatHeader';

interface ChatWindowProps {
  flowData?: any;
  device?: 'desktop' | 'mobile';
  onClose?: () => void;
  children?: ReactNode;
}

const ChatWindow = ({ flowData, device = 'desktop', onClose, children }: ChatWindowProps) => {
  const chatWindowClass = device === 'mobile'
    ? 'fixed bottom-20 right-4 w-80 h-96 z-40'
    : 'fixed bottom-24 right-6 w-96 h-[500px] z-40';

  return (
    <div className={`${chatWindowClass} bg-white rounded-lg shadow-xl border flex flex-col`}>
      <ChatHeader onClose={onClose} />
      <div className="flex-1 p-4">
        {children || (
          <div className="text-gray-600">
            Olá! Como posso ajudá-lo hoje?
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
