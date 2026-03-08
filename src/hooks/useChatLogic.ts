
import { useState, useCallback, useRef } from 'react';

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

  // Only questions (for variable mapping)
  const allQuestions = allItems.filter((item: any) => item.type !== 'bot_message');

  // Replace variables in text
  const replaceVariables = useCallback((text: string, currentResponses: Record<string, string>) => {
    let processedText = text;
    const variableMap: Record<string, string> = {};

    allQuestions.forEach((question: any, index: number) => {
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
  }, [allQuestions]);

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

  // Sequential processing: iterate through allItems one by one
  const processItem = useCallback((itemIndex: number) => {
    if (itemIndex >= allItems.length) {
      // All items processed - show completion
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const finalMessage = flowData?.final_message_custom || flowData?.final_message || 'Obrigado pelas informações! Em breve entraremos em contato.';
        addMessage(finalMessage, true);
        setShowCompletion(true);
      }, 1500);
      return;
    }

    const item = allItems[itemIndex];

    if (item.type === 'bot_message') {
      // Bot message: show with typing, then auto-advance
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addMessage(item.title, true);
        // Auto-advance to next item after a short delay
        const nextIndex = itemIndex + 1;
        setCurrentItemIndex(nextIndex);
        setTimeout(() => {
          processItem(nextIndex);
        }, 800);
      }, 1500);
    } else {
      // Question: show with typing, then wait for input
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        addMessage(item.title, true);
        setWaitingForInput(true);
      }, 1500);
    }
  }, [allItems, flowData, addMessage]);

  const handleSendAnswer = useCallback((answer: string) => {
    if (!answer.trim() || !waitingForInput) return;

    const currentItem = allItems[currentItemIndex];
    if (!currentItem) return;

    // Save response
    const newResponses = { ...responsesRef.current, [currentItem.id]: answer };
    responsesRef.current = newResponses;
    setResponses(newResponses);

    // Add user message
    addMessage(answer, false);
    setWaitingForInput(false);

    // Advance to next item
    const nextIndex = currentItemIndex + 1;
    setCurrentItemIndex(nextIndex);

    setTimeout(() => {
      processItem(nextIndex);
    }, 1000);
  }, [allItems, currentItemIndex, waitingForInput, addMessage, processItem]);

  const startConversation = useCallback(() => {
    if (messages.length === 0 && allItems.length > 0) {
      setTimeout(() => {
        addMessage(flowData?.welcome_message || 'Olá! Como posso ajudá-lo hoje?', true);
        setTimeout(() => {
          processItem(0);
        }, 1000);
      }, 500);
    }
  }, [messages.length, allItems.length, flowData, addMessage, processItem]);

  // Current item is the current question (non-bot_message) for input rendering
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
