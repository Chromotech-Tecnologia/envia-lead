
import ChatBubble from './chat/ChatBubble';
import ChatWindow from './chat/ChatWindow';
import ChatMessage from './chat/ChatMessage';
import ChatInput from './chat/ChatInput';
import ChatPreviewContainer from './chat/ChatPreviewContainer';
import ChatQuestionsList from './chat/ChatQuestionsList';
import ChatEndMessage from './chat/ChatEndMessage';
import { useChatPreview } from '@/hooks/useChatPreview';
import { defaultQuestions } from '@/data/defaultQuestions';

interface ChatPreviewProps {
  device: 'desktop' | 'mobile';
  flowData?: any;
  position?: string;
}

const ChatPreview = ({ device, flowData, position }: ChatPreviewProps) => {
  const {
    isOpen,
    setIsOpen,
    currentStep,
    responses,
    inputValue,
    setInputValue,
    isTyping,
    handleResponse,
    handleSendText,
    resetChat
  } = useChatPreview();

  return (
    <ChatPreviewContainer device={device}>
      <ChatBubble 
        isOpen={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        device={device}
      />

      {isOpen && (
        <ChatWindow device={device} onClose={() => setIsOpen(false)}>
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
            <ChatMessage
              message={flowData?.welcomeMessage || "Olá! Sou seu assistente virtual da Envia Lead. Vou te ajudar a encontrar a melhor solução para você! 😊"}
              isBot={true}
              time="09:00"
            />

            <ChatQuestionsList
              currentStep={currentStep}
              responses={responses}
              isTyping={isTyping}
              onResponse={handleResponse}
            />

            {currentStep >= defaultQuestions.length && (
              <ChatEndMessage
                flowData={flowData}
                onResetChat={resetChat}
              />
            )}
          </div>

          {currentStep < defaultQuestions.length && defaultQuestions[currentStep]?.type !== 'single' && (
            <ChatInput
              value={inputValue}
              onChange={setInputValue}
              onSend={handleSendText}
              placeholder={defaultQuestions[currentStep]?.placeholder || 'Digite sua resposta...'}
              type={defaultQuestions[currentStep]?.type as 'text' | 'email' | 'number'}
            />
          )}
        </ChatWindow>
      )}
    </ChatPreviewContainer>
  );
};

export default ChatPreview;
