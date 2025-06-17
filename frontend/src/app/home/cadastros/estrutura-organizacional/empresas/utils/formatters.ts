// Importa as funções de máscara do arquivo central
import { 
  formatCPF, 
  formatCNPJ, 
  formatTelefone, 
  formatCEP, 
  formatNumeros, 
  formatTexto,
  isValidCPF,
  isValidTelefone
} from '@/utils/masks';

// Re-exporta as funções para manter a interface simples
export {
  formatCPF,
  formatCNPJ,
  formatTelefone,
  formatCEP,
  formatNumeros,
  formatTexto,
  isValidCPF,
  isValidTelefone
};

// Funções específicas para o contexto de empresas
export const formatarNumeroInscricao = (value: string, tipoInscricao: string): string => {
  if (tipoInscricao === 'cnpj') {
    return formatCNPJ(value);
  } else if (tipoInscricao === 'cpf') {
    return formatCPF(value);
  }
  return value;
};

export const formatarCno = (value: string): string => {
  return formatNumeros(value, 14);
};

export const getRoleName = (role: string): string => {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'Super Administrador';
    case 'ADMIN':
      return 'Administrador';
    case 'USER':
      return 'Usuário';
    default:
      return role;
  }
};

export const getRoleColor = (role: string): string => {
  switch (role) {
    case 'SUPER_ADMIN':
      return 'bg-purple-100 text-purple-800';
    case 'ADMIN':
      return 'bg-blue-100 text-blue-800';
    case 'USER':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}; 