
import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare,
  X,
  Send,
  User,
  Bot
} from 'lucide-react';

interface ChatPreviewProps {
  device: 'desktop' | 'mobile';
}

const ChatPreview = ({ device }: ChatPreviewProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [inputValue, setInputValue] = useState('');

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
      type: 'single',
      title: 'Qual o seu orçamento aproximado?',
      options: ['Até R$ 1.000', 'R$ 1.000 - R$ 5.000', 'R$ 5.000 - R$ 10.000', 'Acima de R$ 10.000']
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
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setInputValue('');
      }, 500);
    } else {
      // Finalizar conversa
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 500);
    }
  };

  const handleSendText = () => {
    if (inputValue.trim()) {
      handleResponse(inputValue.trim());
    }
  };

  const resetChat = () => {
    setCurrentStep(0);
    setResponses({});
    setInputValue('');
    setIsOpen(false);
  };

  const containerClass = device === 'mobile' 
    ? 'w-full max-w-sm mx-auto' 
    : 'w-full max-w-md mx-auto';

  const chatBubbleClass = device === 'mobile'
    ? 'fixed bottom-4 right-4 w-14 h-14'
    : 'fixed bottom-6 right-6 w-16 h-16';

  const chatWindowClass = device === 'mobile'
    ? 'fixed bottom-20 right-4 w-80 h-96'
    : 'fixed bottom-24 right-6 w-96 h-[500px]';

  return (
    <div className={`${containerClass} relative h-96 bg-gray-50 rounded-lg overflow-hidden border-2 border-dashed border-gray-300`}>
      {/* Simulação da página */}
      <div className="p-6 h-full">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Preview - {device === 'mobile' ? 'Mobile' : 'Desktop'}</h3>
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

        {/* Chat Bubble */}
        <div className={chatBubbleClass}>
          <Button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full h-full rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <MessageSquare className="w-6 h-6 text-white" />
            )}
          </Button>
        </div>

        {/* Chat Window */}
        {isOpen && (
          <div className={`${chatWindowClass} bg-white rounded-lg shadow-xl border flex flex-col`}>
            {/* Header */}
            <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Assistente Virtual</p>
                  <p className="text-xs opacity-90">Online agora</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-blue-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {/* Welcome message */}
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-3 h-3 text-white" />
                </div>
                <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                  <p className="text-sm">Olá! Sou seu assistente virtual. Vou te ajudar a encontrar a melhor solução para você! 😊</p>
                </div>
              </div>

              {/* Questions and responses */}
              {questions.slice(0, currentStep + 1).map((question, index) => (
                <div key={question.id} className="space-y-2">
                  {/* Bot question */}
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                      <p className="text-sm">{question.title}</p>
                    </div>
                  </div>

                  {/* User response */}
                  {responses[index] && (
                    <div className="flex justify-end">
                      <div className="bg-blue-600 text-white rounded-lg p-3 max-w-xs">
                        <p className="text-sm">{responses[index]}</p>
                      </div>
                    </div>
                  )}

                  {/* Options for current question */}
                  {index === currentStep && question.type === 'single' && !responses[index] && (
                    <div className="space-y-2 ml-8">
                      {question.options?.map((option, optIndex) => (
                        <Button
                          key={optIndex}
                          variant="outline"
                          size="sm"
                          className="block w-fit"
                          onClick={() => handleResponse(option)}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Final message */}
              {currentStep >= questions.length && (
                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3 h-3 text-white" />
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                      <p className="text-sm">Perfeito! Recebi todas as suas informações. Em breve nossa equipe entrará em contato! 🎉</p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <Button 
                      onClick={resetChat}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Conversar no WhatsApp
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            {currentStep < questions.length && questions[currentStep]?.type !== 'single' && (
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={questions[currentStep]?.placeholder || 'Digite sua resposta...'}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
                  />
                  <Button onClick={handleSendText} size="sm">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPreview;
