import { Send, Phone, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
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
  const [validationState, setValidationState] = useState<'idle' | 'valid' | 'invalid'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [inputValue, setInputValue] = useState('');

  // Reset state when question changes
  useEffect(() => {
    setValidationState('idle');
    setErrorMessage('');
    setInputValue('');
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [currentQuestion?.id]);

  const getPlaceholder = () => {
    if (currentQuestion.type === 'phone') return '(11) 99999-9999';
    if (currentQuestion.type === 'email') return 'seu@email.com';
    return currentQuestion.placeholder || 'Digite sua resposta...';
  };

  const getHintText = () => {
    if (currentQuestion.type === 'phone') return 'Digite apenas números. Formato: (DDD) XXXXX-XXXX';
    if (currentQuestion.type === 'email') return 'Formato esperado: nome@dominio.com';
    return '';
  };

  const getErrorMessage = (type: string, value: string) => {
    if (type === 'phone') {
      const clean = value.replace(/\D/g, '');
      if (clean.length === 0) return 'Digite seu número de telefone';
      if (clean.length < 10) return 'Número incompleto. Digite DDD + número';
      return 'Número de telefone inválido';
    }
    if (type === 'email') {
      if (!value.includes('@')) return 'O email precisa ter o símbolo @';
      if (!value.includes('.')) return 'O email precisa ter um domínio (ex: .com)';
      if (value.endsWith('@') || value.endsWith('.')) return 'Complete o endereço de email';
      return 'Email inválido. Use o formato: nome@dominio.com';
    }
    return 'Campo obrigatório';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Apply mask for phone
    if (currentQuestion.type === 'phone') {
      value = applyMask(value, 'phone');
      if (inputRef.current) inputRef.current.value = value;
    }

    // Apply mask for email (remove spaces, lowercase)
    if (currentQuestion.type === 'email') {
      value = applyMask(value, 'email');
      if (inputRef.current) inputRef.current.value = value;
    }

    setInputValue(value);

    // Real-time validation feedback
    if (currentQuestion.type === 'phone' || currentQuestion.type === 'email') {
      if (value.length === 0) {
        setValidationState('idle');
        setErrorMessage('');
      } else if (validateInput(value, currentQuestion.type)) {
        setValidationState('valid');
        setErrorMessage('');
      } else {
        // Only show error after enough chars to be meaningful
        const minChars = currentQuestion.type === 'phone' ? 4 : 5;
        if (value.length >= minChars) {
          setValidationState('invalid');
          setErrorMessage(getErrorMessage(currentQuestion.type, value));
        } else {
          setValidationState('idle');
          setErrorMessage('');
        }
      }
    }
  };

  const handleSubmit = (value: string) => {
    if (!value.trim()) return;

    if (currentQuestion.type === 'phone' || currentQuestion.type === 'email') {
      const isValid = validateInput(value, currentQuestion.type);
      if (!isValid) {
        setValidationState('invalid');
        setErrorMessage(getErrorMessage(currentQuestion.type, value));
        inputRef.current?.focus();
        return;
      }
    }

    onSendAnswer(value);
    setInputValue('');
    setValidationState('idle');
    setErrorMessage('');
    if (inputRef.current) inputRef.current.value = '';
  };

  if (showCompletion) {
    return (
      <div className="p-4 text-center space-y-3">
        <p className="text-green-600 font-medium">Informações enviadas com sucesso!</p>
        {flowData?.whatsapp && flowData?.show_whatsapp_button !== false && (
          <button
            className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
            onClick={() => {
              let messageText = flowData?.whatsapp_message_template || 'Olá, meu nome é #nome e gostaria de mais informações.';
              if (replaceVariables) {
                messageText = replaceVariables(messageText, responses);
              }
              const whatsappNumber = flowData.whatsapp.replace(/\D/g, '');
              const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageText)}`;
              window.open(whatsappUrl, '_blank');
            }}
          >
            💬 Continuar no WhatsApp
          </button>
        )}
      </div>
    );
  }

  if (!waitingForInput || !currentQuestion || isTyping) {
    return null;
  }

  const isPhoneOrEmail = currentQuestion.type === 'phone' || currentQuestion.type === 'email';
  const hint = getHintText();

  const borderColor = validationState === 'valid'
    ? '#22c55e'
    : validationState === 'invalid'
      ? '#ef4444'
      : colors.primary;

  const bgColor = validationState === 'valid'
    ? 'rgba(34,197,94,0.05)'
    : validationState === 'invalid'
      ? 'rgba(239,68,68,0.05)'
      : 'transparent';

  return (
    <div className="p-4 border-t">
      <div className="space-y-2">
        {currentQuestion.type === 'select' ? (
          <select
            className="w-full p-2 border rounded-lg"
            onChange={(e) => onSendAnswer(e.target.value)}
            style={{ borderColor: colors.primary }}
          >
            <option value="">Selecione uma opção...</option>
            {currentQuestion.options?.map((option: string, idx: number) => (
              <option key={idx} value={option}>{option}</option>
            ))}
          </select>
        ) : currentQuestion.type === 'radio' ? (
          <div className="space-y-2">
            {currentQuestion.options?.map((option: string, idx: number) => (
              <label key={idx} className="flex items-center p-2 border rounded cursor-pointer hover:bg-gray-50">
                <input type="radio" name="preview-radio" value={option} onChange={(e) => onSendAnswer(e.target.value)} className="mr-2" />
                {option}
              </label>
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {/* Hint text for phone/email */}
            {isPhoneOrEmail && hint && validationState === 'idle' && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500 px-1">
                {currentQuestion.type === 'phone' && <Phone className="w-3 h-3" />}
                {currentQuestion.type === 'email' && <Mail className="w-3 h-3" />}
                <span>{hint}</span>
              </div>
            )}

            {/* Validation feedback */}
            {validationState === 'valid' && (
              <div className="flex items-center gap-1.5 text-xs text-green-600 px-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{currentQuestion.type === 'phone' ? 'Telefone válido!' : 'Email válido!'}</span>
              </div>
            )}
            {validationState === 'invalid' && errorMessage && (
              <div className="flex items-center gap-1.5 text-xs text-red-500 px-1">
                <AlertCircle className="w-3 h-3" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex space-x-2">
              <div className="flex-1 relative">
                {isPhoneOrEmail && (
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    {currentQuestion.type === 'phone' && <Phone className="w-4 h-4" />}
                    {currentQuestion.type === 'email' && <Mail className="w-4 h-4" />}
                  </div>
                )}
                <input
                  ref={inputRef}
                  type={currentQuestion.type === 'phone' ? 'tel' : currentQuestion.type === 'email' ? 'email' : currentQuestion.type}
                  inputMode={currentQuestion.type === 'phone' ? 'tel' : currentQuestion.type === 'email' ? 'email' : 'text'}
                  placeholder={getPlaceholder()}
                  className="w-full p-2 border rounded-lg transition-all duration-200"
                  style={{
                    borderColor,
                    backgroundColor: bgColor,
                    paddingLeft: isPhoneOrEmail ? '2.25rem' : '0.5rem',
                  }}
                  onChange={handleInputChange}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSubmit((e.target as HTMLInputElement).value);
                    }
                  }}
                  onBlur={(e) => {
                    const val = e.target.value;
                    if (val.length > 0 && isPhoneOrEmail) {
                      const isValid = validateInput(val, currentQuestion.type);
                      setValidationState(isValid ? 'valid' : 'invalid');
                      if (!isValid) setErrorMessage(getErrorMessage(currentQuestion.type, val));
                      else setErrorMessage('');
                    }
                  }}
                />
              </div>
              <button
                onClick={() => {
                  const input = inputRef.current;
                  if (input) handleSubmit(input.value);
                }}
                className="p-2 text-white rounded-lg transition-colors flex items-center justify-center"
                style={{
                  background: `linear-gradient(45deg, ${colors.primary}, ${colors.secondary})`
                }}
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
