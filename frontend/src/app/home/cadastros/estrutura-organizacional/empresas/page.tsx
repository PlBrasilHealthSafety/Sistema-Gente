'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Importar tipos
import { User, Empresa, Grupo, Regiao } from './types/empresa.types';

// Importar hooks
import { useEmpresas } from './hooks/useEmpresas';
import { useFiltros } from './hooks/useFiltros';
import { useFormularioEmpresa } from './hooks/useFormularioEmpresa';
import { usePermissions } from '@/hooks/usePermissions';

// Importar formatadores (remover os não usados)
import { 
  isValidCPF,
  isValidTelefone
} from '@/utils/masks';

// Interface para notificação
interface NotificationMessage {
  type: 'success' | 'error';
  message: string;
  show: boolean;
}
import FormularioBusca from './components/FormularioBusca';
import TabelaEmpresas from './components/TabelaEmpresas';
import ConfirmarExclusaoModal from './components/ConfirmarExclusaoModal';

// Importar services
import { gruposService } from './services/gruposService';
import { regioesService } from './services/regioesService';
import { empresasService } from './services/empresasService';

export default function EmpresasPage() {
  const router = useRouter();
  
  // Estados principais
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Hook de permissões
  const permissions = usePermissions(user);
  
  // Estados para dados carregados
  const [, setGrupos] = useState<Grupo[]>([]);
  const [, setRegioes] = useState<Regiao[]>([]);
  const [gruposAtivos, setGruposAtivos] = useState<Grupo[]>([]);
  const [regioesAtivas, setRegioesAtivas] = useState<Regiao[]>([]);
  const [regioesFiltroFiltradas, setRegioesFiltroFiltradas] = useState<Regiao[]>([]);
  
  // Estados para modais
  const [showNewCompanyModal, setShowNewCompanyModal] = useState(false);
  const [showEditCompanyModal, setShowEditCompanyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewCompanyModal, setShowViewCompanyModal] = useState(false);
  const [empresaEditando, setEmpresaEditando] = useState<Empresa | null>(null);
  const [empresaExcluindo, setEmpresaExcluindo] = useState<Empresa | null>(null);
  const [empresaVisualizando, setEmpresaVisualizando] = useState<Empresa | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estado para notificação
  const [notification, setNotification] = useState<NotificationMessage>({
    type: 'success',
    message: '',
    show: false
  });

  // Função para exibir notificação
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message, show: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // Função para limpar erros (usando o hook)
  const setErrors = (newErrors: Record<string, string>) => {
    // Esta função será usada para compatibilidade com o código existente
    // O controle real de erros é feito pelo hook useFormularioEmpresa
    console.log('Errors to be set:', newErrors);
  };

  // Hooks customizados
  const { 
    empresas, 
    filteredEmpresas, 
    carregarEmpresas, 
    aplicarFiltros, 
    buscarAutocomplete 
  } = useEmpresas();
  const {
    searchType,
    pesquisaTexto,
    grupoFiltro,
    regiaoFiltro,
    situacaoBusca,
    showAutocomplete,
    autocompleteResults,
    limparFiltros,
    handleSearchTypeChange,
    handlePesquisaTextoChange,
    handleGrupoFiltroChange,
    handleRegiaoFiltroChange,
    handleSituacaoBuscaChange,
    handleAutocompleteResults,
    handleSelectAutocomplete,
    setShowAutocomplete
  } = useFiltros();
  
  const {
    // Estados do formulário
    activeTab,
    tipoEstabelecimento,
    classificacaoPorte,
    cep,
    endereco,
    loadingCep,
    cepError,
    contato,
    telefone,
    email,
    observacao,
    observacaoOS,
    nomeFantasia,
    razaoSocial,
    numeroInscricao,
    cpfRepresentante,
    nomeRepresentante,
    cno,
    tipoInscricao,
    grupoSelecionado,
    regiaoSelecionada,
    cnaeDescricao,
    risco,
    errors,
    regioesFiltradas,
    gruposFiltradosPorRegiao,
    showPontoFocal,
    pontoFocalNome,
    pontoFocalDescricao,
    pontoFocalObservacoes,
    pontoFocalPrincipal,
    
    // Setters
    setActiveTab,
    setTipoEstabelecimento,
    setClassificacaoPorte,
    setNomeFantasia,
    setRazaoSocial,
    setTipoInscricao,
    setCnaeDescricao,
    setRisco,
    setObservacao,
    setObservacaoOS,
    setEmail,
    setEndereco,
    setShowPontoFocal,
    setPontoFocalNome,
    setPontoFocalDescricao,
    setPontoFocalObservacoes,
    setPontoFocalPrincipal,
    
    // Handlers
    handleCepChange,
    handleNumeroInscricaoChange,
    handleCpfRepresentanteChange,
    handleTelefoneChange,
    handleNomeRepresentanteChange,
    handleContatoChange,
    handleCnoChange,
    handleGrupoChange,
    handleRegiaoChange,
    validateForm,
    limparFormulario,
    carregarEmpresa,
    getFormData,
    initializeForm
  } = useFormularioEmpresa();

  // Funções utilitárias
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Administrador';
      case 'ADMIN': return 'Administrador';
      case 'USER': return 'Usuário';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-purple-100 text-purple-800';
      case 'ADMIN': return 'bg-blue-100 text-blue-800';
      case 'USER': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Carregar dados iniciais
  const carregarDadosIniciais = async () => {
    try {
      const [gruposData, regioesData] = await Promise.all([
        gruposService.buscarGrupos(),
        regioesService.buscarRegioes()
      ]);

      setGrupos(gruposData);
      setRegioes(regioesData);
      
      const gruposAtivosData = gruposData.filter(grupo => grupo.status === 'ativo');
      const regioesAtivasData = regioesData.filter(regiao => regiao.status === 'ativo');
      
      setGruposAtivos(gruposAtivosData);
      setRegioesAtivas(regioesAtivasData);
      setRegioesFiltroFiltradas(regioesAtivasData);
      
      const empresasResult = await carregarEmpresas();
      
      // Mostrar notificação com o número de empresas carregadas
      if (empresasResult && empresasResult.length > 0) {
        showNotification('success', `${empresasResult.length} empresa(s) carregada(s)`);
      } else {
        showNotification('error', 'Nenhuma empresa encontrada no banco de dados');
      }
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      showNotification('error', 'Erro ao carregar dados iniciais');
    }
  };

  // Handlers para filtros
  const handleProcurar = () => {
    setShowAutocomplete(false);
    const resultados = aplicarFiltros(pesquisaTexto, searchType, grupoFiltro, regiaoFiltro, situacaoBusca);
    
    if (resultados.length === 0) {
      showNotification('error', 'Nenhuma empresa encontrada com os critérios pesquisados');
    } else {
      showNotification('success', `${resultados.length} empresa(s) encontrada(s)`);
    }
  };

  const handleRecarregar = async () => {
    limparFiltros();
    await carregarEmpresas();
    showNotification('success', 'Dados recarregados com sucesso');
  };

  const handleAutocompleteSearch = (value: string) => {
    handlePesquisaTextoChange(value);
    
    if (!value.trim()) {
      handleAutocompleteResults([]);
      aplicarFiltros('', searchType, grupoFiltro, regiaoFiltro, situacaoBusca);
      return;
    }

    const resultados = buscarAutocomplete(value, searchType);
    handleAutocompleteResults(resultados);
    aplicarFiltros(value, searchType, grupoFiltro, regiaoFiltro, situacaoBusca);
  };

  // Handlers para filtros com relacionamento grupo-região
  const handleGrupoFiltroChangeWithRegions = (grupoId: string) => {
    handleGrupoFiltroChange(grupoId);
    
    if (grupoId) {
      const regioesFiltradas = regioesAtivas.filter(regiao => 
        regiao.grupo_id === parseInt(grupoId)
      );
      setRegioesFiltroFiltradas(regioesFiltradas);
    } else {
      setRegioesFiltroFiltradas(regioesAtivas);
    }
  };

  // Handlers para formulário
  const handleIncluir = async () => {
    if (!validateForm()) {
      showNotification('error', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    try {
      const empresaData = getFormData();
      await empresasService.criarEmpresa(empresaData);
      
        showNotification('success', 'Empresa cadastrada com sucesso!');
      limparFormulario(regioesAtivas, gruposAtivos);
        await carregarEmpresas();
        setShowNewCompanyModal(false);
    } catch (error) {
      console.error('Erro ao cadastrar empresa:', error);
      showNotification('error', 'Erro ao cadastrar empresa. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLimpar = () => {
    limparFormulario(regioesAtivas, gruposAtivos);
  };

  const handleRetornar = () => {
    limparFormulario(regioesAtivas, gruposAtivos);
    setShowNewCompanyModal(false);
  };

  const handleNovaEmpresa = () => {
    // Inicializar arrays filtradas antes de abrir o modal
    initializeForm(regioesAtivas, gruposAtivos);
    setShowNewCompanyModal(true);
  };

  // Handlers para edição
  const handleEditarEmpresa = (empresa: Empresa) => {
    setEmpresaEditando(empresa);
    carregarEmpresa(empresa, regioesAtivas, gruposAtivos);
    
    // Configurar regiões e grupos filtrados
    if (empresa.grupo_id) {
      handleGrupoChange(empresa.grupo_id.toString(), regioesAtivas);
    }
    
    if (empresa.regiao_id) {
      handleRegiaoChange(empresa.regiao_id.toString(), regioesAtivas, gruposAtivos);
    }
    
    setShowEditCompanyModal(true);
  };

  const handleSalvarEdicao = async () => {
    if (!validateForm()) {
      showNotification('error', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const empresaData = getFormData();
      await empresasService.atualizarEmpresa(empresaEditando!.id, empresaData);
      
        showNotification('success', 'Empresa atualizada com sucesso!');
      limparFormulario(regioesAtivas, gruposAtivos);
        await carregarEmpresas();
        setShowEditCompanyModal(false);
        setEmpresaEditando(null);
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      showNotification('error', 'Erro ao atualizar empresa. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFecharEdicao = () => {
    limparFormulario(regioesAtivas, gruposAtivos);
    setShowEditCompanyModal(false);
    setEmpresaEditando(null);
  };

  // Handlers para exclusão
  const handleExcluirEmpresa = (empresa: Empresa) => {
    setEmpresaExcluindo(empresa);
    setShowDeleteModal(true);
  };

  const handleConfirmarExclusao = async () => {
    if (!empresaExcluindo) return;
    
    setIsSubmitting(true);
    try {
      await empresasService.inativarEmpresa(empresaExcluindo);
      
        showNotification('success', 'Empresa inativada com sucesso!');
        await carregarEmpresas();
        setShowDeleteModal(false);
        setEmpresaExcluindo(null);
    } catch (error) {
      console.error('Erro ao inativar empresa:', error);
      showNotification('error', 'Erro ao inativar empresa. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelarExclusao = () => {
    setShowDeleteModal(false);
    setEmpresaExcluindo(null);
  };

  // Função para abrir modal de visualização
  const handleVisualizarEmpresa = (empresa: Empresa) => {
    setEmpresaVisualizando(empresa);
    setShowViewCompanyModal(true);
  };

  // Função para fechar modal de visualização
  const handleFecharVisualizacao = () => {
    setShowViewCompanyModal(false);
    setEmpresaVisualizando(null);
  };

  // useEffect para carregar dados iniciais
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      carregarDadosIniciais();
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // useEffect para aplicar filtros automaticamente
  useEffect(() => {
    if (empresas.length > 0) {
      aplicarFiltros(pesquisaTexto, searchType, grupoFiltro, regiaoFiltro, situacaoBusca);
    }
  }, [situacaoBusca, grupoFiltro, regiaoFiltro, empresas]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-[#00A298]/15 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00A298]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-[#00A298]/15">
      {/* Notificação Toast */}
      {notification.show && (
        <div className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-100 border border-green-400 text-green-700' 
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span className="font-medium">{notification.message}</span>
            <button
              onClick={() => setNotification(prev => ({ ...prev, show: false }))}
              className="ml-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header Superior */}
      <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="flex justify-between items-center h-16 px-4">
          <div className="w-1/3"></div>
          
          <div className="flex-1 text-center flex justify-center">
            <button onClick={() => router.push('/home')} className="cursor-pointer">
              <Image
                src="/sistemagente_logo.png"
                alt="Sistema GENTE"
                width={150}
                height={15}
                className="object-contain hover:opacity-80 transition-opacity"
                priority
              />
            </button>
          </div>
          
          <div className="flex items-center space-x-6 w-1/3 justify-end">
            <div className="text-right">
              <div className="text-sm font-medium text-[#1D3C44] mb-1">
                {user.first_name} {user.last_name}
              </div>
              <div className={`text-xs px-3 py-1 rounded-full inline-block ${getRoleColor(user.role)}`}>
                {getRoleName(user.role)}
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="bg-[#00A298] hover:bg-red-500 text-white px-5 py-2 rounded-xl text-sm transition-all duration-200 transform hover:scale-102 hover:shadow-lg cursor-pointer"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="pt-16">
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb e Navegação */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                <button 
                  onClick={() => router.push('/home/cadastros/estrutura-organizacional')}
                  className="hover:text-[#00A298] cursor-pointer"
                >
                  Estrutura Organizacional
                </button>
                <span>/</span>
                <span className="text-[#00A298] font-medium">Empresas</span>
              </div>
              
              <h1 className="text-3xl font-bold text-[#1D3C44] mb-2">
                🏢 Cadastro de Empresas
              </h1>
              <p className="text-gray-600">
                Gerencie as empresas da sua organização
              </p>
            </div>

            {/* Navegação entre seções */}
            <div className="mb-6">
              <div className="flex space-x-4">
                <button
                  onClick={() => router.push('/home/cadastros/estrutura-organizacional/grupos')}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer"
                >
                  👥 Grupos
                </button>
                <button
                  onClick={() => router.push('/home/cadastros/estrutura-organizacional/regioes')}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer"
                >
                  🗺️ Regiões
                </button>
                <button
                  onClick={() => router.push('/home/cadastros/estrutura-organizacional/empresas')}
                  className="bg-[#00A298] text-white px-4 py-2 rounded-lg font-medium"
                >
                  🏢 Empresas
                </button>
              </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="bg-white rounded-2xl shadow-xl">
              {/* Formulário de busca */}
              <FormularioBusca
                searchType={searchType}
                pesquisaTexto={pesquisaTexto}
                grupoFiltro={grupoFiltro}
                regiaoFiltro={regiaoFiltro}
                situacaoBusca={situacaoBusca}
                showAutocomplete={showAutocomplete}
                autocompleteResults={autocompleteResults}
                gruposAtivos={gruposAtivos}
                regioesFiltroFiltradas={regioesFiltroFiltradas}
                onSearchTypeChange={handleSearchTypeChange}
                onPesquisaTextoChange={handleAutocompleteSearch}
                onGrupoFiltroChange={handleGrupoFiltroChangeWithRegions}
                onRegiaoFiltroChange={handleRegiaoFiltroChange}
                onSituacaoBuscaChange={handleSituacaoBuscaChange}
                onSelectAutocomplete={handleSelectAutocomplete}
                onProcurar={handleProcurar}
                onNovaEmpresa={handleNovaEmpresa}
                onRecarregar={handleRecarregar}
              />

              {/* Container de Novo Cadastro */}
              {showNewCompanyModal && (
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-[#1D3C44] mb-4">Cadastro de Empresas</h3>
                  
                  {/* Legenda de campos obrigatórios */}
                  <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center text-sm text-blue-800">
                      <span className="text-red-500 mr-2 font-bold">*</span>
                      <span className="font-medium">Campos obrigatórios</span>
                      <span className="mx-2">•</span>
                      <span className="text-blue-600">Preencha todos os campos marcados com asterisco para continuar</span>
                    </div>
                  </div>
                  
                  {/* Abas */}
                  <div className="border-b border-gray-200 mb-6">
                    <nav className="flex space-x-8">
                      <button
                        onClick={() => setActiveTab('dados-empresa')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                          activeTab === 'dados-empresa'
                            ? 'border-[#00A298] text-[#00A298]'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Dados da Empresa
                      </button>
                      <button
                        onClick={() => setActiveTab('esocial')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                          activeTab === 'esocial'
                            ? 'border-[#00A298] text-[#00A298]'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        eSocial
                      </button>
                    </nav>
                  </div>

                  {/* Conteúdo da aba Dados da Empresa */}
                  {activeTab === 'dados-empresa' && (
                    <div className="bg-white rounded-lg p-6 shadow-sm space-y-6">
                      {/* Seção Estabelecimento */}
                      <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                        <div className="flex items-center mb-6">
                          <h4 className="text-lg font-semibold text-[#1D3C44]">Estabelecimento</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Tipo
                            </label>
                            <div className="flex gap-3">
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="radio"
                                  name="tipo"
                                  value="matriz"
                                  checked={tipoEstabelecimento === 'matriz'}
                                  onChange={(e) => setTipoEstabelecimento(e.target.value)}
                                  className="mr-2 text-[#00A298] focus:ring-[#00A298]"
                                />
                                <span className="text-sm font-medium">Matriz</span>
                              </label>
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="radio"
                                  name="tipo"
                                  value="filial"
                                  checked={tipoEstabelecimento === 'filial'}
                                  onChange={(e) => setTipoEstabelecimento(e.target.value)}
                                  className="mr-2 text-[#00A298] focus:ring-[#00A298]"
                                />
                                <span className="text-sm font-medium">Filial</span>
                              </label>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Tipo de Inscrição <span className="text-red-500">*</span>
                            </label>
                            <select 
                              name="tipoInscricao"
                              value={tipoInscricao}
                              onChange={(e) => {
                                setTipoInscricao(e.target.value);
                                if (e.target.value && errors.tipoInscricao) {
                                  setErrors({...errors, tipoInscricao: ''});
                                }
                              }}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all ${
                                errors.tipoInscricao ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                            >
                              <option value="">Selecione...</option>
                              <option value="cnpj">CNPJ</option>
                              <option value="cpf">CPF</option>
                            </select>
                            {errors.tipoInscricao && (
                              <p className="text-red-500 text-xs mt-1">{errors.tipoInscricao}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Número de Inscrição <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={numeroInscricao}
                              onChange={(e) => {
                                handleNumeroInscricaoChange(e.target.value);
                                if (e.target.value.trim() && errors.numeroInscricao) {
                                  setErrors({...errors, numeroInscricao: ''});
                                }
                              }}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all ${
                                errors.numeroInscricao ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                              placeholder="Digite o número"
                            />
                            {errors.numeroInscricao && (
                              <p className="text-red-500 text-xs mt-1">{errors.numeroInscricao}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              CNO
                            </label>
                            <input
                              type="text"
                              value={cno}
                              onChange={(e) => handleCnoChange(e.target.value)}
                              maxLength={14}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all"
                              placeholder="Digite o CNO (máx. 14 dígitos)"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Seção Dados cadastrais */}
                      <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                        <div className="flex items-center mb-6">
                          <h4 className="text-lg font-semibold text-[#1D3C44]">Dados cadastrais</h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Código
                            </label>
                            <input
                              type="text"
                              value="AUTOMÁTICO"
                              disabled
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Grupo <span className="text-red-500">*</span>
                            </label>
                            <select 
                              value={grupoSelecionado}
                              onChange={(e) => {
                                handleGrupoChange(e.target.value, regioesAtivas);
                                if (e.target.value && errors.grupoSelecionado) {
                                  setErrors({...errors, grupoSelecionado: ''});
                                }
                              }}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all ${
                                errors.grupoSelecionado ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                            >
                              <option value="">Selecione um grupo</option>
                              {gruposAtivos && Array.isArray(gruposAtivos) && gruposAtivos.map(grupo => (
                                <option key={grupo.id} value={grupo.id}>{grupo.nome}</option>
                              ))}
                            </select>
                            {errors.grupoSelecionado && (
                              <p className="text-red-500 text-xs mt-1">{errors.grupoSelecionado}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Região <span className="text-red-500">*</span>
                            </label>
                            <select 
                              value={regiaoSelecionada}
                              onChange={(e) => {
                                handleRegiaoChange(e.target.value, regioesAtivas, gruposAtivos);
                                if (e.target.value && errors.regiaoSelecionada) {
                                  setErrors({...errors, regiaoSelecionada: ''});
                                }
                              }}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all ${
                                errors.regiaoSelecionada ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                            >
                              <option value="">Selecione uma região</option>
                              {regioesFiltradas && Array.isArray(regioesFiltradas) && regioesFiltradas.map(regiao => (
                                <option key={regiao.id} value={regiao.id}>{regiao.nome}</option>
                              ))}
                            </select>
                            {errors.regiaoSelecionada && (
                              <p className="text-red-500 text-xs mt-1">{errors.regiaoSelecionada}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Razão Social <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={razaoSocial}
                              onChange={(e) => {
                                setRazaoSocial(e.target.value);
                                if (e.target.value.trim() && errors.razaoSocial) {
                                  setErrors({...errors, razaoSocial: ''});
                                }
                              }}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                                errors.razaoSocial ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                              placeholder="Digite a razão social"
                            />
                            {errors.razaoSocial && (
                              <p className="text-red-500 text-xs mt-1">{errors.razaoSocial}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nome Fantasia <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={nomeFantasia}
                              onChange={(e) => {
                                setNomeFantasia(e.target.value);
                                if (e.target.value.trim() && errors.nomeFantasia) {
                                  setErrors({...errors, nomeFantasia: ''});
                                }
                              }}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                                errors.nomeFantasia ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                              placeholder="Digite o nome fantasia"
                            />
                            {errors.nomeFantasia && (
                              <p className="text-red-500 text-xs mt-1">{errors.nomeFantasia}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Inscrição Estadual
                            </label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="Digite a inscrição estadual"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Inscrição Municipal
                            </label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="Digite a inscrição municipal"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              CNAE e Descrição <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={cnaeDescricao}
                              onChange={(e) => {
                                setCnaeDescricao(e.target.value);
                                if (e.target.value.trim() && errors.cnaeDescricao) {
                                  setErrors({...errors, cnaeDescricao: ''});
                                }
                              }}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                                errors.cnaeDescricao ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                              placeholder="Digite o CNAE e descrição"
                            />
                            {errors.cnaeDescricao && (
                              <p className="text-red-500 text-xs mt-1">{errors.cnaeDescricao}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Risco <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={risco}
                              onChange={(e) => {
                                setRisco(e.target.value);
                                if (e.target.value.trim() && errors.risco) {
                                  setErrors({...errors, risco: ''});
                                }
                              }}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                                errors.risco ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                              placeholder="Digite o risco"
                            />
                            {errors.risco && (
                              <p className="text-red-500 text-xs mt-1">{errors.risco}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Classificação Porte
                            </label>
                            <div className="flex gap-4">
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="radio"
                                  name="classificacao"
                                  value="ME"
                                  checked={classificacaoPorte === 'ME'}
                                  onChange={(e) => setClassificacaoPorte(e.target.value)}
                                  className="mr-2 text-[#00A298] focus:ring-[#00A298]"
                                />
                                <span className="text-sm font-medium">ME</span>
                              </label>
                              <label className="flex items-center cursor-pointer">
                                <input
                                  type="radio"
                                  name="classificacao"
                                  value="EPP"
                                  checked={classificacaoPorte === 'EPP'}
                                  onChange={(e) => setClassificacaoPorte(e.target.value)}
                                  className="mr-2 text-[#00A298] focus:ring-[#00A298]"
                                />
                                <span className="text-sm font-medium">EPP</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Seção Representante legal */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-4 bg-gray-100 px-3 py-2 rounded">Representante legal</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nome do representante legal
                            </label>
                            <input
                              type="text"
                              value={nomeRepresentante}
                              onChange={(e) => handleNomeRepresentanteChange(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="Digite o nome do representante (apenas letras)"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              CPF
                            </label>
                            <input
                              type="text"
                              value={cpfRepresentante}
                              onChange={(e) => handleCpfRepresentanteChange(e.target.value)}
                              maxLength={14}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="000.000.000-00"
                            />
                            {cpfRepresentante && !isValidCPF(cpfRepresentante) && (
                              <p className="text-red-500 text-xs mt-1">CPF inválido</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Assinatura digital
                            </label>
                            <div className="space-y-2">
                              <input
                                type="file"
                                accept="image/*"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent text-sm"
                              />
                              <p className="text-xs text-gray-500">A imagem deve ter tamanho de 8,5cm x 3cm</p>
                              <div className="flex gap-2">
                                <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-all duration-200">
                                  INCLUIR ASSINATURA
                                </button>
                                <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-all duration-200">
                                  EXCLUIR ASSINATURA
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Seção Informações de contato */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-4 bg-gray-100 px-3 py-2 rounded">Informações de contato</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              CEP <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={cep}
                              onChange={(e) => {
                                handleCepChange(e.target.value);
                                if (e.target.value.trim() && errors.cep) {
                                  setErrors({...errors, cep: ''});
                                }
                              }}
                              maxLength={9}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                                cepError || errors.cep ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                              placeholder="00000-000"
                            />
                            {loadingCep && <p className="text-xs text-blue-500 mt-1">Buscando CEP...</p>}
                            {cepError && <p className="text-xs text-red-500 mt-1">{cepError}</p>}
                            {errors.cep && <p className="text-xs text-red-500 mt-1">{errors.cep}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Tipo de logradouro
                            </label>
                            <select 
                              value={endereco.tipoLogradouro}
                              onChange={(e) => setEndereco({...endereco, tipoLogradouro: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                            >
                              <option value="">Selecione...</option>
                              <option value="Rua">Rua</option>
                              <option value="Avenida">Avenida</option>
                              <option value="Travessa">Travessa</option>
                              <option value="Alameda">Alameda</option>
                              <option value="Praça">Praça</option>
                              <option value="Estrada">Estrada</option>
                            </select>
                          </div>

                          <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Logradouro
                            </label>
                            <input
                              type="text"
                              value={endereco.logradouro}
                              onChange={(e) => setEndereco({...endereco, logradouro: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="Nome da rua"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Número <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={endereco.numero}
                              onChange={(e) => {
                                setEndereco({...endereco, numero: e.target.value});
                                if (e.target.value.trim() && errors.numeroEndereco) {
                                  setErrors({...errors, numeroEndereco: ''});
                                }
                              }}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                                errors.numeroEndereco ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                              placeholder="Número"
                            />
                            {errors.numeroEndereco && (
                              <p className="text-red-500 text-xs mt-1">{errors.numeroEndereco}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Complemento
                            </label>
                            <input
                              type="text"
                              value={endereco.complemento}
                              onChange={(e) => setEndereco({...endereco, complemento: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="Apartamento, sala, etc."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              UF
                            </label>
                            <select 
                              value={endereco.uf}
                              onChange={(e) => setEndereco({...endereco, uf: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                            >
                              <option value="">Selecione...</option>
                              <option value="AC">AC</option>
                              <option value="AL">AL</option>
                              <option value="AP">AP</option>
                              <option value="AM">AM</option>
                              <option value="BA">BA</option>
                              <option value="CE">CE</option>
                              <option value="DF">DF</option>
                              <option value="ES">ES</option>
                              <option value="GO">GO</option>
                              <option value="MA">MA</option>
                              <option value="MT">MT</option>
                              <option value="MS">MS</option>
                              <option value="MG">MG</option>
                              <option value="PA">PA</option>
                              <option value="PB">PB</option>
                              <option value="PR">PR</option>
                              <option value="PE">PE</option>
                              <option value="PI">PI</option>
                              <option value="RJ">RJ</option>
                              <option value="RN">RN</option>
                              <option value="RS">RS</option>
                              <option value="RO">RO</option>
                              <option value="RR">RR</option>
                              <option value="SC">SC</option>
                              <option value="SP">SP</option>
                              <option value="SE">SE</option>
                              <option value="TO">TO</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Cidade
                            </label>
                            <input
                              type="text"
                              value={endereco.cidade}
                              onChange={(e) => setEndereco({...endereco, cidade: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="Nome da cidade"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Bairro
                            </label>
                            <input
                              type="text"
                              value={endereco.bairro}
                              onChange={(e) => setEndereco({...endereco, bairro: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="Nome do bairro"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Contato
                            </label>
                            <input
                              type="text"
                              value={contato}
                              onChange={(e) => handleContatoChange(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="Nome do contato (apenas letras)"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Telefone
                            </label>
                            <input
                              type="tel"
                              value={telefone}
                              onChange={(e) => handleTelefoneChange(e.target.value)}
                              maxLength={15}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="(00) 00000-0000"
                            />
                            {telefone && !isValidTelefone(telefone) && (
                              <p className="text-red-500 text-xs mt-1">Telefone inválido (10 ou 11 dígitos)</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              E-mail
                            </label>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="email@exemplo.com"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Seção Alertas da Empresa */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-4 bg-gray-100 px-3 py-2 rounded">Alertas da Empresa</h4>
                        <div className="text-center py-4 text-gray-500 text-sm">
                          Nenhum alerta configurado
                        </div>
                      </div>

                      {/* Seção Informações adicionais */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-4 bg-gray-100 px-3 py-2 rounded">Informações adicionais</h4>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Observação
                            </label>
                            <textarea
                              rows={3}
                              value={observacao}
                              onChange={(e) => setObservacao(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="Digite observações gerais sobre a empresa..."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Observação para Ordem de Serviço
                            </label>
                            <textarea
                              rows={3}
                              value={observacaoOS}
                              onChange={(e) => setObservacaoOS(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="Digite observações específicas para ordens de serviço..."
                            />
                            
                            {/* Botão para expandir Ponto Focal - apenas para usuários com permissão */}
                            {permissions.canViewSensitive && (
                              <div className="mt-3 flex items-center">
                                <button
                                  type="button"
                                  onClick={() => setShowPontoFocal(!showPontoFocal)}
                                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 hover:border-[#1D3C44] cursor-pointer ${
                                    showPontoFocal 
                                      ? 'bg-[#00A298] border-[#00A298] text-white' 
                                      : 'border-[#00A298] text-[#00A298] hover:bg-[#00A298]/10'
                                  }`}
                                >
                                  <span className="text-sm font-bold">
                                    {showPontoFocal ? '−' : '+'}
                                  </span>
                                </button>
                                <span className="ml-2 text-sm font-medium text-gray-700">
                                  Ponto Focal
                                </span>
                              </div>
                            )}

                            {/* Seção expandível do Ponto Focal */}
                            {permissions.canViewSensitive && showPontoFocal && (
                              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg transition-all duration-300">
                                <div className="space-y-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Nome do Ponto Focal
                                    </label>
                                    <input
                                      type="text"
                                      value={pontoFocalNome}
                                      onChange={(e) => setPontoFocalNome(e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                                      placeholder="Digite o nome do ponto focal..."
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Descrição do Ponto Focal
                                    </label>
                                    <textarea
                                      rows={3}
                                      value={pontoFocalDescricao}
                                      onChange={(e) => setPontoFocalDescricao(e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                                      placeholder="Digite a descrição do ponto focal..."
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      Observações Importantes
                                    </label>
                                    <textarea
                                      rows={2}
                                      value={pontoFocalObservacoes}
                                      onChange={(e) => setPontoFocalObservacoes(e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                                      placeholder="Observações rápidas..."
                                    />
                                  </div>
                                  <div className="flex items-center space-x-2 pt-2">
                                    <input
                                      type="checkbox"
                                      id="pontoFocalPrincipal"
                                      checked={pontoFocalPrincipal}
                                      onChange={(e) => setPontoFocalPrincipal(e.target.checked)}
                                      className="w-4 h-4 text-[#00A298] bg-gray-100 border-gray-300 rounded focus:ring-[#00A298] focus:ring-2"
                                    />
                                    <label htmlFor="pontoFocalPrincipal" className="text-sm font-medium text-gray-700 cursor-pointer">
                                      Marcar como Ponto Focal Principal
                                    </label>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Botões de ação */}
                      <div className="flex gap-3 pt-4 border-t border-gray-200">
                        {permissions.empresas.canCreate && (
                          <button 
                            onClick={handleIncluir}
                            disabled={isSubmitting}
                            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? 'INCLUINDO...' : 'INCLUIR'}
                          </button>
                        )}
                        <button 
                          onClick={handleLimpar}
                          className="bg-blue-400 hover:bg-blue-500 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                        >
                          LIMPAR
                        </button>
                        <button
                          onClick={handleRetornar}
                          className="bg-gray-400 hover:bg-gray-500 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                        >
                          RETORNAR
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Conteúdo da aba eSocial */}
                  {activeTab === 'esocial' && (
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <div className="text-center py-8 text-gray-500">
                        <p>Conteúdo da aba eSocial será implementado aqui.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tabela de resultados */}
              {!showNewCompanyModal && (
                <TabelaEmpresas
                  empresas={filteredEmpresas}
                  pesquisaTexto={pesquisaTexto}
                  onEditar={handleEditarEmpresa}
                  onExcluir={handleExcluirEmpresa}
                  onVisualizar={handleVisualizarEmpresa}
                  permissions={{
                    canEdit: permissions.empresas.canEdit,
                    canDelete: permissions.empresas.canDelete,
                    canViewSensitive: permissions.canViewSensitive
                  }}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal de Visualização */}
      {showViewCompanyModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-bold text-[#1D3C44] mb-4">Visualizar Empresa</h3>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Dados da empresa</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Fantasia
                    </label>
                    <input
                      type="text"
                      value={empresaVisualizando?.nome_fantasia || ''}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Razão Social
                    </label>
                    <input
                      type="text"
                      value={empresaVisualizando?.razao_social || ''}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CPF ou CNPJ
                    </label>
                    <input
                      type="text"
                      value={empresaVisualizando?.numero_inscricao || ''}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Código
                    </label>
                    <input
                      type="text"
                      value={empresaVisualizando?.codigo || ''}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grupo
                    </label>
                    <input
                      type="text"
                      value={empresaVisualizando?.grupo?.nome || 'Não informado'}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Região
                    </label>
                    <input
                      type="text"
                      value={empresaVisualizando?.regiao?.nome || 'Não informado'}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CNAE e Descrição
                    </label>
                    <input
                      type="text"
                      value={empresaVisualizando?.cnae_descricao || 'Não informado'}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Risco
                    </label>
                    <input
                      type="text"
                      value={empresaVisualizando?.risco || 'Não informado'}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Endereço
                    </label>
                    <input
                      type="text"
                      value={empresaVisualizando?.endereco_logradouro ? 
                        `${empresaVisualizando.endereco_logradouro}${empresaVisualizando.endereco_numero ? `, ${empresaVisualizando.endereco_numero}` : ''}${empresaVisualizando.endereco_complemento ? `, ${empresaVisualizando.endereco_complemento}` : ''}${empresaVisualizando.endereco_bairro ? `, ${empresaVisualizando.endereco_bairro}` : ''}${empresaVisualizando.endereco_cidade ? `, ${empresaVisualizando.endereco_cidade}` : ''}${empresaVisualizando.endereco_uf ? ` - ${empresaVisualizando.endereco_uf}` : ''}`
                        : 'Não informado'
                      }
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CEP
                    </label>
                    <input
                      type="text"
                      value={empresaVisualizando?.endereco_cep || 'Não informado'}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="text"
                      value={empresaVisualizando?.contato_email || 'Não informado'}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone
                    </label>
                    <input
                      type="text"
                      value={empresaVisualizando?.contato_telefone || 'Não informado'}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Seção Ponto Focal (apenas se houver dados e usuário tiver permissão) */}
                {permissions.canViewSensitive && (empresaVisualizando?.ponto_focal_nome || empresaVisualizando?.ponto_focal_descricao || empresaVisualizando?.ponto_focal_observacoes) && (
                  <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
                    <h5 className="text-sm font-medium text-gray-700 mb-3">Informações do Ponto Focal</h5>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nome do Ponto Focal
                        </label>
                        <input
                          type="text"
                          value={empresaVisualizando?.ponto_focal_nome || ''}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Descrição do Ponto Focal
                        </label>
                        <textarea
                          value={empresaVisualizando?.ponto_focal_descricao || ''}
                          readOnly
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Observações Importantes
                        </label>
                        <textarea
                          value={empresaVisualizando?.ponto_focal_observacoes || ''}
                          readOnly
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                        />
                      </div>
                      <div className="flex items-center space-x-2 pt-2">
                        <input
                          type="checkbox"
                          id="pontoFocalPrincipalView"
                          checked={empresaVisualizando?.ponto_focal_principal || false}
                          readOnly
                          className="w-4 h-4 text-[#00A298] bg-gray-100 border-gray-300 rounded cursor-not-allowed"
                        />
                        <label htmlFor="pontoFocalPrincipalView" className="text-sm font-medium text-gray-700">
                          Ponto Focal Principal
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleFecharVisualizacao}
                    className="bg-gray-400 hover:bg-gray-500 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    FECHAR
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {showEditCompanyModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-bold text-[#1D3C44] mb-4">Editar Empresa</h3>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Dados da empresa</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Fantasia <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={nomeFantasia}
                      onChange={(e) => {
                        setNomeFantasia(e.target.value);
                        if (e.target.value.trim() && errors.nomeFantasia) {
                          setErrors({...errors, nomeFantasia: ''});
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                        errors.nomeFantasia ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Digite o nome fantasia"
                    />
                    {errors.nomeFantasia && (
                      <p className="text-red-500 text-xs mt-1">{errors.nomeFantasia}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Razão Social <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={razaoSocial}
                      onChange={(e) => {
                        setRazaoSocial(e.target.value);
                        if (e.target.value.trim() && errors.razaoSocial) {
                          setErrors({...errors, razaoSocial: ''});
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                        errors.razaoSocial ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Digite a razão social"
                    />
                    {errors.razaoSocial && (
                      <p className="text-red-500 text-xs mt-1">{errors.razaoSocial}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grupo <span className="text-red-500">*</span>
                    </label>
                    <select 
                      value={grupoSelecionado}
                      onChange={(e) => {
                        handleGrupoChange(e.target.value, regioesAtivas);
                        if (e.target.value && errors.grupoSelecionado) {
                          setErrors({...errors, grupoSelecionado: ''});
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                        errors.grupoSelecionado ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Selecione um grupo</option>
                      {gruposFiltradosPorRegiao && Array.isArray(gruposFiltradosPorRegiao) && gruposFiltradosPorRegiao.map(grupo => (
                        <option key={grupo.id} value={grupo.id}>{grupo.nome}</option>
                      ))}
                    </select>
                    {errors.grupoSelecionado && (
                      <p className="text-red-500 text-xs mt-1">{errors.grupoSelecionado}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Região <span className="text-red-500">*</span>
                    </label>
                    <select 
                      value={regiaoSelecionada}
                      onChange={(e) => {
                        handleRegiaoChange(e.target.value, regioesAtivas, gruposAtivos);
                        if (e.target.value && errors.regiaoSelecionada) {
                          setErrors({...errors, regiaoSelecionada: ''});
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                        errors.regiaoSelecionada ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Selecione uma região</option>
                      {regioesFiltradas && Array.isArray(regioesFiltradas) && regioesFiltradas.map(regiao => (
                        <option key={regiao.id} value={regiao.id}>{regiao.nome}</option>
                      ))}
                    </select>
                    {errors.regiaoSelecionada && (
                      <p className="text-red-500 text-xs mt-1">{errors.regiaoSelecionada}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CNAE e Descrição <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={cnaeDescricao}
                      onChange={(e) => {
                        setCnaeDescricao(e.target.value);
                        if (e.target.value.trim() && errors.cnaeDescricao) {
                          setErrors({...errors, cnaeDescricao: ''});
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                        errors.cnaeDescricao ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Digite o CNAE e descrição"
                    />
                    {errors.cnaeDescricao && (
                      <p className="text-red-500 text-xs mt-1">{errors.cnaeDescricao}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Risco <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={risco}
                      onChange={(e) => {
                        setRisco(e.target.value);
                        if (e.target.value.trim() && errors.risco) {
                          setErrors({...errors, risco: ''});
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                        errors.risco ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Digite o risco"
                    />
                    {errors.risco && (
                      <p className="text-red-500 text-xs mt-1">{errors.risco}</p>
                    )}
                  </div>
                </div>

                {/* Seção Ponto Focal - apenas para usuários com permissão */}
                {permissions.canViewSensitive && (
                  <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center mb-4">
                      <button
                        type="button"
                        onClick={() => setShowPontoFocal(!showPontoFocal)}
                        className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 hover:border-[#1D3C44] cursor-pointer ${
                          showPontoFocal 
                            ? 'bg-[#00A298] border-[#00A298] text-white' 
                            : 'border-[#00A298] text-[#00A298] hover:bg-[#00A298]/10'
                        }`}
                      >
                        <span className="text-sm font-bold">
                          {showPontoFocal ? '−' : '+'}
                        </span>
                      </button>
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        Ponto Focal
                      </span>
                    </div>

                    {/* Seção expandível do Ponto Focal */}
                    {showPontoFocal && (
                      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg transition-all duration-300">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nome do Ponto Focal
                            </label>
                            <input
                              type="text"
                              value={pontoFocalNome}
                              onChange={(e) => setPontoFocalNome(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="Digite o nome do ponto focal..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Descrição do Ponto Focal
                            </label>
                            <textarea
                              rows={3}
                              value={pontoFocalDescricao}
                              onChange={(e) => setPontoFocalDescricao(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="Digite a descrição do ponto focal..."
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Observações Importantes
                            </label>
                            <textarea
                              rows={2}
                              value={pontoFocalObservacoes}
                              onChange={(e) => setPontoFocalObservacoes(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="Observações rápidas para reuniões..."
                            />
                          </div>
                          <div className="flex items-center space-x-2 pt-2">
                            <input
                              type="checkbox"
                              id="pontoFocalPrincipalEdit"
                              checked={pontoFocalPrincipal}
                              onChange={(e) => setPontoFocalPrincipal(e.target.checked)}
                              className="w-4 h-4 text-[#00A298] bg-gray-100 border-gray-300 rounded focus:ring-[#00A298] focus:ring-2"
                            />
                            <label htmlFor="pontoFocalPrincipalEdit" className="text-sm font-medium text-gray-700 cursor-pointer">
                              Marcar como Ponto Focal Principal
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSalvarEdicao}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'SALVANDO...' : 'SALVAR'}
                  </button>
                  <button
                    onClick={handleLimpar}
                    className="bg-blue-400 hover:bg-blue-500 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    LIMPAR
                  </button>
                  <button
                    onClick={handleFecharEdicao}
                    className="bg-gray-400 hover:bg-gray-500 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    RETORNAR
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Inativação */}
      {showDeleteModal && empresaExcluindo && (
        <ConfirmarExclusaoModal
          empresa={empresaExcluindo}
          isSubmitting={isSubmitting}
          onConfirmar={handleConfirmarExclusao}
          onCancelar={handleCancelarExclusao}
        />
      )}
    </div>
  );
} 