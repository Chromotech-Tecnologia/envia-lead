
import { useState } from 'react';
import { defaultQuestions } from '@/data/defaultQuestions';

export const useChatPreview = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleResponse = (response: string) => {
    setResponses(prev => ({ ...prev, [currentStep]: response }));
    
    if (currentStep < defaultQuestions.length - 1) {
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
      const currentQuestion = defaultQuestions[currentStep];
      
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

  return {
    isOpen,
    setIsOpen,
    currentStep,
    responses,
    inputValue,
    setInputValue,
    isTyping,
    handleResponse,
    handleSendText,
    resetChat
  };
};
