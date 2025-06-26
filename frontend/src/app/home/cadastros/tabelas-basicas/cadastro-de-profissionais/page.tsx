'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatTexto } from '@/utils/masks';
import { usePermissions } from '@/hooks/usePermissions';

// Hooks customizados
import { useProfissionais } from './hooks/useProfissionais';
import { useFiltros } from './hooks/useFiltros';
import { useFormularioProfissional } from './hooks/useFormularioProfissional';
import { useNotification } from './hooks/useNotification';

// Tipos
import { User, Profissional, FormErrors } from './types/profissional.types';

// Utils
import { formatCPF } from './utils/formatters';

interface Grupo {
  id: number;
  nome: string;
}

interface Regiao {
  id: number;
  nome: string;
}

export default function CadastroProfissionaisPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Hook de permissões
  const permissions = usePermissions(user);
  
  // Hook de notificação
  const { notification, showNotification, hideNotification } = useNotification();
  
  // Hook de profissionais
  const {
    profissionais,
    loading: loadingProfissionais,
    carregarProfissionais,
    criarProfissional,
    atualizarProfissional,
    excluirProfissional
  } = useProfissionais();
  
  // Hook de filtros
  const {
    tipoPesquisa,
    nomeBusca,
    situacaoBusca,
    showAutocomplete,
    autocompleteResults,
    profissionaisFiltrados,
    setNomeBusca,
    setShowAutocomplete,
    handleTipoPesquisaChange,
    handleNomeBuscaChange,
    handleSituacaoBuscaChange,
    handleSelectAutocomplete,
    handleAutocompleteResults,
    getPlaceholder
  } = useFiltros(profissionais);
  
  // Hook de formulário
  const {
    // Estados do formulário
    nomeProfissional,
    nacionalidade,
    cpf,
    nis,
    categoria,
    siglaConselho,
    regConselho,
    ufConselho,
    regMte,
    cep,
    endereco,
    loadingCep,
    cepError,
    email,
    telefone,
    ddd,
    celular,
    observacao,
    agendamentoHorario,
    profissionalExterno,
    assinaturaDigital,
    certificadoDigital,
    situacao,
    errors,
    setErrors,
    isSubmitting,
    
    // Estados adicionais para compatibilidade
    numeroConselho,
    externo,
    ofensor,
    clinica,
    
    // Setters
    setNomeProfissional,
    setNacionalidade,
    setCpf,
    setNis,
    setCategoria,
    setSiglaConselho,
    setRegConselho,
    setUfConselho,
    setRegMte,
    setCep,
    setEndereco,
    setEmail,
    setTelefone,
    setDdd,
    setCelular,
    setObservacao,
    setAgendamentoHorario,
    setProfissionalExterno,
    setAssinaturaDigital,
    setCertificadoDigital,
    setSituacao,
    setIsSubmitting,
    setNumeroConselho,
    setExterno,
    setOfensor,
    setClinica,
    
    // Handlers
    handleCepChange,
    handleCpfChange,
    
    // Funções
    validateForm,
    limparFormulario,
    carregarProfissional,
    getFormData
  } = useFormularioProfissional();
  
  // Estados para o modal
  const [showNewProfissionalModal, setShowNewProfissionalModal] = useState(false);
  
  // Estados para modais
  const [showViewProfissionalModal, setShowViewProfissionalModal] = useState(false);
  const [showEditProfissionalModal, setShowEditProfissionalModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteDefinitivoModal, setShowDeleteDefinitivoModal] = useState(false);
  const [profissionalVisualizando, setProfissionalVisualizando] = useState<Profissional | null>(null);
  const [profissionalEditando, setProfissionalEditando] = useState<Profissional | null>(null);
  const [profissionalExcluindo, setProfissionalExcluindo] = useState<Profissional | null>(null);
  const [profissionalExcluindoDefinitivo, setProfissionalExcluindoDefinitivo] = useState<Profissional | null>(null);

  // Estados para grupos e regiões (compatibilidade)
  const [, setGrupos] = useState<Grupo[]>([]);
  const [, setRegioes] = useState<Regiao[]>([]);
  const [gruposAtivos, setGruposAtivos] = useState<Grupo[]>([]);
  const [regioesAtivas, setRegioesAtivas] = useState<Regiao[]>([]);
  const [regioesFiltroFiltradas, setRegioesFiltroFiltradas] = useState<Regiao[]>([]);

  // Variáveis derivadas para compatibilidade
  const tipoLogradouro = endereco.tipoLogradouro;
  const logradouro = endereco.logradouro;
  const numero = endereco.numero;
  const complemento = endereco.complemento;
  const ufEndereco = endereco.uf;
  const cidade = endereco.cidade;
  const bairro = endereco.bairro;

  // Função para destacar texto pesquisado
  const destacarTexto = (texto: string, busca: string) => {
    if (!busca.trim()) return texto;
    
    const regex = new RegExp(`(${busca.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const partes = texto.split(regex);
    
    return partes.map((parte, index) => {
      if (parte.toLowerCase() === busca.toLowerCase()) {
        return <span key={index} className="bg-gray-200 text-gray-700 font-medium">{parte}</span>;
      }
      return parte;
    });
  };

  // Função para filtrar profissionais em tempo real (autocomplete)
  const handleAutocompleteSearch = (value: string) => {
    if (!value.trim()) {
      setShowAutocomplete(false);
      return;
    }

    if (!Array.isArray(profissionais)) {
      setShowAutocomplete(false);
      return;
    }

    const filtered = profissionais.filter(profissional => {
      switch (tipoPesquisa) {
        case 'nome':
          return profissional.nome?.toLowerCase().includes(value.toLowerCase());
        case 'categoria':
          return profissional.categoria?.toLowerCase().includes(value.toLowerCase());
        case 'numero_conselho':
          return profissional.numero_conselho?.toLowerCase().includes(value.toLowerCase());
        default:
          return profissional.nome?.toLowerCase().includes(value.toLowerCase());
      }
    }).slice(0, 5);

    handleAutocompleteResults(filtered);
  };



  // Handler customizado para mudança de busca
  const handleCustomNomeBuscaChange = (value: string) => {
    handleNomeBuscaChange(value);
    handleAutocompleteSearch(value);
  };

  // Função para procurar profissionais
  const handleProcurar = () => {
    setShowAutocomplete(false);
    // A filtragem já é feita automaticamente pelo hook useFiltros
    const totalFiltrados = profissionaisFiltrados.length;
    
    if (totalFiltrados === 0) {
      let tipoTexto;
      switch (tipoPesquisa) {
        case 'categoria':
          tipoTexto = 'categoria';
          break;
        case 'numero_conselho':
          tipoTexto = 'número do conselho';
          break;
        default:
          tipoTexto = 'nome';
      }
      showNotification('error', `Nenhum profissional encontrado com o ${tipoTexto} pesquisado`);
    } else {
      showNotification('success', `${totalFiltrados} profissional(is) encontrado(s)`);
    }
  };

  // Função para incluir novo profissional
  const handleIncluir = async () => {
    if (!validateForm()) {
      showNotification('error', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    try {
      const dadosProfissional = getFormData();
      const result = await criarProfissional(dadosProfissional);
      
      if (result.success) {
        limparFormulario();
        await carregarProfissionais();
      setShowNewProfissionalModal(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para limpar formulário
  const handleLimpar = () => {
    limparFormulario();
  };

  // Função para retornar (fechar modal)
  const handleRetornar = () => {
    limparFormulario();
    setShowNewProfissionalModal(false);
  };

  // Função para recarregar profissionais
  const handleRecarregar = async () => {
    try {
      setNomeBusca('');
      const data = await carregarProfissionais();
      
      if (data && data.length > 0) {
        showNotification('success', `${data.length} profissional(is) carregado(s)`);
      } else {
        showNotification('error', 'Nenhum profissional encontrado no banco de dados');
      }
    } catch (error) {
      showNotification('error', 'Erro de conexão ao carregar profissionais');
    }
  };

  // Handlers para modais
  const handleVisualizarProfissional = (profissional: Profissional) => {
    setProfissionalVisualizando(profissional);
    setShowViewProfissionalModal(true);
  };

  const handleFecharVisualizacao = () => {
    setShowViewProfissionalModal(false);
    setProfissionalVisualizando(null);
  };

  const handleEditarProfissional = (profissional: Profissional) => {
    setProfissionalEditando(profissional);
    carregarProfissional(profissional);
    setShowEditProfissionalModal(true);
  };

  const handleSalvarEdicao = async () => {
    if (!validateForm()) {
      showNotification('error', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    if (!profissionalEditando) return;

    setIsSubmitting(true);
    try {
      const dadosProfissional = getFormData();
      const result = await atualizarProfissional(profissionalEditando.id, dadosProfissional);
      
      if (result.success) {
        limparFormulario();
        await carregarProfissionais();
      setShowEditProfissionalModal(false);
      setProfissionalEditando(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFecharEdicao = () => {
    limparFormulario();
    setShowEditProfissionalModal(false);
    setProfissionalEditando(null);
  };

  const handleInativarProfissional = (profissional: Profissional) => {
    setProfissionalExcluindo(profissional);
    setShowDeleteModal(true);
  };

  const handleExcluirDefinitivo = (profissional: Profissional) => {
    setProfissionalExcluindoDefinitivo(profissional);
    setShowDeleteDefinitivoModal(true);
  };

  const handleConfirmarExclusao = async () => {
    if (!profissionalExcluindo) return;

    setIsSubmitting(true);
    try {
      const result = await atualizarProfissional(profissionalExcluindo.id, { status: 'inativo' });
      
      if (result.success) {
      showNotification('success', 'Profissional inativado com sucesso!');
        await carregarProfissionais();
      setShowDeleteModal(false);
      setProfissionalExcluindo(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelarExclusao = () => {
    setShowDeleteModal(false);
    setProfissionalExcluindo(null);
  };

  const handleConfirmarExclusaoDefinitiva = async () => {
    if (!profissionalExcluindoDefinitivo) return;
    
    setIsSubmitting(true);
    try {
      const result = await excluirProfissional(profissionalExcluindoDefinitivo.id);
      
      if (result.success) {
        showNotification('success', 'Profissional excluído definitivamente!');
        await carregarProfissionais();
      }
    } finally {
      setIsSubmitting(false);
      setShowDeleteDefinitivoModal(false);
      setProfissionalExcluindoDefinitivo(null);
    }
  };

  const handleCancelarExclusaoDefinitiva = () => {
    setShowDeleteDefinitivoModal(false);
    setProfissionalExcluindoDefinitivo(null);
  };

  const handleReativarProfissional = async (profissional: Profissional) => {
    setIsSubmitting(true);
    try {
      const result = await atualizarProfissional(profissional.id, { status: 'ativo' });
      
      if (result.success) {
      showNotification('success', 'Profissional reativado com sucesso!');
        await carregarProfissionais();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Efeitos
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
      carregarProfissionais();
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router, carregarProfissionais]);

  // Funções auxiliares
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Administrador';
      case 'admin':
        return 'Administrador';
      case 'user':
        return 'Usuário';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
              onClick={() => hideNotification()}
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
          {/* Logo */}
          <div className="flex items-center w-1/3">
            <Image
              src="/logo.png"
              alt="PLBrasil Health&Safety"
              width={120}
              height={30}
              className="object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>
          
          {/* Logo do Sistema Centralizado */}
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
          
          {/* Informações do usuário e logout */}
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
        {/* Conteúdo Principal */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumb e Navegação */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                <button 
                  onClick={() => router.push('/home')}
                  className="hover:text-[#00A298] cursor-pointer"
                >
                  Tabelas Básicas
                </button>
                <span>/</span>
                <span className="text-[#00A298] font-medium">Cadastro de Profissionais</span>
              </div>
              
              <h1 className="text-3xl font-bold text-[#1D3C44] mb-2">
                👨‍⚕️ Cadastro de Profissionais
              </h1>
              <p className="text-gray-600">
                Gerencie o cadastro de profissionais do sistema
              </p>
            </div>

            {/* Conteúdo Principal */}
            <div className="bg-white rounded-2xl shadow-xl">
              {/* Formulário de busca */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-wrap gap-2 items-end">
                  <div className="flex-1 min-w-64 relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pesquisar por
                    </label>
                    <select 
                      value={tipoPesquisa}
                      onChange={(e) => {
                        handleTipoPesquisaChange(e.target.value);
                        setNomeBusca(''); // Limpar campo ao trocar tipo
                        setShowAutocomplete(false);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                    >
                      <option value="nome">Nome</option>
                      <option value="categoria">Categoria</option>
                      <option value="numero_conselho">Número Conselho</option>
                    </select>
                  </div>
                  
                  <div className="flex-1 min-w-64 relative">
                    <input
                      type="text"
                      value={nomeBusca}
                      onChange={(e) => {
                        handleCustomNomeBuscaChange(e.target.value);
                      }}
                      onFocus={() => {
                        if (nomeBusca.trim()) {
                          handleAutocompleteSearch(nomeBusca);
                        }
                      }}
                      onBlur={() => {
                        setTimeout(() => setShowAutocomplete(false), 200);
                      }}
                      placeholder={getPlaceholder()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                    />
                    
                    {/* Dropdown do autocomplete */}
                    {showAutocomplete && autocompleteResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {autocompleteResults.map((profissional) => (
                          <div
                            key={profissional.id}
                            onClick={() => handleSelectAutocomplete(profissional)}
                            className="px-4 py-3 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">{destacarTexto(profissional.nome, nomeBusca)}</div>
                            <div className="text-sm text-gray-500 mt-1">
                              <span className="text-blue-600">👨‍⚕️ {profissional.categoria}</span>
                              <span className="ml-2 text-green-600">🆔 {profissional.sigla_conselho} {profissional.numero_conselho}</span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {profissional.email && <span className="text-purple-600">📧 {profissional.email}</span>}
                              <span className={`ml-2 ${(profissional.situacao || profissional.status) === 'ativo' ? 'text-green-600' : 'text-red-600'}`}>
                                {(profissional.situacao || profissional.status) === 'ativo' ? '✅ Ativo' : '❌ Inativo'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Situação
                    </label>
                    <select 
                      value={situacaoBusca}
                      onChange={(e) => handleSituacaoBuscaChange(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                      <option value="todos">Todos</option>
                    </select>
                  </div>

                  <button 
                    onClick={handleProcurar}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer ml-2"
                  >
                    PROCURAR  
                  </button>
                  
                  <button 
                    onClick={() => setShowNewProfissionalModal(true)}
                    className="bg-[#00A298] hover:bg-[#1D3C44] text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    NOVO PROFISSIONAL
                  </button>
                  
                  <button 
                    onClick={handleRecarregar}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    RECARREGAR
                  </button>
                </div>
              </div>

              {/* Container de Novo Cadastro */}
              {showNewProfissionalModal && (
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-[#1D3C44] mb-4">Cadastro de Profissional</h3>
                  
                  {/* Legenda de campos obrigatórios */}
                  <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center text-sm text-blue-800">
                      <span className="text-red-500 mr-2 font-bold">*</span>
                      <span className="font-medium">Campos obrigatórios</span>
                      <span className="mx-2">•</span>
                      <span className="text-blue-600">Preencha todos os campos marcados com asterisco para continuar</span>
                    </div>
                  </div>

                  {/* Dados Cadastrais */}
                  <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Dados cadastrais</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          Nome <span className="text-red-500">*</span>
                          <Image src="/logo_esocial.png" alt="eSocial" width={16} height={16} className="ml-1" title="eSocial" />
                      </label>
                      <input
                        type="text"
                        value={nomeProfissional}
                          onChange={(e) => {
                            setNomeProfissional(formatTexto(e.target.value));
                            if (e.target.value.trim() && errors.nomeProfissional) {
                              setErrors((prev: FormErrors) => ({...prev, nomeProfissional: ''}));
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                            errors.nomeProfissional ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Digite o nome do profissional"
                        />
                        {errors.nomeProfissional && (
                          <p className="text-red-500 text-xs mt-1">{errors.nomeProfissional}</p>
                        )}
                    </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nacionalidade <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={nacionalidade}
                          onChange={(e) => {
                            setNacionalidade(e.target.value);
                            if (e.target.value && errors.nacionalidade) {
                              setErrors((prev: FormErrors) => ({...prev, nacionalidade: ''}));
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                            errors.nacionalidade ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Selecione a nacionalidade</option>
                          <option value="Brasileiro">Brasileiro</option>
                          <option value="Estrangeiro">Estrangeiro</option>
                        </select>
                        {errors.nacionalidade && (
                          <p className="text-red-500 text-xs mt-1">{errors.nacionalidade}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CPF <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={cpf}
                          onChange={(e) => {
                            const formattedCPF = formatCPF(e.target.value);
                            setCpf(formattedCPF);
                            if (formattedCPF.trim() && errors.cpf) {
                              setErrors((prev: FormErrors) => ({...prev, cpf: ''}));
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                            errors.cpf ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="000.000.000-00"
                          maxLength={14}
                        />
                        {errors.cpf && (
                          <p className="text-red-500 text-xs mt-1">{errors.cpf}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          NIS
                        </label>
                        <input
                          type="text"
                          value={nis}
                          onChange={(e) => {
                            const formattedNIS = e.target.value.replace(/\D/g, '').slice(0, 11);
                            setNis(formattedNIS);
                            if (formattedNIS && errors.nis) {
                              setErrors((prev: FormErrors) => ({...prev, nis: ''}));
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                            errors.nis ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="00000000000"
                          maxLength={11}
                        />
                        {errors.nis && (
                          <p className="text-red-500 text-xs mt-1">{errors.nis}</p>
                        )}
                      </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categoria <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={categoria}
                          onChange={(e) => {
                            setCategoria(e.target.value);
                            if (e.target.value && errors.categoria) {
                              setErrors((prev: FormErrors) => ({...prev, categoria: ''}));
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                            errors.categoria ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Selecione uma categoria</option>
                        <option value="Médico">Médico</option>
                        <option value="Enfermeiro">Enfermeiro</option>
                        <option value="Técnico de Enfermagem">Técnico de Enfermagem</option>
                          <option value="Auxiliar de Enfermagem">Auxiliar de Enfermagem</option>
                        <option value="Fisioterapeuta">Fisioterapeuta</option>
                        <option value="Psicólogo">Psicólogo</option>
                        <option value="Nutricionista">Nutricionista</option>
                        <option value="Fonoaudiólogo">Fonoaudiólogo</option>
                      </select>
                        {errors.categoria && (
                          <p className="text-red-500 text-xs mt-1">{errors.categoria}</p>
                        )}
                    </div>

                    <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          Sigla <span className="text-red-500">*</span>
                          <Image src="/logo_esocial.png" alt="eSocial" width={16} height={16} className="ml-1" title="eSocial" />
                      </label>
                      <select
                        value={siglaConselho}
                          onChange={(e) => {
                            setSiglaConselho(e.target.value);
                            if (e.target.value && errors.siglaConselho) {
                              setErrors((prev: FormErrors) => ({...prev, siglaConselho: ''}));
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                            errors.siglaConselho ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Selecione a sigla</option>
                          <option value="CRM">CRM</option>
                          <option value="COREN">COREN</option>
                          <option value="CREFITO">CREFITO</option>
                          <option value="CRP">CRP</option>
                          <option value="CRN">CRN</option>
                          <option value="CRFa">CRFa</option>
                      </select>
                        {errors.siglaConselho && (
                          <p className="text-red-500 text-xs mt-1">{errors.siglaConselho}</p>
                        )}
                    </div>

                    <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          Reg. Conselho <span className="text-red-500">*</span>
                          <Image src="/logo_esocial.png" alt="eSocial" width={16} height={16} className="ml-1" title="eSocial" />
                      </label>
                      <input
                        type="text"
                          value={regConselho}
                          onChange={(e) => {
                            setRegConselho(e.target.value);
                            if (e.target.value.trim() && errors.regConselho) {
                              setErrors((prev: FormErrors) => ({...prev, regConselho: ''}));
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                            errors.regConselho ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        placeholder="Digite o número do conselho"
                        />
                        {errors.regConselho && (
                          <p className="text-red-500 text-xs mt-1">{errors.regConselho}</p>
                        )}
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          UF <span className="text-red-500">*</span>
                          <Image src="/logo_esocial.png" alt="eSocial" width={16} height={16} className="ml-1" title="eSocial" />
                        </label>
                        <select
                          value={ufConselho}
                          onChange={(e) => {
                            setUfConselho(e.target.value);
                            if (e.target.value && errors.ufConselho) {
                              setErrors((prev: FormErrors) => ({...prev, ufConselho: ''}));
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                            errors.ufConselho ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Selecione o estado</option>
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
                        {errors.ufConselho && (
                          <p className="text-red-500 text-xs mt-1">{errors.ufConselho}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reg. MTE
                        </label>
                        <input
                          type="text"
                          value={regMte}
                          onChange={(e) => setRegMte(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                          placeholder="Digite o registro no MTE"
                      />
                      </div>
                    </div>
                    </div>

                  {/* Informações de Contato */}
                  <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Informações de contato</h4>
                    
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
                              setErrors((prev: FormErrors) => ({...prev, cep: ''}));
                            }
                          }}
                          maxLength={9}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                            cepError || errors.cep ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="00000-000"
                        />
                        {loadingCep && <p className="text-xs text-blue-500 mt-1 flex items-center">
                          <svg className="animate-spin h-3 w-3 mr-1" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Buscando CEP...
                        </p>}
                        {cepError && <p className="text-xs text-red-500 mt-1">{cepError}</p>}
                        {errors.cep && <p className="text-red-500 text-xs mt-1">{errors.cep}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo de logradouro <span className="text-red-500">*</span>
                      </label>
                      <select
                          value={tipoLogradouro}
                          onChange={(e) => {
                            setEndereco({ ...endereco, tipoLogradouro: e.target.value });
                            if (e.target.value && errors.tipoLogradouro) {
                              setErrors((prev: FormErrors) => ({...prev, tipoLogradouro: ''}));
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                            errors.tipoLogradouro ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Selecione o tipo</option>
                          <option value="Rua">Rua</option>
                          <option value="Avenida">Avenida</option>
                          <option value="Praça">Praça</option>
                          <option value="Travessa">Travessa</option>
                          <option value="Alameda">Alameda</option>
                      </select>
                        {errors.tipoLogradouro && (
                          <p className="text-red-500 text-xs mt-1">{errors.tipoLogradouro}</p>
                        )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                          Logradouro <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                          value={logradouro}
                          onChange={(e) => {
                            setEndereco({ ...endereco, logradouro: e.target.value });
                            if (e.target.value.trim() && errors.logradouro) {
                              setErrors((prev: FormErrors) => ({...prev, logradouro: ''}));
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                            errors.logradouro ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Digite o nome da rua"
                        />
                        {errors.logradouro && (
                          <p className="text-red-500 text-xs mt-1">{errors.logradouro}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Número <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={numero}
                          onChange={(e) => {
                            setEndereco({ ...endereco, numero: e.target.value });
                            if (e.target.value.trim() && errors.numero) {
                              setErrors((prev: FormErrors) => ({...prev, numero: ''}));
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                            errors.numero ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Digite o número"
                        />
                        {errors.numero && (
                          <p className="text-red-500 text-xs mt-1">{errors.numero}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Complemento
                        </label>
                        <input
                          type="text"
                          value={complemento}
                          onChange={(e) => setEndereco({ ...endereco, complemento: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                          placeholder="Apto, bloco, etc."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                          UF <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={ufEndereco}
                          onChange={(e) => {
                            setEndereco({ ...endereco, uf: e.target.value });
                            if (e.target.value && errors.ufEndereco) {
                              setErrors((prev: FormErrors) => ({...prev, ufEndereco: ''}));
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                            errors.ufEndereco ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Selecione o estado</option>
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
                        {errors.ufEndereco && (
                          <p className="text-red-500 text-xs mt-1">{errors.ufEndereco}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cidade <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                          value={cidade}
                          onChange={(e) => {
                            setEndereco({ ...endereco, cidade: e.target.value });
                            if (e.target.value.trim() && errors.cidade) {
                              setErrors((prev: FormErrors) => ({...prev, cidade: ''}));
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                            errors.cidade ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Digite a cidade"
                        />
                        {errors.cidade && (
                          <p className="text-red-500 text-xs mt-1">{errors.cidade}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bairro <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={bairro}
                          onChange={(e) => {
                            setEndereco({ ...endereco, bairro: e.target.value });
                            if (e.target.value.trim() && errors.bairro) {
                              setErrors((prev: FormErrors) => ({...prev, bairro: ''}));
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                            errors.bairro ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Digite o bairro"
                        />
                        {errors.bairro && (
                          <p className="text-red-500 text-xs mt-1">{errors.bairro}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          E-mail <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (e.target.value.trim() && errors.email) {
                              setErrors((prev: FormErrors) => ({...prev, email: ''}));
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                            errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Digite o e-mail"
                        />
                        {errors.email && (
                          <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Telefone
                        </label>
                        <input
                          type="text"
                          value={telefone}
                          onChange={(e) => {
                            const onlyNumbers = e.target.value.replace(/\D/g, '');
                            const limitedNumbers = onlyNumbers.slice(0, 10);
                            
                            let formattedPhone = limitedNumbers;
                            if (limitedNumbers.length <= 2) {
                              formattedPhone = limitedNumbers;
                            } else if (limitedNumbers.length <= 6) {
                              formattedPhone = limitedNumbers.replace(/(\d{2})(\d+)/, '($1) $2');
                            } else {
                              formattedPhone = limitedNumbers.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
                            }
                            
                            setTelefone(formattedPhone);
                            if (formattedPhone && errors.telefone) {
                              setErrors((prev: FormErrors) => ({...prev, telefone: ''}));
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                            errors.telefone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="(00) 0000-0000"
                          maxLength={14}
                        />
                        {errors.telefone && (
                          <p className="text-red-500 text-xs mt-1">{errors.telefone}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          DDD <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={ddd}
                          onChange={(e) => {
                            const onlyNumbers = e.target.value.replace(/\D/g, '').slice(0, 2);
                            setDdd(onlyNumbers);
                            if (onlyNumbers && errors.ddd) {
                              setErrors((prev: FormErrors) => ({...prev, ddd: ''}));
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                            errors.ddd ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="00"
                          maxLength={2}
                        />
                        {errors.ddd && (
                          <p className="text-red-500 text-xs mt-1">{errors.ddd}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Celular <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={celular}
                          onChange={(e) => {
                            const onlyNumbers = e.target.value.replace(/\D/g, '');
                            const limitedNumbers = onlyNumbers.slice(0, 11);
                            
                            let formattedCelular = limitedNumbers;
                            if (limitedNumbers.length <= 2) {
                              formattedCelular = limitedNumbers;
                            } else if (limitedNumbers.length <= 7) {
                              formattedCelular = limitedNumbers.replace(/(\d{2})(\d+)/, '($1) $2');
                            } else {
                              formattedCelular = limitedNumbers.replace(/(\d{2})(\d{5})(\d+)/, '($1) $2-$3');
                            }
                            
                            setCelular(formattedCelular);
                            if (formattedCelular.trim() && errors.celular) {
                              setErrors((prev: FormErrors) => ({...prev, celular: ''}));
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                            errors.celular ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="(00) 90000-0000"
                          maxLength={15}
                        />
                        {errors.celular && (
                          <p className="text-red-500 text-xs mt-1">{errors.celular}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Informações Adicionais */}
                  <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Informações adicionais</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Observação
                        </label>
                        <textarea
                          value={observacao}
                          onChange={(e) => setObservacao(e.target.value)}
                          rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                          placeholder="Digite observações adicionais"
                      />
                    </div>

                      <div className="flex flex-wrap gap-6 mb-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="agendamentoHorario"
                            checked={agendamentoHorario}
                            onChange={(e) => setAgendamentoHorario(e.target.checked)}
                            className="mr-2 w-4 h-4 text-[#00A298] focus:ring-[#00A298] border-gray-300 rounded"
                          />
                          <label htmlFor="agendamentoHorario" className="text-sm text-gray-700">
                            Agendamentos para este profissional apenas com horário marcado
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="profissionalExterno"
                            checked={profissionalExterno}
                            onChange={(e) => setProfissionalExterno(e.target.checked)}
                            className="mr-2 w-4 h-4 text-[#00A298] focus:ring-[#00A298] border-gray-300 rounded"
                          />
                          <label htmlFor="profissionalExterno" className="text-sm text-gray-700">
                            Profissional externo
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Assinatura Digitalizada
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

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Certificado Digital
                          </label>
                          <div className="space-y-2">
                            <input
                              type="file"
                              accept=".pfx"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent text-sm"
                            />
                            <p className="text-xs text-gray-500">Selecione um arquivo .pfx</p>
                            <div className="flex gap-2">
                              <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-all duration-200">
                                INCLUIR CERTIFICADO DIGITAL
                              </button>
                              <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-all duration-200">
                                EXCLUIR CERTIFICADO DIGITAL
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Situação
                      </label>
                      <select
                        value={situacao}
                        onChange={(e) => setSituacao(e.target.value)}
                          className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                      >
                          <option value="ativo">Ativo</option>
                          <option value="inativo">Inativo</option>
                      </select>
                      </div>
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex gap-3">
                      <button 
                        onClick={handleIncluir}
                        disabled={isSubmitting}
                        className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'INCLUINDO...' : 'INCLUIR'}
                      </button>
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

              {/* Tabela de resultados */}
              <div className="p-6">
                <div className="border border-gray-200 rounded-lg">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nome</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Categoria</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Sigla Conselho</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Número Conselho</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Externo</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ofensor</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Clínica</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Situação</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profissionaisFiltrados && Array.isArray(profissionaisFiltrados) && profissionaisFiltrados.length > 0 ? (
                        profissionaisFiltrados.map((profissional) => (
                        <tr key={profissional.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm">
                              <div className="font-medium text-gray-900">{destacarTexto(profissional.nome, nomeBusca)}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{profissional.categoria}</td>
                          <td className="px-4 py-3 text-sm text-center text-gray-900">{profissional.sigla_conselho}</td>
                          <td className="px-4 py-3 text-sm text-center text-gray-900">{profissional.numero_conselho}</td>
                          <td className="px-4 py-3 text-sm text-center">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              profissional.externo 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {profissional.externo ? 'Sim' : 'Não'}
                            </span>
                          </td>
                            <td className="px-4 py-3 text-sm text-gray-900">{profissional.ofensor}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{profissional.clinica}</td>
                          <td className="px-4 py-3 text-sm text-center">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                (profissional.situacao || profissional.status) === 'ativo' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                                {(profissional.situacao || profissional.status) === 'ativo' ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex space-x-2 justify-center">
                                <button className="text-green-600 hover:text-green-800 text-xs font-medium cursor-pointer" onClick={() => handleVisualizarProfissional(profissional)}>
                                Visualizar
                              </button>
                                {permissions.profissionais?.canEdit && (
                                  <button className="text-blue-600 hover:text-blue-800 text-xs font-medium cursor-pointer" onClick={() => handleEditarProfissional(profissional)}>
                                    Editar
                                  </button>
                                )}
                                {/* Botão Reativar - apenas para ADMIN e SUPER_ADMIN quando o profissional está inativo */}
                                {(user?.role === 'admin' || user?.role === 'super_admin') && (profissional.situacao || profissional.status) === 'inativo' && (
                                <button 
                                    className="text-emerald-600 hover:text-emerald-800 text-xs font-medium cursor-pointer" 
                                    onClick={() => handleReativarProfissional(profissional)}
                                >
                                    Reativar
                                </button>
                              )}
                                {/* Botão Inativar - apenas para ADMIN e SUPER_ADMIN quando o profissional está ativo */}
                                {(user?.role === 'admin' || user?.role === 'super_admin') && (profissional.situacao || profissional.status) === 'ativo' && (
                                    <button 
                                      className="text-orange-600 hover:text-orange-800 text-xs font-medium cursor-pointer"
                                    onClick={() => handleInativarProfissional(profissional)}
                                    >
                                      Inativar
                                    </button>
                                )}
                                {/* Botão Excluir (físico) - apenas para SUPER_ADMIN */}
                                {user?.role === 'super_admin' && (
                                <button 
                                  className="text-red-600 hover:text-red-800 text-xs font-medium cursor-pointer"
                                    onClick={() => handleExcluirDefinitivo(profissional)}
                                >
                                  Excluir
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                            Não existem dados para mostrar
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal de Visualização */}
      {showViewProfissionalModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-bold text-[#1D3C44] mb-4">Visualizar Profissional</h3>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Dados cadastrais</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={profissionalVisualizando?.nome || ''}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoria
                    </label>
                    <input
                      type="text"
                      value={profissionalVisualizando?.categoria || ''}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sigla Conselho
                    </label>
                    <input
                      type="text"
                      value={profissionalVisualizando?.sigla_conselho || ''}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número Conselho
                    </label>
                    <input
                      type="text"
                      value={profissionalVisualizando?.numero_conselho || ''}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profissional Externo
                    </label>
                    <input
                      type="text"
                      value={profissionalVisualizando?.externo ? 'Sim' : 'Não'}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ofensor
                    </label>
                    <input
                      type="text"
                      value={profissionalVisualizando?.ofensor || 'Não informado'}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Clínica
                    </label>
                    <input
                      type="text"
                      value={profissionalVisualizando?.clinica || 'Não informado'}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Situação
                    </label>
                    <input
                      type="text"
                      value={profissionalVisualizando?.situacao || ''}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>
                
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
      {showEditProfissionalModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-bold text-[#1D3C44] mb-4">Editar Profissional</h3>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Dados cadastrais</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={nomeProfissional}
                      onChange={(e) => setNomeProfissional(formatTexto(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                      placeholder="Digite o nome do profissional (apenas letras)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoria
                    </label>
                    <select
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                    >
                      <option value="">Selecione uma categoria</option>
                      <option value="Médico">Médico</option>
                      <option value="Enfermeiro">Enfermeiro</option>
                      <option value="Técnico de Enfermagem">Técnico de Enfermagem</option>
                      <option value="Auxiliar de Enfermagem">Auxiliar de Enfermagem</option>
                      <option value="Fisioterapeuta">Fisioterapeuta</option>
                      <option value="Psicólogo">Psicólogo</option>
                      <option value="Nutricionista">Nutricionista</option>
                      <option value="Fonoaudiólogo">Fonoaudiólogo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sigla Conselho
                    </label>
                    <select
                      value={siglaConselho}
                      onChange={(e) => setSiglaConselho(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                    >
                      <option value="">Selecione a sigla</option>
                      <option value="CRM">CRM</option>
                      <option value="COREN">COREN</option>
                      <option value="CREFITO">CREFITO</option>
                      <option value="CRP">CRP</option>
                      <option value="CRN">CRN</option>
                      <option value="CRFa">CRFa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número Conselho
                    </label>
                    <input
                      type="text"
                      value={numeroConselho}
                      onChange={(e) => setNumeroConselho(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                      placeholder="Digite o número do conselho"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profissional Externo
                    </label>
                    <select
                      value={externo ? 'true' : 'false'}
                      onChange={(e) => setExterno(e.target.value === 'true')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                    >
                      <option value="false">Não</option>
                      <option value="true">Sim</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ofensor
                    </label>
                    <input
                      type="text"
                      value={ofensor}
                      onChange={(e) => setOfensor(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                      placeholder="Digite o ofensor"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Clínica
                    </label>
                    <input
                      type="text"
                      value={clinica}
                      onChange={(e) => setClinica(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                      placeholder="Digite a clínica"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Situação
                    </label>
                                            <select
                          value={situacao}
                          onChange={(e) => setSituacao(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                        >
                          <option value="ativo">Ativo</option>
                          <option value="inativo">Inativo</option>
                        </select>
                  </div>
                </div>
                
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
      {showDeleteModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Confirmar Inativação</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Tem certeza que deseja inativar o profissional &quot;{profissionalExcluindo?.nome}&quot;?
                  </p>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Atenção:</strong> O profissional será marcado como inativo e não aparecerá mais nos seletores. Esta ação pode ser revertida alterando o status para ativo novamente.
                </p>
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleCancelarExclusao}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg text-sm transition-all duration-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmarExclusao}
                  disabled={isSubmitting}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Inativando...' : 'Sim, Inativar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão Definitiva */}
      {showDeleteDefinitivoModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Excluir Definitivamente</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Tem certeza que deseja excluir DEFINITIVAMENTE o profissional &quot;{profissionalExcluindoDefinitivo?.nome}&quot;?
                  </p>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800">
                  <strong>ATENÇÃO:</strong> Esta ação é irreversível! O profissional será excluído permanentemente do banco de dados e não poderá ser recuperado.
                </p>
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleCancelarExclusaoDefinitiva}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg text-sm transition-all duration-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmarExclusaoDefinitiva}
                  disabled={isSubmitting}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Excluindo...' : 'Sim, Excluir Definitivamente'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 