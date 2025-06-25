export interface NotificationMessage {
  type: 'success' | 'error';
  message: string;
  show: boolean;
}

export interface NotificationInput {
  type: 'success' | 'error';
  message: string;
}

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
}

export interface Profissional {
  id: number;
  nome: string;
  cpf?: string;
  rg?: string;
  data_nascimento?: Date | string;
  nis?: string;
  categoria: string;
  sigla_conselho: string;
  numero_conselho: string;
  telefone?: string;
  celular?: string;
  email?: string;
  observacoes?: string;
  externo: boolean;
  ofensor?: string;
  clinica?: string;
  situacao: 'ativo' | 'inativo'; // Mantendo compatibilidade com page.tsx
  status?: 'ativo' | 'inativo'; // Para compatibilidade com hooks
  created_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Endereco {
  cep: string;
  tipoLogradouro: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export interface Contato {
  nome: string;
  telefone: string;
  email: string;
}

export interface FormErrors {
  nomeProfissional: string;
  nacionalidade: string;
  cpf: string;
  nis?: string;
  categoria: string;
  siglaConselho: string;
  regConselho: string;
  ufConselho: string;
  cep: string;
  tipoLogradouro: string;
  logradouro: string;
  numero: string;
  ufEndereco: string;
  cidade: string;
  bairro: string;
  email: string;
  telefone?: string;
  ddd: string;
  celular: string;
}

export interface ProfissionalFormData {
  nome: string;
  cpf: string;
  rg?: string;
  dataNascimento?: string;
  nis?: string;
  categoria: string;
  siglaConselho?: string;
  numeroConselho?: string;
  telefone?: string;
  celular?: string;
  email?: string;
  observacoes?: string;
  externo: boolean;
  ofensor?: string;
  clinica?: string;
} 