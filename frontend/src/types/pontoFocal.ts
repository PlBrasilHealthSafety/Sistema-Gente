export interface PontoFocal {
  id?: string; // Para identificação temporária no frontend
  nome: string;
  cargo: string;
  descricao: string;
  observacoes: string;
  telefone: string;
  email: string;
  isPrincipal: boolean;
}

export interface PontoFocalFormData {
  pontosFocais: PontoFocal[];
}

export interface PontoFocalDisplayData {
  pontosFocais?: PontoFocal[];
  // Para compatibilidade com estrutura atual
  ponto_focal_nome?: string;
  ponto_focal_descricao?: string;
  ponto_focal_observacoes?: string;
  ponto_focal_principal?: boolean;
} 