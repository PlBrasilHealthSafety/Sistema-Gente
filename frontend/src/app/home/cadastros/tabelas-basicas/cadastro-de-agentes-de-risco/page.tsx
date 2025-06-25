'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Tipos para os dados
interface AgenteRisco {
  id: string;
  agente: string;
  risco: string;
  fatorRisco: string;
  situacao: 'Ativo' | 'Inativo';
}

// Mock de dados para demonstração
const mockAgentesRisco: AgenteRisco[] = [
  {
    id: '1',
    agente: 'Ruído Contínuo',
    risco: 'Físico',
    fatorRisco: 'Exposição a níveis elevados de ruído em ambiente industrial',
    situacao: 'Ativo'
  },
  {
    id: '2',
    agente: 'Benzeno',
    risco: 'Químico',
    fatorRisco: 'Inalação de vapores de benzeno em laboratório',
    situacao: 'Ativo'
  },
  {
    id: '3',
    agente: 'Vibração',
    risco: 'Físico',
    fatorRisco: 'Vibração de corpo inteiro em operação de equipamentos',
    situacao: 'Ativo'
  },
  {
    id: '4',
    agente: 'Hepatite B',
    risco: 'Biológico',
    fatorRisco: 'Contato com material biológico contaminado',
    situacao: 'Inativo'
  },
  {
    id: '5',
    agente: 'Levantamento de Peso',
    risco: 'Ergonômico',
    fatorRisco: 'Movimentação manual de cargas pesadas',
    situacao: 'Ativo'
  }
];

export default function CadastroAgentesRisco() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Estados para filtros e busca
  const [pesquisarPor, setPesquisarPor] = useState('Agente');
  const [termoBusca, setTermoBusca] = useState('');
  const [situacao, setSituacao] = useState('Ativo');
  const [agentesRiscoFiltrados, setAgentesRiscoFiltrados] = useState<AgenteRisco[]>([]);
  
  // Estados para paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  // Estados para formulário de cadastro
  const [showCadastroModal, setShowCadastroModal] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [agenteEditando, setAgenteEditando] = useState<string | null>(null);
  
  // Estados para modais de confirmação
  const [showConfirmacaoExclusao, setShowConfirmacaoExclusao] = useState(false);
  const [showConfirmacaoInativacao, setShowConfirmacaoInativacao] = useState(false);
  const [agenteParaAcao, setAgenteParaAcao] = useState<AgenteRisco | null>(null);
  
  // Estados dos campos do formulário
  const [formData, setFormData] = useState({
    risco: '',
    nomeAgente: '',
    fatorRisco: '',
    tipo: '',
    nivelAcao: '',
    limiteToleranciaTipo: 'Valor',
    limiteToleranciaTempo: '',
    unidadeMedida: '',
    tempoHoras: '',
    tempoMinutos: '',
    observacao: '',
    situacao: 'Ativo'
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

  // Efeito para filtrar agentes de risco
  useEffect(() => {
    let resultados = mockAgentesRisco.filter(agenteRisco => {
      const matchSituacao = situacao === 'Todos' || agenteRisco.situacao === situacao;
      const matchBusca = termoBusca === '' || 
        agenteRisco.agente.toLowerCase().includes(termoBusca.toLowerCase()) ||
        agenteRisco.risco.toLowerCase().includes(termoBusca.toLowerCase()) ||
        agenteRisco.fatorRisco.toLowerCase().includes(termoBusca.toLowerCase());
      
      return matchSituacao && matchBusca;
    });

    setAgentesRiscoFiltrados(resultados);
    setPaginaAtual(1); // Reset para primeira página quando filtrar
  }, [termoBusca, situacao]);

  // Calcular dados da paginação
  const totalItens = agentesRiscoFiltrados.length;
  const totalPaginas = Math.ceil(totalItens / itensPorPagina);
  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const indiceFim = indiceInicio + itensPorPagina;
  const agentesRiscoExibidos = agentesRiscoFiltrados.slice(indiceInicio, indiceFim);

  const handleProcurar = () => {
    // A busca já é feita automaticamente via useEffect
    // Este método pode ser usado para ações adicionais se necessário
  };

  const handleNovoAgente = () => {
    setModoEdicao(false);
    setAgenteEditando(null);
    setShowCadastroModal(true);
    setFormData({
      risco: '',
      nomeAgente: '',
      fatorRisco: '',
      tipo: '',
      nivelAcao: '',
      limiteToleranciaTipo: 'Valor',
      limiteToleranciaTempo: '',
      unidadeMedida: '',
      tempoHoras: '',
      tempoMinutos: '',
      observacao: '',
      situacao: 'Ativo'
    });
    setErrors({});
  };

  const handleFecharCadastro = () => {
    setShowCadastroModal(false);
    setModoEdicao(false);
    setAgenteEditando(null);
    setFormData({
      risco: '',
      nomeAgente: '',
      fatorRisco: '',
      tipo: '',
      nivelAcao: '',
      limiteToleranciaTipo: 'Valor',
      limiteToleranciaTempo: '',
      unidadeMedida: '',
      tempoHoras: '',
      tempoMinutos: '',
      observacao: '',
      situacao: 'Ativo'
    });
    setErrors({});
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleIncluirAgente = async () => {
    // Validar campos obrigatórios
    const newErrors: Record<string, string> = {};
    
    // Validar nome do agente
    if (!formData.nomeAgente.trim()) {
      newErrors.nomeAgente = 'Nome do agente é obrigatório';
    }
    
    // Validar risco
    if (!formData.risco.trim()) {
      newErrors.risco = 'Tipo de risco é obrigatório';
    }
    
    // Validar fator de risco
    if (!formData.fatorRisco.trim()) {
      newErrors.fatorRisco = 'Fator de risco é obrigatório';
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
      console.log('Dados do agente de risco:', formData);
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      handleFecharCadastro();
    } catch (error) {
      console.error('Erro ao salvar agente de risco:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLimparFormulario = () => {
    setFormData({
      risco: '',
      nomeAgente: '',
      fatorRisco: '',
      tipo: '',
      nivelAcao: '',
      limiteToleranciaTipo: 'Valor',
      limiteToleranciaTempo: '',
      unidadeMedida: '',
      tempoHoras: '',
      tempoMinutos: '',
      observacao: '',
      situacao: 'Ativo'
    });
    setErrors({});
  };

  // Funções para ações da tabela
  const handleEditarAgente = (agente: AgenteRisco) => {
    setModoEdicao(true);
    setAgenteEditando(agente.id);
    setFormData({
      risco: agente.risco,
      nomeAgente: agente.agente,
      fatorRisco: agente.fatorRisco,
      tipo: '',
      nivelAcao: '',
      limiteToleranciaTipo: 'Valor',
      limiteToleranciaTempo: '',
      unidadeMedida: '',
      tempoHoras: '',
      tempoMinutos: '',
      observacao: '',
      situacao: agente.situacao
    });
    setShowCadastroModal(true);
    setErrors({});
  };

  const handleExcluirAgente = (agente: AgenteRisco) => {
    setAgenteParaAcao(agente);
    setShowConfirmacaoExclusao(true);
  };

  const handleInativarAgente = (agente: AgenteRisco) => {
    setAgenteParaAcao(agente);
    setShowConfirmacaoInativacao(true);
  };

  const confirmarExclusao = () => {
    if (agenteParaAcao) {
      // TODO: Implementar lógica de exclusão na API
      console.log('Excluindo agente:', agenteParaAcao);
      // Simular exclusão removendo do mock local (em produção seria uma chamada à API)
      setShowConfirmacaoExclusao(false);
      setAgenteParaAcao(null);
    }
  };

  const confirmarInativacao = () => {
    if (agenteParaAcao) {
      // TODO: Implementar lógica de inativação na API
      console.log('Inativando agente:', agenteParaAcao);
      // Simular inativação (em produção seria uma chamada à API)
      setShowConfirmacaoInativacao(false);
      setAgenteParaAcao(null);
    }
  };

  const cancelarAcao = () => {
    setShowConfirmacaoExclusao(false);
    setShowConfirmacaoInativacao(false);
    setAgenteParaAcao(null);
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
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumb e Navegação */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                <button 
                  onClick={() => router.push('/home')}
                  className="hover:text-[#00A298] cursor-pointer"
                >
                  Home
                </button>
                <span>/</span>
                <button 
                  onClick={() => router.push('/home/cadastros')}
                  className="hover:text-[#00A298] cursor-pointer"
                >
                  Cadastros
                </button>
                <span>/</span>
                <button 
                  onClick={() => router.push('/home/cadastros/tabelas-basicas')}
                  className="hover:text-[#00A298] cursor-pointer"
                >
                  Tabelas Básicas
                </button>
                <span>/</span>
                <span className="text-[#00A298] font-medium">Cadastro de Agentes de Risco</span>
              </div>
              
              <h1 className="text-3xl font-bold text-[#1D3C44] mb-2">
                ⚠️ Consulta de Agentes de Risco
              </h1>
              <p className="text-gray-600">
                Cadastro e gerenciamento de agentes de risco ocupacional
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
                      <option value="Agente">Agente</option>
                      <option value="FatorRisco">Fator de Risco</option>
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
                      placeholder="Digite o termo para busca..."
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
                    onClick={handleNovoAgente}
                    className="bg-[#00A298] hover:bg-[#1D3C44] text-white px-5 py-2.5 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    NOVO AGENTE
                  </button>
                </div>
              </div>

              {/* Container de Cadastro de Agente de Risco */}
              {showCadastroModal && (
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-[#1D3C44] mb-4">
                      {modoEdicao ? 'Editar Agente de Risco' : 'Cadastro de Agentes de Risco'}
                    </h3>
                    <hr className="border-gray-300" />
                  </div>
                  
                  {/* Formulário Completo */}
                  <div className="bg-white p-6 rounded-lg border border-gray-200 overflow-hidden">
                    {/* Dados Cadastrais */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-700 mb-4">Dados cadastrais</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Risco <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.risco}
                            onChange={(e) => handleInputChange('risco', e.target.value)}
                            className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                              errors.risco ? 'border-red-500' : 'border-gray-300'
                            }`}
                          >
                            <option value="">Selecione o tipo de risco</option>
                            <option value="Acidente">Acidente</option>
                            <option value="Biológico">Biológico</option>
                            <option value="Ergonômico">Ergonômico</option>
                            <option value="Físico">Físico</option>
                            <option value="Químico">Químico</option>
                            <option value="Outros">Outros</option>
                          </select>
                          {errors.risco && (
                            <p className="mt-1 text-sm text-red-600">{errors.risco}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nome do agente <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.nomeAgente}
                            onChange={(e) => handleInputChange('nomeAgente', e.target.value)}
                            className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                              errors.nomeAgente ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder=""
                          />
                          {errors.nomeAgente && (
                            <p className="mt-1 text-sm text-red-600">{errors.nomeAgente}</p>
                          )}
                        </div>
                      </div>

                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fator de risco <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.fatorRisco}
                          onChange={(e) => handleInputChange('fatorRisco', e.target.value)}
                          className={`w-full px-3 py-2 border rounded focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                            errors.fatorRisco ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Digite parte do tipo, código ou nome para buscar os fatores de risco"
                        />
                        {errors.fatorRisco && (
                          <p className="mt-1 text-sm text-red-600">{errors.fatorRisco}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mt-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo
                          </label>
                          <select
                            value={formData.tipo}
                            onChange={(e) => handleInputChange('tipo', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                          >
                            <option value="">Selecione</option>
                            <option value="Quantitativo">Quantitativo</option>
                            <option value="Qualitativo">Qualitativo</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nível de ação
                          </label>
                          <input
                            type="text"
                            value={formData.nivelAcao}
                            onChange={(e) => handleInputChange('nivelAcao', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                            placeholder="Valor"
                          />
                        </div>

                        <div className="col-span-1 md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Limite de tolerância (Valor / Unidade de Medida / Período)
                          </label>
                          
                          {/* Container principal com layout compacto */}
                          <div className="space-y-3">
                            {/* Primeira linha - Valor e Unidade de Medida */}
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={formData.limiteToleranciaTempo}
                                onChange={(e) => handleInputChange('limiteToleranciaTempo', e.target.value)}
                                className="w-32 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                                placeholder="Valor"
                              />
                              <select
                                value={formData.unidadeMedida}
                                onChange={(e) => handleInputChange('unidadeMedida', e.target.value)}
                                className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              >
                                <option value="">Unidade de Medida ...</option>
                                
                                {/* Unidades de Ruído e Som */}
                                <option value="dB">dB (Decibel)</option>
                                <option value="dB(A)">dB(A) (Decibel A)</option>
                                <option value="dB(C)">dB(C) (Decibel C)</option>
                                <option value="dB(linear)">dB (linear) (Decibel linear)</option>
                                
                                {/* Unidades de Dose */}
                                <option value="dose_anual">dose anual</option>
                                <option value="dose_diaria">dose diária</option>
                                <option value="dose_diaria_ruido">dose diária de ruído</option>
                                <option value="dose_mensal">dose mensal</option>
                                <option value="dose_trimestral">dose trimestral</option>
                                
                                {/* Unidades de Concentração */}
                                <option value="mg/m³">mg/m³ (miligrama por metro cúbico de ar)</option>
                                <option value="μg/m³">μg/m³ (micrograma por metro cúbico)</option>
                                <option value="ng/m³">ng/m³ (nanograma por metro cúbico)</option>
                                <option value="ppm">ppm (partes por milhão)</option>
                                <option value="ppm_vapor">ppm (parte de vapor ou gás por milhão de partes de ar contaminado)</option>
                                <option value="ppb">ppb (partes por bilhão)</option>
                                <option value="f/cm³">f/cm³ (fibra por centímetro cúbico)</option>
                                <option value="f/ml">f/ml (fibra por mililitro)</option>
                                <option value="mppdc">mppdc (milhão de partículas por decímetro cúbico)</option>
                                <option value="ufc/m³">ufc/m³ (unidade formadora de colônias por metro cúbico)</option>
                                <option value="org/m³">org/m³ (organismos por metro cúbico)</option>
                                <option value="esp/m³">esp/m³ (esporos por metro cúbico)</option>
                                
                                {/* Unidades de Temperatura */}
                                <option value="°C">°C (grau Celsius)</option>
                                <option value="°F">°F (grau Fahrenheit)</option>
                                <option value="K">K (Kelvin)</option>
                                
                                {/* Unidades de Velocidade e Aceleração */}
                                <option value="m/s">m/s (metro por segundo)</option>
                                <option value="m/s²">m/s² (metro por segundo ao quadrado)</option>
                                <option value="m/s^1,75">m/s^1,75 (metro por segundo elevado a 1,75)</option>
                                <option value="km/h">km/h (quilômetro por hora)</option>
                                
                                {/* Unidades de Iluminação */}
                                <option value="lux">lux (lx)</option>
                                <option value="cd/m²">cd/m² (candela por metro quadrado)</option>
                                <option value="lm">lm (lumen)</option>
                                
                                {/* Unidades Elétricas */}
                                <option value="A/m">A/m (ampère por metro)</option>
                                <option value="mA">mA (miliampère)</option>
                                <option value="V/m">V/m (volt por metro)</option>
                                <option value="kV/m">kV/m (quilovolt por metro)</option>
                                <option value="μT">μT (microtesla)</option>
                                <option value="mT">mT (militesla)</option>
                                <option value="T">T (tesla)</option>
                                <option value="G">G (gauss)</option>
                                <option value="W/m²">W/m² (watt por metro quadrado)</option>
                                
                                {/* Unidades de Energia e Radiação */}
                                <option value="J/m²">J/m² (joule por metro quadrado)</option>
                                <option value="J/cm²">J/cm² (joule por centímetro quadrado)</option>
                                <option value="mJ/cm²">mJ/cm² (milijoule por centímetro quadrado)</option>
                                <option value="μW/cm²">μW/cm² (microwatt por centímetro quadrado)</option>
                                <option value="mW/cm²">mW/cm² (miliwatt por centímetro quadrado)</option>
                                <option value="mSv">mSv (milisievert)</option>
                                <option value="μSv">μSv (microsievert)</option>
                                <option value="Sv">Sv (sievert)</option>
                                <option value="Gy">Gy (gray)</option>
                                <option value="mGy">mGy (miligray)</option>
                                <option value="μGy">μGy (microgray)</option>
                                <option value="Bq">Bq (becquerel)</option>
                                <option value="kBq">kBq (quilobecquerel)</option>
                                <option value="MBq">MBq (megabecquerel)</option>
                                <option value="Ci">Ci (curie)</option>
                                <option value="mCi">mCi (milicurie)</option>
                                <option value="μCi">μCi (microcurie)</option>
                                
                                {/* Unidades de Pressão */}
                                <option value="Pa">Pa (pascal)</option>
                                <option value="kPa">kPa (quilopascal)</option>
                                <option value="MPa">MPa (megapascal)</option>
                                <option value="mmHg">mmHg (milímetro de mercúrio)</option>
                                <option value="atm">atm (atmosfera)</option>
                                <option value="bar">bar</option>
                                <option value="mbar">mbar (milibar)</option>
                                
                                {/* Unidades de Frequência */}
                                <option value="Hz">Hz (hertz)</option>
                                <option value="kHz">kHz (quilohertz)</option>
                                <option value="MHz">MHz (megahertz)</option>
                                <option value="GHz">GHz (gigahertz)</option>
                                
                                {/* Unidades de Percentual e Adimensionais */}
                                <option value="%">% (percentual)</option>
                                <option value="UR (%)">UR (%) (umidade relativa do ar)</option>
                                <option value="adimensional">adimensional</option>
                                <option value="unidade">unidade</option>
                                <option value="razão">razão</option>
                                <option value="índice">índice</option>
                                <option value="fator">fator</option>
                                
                                {/* Unidades de Força */}
                                <option value="N">N (newton)</option>
                                <option value="kN">kN (quilonewton)</option>
                                <option value="kgf">kgf (quilograma-força)</option>
                                
                                {/* Unidades de Massa */}
                                <option value="g">g (grama)</option>
                                <option value="kg">kg (quilograma)</option>
                                <option value="mg">mg (miligrama)</option>
                                <option value="μg">μg (micrograma)</option>
                                
                                {/* Unidades de Volume */}
                                <option value="m³">m³ (metro cúbico)</option>
                                <option value="dm³">dm³ (decímetro cúbico)</option>
                                <option value="cm³">cm³ (centímetro cúbico)</option>
                                <option value="L">L (litro)</option>
                                <option value="mL">mL (mililitro)</option>
                                
                                {/* Unidades de Comprimento */}
                                <option value="m">m (metro)</option>
                                <option value="cm">cm (centímetro)</option>
                                <option value="mm">mm (milímetro)</option>
                                <option value="μm">μm (micrômetro)</option>
                                <option value="nm">nm (nanômetro)</option>
                                
                                {/* Unidades de Área */}
                                <option value="m²">m² (metro quadrado)</option>
                                <option value="cm²">cm² (centímetro quadrado)</option>
                                <option value="mm²">mm² (milímetro quadrado)</option>
                                
                                {/* Unidades de Tempo Específicas */}
                                <option value="s">s (segundo)</option>
                                <option value="min">min (minuto)</option>
                                <option value="h">h (hora)</option>
                                <option value="dia">dia</option>
                                <option value="semana">semana</option>
                                <option value="mês">mês</option>
                                <option value="ano">ano</option>
                                
                                {/* Unidades Especializadas */}
                                <option value="IBUTG">IBUTG (Índice de Bulbo Úmido e Termômetro de Globo)</option>
                                <option value="NPS">NPS (Nível de Pressão Sonora)</option>
                                <option value="LEQ">LEQ (Nível Equivalente)</option>
                                <option value="LAVG">LAVG (Nível Médio)</option>
                                <option value="SEL">SEL (Nível de Exposição Sonora)</option>
                                <option value="TWA">TWA (Média Ponderada no Tempo)</option>
                                <option value="STEL">STEL (Limite de Exposição de Curta Duração)</option>
                                <option value="C">C (Concentração no Teto)</option>
                                <option value="PEL">PEL (Limite de Exposição Permissível)</option>
                                <option value="TLV">TLV (Valor Limite Threshold)</option>
                                <option value="REL">REL (Limite de Exposição Recomendado)</option>
                                <option value="IDLH">IDLH (Imediatamente Perigoso à Vida e Saúde)</option>
                              </select>
                            </div>

                            {/* Segunda linha - Período de tempo */}
                            <div className="flex items-center justify-end gap-3">
                              <span className="text-gray-600 text-sm font-medium">Período:</span>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={formData.tempoHoras}
                                  onChange={(e) => handleInputChange('tempoHoras', e.target.value)}
                                  className="w-16 px-2 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#00A298] focus:border-transparent text-center text-sm"
                                  placeholder="0"
                                  min="0"
                                />
                                <span className="text-gray-600 text-sm">h</span>
                                <input
                                  type="number"
                                  value={formData.tempoMinutos}
                                  onChange={(e) => handleInputChange('tempoMinutos', e.target.value)}
                                  className="w-16 px-2 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#00A298] focus:border-transparent text-center text-sm"
                                  placeholder="0"
                                  min="0"
                                  max="59"
                                />
                                <span className="text-gray-600 text-sm">min</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Informações Adicionais */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-gray-700 mb-4">Informações adicionais</h4>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Observação
                          </label>
                          <textarea
                            value={formData.observacao}
                            onChange={(e) => handleInputChange('observacao', e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                            placeholder=""
                          />
                        </div>

                        <div className="w-48">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Situação
                          </label>
                          <select
                            value={formData.situacao}
                            onChange={(e) => handleInputChange('situacao', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                          >
                            <option value="Ativo">Ativo</option>
                            <option value="Inativo">Inativo</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    {/* Botões de Ação */}
                    <div className="flex gap-2 pt-4 border-t border-gray-200">
                      <button
                        onClick={handleIncluirAgente}
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm cursor-pointer"
                      >
                        {isSubmitting 
                          ? (modoEdicao ? 'SALVANDO...' : 'INCLUINDO...') 
                          : (modoEdicao ? 'SALVAR' : 'INCLUIR')
                        }
                      </button>
                      <button
                        onClick={handleLimparFormulario}
                        className="px-5 py-2.5 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 text-sm cursor-pointer"
                      >
                        Limpar
                      </button>
                      <button
                        onClick={handleFecharCadastro}
                        className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 text-sm cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tabela de Agentes de Risco - só mostra quando não está cadastrando */}
              {!showCadastroModal && (
                <div className="p-6">
                  <div className="border border-gray-200 rounded-lg">
                    <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                          Agente
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                          Risco
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                          Fator de Risco
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                          Situação
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {agentesRiscoExibidos.length > 0 ? (
                        agentesRiscoExibidos.map((agenteRisco) => (
                          <tr key={agenteRisco.id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-700">{agenteRisco.agente}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {agenteRisco.risco}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-gray-700">{agenteRisco.fatorRisco}</div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                agenteRisco.situacao === 'Ativo' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {agenteRisco.situacao}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex justify-center gap-2">
                                <button 
                                  onClick={() => handleEditarAgente(agenteRisco)}
                                  className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors duration-150 cursor-pointer"
                                >
                                  Editar
                                </button>
                                <span className="text-gray-300">|</span>
                                <button 
                                  onClick={() => handleExcluirAgente(agenteRisco)}
                                  className="text-red-600 hover:text-red-800 font-medium text-sm transition-colors duration-150 cursor-pointer"
                                >
                                  Excluir
                                </button>
                                <span className="text-gray-300">|</span>
                                <button 
                                  onClick={() => handleInativarAgente(agenteRisco)}
                                  className={`font-medium text-sm transition-colors duration-150 cursor-pointer ${
                                    agenteRisco.situacao === 'Ativo' 
                                      ? 'text-orange-600 hover:text-orange-800' 
                                      : 'text-green-600 hover:text-green-800'
                                  }`}
                                >
                                  {agenteRisco.situacao === 'Ativo' ? 'Inativar' : 'Ativar'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center">
                            <div className="text-gray-500">
                              <div className="mb-2">Não existem dados para mostrar</div>
                              <div className="text-sm">Ajuste os filtros ou cadastre um novo agente de risco</div>
                            </div>
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
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showConfirmacaoExclusao && agenteParaAcao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
                Tem certeza que deseja excluir o agente de risco <strong>"{agenteParaAcao.agente}"</strong>?
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
      {showConfirmacaoInativacao && agenteParaAcao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                agenteParaAcao.situacao === 'Ativo' ? 'bg-orange-100' : 'bg-green-100'
              }`}>
                <svg className={`w-6 h-6 ${
                  agenteParaAcao.situacao === 'Ativo' ? 'text-orange-600' : 'text-green-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Confirmar {agenteParaAcao.situacao === 'Ativo' ? 'Inativação' : 'Ativação'}
                </h3>
                <p className="text-sm text-gray-500">
                  {agenteParaAcao.situacao === 'Ativo' 
                    ? 'O agente ficará indisponível para uso.' 
                    : 'O agente ficará disponível para uso novamente.'
                  }
                </p>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-gray-700">
                Tem certeza que deseja {agenteParaAcao.situacao === 'Ativo' ? 'inativar' : 'ativar'} o agente de risco <strong>"{agenteParaAcao.agente}"</strong>?
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
                  agenteParaAcao.situacao === 'Ativo' 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {agenteParaAcao.situacao === 'Ativo' ? 'Inativar' : 'Ativar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 