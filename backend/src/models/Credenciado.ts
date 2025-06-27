export interface HorarioFuncionamento {
  dia_semana: 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo';
  ativo: boolean;
  horario_inicio?: string;
  horario_fim?: string;
}

export interface Credenciado {
  id: number;
  nome: string;
  cnpj: string;
  telefone: string;
  email: string;
  site?: string;
  
  // Endereço
  cep: string;
  tipo_logradouro?: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  uf: string;
  cidade: string;
  bairro: string;
  
  // Informações complementares
  observacoes_exames?: string;
  observacoes_gerais?: string;
  utilizar_percentual: boolean;
  
  // Horários de funcionamento
  horarios_funcionamento?: HorarioFuncionamento[];
  
  // Controle
  status: 'ativo' | 'inativo';
  created_at?: Date;
  updated_at?: Date;
}

export interface CreateCredenciadoDTO {
  nome: string;
  cnpj: string;
  telefone: string;
  email: string;
  site?: string;
  cep: string;
  tipo_logradouro?: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  uf: string;
  cidade: string;
  bairro: string;
  observacoes_exames?: string;
  observacoes_gerais?: string;
  utilizar_percentual?: boolean;
  horarios_funcionamento?: HorarioFuncionamento[];
  status?: 'ativo' | 'inativo';
}

export interface UpdateCredenciadoDTO extends Partial<CreateCredenciadoDTO> {} 