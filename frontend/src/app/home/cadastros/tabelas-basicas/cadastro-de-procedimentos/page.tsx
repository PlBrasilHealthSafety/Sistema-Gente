'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Tipos para os dados
interface Procedimento {
  id: string;
  nome: string;
  tipo: 'Médico' | 'Administrativo' | 'Segurança' | 'Diagnóstico';
  grupoExame: string;
  situacao: 'Ativo' | 'Inativo';
}

// Mock de dados para demonstração
const mockProcedimentos: Procedimento[] = [
  {
    id: '1',
    nome: 'Consulta Médica Ocupacional',
    tipo: 'Médico',
    grupoExame: 'Exames Ocupacionais',
    situacao: 'Ativo'
  },
  {
    id: '2',
    nome: 'Exame Admissional',
    tipo: 'Médico',
    grupoExame: 'Exames Ocupacionais',
    situacao: 'Ativo'
  },
  {
    id: '3',
    nome: 'Audiometria',
    tipo: 'Diagnóstico',
    grupoExame: 'Exames Complementares',
    situacao: 'Ativo'
  },
  {
    id: '4',
    nome: 'Hemograma Completo',
    tipo: 'Diagnóstico',
    grupoExame: 'Exames Laboratoriais',
    situacao: 'Ativo'
  },
  {
    id: '5',
    nome: 'Treinamento de Segurança',
    tipo: 'Segurança',
    grupoExame: 'Capacitação',
    situacao: 'Ativo'
  },
  {
    id: '6',
    nome: 'Cadastro de Funcionário',
    tipo: 'Administrativo',
    grupoExame: 'Processos Administrativos',
    situacao: 'Inativo'
  }
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
      case 'Diagnóstico':
        return 'bg-purple-100 text-purple-800';
      case 'Segurança':
        return 'bg-orange-100 text-orange-800';
      case 'Administrativo':
        return 'bg-gray-100 text-gray-800';
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
                      Nome ou Grupo
                    </label>
                    <input
                      type="text"
                      value={termoBusca}
                      onChange={(e) => setTermoBusca(e.target.value)}
                      placeholder="Digite o nome ou grupo de exame para busca..."
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
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-[#1D3C44] mb-4">
                    {modoEdicao ? 'Editar Procedimento' : 'Cadastro de Procedimentos'}
                  </h3>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Dados do procedimento</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nome
                        </label>
                        <input
                          type="text"
                          value={formData.nome}
                          onChange={(e) => handleInputChange('nome', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                            errors.nome ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Digite o nome do procedimento"
                        />
                        {errors.nome && (
                          <p className="text-red-500 text-xs mt-1">{errors.nome}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo
                        </label>
                        <select
                          value={formData.tipo}
                          onChange={(e) => handleInputChange('tipo', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                        >
                          <option value="Médico">Médico</option>
                          <option value="Diagnóstico">Diagnóstico</option>
                          <option value="Segurança">Segurança</option>
                          <option value="Administrativo">Administrativo</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Grupo de Exame
                        </label>
                        <select
                          value={formData.grupoExame}
                          onChange={(e) => handleInputChange('grupoExame', e.target.value)}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                            errors.grupoExame ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Selecione um grupo</option>
                          <option value="Exames Ocupacionais">Exames Ocupacionais</option>
                          <option value="Exames Complementares">Exames Complementares</option>
                          <option value="Exames Laboratoriais">Exames Laboratoriais</option>
                          <option value="Capacitação">Capacitação</option>
                          <option value="Processos Administrativos">Processos Administrativos</option>
                        </select>
                        {errors.grupoExame && (
                          <p className="text-red-500 text-xs mt-1">{errors.grupoExame}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Situação
                        </label>
                        <select
                          value={formData.situacaoProcedimento}
                          onChange={(e) => handleInputChange('situacaoProcedimento', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                        >
                          <option value="Ativo">Ativo</option>
                          <option value="Inativo">Inativo</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  
                  {/* Botões de Ação */}
                  <div className="flex gap-3">
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
                      RETORNAR
                    </button>
                  </div>
                </div>
              )}

              {/* Tabela de Procedimentos - só mostra quando não está cadastrando */}
              {!showCadastroModal && (
                <div className="p-6">
                  <div className="border border-gray-200 rounded-lg">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-2/5">Nome</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 w-32">Tipo</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 w-48">Grupo de Exame</th>
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
                            <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
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