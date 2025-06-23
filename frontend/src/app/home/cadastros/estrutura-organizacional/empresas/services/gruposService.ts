import { Grupo } from '../types/empresa.types';

const API_BASE_URL = 'http://localhost:3001/api';

class GruposService {
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

  async buscarGrupos(): Promise<Grupo[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/grupos`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erro ao carregar grupos: ${response.status}`);
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
      console.error('Erro ao carregar grupos:', error);
      throw error;
    }
  }

  async buscarGruposAtivos(): Promise<Grupo[]> {
    try {
      const grupos = await this.buscarGrupos();
      return grupos.filter(grupo => grupo.status === 'ativo');
    } catch (error) {
      console.error('Erro ao carregar grupos ativos:', error);
      throw error;
    }
  }
}

export const gruposService = new GruposService(); 