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

export interface Grupo {
  id: number;
  nome: string;
  descricao?: string;
  grupo_pai_id?: number;
  status: 'ativo' | 'inativo';
}

export interface Regiao {
  id: number;
  nome: string;
  descricao?: string;
  uf: string;
  cidade?: string;
  grupo_id?: number;
  status: 'ativo' | 'inativo';
}

export interface Empresa {
  id: number;
  codigo: string;
  nome_fantasia: string;
  razao_social: string;
  tipo_estabelecimento: 'MATRIZ' | 'FILIAL';
  tipo_inscricao?: 'cnpj' | 'cpf';
  numero_inscricao?: string;
  cno?: string;
  cnae_codigo?: string;
  cnae_descricao?: string;
  risco?: string;
  endereco_cep?: string;
  endereco_logradouro?: string;
  endereco_numero?: string;
  endereco_complemento?: string;
  endereco_bairro?: string;
  endereco_cidade?: string;
  endereco_uf?: string;
  contato_nome?: string;
  contato_telefone?: string;
  contato_email?: string;
  representante_legal_nome?: string;
  representante_legal_cpf?: string;
  observacoes?: string;
  observacoes_os?: string;
  ponto_focal_nome?: string;
  ponto_focal_descricao?: string;
  ponto_focal_observacoes?: string;
  ponto_focal_principal?: boolean;
  pontos_focais?: any[]; // Array de múltiplos pontos focais
  grupo_id?: number;
  regiao_id?: number;
  grupo?: Grupo;
  regiao?: Regiao;
  status: 'ativo' | 'inativo';
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
}

export interface Endereco {
  logradouro: string;
  tipoLogradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
}

export interface FormErrors {
  nomeFantasia: string;
  razaoSocial: string;
  grupoSelecionado: string;
  regiaoSelecionada: string;
  cnaeCodigo: string;
  cnaeDescricao: string;
  risco: string;
  cep: string;
  numeroEndereco: string;
  tipoInscricao: string;
  numeroInscricao: string;
  cno: string;
  tipoLogradouro: string;
  logradouro: string;
  uf: string;
  cidade: string;
  bairro: string;
  telefone: string;
  email: string;
}

export interface EmpresaFormData {
  codigo?: string;
  nome_fantasia: string;
  razao_social: string;
  tipo_estabelecimento: 'MATRIZ' | 'FILIAL';
  tipo_inscricao?: 'cnpj' | 'cpf';
  numero_inscricao?: string;
  cno?: string;
  cnae_codigo?: string;
  cnae_descricao?: string;
  risco?: string;
  endereco_cep?: string;
  endereco_logradouro?: string;
  endereco_numero?: string;
  endereco_complemento?: string;
  endereco_bairro?: string;
  endereco_cidade?: string;
  endereco_uf?: string;
  contato_nome?: string;
  contato_telefone?: string;
  contato_email?: string;
  representante_legal_nome?: string;
  representante_legal_cpf?: string;
  observacoes?: string;
  observacoes_os?: string;
  ponto_focal_nome?: string;
  ponto_focal_descricao?: string;
  ponto_focal_observacoes?: string;
  ponto_focal_principal?: boolean;
  pontos_focais?: any[]; // Array de múltiplos pontos focais
  status?: 'ativo' | 'inativo';
  grupo_id?: number;
  regiao_id?: number;
} 