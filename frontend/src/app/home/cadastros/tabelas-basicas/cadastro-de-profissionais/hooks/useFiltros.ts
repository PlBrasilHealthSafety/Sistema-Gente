import { useState, useMemo } from 'react';
import { Profissional } from '../types/profissional.types';

interface FiltrosType {
  tipoPesquisa: string;
  nomeBusca: string;
  situacaoBusca: string;
}

export const useFiltros = (profissionais: Profissional[] = []) => {
  const [tipoPesquisa, setTipoPesquisa] = useState('nome');
  const [nomeBusca, setNomeBusca] = useState('');
  const [situacaoBusca, setSituacaoBusca] = useState('ativo');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteResults, setAutocompleteResults] = useState<Profissional[]>([]);

  // Objeto filtros para compatibilidade
  const filtros: FiltrosType = {
    tipoPesquisa,
    nomeBusca,
    situacaoBusca
  };

  // Profissionais filtrados
  const profissionaisFiltrados = useMemo(() => {
    if (!profissionais || profissionais.length === 0) return [];

    return profissionais.filter(profissional => {
      // Filtro por situação
      if (situacaoBusca !== 'todos') {
        const status = profissional.situacao || profissional.status || 'ativo';
        const situacaoMatch = situacaoBusca === 'ativo' 
          ? status === 'ativo' 
          : status === 'inativo';
        if (!situacaoMatch) return false;
      }

      // Filtro por busca
      if (nomeBusca.trim()) {
        switch (tipoPesquisa) {
          case 'nome':
            return profissional.nome?.toLowerCase().includes(nomeBusca.toLowerCase());
          case 'categoria':
            return profissional.categoria?.toLowerCase().includes(nomeBusca.toLowerCase());
          case 'numero_conselho':
            return profissional.numero_conselho?.toLowerCase().includes(nomeBusca.toLowerCase());
          default:
            return true;
        }
      }

      return true;
    });
  }, [profissionais, tipoPesquisa, nomeBusca, situacaoBusca]);

  // Função para atualizar filtros
  const atualizarFiltro = (campo: string, valor: string) => {
    switch (campo) {
      case 'tipoPesquisa':
        setTipoPesquisa(valor);
        setNomeBusca(''); // Limpar busca ao trocar tipo
        setShowAutocomplete(false);
        break;
      case 'nomeBusca':
        setNomeBusca(valor);
        break;
      case 'situacaoBusca':
        setSituacaoBusca(valor);
        break;
    }
  };

  // Função para aplicar filtros (pode ser expandida no futuro)
  const aplicarFiltros = () => {
    // Por enquanto, os filtros são aplicados automaticamente via useMemo
    // Esta função pode ser expandida para funcionalidades adicionais
    console.log('Aplicando filtros:', filtros);
  };

  const limparFiltros = () => {
    setTipoPesquisa('nome');
    setNomeBusca('');
    setSituacaoBusca('ativo');
    setShowAutocomplete(false);
    setAutocompleteResults([]);
  };

  const getPlaceholder = (type?: string) => {
    const searchType = type || tipoPesquisa;
    switch (searchType) {
      case 'nome':
        return 'Digite o nome do profissional...';
      case 'categoria':
        return 'Digite a categoria (ex: Médico, Enfermeiro)...';
      case 'numero_conselho':
        return 'Digite o número do conselho...';
      default:
        return 'Digite para pesquisar...';
    }
  };

  const getTextoParaAutocomplete = (profissional: Profissional, tipo: string): string => {
    switch (tipo) {
      case 'categoria':
        return profissional.categoria;
      case 'numero_conselho':
        return profissional.numero_conselho;
      default:
        return profissional.nome;
    }
  };

  const handleTipoPesquisaChange = (type: string) => {
    setTipoPesquisa(type);
    setNomeBusca(''); // Limpar campo ao trocar tipo
    setShowAutocomplete(false);
  };

  const handleNomeBuscaChange = (texto: string) => {
    setNomeBusca(texto);
  };

  const handleSituacaoBuscaChange = (situacao: string) => {
    setSituacaoBusca(situacao);
  };

  const handleAutocompleteResults = (results: Profissional[]) => {
    setAutocompleteResults(results);
    setShowAutocomplete(results.length > 0);
  };

  const handleSelectAutocomplete = (profissional: Profissional) => {
    const valorSelecionado = getTextoParaAutocomplete(profissional, tipoPesquisa);
    setNomeBusca(valorSelecionado);
    setShowAutocomplete(false);
  };

  return {
    // Propriedades principais
    filtros,
    profissionaisFiltrados,
    atualizarFiltro,
    aplicarFiltros,

    // Estados
    tipoPesquisa,
    nomeBusca,
    situacaoBusca,
    showAutocomplete,
    autocompleteResults,

    // Funções utilitárias
    limparFiltros,
    getPlaceholder,
    getTextoParaAutocomplete,

    // Handlers
    handleTipoPesquisaChange,
    handleNomeBuscaChange,
    handleSituacaoBuscaChange,
    handleAutocompleteResults,
    handleSelectAutocomplete,

    // Setters diretos para casos específicos
    setShowAutocomplete,
    setNomeBusca,
    setTipoPesquisa,
    setSituacaoBusca
  };
}; 