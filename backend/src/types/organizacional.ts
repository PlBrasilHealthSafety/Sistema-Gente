// Enums
export enum StatusItem {
  ATIVO = 'ativo',
  INATIVO = 'inativo'
}

// Interface para Pontos Focais dos Grupos
export interface GrupoPontoFocal {
  id: number;
  grupo_id: number;
  nome: string;
  descricao?: string;
  observacoes?: string;
  is_principal: boolean;
  ordem: number;
  created_at: Date;
  updated_at: Date;
  created_by: number;
  updated_by?: number;
}

export interface CreateGrupoPontoFocalData {
  nome: string;
  descricao?: string;
  observacoes?: string;
  is_principal?: boolean;
  ordem?: number;
}

export interface UpdateGrupoPontoFocalData {
  nome?: string;
  descricao?: string;
  observacoes?: string;
  is_principal?: boolean;
  ordem?: number;
}

// Interface para Pontos Focais das Empresas
export interface EmpresaPontoFocal {
  id: number;
  empresa_id: number;
  nome: string;
  descricao?: string;
  observacoes?: string;
  is_principal: boolean;
  ordem: number;
  created_at: Date;
  updated_at: Date;
  created_by: number;
  updated_by?: number;
}

export interface CreateEmpresaPontoFocalData {
  nome: string;
  descricao?: string;
  observacoes?: string;
  is_principal?: boolean;
  ordem?: number;
}

export interface UpdateEmpresaPontoFocalData {
  nome?: string;
  descricao?: string;
  observacoes?: string;
  is_principal?: boolean;
  ordem?: number;
}

// Interfaces para Grupos
export interface Grupo {
  id: number;
  nome: string;
  descricao?: string;
  codigo?: string;
  status: StatusItem;
  grupo_pai_id?: number; // Para hierarquia de grupos
  ponto_focal_nome?: string; // Nome do ponto focal (mantido para compatibilidade)
  ponto_focal_descricao?: string; // Descrição do ponto focal (mantido para compatibilidade)
  ponto_focal_observacoes?: string; // Observações importantes do ponto focal (mantido para compatibilidade)
  ponto_focal_principal?: boolean; // Se é o ponto focal principal (mantido para compatibilidade)
  pontos_focais?: GrupoPontoFocal[]; // Array de múltiplos pontos focais
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
  ponto_focal_nome?: string;
  ponto_focal_descricao?: string;
  ponto_focal_observacoes?: string;
  ponto_focal_principal?: boolean;
  pontos_focais?: CreateGrupoPontoFocalData[]; // Array de pontos focais para criar
}

export interface UpdateGrupoData {
  nome?: string;
  descricao?: string;
  codigo?: string;
  status?: StatusItem;
  grupo_pai_id?: number;
  ponto_focal_nome?: string;
  ponto_focal_descricao?: string;
  ponto_focal_observacoes?: string;
  ponto_focal_principal?: boolean;
  pontos_focais?: CreateGrupoPontoFocalData[]; // Array de pontos focais para atualizar
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
  ponto_focal_nome?: string; // Nome do ponto focal (mantido para compatibilidade)
  ponto_focal_descricao?: string; // Descrição do ponto focal (mantido para compatibilidade)
  ponto_focal_observacoes?: string; // Observações importantes do ponto focal (mantido para compatibilidade)
  ponto_focal_principal?: boolean; // Se é o ponto focal principal (mantido para compatibilidade)
  pontos_focais?: EmpresaPontoFocal[]; // Array de múltiplos pontos focais
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
  ponto_focal_nome?: string;
  ponto_focal_descricao?: string;
  ponto_focal_observacoes?: string;
  ponto_focal_principal?: boolean;
  pontos_focais?: CreateEmpresaPontoFocalData[]; // Array de pontos focais para criar
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
  ponto_focal_nome?: string;
  ponto_focal_descricao?: string;
  ponto_focal_observacoes?: string;
  ponto_focal_principal?: boolean;
  pontos_focais?: CreateEmpresaPontoFocalData[]; // Array de pontos focais para atualizar
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