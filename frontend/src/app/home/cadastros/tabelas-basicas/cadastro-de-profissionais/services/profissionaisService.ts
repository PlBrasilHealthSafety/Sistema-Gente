import { Profissional } from '../types/profissional.types';

class ProfissionaisService {
  private baseUrl = 'http://localhost:3001/api/profissionais';

  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  private getAuthHeaders() {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async buscarProfissionais(): Promise<Profissional[]> {
    try {
      const response = await fetch(this.baseUrl, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar profissionais: ${response.status}`);
      }

      const result = await response.json();
      
      // A API retorna {success: true, data: Array, message: string}
      const data = result.data || result;
      const validData = Array.isArray(data) ? data : [];
      
      return validData;
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error);
      throw new Error('Erro ao buscar profissionais');
    }
  }

  async criarProfissional(profissionalData: Partial<Profissional>): Promise<Profissional> {
    try {
      // Mapear campos para garantir compatibilidade com o backend
      const dadosMapeados = {
        ...profissionalData,
        // Garantir que numero_conselho seja enviado
        numero_conselho: profissionalData.numero_conselho || profissionalData.reg_conselho,
        // Converter status/situacao para minúsculas (sempre usar 'status', nunca 'situacao')
        status: profissionalData.situacao?.toLowerCase() || profissionalData.status || 'ativo',
        // Garantir campos booleanos
        externo: profissionalData.externo || profissionalData.profissional_externo || false,
        agendamento_horario: profissionalData.agendamento_horario || false,
        profissional_externo: profissionalData.profissional_externo || false,
      };

      // Remover campos undefined, null e o campo 'situacao' (que é uma coluna gerada)
      const dadosLimpos = Object.fromEntries(
        Object.entries(dadosMapeados).filter(([key, value]) => {
          return value != null && key !== 'situacao' && key !== 'id';
        })
      );

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(dadosLimpos)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao criar profissional');
      }

      const result = await response.json();
      return result.data;
    } catch (error: any) {
      console.error('Erro ao criar profissional:', error);
      throw new Error(error.message || 'Erro ao criar profissional');
    }
  }

  async atualizarProfissional(id: number, profissionalData: Partial<Profissional>): Promise<Profissional> {
    try {
      // Mapear campos para garantir compatibilidade com o backend
      const dadosMapeados = {
        ...profissionalData,
        // Garantir que numero_conselho seja enviado
        numero_conselho: profissionalData.numero_conselho || profissionalData.reg_conselho,
        // Converter status/situacao para minúsculas (sempre usar 'status', nunca 'situacao')
        status: profissionalData.situacao?.toLowerCase() || profissionalData.status || 'ativo',
        // Garantir campos booleanos
        externo: profissionalData.externo || profissionalData.profissional_externo || false,
        agendamento_horario: profissionalData.agendamento_horario || false,
        profissional_externo: profissionalData.profissional_externo || false,
      };

      // Remover campos undefined, null e o campo 'situacao' (que é uma coluna gerada)
      const dadosLimpos = Object.fromEntries(
        Object.entries(dadosMapeados).filter(([key, value]) => {
          return value != null && key !== 'situacao' && key !== 'id' && key !== 'created_at' && key !== 'created_by';
        })
      );

      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(dadosLimpos)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao atualizar profissional');
      }

      const result = await response.json();
      return result.data;
    } catch (error: any) {
      console.error('Erro ao atualizar profissional:', error);
      throw new Error(error.message || 'Erro ao atualizar profissional');
    }
  }

  async excluirProfissional(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao excluir profissional');
      }
    } catch (error: any) {
      console.error('Erro ao excluir profissional:', error);
      throw new Error(error.message || 'Erro ao excluir profissional');
    }
  }
}

export const profissionaisService = new ProfissionaisService(); 