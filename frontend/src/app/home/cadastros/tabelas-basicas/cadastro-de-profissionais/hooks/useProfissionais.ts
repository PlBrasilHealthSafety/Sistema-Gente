import { useState, useCallback } from 'react';
import { Profissional } from '../types/profissional.types';
import { profissionaisService } from '../services/profissionaisService';

export const useProfissionais = () => {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [filteredProfissionais, setFilteredProfissionais] = useState<Profissional[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
      const status = situacao === 'ativo' ? 'ativo' : 'inativo';
      filtered = filtered.filter(profissional => profissional.situacao === status);
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

  return {
    profissionais,
    filteredProfissionais,
    isLoading,
    carregarProfissionais,
    aplicarFiltros,
    buscarAutocomplete
  };
}; 