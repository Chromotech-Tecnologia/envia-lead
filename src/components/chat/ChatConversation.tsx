
import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Send } from 'lucide-react';

interface Message {
  id: string;
  type: 'bot' | 'user';
  content: string;
  timestamp: Date;
}

interface ChatConversationProps {
  flowData: any;
  onSubmit?: (responses: any) => void;
}

const ChatConversation = ({ flowData, onSubmit }: ChatConversationProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const questions = flowData?.questions || [];

  useEffect(() => {
    // Mensagem inicial
    if (questions.length > 0) {
      setMessages([
        {
          id: 'welcome',
          type: 'bot',
          content: 'Olá! Vou fazer algumas perguntas para te conhecer melhor. 😊',
          timestamp: new Date()
        },
        {
          id: 'question-0',
          type: 'bot',
          content: questions[0]?.title || 'Como posso ajudá-lo?',
          timestamp: new Date()
        }
      ]);
    }
  }, [questions]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendAnswer = () => {
    if (!currentAnswer.trim()) return;

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    // Adicionar resposta do usuário
    const userMessage: Message = {
      id: `user-${currentQuestionIndex}`,
      type: 'user',
      content: currentAnswer,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Salvar resposta
    const newResponses = {
      ...responses,
      [currentQuestion.id]: currentAnswer
    };
    setResponses(newResponses);

    // Próxima pergunta ou finalizar
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      const botMessage: Message = {
        id: `question-${nextIndex}`,
        type: 'bot',
        content: questions[nextIndex].title,
        timestamp: new Date()
      };
      
      setTimeout(() => {
        setMessages(prev => [...prev, botMessage]);
        setCurrentQuestionIndex(nextIndex);
        setCurrentAnswer('');
      }, 1000);
    } else {
      // Finalizar conversa
      const finalMessage: Message = {
        id: 'final',
        type: 'bot',
        content: 'Obrigado pelas respostas! Em breve entraremos em contato. 🎉',
        timestamp: new Date()
      };
      
      setTimeout(() => {
        setMessages(prev => [...prev, finalMessage]);
        onSubmit?.(newResponses);
      }, 1000);
    }

    setCurrentAnswer('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendAnswer();
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const isCompleted = currentQuestionIndex >= questions.length;

  const renderInputField = () => {
    if (isCompleted) return null;

    switch (currentQuestion?.type) {
      case 'textarea':
        return (
          <Textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder={currentQuestion.placeholder || 'Digite sua resposta...'}
            onKeyPress={handleKeyPress}
            className="min-h-[80px]"
          />
        );
      
      case 'radio':
        return (
          <RadioGroup value={currentAnswer} onValueChange={setCurrentAnswer}>
            {currentQuestion.options?.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );
      
      default:
        return (
          <Input
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder={currentQuestion?.placeholder || 'Digite sua resposta...'}
            onKeyPress={handleKeyPress}
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Área de mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-80">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-gray-100 text-gray-800 rounded-bl-none'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {message.timestamp.toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Área de input */}
      {!isCompleted && (
        <div className="border-t p-4 space-y-3">
          {renderInputField()}
          
          {currentQuestion?.type !== 'radio' && (
            <div className="flex justify-end">
              <Button
                onClick={handleSendAnswer}
                disabled={!currentAnswer.trim()}
                size="sm"
                style={{ backgroundColor: flowData?.colors?.primary || '#3B82F6' }}
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatConversation;
