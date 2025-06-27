'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Tipos para os dados
interface AgendaProfissional {
  id: string;
  unidadeAtendimento: string;
  profissional: string;
  diaSemana: string;
  periodo: string;
  horarioInicio: string;
  horarioFim: string;
  situacao: 'Ativo' | 'Inativo';
}

// Mock de dados para demonstração
const mockAgendasProfissionais: AgendaProfissional[] = [
  {
    id: '1',
    unidadeAtendimento: 'Unidade Centro',
    profissional: 'Dr. João Silva',
    diaSemana: 'Segunda-feira',
    periodo: 'Manhã',
    horarioInicio: '08:00',
    horarioFim: '12:00',
    situacao: 'Ativo'
  },
  {
    id: '2',
    unidadeAtendimento: 'Unidade Centro',
    profissional: 'Dr. João Silva',
    diaSemana: 'Segunda-feira',
    periodo: 'Tarde',
    horarioInicio: '13:00',
    horarioFim: '17:00',
    situacao: 'Ativo'
  },
  {
    id: '3',
    unidadeAtendimento: 'Unidade Norte',
    profissional: 'Dra. Maria Santos',
    diaSemana: 'Terça-feira',
    periodo: 'Manhã',
    horarioInicio: '07:30',
    horarioFim: '11:30',
    situacao: 'Ativo'
  }
];

export default function ConfiguracaoAgenda() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Estados para filtros e busca
  const [termoBusca, setTermoBusca] = useState('');
  const [situacao, setSituacao] = useState('Ativo');
  const [agendasFiltradas, setAgendasFiltradas] = useState<AgendaProfissional[]>([]);
  
  // Estados para formulário de cadastro
  const [showCadastroModal, setShowCadastroModal] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [agendaEditando, setAgendaEditando] = useState<string | null>(null);
  
  // Estados para modais de confirmação
  const [showConfirmacaoExclusao, setShowConfirmacaoExclusao] = useState(false);
  const [showConfirmacaoInativacao, setShowConfirmacaoInativacao] = useState(false);
  const [agendaParaAcao, setAgendaParaAcao] = useState<AgendaProfissional | null>(null);
  
  // Estados para visualização
  const [showViewAgendaModal, setShowViewAgendaModal] = useState(false);
  const [agendaVisualizando, setAgendaVisualizando] = useState<AgendaProfissional | null>(null);
  
  // Estados dos campos do formulário
  const [formData, setFormData] = useState({
    unidadeAtendimento: '',
    profissional: '',
    diaSemana: '',
    periodo: '',
    horarioInicio: '',
    horarioFim: '',
    situacaoAgenda: 'Ativo'
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

  // Efeito para filtrar agendas
  useEffect(() => {
    let resultados = mockAgendasProfissionais.filter(agenda => {
      const matchSituacao = situacao === 'Todos' || agenda.situacao === situacao;
      const matchBusca = termoBusca === '' || 
        agenda.profissional.toLowerCase().includes(termoBusca.toLowerCase()) ||
        agenda.unidadeAtendimento.toLowerCase().includes(termoBusca.toLowerCase());
      
      return matchSituacao && matchBusca;
    });

    setAgendasFiltradas(resultados);
  }, [termoBusca, situacao]);

  // Inicializar apenas com dados ativos
  useEffect(() => {
    const agendasAtivas = mockAgendasProfissionais.filter(agenda => agenda.situacao === 'Ativo');
    setAgendasFiltradas(agendasAtivas);
  }, []);

  const handleProcurar = () => {
    // A busca já é feita automaticamente via useEffect
  };

  const carregarAgendas = () => {
    setTermoBusca('');
    setSituacao('Ativo');
    const agendasAtivas = mockAgendasProfissionais.filter(agenda => agenda.situacao === 'Ativo');
    setAgendasFiltradas(agendasAtivas);
  };

  const handleNovaAgenda = () => {
    setModoEdicao(false);
    setAgendaEditando(null);
    setShowCadastroModal(true);
    setFormData({
      unidadeAtendimento: '',
      profissional: '',
      diaSemana: '',
      periodo: '',
      horarioInicio: '',
      horarioFim: '',
      situacaoAgenda: 'Ativo'
    });
    setErrors({});
  };

  const handleFecharCadastro = () => {
    setShowCadastroModal(false);
    setModoEdicao(false);
    setAgendaEditando(null);
    setFormData({
      unidadeAtendimento: '',
      profissional: '',
      diaSemana: '',
      periodo: '',
      horarioInicio: '',
      horarioFim: '',
      situacaoAgenda: 'Ativo'
    });
    setErrors({});
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleIncluirAgenda = async () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.unidadeAtendimento.trim()) {
      newErrors.unidadeAtendimento = 'Unidade de atendimento é obrigatória';
    }
    if (!formData.profissional.trim()) {
      newErrors.profissional = 'Profissional é obrigatório';
    }
    if (!formData.diaSemana.trim()) {
      newErrors.diaSemana = 'Dia da semana é obrigatório';
    }
    if (!formData.periodo.trim()) {
      newErrors.periodo = 'Período é obrigatório';
    }
    if (!formData.horarioInicio.trim()) {
      newErrors.horarioInicio = 'Horário de início é obrigatório';
    }
    if (!formData.horarioFim.trim()) {
      newErrors.horarioFim = 'Horário de fim é obrigatório';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    try {
      console.log('Dados da agenda:', formData);
      await new Promise(resolve => setTimeout(resolve, 1000));
      handleFecharCadastro();
    } catch (error) {
      console.error('Erro ao salvar agenda:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLimparFormulario = () => {
    setFormData({
      unidadeAtendimento: '',
      profissional: '',
      diaSemana: '',
      periodo: '',
      horarioInicio: '',
      horarioFim: '',
      situacaoAgenda: 'Ativo'
    });
    setErrors({});
  };

  const handleVisualizarAgenda = (agenda: AgendaProfissional) => {
    setAgendaVisualizando(agenda);
    setShowViewAgendaModal(true);
  };

  const handleFecharVisualizacao = () => {
    setShowViewAgendaModal(false);
    setAgendaVisualizando(null);
  };

  const handleEditarAgenda = (agenda: AgendaProfissional) => {
    setModoEdicao(true);
    setAgendaEditando(agenda.id);
    setFormData({
      unidadeAtendimento: agenda.unidadeAtendimento,
      profissional: agenda.profissional,
      diaSemana: agenda.diaSemana,
      periodo: agenda.periodo,
      horarioInicio: agenda.horarioInicio,
      horarioFim: agenda.horarioFim,
      situacaoAgenda: agenda.situacao
    });
    setShowCadastroModal(true);
    setErrors({});
  };

  const handleExcluirAgenda = (agenda: AgendaProfissional) => {
    setAgendaParaAcao(agenda);
    setShowConfirmacaoExclusao(true);
  };

  const handleInativarAgenda = (agenda: AgendaProfissional) => {
    setAgendaParaAcao(agenda);
    setShowConfirmacaoInativacao(true);
  };

  const confirmarExclusao = () => {
    if (agendaParaAcao) {
      console.log('Excluindo agenda:', agendaParaAcao);
      setShowConfirmacaoExclusao(false);
      setAgendaParaAcao(null);
    }
  };

  const confirmarInativacao = () => {
    if (agendaParaAcao) {
      console.log('Inativando/Ativando agenda:', agendaParaAcao);
      setShowConfirmacaoInativacao(false);
      setAgendaParaAcao(null);
    }
  };

  const cancelarAcao = () => {
    setShowConfirmacaoExclusao(false);
    setShowConfirmacaoInativacao(false);
    setAgendaParaAcao(null);
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
                <span className="text-[#00A298] font-medium">Configuração da Agenda dos Profissionais</span>
              </div>
              
              <h1 className="text-3xl font-bold text-[#1D3C44] mb-2">
                📅 Configuração da Agenda dos Profissionais
              </h1>
              <p className="text-gray-600">
                Configuração de horários e disponibilidade dos profissionais
              </p>
            </div>

            {/* Conteúdo Principal */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
              {/* Formulário de Busca */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-wrap gap-2 items-end">
                  <div className="flex-1 min-w-64">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profissional ou Unidade
                    </label>
                    <input
                      type="text"
                      value={termoBusca}
                      onChange={(e) => setTermoBusca(e.target.value)}
                      placeholder="Digite o profissional ou unidade para busca..."
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
                    onClick={handleNovaAgenda}
                    className="bg-[#00A298] hover:bg-[#1D3C44] text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    NOVA AGENDA
                  </button>
                  
                  <button 
                    onClick={carregarAgendas}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    RECARREGAR
                  </button>
                </div>
              </div>

              {/* Container de Cadastro de Agenda */}
              {showCadastroModal && (
                <div className="p-6">
                  <div className="border border-gray-200 rounded-lg">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <h3 className="text-xl font-bold text-[#1D3C44]">
                        {modoEdicao ? 'Editar Agenda do Profissional' : 'Configuração da Agenda dos Profissionais'}
                      </h3>
                    </div>
                    
                    {/* Formulário */}
                    <div className="bg-white p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Unidade de atendimento: <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.unidadeAtendimento}
                            onChange={(e) => handleInputChange('unidadeAtendimento', e.target.value)}
                            className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                              errors.unidadeAtendimento ? 'border-red-500' : 'border-gray-300'
                            }`}
                          >
                            <option value="">Selecione...</option>
                            <option value="Unidade Centro">Unidade Centro</option>
                            <option value="Unidade Norte">Unidade Norte</option>
                            <option value="Unidade Sul">Unidade Sul</option>
                            <option value="Unidade Leste">Unidade Leste</option>
                            <option value="Unidade Oeste">Unidade Oeste</option>
                          </select>
                          {errors.unidadeAtendimento && (
                            <p className="mt-1 text-sm text-red-600">{errors.unidadeAtendimento}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Profissional: <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.profissional}
                            onChange={(e) => handleInputChange('profissional', e.target.value)}
                            className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                              errors.profissional ? 'border-red-500' : 'border-gray-300'
                            }`}
                          >
                            <option value="">Selecione...</option>
                            <option value="Dr. João Silva">Dr. João Silva - Médico do Trabalho</option>
                            <option value="Dra. Maria Santos">Dra. Maria Santos - Médica Ocupacional</option>
                            <option value="Dr. Carlos Oliveira">Dr. Carlos Oliveira - Cardiologista</option>
                            <option value="Enf. Ana Paula">Enf. Ana Paula - Enfermeira do Trabalho</option>
                            <option value="Tec. Roberto Lima">Tec. Roberto Lima - Técnico de Enfermagem</option>
                          </select>
                          {errors.profissional && (
                            <p className="mt-1 text-sm text-red-600">{errors.profissional}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Dia Semana: <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.diaSemana}
                            onChange={(e) => handleInputChange('diaSemana', e.target.value)}
                            className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                              errors.diaSemana ? 'border-red-500' : 'border-gray-300'
                            }`}
                          >
                            <option value="">Selecione...</option>
                            <option value="Segunda-feira">Segunda-feira</option>
                            <option value="Terça-feira">Terça-feira</option>
                            <option value="Quarta-feira">Quarta-feira</option>
                            <option value="Quinta-feira">Quinta-feira</option>
                            <option value="Sexta-feira">Sexta-feira</option>
                            <option value="Sábado">Sábado</option>
                            <option value="Domingo">Domingo</option>
                          </select>
                          {errors.diaSemana && (
                            <p className="mt-1 text-sm text-red-600">{errors.diaSemana}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Período: <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.periodo}
                            onChange={(e) => handleInputChange('periodo', e.target.value)}
                            className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                              errors.periodo ? 'border-red-500' : 'border-gray-300'
                            }`}
                          >
                            <option value="">Selecione...</option>
                            <option value="Manhã">Manhã</option>
                            <option value="Tarde">Tarde</option>
                            <option value="Noite">Noite</option>
                            <option value="Integral">Integral</option>
                          </select>
                          {errors.periodo && (
                            <p className="mt-1 text-sm text-red-600">{errors.periodo}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Horário (das): <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="time"
                            value={formData.horarioInicio}
                            onChange={(e) => handleInputChange('horarioInicio', e.target.value)}
                            className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                              errors.horarioInicio ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors.horarioInicio && (
                            <p className="mt-1 text-sm text-red-600">{errors.horarioInicio}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Horário (até): <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="time"
                            value={formData.horarioFim}
                            onChange={(e) => handleInputChange('horarioFim', e.target.value)}
                            className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                              errors.horarioFim ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors.horarioFim && (
                            <p className="mt-1 text-sm text-red-600">{errors.horarioFim}</p>
                          )}
                        </div>
                      </div>

                      {/* Seção Restrições */}
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-4">
                          <label className="block text-sm font-medium text-gray-700">
                            Restrições:
                          </label>
                          <button
                            type="button"
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer flex items-center space-x-1"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Adicionar Restrição</span>
                          </button>
                        </div>
                        <div className="text-sm text-gray-500">
                          Nenhuma restrição cadastrada
                        </div>
                      </div>
                      
                      {/* Botões de Ação */}
                      <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                        <button
                          onClick={handleIncluirAgenda}
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

              {/* Tabela de Agendas - só mostra quando não está cadastrando */}
              {!showCadastroModal && (
                <div className="p-6">
                  <div className="border border-gray-200 rounded-lg">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                            Unidade
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                            Profissional
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                            Dia Semana
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                            Período
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                            Horário
                          </th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {agendasFiltradas.length > 0 ? (
                          agendasFiltradas.map((agenda) => (
                            <tr key={agenda.id} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm">
                                <div className="font-medium text-gray-900">{agenda.unidadeAtendimento}</div>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <div className="font-medium text-gray-900">{agenda.profissional}</div>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <div className="text-gray-700">{agenda.diaSemana}</div>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  agenda.periodo === 'Manhã' ? 'bg-blue-100 text-blue-800' :
                                  agenda.periodo === 'Tarde' ? 'bg-orange-100 text-orange-800' :
                                  agenda.periodo === 'Noite' ? 'bg-purple-100 text-purple-800' :
                                  'bg-green-100 text-green-800'
                                }`}>
                                  {agenda.periodo}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {agenda.horarioInicio} até {agenda.horarioFim}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <div className="flex space-x-2 justify-center">
                                  <button 
                                    onClick={() => handleVisualizarAgenda(agenda)}
                                    className="text-green-600 hover:text-green-800 text-xs font-medium cursor-pointer"
                                  >
                                    Visualizar
                                  </button>
                                  <button 
                                    onClick={() => handleEditarAgenda(agenda)}
                                    className="text-blue-600 hover:text-blue-800 text-xs font-medium cursor-pointer"
                                  >
                                    Editar
                                  </button>
                                  <button 
                                    onClick={() => handleInativarAgenda(agenda)}
                                    className={`text-xs font-medium cursor-pointer ${
                                      agenda.situacao === 'Ativo' 
                                        ? 'text-orange-600 hover:text-orange-800' 
                                        : 'text-green-600 hover:text-green-800'
                                    }`}
                                  >
                                    {agenda.situacao === 'Ativo' ? 'Inativar' : 'Ativar'}
                                  </button>
                                  <button 
                                    onClick={() => handleExcluirAgenda(agenda)}
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
                            <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
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
      {showViewAgendaModal && agendaVisualizando && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-[#1D3C44] mb-6">Visualizar Agenda do Profissional</h3>
              
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-3">Informações da Agenda</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unidade de Atendimento
                      </label>
                      <input
                        type="text"
                        value={agendaVisualizando.unidadeAtendimento}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Profissional
                      </label>
                      <input
                        type="text"
                        value={agendaVisualizando.profissional}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dia da Semana
                      </label>
                      <input
                        type="text"
                        value={agendaVisualizando.diaSemana}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Período
                      </label>
                      <input
                        type="text"
                        value={agendaVisualizando.periodo}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Horário de Início
                      </label>
                      <input
                        type="text"
                        value={agendaVisualizando.horarioInicio}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Horário de Fim
                      </label>
                      <input
                        type="text"
                        value={agendaVisualizando.horarioFim}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      />
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
      {showConfirmacaoExclusao && agendaParaAcao && (
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
                Tem certeza que deseja excluir a agenda de <strong>"{agendaParaAcao.profissional}"</strong> para <strong>{agendaParaAcao.diaSemana}</strong> no período da <strong>{agendaParaAcao.periodo}</strong>?
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
      {showConfirmacaoInativacao && agendaParaAcao && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                agendaParaAcao.situacao === 'Ativo' ? 'bg-orange-100' : 'bg-green-100'
              }`}>
                <svg className={`w-6 h-6 ${
                  agendaParaAcao.situacao === 'Ativo' ? 'text-orange-600' : 'text-green-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Confirmar {agendaParaAcao.situacao === 'Ativo' ? 'Inativação' : 'Ativação'}
                </h3>
                <p className="text-sm text-gray-500">
                  {agendaParaAcao.situacao === 'Ativo' 
                    ? 'A agenda ficará indisponível para agendamentos.' 
                    : 'A agenda ficará disponível para agendamentos novamente.'
                  }
                </p>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-gray-700">
                Tem certeza que deseja {agendaParaAcao.situacao === 'Ativo' ? 'inativar' : 'ativar'} a agenda de <strong>"{agendaParaAcao.profissional}"</strong> para <strong>{agendaParaAcao.diaSemana}</strong>?
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
                  agendaParaAcao.situacao === 'Ativo' 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {agendaParaAcao.situacao === 'Ativo' ? 'Inativar' : 'Ativar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 