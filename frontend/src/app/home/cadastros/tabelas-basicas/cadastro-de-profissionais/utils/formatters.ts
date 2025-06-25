// Formatação de CPF
export const formatCPF = (value: string): string => {
  // Remove tudo que não é dígito
  const onlyNumbers = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  const limitedNumbers = onlyNumbers.slice(0, 11);
  
  // Aplica a formatação
  if (limitedNumbers.length <= 3) {
    return limitedNumbers;
  } else if (limitedNumbers.length <= 6) {
    return limitedNumbers.replace(/(\d{3})(\d+)/, '$1.$2');
  } else if (limitedNumbers.length <= 9) {
    return limitedNumbers.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
  } else {
    return limitedNumbers.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4');
  }
};

// Formatação de NIS (apenas números, máximo 11 dígitos)
export const formatNIS = (value: string): string => {
  const onlyNumbers = value.replace(/\D/g, '');
  return onlyNumbers.slice(0, 11);
};

// Formatação de telefone fixo (00) 0000-0000
export const formatTelefone = (value: string): string => {
  const onlyNumbers = value.replace(/\D/g, '');
  
  // Limita a 10 dígitos (2 para DDD + 8 para número)
  const limitedNumbers = onlyNumbers.slice(0, 10);
  
  if (limitedNumbers.length <= 2) {
    return limitedNumbers;
  } else if (limitedNumbers.length <= 6) {
    return limitedNumbers.replace(/(\d{2})(\d+)/, '($1) $2');
  } else {
    return limitedNumbers.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
  }
};

// Formatação de celular (00) 90000-0000
export const formatCelular = (value: string): string => {
  const onlyNumbers = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos (2 para DDD + 9 para número)
  const limitedNumbers = onlyNumbers.slice(0, 11);
  
  if (limitedNumbers.length <= 2) {
    return limitedNumbers;
  } else if (limitedNumbers.length <= 7) {
    return limitedNumbers.replace(/(\d{2})(\d+)/, '($1) $2');
  } else {
    return limitedNumbers.replace(/(\d{2})(\d{5})(\d+)/, '($1) $2-$3');
  }
};

// Formatação de DDD
export const formatDDD = (value: string): string => {
  return value.replace(/\D/g, '').slice(0, 2);
};

// Validação de CPF
export const isValidCPF = (cpf: string): boolean => {
  const numbers = cpf.replace(/[.-]/g, '');
  
  if (numbers.length !== 11 || /^(.)\1*$/.test(numbers)) {
    return false;
  }
  
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers.charAt(i)) * (10 - i);
  }
  
  let digit1 = 11 - (sum % 11);
  if (digit1 === 10 || digit1 === 11) digit1 = 0;
  
  if (parseInt(numbers.charAt(9)) !== digit1) {
    return false;
  }
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers.charAt(i)) * (11 - i);
  }
  
  let digit2 = 11 - (sum % 11);
  if (digit2 === 10 || digit2 === 11) digit2 = 0;
  
  return parseInt(numbers.charAt(10)) === digit2;
};

// Validação de NIS (exatamente 11 dígitos)
export const isValidNIS = (nis: string): boolean => {
  const numbers = nis.replace(/\D/g, '');
  return numbers.length === 11;
};

// Validação de telefone fixo (10 dígitos: 2 DDD + 8 número)
export const isValidTelefone = (telefone: string): boolean => {
  const numbers = telefone.replace(/\D/g, '');
  return numbers.length === 10;
};

// Validação de celular (11 dígitos: 2 DDD + 9 número)
export const isValidCelular = (celular: string): boolean => {
  const numbers = celular.replace(/\D/g, '');
  return numbers.length === 11;
};

// Validação de email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validação de DDD
export const isValidDDD = (ddd: string): boolean => {
  const numbers = ddd.replace(/\D/g, '');
  return numbers.length === 2;
};

export const getRoleName = (role: string): string => {
  switch (role) {
    case 'super_admin':
      return 'Super Administrador';
    case 'admin':
      return 'Administrador';
    case 'user':
      return 'Usuário';
    default:
      return role;
  }
};

export const getRoleColor = (role: string): string => {
  switch (role) {
    case 'super_admin':
      return 'bg-purple-100 text-purple-800';
    case 'admin':
      return 'bg-blue-100 text-blue-800';
    case 'user':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}; 