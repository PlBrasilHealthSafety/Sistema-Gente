'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Tipos para os dados
interface Procedimento {
  id: string;
  nome: string;
  tipo: 'Médico' | 'Enfermagem' | 'Sala de Atendimentos';
  grupoExame: string;
  audiometria: boolean;
  exameClinico: boolean;
  situacao: 'Ativo' | 'Inativo';
}

// Mock de dados para demonstração
const mockProcedimentos: Procedimento[] = [
  {
    id: '1',
    nome: 'Consulta Médica Ocupacional',
    tipo: 'Médico',
    grupoExame: 'Exames Ocupacionais',
    audiometria: false,
    exameClinico: true,
    situacao: 'Ativo'
  },
  {
    id: '2',
    nome: 'Exame Admissional',
    tipo: 'Médico',
    grupoExame: 'Exames Ocupacionais',
    audiometria: true,
    exameClinico: true,
    situacao: 'Ativo'
  },
  {
    id: '3',
    nome: 'Audiometria',
    tipo: 'Médico',
    grupoExame: 'Exames Complementares',
    audiometria: true,
    exameClinico: false,
    situacao: 'Ativo'
  },
 
];

export default function CadastroProcedimentos() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Estados para filtros e busca
  const [termoBusca, setTermoBusca] = useState('');
  const [situacao, setSituacao] = useState('Ativo');
  const [procedimentosFiltrados, setProcedimentosFiltrados] = useState<Procedimento[]>([]);
  
  // Estados para paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  // Estados para formulário de cadastro
  const [showCadastroModal, setShowCadastroModal] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [procedimentoEditando, setProcedimentoEditando] = useState<string | null>(null);
  
  // Estados para modais de confirmação
  const [showConfirmacaoExclusao, setShowConfirmacaoExclusao] = useState(false);
  const [showConfirmacaoInativacao, setShowConfirmacaoInativacao] = useState(false);
  const [procedimentoParaAcao, setProcedimentoParaAcao] = useState<Procedimento | null>(null);
  
  // Estados para visualização
  const [showViewProcedimentoModal, setShowViewProcedimentoModal] = useState(false);
  const [procedimentoVisualizando, setProcedimentoVisualizando] = useState<Procedimento | null>(null);
  
  // Estados dos campos do formulário
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'Médico',
    grupoExame: '',
    audiometria: false,
    exameClinico: false,
    situacaoProcedimento: 'Ativo'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verificação de autenticação
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    setLoading(false);
  }, [router]);

  // Efeito para filtrar procedimentos
  useEffect(() => {
    let resultados = mockProcedimentos.filter(procedimento => {
      const matchSituacao = situacao === 'Todos' || procedimento.situacao === situacao;
      const matchBusca = termoBusca === '' || 
        procedimento.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
        procedimento.grupoExame.toLowerCase().includes(termoBusca.toLowerCase());
      
      return matchSituacao && matchBusca;
    });

    setProcedimentosFiltrados(resultados);
    setPaginaAtual(1); // Reset para primeira página quando filtrar
  }, [termoBusca, situacao]);

  // Inicializar apenas com dados ativos
  useEffect(() => {
    const procedimentosAtivos = mockProcedimentos.filter(procedimento => procedimento.situacao === 'Ativo');
    setProcedimentosFiltrados(procedimentosAtivos);
  }, []);

  // Calcular dados da paginação
  const totalItens = procedimentosFiltrados.length;
  const totalPaginas = Math.ceil(totalItens / itensPorPagina);
  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const indiceFim = indiceInicio + itensPorPagina;
  const procedimentosExibidos = procedimentosFiltrados.slice(indiceInicio, indiceFim);

  const handleProcurar = () => {
    // A busca já é feita automaticamente via useEffect
    // Este método pode ser usado para ações adicionais se necessário
  };

  const carregarProcedimentos = () => {
    setTermoBusca('');
    setSituacao('Ativo');
    const procedimentosAtivos = mockProcedimentos.filter(procedimento => procedimento.situacao === 'Ativo');
    setProcedimentosFiltrados(procedimentosAtivos);
    setPaginaAtual(1);
  };

  const handleNovoProcedimento = () => {
    setModoEdicao(false);
    setProcedimentoEditando(null);
    setShowCadastroModal(true);
    setFormData({
      nome: '',
      tipo: 'Médico',
      grupoExame: '',
      audiometria: false,
      exameClinico: false,
      situacaoProcedimento: 'Ativo'
    });
    setErrors({});
  };

  const handleFecharCadastro = () => {
    setShowCadastroModal(false);
    setModoEdicao(false);
    setProcedimentoEditando(null);
    setFormData({
      nome: '',
      tipo: 'Médico',
      grupoExame: '',
      audiometria: false,
      exameClinico: false,
      situacaoProcedimento: 'Ativo'
    });
    setErrors({});
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleIncluirProcedimento = async () => {
    // Validar campos obrigatórios
    const newErrors: Record<string, string> = {};
    
    // Validar nome
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome do procedimento é obrigatório';
    }
    
    // Validar grupo de exame
    if (!formData.grupoExame.trim()) {
      newErrors.grupoExame = 'Grupo de Exame é obrigatório';
    }
    
    // Se houver erros, mostrar e parar
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    // TODO: Implementar lógica de salvamento
    try {
      // Aqui será implementada a chamada para a API
      console.log('Dados do procedimento:', formData);
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      handleFecharCadastro();
    } catch (error) {
      console.error('Erro ao salvar procedimento:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLimparFormulario = () => {
    setFormData({
      nome: '',
      tipo: 'Médico',
      grupoExame: '',
      audiometria: false,
      exameClinico: false,
      situacaoProcedimento: 'Ativo'
    });
    setErrors({});
  };

  const handleVisualizarProcedimento = (procedimento: Procedimento) => {
    setProcedimentoVisualizando(procedimento);
    setShowViewProcedimentoModal(true);
  };

  const handleFecharVisualizacao = () => {
    setShowViewProcedimentoModal(false);
    setProcedimentoVisualizando(null);
  };

  const handleEditarProcedimento = (procedimento: Procedimento) => {
    setModoEdicao(true);
    setProcedimentoEditando(procedimento.id);
    setFormData({
      nome: procedimento.nome,
      tipo: procedimento.tipo,
      grupoExame: procedimento.grupoExame,
      audiometria: procedimento.audiometria,
      exameClinico: procedimento.exameClinico,
      situacaoProcedimento: procedimento.situacao
    });
    setShowCadastroModal(true);
    setErrors({});
  };

  const handleExcluirProcedimento = (procedimento: Procedimento) => {
    setProcedimentoParaAcao(procedimento);
    setShowConfirmacaoExclusao(true);
  };

  const handleInativarProcedimento = (procedimento: Procedimento) => {
    setProcedimentoParaAcao(procedimento);
    setShowConfirmacaoInativacao(true);
  };

  const confirmarExclusao = () => {
    // TODO: Implementar lógica de exclusão
    console.log('Excluindo procedimento:', procedimentoParaAcao);
    setShowConfirmacaoExclusao(false);
    setProcedimentoParaAcao(null);
  };

  const confirmarInativacao = () => {
    // TODO: Implementar lógica de inativação/ativação
    console.log('Alterando status do procedimento:', procedimentoParaAcao);
    setShowConfirmacaoInativacao(false);
    setProcedimentoParaAcao(null);
  };

  const cancelarAcao = () => {
    setShowConfirmacaoExclusao(false);
    setShowConfirmacaoInativacao(false);
    setProcedimentoParaAcao(null);
  };

  const gerarPaginacao = () => {
    if (totalPaginas <= 1) return null;

    const paginas = [];
    for (let i = 1; i <= totalPaginas; i++) {
      paginas.push(
        <button
          key={i}
          onClick={() => setPaginaAtual(i)}
          className={`px-3 py-1 rounded ${
            paginaAtual === i
              ? 'bg-[#00A298] text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {i}
        </button>
      );
    }
    return paginas;
  };

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

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'Médico':
        return 'bg-blue-100 text-blue-800';
      case 'Enfermagem':
        return 'bg-purple-100 text-purple-800';
      case 'Sala de Atendimentos':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
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
      {/* CSS global para forçar remoção do azul do sistema */}
      <style dangerouslySetInnerHTML={{
        __html: `
          * {
            -webkit-tap-highlight-color: transparent !important;
          }
          
          .custom-select {
            appearance: none !important;
            -webkit-appearance: none !important;
            -moz-appearance: none !important;
            background-color: white !important;
            outline: none !important;
          }
          
          .custom-select:focus {
            outline: none !important;
            box-shadow: 0 0 0 2px #00A298 !important;
            border-color: #00A298 !important;
          }
          
          /* FORÇA remoção completa do azul do sistema */
          .custom-select option,
          .custom-select option:hover,
          .custom-select option:focus,
          .custom-select option:active,
          .custom-select option:checked,
          .custom-select option:selected,
          .custom-select option[selected] {
            background-color: white !important;
            background: white !important;
            color: #374151 !important;
            padding: 8px 12px !important;
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
            -webkit-appearance: none !important;
            -moz-appearance: none !important;
            appearance: none !important;
          }
          
          /* Hover customizado */
          .custom-select option:hover {
            background-color: #f9fafb !important;
            background: #f9fafb !important;
            color: #030712 !important;
          }
          
          /* Remove highlight do sistema operacional */
          .custom-select option::selection,
          .custom-select option::-moz-selection,
          .custom-select option::-webkit-selection {
            background: #f9fafb !important;
            color: #030712 !important;
          }
          
          /* Remove focus ring azul */
          .custom-select option::-moz-focus-inner,
          .custom-select option:focus-visible,
          .custom-select option:focus {
            border: none !important;
            outline: none !important;
            box-shadow: none !important;
            background: #f9fafb !important;
            color: #030712 !important;
          }
          
          /* CSS específico por navegador */
          @-moz-document url-prefix() {
            .custom-select option {
              background-color: white !important;
              color: #374151 !important;
            }
            .custom-select option:hover,
            .custom-select option:focus {
              background-color: #f9fafb !important;
              color: #030712 !important;
            }
          }
        `
      }} />
      
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
                <span className="text-[#00A298] font-medium">Cadastro de Procedimentos</span>
              </div>
              
              <h1 className="text-3xl font-bold text-[#1D3C44] mb-2">
                📝 Cadastro de Procedimentos
              </h1>
              <p className="text-gray-600">
                Cadastro e gerenciamento de procedimentos médicos, administrativos e protocolos
              </p>
            </div>

            {/* Conteúdo Principal */}
            <div className="bg-white rounded-2xl shadow-xl">
              {/* Formulário de Busca */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-wrap gap-2 items-end">
                  <div className="flex-1 min-w-64">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome ou Procedimento
                    </label>
                    <input
                      type="text"
                      value={termoBusca}
                      onChange={(e) => setTermoBusca(e.target.value)}
                      placeholder="Digite o nome ou procedimento para busca..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Situação
                    </label>
                    <select
                      value={situacao}
                      onChange={(e) => setSituacao(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                      <option value="Todos">Todos</option>
                    </select>
                  </div>

                  <button
                    onClick={handleProcurar}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer ml-2"
                  >
                    PROCURAR
                  </button>
                  
                  <button
                    onClick={handleNovoProcedimento}
                    className="bg-[#00A298] hover:bg-[#1D3C44] text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    NOVO PROCEDIMENTO
                  </button>
                  
                  <button 
                    onClick={carregarProcedimentos}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    RECARREGAR
                  </button>
                </div>
              </div>

                            {/* Container de Cadastro de Procedimento */}
              {showCadastroModal && (
                <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 rounded-b-2xl">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-[#1D3C44]">
                      {modoEdicao ? 'Editar Procedimento' : 'Novo Procedimento'}
                    </h3>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                    {/* Seção: Informações Básicas */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-[#1D3C44] mb-4 flex items-center space-x-2">
                        <svg className="w-5 h-5 text-[#00A298]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Informações Básicas</span>
                      </h4>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                            <svg className="w-4 h-4 text-[#00A298]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <span>Nome do Procedimento</span>
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.nome}
                            onChange={(e) => handleInputChange('nome', e.target.value)}
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#00A298] focus:border-[#00A298] transition-all duration-200 ${
                              errors.nome ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                            }`}
                            placeholder="Ex: Consulta Médica Ocupacional, Audiometria..."
                          />
                          {errors.nome && (
                            <p className="text-red-500 text-sm mt-2 flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              <span>{errors.nome}</span>
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                            <svg className="w-4 h-4 text-[#00A298]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <span>Tipo</span>
                          </label>
                          <select
                            value={formData.tipo}
                            onChange={(e) => handleInputChange('tipo', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00A298] focus:border-[#00A298] hover:border-gray-400 transition-all duration-200"
                          >
                            <option value="Médico">Médico</option>
                            <option value="Enfermagem">Enfermagem</option>e
                            <option value="Sala de Atendimentos">Sala de Atendimentos</option>
                            
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Seção: Classificação */}
                    <div className="mb-6 border-t border-gray-200 pt-6">
                      <h4 className="text-lg font-semibold text-[#1D3C44] mb-4 flex items-center space-x-2">
                        <svg className="w-5 h-5 text-[#00A298]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <span>Classificação e Características</span>
                      </h4>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                            <svg className="w-4 h-4 text-[#00A298]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                            <span>Procedimento</span>
                            <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.grupoExame}
                            onChange={(e) => handleInputChange('grupoExame', e.target.value)}
                            className={`custom-select w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#00A298] focus:border-[#00A298] transition-all duration-200 ${
                              errors.grupoExame ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <option value="">Selecione um procedimento...</option>
                            <option value="1,2 Dihidroxi-4-(N-acetilcisteínil)-butano">1,2 Dihidroxi-4-(N-acetilcisteínil)-butano</option>
                            <option value="Acetona na urina">Acetona na urina</option>
                            <option value="Ácido delta aminolevulínico - ALAU">Ácido delta aminolevulínico - ALAU</option>
                            <option value="Ácido etil cetona">Ácido etil cetona</option>
                            <option value="Ácido fenil-glioxílico">Ácido fenil-glioxílico</option>
                            <option value="Ácido hipúrico (urina)">Ácido hipúrico (urina)</option>
                            <option value="Ácido mandélico">Ácido mandélico</option>
                            <option value="Ácido metilhipúrico (urina)">Ácido metilhipúrico (urina)</option>
                            <option value="Ácido trans transmucônico">Ácido trans transmucônico</option>
                            <option value="Ácido úrico">Ácido úrico</option>
                            <option value="Álcool etílico">Álcool etílico</option>
                            <option value="Anticorpos anti-HIV">Anticorpos anti-HIV</option>
                            <option value="Antígeno Austrália (HBsAg)">Antígeno Austrália (HBsAg)</option>
                            <option value="Antígeno específico prostático livre (PSA)">Antígeno específico prostático livre (PSA)</option>
                            <option value="Antígeno específico prostático total (PSA)">Antígeno específico prostático total (PSA)</option>
                            <option value="Arsênico inorgânico mais metabólitos metilados na urina">Arsênico inorgânico mais metabólitos metilados na urina</option>
                            <option value="Audiometria tonal limiar com testes de discriminação">Audiometria tonal limiar com testes de discriminação</option>
                            <option value="Audiometria tonal ocupacional">Audiometria tonal ocupacional</option>
                            <option value="Avaliação da acuidade visual">Avaliação da acuidade visual</option>
                            <option value="Avaliação médica">Avaliação médica</option>
                            <option value="Avaliação odontológica">Avaliação odontológica</option>
                            <option value="Avaliação oftalmológica">Avaliação oftalmológica</option>
                            <option value="Avaliação psicológica">Avaliação psicológica</option>
                            <option value="Avaliação psicossocial">Avaliação psicossocial</option>
                            <option value="Bilirrubina">Bilirrubina</option>
                            <option value="Carboxihemoglobina">Carboxihemoglobina</option>
                            <option value="Cádmio">Cádmio</option>
                            <option value="Chumbo urinário">Chumbo urinário</option>
                            <option value="Ciclohexanona na urina">Ciclohexanona na urina</option>
                            <option value="Cobalto na urina">Cobalto na urina</option>
                            <option value="Cobre urinário">Cobre urinário</option>
                            <option value="Colesterol HDL">Colesterol HDL</option>
                            <option value="Colesterol LDL">Colesterol LDL</option>
                            <option value="Colesterol total">Colesterol total</option>
                            <option value="Colesterol total e frações">Colesterol total e frações</option>
                            <option value="Colesterol VLDL">Colesterol VLDL</option>
                            <option value="Creatinina">Creatinina</option>
                            <option value="Cromo hexavalente">Cromo hexavalente</option>
                            <option value="Cromo na urina">Cromo na urina</option>
                            <option value="Cultura nas fezes">Cultura nas fezes</option>
                            <option value="Dosagem de Acetilcolinesterase">Dosagem de Acetilcolinesterase</option>
                            <option value="Dosagem de Chumbo">Dosagem de Chumbo</option>
                            <option value="EAS - Urina">EAS - Urina</option>
                            <option value="ECG (Eletrocardiograma) Convencional de até 12 Derivações">ECG (Eletrocardiograma) Convencional de até 12 Derivações</option>
                            <option value="EEG (Eletroencefalograma) de Rotina">EEG (Eletroencefalograma) de Rotina</option>
                            <option value="Eletroforese das Globulinas">Eletroforese das Globulinas</option>
                            <option value="Eletroforese Proteinas">Eletroforese Proteinas</option>
                            <option value="Enquadramento">Enquadramento</option>
                            <option value="Exame Clínico">Exame Clínico</option>
                            <option value="Fenol">Fenol</option>
                            <option value="Fluoreto Urinário">Fluoreto Urinário</option>
                            <option value="Fosfatase Alcalina">Fosfatase Alcalina</option>
                            <option value="Gama GT">Gama GT</option>
                            <option value="Glicemia">Glicemia</option>
                            <option value="Glicose">Glicose</option>
                            <option value="Grupo Sanguíneo e Fator RH">Grupo Sanguíneo e Fator RH</option>
                            <option value="HBSAC">HBSAC</option>
                            <option value="Hemoglobina Glicada">Hemoglobina Glicada</option>
                            <option value="Hemograma">Hemograma</option>
                            <option value="Hemograma com Contagem de Plaquetas ou Frações (Eritrograma, Leucograma, Plaquetas)">Hemograma com Contagem de Plaquetas ou Frações (Eritrograma, Leucograma, Plaquetas)</option>
                            <option value="Hepatite A - HAV - IgG">Hepatite A - HAV - IgG</option>
                            <option value="Hepatite A - HAV - IgM">Hepatite A - HAV - IgM</option>
                            <option value="Hepatite B - Anti HBS">Hepatite B - Anti HBS</option>
                            <option value="Hepatite B - HBC - IgG">Hepatite B - HBC - IgG</option>
                            <option value="Hepatite B - HBC - IgM">Hepatite B - HBC - IgM</option>
                            <option value="Hepatite B - HBC IgG">Hepatite B - HBC IgG</option>
                            <option value="Hepatite B - HBCAC IgG">Hepatite B - HBCAC IgG</option>
                            <option value="Hepatite C - Anti-HCV">Hepatite C - Anti-HCV</option>
                            <option value="Hepatite C - Anti-HCV - IgG">Hepatite C - Anti-HCV - IgG</option>
                            <option value="Hepatite C - Anti-HCV - IgM">Hepatite C - Anti-HCV - IgM</option>
                            <option value="Hepatograma">Hepatograma</option>
                            <option value="Homologação de atestados">Homologação de atestados</option>
                            <option value="Hormônio tiroestimulante (TSH)">Hormônio tiroestimulante (TSH)</option>
                            <option value="Inspeção dentária">Inspeção dentária</option>
                            <option value="Magnésio">Magnésio</option>
                            <option value="Manganês (sangue)">Manganês (sangue)</option>
                            <option value="Manganês (urina)">Manganês (urina)</option>
                            <option value="MEK na urina">MEK na urina</option>
                            <option value="Mercúrio">Mercúrio</option>
                            <option value="Micológico direto das unhas">Micológico direto das unhas</option>
                            <option value="Níquel">Níquel</option>
                            <option value="Orto cresol na urina">Orto cresol na urina</option>
                            <option value="Parasitológico de fezes">Parasitológico de fezes</option>
                            <option value="Perfil lipídico / Lipidograma">Perfil lipídico / Lipidograma</option>
                            <option value="Proteínas totais e frações">Proteínas totais e frações</option>
                            <option value="Prova de função pulmonar completa (Espirometria)">Prova de função pulmonar completa (Espirometria)</option>
                            <option value="Radiografia de coluna dorsal">Radiografia de coluna dorsal</option>
                            <option value="Radiografia de coluna lombo sacra">Radiografia de coluna lombo sacra</option>
                            <option value="Radiografia de tórax (PA) padrão OIT">Radiografia de tórax (PA) padrão OIT</option>
                            <option value="Radiografia de tórax PA">Radiografia de tórax PA</option>
                            <option value="Raio X de coluna lombo sacra">Raio X de coluna lombo sacra</option>
                            <option value="Raios X tórax PA / Perfil">Raios X tórax PA / Perfil</option>
                            <option value="Reticulócitos">Reticulócitos</option>
                            <option value="Retificação">Retificação</option>
                            <option value="Retorno ao trabalho">Retorno ao trabalho</option>
                            <option value="RX coluna dorsal">RX coluna dorsal</option>
                            <option value="RX coluna lombar">RX coluna lombar</option>
                            <option value="Soma dos ácidos mandélico e fenilglioxílico na urina">Soma dos ácidos mandélico e fenilglioxílico na urina</option>
                            <option value="T3 livre">T3 livre</option>
                            <option value="T4 livre">T4 livre</option>
                            <option value="Taxa de correios">Taxa de correios</option>
                            <option value="Teste de qualidade vocal">Teste de qualidade vocal</option>
                            <option value="Teste de Romberg">Teste de Romberg</option>
                            <option value="Teste Ishihara">Teste Ishihara</option>
                            <option value="TGO">TGO</option>
                            <option value="TGP">TGP</option>
                            <option value="Tolueno na urina">Tolueno na urina</option>
                            <option value="Tolueno sanguíneo">Tolueno sanguíneo</option>
                            <option value="Toxicológico">Toxicológico</option>
                            <option value="Triglicerídeos">Triglicerídeos</option>
                            <option value="Ureia">Ureia</option>
                            <option value="Ureia sérico">Ureia sérico</option>
                            <option value="Vacina">Vacina</option>
                            <option value="VDRL">VDRL</option>
                            <option value="Zinco urinário">Zinco urinário</option>
                          </select>
                          {errors.grupoExame && (
                            <p className="text-red-500 text-sm mt-2 flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              <span>{errors.grupoExame}</span>
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                            <svg className="w-4 h-4 text-[#00A298]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Situação</span>
                          </label>
                          <select
                            value={formData.situacaoProcedimento}
                            onChange={(e) => handleInputChange('situacaoProcedimento', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00A298] focus:border-[#00A298] hover:border-gray-400 transition-all duration-200"
                          >
                            <option value="Ativo">Ativo</option>
                            <option value="Inativo">Inativo</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Seção: Características Específicas */}
                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="text-lg font-semibold text-[#1D3C44] mb-4 flex items-center space-x-2">
                        <svg className="w-5 h-5 text-[#00A298]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        <span>Características Específicas</span>
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id="audiometria"
                              checked={formData.audiometria}
                              onChange={(e) => handleInputChange('audiometria', e.target.checked)}
                              className="w-5 h-5 text-[#00A298] border-2 border-gray-300 rounded focus:ring-[#00A298] focus:ring-2"
                            />
                            <label htmlFor="audiometria" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 cursor-pointer">
                              <svg className="w-5 h-5 text-[#00A298]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.5 8.5a3 3 0 000 5m0 0v-5m0 5a3 3 0 01-3-3" />
                              </svg>
                              <span>Requer Audiometria</span>
                            </label>
                          </div>
                          <p className="text-xs text-gray-600 mt-2 ml-8">Indica se o procedimento necessita de exame audiométrico</p>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id="exameClinico"
                              checked={formData.exameClinico}
                              onChange={(e) => handleInputChange('exameClinico', e.target.checked)}
                              className="w-5 h-5 text-[#00A298] border-2 border-gray-300 rounded focus:ring-[#00A298] focus:ring-2"
                            />
                            <label htmlFor="exameClinico" className="flex items-center space-x-2 text-sm font-semibold text-gray-700 cursor-pointer">
                              <svg className="w-5 h-5 text-[#00A298]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                              </svg>
                              <span>Requer Exame Clínico</span>
                            </label>
                          </div>
                          <p className="text-xs text-gray-600 mt-2 ml-8">Indica se o procedimento necessita de avaliação clínica médica</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Botões de Ação */}
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleIncluirProcedimento}
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting 
                        ? (modoEdicao ? 'SALVANDO...' : 'INCLUINDO...') 
                        : (modoEdicao ? 'SALVAR' : 'INCLUIR')
                      }
                    </button>
                    <button
                      onClick={handleLimparFormulario}
                      className="bg-blue-400 hover:bg-blue-500 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                    >
                      LIMPAR
                    </button>
                    <button
                      onClick={handleFecharCadastro}
                      className="bg-gray-400 hover:bg-gray-500 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                    >
                      VOLTAR
                    </button>
                  </div>
                </div>
              )}

              {/* Tabela de Procedimentos - só mostra quando não está cadastrando */}
              {!showCadastroModal && (
                <div className="p-6">
                  <div className="border border-gray-200 rounded-lg overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-2/5">Nome</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 w-32">Tipo</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 w-48">Procedimento</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 w-24">Audiometria</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 w-24">Exame Clínico</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 w-24">Situação</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 w-48">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {procedimentosExibidos.length > 0 ? (
                          procedimentosExibidos.map((procedimento) => (
                            <tr key={procedimento.id} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm">
                                <div className="font-medium text-gray-900">{procedimento.nome}</div>
                              </td>
                              <td className="px-4 py-3 text-sm text-center">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTipoColor(procedimento.tipo)}`}>
                                  {procedimento.tipo}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-center">
                                <span className="text-gray-600 text-xs">{procedimento.grupoExame}</span>
                              </td>
                              <td className="px-4 py-3 text-sm text-center">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  procedimento.audiometria ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {procedimento.audiometria ? 'Sim' : 'Não'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-center">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  procedimento.exameClinico ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {procedimento.exameClinico ? 'Sim' : 'Não'}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-center">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  procedimento.situacao === 'Ativo' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {procedimento.situacao}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <div className="flex space-x-2 justify-center">
                                  <button 
                                    onClick={() => handleVisualizarProcedimento(procedimento)}
                                    className="text-green-600 hover:text-green-800 text-xs font-medium cursor-pointer"
                                  >
                                    Visualizar
                                  </button>
                                  <button 
                                    onClick={() => handleEditarProcedimento(procedimento)}
                                    className="text-blue-600 hover:text-blue-800 text-xs font-medium cursor-pointer"
                                  >
                                    Editar
                                  </button>
                                  <button 
                                    onClick={() => handleInativarProcedimento(procedimento)}
                                    className={`text-xs font-medium cursor-pointer ${
                                      procedimento.situacao === 'Ativo' 
                                        ? 'text-orange-600 hover:text-orange-800' 
                                        : 'text-green-600 hover:text-green-800'
                                    }`}
                                  >
                                    {procedimento.situacao === 'Ativo' ? 'Inativar' : 'Ativar'}
                                  </button>
                                  <button 
                                    onClick={() => handleExcluirProcedimento(procedimento)}
                                    className="text-red-600 hover:text-red-800 text-xs font-medium cursor-pointer"
                                  >
                                    Excluir
                                  </button>
                                </div>
                              </td>
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
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal de Visualização */}
      {showViewProcedimentoModal && procedimentoVisualizando && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-[#1D3C44] mb-6">Visualizar Procedimento</h3>
              
              <div className="space-y-6">
                {/* Informações Básicas */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-3">Informações do Procedimento</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome do Procedimento
                      </label>
                      <input
                        type="text"
                        value={procedimentoVisualizando.nome}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Grupo de Exame
                      </label>
                      <input
                        type="text"
                        value={procedimentoVisualizando.grupoExame}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo
                      </label>
                      <div className="flex items-center">
                        <span className={`inline-flex px-3 py-2 text-sm font-semibold rounded-full ${getTipoColor(procedimentoVisualizando.tipo)}`}>
                          {procedimentoVisualizando.tipo}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Audiometria
                      </label>
                      <div className="flex items-center">
                        <span className={`inline-flex px-3 py-2 text-sm font-semibold rounded-full ${
                          procedimentoVisualizando.audiometria ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {procedimentoVisualizando.audiometria ? 'Sim' : 'Não'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Exame Clínico
                      </label>
                      <div className="flex items-center">
                        <span className={`inline-flex px-3 py-2 text-sm font-semibold rounded-full ${
                          procedimentoVisualizando.exameClinico ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {procedimentoVisualizando.exameClinico ? 'Sim' : 'Não'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Situação
                      </label>
                      <div className="flex items-center">
                        <span className={`inline-flex px-3 py-2 text-sm font-semibold rounded-full ${
                          procedimentoVisualizando.situacao === 'Ativo' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {procedimentoVisualizando.situacao}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
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
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showConfirmacaoExclusao && procedimentoParaAcao && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.164 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Confirmar Exclusão</h3>
                <p className="text-sm text-gray-500">Esta ação não pode ser desfeita.</p>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-gray-700">
                Tem certeza que deseja excluir o procedimento <strong>"{procedimentoParaAcao.nome}"</strong> do grupo <strong>{procedimentoParaAcao.grupoExame}</strong>?
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelarAcao}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarExclusao}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 cursor-pointer"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Inativação/Ativação */}
      {showConfirmacaoInativacao && procedimentoParaAcao && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                procedimentoParaAcao.situacao === 'Ativo' ? 'bg-orange-100' : 'bg-green-100'
              }`}>
                <svg className={`w-6 h-6 ${
                  procedimentoParaAcao.situacao === 'Ativo' ? 'text-orange-600' : 'text-green-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Confirmar {procedimentoParaAcao.situacao === 'Ativo' ? 'Inativação' : 'Ativação'}
                </h3>
                <p className="text-sm text-gray-500">
                  {procedimentoParaAcao.situacao === 'Ativo' 
                    ? 'O procedimento ficará indisponível para uso.' 
                    : 'O procedimento ficará disponível para uso novamente.'
                  }
                </p>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-gray-700">
                Tem certeza que deseja {procedimentoParaAcao.situacao === 'Ativo' ? 'inativar' : 'ativar'} o procedimento <strong>"{procedimentoParaAcao.nome}"</strong> do grupo <strong>{procedimentoParaAcao.grupoExame}</strong>?
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelarAcao}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarInativacao}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer text-white ${
                  procedimentoParaAcao.situacao === 'Ativo' 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {procedimentoParaAcao.situacao === 'Ativo' ? 'Inativar' : 'Ativar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}