
import { useState } from 'react';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: number;
}

export const useChatLogic = (flowData: any) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [waitingForInput, setWaitingForInput] = useState(false);

  // Processar perguntas do fluxo
  const questions = flowData?.questions ? flowData.questions
    .filter((q: any) => q.type !== 'bot_message')
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

  // Função para substituir variáveis no texto
  const replaceVariables = (text: string, responses: Record<string, string>) => {
    let processedText = text;
    
    // Criar mapeamento de IDs de perguntas para labels mais amigáveis
    const variableMap: Record<string, string> = {};
    
    questions.forEach((question: any) => {
      const questionTitle = question.title.toLowerCase();
      if (questionTitle.includes('nome')) {
        variableMap['#nome'] = responses[question.id] || '';
      } else if (questionTitle.includes('telefone') || questionTitle.includes('celular')) {
        variableMap['#telefone'] = responses[question.id] || '';
      } else if (questionTitle.includes('email') || questionTitle.includes('e-mail')) {
        variableMap['#email'] = responses[question.id] || '';
      } else if (questionTitle.includes('empresa') || questionTitle.includes('company')) {
        variableMap['#empresa'] = responses[question.id] || '';
      }
    });
    
    // Substituir variáveis no texto
    Object.keys(variableMap).forEach(variable => {
      const regex = new RegExp(variable, 'gi');
      processedText = processedText.replace(regex, variableMap[variable]);
    });
    
    return processedText;
  };

  const addMessage = (text: string, isBot: boolean) => {
    // Se for mensagem do bot, processar variáveis
    const processedText = isBot ? replaceVariables(text, responses) : text;
    
    const newMessage = {
      id: Date.now().toString(),
      text: processedText,
      isBot,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const showTypingIndicator = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      if (currentQuestionIndex < questions.length) {
        const question = questions[currentQuestionIndex];
        addMessage(question.title, true);
        setWaitingForInput(true);
      } else {
        setShowCompletion(true);
        addMessage('Obrigado pelas informações! Em breve entraremos em contato.', true);
      }
    }, 1500);
  };

  const handleSendAnswer = (answer: string) => {
    if (!answer.trim() || !waitingForInput) return;

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    setResponses(prev => ({ ...prev, [currentQuestion.id]: answer }));
    
    // Adicionar resposta do usuário
    addMessage(answer, false);
    
    // Próxima pergunta
    setCurrentQuestionIndex(prev => prev + 1);
    setWaitingForInput(false);
    
    // Mostrar próxima pergunta após delay
    if (currentQuestionIndex + 1 < questions.length) {
      setTimeout(() => {
        showTypingIndicator();
      }, 1000);
    } else {
      // Finalizar conversa
      setTimeout(() => {
        setShowCompletion(true);
        const finalMessage = flowData?.final_message || 'Obrigado pelas informações! Em breve entraremos em contato.';
        addMessage(finalMessage, true);
      }, 1000);
    }
  };

  const startConversation = () => {
    if (messages.length === 0 && questions.length > 0) {
      setTimeout(() => {
        addMessage(flowData?.welcome_message || 'Olá! Como posso ajudá-lo hoje?', true);
        setTimeout(() => {
          showTypingIndicator();
        }, 1000);
      }, 500);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return {
    messages,
    isTyping,
    showCompletion,
    waitingForInput,
    responses,
    currentQuestion,
    handleSendAnswer,
    startConversation,
    replaceVariables
  };
};
