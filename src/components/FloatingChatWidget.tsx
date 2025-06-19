
import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface FloatingChatWidgetProps {
  flowData: any;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

const FloatingChatWidget = ({ flowData, position = 'bottom-right' }: FloatingChatWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'top-right':
        return 'top-6 right-6';
      case 'top-left':
        return 'top-6 left-6';
      default:
        return 'bottom-6 right-6';
    }
  };

  return (
    <div className={`fixed ${getPositionClasses()} z-50`}>
      {!isOpen ? (
        <Button
          onClick={() => setIsOpen(true)}
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
          style={{ backgroundColor: flowData.colors?.primary || '#FF6B35' }}
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      ) : (
        <div className="bg-white rounded-lg shadow-2xl border w-80 h-96 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
            <h3 className="font-semibold">{flowData.name || 'Chat'}</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              <div className="bg-gray-100 p-3 rounded-lg">
                <p className="text-sm text-gray-700">
                  Olá! Como posso ajudá-lo hoje?
                </p>
              </div>
              {flowData.questions && flowData.questions[0] && (
                <div className="bg-gray-100 p-3 rounded-lg">
                  <p className="text-sm text-gray-700 mb-2">
                    {flowData.questions[0].title}
                  </p>
                  <input
                    type="text"
                    placeholder={flowData.questions[0].placeholder}
                    className="w-full p-2 border rounded text-sm"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FloatingChatWidget;
