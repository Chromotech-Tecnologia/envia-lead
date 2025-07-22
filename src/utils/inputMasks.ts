
// Máscaras e validações para inputs - VERSÃO COMPLETAMENTE REESCRITA

export const maskPhone = (value: string): string => {
  console.log('[InputMasks] Aplicando máscara telefone:', value);
  
  // Remove tudo que não for número
  const cleanValue = value.replace(/\D/g, '');
  
  // Limitar a 11 dígitos
  const limitedValue = cleanValue.substring(0, 11);
  
  // Aplicar máscara progressiva
  if (limitedValue.length === 0) {
    return '';
  } else if (limitedValue.length <= 2) {
    return limitedValue.replace(/(\d{0,2})/, '($1');
  } else if (limitedValue.length <= 6) {
    return limitedValue.replace(/(\d{2})(\d{0,4})/, '($1) $2');
  } else if (limitedValue.length <= 10) {
    return limitedValue.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
  } else {
    return limitedValue.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  }
};

export const maskEmail = (value: string): string => {
  // Remove espaços e mantém apenas caracteres válidos para email
  return value.replace(/\s/g, '').toLowerCase();
};

export const validatePhone = (phone: string): boolean => {
  console.log('[InputMasks] Validando telefone:', phone);
  
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Deve ter exatamente 10 ou 11 dígitos
  if (cleanPhone.length !== 10 && cleanPhone.length !== 11) {
    console.log('[InputMasks] Telefone inválido: tamanho incorreto', cleanPhone.length);
    return false;
  }
  
  // Verificar se tem DDD válido (11 a 99)
  const ddd = parseInt(cleanPhone.substring(0, 2));
  if (ddd < 11 || ddd > 99) {
    console.log('[InputMasks] Telefone inválido: DDD inválido', ddd);
    return false;
  }
  
  if (cleanPhone.length === 11) {
    // Celular: DDD + 9 + 8 dígitos
    const firstDigit = cleanPhone.substring(2, 3);
    const isValid = firstDigit === '9';
    console.log('[InputMasks] Celular válido:', isValid);
    return isValid;
  } else if (cleanPhone.length === 10) {
    // Fixo: DDD + 8 dígitos (deve começar com 2, 3, 4 ou 5)
    const firstDigit = cleanPhone.substring(2, 3);
    const isValid = ['2', '3', '4', '5'].includes(firstDigit);
    console.log('[InputMasks] Fixo válido:', isValid);
    return isValid;
  }
  
  return false;
};

export const validateEmail = (email: string): boolean => {
  console.log('[InputMasks] Validando email:', email);
  
  // Regex mais rigorosa que exige:
  // - Pelo menos um caractere antes do @
  // - @ obrigatório
  // - Domínio válido
  // - Extensão de pelo menos 2 caracteres
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  const isValid = emailRegex.test(email);
  console.log('[InputMasks] Email válido:', isValid);
  
  return isValid;
};

export const applyMask = (value: string, type: string): string => {
  switch (type) {
    case 'phone':
      return maskPhone(value);
    case 'email':
      return maskEmail(value);
    default:
      return value;
  }
};

export const validateInput = (value: string, type: string): boolean => {
  console.log('[InputMasks] Validando input:', { value, type });
  
  switch (type) {
    case 'phone':
      return validatePhone(value);
    case 'email':
      return validateEmail(value);
    default:
      const isValid = value.trim().length > 0;
      console.log('[InputMasks] Validação padrão:', isValid);
      return isValid;
  }
};

// Função para aplicar máscara em tempo real
export const applyRealTimeMask = (input: HTMLInputElement, type: string): void => {
  console.log('[InputMasks] Aplicando máscara em tempo real:', type);
  
  input.addEventListener('input', (e) => {
    const target = e.target as HTMLInputElement;
    const originalValue = target.value;
    const maskedValue = applyMask(originalValue, type);
    
    if (maskedValue !== originalValue) {
      target.value = maskedValue;
      console.log('[InputMasks] Máscara aplicada:', { original: originalValue, masked: maskedValue });
    }
  });
  
  input.addEventListener('blur', (e) => {
    const target = e.target as HTMLInputElement;
    const isValid = validateInput(target.value, type);
    
    // Aplicar classes visuais
    if (isValid) {
      target.classList.remove('error');
      target.classList.add('success');
    } else {
      target.classList.remove('success');
      target.classList.add('error');
    }
    
    console.log('[InputMasks] Validação no blur:', { value: target.value, type, valid: isValid });
  });
};
