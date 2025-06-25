import { useState } from 'react';
import { Profissional } from '../types/profissional.types';

export const useFiltros = () => {
  const [tipoPesquisa, setTipoPesquisa] = useState('nome');
  const [nomeBusca, setNomeBusca] = useState('');
  const [situacaoBusca, setSituacaoBusca] = useState('ativo');
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteResults, setAutocompleteResults] = useState<Profissional[]>([]);

  const limparFiltros = () => {
    setTipoPesquisa('nome');
    setNomeBusca('');
    setSituacaoBusca('ativo');
    setShowAutocomplete(false);
    setAutocompleteResults([]);
  };

  const getPlaceholder = (type: string) => {
    switch (type) {
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