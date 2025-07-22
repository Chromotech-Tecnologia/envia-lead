
// Máscaras e validações para inputs

export const maskPhone = (value: string): string => {
  // Remove tudo que não for número
  const cleanValue = value.replace(/\D/g, '');
  
  // Limitar a 11 dígitos
  const limitedValue = cleanValue.substring(0, 11);
  
  // Aplica a máscara
  if (limitedValue.length <= 10) {
    return limitedValue.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else {
    return limitedValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
};

export const maskEmail = (value: string): string => {
  // Remove espaços e mantém apenas caracteres válidos
  return value.replace(/\s/g, '').toLowerCase();
};

export const validatePhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Verificar se tem DDD válido e formato correto
  if (cleanPhone.length === 11) {
    // Celular: DDD + 9 + 8 dígitos
    const ddd = parseInt(cleanPhone.substring(0, 2));
    const firstDigit = cleanPhone.substring(2, 3);
    return ddd >= 11 && ddd <= 99 && firstDigit === '9';
  } else if (cleanPhone.length === 10) {
    // Fixo: DDD + 8 dígitos
    const ddd = parseInt(cleanPhone.substring(0, 2));
    const firstDigit = cleanPhone.substring(2, 3);
    return ddd >= 11 && ddd <= 99 && ['2', '3', '4', '5'].includes(firstDigit);
  }
  
  return false;
};

export const validateEmail = (email: string): boolean => {
  // Regex mais rigorosa para email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
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
  switch (type) {
    case 'phone':
      return validatePhone(value);
    case 'email':
      return validateEmail(value);
    default:
      return value.trim().length > 0;
  }
};
