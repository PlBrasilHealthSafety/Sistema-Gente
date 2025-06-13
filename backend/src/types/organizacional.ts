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
  status: StatusItem;
  grupo_id?: number;
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
  status?: StatusItem;
  grupo_id?: number;
}

export interface UpdateRegiaoData {
  nome?: string;
  descricao?: string;
  codigo?: string;
  uf?: string;
  cidade?: string;
  status?: StatusItem;
  grupo_id?: number;
}

// Interfaces para Empresas
export interface Empresa {
  id: number;
  razao_social: string;
  nome_fantasia?: string;
  cnpj: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  email?: string;
  telefone?: string;
  site?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  status: StatusItem;
  grupo_id?: number; // Referência ao grupo
  regiao_id?: number; // Referência à região
  created_at: Date;
  updated_at: Date;
  created_by: number;
  updated_by?: number;
}

export interface CreateEmpresaData {
  razao_social: string;
  nome_fantasia?: string;
  cnpj: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  email?: string;
  telefone?: string;
  site?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
  status?: StatusItem;
  grupo_id?: number;
  regiao_id?: number;
}

export interface UpdateEmpresaData {
  razao_social?: string;
  nome_fantasia?: string;
  cnpj?: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  email?: string;
  telefone?: string;
  site?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
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