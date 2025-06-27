'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Tipos para os dados
interface Queixa {
  id: string;
  nome: string;
  situacao: 'Ativo' | 'Inativo';
}

// Mock de dados para demonstração
const mockQueixas: Queixa[] = [
  {
    id: '1',
    nome: 'Dor de cabeça',
    situacao: 'Ativo'
  },
  {
    id: '2',
    nome: 'Febre',
    situacao: 'Ativo'
  },
  {
    id: '3',
    nome: 'Tosse seca',
    situacao: 'Ativo'
  }
];

export default function CadastroQueixas() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Estados para filtros e busca
  const [termoBusca, setTermoBusca] = useState('');
  const [situacao, setSituacao] = useState('Ativo');
  const [queixasFiltradas, setQueixasFiltradas] = useState<Queixa[]>([]);
  
  // Estados para paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  // Estados para formulário de cadastro
  const [showCadastroModal, setShowCadastroModal] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [queixaEditando, setQueixaEditando] = useState<string | null>(null);
  
  // Estados para modais de confirmação
  const [showConfirmacaoExclusao, setShowConfirmacaoExclusao] = useState(false);
  const [showConfirmacaoInativacao, setShowConfirmacaoInativacao] = useState(false);
  const [queixaParaAcao, setQueixaParaAcao] = useState<Queixa | null>(null);
  
  // Estados para visualização
  const [showViewQueixaModal, setShowViewQueixaModal] = useState(false);
  const [queixaVisualizando, setQueixaVisualizando] = useState<Queixa | null>(null);
  
  // Estados dos campos do formulário
  const [formData, setFormData] = useState({
    nome: '',
    situacaoQueixa: 'Ativo'
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

  // Efeito para filtrar queixas
  useEffect(() => {
    let resultados = mockQueixas.filter(queixa => {
      const matchSituacao = situacao === 'Todos' || queixa.situacao === situacao;
      const matchBusca = termoBusca === '' || 
        queixa.nome.toLowerCase().includes(termoBusca.toLowerCase());
      
      return matchSituacao && matchBusca;
    });

    setQueixasFiltradas(resultados);
    setPaginaAtual(1); // Reset para primeira página quando filtrar
  }, [termoBusca, situacao]);

  // Inicializar apenas com dados ativos
  useEffect(() => {
    const queixasAtivas = mockQueixas.filter(queixa => queixa.situacao === 'Ativo');
    setQueixasFiltradas(queixasAtivas);
  }, []);

  // Calcular dados da paginação
  const totalItens = queixasFiltradas.length;
  const totalPaginas = Math.ceil(totalItens / itensPorPagina);
  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const indiceFim = indiceInicio + itensPorPagina;
  const queixasExibidas = queixasFiltradas.slice(indiceInicio, indiceFim);

  const handleProcurar = () => {
    // A busca já é feita automaticamente via useEffect
    // Este método pode ser usado para ações adicionais se necessário
  };

  const carregarQueixas = () => {
    setTermoBusca('');
    setSituacao('Ativo');
    const queixasAtivas = mockQueixas.filter(queixa => queixa.situacao === 'Ativo');
    setQueixasFiltradas(queixasAtivas);
    setPaginaAtual(1);
  };

  const handleNovaQueixa = () => {
    setModoEdicao(false);
    setQueixaEditando(null);
    setShowCadastroModal(true);
    setFormData({
      nome: '',
      situacaoQueixa: 'Ativo'
    });
    setErrors({});
  };

  const handleFecharCadastro = () => {
    setShowCadastroModal(false);
    setModoEdicao(false);
    setQueixaEditando(null);
    setFormData({
      nome: '',
      situacaoQueixa: 'Ativo'
    });
    setErrors({});
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleIncluirQueixa = async () => {
    // Validar campos obrigatórios
    const newErrors: Record<string, string> = {};
    
    // Validar nome
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome da queixa é obrigatório';
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
      console.log('Dados da queixa:', formData);
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      handleFecharCadastro();
    } catch (error) {
      console.error('Erro ao salvar queixa:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLimparFormulario = () => {
    setFormData({
      nome: '',
      situacaoQueixa: 'Ativo'
    });
    setErrors({});
  };

  const handleVisualizarQueixa = (queixa: Queixa) => {
    setQueixaVisualizando(queixa);
    setShowViewQueixaModal(true);
  };

  const handleFecharVisualizacao = () => {
    setShowViewQueixaModal(false);
    setQueixaVisualizando(null);
  };

  const handleEditarQueixa = (queixa: Queixa) => {
    setModoEdicao(true);
    setQueixaEditando(queixa.id);
    setFormData({
      nome: queixa.nome,
      situacaoQueixa: queixa.situacao
    });
    setShowCadastroModal(true);
    setErrors({});
  };

  const handleExcluirQueixa = (queixa: Queixa) => {
    setQueixaParaAcao(queixa);
    setShowConfirmacaoExclusao(true);
  };

  const handleInativarQueixa = (queixa: Queixa) => {
    setQueixaParaAcao(queixa);
    setShowConfirmacaoInativacao(true);
  };

  const confirmarExclusao = () => {
    // TODO: Implementar lógica de exclusão
    console.log('Excluindo queixa:', queixaParaAcao);
    setShowConfirmacaoExclusao(false);
    setQueixaParaAcao(null);
  };

  const confirmarInativacao = () => {
    // TODO: Implementar lógica de inativação/ativação
    console.log('Alterando status da queixa:', queixaParaAcao);
    setShowConfirmacaoInativacao(false);
    setQueixaParaAcao(null);
  };

  const cancelarAcao = () => {
    setShowConfirmacaoExclusao(false);
    setShowConfirmacaoInativacao(false);
    setQueixaParaAcao(null);
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
                <span className="text-[#00A298] font-medium">Cadastro de Queixas</span>
              </div>
              
              <h1 className="text-3xl font-bold text-[#1D3C44] mb-2">
                🤒 Cadastro de Queixas
              </h1>
              <p className="text-gray-600">
                Cadastro e gerenciamento de queixas médicas e sintomas
              </p>
            </div>

            {/* Conteúdo Principal */}
            <div className="bg-white rounded-2xl shadow-xl">
              {/* Formulário de Busca */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-wrap gap-2 items-end">
                  <div className="flex-1 min-w-64">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={termoBusca}
                      onChange={(e) => setTermoBusca(e.target.value)}
                      placeholder="Digite o nome da queixa para busca..."
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
                    onClick={handleNovaQueixa}
                    className="bg-[#00A298] hover:bg-[#1D3C44] text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    NOVA QUEIXA
                  </button>
                  
                  <button 
                    onClick={carregarQueixas}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    RECARREGAR
                  </button>
                </div>
              </div>

              {/* Container de Cadastro de Queixa */}
              {showCadastroModal && (
                <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 rounded-b-2xl">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-[#1D3C44]">
                      {modoEdicao ? 'Editar Queixa' : 'Nova Queixa'}
                    </h3>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                    {/* Seção: Informações Básicas */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-[#1D3C44] mb-4 flex items-center space-x-2">
                        <svg className="w-5 h-5 text-[#00A298]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Informações da Queixa</span>
                      </h4>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                            <svg className="w-4 h-4 text-[#00A298]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <span>Nome da Queixa</span>
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.nome}
                            onChange={(e) => handleInputChange('nome', e.target.value)}
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#00A298] focus:border-[#00A298] transition-all duration-200 ${
                              errors.nome ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                            }`}
                            placeholder="Ex: Dor de cabeça, Febre, Tosse..."
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
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Situação</span>
                          </label>
                          <select
                            value={formData.situacaoQueixa}
                            onChange={(e) => handleInputChange('situacaoQueixa', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00A298] focus:border-[#00A298] hover:border-gray-400 transition-all duration-200"
                          >
                            <option value="Ativo">Ativo</option>
                            <option value="Inativo">Inativo</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Botões de Ação */}
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleIncluirQueixa}
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

              {/* Tabela de Queixas - só mostra quando não está cadastrando */}
              {!showCadastroModal && (
                <div className="p-6 rounded-b-2xl">
                  <div className="border border-gray-200 rounded-lg overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-3/5">Queixa</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 w-1/5">Situação</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 w-1/5">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {queixasExibidas.length > 0 ? (
                          queixasExibidas.map((queixa) => (
                            <tr key={queixa.id} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm">
                                <div className="font-medium text-gray-900">{queixa.nome}</div>
                              </td>
                              <td className="px-4 py-3 text-sm text-center">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  queixa.situacao === 'Ativo' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {queixa.situacao}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <div className="flex space-x-2 justify-center">
                                  <button 
                                    onClick={() => handleVisualizarQueixa(queixa)}
                                    className="text-green-600 hover:text-green-800 text-xs font-medium cursor-pointer"
                                  >
                                    Visualizar
                                  </button>
                                  <button 
                                    onClick={() => handleEditarQueixa(queixa)}
                                    className="text-blue-600 hover:text-blue-800 text-xs font-medium cursor-pointer"
                                  >
                                    Editar
                                  </button>
                                  <button 
                                    onClick={() => handleInativarQueixa(queixa)}
                                    className={`text-xs font-medium cursor-pointer ${
                                      queixa.situacao === 'Ativo' 
                                        ? 'text-orange-600 hover:text-orange-800' 
                                        : 'text-green-600 hover:text-green-800'
                                    }`}
                                  >
                                    {queixa.situacao === 'Ativo' ? 'Inativar' : 'Ativar'}
                                  </button>
                                  <button 
                                    onClick={() => handleExcluirQueixa(queixa)}
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
                            <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
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
      {showViewQueixaModal && queixaVisualizando && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-[#1D3C44] mb-6">Visualizar Queixa</h3>
              
              <div className="space-y-6">
                {/* Informações Básicas */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-3">Informações da Queixa</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome da Queixa
                      </label>
                      <input
                        type="text"
                        value={queixaVisualizando.nome}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Situação
                      </label>
                      <div className="flex items-center">
                        <span className={`inline-flex px-3 py-2 text-sm font-semibold rounded-full ${
                          queixaVisualizando.situacao === 'Ativo' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {queixaVisualizando.situacao}
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
      {showConfirmacaoExclusao && queixaParaAcao && (
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
                Tem certeza que deseja excluir a queixa <strong>"{queixaParaAcao.nome}"</strong>?
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
      {showConfirmacaoInativacao && queixaParaAcao && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                queixaParaAcao.situacao === 'Ativo' ? 'bg-orange-100' : 'bg-green-100'
              }`}>
                <svg className={`w-6 h-6 ${
                  queixaParaAcao.situacao === 'Ativo' ? 'text-orange-600' : 'text-green-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Confirmar {queixaParaAcao.situacao === 'Ativo' ? 'Inativação' : 'Ativação'}
                </h3>
                <p className="text-sm text-gray-500">
                  {queixaParaAcao.situacao === 'Ativo' 
                    ? 'A queixa ficará indisponível para uso.' 
                    : 'A queixa ficará disponível para uso novamente.'
                  }
                </p>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-gray-700">
                Tem certeza que deseja {queixaParaAcao.situacao === 'Ativo' ? 'inativar' : 'ativar'} a queixa <strong>"{queixaParaAcao.nome}"</strong>?
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
                  queixaParaAcao.situacao === 'Ativo' 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {queixaParaAcao.situacao === 'Ativo' ? 'Inativar' : 'Ativar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 