
import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  X,
  Send,
  Bot,
  Phone
} from 'lucide-react';

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
      // Finalizar conversa
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
      
      // Validação para campo numérico
      if (currentQuestion?.type === 'number') {
        const numericValue = inputValue.replace(/\D/g, '');
        if (!numericValue) {
          return; // Não envia se não for um número válido
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

  const chatBubbleClass = device === 'mobile'
    ? 'fixed bottom-4 right-4 w-14 h-14 z-50'
    : 'fixed bottom-6 right-6 w-16 h-16 z-50';

  const chatWindowClass = device === 'mobile'
    ? 'fixed bottom-20 right-4 w-80 h-96 z-40'
    : 'fixed bottom-24 right-6 w-96 h-[500px] z-40';

  return (
    <div className={`${containerClass} relative h-96 bg-gray-50 rounded-lg overflow-hidden border-2 border-dashed border-gray-300`}>
      {/* Simulação da página */}
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

        {/* Chat Bubble */}
        <div className={chatBubbleClass}>
          <Button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full h-full rounded-full envia-lead-gradient hover:opacity-90 shadow-lg border-0"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-white" />
            ) : (
              <Bot className="w-6 h-6 text-white" />
            )}
          </Button>
        </div>

        {/* Chat Window */}
        {isOpen && (
          <div className={`${chatWindowClass} bg-white rounded-lg shadow-xl border flex flex-col`}>
            {/* Header estilo WhatsApp */}
            <div className="envia-lead-gradient text-white p-4 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Assistente Envia Lead</p>
                  <p className="text-xs opacity-90 flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    Online agora
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
              {/* Welcome message */}
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white rounded-lg rounded-tl-sm p-3 max-w-xs shadow-sm">
                  <p className="text-sm">Olá! Sou seu assistente virtual da Envia Lead. Vou te ajudar a encontrar a melhor solução para você! 😊</p>
                  <p className="text-xs text-gray-500 mt-1">09:00</p>
                </div>
              </div>

              {/* Questions and responses */}
              {questions.slice(0, currentStep + 1).map((question, index) => (
                <div key={question.id} className="space-y-3">
                  {/* Bot question */}
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white rounded-lg rounded-tl-sm p-3 max-w-xs shadow-sm">
                      <p className="text-sm">{question.title}</p>
                      <p className="text-xs text-gray-500 mt-1">09:0{index + 1}</p>
                    </div>
                  </div>

                  {/* User response */}
                  {responses[index] && (
                    <div className="flex justify-end">
                      <div className="bg-purple-600 text-white rounded-lg rounded-tr-sm p-3 max-w-xs">
                        <p className="text-sm">{responses[index]}</p>
                        <p className="text-xs opacity-70 mt-1">09:0{index + 1} ✓✓</p>
                      </div>
                    </div>
                  )}

                  {/* Options for current question */}
                  {index === currentStep && question.type === 'single' && !responses[index] && (
                    <div className="space-y-2 ml-10">
                      {question.options?.map((option, optIndex) => (
                        <Button
                          key={optIndex}
                          variant="outline"
                          size="sm"
                          className="block w-fit text-purple-600 border-purple-200 hover:bg-purple-50"
                          onClick={() => handleResponse(option)}
                        >
                          {option}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white rounded-lg rounded-tl-sm p-3 max-w-xs shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Final message */}
              {currentStep >= questions.length && (
                <div className="space-y-4">
                  <div className="flex items-start gap-2">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white rounded-lg rounded-tl-sm p-3 max-w-xs shadow-sm">
                      <p className="text-sm">Perfeito! Recebi todas as suas informações. Em breve nossa equipe entrará em contato! 🎉</p>
                      <p className="text-xs text-gray-500 mt-1">09:05</p>
                    </div>
                  </div>
                  
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

            {/* Input */}
            {currentStep < questions.length && questions[currentStep]?.type !== 'single' && (
              <div className="p-4 border-t bg-white">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => {
                      const currentQuestion = questions[currentStep];
                      if (currentQuestion?.type === 'number') {
                        // Permite apenas números
                        const numericValue = e.target.value.replace(/\D/g, '');
                        setInputValue(numericValue);
                      } else {
                        setInputValue(e.target.value);
                      }
                    }}
                    placeholder={questions[currentStep]?.placeholder || 'Digite sua resposta...'}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendText()}
                    className="rounded-full"
                  />
                  <Button 
                    onClick={handleSendText} 
                    size="sm"
                    className="rounded-full envia-lead-gradient hover:opacity-90"
                  >
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
