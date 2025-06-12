'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  formatCPF, 
  formatCNPJ, 
  formatTelefone, 
  formatCEP, 
  formatNumeros, 
  formatTexto,
  isValidCPF,
  isValidCNPJ,
  isValidTelefone,
  isValidCEP 
} from '@/utils/masks';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
}

export default function EmpresasPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewCompanyModal, setShowNewCompanyModal] = useState(false);
  const [activeTab, setActiveTab] = useState('dados-empresa');
  const [tipoEstabelecimento, setTipoEstabelecimento] = useState('matriz');
  const [classificacaoPorte, setClassificacaoPorte] = useState('ME');
  const [searchType, setSearchType] = useState('nome');
  
  // Estados para CEP e endereço
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState({
    logradouro: '',
    tipoLogradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: ''
  });
  const [loadingCep, setLoadingCep] = useState(false);
  
  // Estados para contato
  const [contato, setContato] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  
  // Estados para observações
  const [observacao, setObservacao] = useState('');
  const [observacaoOS, setObservacaoOS] = useState('');
  
  // Estados para campos com máscara
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [numeroInscricao, setNumeroInscricao] = useState('');
  const [cpfRepresentante, setCpfRepresentante] = useState('');
  const [nomeRepresentante, setNomeRepresentante] = useState('');
  const [cno, setCno] = useState('');
  
  // Estados para mensagens de erro
  const [cepError, setCepError] = useState('');

  // Função para obter o placeholder baseado no tipo de pesquisa
  const getPlaceholder = (type: string) => {
    switch (type) {
      case 'nome':
        return 'Digite o nome fantasia...';
      case 'n de inscrição':
        return 'Digite o n° de inscrição...';
      case 'razao':
        return 'Digite a razão social...';
      case 'codigo':
        return 'Digite o código...';
        case 'regiao':
          return 'Digite a região...';
      default:
        return 'Digite para buscar...';
    }
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
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Super Administrador';
      case 'ADMIN':
        return 'Administrador';
      case 'USER':
        return 'Usuário';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800';
      case 'USER':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Função para buscar CEP
  const buscarCep = async (cepValue: string) => {
    const cepLimpo = cepValue.replace(/\D/g, '');
    
    if (cepLimpo.length === 8) {
      setLoadingCep(true);
      setCepError(''); // Limpa erro anterior
      
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setEndereco({
            ...endereco,
            logradouro: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
            uf: data.uf || '',
            tipoLogradouro: data.logradouro ? data.logradouro.split(' ')[0] : ''
          });
          setCepError(''); // Limpa erro se sucesso
        } else {
          setCepError('CEP não encontrado. Verifique o número digitado.');
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        setCepError('Erro ao buscar CEP. Verifique sua conexão e tente novamente.');
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCep = formatCEP(e.target.value);
    setCep(formattedCep);
    
    // Limpa erro quando usuário está digitando
    if (cepError) {
      setCepError('');
    }
    
    const numbers = e.target.value.replace(/\D/g, '');
    if (numbers.length === 8) {
      buscarCep(numbers);
    }
  };

  // Função para lidar com mudanças em campos específicos
  const handleNumeroInscricaoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const tipoInscricao = (document.querySelector('select[name="tipoInscricao"]') as HTMLSelectElement)?.value;
    
    if (tipoInscricao === 'cnpj') {
      const formatted = formatCNPJ(value);
      setNumeroInscricao(formatted);
    } else if (tipoInscricao === 'cpf') {
      const formatted = formatCPF(value);
      setNumeroInscricao(formatted);
    } else {
      setNumeroInscricao(value);
    }
  };

  const handleCpfRepresentanteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setCpfRepresentante(formatted);
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTelefone(e.target.value);
    setTelefone(formatted);
  };

  const handleNomeRepresentanteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTexto(e.target.value);
    setNomeRepresentante(formatted);
  };

  const handleCnoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumeros(e.target.value, 14);
    setCno(formatted);
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
      {/* Header Superior */}
      <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="flex justify-between items-center h-16 px-4">
          {/* Espaço vazio para balanceamento */}
          <div className="w-1/3">
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
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb e Navegação */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                <button 
                  onClick={() => router.push('/home/cadastros')}
                  className="hover:text-[#00A298] cursor-pointer"
                >
                  Cadastros
                </button>
                <span>/</span>
                <button 
                  onClick={() => router.push('/home/cadastros/estrutura-organizacional')}
                  className="hover:text-[#00A298] cursor-pointer"
                >
                  Estrutura Organizacional
                </button>
                <span>/</span>
                <span className="text-[#00A298] font-medium">Empresas</span>
              </div>
              
              <h1 className="text-3xl font-bold text-[#1D3C44] mb-2">
                🏢 Cadastro de Empresas
              </h1>
              <p className="text-gray-600">
                Gerencie as empresas da sua organização
              </p>
            </div>

            {/* Navegação entre seções */}
            <div className="mb-6">
              <div className="flex space-x-4">
                <button
                  onClick={() => router.push('/home/cadastros/estrutura-organizacional/grupos')}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer"
                >
                  👥 Grupos
                </button>
                <button
                  onClick={() => router.push('/home/cadastros/estrutura-organizacional/regioes')}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer"
                >
                  🗺️ Regiões
                </button>
                <button
                  onClick={() => router.push('/home/cadastros/estrutura-organizacional/empresas')}
                  className="bg-[#00A298] text-white px-4 py-2 rounded-lg font-medium"
                >
                  🏢 Empresas
                </button>
              </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="bg-white rounded-2xl shadow-xl">
              {/* Formulário de busca */}
              <div className="p-8 border-b border-gray-200">
                <div className="flex flex-wrap gap-6 items-end w-full">
                  {/* Barra de pesquisa */}
                  <div className="flex-1 min-w-96">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pesquisar por
                    </label>
                    <div className="flex gap-2">
                      <select 
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                        className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                      >
                        <option value="nome">Nome Fantasia</option>
                        <option value="n de inscrição">N° de Inscrição</option>
                        <option value="razao">Razão Social</option>
                        <option value="codigo">Código</option>
                        <option value="regiao">Região</option>
                      </select>
                      <input
                        type="text"
                        placeholder={getPlaceholder(searchType)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Filtros */}
                  <div className="min-w-fit">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grupo
                    </label>
                    <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent">
                      <option value="">Todos os grupos</option>
                      <option value="grupo-teste">Grupo Teste</option>
                    </select>
                  </div>

                  <div className="min-w-fit">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Região
                    </label>
                    <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent">
                      <option value="">Todas as regiões</option>
                      <option value="regiao-teste">Região Teste</option>
                    </select>
                  </div>

                  <div className="min-w-fit">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Situação
                    </label>
                    <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent">
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                      <option value="todos">Todos</option>
                    </select>
                  </div>

                  {/* Botões */}
                  <div className="flex gap-2 min-w-fit">
                    <button 
                      onClick={() => window.location.reload()}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                    >
                      PROCURAR
                    </button>
                    
                    <button 
                      onClick={() => setShowNewCompanyModal(true)}
                      className="bg-[#00A298] hover:bg-[#1D3C44] text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                    >
                      NOVA EMPRESA
                    </button>
                  </div>
                </div>
              </div>

              {/* Container de Novo Cadastro */}
              {showNewCompanyModal && (
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-[#1D3C44] mb-4">Cadastro de Empresas</h3>
                  
                  {/* Abas */}
                  <div className="border-b border-gray-200 mb-6">
                    <nav className="flex space-x-8">
                      <button
                        onClick={() => setActiveTab('dados-empresa')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                          activeTab === 'dados-empresa'
                            ? 'border-[#00A298] text-[#00A298]'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Dados da Empresa
                      </button>
                      <button
                        onClick={() => setActiveTab('esocial')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                          activeTab === 'esocial'
                            ? 'border-[#00A298] text-[#00A298]'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        eSocial
                      </button>
                    </nav>
                  </div>

                  {/* Conteúdo da aba Dados da Empresa */}
                  {activeTab === 'dados-empresa' && (
                    <div className="bg-white rounded-lg p-6 shadow-sm space-y-6">
                      {/* Seção Estabelecimento */}
                      <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                        <div className="flex items-center mb-6">
                          <div className="bg-[#00A298] text-white p-2 rounded-lg mr-3">
                            🏢
                          </div>
                          <h4 className="text-lg font-semibold text-[#1D3C44]">Estabelecimento</h4>
                        </div>
                        
                                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                           <div className="space-y-2">
                             <label className="block text-sm font-medium text-gray-700">
                               Tipo
                             </label>
                             <div className="flex gap-3">
                               <label className="flex items-center cursor-pointer">
                                 <input
                                   type="radio"
                                   name="tipo"
                                   value="matriz"
                                   checked={tipoEstabelecimento === 'matriz'}
                                   onChange={(e) => setTipoEstabelecimento(e.target.value)}
                                   className="mr-2 text-[#00A298] focus:ring-[#00A298]"
                                 />
                                 <span className="text-sm font-medium">Matriz</span>
                               </label>
                               <label className="flex items-center cursor-pointer">
                                 <input
                                   type="radio"
                                   name="tipo"
                                   value="filial"
                                   checked={tipoEstabelecimento === 'filial'}
                                   onChange={(e) => setTipoEstabelecimento(e.target.value)}
                                   className="mr-2 text-[#00A298] focus:ring-[#00A298]"
                                 />
                                 <span className="text-sm font-medium">Filial</span>
                               </label>
                             </div>
                           </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Tipo de Inscrição 
                              <span className="text-blue-500 text-xs ml-1">(Opcional)</span>
                            </label>
                            <select 
                              name="tipoInscricao"
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all"
                            >
                              <option value="">Selecione...</option>
                              <option value="cnpj">CNPJ</option>
                              <option value="cpf">CPF</option>
                            </select>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Número de Inscrição 
                              <span className="text-blue-500 text-xs ml-1">(Opcional)</span>
                            </label>
                            <input
                              type="text"
                              value={numeroInscricao}
                              onChange={handleNumeroInscricaoChange}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all"
                              placeholder="Digite o número"
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              CNO
                            </label>
                            <input
                              type="text"
                              value={cno}
                              onChange={handleCnoChange}
                              maxLength={14}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all"
                              placeholder="Digite o CNO (máx. 14 dígitos)"
                            />
                          </div>
                        </div>
                      </div>

                                             {/* Seção Dados cadastrais */}
                       <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                         <div className="flex items-center mb-6">
                           <div className="bg-[#00A298] text-white p-2 rounded-lg mr-3">
                             📊
                           </div>
                           <h4 className="text-lg font-semibold text-[#1D3C44]">Dados cadastrais</h4>
                         </div>
                         
                                                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                           <div className="space-y-2">
                             <label className="block text-sm font-medium text-gray-700">
                               Código
                             </label>
                             <input
                               type="text"
                               value="AUTOMÁTICO"
                               disabled
                               className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                             />
                           </div>

                           <div className="space-y-2">
                             <label className="block text-sm font-medium text-gray-700">
                               Grupo / Região
                             </label>
                             <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all">
                               <option value="">Selecione um grupo/região</option>
                               <option value="grupo-regiao-1">Grupo 1 / Região A</option>
                               <option value="grupo-regiao-2">Grupo 2 / Região B</option>
                             </select>
                           </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Razão Social
                            </label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="Digite a razão social"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nome Fantasia
                            </label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="Digite o nome fantasia"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Inscrição Estadual
                            </label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="Digite a inscrição estadual"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Inscrição Municipal
                            </label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="Digite a inscrição municipal"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              CNAE e Descrição
                            </label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="Digite o CNAE e descrição"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Risco
                            </label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="Digite o risco"
                            />
                          </div>

                                                     <div className="space-y-2">
                             <label className="block text-sm font-medium text-gray-700">
                               Classificação Porte
                             </label>
                             <div className="flex gap-4">
                               <label className="flex items-center cursor-pointer">
                                 <input
                                   type="radio"
                                   name="classificacao"
                                   value="ME"
                                   checked={classificacaoPorte === 'ME'}
                                   onChange={(e) => setClassificacaoPorte(e.target.value)}
                                   className="mr-2 text-[#00A298] focus:ring-[#00A298]"
                                 />
                                 <span className="text-sm font-medium">ME</span>
                               </label>
                               <label className="flex items-center cursor-pointer">
                                 <input
                                   type="radio"
                                   name="classificacao"
                                   value="EPP"
                                   checked={classificacaoPorte === 'EPP'}
                                   onChange={(e) => setClassificacaoPorte(e.target.value)}
                                   className="mr-2 text-[#00A298] focus:ring-[#00A298]"
                                 />
                                 <span className="text-sm font-medium">EPP</span>
                               </label>
                             </div>
                           </div>
                        </div>
                      </div>

                      {/* Seção Representante legal */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-4 bg-gray-100 px-3 py-2 rounded">Representante legal</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nome do representante legal
                            </label>
                            <input
                              type="text"
                              value={nomeRepresentante}
                              onChange={handleNomeRepresentanteChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="Digite o nome do representante (apenas letras)"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              CPF
                            </label>
                            <input
                              type="text"
                              value={cpfRepresentante}
                              onChange={handleCpfRepresentanteChange}
                              maxLength={14}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="000.000.000-00"
                            />
                            {cpfRepresentante && !isValidCPF(cpfRepresentante) && (
                              <p className="text-red-500 text-xs mt-1">CPF inválido</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Assinatura digital
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
                        </div>
                      </div>

                      {/* Seção Informações de contato */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-4 bg-gray-100 px-3 py-2 rounded">Informações de contato</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              CEP
                            </label>
                            <input
                              type="text"
                              value={cep}
                              onChange={handleCepChange}
                              maxLength={9}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                                cepError ? 'border-red-300' : 'border-gray-300'
                              }`}
                              placeholder="00000-000"
                            />
                            {loadingCep && <p className="text-xs text-blue-500 mt-1">Buscando CEP...</p>}
                            {cepError && <p className="text-xs text-red-500 mt-1">{cepError}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Tipo de logradouro
                            </label>
                            <select 
                              value={endereco.tipoLogradouro}
                              onChange={(e) => setEndereco({...endereco, tipoLogradouro: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                            >
                              <option value="">Selecione...</option>
                              <option value="Rua">Rua</option>
                              <option value="Avenida">Avenida</option>
                              <option value="Travessa">Travessa</option>
                              <option value="Alameda">Alameda</option>
                              <option value="Praça">Praça</option>
                              <option value="Estrada">Estrada</option>
                            </select>
                          </div>

                          <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Logradouro
                            </label>
                            <input
                              type="text"
                              value={endereco.logradouro}
                              onChange={(e) => setEndereco({...endereco, logradouro: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="Nome da rua"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Número
                            </label>
                            <input
                              type="text"
                              value={endereco.numero}
                              onChange={(e) => setEndereco({...endereco, numero: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="Número"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Complemento
                            </label>
                            <input
                              type="text"
                              value={endereco.complemento}
                              onChange={(e) => setEndereco({...endereco, complemento: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="Apartamento, sala, etc."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              UF
                            </label>
                            <select 
                              value={endereco.uf}
                              onChange={(e) => setEndereco({...endereco, uf: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
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
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Cidade
                            </label>
                            <input
                              type="text"
                              value={endereco.cidade}
                              onChange={(e) => setEndereco({...endereco, cidade: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="Nome da cidade"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Bairro
                            </label>
                            <input
                              type="text"
                              value={endereco.bairro}
                              onChange={(e) => setEndereco({...endereco, bairro: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="Nome do bairro"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Contato
                            </label>
                            <input
                              type="text"
                              value={contato}
                              onChange={(e) => setContato(formatTexto(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="Nome do contato (apenas letras)"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Telefone
                            </label>
                            <input
                              type="tel"
                              value={telefone}
                              onChange={handleTelefoneChange}
                              maxLength={15}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="(00) 00000-0000"
                            />
                            {telefone && !isValidTelefone(telefone) && (
                              <p className="text-red-500 text-xs mt-1">Telefone inválido (10 ou 11 dígitos)</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              E-mail
                            </label>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="email@exemplo.com"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Seção Alertas da Empresa */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-4 bg-gray-100 px-3 py-2 rounded">Alertas da Empresa</h4>
                        <div className="text-center py-4 text-gray-500 text-sm">
                          Nenhum alerta configurado
                        </div>
                      </div>

                      {/* Seção Informações adicionais */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-4 bg-gray-100 px-3 py-2 rounded">Informações adicionais</h4>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Observação
                            </label>
                            <textarea
                              rows={3}
                              value={observacao}
                              onChange={(e) => setObservacao(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="Digite observações gerais sobre a empresa..."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Observação para Ordem de Serviço
                            </label>
                            <textarea
                              rows={3}
                              value={observacaoOS}
                              onChange={(e) => setObservacaoOS(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="Digite observações específicas para ordens de serviço..."
                            />
                          </div>
                        </div>
                      </div>

                      {/* Botões de ação */}
                      <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer">
                          INCLUIR
                        </button>
                        <button className="bg-blue-400 hover:bg-blue-500 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer">
                          LIMPAR
                        </button>
                        <button
                          onClick={() => setShowNewCompanyModal(false)}
                          className="bg-gray-400 hover:bg-gray-500 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                        >
                          RETORNAR
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Conteúdo da aba eSocial */}
                  {activeTab === 'esocial' && (
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <div className="text-center py-8 text-gray-500">
                        <p>Conteúdo da aba eSocial será implementado aqui.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tabela de resultados - apenas quando não estiver no modo de cadastro */}
              {!showNewCompanyModal && (
                <div className="p-6">
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">CNPJ</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Razão Social</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nome Fantasia</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Código</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Grupo</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Região</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Situação</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                            Não existem dados para mostrar
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 