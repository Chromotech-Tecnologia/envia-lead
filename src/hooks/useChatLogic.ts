import { useState, useCallback, useRef, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: number;
}

export const useChatLogic = (flowData: any) => {
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const responsesRef = useRef<Record<string, string>>({});
  const currentItemIndexRef = useRef(0);

  // Unified sorted list of all items (questions + bot_messages)
  const allItems = flowData?.questions ? flowData.questions
    .map((q: any) => ({
      id: q.id,
      type: q.type,
      title: q.title,
      placeholder: q.placeholder,
      required: q.required,
      order: q.order_index || q.order || 0,
      options: q.options || [],
      variable_name: q.variable_name
    }))
    .sort((a: any, b: any) => a.order - b.order) : [];

  // Keep allItems in a ref for stable access in timeouts
  const allItemsRef = useRef(allItems);
  allItemsRef.current = allItems;

  // Only questions (for variable mapping)
  const allQuestions = allItems.filter((item: any) => item.type !== 'bot_message');
  const allQuestionsRef = useRef(allQuestions);
  allQuestionsRef.current = allQuestions;

  // Replace variables in text
  const replaceVariables = useCallback((text: string, currentResponses: Record<string, string>) => {
    let processedText = text;
    const variableMap: Record<string, string> = {};

    allQuestionsRef.current.forEach((question: any, index: number) => {
      const questionTitle = question.title.toLowerCase();
      const answer = currentResponses[question.id] || '';

      if (question.variable_name) {
        variableMap[`#${question.variable_name}`] = answer;
      }

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

      variableMap[`#resposta${index + 1}`] = answer;
      variableMap[`#answer${index + 1}`] = answer;
    });

    Object.keys(variableMap).forEach(variable => {
      if (variableMap[variable]) {
        const escaped = variable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escaped, 'gi');
        processedText = processedText.replace(regex, variableMap[variable]);
      }
    });

    return processedText;
  }, []);

  const addMessage = useCallback((text: string, isBot: boolean, currentResponses?: Record<string, string>) => {
    const processedText = isBot ? replaceVariables(text, currentResponses || responsesRef.current) : text;
    const newMessage = {
      id: Date.now().toString() + Math.random(),
      text: processedText,
      isBot,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, newMessage]);
  }, [replaceVariables]);

  // Use a ref for processItem so setTimeout always calls the latest version
  const processItemRef = useRef<(itemIndex: number) => void>(() => {});

  processItemRef.current = (itemIndex: number) => {
    const items = allItemsRef.current;
    
    console.log('[useChatLogic] processItem called, index:', itemIndex, 'total items:', items.length);
    
    if (itemIndex >= items.length) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const finalMessage = flowData?.final_message_custom || flowData?.final_message || flowData?.finalMessage || 'Obrigado pelas informações! Em breve entraremos em contato.';
        addMessage(finalMessage, true);
        setShowCompletion(true);
      }, 1500);
      return;
    }

    const item = items[itemIndex];
    console.log('[useChatLogic] Processing item:', item.type, item.title);

    if (item.type === 'bot_message') {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addMessage(item.title, true);
        const nextIndex = itemIndex + 1;
        currentItemIndexRef.current = nextIndex;
        setCurrentItemIndex(nextIndex);
        setTimeout(() => {
          processItemRef.current(nextIndex);
        }, 800);
      }, 1500);
    } else {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addMessage(item.title, true);
        setWaitingForInput(true);
      }, 1500);
    }
  };

  const handleSendAnswer = useCallback((answer: string) => {
    if (!answer.trim() || !waitingForInput) return;

    const currentIdx = currentItemIndexRef.current;
    const items = allItemsRef.current;
    const currentItem = items[currentIdx];
    if (!currentItem) return;

    const newResponses = { ...responsesRef.current, [currentItem.id]: answer };
    responsesRef.current = newResponses;
    setResponses(newResponses);

    addMessage(answer, false);
    setWaitingForInput(false);

    const nextIndex = currentIdx + 1;
    currentItemIndexRef.current = nextIndex;
    setCurrentItemIndex(nextIndex);

    setTimeout(() => {
      processItemRef.current(nextIndex);
    }, 1000);
  }, [waitingForInput, addMessage]);

  const startConversation = useCallback(() => {
    if (messages.length === 0 && allItemsRef.current.length > 0) {
      setTimeout(() => {
        const welcomeMsg = flowData?.welcome_message || flowData?.welcomeMessage || 'Olá! Como posso ajudá-lo hoje?';
        addMessage(welcomeMsg, true);
        setTimeout(() => {
          processItemRef.current(0);
        }, 1000);
      }, 500);
    }
  }, [messages.length, flowData, addMessage]);

  const currentItem = allItems[currentItemIndex];
  const currentQuestion = currentItem && currentItem.type !== 'bot_message' ? currentItem : null;

  return {
    messages,
    isTyping,
    showCompletion,
    waitingForInput,
    responses,
    currentQuestion,
    handleSendAnswer,
    startConversation,
    replaceVariables: (text: string, resp: Record<string, string>) => replaceVariables(text, resp)
  };
};
