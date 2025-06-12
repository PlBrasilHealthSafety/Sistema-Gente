// Utilitários para máscaras e validações de campos
import { useState } from 'react';

// Máscara para CPF (000.000.000-00)
export const formatCPF = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 11) {
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  return numbers.slice(0, 11).replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

// Máscara para CNPJ (00.000.000/0000-00)
export const formatCNPJ = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 14) {
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return numbers.slice(0, 14).replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

// Máscara para telefone fixo (00) 0000-0000
export const formatTelefoneFixo = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return numbers.slice(0, 10).replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
};

// Máscara para celular (00) 00000-0000
export const formatCelular = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return numbers.slice(0, 11).replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};

// Máscara para telefone (detecta automaticamente se é fixo ou celular)
export const formatTelefone = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 10) {
    // Telefone fixo
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else if (numbers.length === 11) {
    // Celular
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  
  return numbers.slice(0, 11).replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};

// Máscara para CEP (00000-000)
export const formatCEP = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 8) {
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
  return numbers.slice(0, 8).replace(/(\d{5})(\d{3})/, '$1-$2');
};

// Máscara para RG (00.000.000-0)
export const formatRG = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 9) {
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4');
  }
  return numbers.slice(0, 9).replace(/(\d{2})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4');
};

// Validação de CPF
export const isValidCPF = (cpf: string): boolean => {
  const numbers = cpf.replace(/\D/g, '');
  
  if (numbers.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(numbers)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * (10 - i);
  }
  let digit1 = (sum * 10) % 11;
  if (digit1 === 10) digit1 = 0;
  
  if (digit1 !== parseInt(numbers[9])) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers[i]) * (11 - i);
  }
  let digit2 = (sum * 10) % 11;
  if (digit2 === 10) digit2 = 0;
  
  return digit2 === parseInt(numbers[10]);
};

// Validação de CNPJ
export const isValidCNPJ = (cnpj: string): boolean => {
  const numbers = cnpj.replace(/\D/g, '');
  
  if (numbers.length !== 14) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(numbers)) return false;
  
  // Validação do primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(numbers[i]) * weights1[i];
  }
  let digit1 = sum % 11;
  digit1 = digit1 < 2 ? 0 : 11 - digit1;
  
  if (digit1 !== parseInt(numbers[12])) return false;
  
  // Validação do segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(numbers[i]) * weights2[i];
  }
  let digit2 = sum % 11;
  digit2 = digit2 < 2 ? 0 : 11 - digit2;
  
  return digit2 === parseInt(numbers[13]);
};

// Validação de CEP
export const isValidCEP = (cep: string): boolean => {
  const numbers = cep.replace(/\D/g, '');
  return numbers.length === 8;
};

// Validação de telefone
export const isValidTelefone = (telefone: string): boolean => {
  const numbers = telefone.replace(/\D/g, '');
  return numbers.length === 10 || numbers.length === 11;
};

// Máscara para número (apenas números)
export const formatNumeros = (value: string, maxLength?: number): string => {
  const numbers = value.replace(/\D/g, '');
  return maxLength ? numbers.slice(0, maxLength) : numbers;
};

// Máscara para texto (apenas letras e espaços)
export const formatTexto = (value: string): string => {
  return value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
};

// Máscara para alfanumérico
export const formatAlfanumerico = (value: string): string => {
  return value.replace(/[^a-zA-Z0-9À-ÿ\s]/g, '');
};

// Hook customizado para aplicar máscaras
export const useMask = (initialValue: string = '', maskType: string) => {
  const [value, setValue] = useState(initialValue);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    let formattedValue = inputValue;
    
    switch (maskType) {
      case 'cpf':
        formattedValue = formatCPF(inputValue);
        break;
      case 'cnpj':
        formattedValue = formatCNPJ(inputValue);
        break;
      case 'telefone':
        formattedValue = formatTelefone(inputValue);
        break;
      case 'cep':
        formattedValue = formatCEP(inputValue);
        break;
      case 'rg':
        formattedValue = formatRG(inputValue);
        break;
      case 'numeros':
        formattedValue = formatNumeros(inputValue);
        break;
      case 'texto':
        formattedValue = formatTexto(inputValue);
        break;
      case 'alfanumerico':
        formattedValue = formatAlfanumerico(inputValue);
        break;
      default:
        formattedValue = inputValue;
    }
    
    setValue(formattedValue);
  };
  
  return [value, handleChange, setValue] as const;
}; 