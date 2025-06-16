// Enums
export enum StatusItem {
  ATIVO = 'ativo',
  INATIVO = 'inativo'
}

// Interfaces para Grupos
export interface Grupo {
  id: number;
  nome: string;
  descricao?: string;
  codigo?: string;
  status: StatusItem;
  grupo_pai_id?: number; // Para hierarquia de grupos
  created_at: Date;
  updated_at: Date;
  created_by: number; // ID do usuário que criou
  updated_by?: number; // ID do usuário que atualizou
}

export interface CreateGrupoData {
  nome: string;
  descricao?: string;
  codigo?: string;
  status?: StatusItem;
  grupo_pai_id?: number;
}

export interface UpdateGrupoData {
  nome?: string;
  descricao?: string;
  codigo?: string;
  status?: StatusItem;
  grupo_pai_id?: number;
}

// Interfaces para Regiões
export interface Regiao {
  id: number;
  nome: string;
  descricao?: string;
  codigo?: string;
  uf?: string; // Estado
  cidade?: string;
  grupo_id?: number; // Referência ao grupo
  status: StatusItem;
  created_at: Date;
  updated_at: Date;
  created_by: number;
  updated_by?: number;
}

export interface CreateRegiaoData {
  nome: string;
  descricao?: string;
  codigo?: string;
  uf?: string;
  cidade?: string;
  grupo_id?: number;
  status?: StatusItem;
}

export interface UpdateRegiaoData {
  nome?: string;
  descricao?: string;
  codigo?: string;
  uf?: string;
  cidade?: string;
  grupo_id?: number;
  status?: StatusItem;
}

// Interfaces para Empresas
export interface Empresa {
  id: number;
  codigo?: string;
  razao_social: string;
  nome_fantasia: string;
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
  status: StatusItem;
  grupo_id: number; // Referência ao grupo
  regiao_id: number; // Referência à região
  created_at: Date;
  updated_at: Date;
  created_by: number;
  updated_by?: number;
}

export interface CreateEmpresaData {
  codigo?: string;
  razao_social: string;
  nome_fantasia: string;
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
  status?: StatusItem;
  grupo_id: number;
  regiao_id: number;
}

export interface UpdateEmpresaData {
  codigo?: string;
  razao_social?: string;
  nome_fantasia?: string;
  tipo_estabelecimento?: 'MATRIZ' | 'FILIAL';
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
  status?: StatusItem;
  grupo_id?: number;
  regiao_id?: number;
}

// Interface para listagem com relacionamentos
export interface GrupoWithHierarchy extends Grupo {
  grupo_pai?: Grupo;
  subgrupos?: Grupo[];
}

export interface EmpresaWithRelations extends Empresa {
  grupo?: Grupo;
  regiao?: Regiao;
} 