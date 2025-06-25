'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatTexto } from '@/utils/masks';
import { usePermissions } from '@/hooks/usePermissions';

interface NotificationMessage {
  type: 'success' | 'error';
  message: string;
  show: boolean;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
}

interface Profissional {
  id: number;
  nome: string;
  categoria: string;
  sigla_conselho: string;
  numero_conselho: string;
  externo: boolean;
  ofensor: string;
  clinica: string;
  situacao: 'ativo' | 'inativo';
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
}

export default function CadastroProfissionaisPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Hook de permissões
  const permissions = usePermissions(user);
  
  // Estados para o formulário
  const [showNewProfissionalModal, setShowNewProfissionalModal] = useState(false);
  const [nomeProfissional, setNomeProfissional] = useState('');
  const [categoria, setCategoria] = useState('');
  const [siglaConselho, setSiglaConselho] = useState('');
  const [numeroConselho, setNumeroConselho] = useState('');
  const [externo, setExterno] = useState(false);
  const [ofensor, setOfensor] = useState('');
  const [clinica, setClinica] = useState('');
  
  // Estados para busca
  const [nomeBusca, setNomeBusca] = useState('');
  const [situacaoBusca, setSituacaoBusca] = useState('ativo');
  const [tipoPesquisa, setTipoPesquisa] = useState('nome');
  
  // Estados para dados
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [filteredProfissionais, setFilteredProfissionais] = useState<Profissional[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para notificação
  const [notification, setNotification] = useState<NotificationMessage>({
    type: 'success',
    message: '',
    show: false
  });

  // Estados para o autocomplete
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteResults, setAutocompleteResults] = useState<Profissional[]>([]);

  // Função para exibir notificação
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message, show: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

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

  // Função para obter o placeholder dinamicamente
  const getPlaceholder = () => {
    switch (tipoPesquisa) {
      case 'nome':
        return 'Digite o nome do profissional...';
      case 'categoria':
        return 'Digite a categoria (ex: Médico, Enfermeiro)...';
      default:
        return 'Digite para pesquisar...';
    }
  };

  // Função para aplicar filtros automaticamente
  const aplicarFiltrosAutomaticos = useCallback((busca: string = nomeBusca, situacao: string = situacaoBusca, tipo: string = tipoPesquisa) => {
    if (!Array.isArray(profissionais) || profissionais.length === 0) {
      setFilteredProfissionais([]);
      return;
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
    
    // Mostrar notificação apenas se houver filtros aplicados
    if (busca.trim() || (situacao && situacao !== 'todos')) {
      if (filtered.length === 0) {
        showNotification('error', 'Nenhum profissional encontrado com os critérios aplicados');
      } else {
        showNotification('success', `${filtered.length} profissional(is) encontrado(s)`);
      }
    }
  }, [profissionais, nomeBusca, situacaoBusca, tipoPesquisa]);

  // useEffect para aplicar filtros automaticamente quando situação muda
  useEffect(() => {
    if (profissionais.length > 0) {
      aplicarFiltrosAutomaticos(nomeBusca, situacaoBusca, tipoPesquisa);
    }
  }, [situacaoBusca, tipoPesquisa, profissionais, aplicarFiltrosAutomaticos, nomeBusca]);

  // Função para filtrar profissionais em tempo real (autocomplete)
  const handleAutocompleteSearch = (value: string) => {
    if (!value.trim()) {
      setShowAutocomplete(false);
      setAutocompleteResults([]);
      aplicarFiltrosAutomaticos('', situacaoBusca, tipoPesquisa);
      return;
    }

    if (!Array.isArray(profissionais)) {
      setShowAutocomplete(false);
      setAutocompleteResults([]);
      return;
    }

    const filtered = profissionais.filter(profissional => {
      switch (tipoPesquisa) {
        case 'nome':
          return profissional.nome.toLowerCase().includes(value.toLowerCase());
        case 'categoria':
          return profissional.categoria.toLowerCase().includes(value.toLowerCase());
        default:
          return profissional.nome.toLowerCase().includes(value.toLowerCase());
      }
    }).slice(0, 5); // Limitar a 5 resultados

    setAutocompleteResults(filtered);
    setShowAutocomplete(filtered.length > 0);
    
    // Aplicar filtros em tempo real
    aplicarFiltrosAutomaticos(value, situacaoBusca, tipoPesquisa);
  };

  // Função para selecionar item do autocomplete
  const handleSelectAutocomplete = (profissional: Profissional) => {
    // Definir o valor do campo baseado no tipo de pesquisa
    const valorSelecionado = tipoPesquisa === 'categoria' ? profissional.categoria : profissional.nome;
    setNomeBusca(valorSelecionado);
    setShowAutocomplete(false);
    aplicarFiltrosAutomaticos(valorSelecionado, situacaoBusca, tipoPesquisa);
  };

  // Função para carregar profissionais
  const carregarProfissionais = useCallback(async () => {
    console.log('=== CARREGANDO PROFISSIONAIS ===');
    
    setNomeBusca('');
    setSituacaoBusca('ativo');
    setShowAutocomplete(false);
    setAutocompleteResults([]);
    
    try {
      // Simulando dados até implementar API
      const mockData: Profissional[] = [
        {
          id: 1,
          nome: 'Dr. João Silva',
          categoria: 'Médico',
          sigla_conselho: 'CRM',
          numero_conselho: '12345',
          externo: false,
          ofensor: 'Clínica A',
          clinica: 'Clínica Central',
          situacao: 'ativo',
          created_by: 1,
          updated_by: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          nome: 'Dra. Maria Santos',
          categoria: 'Enfermeiro',
          sigla_conselho: 'COREN',
          numero_conselho: '54321',
          externo: true,
          ofensor: 'Clínica B',
          clinica: 'Clínica Norte',
          situacao: 'ativo',
          created_by: 1,
          updated_by: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      setProfissionais(mockData);
      setFilteredProfissionais(mockData);
      
      if (mockData.length > 0) {
        showNotification('success', `${mockData.length} profissional(is) carregado(s)`);
      } else {
        showNotification('error', 'Nenhum profissional encontrado no banco de dados');
      }
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
      showNotification('error', 'Erro de conexão ao carregar profissionais');
      setProfissionais([]);
      setFilteredProfissionais([]);
    }
  }, []);

  // Função para procurar profissionais (botão Procurar)
  const handleProcurar = () => {
    setShowAutocomplete(false);
    
    if (!nomeBusca.trim() && situacaoBusca === 'todos') {
      setFilteredProfissionais(profissionais || []);
      return;
    }

    if (!Array.isArray(profissionais)) {
      setFilteredProfissionais([]);
      return;
    }

    let filtered = profissionais;

    if (nomeBusca.trim()) {
      filtered = filtered.filter(profissional => {
        switch (tipoPesquisa) {
          case 'nome':
            return profissional.nome.toLowerCase().includes(nomeBusca.toLowerCase());
          case 'categoria':
            return profissional.categoria.toLowerCase().includes(nomeBusca.toLowerCase());
          default:
            return profissional.nome.toLowerCase().includes(nomeBusca.toLowerCase());
        }
      });
    }

    if (situacaoBusca !== 'todos') {
      const status = situacaoBusca === 'ativo' ? 'ativo' : 'inativo';
      filtered = filtered.filter(profissional => profissional.situacao === status);
    }
    
    setFilteredProfissionais(filtered);
    
    if (filtered.length === 0) {
      const tipoTexto = tipoPesquisa === 'categoria' ? 'categoria' : 'nome';
      showNotification('error', `Nenhum profissional encontrado com o ${tipoTexto} pesquisado`);
    } else {
      showNotification('success', `${filtered.length} profissional(is) encontrado(s)`);
    }
  };

  // Função para incluir novo profissional
  const handleIncluir = async () => {
    if (!nomeProfissional.trim()) {
      showNotification('error', 'Por favor, informe o nome do profissional.');
      return;
    }

    if (!categoria.trim()) {
      showNotification('error', 'Por favor, informe a categoria.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulando inclusão até implementar API
      showNotification('success', 'Profissional cadastrado com sucesso!');
      handleLimpar();
      await carregarProfissionais();
      setShowNewProfissionalModal(false);
    } catch (error) {
      console.error('Erro ao cadastrar profissional:', error);
      showNotification('error', 'Erro ao cadastrar profissional. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para limpar formulário
  const handleLimpar = () => {
    setNomeProfissional('');
    setCategoria('');
    setSiglaConselho('');
    setNumeroConselho('');
    setExterno(false);
    setOfensor('');
    setClinica('');
  };

  // Função para retornar (fechar modal)
  const handleRetornar = () => {
    handleLimpar();
    setShowNewProfissionalModal(false);
  };

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
                        setTipoPesquisa(e.target.value);
                        setNomeBusca(''); // Limpar campo ao trocar tipo
                        setShowAutocomplete(false);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                    >
                      <option value="nome">Nome</option>
                      <option value="categoria">Categoria</option>
                    </select>
                  </div>
                  
                  <div className="flex-1 min-w-64 relative">
                    <input
                      type="text"
                      value={nomeBusca}
                      onChange={(e) => {
                        const value = formatTexto(e.target.value);
                        setNomeBusca(value);
                        handleAutocompleteSearch(value);
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
                            <div className="text-sm text-gray-500">{profissional.categoria}</div>
                            <div className="text-xs text-blue-600 mt-1">
                              Situação: {profissional.situacao}
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
                      onChange={(e) => setSituacaoBusca(e.target.value)}
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
                    onClick={carregarProfissionais}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    RECARREGAR
                  </button>
                </div>
              </div>

              {/* Container de Novo Cadastro */}
              {showNewProfissionalModal && (
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-[#1D3C44] mb-4">Consulta de Profissional</h3>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Dados cadastrais</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nome
                        </label>
                        <input
                          type="text"
                          value={nomeProfissional}
                          onChange={(e) => setNomeProfissional(formatTexto(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                          placeholder="Digite o nome do profissional"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Categoria
                        </label>
                        <input
                          type="text"
                          value={categoria}
                          onChange={(e) => setCategoria(formatTexto(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                          placeholder="Ex: Médico, Enfermeiro"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Sigla Conselho
                        </label>
                        <input
                          type="text"
                          value={siglaConselho}
                          onChange={(e) => setSiglaConselho(e.target.value.toUpperCase())}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                          placeholder="Ex: CRM, COREN"
                        />
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
                          Externo
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

                      <div className="md:col-span-2 lg:col-span-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Clínica
                        </label>
                        <input
                          type="text"
                          value={clinica}
                          onChange={(e) => setClinica(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                          placeholder="Digite o nome da clínica"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
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
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProfissionais && Array.isArray(filteredProfissionais) && filteredProfissionais.length > 0 ? (
                        filteredProfissionais.map((profissional) => (
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
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
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
    </div>
  );
} 