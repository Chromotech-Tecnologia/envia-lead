
import { ReactNode } from 'react';
import ChatHeader from './ChatHeader';

interface ChatWindowProps {
  device: 'desktop' | 'mobile';
  onClose: () => void;
  children: ReactNode;
}

const ChatWindow = ({ device, onClose, children }: ChatWindowProps) => {
  const chatWindowClass = device === 'mobile'
    ? 'fixed bottom-20 right-4 w-80 h-96 z-40'
    : 'fixed bottom-24 right-6 w-96 h-[500px] z-40';

  return (
    <div className={`${chatWindowClass} bg-white rounded-lg shadow-xl border flex flex-col`}>
      <ChatHeader onClose={onClose} />
      {children}
    </div>
  );
};

export default ChatWindow;
