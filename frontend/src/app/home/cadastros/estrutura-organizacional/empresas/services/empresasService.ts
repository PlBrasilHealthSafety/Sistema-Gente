import { Empresa, EmpresaFormData } from '../types/empresa.types';

const API_BASE_URL = 'http://localhost:3001/api';

class EmpresasService {
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

  async buscarEmpresas(): Promise<Empresa[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/empresas`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erro ao carregar empresas: ${response.status}`);
      }

      const result = await response.json();
      return Array.isArray(result.data) ? result.data : Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      throw error;
    }
  }

  async criarEmpresa(empresaData: EmpresaFormData): Promise<Empresa> {
    try {
      const response = await fetch(`${API_BASE_URL}/empresas`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(empresaData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Erro desconhecido';
        
        try {
          const error = JSON.parse(errorText);
          errorMessage = error.message || errorMessage;
        } catch {
          errorMessage = `Erro ${response.status}: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Erro ao criar empresa:', error);
      throw new Error(error instanceof Error ? error.message : 'Erro interno do servidor ao criar empresa');
    }
  }

  async atualizarEmpresa(id: number, empresaData: EmpresaFormData): Promise<Empresa> {
    try {
      const response = await fetch(`${API_BASE_URL}/empresas/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(empresaData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao atualizar empresa');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      throw error;
    }
  }

  async inativarEmpresa(empresa: Empresa): Promise<Empresa> {
    try {
      const empresaData = {
        ...empresa,
        status: 'inativo' as const
      };

      const response = await fetch(`${API_BASE_URL}/empresas/${empresa.id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(empresaData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao inativar empresa');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao inativar empresa:', error);
      throw error;
    }
  }
}

export const empresasService = new EmpresasService(); 