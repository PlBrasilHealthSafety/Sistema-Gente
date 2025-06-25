import { useState, useCallback } from 'react';
import { useNotification } from './useNotification';
import { Profissional } from '../types/profissional.types';
import { profissionaisService } from '../services/profissionaisService';

export const useProfissionais = () => {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [filteredProfissionais, setFilteredProfissionais] = useState<Profissional[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { showNotification } = useNotification();

  const carregarProfissionais = useCallback(async () => {
    console.log('=== CARREGANDO PROFISSIONAIS ===');
    setIsLoading(true);
    
    try {
      const data = await profissionaisService.buscarProfissionais();
      setProfissionais(data);
      setFilteredProfissionais(data);
      return data;
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
      setProfissionais([]);
      setFilteredProfissionais([]);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const aplicarFiltros = useCallback((
    busca: string = '',
    tipo: string = 'nome',
    situacao: string = 'ativo'
  ) => {
    if (!Array.isArray(profissionais) || profissionais.length === 0) {
      setFilteredProfissionais([]);
      return [];
    }

    let filtered = profissionais;

    // Filtrar baseado no tipo de pesquisa e termo de busca
    if (busca.trim()) {
      filtered = filtered.filter(profissional => {
        switch (tipo) {
          case 'nome':
            return profissional.nome.toLowerCase().includes(busca.toLowerCase());
          case 'categoria':
            return profissional.categoria.toLowerCase().includes(busca.toLowerCase());
          case 'numero_conselho':
            return profissional.numero_conselho.toLowerCase().includes(busca.toLowerCase());
          default:
            return profissional.nome.toLowerCase().includes(busca.toLowerCase());
        }
      });
    }

    // Filtrar por situação se não for "todos"
    if (situacao && situacao !== 'todos') {
      const statusBuscado = situacao === 'ativo' ? 'ativo' : 'inativo';
      filtered = filtered.filter(profissional => {
        const statusProfissional = profissional.situacao || profissional.status || 'ativo';
        return statusProfissional === statusBuscado;
      });
    }

    setFilteredProfissionais(filtered);
    return filtered;
  }, [profissionais]);

  const buscarAutocomplete = useCallback((
    value: string,
    tipo: string = 'nome'
  ): Profissional[] => {
    if (!value.trim() || !Array.isArray(profissionais)) {
      return [];
    }

    return profissionais.filter(profissional => {
      switch (tipo) {
        case 'nome':
          return profissional.nome.toLowerCase().includes(value.toLowerCase());
        case 'categoria':
          return profissional.categoria.toLowerCase().includes(value.toLowerCase());
        case 'numero_conselho':
          return profissional.numero_conselho.toLowerCase().includes(value.toLowerCase());
        default:
          return profissional.nome.toLowerCase().includes(value.toLowerCase());
      }
    }).slice(0, 5); // Limitar a 5 resultados
  }, [profissionais]);

  const criarProfissional = useCallback(async (dadosProfissional: Partial<Profissional>) => {
    try {
      setIsLoading(true);
      const novoProfissional = await profissionaisService.criarProfissional(dadosProfissional);
      showNotification('success', 'Profissional cadastrado com sucesso!');
      return { success: true, data: novoProfissional };
    } catch (error: any) {
      console.error('Erro ao criar profissional:', error);
      showNotification('error', error.message || 'Erro ao cadastrar profissional');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  const atualizarProfissional = useCallback(async (id: number, dadosProfissional: Partial<Profissional>) => {
    try {
      setIsLoading(true);
      const profissionalAtualizado = await profissionaisService.atualizarProfissional(id, dadosProfissional);
      showNotification('success', 'Profissional atualizado com sucesso!');
      return { success: true, data: profissionalAtualizado };
    } catch (error: any) {
      console.error('Erro ao atualizar profissional:', error);
      showNotification('error', error.message || 'Erro ao atualizar profissional');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  const excluirProfissional = useCallback(async (id: number) => {
    try {
      setIsLoading(true);
      await profissionaisService.excluirProfissional(id);
      showNotification('success', 'Profissional excluído com sucesso!');
      return { success: true };
    } catch (error: any) {
      console.error('Erro ao excluir profissional:', error);
      showNotification('error', error.message || 'Erro ao excluir profissional');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [showNotification]);

  return {
    profissionais,
    filteredProfissionais,
    loading: isLoading,
    carregarProfissionais,
    aplicarFiltros,
    buscarAutocomplete,
    criarProfissional,
    atualizarProfissional,
    excluirProfissional
  };
}; 