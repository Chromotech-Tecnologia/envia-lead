
import { useState, useCallback, useEffect } from 'react';

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

  // Processar perguntas e mensagens do bot do fluxo
  const allItems = flowData?.questions ? flowData.questions
    .map((q: any) => ({
      id: q.id,
      type: q.type,
      title: q.title,
      placeholder: q.placeholder,
      required: q.required,
      order: q.order_index || q.order || 0,
      options: q.options || []
    }))
    .sort((a: any, b: any) => a.order - b.order) : [];

  console.log('[ChatLogic] FlowData recebido:', flowData);
  console.log('[ChatLogic] Todas as perguntas processadas:', allItems);

  // Separar perguntas e mensagens do bot
  const questions = allItems.filter((item: any) => item.type !== 'bot_message');
  const botMessages = allItems.filter((item: any) => item.type === 'bot_message');

  console.log('[ChatLogic] Perguntas filtradas:', questions);
  console.log('[ChatLogic] Mensagens do bot:', botMessages);
  console.log('[ChatLogic] Índice atual da pergunta:', currentQuestionIndex);

  // Função melhorada para substituir variáveis no texto
  const replaceVariables = (text: string, responses: Record<string, string>) => {
    let processedText = text;
    
    // Criar mapeamento de IDs de perguntas para labels mais amigáveis
    const variableMap: Record<string, string> = {};
    
    questions.forEach((question: any, index: number) => {
      const questionTitle = question.title.toLowerCase();
      const answer = responses[question.id] || '';
      
      // Primeiro, verificar se há variable_name definido
      if (question.variable_name) {
        variableMap[`#${question.variable_name}`] = answer;
      }
      
      // Mapear variáveis baseadas no conteúdo da pergunta (fallback)
      if (questionTitle.includes('nome')) {
        variableMap['#nome'] = answer;
        variableMap['#name'] = answer;
      }
      if (questionTitle.includes('telefone') || questionTitle.includes('celular')) {
        variableMap['#telefone'] = answer;
        variableMap['#phone'] = answer;
      }
      if (questionTitle.includes('email') || questionTitle.includes('e-mail')) {
        variableMap['#email'] = answer;
      }
      if (questionTitle.includes('empresa') || questionTitle.includes('company')) {
        variableMap['#empresa'] = answer;
        variableMap['#company'] = answer;
      }
      if (questionTitle.includes('cidade') || questionTitle.includes('city')) {
        variableMap['#cidade'] = answer;
        variableMap['#city'] = answer;
      }
      
      // Mapear também por posição para templates genéricos
      variableMap[`#resposta${index + 1}`] = answer;
      variableMap[`#answer${index + 1}`] = answer;
    });
    
    // Substituir as variáveis no texto
    Object.keys(variableMap).forEach(variable => {
      if (variableMap[variable]) {
        const regex = new RegExp(variable, 'gi');
        processedText = processedText.replace(regex, variableMap[variable]);
      }
    });
    
    console.log('[ChatLogic] Texto original:', text);
    console.log('[ChatLogic] Variáveis mapeadas:', variableMap);
    console.log('[ChatLogic] Texto processado:', processedText);
    
    return processedText;
  };

  const addMessage = useCallback((text: string, isBot: boolean) => {
    // Se for mensagem do bot, processar variáveis
    const processedText = isBot ? replaceVariables(text, responses) : text;
    
    const newMessage = {
      id: Date.now().toString(),
      text: processedText,
      isBot,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, newMessage]);
  }, [responses, questions]);

  const showTypingIndicator = useCallback(() => {
    setIsTyping(true);
    console.log('[ChatLogic] showTypingIndicator - currentQuestionIndex:', currentQuestionIndex);
    console.log('[ChatLogic] showTypingIndicator - questions.length:', questions.length);
    
    setTimeout(() => {
      setIsTyping(false);
      
      // Capturar o índice atual no momento da execução
      setCurrentQuestionIndex(currentIndex => {
        console.log('[ChatLogic] showTypingIndicator - índice capturado:', currentIndex);
        
        if (currentIndex < questions.length) {
          const question = questions[currentIndex];
          console.log('[ChatLogic] Pergunta atual a ser exibida:', question);
          if (question) {
            setTimeout(() => {
              addMessage(question.title, true);
              setWaitingForInput(true);
            }, 100);
          }
        } else {
          console.log('[ChatLogic] Finalizando conversa - mostrando mensagem final');
          const finalMessage = flowData?.final_message_custom || flowData?.final_message || 'Obrigado pelas informações! Em breve entraremos em contato.';
          setTimeout(() => {
            addMessage(finalMessage, true);
            setShowCompletion(true);
          }, 100);
        }
        
        return currentIndex;
      });
    }, 1500);
  }, [questions, flowData, addMessage]);

  const handleSendAnswer = useCallback((answer: string) => {
    if (!answer.trim() || !waitingForInput) return;

    setCurrentQuestionIndex(currentIndex => {
      const currentQuestion = questions[currentIndex];
      console.log('[ChatLogic] handleSendAnswer - currentQuestionIndex:', currentIndex);
      console.log('[ChatLogic] handleSendAnswer - currentQuestion:', currentQuestion);
      console.log('[ChatLogic] handleSendAnswer - answer:', answer);
      
      if (!currentQuestion) return currentIndex;

      // Atualizar respostas com nova resposta
      setResponses(prevResponses => {
        const newResponses = { ...prevResponses, [currentQuestion.id]: answer };
        return newResponses;
      });
      
      // Adicionar resposta do usuário
      addMessage(answer, false);
      
      const nextIndex = currentIndex + 1;
      console.log('[ChatLogic] Atualizando índice de', currentIndex, 'para', nextIndex);
      console.log('[ChatLogic] Verificando próxima pergunta - nextIndex:', nextIndex, 'questions.length:', questions.length);
      
      setWaitingForInput(false);
      
      // Verificar se há mensagens de bot antes da próxima pergunta
      if (nextIndex < questions.length) {
        // Procurar mensagens de bot na sequência
        const nextQuestion = questions[nextIndex];
        const botMessages = allItems.filter(item => 
          item.type === 'bot_message' && 
          item.order > (currentQuestion.order || 0) &&
          item.order < (nextQuestion?.order || Infinity)
        );
        
        let delay = 1000;
        
        if (botMessages.length > 0) {
          // Mostrar mensagens de bot primeiro
          botMessages.forEach((botMsg, index) => {
            setTimeout(() => {
              setIsTyping(true);
              setTimeout(() => {
                setIsTyping(false);
                addMessage(botMsg.title, true);
                
                // Se é a última mensagem bot, mostrar próxima pergunta
                if (index === botMessages.length - 1) {
                  setTimeout(() => {
                    showTypingIndicator();
                  }, 1000);
                }
              }, 1500);
            }, delay);
            delay += 3000;
          });
        } else {
          // Não há mensagens de bot, mostrar próxima pergunta diretamente
          setTimeout(() => {
            showTypingIndicator();
          }, 1000);
        }
      } else {
        // Finalizar conversa
        console.log('[ChatLogic] Finalizando conversa na handleSendAnswer');
        setTimeout(() => {
          const finalMessage = flowData?.final_message_custom || flowData?.final_message || 'Obrigado pelas informações! Em breve entraremos em contato.';
          addMessage(finalMessage, true);
          setShowCompletion(true);
        }, 1000);
      }
      
      return nextIndex;
    });
  }, [questions, allItems, flowData, waitingForInput, addMessage, showTypingIndicator]);

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
