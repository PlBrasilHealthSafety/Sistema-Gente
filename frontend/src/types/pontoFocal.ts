export interface PontoFocal {
  id?: string; // Para identificação temporária no frontend
  nome: string;
  descricao: string;
  observacoes: string;
  isPrincipal: boolean;
}

export interface PontoFocalFormData {
  pontosFocais: PontoFocal[];
}

export interface PontoFocalDisplayData {
  pontosFocais?: any[]; // Aceita dados do backend com snake_case
  // Para compatibilidade com estrutura atual
  ponto_focal_nome?: string;
  ponto_focal_descricao?: string;
  ponto_focal_observacoes?: string;
  ponto_focal_principal?: boolean;
  // Campos adicionais para debug
  nome_fantasia?: string;
  numero_inscricao?: string;
} 