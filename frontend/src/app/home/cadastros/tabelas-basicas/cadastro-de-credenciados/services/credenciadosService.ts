const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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
  utilizar_percentual: boolean;
  horarios_funcionamento?: HorarioFuncionamento[];
  status: 'ativo' | 'inativo';
  created_at?: Date;
  updated_at?: Date;
}

export const credenciadosService = {
  // Listar credenciados
  async listar(status?: string, search?: string): Promise<Credenciado[]> {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (status) params.append('status', status);
      if (search) params.append('search', search);
      
      const response = await fetch(`${API_URL}/api/credenciados?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Erro ao carregar credenciados');
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao listar credenciados:', error);
      throw error;
    }
  },

  // Buscar credenciado por ID
  async buscarPorId(id: number): Promise<Credenciado> {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/credenciados/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Credenciado não encontrado');
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar credenciado:', error);
      throw error;
    }
  },

  // Criar credenciado
  async criar(dados: Omit<Credenciado, 'id' | 'created_at' | 'updated_at'>): Promise<Credenciado> {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/credenciados`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dados)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar credenciado');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao criar credenciado:', error);
      throw error;
    }
  },

  // Atualizar credenciado
  async atualizar(id: number, dados: Partial<Credenciado>): Promise<Credenciado> {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/credenciados/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(dados)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao atualizar credenciado');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar credenciado:', error);
      throw error;
    }
  },

  // Alterar status
  async alterarStatus(id: number, status: 'ativo' | 'inativo'): Promise<Credenciado> {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/credenciados/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao alterar status');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      throw error;
    }
  },

  // Excluir credenciado
  async excluir(id: number): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/credenciados/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao excluir credenciado');
      }
    } catch (error) {
      console.error('Erro ao excluir credenciado:', error);
      throw error;
    }
  }
}; 