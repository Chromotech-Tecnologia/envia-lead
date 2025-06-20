
import { ReactNode } from 'react';

interface ChatPreviewContainerProps {
  device: 'desktop' | 'mobile';
  children: ReactNode;
}

const ChatPreviewContainer = ({ device, children }: ChatPreviewContainerProps) => {
  const containerClass = device === 'mobile' 
    ? 'w-full max-w-sm mx-auto' 
    : 'w-full max-w-md mx-auto';

  return (
    <div className={`${containerClass} relative h-96 bg-gray-50 rounded-lg overflow-hidden border-2 border-dashed border-gray-300`}>
      <div className="p-6 h-full relative">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2 envia-lead-text-gradient">
            Preview - {device === 'mobile' ? 'Mobile' : 'Desktop'}
          </h3>
          <p className="text-gray-600 text-sm">
            Visualização de como o chat aparecerá no seu site
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-8 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>

        {children}
      </div>
    </div>
  );
};

export default ChatPreviewContainer;
