import { Regiao } from '../types/empresa.types';

const API_BASE_URL = 'http://localhost:3001/api';

class RegioesService {
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  private getAuthHeaders() {
    const token = this.getAuthToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  async buscarRegioes(): Promise<Regiao[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/regioes`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erro ao carregar regiões: ${response.status}`);
      }

      const result = await response.json();
      // A API pode retornar {success: true, data: Array} ou Array direto
      const validData = result.success && Array.isArray(result.data) 
        ? result.data
        : Array.isArray(result) 
          ? result
          : [];
      
      return validData;
    } catch (error) {
      console.error('Erro ao carregar regiões:', error);
      throw error;
    }
  }

  async buscarRegioesAtivas(): Promise<Regiao[]> {
    try {
      const regioes = await this.buscarRegioes();
      return regioes.filter(regiao => regiao.status === 'ativo');
    } catch (error) {
      console.error('Erro ao carregar regiões ativas:', error);
      throw error;
    }
  }

  async buscarRegioesPorGrupo(grupoId: number): Promise<Regiao[]> {
    try {
      const regioes = await this.buscarRegioesAtivas();
      return regioes.filter(regiao => regiao.grupo_id === grupoId);
    } catch (error) {
      console.error('Erro ao carregar regiões por grupo:', error);
      throw error;
    }
  }
}

export const regioesService = new RegioesService(); 