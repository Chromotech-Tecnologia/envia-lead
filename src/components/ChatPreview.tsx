
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Phone } from 'lucide-react';
import ChatBubble from './chat/ChatBubble';
import ChatWindow from './chat/ChatWindow';
import ChatMessage from './chat/ChatMessage';
import ChatInput from './chat/ChatInput';
import TypingIndicator from './chat/TypingIndicator';

interface ChatPreviewProps {
  device: 'desktop' | 'mobile';
}

const ChatPreview = ({ device }: ChatPreviewProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const questions = [
    {
      id: 1,
      type: 'text',
      title: 'Olá! 👋 Qual é o seu nome?',
      placeholder: 'Digite seu nome completo'
    },
    {
      id: 2,
      type: 'email',
      title: 'Perfeito! Agora preciso do seu e-mail:',
      placeholder: 'seu@email.com'
    },
    {
      id: 3,
      type: 'single',
      title: 'Qual produto te interessa mais?',
      options: ['Produto Premium', 'Produto Básico', 'Consultoria', 'Suporte']
    },
    {
      id: 4,
      type: 'number',
      title: 'Qual o seu orçamento aproximado?',
      placeholder: 'Digite apenas números (ex: 5000)'
    },
    {
      id: 5,
      type: 'text',
      title: 'Perfeito! Há algo específico que gostaria de saber?',
      placeholder: 'Descreva suas dúvidas ou necessidades'
    }
  ];

  const handleResponse = (response: string) => {
    setResponses(prev => ({ ...prev, [currentStep]: response }));
    
    if (currentStep < questions.length - 1) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setCurrentStep(prev => prev + 1);
        setInputValue('');
      }, 1500);
    } else {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setCurrentStep(prev => prev + 1);
      }, 1500);
    }
  };

  const handleSendText = () => {
    if (inputValue.trim()) {
      const currentQuestion = questions[currentStep];
      
      if (currentQuestion?.type === 'number') {
        const numericValue = inputValue.replace(/\D/g, '');
        if (!numericValue) {
          return;
        }
        handleResponse(numericValue);
      } else {
        handleResponse(inputValue.trim());
      }
    }
  };

  const resetChat = () => {
    setCurrentStep(0);
    setResponses({});
    setInputValue('');
    setIsOpen(false);
    setIsTyping(false);
  };

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

        <ChatBubble 
          isOpen={isOpen}
          onClick={() => setIsOpen(!isOpen)}
          device={device}
        />

        {isOpen && (
          <ChatWindow device={device} onClose={() => setIsOpen(false)}>
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
              <ChatMessage
                message="Olá! Sou seu assistente virtual da Envia Lead. Vou te ajudar a encontrar a melhor solução para você! 😊"
                isBot={true}
                time="09:00"
              />

              {questions.slice(0, currentStep + 1).map((question, index) => (
                <div key={question.id} className="space-y-3">
                  <ChatMessage
                    message={question.title}
                    isBot={true}
                    time={`09:0${index + 1}`}
                  />

                  {responses[index] && (
                    <ChatMessage
                      message={responses[index]}
                      isBot={false}
                      time={`09:0${index + 1}`}
                    />
                  )}

                  {index === currentStep && question.type === 'single' && !responses[index] && (
                    <div className="space-y-2 ml-10">
                      {question.options?.map((option, optIndex) => (
                        <Button
                          key={optIndex}
                          variant="outline"
                          size="sm"
                          className="block w-fit text-orange-600 border-orange-200 hover:bg-orange-50"
                          onClick={() => handleResponse(option)}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isTyping && <TypingIndicator />}

              {currentStep >= questions.length && (
                <div className="space-y-4">
                  <ChatMessage
                    message="Perfeito! Recebi todas as suas informações. Em breve nossa equipe entrará em contato! 🎉"
                    isBot={true}
                    time="09:05"
                  />
                  
                  <div className="text-center">
                    <Button 
                      onClick={resetChat}
                      className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                    >
                      <Phone className="w-4 h-4" />
                      Conversar no WhatsApp
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {currentStep < questions.length && questions[currentStep]?.type !== 'single' && (
              <ChatInput
                value={inputValue}
                onChange={setInputValue}
                onSend={handleSendText}
                placeholder={questions[currentStep]?.placeholder || 'Digite sua resposta...'}
                type={questions[currentStep]?.type as 'text' | 'email' | 'number'}
              />
            )}
          </ChatWindow>
        )}
      </div>
    </div>
  );
};

export default ChatPreview;
