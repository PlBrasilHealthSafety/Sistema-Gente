import { useState } from 'react';
import { Empresa } from '../types/empresa.types';

export const useFiltros = () => {
  // Estados de busca
  const [searchType, setSearchType] = useState('nome');
  const [pesquisaTexto, setPesquisaTexto] = useState('');
  const [grupoFiltro, setGrupoFiltro] = useState('');
  const [regiaoFiltro, setRegiaoFiltro] = useState('');
  const [situacaoBusca, setSituacaoBusca] = useState('ativo');

  // Estados do autocomplete
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteResults, setAutocompleteResults] = useState<Empresa[]>([]);

  // Função para limpar todos os filtros
  const limparFiltros = () => {
    setPesquisaTexto('');
    setGrupoFiltro('');
    setRegiaoFiltro('');
    setSituacaoBusca('ativo');
    setShowAutocomplete(false);
    setAutocompleteResults([]);
  };

  // Função para obter placeholder baseado no tipo de pesquisa
  const getPlaceholder = (type: string) => {
    switch (type) {
      case 'nome':
        return 'Digite o nome fantasia...';
      case 'n de inscrição':
        return 'Digite o n° de inscrição...';
      case 'razao':
        return 'Digite a razão social...';
      case 'codigo':
        return 'Digite o código...';
      case 'regiao':
        return 'Digite a região...';
      default:
        return 'Digite para buscar...';
    }
  };

  // Função para definir texto baseado no tipo de pesquisa para autocomplete
  const getTextoParaAutocomplete = (empresa: Empresa, tipo: string): string => {
    switch (tipo) {
      case 'nome':
        return empresa.nome_fantasia;
      case 'n de inscrição':
        return empresa.numero_inscricao || '';
      case 'razao':
        return empresa.razao_social;
      case 'codigo':
        return empresa.codigo;
      case 'regiao':
        return empresa.regiao?.nome || '';
      default:
        return empresa.nome_fantasia;
    }
  };

  // Handlers para mudanças
  const handleSearchTypeChange = (type: string) => {
    setSearchType(type);
    setPesquisaTexto(''); // Limpar texto ao mudar tipo
    setShowAutocomplete(false);
    setAutocompleteResults([]);
  };

  const handlePesquisaTextoChange = (texto: string) => {
    setPesquisaTexto(texto);
  };

  const handleGrupoFiltroChange = (grupo: string) => {
    setGrupoFiltro(grupo);
    // Limpar região quando grupo mudar
    setRegiaoFiltro('');
  };

  const handleRegiaoFiltroChange = (regiao: string) => {
    setRegiaoFiltro(regiao);
  };

  const handleSituacaoBuscaChange = (situacao: string) => {
    setSituacaoBusca(situacao);
  };

  const handleAutocompleteResults = (results: Empresa[]) => {
    setAutocompleteResults(results);
    setShowAutocomplete(results.length > 0);
  };

  const handleSelectAutocomplete = (empresa: Empresa) => {
    const texto = getTextoParaAutocomplete(empresa, searchType);
    setPesquisaTexto(texto);
    setShowAutocomplete(false);
  };

  return {
    // Estados
    searchType,
    pesquisaTexto,
    grupoFiltro,
    regiaoFiltro,
    situacaoBusca,
    showAutocomplete,
    autocompleteResults,
    
    // Funções utilitárias
    getPlaceholder,
    getTextoParaAutocomplete,
    limparFiltros,
    
    // Handlers
    handleSearchTypeChange,
    handlePesquisaTextoChange,
    handleGrupoFiltroChange,
    handleRegiaoFiltroChange,
    handleSituacaoBuscaChange,
    handleAutocompleteResults,
    handleSelectAutocomplete,
    
    // Setters diretos (quando necessário)
    setSearchType,
    setPesquisaTexto,
    setGrupoFiltro,
    setRegiaoFiltro,
    setSituacaoBusca,
    setShowAutocomplete,
    setAutocompleteResults
  };
}; 