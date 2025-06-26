'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Tipos para os dados
interface TipoAfastamento {
  id: string;
  nome: string;
  situacao: 'Ativo' | 'Inativo';
}

// Mock de dados para demonstração
const mockTiposAfastamento: TipoAfastamento[] = [
  {
    id: '1',
    nome: 'Licença Médica',
    situacao: 'Ativo'
  },
  {
    id: '2',
    nome: 'Licença Maternidade',
    situacao: 'Ativo'
  },
  {
    id: '3',
    nome: 'Férias',
    situacao: 'Ativo'
  },
  {
    id: '4',
    nome: 'Licença Paternidade',
    situacao: 'Ativo'
  },
  {
    id: '5',
    nome: 'Afastamento INSS',
    situacao: 'Ativo'
  },
  {
    id: '6',
    nome: 'Suspensão Disciplinar',
    situacao: 'Inativo'
  }
];

export default function CadastroTiposAfastamento() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Estados para filtros e busca
  const [termoBusca, setTermoBusca] = useState('');
  const [situacao, setSituacao] = useState('Ativo');
  const [tiposAfastamentoFiltrados, setTiposAfastamentoFiltrados] = useState<TipoAfastamento[]>([]);
  
  // Estados para paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  // Estados para formulário de cadastro
  const [showCadastroModal, setShowCadastroModal] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [tipoEditando, setTipoEditando] = useState<string | null>(null);
  
  // Estados para modais de confirmação
  const [showConfirmacaoExclusao, setShowConfirmacaoExclusao] = useState(false);
  const [showConfirmacaoInativacao, setShowConfirmacaoInativacao] = useState(false);
  const [tipoParaAcao, setTipoParaAcao] = useState<TipoAfastamento | null>(null);
  
  // Estados para visualização
  const [showViewTipoModal, setShowViewTipoModal] = useState(false);
  const [tipoVisualizando, setTipoVisualizando] = useState<TipoAfastamento | null>(null);
  
  // Estados dos campos do formulário
  const [formData, setFormData] = useState({
    nome: '',
    situacaoTipo: 'Ativo'
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

  // Efeito para filtrar tipos de afastamento
  useEffect(() => {
    let resultados = mockTiposAfastamento.filter(tipo => {
      const matchSituacao = situacao === 'Todos' || tipo.situacao === situacao;
      const matchBusca = termoBusca === '' || 
        tipo.nome.toLowerCase().includes(termoBusca.toLowerCase());
      
      return matchSituacao && matchBusca;
    });

    setTiposAfastamentoFiltrados(resultados);
    setPaginaAtual(1); // Reset para primeira página quando filtrar
  }, [termoBusca, situacao]);

  // Inicializar apenas com dados ativos
  useEffect(() => {
    const tiposAtivos = mockTiposAfastamento.filter(tipo => tipo.situacao === 'Ativo');
    setTiposAfastamentoFiltrados(tiposAtivos);
  }, []);

  // Calcular dados da paginação
  const totalItens = tiposAfastamentoFiltrados.length;
  const totalPaginas = Math.ceil(totalItens / itensPorPagina);
  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const indiceFim = indiceInicio + itensPorPagina;
  const tiposExibidos = tiposAfastamentoFiltrados.slice(indiceInicio, indiceFim);

  const handleProcurar = () => {
    // A busca já é feita automaticamente via useEffect
    // Este método pode ser usado para ações adicionais se necessário
  };

  const carregarTiposAfastamento = () => {
    setTermoBusca('');
    setSituacao('Ativo');
    const tiposAtivos = mockTiposAfastamento.filter(tipo => tipo.situacao === 'Ativo');
    setTiposAfastamentoFiltrados(tiposAtivos);
    setPaginaAtual(1);
  };

  const handleNovoTipo = () => {
    setModoEdicao(false);
    setTipoEditando(null);
    setShowCadastroModal(true);
    setFormData({
      nome: '',
      situacaoTipo: 'Ativo'
    });
    setErrors({});
  };

  const handleFecharCadastro = () => {
    setShowCadastroModal(false);
    setModoEdicao(false);
    setTipoEditando(null);
    setFormData({
      nome: '',
      situacaoTipo: 'Ativo'
    });
    setErrors({});
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleIncluirTipo = async () => {
    // Validar campos obrigatórios
    const newErrors: Record<string, string> = {};
    
    // Validar nome
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome do tipo de afastamento é obrigatório';
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
      console.log('Dados do tipo de afastamento:', formData);
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      handleFecharCadastro();
    } catch (error) {
      console.error('Erro ao salvar tipo de afastamento:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLimparFormulario = () => {
    setFormData({
      nome: '',
      situacaoTipo: 'Ativo'
    });
    setErrors({});
  };

  // Funções para ações da tabela
  const handleVisualizarTipo = (tipo: TipoAfastamento) => {
    setTipoVisualizando(tipo);
    setShowViewTipoModal(true);
  };

  const handleFecharVisualizacao = () => {
    setShowViewTipoModal(false);
    setTipoVisualizando(null);
  };

  const handleEditarTipo = (tipo: TipoAfastamento) => {
    setModoEdicao(true);
    setTipoEditando(tipo.id);
    setFormData({
      nome: tipo.nome,
      situacaoTipo: tipo.situacao
    });
    setShowCadastroModal(true);
    setErrors({});
  };

  const handleExcluirTipo = (tipo: TipoAfastamento) => {
    setTipoParaAcao(tipo);
    setShowConfirmacaoExclusao(true);
  };

  const handleInativarTipo = (tipo: TipoAfastamento) => {
    setTipoParaAcao(tipo);
    setShowConfirmacaoInativacao(true);
  };

  const confirmarExclusao = () => {
    if (tipoParaAcao) {
      // TODO: Implementar lógica de exclusão na API
      console.log('Excluindo tipo de afastamento:', tipoParaAcao);
      setShowConfirmacaoExclusao(false);
      setTipoParaAcao(null);
    }
  };

  const confirmarInativacao = () => {
    if (tipoParaAcao) {
      // TODO: Implementar lógica de inativação na API
      console.log('Inativando/Ativando tipo de afastamento:', tipoParaAcao);
      setShowConfirmacaoInativacao(false);
      setTipoParaAcao(null);
    }
  };

  const cancelarAcao = () => {
    setShowConfirmacaoExclusao(false);
    setShowConfirmacaoInativacao(false);
    setTipoParaAcao(null);
  };

  const gerarPaginacao = () => {
    const paginas = [];
    const maxPaginasVisiveis = 5;
    let inicio = Math.max(1, paginaAtual - Math.floor(maxPaginasVisiveis / 2));
    let fim = Math.min(totalPaginas, inicio + maxPaginasVisiveis - 1);

    if (fim - inicio < maxPaginasVisiveis - 1) {
      inicio = Math.max(1, fim - maxPaginasVisiveis + 1);
    }

    for (let i = inicio; i <= fim; i++) {
      paginas.push(i);
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
        <main className="flex-1 p-4">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb e Navegação */}
            <div className="mb-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                <button 
                  onClick={() => router.push('/home')}
                  className="hover:text-[#00A298] cursor-pointer"
                >
                  Tabelas Básicas
                </button>
                <span>/</span>
                <span className="text-[#00A298] font-medium">Cadastro de Tipos de Afastamento</span>
              </div>
              
              <h1 className="text-3xl font-bold text-[#1D3C44] mb-2">
                📋 Cadastro de Tipos de Afastamento
              </h1>
              <p className="text-gray-600">
                Cadastro e gerenciamento de tipos de afastamento
              </p>
            </div>

            {/* Conteúdo Principal */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
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
                      placeholder="Digite o nome para busca..."
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
                    onClick={handleNovoTipo}
                    className="bg-[#00A298] hover:bg-[#1D3C44] text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    NOVO TIPO DE AFASTAMENTO
                  </button>
                  
                  <button 
                    onClick={carregarTiposAfastamento}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    RECARREGAR
                  </button>
                </div>
              </div>

              {/* Container de Cadastro de Tipo */}
              {showCadastroModal && (
                <div className="p-6">
                  <div className="border border-gray-200 rounded-lg">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <h3 className="text-xl font-bold text-[#1D3C44]">
                        {modoEdicao ? 'Editar Tipo de Afastamento' : 'Cadastro de Tipos de Afastamento'}
                      </h3>
                    </div>
                    
                    {/* Formulário Simplificado */}
                    <div className="bg-white p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nome
                          </label>
                          <input
                            type="text"
                            value={formData.nome}
                            onChange={(e) => handleInputChange('nome', e.target.value)}
                            className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                              errors.nome ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder=""
                          />
                          {errors.nome && (
                            <p className="mt-1 text-sm text-red-600">{errors.nome}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Situação
                          </label>
                          <select
                            value={formData.situacaoTipo}
                            onChange={(e) => handleInputChange('situacaoTipo', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                          >
                            <option value="Ativo">Ativo</option>
                            <option value="Inativo">Inativo</option>
                          </select>
                        </div>
                      </div>
                      
                      {/* Botões de Ação */}
                      <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                        <button
                          onClick={handleIncluirTipo}
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
                  </div>
                </div>
              )}

              {/* Tabela de Tipos de Afastamento - só mostra quando não está cadastrando */}
              {!showCadastroModal && (
                <div className="p-6">
                  <div className="border border-gray-200 rounded-lg">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-1/2">
                            Nome
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 w-32">
                            Situação
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 w-48">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {tiposExibidos.length > 0 ? (
                          tiposExibidos.map((tipo) => (
                            <tr key={tipo.id} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm">
                                <div className="font-medium text-gray-900">{tipo.nome}</div>
                              </td>
                              <td className="px-4 py-3 text-sm text-center">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  tipo.situacao === 'Ativo' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {tipo.situacao}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <div className="flex space-x-2 justify-center">
                                  <button 
                                    onClick={() => handleVisualizarTipo(tipo)}
                                    className="text-green-600 hover:text-green-800 text-xs font-medium cursor-pointer"
                                  >
                                    Visualizar
                                  </button>
                                  <button 
                                    onClick={() => handleEditarTipo(tipo)}
                                    className="text-blue-600 hover:text-blue-800 text-xs font-medium cursor-pointer"
                                  >
                                    Editar
                                  </button>
                                  <button 
                                    onClick={() => handleInativarTipo(tipo)}
                                    className={`text-xs font-medium cursor-pointer ${
                                      tipo.situacao === 'Ativo' 
                                        ? 'text-orange-600 hover:text-orange-800' 
                                        : 'text-green-600 hover:text-green-800'
                                    }`}
                                  >
                                    {tipo.situacao === 'Ativo' ? 'Inativar' : 'Ativar'}
                                  </button>
                                  <button 
                                    onClick={() => handleExcluirTipo(tipo)}
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

                  {/* Paginação - sempre mostrar para manter consistência */}
                 
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal de Visualização */}
      {showViewTipoModal && tipoVisualizando && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-[#1D3C44] mb-6">Visualizar Tipo de Afastamento</h3>
              
              <div className="space-y-6">
                {/* Informações Básicas */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-3">Informações do Tipo de Afastamento</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome do Tipo
                      </label>
                      <input
                        type="text"
                        value={tipoVisualizando.nome}
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
                          tipoVisualizando.situacao === 'Ativo' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {tipoVisualizando.situacao}
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
      {showConfirmacaoExclusao && tipoParaAcao && (
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
                Tem certeza que deseja excluir o tipo de afastamento <strong>"{tipoParaAcao.nome}"</strong>?
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
      {showConfirmacaoInativacao && tipoParaAcao && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                tipoParaAcao.situacao === 'Ativo' ? 'bg-orange-100' : 'bg-green-100'
              }`}>
                <svg className={`w-6 h-6 ${
                  tipoParaAcao.situacao === 'Ativo' ? 'text-orange-600' : 'text-green-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Confirmar {tipoParaAcao.situacao === 'Ativo' ? 'Inativação' : 'Ativação'}
                </h3>
                <p className="text-sm text-gray-500">
                  {tipoParaAcao.situacao === 'Ativo' 
                    ? 'O tipo ficará indisponível para uso.' 
                    : 'O tipo ficará disponível para uso novamente.'
                  }
                </p>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-gray-700">
                Tem certeza que deseja {tipoParaAcao.situacao === 'Ativo' ? 'inativar' : 'ativar'} o tipo de afastamento <strong>"{tipoParaAcao.nome}"</strong>?
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
                  tipoParaAcao.situacao === 'Ativo' 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {tipoParaAcao.situacao === 'Ativo' ? 'Inativar' : 'Ativar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 