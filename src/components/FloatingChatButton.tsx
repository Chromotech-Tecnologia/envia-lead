
import { useState, useEffect } from 'react';
import { X, MessageCircle } from 'lucide-react';

interface FloatingChatButtonProps {
  flowData: any;
  position: string;
  onHidePreview?: () => void;
  isPreview?: boolean;
}

const FloatingChatButton = ({ flowData, position, onHidePreview, isPreview = false }: FloatingChatButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<Array<{id: string, text: string, isBot: boolean, timestamp: number}>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showWelcomeBubble, setShowWelcomeBubble] = useState(true);

  console.log('[FloatingChatButton] FlowData recebido:', flowData);

  // Usar as cores do fluxo ou padrão
  const colors = flowData?.colors || {
    primary: flowData?.primary_color || '#FF6B35',
    secondary: flowData?.secondary_color || '#3B82F6',
    text: flowData?.text_color || '#1F2937',
    background: '#FFFFFF'
  };

  // Processar perguntas do fluxo
  const questions = flowData?.questions ? flowData.questions
    .filter((q: any) => q.type !== 'bot_message') // Filtrar mensagens do bot para evitar duplicação
    .map((q: any) => ({
      id: q.id,
      type: q.type,
      title: q.title,
      placeholder: q.placeholder,
      required: q.required,
      order: q.order_index || 0,
      options: q.options || []
    }))
    .sort((a: any, b: any) => a.order - b.order) : [];

  console.log('[FloatingChatButton] Perguntas processadas:', questions);

  const getPositionStyles = () => {
    const positions = {
      'bottom-right': 'bottom: 30px; right: 20px;',
      'bottom-left': 'bottom: 30px; left: 20px;',
      'top-right': 'top: 20px; right: 20px;',
      'top-left': 'top: 20px; left: 20px;',
      'center-right': 'top: 50%; right: 20px; transform: translateY(-50%);',
      'center-left': 'top: 50%; left: 20px; transform: translateY(-50%);'
    };
    return positions[position as keyof typeof positions] || positions['bottom-right'];
  };

  const getChatWindowPosition = () => {
    const positions = {
      'bottom-right': 'bottom: 100px; right: 20px;',
      'bottom-left': 'bottom: 100px; left: 20px;',
      'top-right': 'top: 90px; right: 20px;',
      'top-left': 'top: 90px; left: 20px;',
      'center-right': 'top: 50%; right: 90px; transform: translateY(-50%);',
      'center-left': 'top: 50%; left: 90px; transform: translateY(-50%);'
    };
    return positions[position as keyof typeof positions] || positions['bottom-right'];
  };

  const getWelcomeBubblePosition = () => {
    // Posicionar a bolha no lado oposto ao botão
    if (position.includes('right')) {
      return 'bottom: 70px; right: 0; left: auto;';
    } else if (position.includes('left')) {
      return 'bottom: 70px; left: 0; right: auto;';
    }
    return 'bottom: 70px; right: 0; left: auto;';
  };

  const addMessage = (text: string, isBot: boolean) => {
    const newMessage = {
      id: Date.now().toString(),
      text,
      isBot,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const showTypingIndicator = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      showNextQuestion();
    }, 1500);
  };

  const showNextQuestion = () => {
    if (currentQuestionIndex >= questions.length) {
      setShowCompletion(true);
      addMessage('Obrigado pelas informações! Em breve entraremos em contato.', true);
      
      // Mostrar WhatsApp se configurado
      if (flowData?.whatsapp && flowData?.show_whatsapp_button !== false) {
        setTimeout(() => {
          // WhatsApp será mostrado no renderQuestionInput
        }, 2000);
      }
      return;
    }

    const question = questions[currentQuestionIndex];
    addMessage(question.title, true);
  };

  const handleSendAnswer = (answer: string) => {
    if (!answer.trim()) return;

    const currentQuestion = questions[currentQuestionIndex];
    setResponses(prev => ({ ...prev, [currentQuestion.id]: answer }));
    
    // Adicionar resposta do usuário
    addMessage(answer, false);
    
    // Próxima pergunta
    setCurrentQuestionIndex(prev => prev + 1);
  };

  // Effect para mostrar próxima pergunta quando currentQuestionIndex muda
  useEffect(() => {
    if (isOpen && currentQuestionIndex < questions.length && messages.length > 0) {
      const timer = setTimeout(() => {
        showTypingIndicator();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentQuestionIndex, isOpen, messages.length]);

  const handleOpenChat = () => {
    setIsOpen(true);
    setShowWelcomeBubble(false);
    
    // Iniciar conversa com primeira pergunta
    if (currentQuestionIndex === 0 && questions.length > 0) {
      setTimeout(() => {
        addMessage(flowData?.welcome_message || 'Olá! Como posso ajudá-lo hoje?', true);
        setTimeout(() => {
          showTypingIndicator();
        }, 1000);
      }, 500);
    }
  };

  const handleCloseChat = () => {
    setIsOpen(false);
    if (isPreview && onHidePreview) {
      onHidePreview();
    }
  };

  const renderQuestionInput = () => {
    if (showCompletion) {
      return (
        <div className="p-4 text-center space-y-3">
          <p className="text-green-600 font-medium">Conversão realizada com sucesso!</p>
          {flowData?.whatsapp && flowData?.show_whatsapp_button !== false && (
            <button 
              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
              onClick={() => {
                let messageText = 'Olá! Gostaria de continuar nossa conversa. Aqui estão minhas informações:\n\n';
                questions.forEach((q: any) => {
                  if (responses[q.id]) {
                    messageText += `${q.title}: ${responses[q.id]}\n`;
                  }
                });
                const whatsappNumber = flowData.whatsapp.replace(/\D/g, '');
                const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageText)}`;
                window.open(whatsappUrl, '_blank');
              }}
            >
              💬 Continuar no WhatsApp
            </button>
          )}
        </div>
      );
    }

    if (currentQuestionIndex >= questions.length || isTyping) {
      return null;
    }

    const currentQuestion = questions[currentQuestionIndex];
    
    if (!currentQuestion) return null;

    return (
      <div className="p-4 border-t">
        <div className="space-y-3">
          {currentQuestion.type === 'select' ? (
            <select 
              className="w-full p-2 border rounded-lg"
              onChange={(e) => handleSendAnswer(e.target.value)}
              style={{ borderColor: colors.primary }}
            >
              <option value="">Selecione uma opção...</option>
              {currentQuestion.options?.map((option: string, idx: number) => (
                <option key={idx} value={option}>{option}</option>
              ))}
            </select>
          ) : currentQuestion.type === 'radio' ? (
            <div className="space-y-2">
              {currentQuestion.options?.map((option: string, idx: number) => (
                <label key={idx} className="flex items-center p-2 border rounded cursor-pointer hover:bg-gray-50">
                  <input 
                    type="radio" 
                    name="preview-radio" 
                    value={option}
                    onChange={(e) => handleSendAnswer(e.target.value)}
                    className="mr-2"
                  />
                  {option}
                </label>
              ))}
            </div>
          ) : (
            <div className="flex space-x-2">
              <input
                type={currentQuestion.type}
                placeholder={currentQuestion.placeholder || "Digite sua resposta..."}
                className="flex-1 p-2 border rounded-lg"
                style={{ borderColor: colors.primary }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSendAnswer((e.target as HTMLInputElement).value);
                    (e.target as HTMLInputElement).value = '';
                  }
                }}
              />
              <button
                onClick={() => {
                  const input = document.querySelector('input') as HTMLInputElement;
                  if (input) {
                    handleSendAnswer(input.value);
                    input.value = '';
                  }
                }}
                className="px-4 py-2 text-white rounded-lg transition-colors"
                style={{ 
                  background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})` 
                }}
              >
                Enviar
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMessages = () => {
    return (
      <>
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} mb-3`}>
            <div 
              className="max-w-xs px-3 py-2 rounded-lg text-sm"
              style={message.isBot ? { 
                backgroundColor: 'white',
                color: colors.text,
                border: '1px solid #e5e7eb',
                borderRadius: '18px 18px 18px 4px'
              } : {
                background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`,
                color: 'white',
                borderRadius: '18px 18px 4px 18px'
              }}
            >
              {message.text}
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start mb-3">
            <div 
              className="px-3 py-2 rounded-lg text-sm flex items-center space-x-1"
              style={{ 
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '18px 18px 18px 4px'
              }}
            >
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div 
      className="fixed z-50"
      style={{ 
        ...Object.fromEntries(getPositionStyles().split('; ').map(s => s.split(': '))),
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Botão flutuante */}
      <button
        onClick={() => isOpen ? handleCloseChat() : handleOpenChat()}
        className="w-16 h-16 rounded-full shadow-lg flex items-center justify-center text-white text-2xl transition-transform hover:scale-110 overflow-hidden"
        style={{ 
          background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})` 
        }}
      >
        {isOpen ? (
          <X size={24} />
        ) : flowData?.avatar_url ? (
          <img 
            src={flowData.avatar_url} 
            alt="Avatar" 
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <MessageCircle size={24} />
        )}
      </button>

      {/* Bolha de boas-vindas */}
      {!isOpen && showWelcomeBubble && (
        <div 
          className="absolute p-4 bg-white border rounded-lg shadow-lg min-w-60 max-w-80"
          style={{ 
            ...Object.fromEntries(getWelcomeBubblePosition().split('; ').map(s => s.split(': '))),
            borderColor: '#e5e7eb',
            color: colors.text,
            wordWrap: 'break-word'
          }}
        >
          <button 
            onClick={() => setShowWelcomeBubble(false)}
            className="absolute -top-2 -right-2 w-5 h-5 bg-gray-200 rounded-full text-xs flex items-center justify-center hover:bg-gray-300"
          >
            ×
          </button>
          <p className="text-sm m-0 pr-4">
            {flowData?.welcome_message || 'Olá! Como posso ajudá-lo hoje?'}
          </p>
        </div>
      )}

      {/* Janela do chat */}
      {isOpen && (
        <div
          className="absolute w-80 h-96 bg-white rounded-lg shadow-xl flex flex-col overflow-hidden"
          style={{ 
            ...Object.fromEntries(getChatWindowPosition().split('; ').map(s => s.split(': ')))
          }}
        >
          {/* Header */}
          <div 
            className="p-4 text-white flex items-center justify-between"
            style={{ 
              background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})` 
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
                <div className="font-semibold text-sm">{flowData?.name || 'Atendimento'}</div>
                <div className="text-xs opacity-90 flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Online agora
                </div>
              </div>
            </div>
            <button
              onClick={handleCloseChat}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Mensagens */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {renderMessages()}
          </div>

          {/* Input */}
          {renderQuestionInput()}
        </div>
      )}
    </div>
  );
};

export default FloatingChatButton;
