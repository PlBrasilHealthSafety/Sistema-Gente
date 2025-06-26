'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Tipos para os dados
interface Servico {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  valor: number;
  situacao: 'Ativo' | 'Inativo';
}

// Mock de dados para demonstração
const mockServicos: Servico[] = [
  {
    id: '1',
    nome: 'treinamento básico (40H)',
    descricao: 'Treinamento básico de segurança em instalações e serviços em eletricidade',
    categoria: 'Treinamento',
    valor: 250.00,
    situacao: 'Ativo'
  },
  {
    id: '2',
    nome: 'TREINAMENTO COMPLEMENTAR NR10 (40H)',
    descricao: 'Treinamento complementar de segurança em instalações e serviços em eletricidade',
    categoria: 'Treinamento',
    valor: 280.00,
    situacao: 'Ativo'
  },
  {
    id: '3',
    nome: 'TREINAMENTO DE CIPA / DESIGNADO DE SEGURANÇA (20H)',
    descricao: 'Treinamento para membros da CIPA e designados de segurança',
    categoria: 'Treinamento',
    valor: 180.00,
    situacao: 'Ativo'
  },
  
];

export default function CadastroServicos() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Estados para filtros e busca
  const [pesquisarPor, setPesquisarPor] = useState('Nome');
  const [termoBusca, setTermoBusca] = useState('');
  const [situacao, setSituacao] = useState('Ativo');
  const [servicosFiltrados, setServicosFiltrados] = useState<Servico[]>([]);
  
  // Estados para paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  // Estados para formulário de cadastro
  const [showCadastroModal, setShowCadastroModal] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [servicoEditando, setServicoEditando] = useState<string | null>(null);
  
  // Estados para modais de confirmação
  const [showConfirmacaoExclusao, setShowConfirmacaoExclusao] = useState(false);
  const [showConfirmacaoInativacao, setShowConfirmacaoInativacao] = useState(false);
  const [servicoParaAcao, setServicoParaAcao] = useState<Servico | null>(null);
  
  // Estados para visualização
  const [showViewServicoModal, setShowViewServicoModal] = useState(false);
  const [servicoVisualizando, setServicoVisualizando] = useState<Servico | null>(null);
  
  // Estados dos campos do formulário
  const [formData, setFormData] = useState({
    nome: '',
    situacaoServico: 'Ativo'
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

  // Efeito para filtrar serviços
  useEffect(() => {
    let resultados = mockServicos.filter(servico => {
      const matchSituacao = situacao === 'Todos' || servico.situacao === situacao;
      const matchBusca = termoBusca === '' || 
        servico.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
        servico.categoria.toLowerCase().includes(termoBusca.toLowerCase()) ||
        servico.descricao.toLowerCase().includes(termoBusca.toLowerCase());
      
      return matchSituacao && matchBusca;
    });

    setServicosFiltrados(resultados);
    setPaginaAtual(1); // Reset para primeira página quando filtrar
  }, [termoBusca, situacao]);

  // Inicializar com todos os dados
  useEffect(() => {
    setServicosFiltrados(mockServicos);
  }, []);

  // Calcular dados da paginação
  const totalItens = servicosFiltrados.length;
  const totalPaginas = Math.ceil(totalItens / itensPorPagina);
  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const indiceFim = indiceInicio + itensPorPagina;
  const servicosExibidos = servicosFiltrados.slice(indiceInicio, indiceFim);

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const handleProcurar = () => {
    // A busca já é feita automaticamente via useEffect
    // Este método pode ser usado para ações adicionais se necessário
  };

  const carregarServicos = () => {
    setTermoBusca('');
    setSituacao('Ativo');
    setServicosFiltrados(mockServicos);
    setPaginaAtual(1);
  };

  const handleNovoServico = () => {
    setModoEdicao(false);
    setServicoEditando(null);
    setShowCadastroModal(true);
    setFormData({
      nome: '',
      situacaoServico: 'Ativo'
    });
    setErrors({});
  };

  const handleFecharCadastro = () => {
    setShowCadastroModal(false);
    setModoEdicao(false);
    setServicoEditando(null);
    setFormData({
      nome: '',
      situacaoServico: 'Ativo'
    });
    setErrors({});
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleIncluirServico = async () => {
    // Validar campos obrigatórios
    const newErrors: Record<string, string> = {};
    
    // Validar nome
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome do serviço é obrigatório';
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
      console.log('Dados do serviço:', formData);
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      handleFecharCadastro();
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLimparFormulario = () => {
    setFormData({
      nome: '',
      situacaoServico: 'Ativo'
    });
    setErrors({});
  };

  // Funções para ações da tabela
  const handleVisualizarServico = (servico: Servico) => {
    setServicoVisualizando(servico);
    setShowViewServicoModal(true);
  };

  const handleFecharVisualizacao = () => {
    setShowViewServicoModal(false);
    setServicoVisualizando(null);
  };

  const handleEditarServico = (servico: Servico) => {
    setModoEdicao(true);
    setServicoEditando(servico.id);
    setFormData({
      nome: servico.nome,
      situacaoServico: servico.situacao
    });
    setShowCadastroModal(true);
    setErrors({});
  };

  const handleExcluirServico = (servico: Servico) => {
    setServicoParaAcao(servico);
    setShowConfirmacaoExclusao(true);
  };

  const handleInativarServico = (servico: Servico) => {
    setServicoParaAcao(servico);
    setShowConfirmacaoInativacao(true);
  };

  const confirmarExclusao = () => {
    if (servicoParaAcao) {
      // TODO: Implementar lógica de exclusão na API
      console.log('Excluindo serviço:', servicoParaAcao);
      setShowConfirmacaoExclusao(false);
      setServicoParaAcao(null);
    }
  };

  const confirmarInativacao = () => {
    if (servicoParaAcao) {
      // TODO: Implementar lógica de inativação na API
      console.log('Inativando/Ativando serviço:', servicoParaAcao);
      setShowConfirmacaoInativacao(false);
      setServicoParaAcao(null);
    }
  };

  const cancelarAcao = () => {
    setShowConfirmacaoExclusao(false);
    setShowConfirmacaoInativacao(false);
    setServicoParaAcao(null);
  };

  const getPlaceholderBusca = () => {
    switch (pesquisarPor) {
      case 'Nome':
        return 'Digite o nome para busca...';
      case 'Categoria':
        return 'Digite a categoria para busca...';
      case 'Descricao':
        return 'Digite a descrição para busca...';
      default:
        return 'Digite o termo para busca...';
    }
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
                <span className="text-[#00A298] font-medium">Cadastro de Serviços</span>
              </div>
              
              <h1 className="text-3xl font-bold text-[#1D3C44] mb-2">
                🛠️ Consulta de Serviços
              </h1>
              <p className="text-gray-600">
                Cadastro e gerenciamento de serviços oferecidos
              </p>
            </div>

            {/* Conteúdo Principal */}
            <div className="bg-white rounded-2xl shadow-xl">
              {/* Formulário de Busca */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-wrap gap-2 items-end">
                  <div className="flex-1 min-w-64">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pesquisar por
                    </label>
                    <select
                      value={pesquisarPor}
                      onChange={(e) => setPesquisarPor(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                    >
                      <option value="Nome">Nome</option>
                      <option value="Categoria">Categoria</option>
                      <option value="Descricao">Descrição</option>
                    </select>
                  </div>
                  
                  <div className="flex-1 min-w-64">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Termo de busca
                    </label>
                    <input
                      type="text"
                      value={termoBusca}
                      onChange={(e) => setTermoBusca(e.target.value)}
                      placeholder={getPlaceholderBusca()}
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
                    onClick={handleNovoServico}
                    className="bg-[#00A298] hover:bg-[#1D3C44] text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    NOVO SERVIÇO
                  </button>
                  
                  <button 
                    onClick={carregarServicos}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    RECARREGAR
                  </button>
                </div>
              </div>

              {/* Container de Cadastro de Serviço */}
              {showCadastroModal && (
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-[#1D3C44] mb-4">
                      {modoEdicao ? 'Editar Serviço' : 'Cadastro de Serviços'}
                    </h3>
                    <hr className="border-gray-300" />
                  </div>
                  
                  {/* Formulário Simplificado */}
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
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
                          value={formData.situacaoServico}
                          onChange={(e) => handleInputChange('situacaoServico', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                        >
                          <option value="Ativo">Ativo</option>
                          <option value="Inativo">Inativo</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Botões de Ação */}
                    <div className="flex gap-2 mt-6">
                      <button
                        onClick={handleIncluirServico}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-[#00A298] hover:bg-[#1D3C44] text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm cursor-pointer"
                      >
                        {isSubmitting 
                          ? (modoEdicao ? 'SALVANDO...' : 'INCLUINDO...') 
                          : (modoEdicao ? 'SALVAR' : 'INCLUIR')
                        }
                      </button>
                      <button
                        onClick={handleLimparFormulario}
                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 text-sm cursor-pointer"
                      >
                        LIMPAR
                      </button>
                      <button
                        onClick={handleFecharCadastro}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 text-sm cursor-pointer"
                      >
                        CANCELAR
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tabela de Serviços */}
              <div className="p-6">
                <div className="border border-gray-200 rounded-lg">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Nome
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                          Situação
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {servicosExibidos.length > 0 ? (
                        servicosExibidos.map((servico) => (
                          <tr key={servico.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">
                              <div className="font-medium text-gray-900">{servico.nome}</div>
                            </td>
                            <td className="px-4 py-3 text-sm text-center">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                servico.situacao === 'Ativo' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {servico.situacao}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex space-x-2 justify-center">
                                <button 
                                  onClick={() => handleVisualizarServico(servico)}
                                  className="text-green-600 hover:text-green-800 text-xs font-medium cursor-pointer"
                                >
                                  Visualizar
                                </button>
                                <button 
                                  onClick={() => handleEditarServico(servico)}
                                  className="text-blue-600 hover:text-blue-800 text-xs font-medium cursor-pointer"
                                >
                                  Editar
                                </button>
                                <button 
                                  onClick={() => handleInativarServico(servico)}
                                  className={`text-xs font-medium cursor-pointer ${
                                    servico.situacao === 'Ativo' 
                                      ? 'text-orange-600 hover:text-orange-800' 
                                      : 'text-green-600 hover:text-green-800'
                                  }`}
                                >
                                  {servico.situacao === 'Ativo' ? 'Inativar' : 'Ativar'}
                                </button>
                                <button 
                                  onClick={() => handleExcluirServico(servico)}
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
                {totalItens > 0 && (
                  <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 flex justify-between sm:hidden">
                        <button
                          onClick={() => setPaginaAtual(Math.max(1, paginaAtual - 1))}
                          disabled={paginaAtual === 1}
                          className="relative inline-flex items-center px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          Anterior
                        </button>
                        <button
                          onClick={() => setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1))}
                          disabled={paginaAtual === totalPaginas}
                          className="ml-3 relative inline-flex items-center px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          Próxima
                        </button>
                      </div>
                      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-gray-700">
                            Página <span className="font-medium">{paginaAtual}</span> de{' '}
                            <span className="font-medium">{Math.max(1, totalPaginas)}</span> ({totalItens} {totalItens === 1 ? 'item' : 'itens'})
                          </p>
                        </div>
                        <div>
                          {totalPaginas > 1 ? (
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                              {/* Botão Anterior */}
                              <button
                                onClick={() => setPaginaAtual(Math.max(1, paginaAtual - 1))}
                                disabled={paginaAtual === 1}
                                className="relative inline-flex items-center px-2.5 py-2.5 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                              >
                                ←
                              </button>

                              {/* Páginas */}
                              {gerarPaginacao().map((pagina) => (
                                <button
                                  key={pagina}
                                  onClick={() => setPaginaAtual(pagina)}
                                  className={`relative inline-flex items-center px-3.5 py-2.5 border text-sm font-medium cursor-pointer ${
                                    pagina === paginaAtual
                                      ? 'z-10 bg-[#00A298] border-[#00A298] text-white'
                                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                  }`}
                                >
                                  {pagina}
                                </button>
                              ))}

                              {/* Botão Próxima */}
                              <button
                                onClick={() => setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1))}
                                disabled={paginaAtual === totalPaginas}
                                className="relative inline-flex items-center px-2.5 py-2.5 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                              >
                                →
                              </button>
                            </nav>
                          ) : (
                            <div className="text-sm text-gray-500">
                              {totalItens > 0 ? 'Todos os dados em uma página' : 'Nenhum item encontrado'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal de Visualização */}
      {showViewServicoModal && servicoVisualizando && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-[#1D3C44] mb-6">Visualizar Serviço</h3>
              
              <div className="space-y-6">
                {/* Informações Básicas */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-3">Informações do Serviço</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome do Serviço
                      </label>
                      <input
                        type="text"
                        value={servicoVisualizando.nome}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categoria
                      </label>
                      <input
                        type="text"
                        value={servicoVisualizando.categoria}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Valor
                      </label>
                      <input
                        type="text"
                        value={formatarValor(servicoVisualizando.valor)}
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
                          servicoVisualizando.situacao === 'Ativo' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {servicoVisualizando.situacao}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição
                    </label>
                    <textarea
                      value={servicoVisualizando.descricao}
                      readOnly
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
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
      {showConfirmacaoExclusao && servicoParaAcao && (
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
                Tem certeza que deseja excluir o serviço <strong>"{servicoParaAcao.nome}"</strong>?
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
      {showConfirmacaoInativacao && servicoParaAcao && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                servicoParaAcao.situacao === 'Ativo' ? 'bg-orange-100' : 'bg-green-100'
              }`}>
                <svg className={`w-6 h-6 ${
                  servicoParaAcao.situacao === 'Ativo' ? 'text-orange-600' : 'text-green-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Confirmar {servicoParaAcao.situacao === 'Ativo' ? 'Inativação' : 'Ativação'}
                </h3>
                <p className="text-sm text-gray-500">
                  {servicoParaAcao.situacao === 'Ativo' 
                    ? 'O serviço ficará indisponível para uso.' 
                    : 'O serviço ficará disponível para uso novamente.'
                  }
                </p>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-gray-700">
                Tem certeza que deseja {servicoParaAcao.situacao === 'Ativo' ? 'inativar' : 'ativar'} o serviço <strong>"{servicoParaAcao.nome}"</strong>?
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
                  servicoParaAcao.situacao === 'Ativo' 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {servicoParaAcao.situacao === 'Ativo' ? 'Inativar' : 'Ativar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 