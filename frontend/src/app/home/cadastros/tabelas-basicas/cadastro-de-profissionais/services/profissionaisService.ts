import { Profissional, ProfissionalFormData } from '../types/profissional.types';

class ProfissionaisService {
  private baseUrl = 'http://localhost:3001/api';

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
      // Por enquanto retorna dados mock até a API estar pronta
      const mockData: Profissional[] = [
        {
          id: 1,
          nome: 'Dr. João Silva',
          nacionalidade: 'Brasileiro',
          cpf: '123.456.789-00',
          categoria: 'Médico',
          sigla_conselho: 'CRM',
          numero_conselho: '12345',
          reg_conselho: '12345',
          uf_conselho: 'SP',
          cep: '01310-100',
          tipo_logradouro: 'Avenida',
          logradouro: 'Paulista',
          numero: '1000',
          uf_endereco: 'SP',
          cidade: 'São Paulo',
          bairro: 'Bela Vista',
          email: 'joao.silva@email.com',
          ddd: '11',
          celular: '99999-9999',
          agendamento_horario: false,
          profissional_externo: false,
          situacao: 'ativo',
          externo: false,
          created_by: 1,
          updated_by: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          nome: 'Dra. Maria Santos',
          nacionalidade: 'Brasileira',
          cpf: '987.654.321-00',
          categoria: 'Enfermeiro',
          sigla_conselho: 'COREN',
          numero_conselho: '54321',
          reg_conselho: '54321',
          uf_conselho: 'RJ',
          cep: '22071-900',
          tipo_logradouro: 'Rua',
          logradouro: 'das Flores',
          numero: '500',
          uf_endereco: 'RJ',
          cidade: 'Rio de Janeiro',
          bairro: 'Copacabana',
          email: 'maria.santos@email.com',
          ddd: '21',
          celular: '88888-8888',
          agendamento_horario: true,
          profissional_externo: true,
          situacao: 'ativo',
          externo: true,
          ofensor: 'Clínica B',
          clinica: 'Clínica Norte',
          created_by: 1,
          updated_by: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];

      return mockData;
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error);
      throw new Error('Erro ao buscar profissionais');
    }
  }

  async criarProfissional(profissionalData: ProfissionalFormData): Promise<Profissional> {
    try {
      // Por enquanto simula criação
      const novoProfissional: Profissional = {
        id: Date.now(), // ID temporário
        ...profissionalData,
        numero_conselho: profissionalData.reg_conselho,
        externo: profissionalData.profissional_externo,
        situacao: profissionalData.situacao || 'ativo',
        created_by: 1,
        updated_by: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return novoProfissional;
    } catch (error) {
      console.error('Erro ao criar profissional:', error);
      throw new Error('Erro ao criar profissional');
    }
  }

  async atualizarProfissional(id: number, profissionalData: ProfissionalFormData): Promise<Profissional> {
    try {
      // Por enquanto simula atualização
      const profissionalAtualizado: Profissional = {
        id,
        ...profissionalData,
        numero_conselho: profissionalData.reg_conselho,
        externo: profissionalData.profissional_externo,
        situacao: profissionalData.situacao || 'ativo',
        created_by: 1,
        updated_by: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return profissionalAtualizado;
    } catch (error) {
      console.error('Erro ao atualizar profissional:', error);
      throw new Error('Erro ao atualizar profissional');
    }
  }

  async inativarProfissional(profissional: Profissional): Promise<Profissional> {
    try {
      // Por enquanto simula inativação
      const profissionalInativado = {
        ...profissional,
        situacao: 'inativo' as const,
        updated_at: new Date().toISOString()
      };

      return profissionalInativado;
    } catch (error) {
      console.error('Erro ao inativar profissional:', error);
      throw new Error('Erro ao inativar profissional');
    }
  }
}

export const profissionaisService = new ProfissionaisService(); 