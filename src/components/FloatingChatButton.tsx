import { useState, useEffect } from 'react';
import ChatButton from './chat/ChatButton';
import WelcomeBubble from './chat/WelcomeBubble';
import ChatWindow from './chat/ChatWindow';
import { useChatLogic } from '@/hooks/useChatLogic';

interface FloatingChatButtonProps {
  flowData: any;
  position: string;
  onHidePreview?: () => void;
  isPreview?: boolean;
}

const FloatingChatButton = ({ flowData, position, onHidePreview, isPreview = false }: FloatingChatButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showWelcomeBubble, setShowWelcomeBubble] = useState(true);

  console.log('[FloatingChatButton] FlowData recebido:', flowData);
  console.log('[FloatingChatButton] Position:', position);

  // Usar as cores do fluxo ou padrão
  const colors = flowData?.colors || {
    primary: flowData?.primary_color || '#FF6B35',
    secondary: flowData?.secondary_color || '#3B82F6',
    text: flowData?.text_color || '#1F2937',
    background: '#FFFFFF'
  };

  const {
    messages,
    isTyping,
    showCompletion,
    waitingForInput,
    responses,
    currentQuestion,
    handleSendAnswer,
    startConversation,
    replaceVariables
  } = useChatLogic(flowData);

  const handleOpenChat = () => {
    console.log('[FloatingChatButton] Abrindo chat...');
    setIsOpen(true);
    setShowWelcomeBubble(false);
    startConversation();
  };

  const handleCloseChat = () => {
    console.log('[FloatingChatButton] Fechando chat...');
    setIsOpen(false);
    if (isPreview && onHidePreview) {
      onHidePreview();
    }
  };

  const handleButtonClick = () => {
    console.log('[FloatingChatButton] Botão clicado, isOpen:', isOpen);
    if (isOpen) {
      handleCloseChat();
    } else {
      handleOpenChat();
    }
  };

  return (
    <div 
      className="fixed z-50"
      style={{ 
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        zIndex: 9999
      }}
    >
      {/* Botão flutuante - esconder quando chat está aberto */}
      {!isOpen && (
        <ChatButton
          isOpen={isOpen}
          colors={colors}
          flowData={flowData}
          position={flowData.button_position || position}
          onClick={handleButtonClick}
        />
      )}

      {/* Bolha de boas-vindas */}
      {!isOpen && (
        <WelcomeBubble
          showWelcomeBubble={showWelcomeBubble}
          position={flowData.button_position || position}
          colors={colors}
          flowData={flowData}
          onClose={() => setShowWelcomeBubble(false)}
        />
      )}

      {/* Janela do chat */}
      {isOpen && (
        <ChatWindow
          position={flowData.chat_position || position}
          colors={colors}
          flowData={flowData}
          messages={messages}
          isTyping={isTyping}
          currentQuestion={currentQuestion}
          showCompletion={showCompletion}
          waitingForInput={waitingForInput}
          responses={responses}
          onClose={handleCloseChat}
          onSendAnswer={handleSendAnswer}
          replaceVariables={replaceVariables}
        />
      )}
    </div>
  );
};

export default FloatingChatButton;