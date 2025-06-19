
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Send, Phone, Mail, User, MessageCircle } from 'lucide-react';

interface ChatPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  flowData: any;
  device: 'desktop' | 'mobile';
}

const ChatPreviewModal = ({ isOpen, onClose, flowData, device }: ChatPreviewModalProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [inputValue, setInputValue] = useState('');

  const questions = flowData?.questions || [];
  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    if (isOpen) {
      setCurrentQuestionIndex(0);
      setResponses({});
      setShowWelcome(true);
      setInputValue('');
    }
  }, [isOpen]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    if (showWelcome) {
      setShowWelcome(false);
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
      }, 1500);
      setInputValue('');
      return;
    }

    if (currentQuestion) {
      setResponses(prev => ({
        ...prev,
        [currentQuestion.id]: inputValue
      }));

      setInputValue('');
      
      if (currentQuestionIndex < questions.length - 1) {
        setIsTyping(true);
        setTimeout(() => {
          setCurrentQuestionIndex(prev => prev + 1);
          setIsTyping(false);
        }, 1500);
      } else {
        // Finalizar chat
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          // Aqui poderia mostrar uma mensagem de finalização
        }, 1500);
      }
    }
  };

  const getQuestionIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'text': return <User className="w-4 h-4" />;
      default: return <MessageCircle className="w-4 h-4" />;
    }
  };

  const containerClass = device === 'mobile' 
    ? "w-80 h-[600px]" 
    : "w-96 h-[700px]";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${containerClass} p-0 max-w-none`}>
        <div className="flex flex-col h-full bg-white rounded-lg overflow-hidden">
          {/* Header do Chat */}
          <div 
            className="p-4 text-white flex items-center justify-between"
            style={{ backgroundColor: flowData?.colors?.primary || '#FF6B35' }}
          >
            <div className="flex items-center gap-3">
              {flowData?.avatar ? (
                <img 
                  src={flowData.avatar} 
                  alt="Avatar" 
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: flowData?.colors?.secondary || '#3B82F6' }}
                >
                  AL
                </div>
              )}
              <div>
                <h3 className="font-semibold">Atendimento</h3>
                <p className="text-xs opacity-80">Online</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Área de Mensagens */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">
            {/* Mensagem de boas-vindas */}
            <div className="flex items-start gap-2">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: flowData?.colors?.primary || '#FF6B35' }}
              >
                A
              </div>
              <div 
                className="max-w-[80%] p-3 rounded-lg text-sm"
                style={{ backgroundColor: 'white' }}
              >
                {showWelcome ? (
                  "Olá! 👋 Como posso te ajudar hoje?"
                ) : (
                  currentQuestion ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getQuestionIcon(currentQuestion.type)}
                        <span className="font-medium">{currentQuestion.title}</span>
                        {currentQuestion.required && (
                          <Badge variant="destructive" className="text-xs">
                            Obrigatório
                          </Badge>
                        )}
                      </div>
                    </div>
                  ) : (
                    "Obrigado pelas informações! Em breve entraremos em contato. 🎉"
                  )
                )}
              </div>
            </div>

            {/* Respostas do usuário */}
            {Object.entries(responses).map(([questionId, response]) => {
              const question = questions.find((q: any) => q.id.toString() === questionId);
              return (
                <div key={questionId} className="flex justify-end">
                  <div 
                    className="max-w-[80%] p-3 rounded-lg text-sm text-white"
                    style={{ backgroundColor: flowData?.colors?.secondary || '#3B82F6' }}
                  >
                    {response}
                  </div>
                </div>
              );
            })}

            {/* Indicador de digitação */}
            {isTyping && (
              <div className="flex items-start gap-2">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ backgroundColor: flowData?.colors?.primary || '#FF6B35' }}
                >
                  A
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input de Mensagem */}
          <div className="p-4 border-t bg-white">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  showWelcome 
                    ? "Digite sua mensagem..." 
                    : currentQuestion?.placeholder || "Digite sua resposta..."
                }
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                size="sm"
                className="envia-lead-gradient hover:opacity-90"
                disabled={!inputValue.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChatPreviewModal;
