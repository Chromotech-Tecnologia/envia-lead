import { Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { applyMask, validateInput } from '@/utils/inputMasks';
interface ChatInputProps {
  currentQuestion: any;
  colors: any;
  flowData: any;
  showCompletion: boolean;
  waitingForInput: boolean;
  isTyping: boolean;
  responses: Record<string, string>;
  onSendAnswer: (answer: string) => void;
  replaceVariables?: (text: string, responses: Record<string, string>) => string;
}
const ChatInput = ({
  currentQuestion,
  colors,
  flowData,
  showCompletion,
  waitingForInput,
  isTyping,
  responses,
  onSendAnswer,
  replaceVariables
}: ChatInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showEmailError, setShowEmailError] = useState(false);
  useEffect(() => {
    if (inputRef.current && currentQuestion) {
      const input = inputRef.current;

      // Aplicar máscaras baseadas no tipo da pergunta
      const handleInput = (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (currentQuestion.type === 'phone' || currentQuestion.type === 'email') {
          const maskedValue = applyMask(target.value, currentQuestion.type);
          if (maskedValue !== target.value) {
            target.value = maskedValue;
          }
        }
      };
      const handleBlur = (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (currentQuestion.type === 'phone' || currentQuestion.type === 'email') {
          const isValid = validateInput(target.value, currentQuestion.type);

          // Aplicar classes visuais
          if (isValid) {
            target.classList.remove('border-red-500', 'bg-red-50');
            target.classList.add('border-green-500', 'bg-green-50');
            setShowEmailError(false);
          } else {
            target.classList.remove('border-green-500', 'bg-green-50');
            target.classList.add('border-red-500', 'bg-red-50');
            if (currentQuestion.type === 'email') {
              setShowEmailError(true);
            }
          }
        }
      };
      input.addEventListener('input', handleInput);
      input.addEventListener('blur', handleBlur);
      return () => {
        input.removeEventListener('input', handleInput);
        input.removeEventListener('blur', handleBlur);
      };
    }
  }, [currentQuestion]);
  if (showCompletion) {
    return <div className="p-4 text-center space-y-3">
        <p className="text-green-600 font-medium">Informações enviadas com sucesso!</p>
        {flowData?.whatsapp && flowData?.show_whatsapp_button !== false && <button className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2" onClick={() => {
        // Usar template personalizado com variáveis
        let messageText = flowData?.whatsapp_message_template || 'Olá, meu nome é #nome e gostaria de mais informações.';

        // Substituir variáveis se a função estiver disponível
        if (replaceVariables) {
          messageText = replaceVariables(messageText, responses);
        }
        const whatsappNumber = flowData.whatsapp.replace(/\D/g, '');
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageText)}`;
        window.open(whatsappUrl, '_blank');
      }}>
            💬 Continuar no WhatsApp
          </button>}
      </div>;
  }
  if (!waitingForInput || !currentQuestion || isTyping) {
    return null;
  }
  return <div className="p-4 border-t">
      <div className="space-y-3">
        {currentQuestion.type === 'select' ? <select className="w-full p-2 border rounded-lg" onChange={e => onSendAnswer(e.target.value)} style={{
        borderColor: colors.primary
      }}>
            <option value="">Selecione uma opção...</option>
            {currentQuestion.options?.map((option: string, idx: number) => <option key={idx} value={option}>{option}</option>)}
          </select> : currentQuestion.type === 'radio' ? <div className="space-y-2">
            {currentQuestion.options?.map((option: string, idx: number) => <label key={idx} className="flex items-center p-2 border rounded cursor-pointer hover:bg-gray-50">
                <input type="radio" name="preview-radio" value={option} onChange={e => onSendAnswer(e.target.value)} className="mr-2" />
                {option}
              </label>)}
          </div> : <div className="space-y-2">
            <div className="flex space-x-2">
              <input ref={inputRef} type={currentQuestion.type === 'phone' ? 'tel' : currentQuestion.type} placeholder={currentQuestion.placeholder || "Digite sua resposta..."} className="flex-1 p-2 border rounded-lg transition-colors" style={{
            borderColor: colors.primary
          }} onKeyPress={e => {
            if (e.key === 'Enter') {
              const input = e.target as HTMLInputElement;

              // Validar antes de enviar se for phone ou email
              if (currentQuestion.type === 'phone' || currentQuestion.type === 'email') {
                const isValid = validateInput(input.value, currentQuestion.type);
                if (!isValid) {
                  input.classList.add('border-red-500', 'bg-red-50');
                  if (currentQuestion.type === 'email') {
                    setShowEmailError(true);
                  }
                  return;
                }
              }
              onSendAnswer(input.value);
              input.value = '';
            }
          }} />
              <button onClick={() => {
            const input = inputRef.current;
            if (input) {
              // Validar antes de enviar se for phone ou email
              if (currentQuestion.type === 'phone' || currentQuestion.type === 'email') {
                const isValid = validateInput(input.value, currentQuestion.type);
                if (!isValid) {
                  input.classList.add('border-red-500', 'bg-red-50');
                  if (currentQuestion.type === 'email') {
                    setShowEmailError(true);
                  }
                  return;
                }
              }
              onSendAnswer(input.value);
              input.value = '';
            }
          }} className="p-2 text-white rounded-lg transition-colors flex items-center justify-center" style={{
            background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`
          }}>
                <Send className="w-4 h-4" />
              </button>
            </div>
            {currentQuestion.type === 'email' && showEmailError && <p className="text-red-500 text-sm">Por favor, digite um email válido</p>}
          </div>}
      </div>
    </div>;
};
export default ChatInput;