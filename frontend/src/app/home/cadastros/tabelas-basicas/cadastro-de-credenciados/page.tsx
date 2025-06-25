'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Tipos para os dados
interface Credenciado {
  id: string;
  nome: string;
  cnpj: string;
  cidade: string;
  estado: string;
  situacao: 'Ativo' | 'Inativo';
}

// Mock de dados para demonstração - poucos dados para começar os cadastros
const mockCredenciados: Credenciado[] = [
  {
    id: '1',
    nome: 'Medicina Medicina do Trabalho',
    cnpj: '21726329000104',
    cidade: 'Ribeirão Preto',
    estado: 'SP'
  },
  {
    id: '2',
    nome: 'FF Segurança e Medicina do Trabalho - MASTERPLAN LTDA',
    cnpj: '10366026000101',
    cidade: 'Porto Alegre',
    estado: 'RS'
  },
  {
    id: '3',
    nome: 'Medicina Medicina do Trabalho',
    cnpj: '21726329000104',
    cidade: 'Ribeirão Preto',
    estado: 'SP'
  },
  
].map(item => ({ ...item, situacao: 'Ativo' as const }));

export default function CadastroCredenciados() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Estados para filtros e busca
  const [pesquisarPor, setPesquisarPor] = useState('Nome');
  const [termoBusca, setTermoBusca] = useState('');
  const [situacao, setSituacao] = useState('Ativo');
  const [credenciadosFiltrados, setCredenciadosFiltrados] = useState<Credenciado[]>([]);
  
  // Estados para paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  // Estados para formulário de cadastro
  const [showCadastroModal, setShowCadastroModal] = useState(false);
  const [activeTab, setActiveTab] = useState('dados-gerais');
  
  // Estados dos campos do formulário
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    cnpj: '',
    email: '',
    site: '',
    cep: '',
    tipoLogradouro: '',
    logradouro: '',
    numero: '',
    complemento: '',
    uf: '',
    cidade: '',
    bairro: '',
    horario: '',
    observacoesExames: '',
    observacoesGerais: '',
    utilizarPercentual: false,
    situacaoCredenciado: 'Ativo'
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

  // Efeito para filtrar credenciados
  useEffect(() => {
    let resultados = mockCredenciados.filter(credenciado => {
      const matchSituacao = credenciado.situacao === situacao;
      const matchBusca = termoBusca === '' || 
        credenciado.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
        credenciado.cnpj.includes(termoBusca) ||
        credenciado.cidade.toLowerCase().includes(termoBusca.toLowerCase()) ||
        credenciado.estado.toLowerCase().includes(termoBusca.toLowerCase());
      
      return matchSituacao && matchBusca;
    });

    setCredenciadosFiltrados(resultados);
    setPaginaAtual(1); // Reset para primeira página quando filtrar
  }, [termoBusca, situacao]);

  // Inicializar com todos os dados
  useEffect(() => {
    setCredenciadosFiltrados(mockCredenciados);
  }, []);

  // Calcular dados da paginação
  const totalItens = credenciadosFiltrados.length;
  const totalPaginas = Math.ceil(totalItens / itensPorPagina);
  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const indiceFim = indiceInicio + itensPorPagina;
  const credenciadosExibidos = credenciadosFiltrados.slice(indiceInicio, indiceFim);

  const formatarCNPJ = (cnpj: string) => {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const handleProcurar = () => {
    // A busca já é feita automaticamente via useEffect
    // Este método pode ser usado para ações adicionais se necessário
  };

  const handleNovoCredenciado = () => {
    setShowCadastroModal(true);
    setActiveTab('dados-gerais');
    setFormData({
      nome: '',
      telefone: '',
      cnpj: '',
      email: '',
      site: '',
      cep: '',
      tipoLogradouro: '',
      logradouro: '',
      numero: '',
      complemento: '',
      uf: '',
      cidade: '',
      bairro: '',
      horario: '',
      observacoesExames: '',
      observacoesGerais: '',
      utilizarPercentual: false,
      situacaoCredenciado: 'Ativo'
    });
    setErrors({});
  };

  const handleFecharCadastro = () => {
    setShowCadastroModal(false);
    setFormData({
      nome: '',
      telefone: '',
      cnpj: '',
      email: '',
      site: '',
      cep: '',
      tipoLogradouro: '',
      logradouro: '',
      numero: '',
      complemento: '',
      uf: '',
      cidade: '',
      bairro: '',
      horario: '',
      observacoesExames: '',
      observacoesGerais: '',
      utilizarPercentual: false,
      situacaoCredenciado: 'Ativo'
    });
    setErrors({});
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [field]: checked }));
  };

  const handleSalvarCredenciado = async () => {
    // Validar campos obrigatórios
    const newErrors: Record<string, string> = {};
    
    // Validar telefone
    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    }
    
    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail deve ter um formato válido';
    }
    
    // Validar campos de endereço obrigatórios
    if (!formData.cep.trim()) {
      newErrors.cep = 'CEP é obrigatório';
    }
    if (!formData.logradouro.trim()) {
      newErrors.logradouro = 'Logradouro é obrigatório';
    }
    if (!formData.numero.trim()) {
      newErrors.numero = 'Número é obrigatório';
    }
    if (!formData.cidade.trim()) {
      newErrors.cidade = 'Cidade é obrigatória';
    }
    if (!formData.uf.trim()) {
      newErrors.uf = 'UF é obrigatória';
    }
    if (!formData.bairro.trim()) {
      newErrors.bairro = 'Bairro é obrigatório';
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
      console.log('Dados do credenciado:', formData);
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      handleFecharCadastro();
    } catch (error) {
      console.error('Erro ao salvar credenciado:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLimparFormulario = () => {
    setFormData({
      nome: '',
      telefone: '',
      cnpj: '',
      email: '',
      site: '',
      cep: '',
      tipoLogradouro: '',
      logradouro: '',
      numero: '',
      complemento: '',
      uf: '',
      cidade: '',
      bairro: '',
      horario: '',
      observacoesExames: '',
      observacoesGerais: '',
      utilizarPercentual: false,
      situacaoCredenciado: 'Ativo'
    });
    setErrors({});
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
                <span className="text-[#00A298] font-medium">Cadastro de Credenciados</span>
              </div>
              
              <h1 className="text-3xl font-bold text-[#1D3C44] mb-2">
                Credenciados
              </h1>
              <p className="text-gray-600">
                Cadastro e gerenciamento de profissionais e instituições credenciadas
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
                      <option value="CNPJ">CNPJ</option>
                      <option value="Cidade">Cidade</option>
                      <option value="Estado">Estado</option>
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
                    </select>
                  </div>

                  <button
                    onClick={handleProcurar}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer ml-2"
                  >
                    PROCURAR
                  </button>
                  
                  <button
                    onClick={handleNovoCredenciado}
                    className="bg-[#00A298] hover:bg-[#1D3C44] text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    NOVO CREDENCIADO
                  </button>
                </div>
              </div>

              {/* Container de Cadastro de Credenciado */}
              {showCadastroModal && (
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-[#1D3C44]">Novo Credenciado</h3>
                    <div className="text-sm text-gray-500">
                      <span className="text-red-500">*</span> Campos obrigatórios
                    </div>
                  </div>
                  
                  {/* Conteúdo do formulário */}
                  <div className="space-y-8">
                    {/* Informações Básicas */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-700 mb-6 border-b border-gray-200 pb-3">Informações Básicas</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nome do Credenciado <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.nome}
                            onChange={(e) => handleInputChange('nome', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all duration-200 ${
                              errors.nome ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="Digite o nome completo"
                          />
                          {errors.nome && (
                            <p className="text-red-500 text-xs mt-1">{errors.nome}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CNPJ <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.cnpj}
                            onChange={(e) => handleInputChange('cnpj', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all duration-200 ${
                              errors.cnpj ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="00.000.000/0000-00"
                          />
                          {errors.cnpj && (
                            <p className="text-red-500 text-xs mt-1">{errors.cnpj}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Telefone <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.telefone}
                            onChange={(e) => handleInputChange('telefone', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all duration-200 ${
                              errors.telefone ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="(00) 00000-0000"
                          />
                          {errors.telefone && (
                            <p className="mt-1 text-sm text-red-600">{errors.telefone}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            E-mail <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all duration-200 ${
                              errors.email ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="contato@exemplo.com"
                          />
                          {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Website
                          </label>
                          <input
                            type="url"
                            value={formData.site}
                            onChange={(e) => handleInputChange('site', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all duration-200"
                            placeholder="https://www.exemplo.com"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Endereço */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-700 mb-6 border-b border-gray-200 pb-3">Endereço</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CEP <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.cep}
                            onChange={(e) => handleInputChange('cep', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all duration-200 ${
                              errors.cep ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="00000-000"
                          />
                          {errors.cep && (
                            <p className="mt-1 text-sm text-red-600">{errors.cep}</p>
                          )}
                        </div>

                        <div className="lg:col-span-3">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Logradouro <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.logradouro}
                            onChange={(e) => handleInputChange('logradouro', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all duration-200 ${
                              errors.logradouro ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Nome da rua, avenida, etc."
                          />
                          {errors.logradouro && (
                            <p className="mt-1 text-sm text-red-600">{errors.logradouro}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Número <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.numero}
                            onChange={(e) => handleInputChange('numero', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all duration-200 ${
                              errors.numero ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="123"
                          />
                          {errors.numero && (
                            <p className="mt-1 text-sm text-red-600">{errors.numero}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Complemento
                          </label>
                          <input
                            type="text"
                            value={formData.complemento}
                            onChange={(e) => handleInputChange('complemento', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all duration-200"
                            placeholder="Sala, andar, etc."
                          />
                        </div>

                        <div className="lg:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cidade <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.cidade}
                            onChange={(e) => handleInputChange('cidade', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all duration-200 ${
                              errors.cidade ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Nome da cidade"
                          />
                          {errors.cidade && (
                            <p className="mt-1 text-sm text-red-600">{errors.cidade}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            UF <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.uf}
                            onChange={(e) => handleInputChange('uf', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all duration-200 ${
                              errors.uf ? 'border-red-500' : 'border-gray-300'
                            }`}
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
                          {errors.uf && (
                            <p className="mt-1 text-sm text-red-600">{errors.uf}</p>
                          )}
                        </div>

                        <div className="lg:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bairro <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.bairro}
                            onChange={(e) => handleInputChange('bairro', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all duration-200 ${
                              errors.bairro ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Nome do bairro"
                          />
                          {errors.bairro && (
                            <p className="mt-1 text-sm text-red-600">{errors.bairro}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Informações Complementares */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-700 mb-6 border-b border-gray-200 pb-3">Informações Complementares</h4>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Horário de Funcionamento
                            </label>
                            <input
                              type="text"
                              value={formData.horario}
                              onChange={(e) => handleInputChange('horario', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all duration-200"
                              placeholder="Ex: Segunda a Sexta, 8h às 18h"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Situação
                            </label>
                            <select
                              value={formData.situacaoCredenciado}
                              onChange={(e) => handleInputChange('situacaoCredenciado', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all duration-200"
                            >
                              <option value="Ativo">Ativo</option>
                              <option value="Inativo">Inativo</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Observações para Requisição de Exames
                          </label>
                          <textarea
                            rows={3}
                            value={formData.observacoesExames}
                            onChange={(e) => handleInputChange('observacoesExames', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all duration-200"
                            placeholder="Informações importantes para requisição de exames..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Observações Gerais
                          </label>
                          <textarea
                            rows={3}
                            value={formData.observacoesGerais}
                            onChange={(e) => handleInputChange('observacoesGerais', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all duration-200"
                            placeholder="Outras informações relevantes..."
                          />
                        </div>

                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              type="checkbox"
                              id="utilizarPercentual"
                              checked={formData.utilizarPercentual}
                              onChange={(e) => handleCheckboxChange('utilizarPercentual', e.target.checked)}
                              className="h-4 w-4 text-[#00A298] focus:ring-[#00A298] border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="utilizarPercentual" className="font-medium text-gray-700">
                              Aplicar percentual de aumento da empresa
                            </label>
                            <p className="text-gray-500">
                              Utilizar o percentual de aumento da empresa sobre o valor do credenciado para calcular o valor de cobrança do cliente
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Botões de Ação */}
                  <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                    <button
                      onClick={handleFecharCadastro}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 text-sm cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleLimparFormulario}
                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all duration-200 text-sm cursor-pointer"
                    >
                      Limpar
                    </button>
                    <button
                      onClick={handleSalvarCredenciado}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-[#00A298] hover:bg-[#1D3C44] text-white rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm cursor-pointer"
                    >
                      {isSubmitting ? 'Salvando...' : 'Salvar'}
                    </button>
                  </div>
                </div>
              )}

              {/* Tabela de Credenciados */}
              <div className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                          Nome do Credenciado
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                          CNPJ
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                          Localização
                        </th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {credenciadosExibidos.length > 0 ? (
                        credenciadosExibidos.map((credenciado) => (
                          <tr key={credenciado.id} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-700">{credenciado.nome}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-gray-700 font-mono text-sm">
                                {formatarCNPJ(credenciado.cnpj)}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-gray-700">
                                {credenciado.cidade}, {credenciado.estado}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex justify-center gap-2">
                                <button className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors duration-150 cursor-pointer">
                                  Editar
                                </button>
                                <span className="text-gray-300">|</span>
                                <button className="text-red-600 hover:text-red-800 font-medium text-sm transition-colors duration-150 cursor-pointer">
                                  Inativar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center">
                            <div className="text-gray-500">
                              <div className="mb-2">Nenhum credenciado encontrado</div>
                              <div className="text-sm">Ajuste os filtros ou cadastre um novo credenciado</div>
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
                          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                        >
                          Anterior
                        </button>
                        <button
                          onClick={() => setPaginaAtual(Math.min(totalPaginas, paginaAtual + 1))}
                          disabled={paginaAtual === totalPaginas}
                          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                              >
                                ←
                              </button>

                              {/* Páginas */}
                              {gerarPaginacao().map((pagina) => (
                                <button
                                  key={pagina}
                                  onClick={() => setPaginaAtual(pagina)}
                                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium cursor-pointer ${
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
                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
    </div>
  );
} 