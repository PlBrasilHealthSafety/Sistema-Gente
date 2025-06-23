import { useState, useCallback } from 'react';
import { Empresa } from '../types/empresa.types';
import { empresasService } from '../services/empresasService';

export const useEmpresas = () => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [filteredEmpresas, setFilteredEmpresas] = useState<Empresa[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const carregarEmpresas = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await empresasService.buscarEmpresas();
      setEmpresas(result);
      setFilteredEmpresas(result);
      return result;
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      setEmpresas([]);
      setFilteredEmpresas([]);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const aplicarFiltros = useCallback((
    texto: string = '',
    tipo: string = 'nome',
    grupo: string = '',
    regiao: string = '',
    situacao: string = 'ativo'
  ) => {
    if (!Array.isArray(empresas) || empresas.length === 0) {
      setFilteredEmpresas([]);
      return [];
    }

    let filtered = empresas;

    // Filtrar por texto baseado no tipo de pesquisa
    if (texto.trim()) {
      filtered = filtered.filter(empresa => {
        let match = false;
        switch (tipo) {
          case 'nome':
            match = empresa.nome_fantasia.toLowerCase().includes(texto.toLowerCase());
            break;
          case 'n de inscrição':
            match = empresa.numero_inscricao?.includes(texto) || false;
            break;
          case 'razao':
            match = empresa.razao_social.toLowerCase().includes(texto.toLowerCase());
            break;
          case 'codigo':
            match = empresa.codigo.includes(texto);
            break;
          case 'regiao':
            match = empresa.regiao?.nome.toLowerCase().includes(texto.toLowerCase()) || false;
            break;
          default:
            match = false;
        }
        return match;
      });
    }

    // Filtrar por grupo se houver seleção
    if (grupo) {
      filtered = filtered.filter(empresa => 
        empresa.grupo_id === parseInt(grupo)
      );
    }

    // Filtrar por região se houver seleção
    if (regiao) {
      filtered = filtered.filter(empresa => 
        empresa.regiao_id === parseInt(regiao)
      );
    }

    // Filtrar por situação se não for "todos"
    if (situacao && situacao !== 'todos') {
      const status = situacao === 'ativo' ? 'ativo' : 'inativo';
      filtered = filtered.filter(empresa => empresa.status === status);
    }

    setFilteredEmpresas(filtered);
    return filtered;
  }, [empresas]);

  const buscarAutocomplete = useCallback((
    value: string,
    tipo: string = 'nome'
  ): Empresa[] => {
    if (!value.trim() || !Array.isArray(empresas)) {
      return [];
    }

    const filtered = empresas.filter(empresa => {
      let match = false;
      switch (tipo) {
        case 'nome':
          match = empresa.nome_fantasia.toLowerCase().includes(value.toLowerCase());
          break;
        case 'n de inscrição':
          match = empresa.numero_inscricao?.includes(value) || false;
          break;
        case 'razao':
          match = empresa.razao_social.toLowerCase().includes(value.toLowerCase());
          break;
        case 'codigo':
          match = empresa.codigo.includes(value);
          break;
        case 'regiao':
          match = empresa.regiao?.nome.toLowerCase().includes(value.toLowerCase()) || false;
          break;
        default:
          match = false;
      }
      return match;
    }).slice(0, 5); // Limitar a 5 resultados

    return filtered;
  }, [empresas]);

  return {
    empresas,
    filteredEmpresas,
    isLoading,
    carregarEmpresas,
    aplicarFiltros,
    buscarAutocomplete,
    setFilteredEmpresas
  };
}; 