
import { useState } from 'react';
import ChatMessage from './chat/ChatMessage';
import ChatPreviewInput from './chat/ChatPreviewInput';
import ChatQuestionsList from './chat/ChatQuestionsList';
import ChatEndMessage from './chat/ChatEndMessage';
import { useChatPreview } from '@/hooks/useChatPreview';
import { defaultQuestions } from '@/data/defaultQuestions';
import { MessageCircle, X } from 'lucide-react';

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

  // Aplicar configurações de posição e tamanho
  const getButtonPosition = () => {
    const basePosition = flowData?.button_position || 'bottom-right';
    const offsetX = flowData?.button_offset_x || 0;
    const offsetY = flowData?.button_offset_y || 0;
    
    const positions = {
      'bottom-right': { bottom: `${20 + offsetY}px`, right: `${20 + offsetX}px` },
      'bottom-left': { bottom: `${20 + offsetY}px`, left: `${20 + offsetX}px` },
      'bottom-center': { bottom: `${20 + offsetY}px`, left: '50%', transform: `translateX(calc(-50% + ${offsetX}px))` },
      'top-right': { top: `${20 + offsetY}px`, right: `${20 + offsetX}px` },
      'top-left': { top: `${20 + offsetY}px`, left: `${20 + offsetX}px` },
      'top-center': { top: `${20 + offsetY}px`, left: '50%', transform: `translateX(calc(-50% + ${offsetX}px))` },
    };
    
    return positions[basePosition as keyof typeof positions] || positions['bottom-right'];
  };

  const getChatPosition = () => {
    const basePosition = flowData?.chat_position || 'bottom-right';
    const offsetX = flowData?.chat_offset_x || 0;
    const offsetY = flowData?.chat_offset_y || 0;
    
    const positions = {
      'bottom-right': { bottom: `${80 + offsetY}px`, right: `${20 + offsetX}px` },
      'bottom-left': { bottom: `${80 + offsetY}px`, left: `${20 + offsetX}px` },
      'bottom-center': { bottom: `${80 + offsetY}px`, left: '50%', transform: `translateX(calc(-50% + ${offsetX}px))` },
      'top-right': { top: `${80 + offsetY}px`, right: `${20 + offsetX}px` },
      'top-left': { top: `${80 + offsetY}px`, left: `${20 + offsetX}px` },
      'top-center': { top: `${80 + offsetY}px`, left: '50%', transform: `translateX(calc(-50% + ${offsetX}px))` },
    };
    
    return positions[basePosition as keyof typeof positions] || positions['bottom-right'];
  };

  const buttonSize = flowData?.button_size || 60;
  const chatWidth = flowData?.chat_width || 400;
  const chatHeight = flowData?.chat_height || 500;

  return (
    <div className="relative w-full h-full">
      {/* Botão Flutuante */}
      <button
        className="fixed rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center z-50"
        style={{
          ...getButtonPosition(),
          width: `${buttonSize}px`,
          height: `${buttonSize}px`,
          backgroundColor: flowData?.colors?.primary || '#FF6B35',
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {flowData?.button_avatar_url ? (
          <img src={flowData.button_avatar_url} alt="Chat" className="w-full h-full rounded-full object-cover" />
        ) : (
          <MessageCircle className="text-white" size={buttonSize * 0.4} />
        )}
      </button>

      {/* Janela do Chat */}
      {isOpen && (
        <div
          className="fixed bg-white rounded-lg shadow-xl flex flex-col overflow-hidden z-40"
          style={{
            ...getChatPosition(),
            width: `${chatWidth}px`,
            height: `${chatHeight}px`,
          }}
        >
          {/* Header */}
          <div 
            className="p-4 flex items-center justify-between"
            style={{ 
              background: `linear-gradient(45deg, ${flowData?.colors?.primary || '#FF6B35'}, ${flowData?.colors?.secondary || '#3B82F6'})`,
              color: flowData?.colors?.headerText || '#FFFFFF'
            }}
          >
            <div className="flex items-center space-x-3">
              {flowData?.avatar_url ? (
                <img src={flowData.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-sm">
                  👤
                </div>
              )}
              <div>
                <div className="font-semibold text-sm">{flowData?.attendant_name || 'Atendimento'}</div>
                <div className="text-xs opacity-90 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Online agora
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div 
            className="flex-1 p-4 overflow-y-auto space-y-4"
            style={{ backgroundColor: flowData?.colors?.background || '#F9FAFB' }}
          >
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

          {/* Input */}
          {currentStep < defaultQuestions.length && defaultQuestions[currentStep]?.type !== 'single' && (
            <ChatPreviewInput
              value={inputValue}
              onChange={setInputValue}
              onSend={handleSendText}
              placeholder={defaultQuestions[currentStep]?.placeholder || 'Digite sua resposta...'}
              type={defaultQuestions[currentStep]?.type as 'text' | 'email' | 'number'}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ChatPreview;
