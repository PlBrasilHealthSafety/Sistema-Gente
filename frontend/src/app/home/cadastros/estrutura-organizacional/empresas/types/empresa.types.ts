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
  cnaeDescricao: string;
  risco: string;
  cep: string;
  numeroEndereco: string;
  tipoInscricao: string;
  numeroInscricao: string;
  cno: string;
}

export interface EmpresaFormData {
  nome_fantasia: string;
  razao_social: string;
  tipo_estabelecimento: string;
  tipo_inscricao: string;
  numero_inscricao: string;
  cno: string;
  cnae_descricao: string;
  risco: string;
  endereco_cep: string;
  endereco_logradouro?: string | null;
  endereco_numero: string;
  endereco_complemento?: string | null;
  endereco_bairro?: string | null;
  endereco_cidade?: string | null;
  endereco_uf?: string | null;
  contato_nome?: string | null;
  contato_telefone?: string | null;
  contato_email?: string | null;
  representante_legal_nome?: string | null;
  representante_legal_cpf?: string | null;
  observacoes?: string | null;
  observacoes_os?: string | null;
  ponto_focal_nome?: string | null;
  ponto_focal_descricao?: string | null;
  ponto_focal_observacoes?: string | null;
  grupo_id: string;
  regiao_id: string;
} 