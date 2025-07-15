// Máscaras e validações para inputs

export const maskPhone = (value: string): string => {
  // Remove tudo que não for número
  const cleanValue = value.replace(/\D/g, '');
  
  // Aplica a máscara
  if (cleanValue.length <= 10) {
    return cleanValue.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else {
    return cleanValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
};

export const maskEmail = (value: string): string => {
  // Remove espaços e caracteres especiais desnecessários
  return value.toLowerCase().trim();
};

export const validatePhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
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