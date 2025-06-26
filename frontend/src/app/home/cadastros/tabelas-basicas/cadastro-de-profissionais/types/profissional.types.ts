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
  nacionalidade?: string;
  cpf?: string;
  rg?: string;
  data_nascimento?: Date | string;
  nis?: string;
  categoria: string;
  sigla_conselho: string;
  numero_conselho: string;
  reg_conselho?: string;
  uf_conselho?: string;
  reg_mte?: string;
  
  // Endereço
  cep?: string;
  tipo_logradouro?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf_endereco?: string;
  
  // Contato
  telefone?: string;
  celular?: string;
  ddd?: string;
  email?: string;
  
  // Informações adicionais
  observacao?: string;
  observacoes?: string;
  agendamento_horario?: boolean;
  profissional_externo?: boolean;
  assinatura_digital?: string;
  certificado_digital?: string;
  
  // Campos antigos para compatibilidade
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
  nacionalidade?: string;
  cpf: string;
  rg?: string;
  dataNascimento?: string;
  nis?: string;
  categoria: string;
  sigla_conselho?: string;
  reg_conselho?: string;
  uf_conselho?: string;
  reg_mte?: string;
  
  // Endereço
  cep?: string;
  tipo_logradouro?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  uf_endereco?: string;
  cidade?: string;
  bairro?: string;
  
  // Contato
  telefone?: string;
  celular?: string;
  ddd?: string;
  email?: string;
  
  // Informações adicionais
  observacao?: string;
  agendamento_horario?: boolean;
  profissional_externo?: boolean;
  assinatura_digital?: string;
  certificado_digital?: string;
  situacao?: 'ativo' | 'inativo';
  status?: 'ativo' | 'inativo';
  
  // Compatibilidade
  siglaConselho?: string;
  numeroConselho?: string;
  observacoes?: string;
  externo?: boolean;
  ofensor?: string;
  clinica?: string;
} 