'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
}

interface MenuItem {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState('cadastros');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<{[key: string]: boolean}>({
    cadastros: true
  });
  const [activeTab, setActiveTab] = useState('grupos');
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showNewRegionModal, setShowNewRegionModal] = useState(false);
  const [showNewCompanyModal, setShowNewCompanyModal] = useState(false);
  const [searchData, setSearchData] = useState<any[]>([]);
  const [searchText, setSearchText] = useState('');
  const [searchBy, setSearchBy] = useState('nome');
  const [searchStatus, setSearchStatus] = useState('ativo');

  // Menu items baseados na imagem fornecida
  const menuItems: MenuItem[] = [
    {
      id: 'cadastros',
      name: 'Cadastros',
      icon: '👥',
      description: 'Gestão de pessoas e dados'
    },
    {
      id: 'funcionarios',
      name: 'Funcionários',
      icon: '👤',
      description: 'Informações dos colaboradores'
    },
    {
      id: 'empresa',
      name: 'Empresa',
      icon: '🏢',
      description: 'Dados empresariais'
    },
    {
      id: 'faturamento',
      name: 'Faturamento',
      icon: '💰',
      description: 'Gestão financeira'
    },
    {
      id: 'relatorios',
      name: 'Relatórios',
      icon: '📊',
      description: 'Análises e dados'
    },
    {
      id: 'indicadores',
      name: 'Indicadores',
      icon: '📈',
      description: 'Métricas e KPIs'
    },
    {
      id: 'sst',
      name: 'SST',
      icon: '🛡️',
      description: 'Segurança e Saúde do Trabalho'
    },
    {
      id: 'esocial',
      name: 'eSocial',
      icon: '🔄',
      description: 'Integração eSocial'
    }
  ];

  // Subitens do menu Cadastros
  const cadastroSubItems = [
    {
      id: 'estrutura-organizacional',
      name: 'Estrutura Organizacional',
      icon: '🏗️',
      description: 'Cadastro de Grupos, Regiões e Empresas'
    },
    {
      id: 'tabelas-basicas',
      name: 'Tabelas Básicas',
      icon: '📋',
      description: 'Cadastros fundamentais do sistema'
    }
  ];

  // Subitens das Tabelas Básicas
  const tabelasBasicasItems = [
    { id: 'profissionais', name: 'Cadastro de Profissionais', icon: '👨‍⚕️' },
    { id: 'credenciados', name: 'Cadastro de Credenciados', icon: '🏥' },
    { id: 'servicos', name: 'Cadastro de Serviços', icon: '🔧' },
    { id: 'agentes-risco', name: 'Cadastro de Agentes de Risco', icon: '⚠️' },
    { id: 'tipos-afastamento', name: 'Tipos de Afastamento', icon: '🏠' },
    { id: 'especialidades', name: 'Cadastro de Especialidades', icon: '🎯' },
    { id: 'procedimentos', name: 'Cadastro de Procedimentos', icon: '📝' },
    { id: 'queixas', name: 'Cadastro de Queixas', icon: '💬' },
    { id: 'documentos', name: 'Cadastro de Documentos', icon: '📄' }
  ];

  useEffect(() => {
    // Verificar se há token salvo
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

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setShowLogoutModal(false);
    router.push('/login');
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  const toggleMenuExpansion = (menuId: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#00A298]/10 to-[#1D3C44]/10 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00A298]">      </div>
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
            <div className="text-xl font-bold text-[#00A298]">PLBrasil</div>
            <div className="text-sm font-bold text-gray-500 ml-2">Health&Safety</div>
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
            
            {/* Ícone de configurações */}
            <button
              className="p-2 text-gray-600 hover:text-[#00A298] hover:bg-gray-100 rounded-lg transition-all duration-200 transform hover:scale-102 hover:shadow-lg cursor-pointer"
              title="Configurações do usuário"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
            
            <button
              onClick={handleLogoutClick}
              className="bg-[#00A298] hover:bg-red-500 text-white px-5 py-2 rounded-xl text-sm transition-all duration-200 transform hover:scale-102 hover:shadow-lg cursor-pointer"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar Lateral */}
        <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white shadow-lg border-r border-gray-200 fixed left-0 top-16 bottom-0 transition-all duration-300 z-40 flex flex-col`}>
          {/* Botão de toggle */}
          <div className="p-3 border-b border-gray-200 flex-shrink-0">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center justify-center p-2 bg-[#00A298] hover:bg-[#1D3C44] text-white rounded-lg transition-all duration-200 transform hover:scale-102 hover:shadow-lg cursor-pointer"
            >
              {sidebarCollapsed ? (
                // Ícone de expandir (chevron right)
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                // Ícone de retrair (chevron left)
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto p-2 pb-4 menu-scrollbar">
            {menuItems.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => {
                                         if (item.id === 'cadastros') {
                       toggleMenuExpansion('cadastros');
                     } else {
                       // Redirecionar para a página específica
                       router.push(`/home/${item.id}`);
                     }
                     setActiveMenu(item.id);
                  }}
                  className={`w-full flex items-center justify-between p-3 mb-1 rounded-lg transition-all duration-200 hover:bg-gray-100 cursor-pointer ${
                    activeMenu === item.id 
                      ? 'bg-[#00A298]/10 border-l-4 border-[#00A298] text-[#00A298]' 
                      : 'text-[#1D3C44] hover:text-[#00A298]'
                  }`}
                  title={sidebarCollapsed ? item.name : ''}
                >
                  <div className="flex items-center">
                    <span className="text-xl min-w-[24px]">{item.icon}</span>
                    {!sidebarCollapsed && (
                      <span className="ml-3 font-medium text-sm">{item.name}</span>
                    )}
                  </div>
                  {!sidebarCollapsed && item.id === 'cadastros' && (
                    <span className={`text-sm transition-transform duration-200 ${expandedMenus.cadastros ? 'rotate-180' : ''}`}>
                      ▼
                    </span>
                  )}
                </button>

                {/* Submenu para Cadastros */}
                {item.id === 'cadastros' && expandedMenus.cadastros && !sidebarCollapsed && (
                  <div className="ml-4 space-y-1">
                    {cadastroSubItems.map((subItem) => (
                      <div key={subItem.id}>
                        <button
                                                     onClick={() => {
                             if (subItem.id === 'tabelas-basicas') {
                               toggleMenuExpansion('tabelas-basicas');
                             } else {
                               // Redirecionar para a página específica
                               router.push(`/home/cadastros/${subItem.id}`);
                             }
                             setActiveMenu(subItem.id);
                           }}
                          className={`w-full flex items-center justify-between p-2 rounded-lg transition-all duration-200 hover:bg-gray-50 cursor-pointer ${
                            activeMenu === subItem.id 
                              ? 'bg-[#00A298]/10 text-[#00A298]' 
                              : 'text-[#1D3C44] hover:text-[#00A298]'
                          }`}
                        >
                                                     <div className="flex items-center w-full">
                             <span className="ml-2 font-medium text-xs text-left w-full">{subItem.name}</span>
                           </div>
                          {subItem.id === 'tabelas-basicas' && (
                            <span className={`text-xs transition-transform duration-200 ${expandedMenus['tabelas-basicas'] ? 'rotate-180' : ''}`}>
                              ▼
                            </span>
                          )}
                        </button>

                                                {/* Submenu para Tabelas Básicas */}
                        {subItem.id === 'tabelas-basicas' && expandedMenus['tabelas-basicas'] && (
                          <div className="ml-4 space-y-1 pb-2">
                            {tabelasBasicasItems.map((tabelaItem) => (
                              <button
                                key={tabelaItem.id}
                                                                 onClick={() => {
                                   router.push(`/home/cadastros/tabelas-basicas/${tabelaItem.id}`);
                                   setActiveMenu(tabelaItem.id);
                                 }}
                                className={`w-full flex items-center p-2 rounded-lg transition-all duration-200 hover:bg-gray-50 cursor-pointer ${
                                  activeMenu === tabelaItem.id 
                                    ? 'bg-[#00A298]/10 text-[#00A298]' 
                                    : 'text-[#1D3C44] hover:text-[#00A298]'
                                }`}
                              >
                                <span className="ml-2 font-medium text-xs text-left w-full">{tabelaItem.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Conteúdo Principal */}
        <main className={`${sidebarCollapsed ? 'ml-16' : 'ml-64'} flex-1 p-6 transition-all duration-300`}>
          <div className="max-w-6xl mx-auto">
            {/* Título da seção ativa */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-[#1D3C44] mb-2">
                {(() => {
                  // Buscar primeiro nos itens principais
                  const mainItem = menuItems.find(item => item.id === activeMenu);
                  if (mainItem) return mainItem.name;
                  
                  // Buscar nos subitens de cadastros
                  const subItem = cadastroSubItems.find(item => item.id === activeMenu);
                  if (subItem) return subItem.name;
                  
                  // Buscar nas tabelas básicas
                  const tabelaItem = tabelasBasicasItems.find(item => item.id === activeMenu);
                  if (tabelaItem) return tabelaItem.name;
                  
                  return 'Dashboard';
                })()}
              </h1>
              <p className="text-gray-600">
                {(() => {
                  // Buscar primeiro nos itens principais
                  const mainItem = menuItems.find(item => item.id === activeMenu);
                  if (mainItem) return mainItem.description;
                  
                  // Buscar nos subitens de cadastros
                  const subItem = cadastroSubItems.find(item => item.id === activeMenu);
                  if (subItem) return subItem.description;
                  
                  // Buscar nas tabelas básicas
                  const tabelaItem = tabelasBasicasItems.find(item => item.id === activeMenu);
                  if (tabelaItem) return 'Cadastro fundamental do sistema';
                  
                  return 'Bem-vindo ao sistema';
                })()}
              </p>
            </div>

            {/* Grid de cards baseado no menu ativo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeMenu === 'cadastros' && (
                <>
                  <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
                    <h3 className="text-xl font-bold text-[#1D3C44] mb-4">Estrutura Organizacional</h3>
                    <div className="space-y-3">
                      <div className="bg-[#00A298]/10 rounded-lg p-4">
                        <div className="text-2xl font-bold text-[#00A298]">🏗️</div>
                        <div className="text-sm text-gray-600 mt-2">Grupos, Regiões e Empresas</div>
                      </div>
                                            <button
                        onClick={() => setActiveMenu('estrutura-organizacional')}
                        className="w-full bg-[#00A298] text-white py-2 rounded-lg hover:bg-[#1D3C44] transition-all duration-200 transform hover:scale-102 hover:shadow-lg cursor-pointer"
                      >
                        Acessar
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
                    <h3 className="text-xl font-bold text-[#1D3C44] mb-4">Tabelas Básicas</h3>
                    <div className="space-y-3">
                      <div className="bg-[#00A298]/10 rounded-lg p-4">
                        <div className="text-2xl font-bold text-[#00A298]">📋</div>
                        <div className="text-sm text-gray-600 mt-2">Cadastros fundamentais</div>
                      </div>
                      <button 
                        onClick={() => {
                          setActiveMenu('tabelas-basicas');
                          setExpandedMenus(prev => ({ ...prev, 'tabelas-basicas': true }));
                        }}
                        className="w-full bg-[#00A298] text-white py-2 rounded-lg hover:bg-[#1D3C44] transition-all duration-200 transform hover:scale-102 hover:shadow-lg cursor-pointer"
                      >
                        Acessar
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
                    <h3 className="text-xl font-bold text-[#1D3C44] mb-4">Funcionários</h3>
                    <div className="space-y-3">
                      <div className="bg-[#00A298]/10 rounded-lg p-4">
                        <div className="text-2xl font-bold text-[#00A298]">👥</div>
                        <div className="text-sm text-gray-600 mt-2">Cadastrar novos funcionários</div>
                      </div>
                                        <button className="w-full bg-[#00A298] text-white py-2 rounded-lg hover:bg-[#1D3C44] transition-all duration-200 transform hover:scale-102 hover:shadow-lg cursor-pointer">
                    Acessar
                  </button>
                    </div>
                  </div>
                </>
              )}

              {activeMenu === 'estrutura-organizacional' && (
                <div className="col-span-full">
                  {/* Tabs para alternar entre Grupos, Regiões e Empresas */}
                  <div className="bg-white rounded-2xl shadow-xl">
                    {/* Header com tabs */}
                    <div className="border-b border-gray-200">
                      <nav className="flex space-x-8 px-6">
                        <button
                          onClick={() => setActiveTab('grupos')}
                          className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 transform hover:scale-102 cursor-pointer ${
                            activeTab === 'grupos'
                              ? 'border-[#00A298] text-[#00A298]'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          👥 Grupos
                        </button>
                        <button
                          onClick={() => setActiveTab('regioes')}
                          className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 transform hover:scale-102 cursor-pointer ${
                            activeTab === 'regioes'
                              ? 'border-[#00A298] text-[#00A298]'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          🗺️ Regiões
                        </button>
                        <button
                          onClick={() => setActiveTab('empresas')}
                          className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 transform hover:scale-102 cursor-pointer ${
                            activeTab === 'empresas'
                              ? 'border-[#00A298] text-[#00A298]'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          🏢 Empresas
                        </button>
                      </nav>
                    </div>

                    {/* Conteúdo da tab ativa */}
                    <div className="p-6">
                      {/* Formulário de busca */}
                      <div className="mb-6">
                        <div className="flex flex-wrap gap-4 items-end">
                          <div className="flex-1 min-w-64">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Pesquisar por
                            </label>
                            <div className="flex gap-2">
                              <select className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent">
                                <option value="nome">
                                  {activeTab === 'empresas' ? 'Nome Fantasia' : 'Nome'}
                                </option>
                                {activeTab === 'empresas' && (
                                  <>
                                    <option value="cnpj">CNPJ</option>
                                    <option value="razao">Razão Social</option>
                                    <option value="codigo">Código</option>
                                  </>
                                )}
                              </select>
                              <input
                                type="text"
                                placeholder={`Digite o ${activeTab === 'empresas' ? 'nome fantasia' : 'nome'} para buscar...`}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Situação
                            </label>
                            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent">
                              <option value="ativo">Ativo</option>
                              <option value="inativo">Inativo</option>
                              <option value="todos">Todos</option>
                            </select>
                          </div>

                                                     <button 
                             onClick={() => window.location.reload()}
                             className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                           >
                             PROCURAR
                           </button>
                           
                           <button 
                             onClick={() => {
                               if (activeTab === 'grupos') {
                                 setShowNewGroupModal(true);
                               } else if (activeTab === 'regioes') {
                                 setShowNewRegionModal(true);
                               } else if (activeTab === 'empresas') {
                                 setShowNewCompanyModal(true);
                               }
                             }}
                             className="bg-[#00A298] hover:bg-[#1D3C44] text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                           >
                             {activeTab === 'grupos' && 'NOVO GRUPO'}
                             {activeTab === 'regioes' && 'NOVA REGIÃO'}
                             {activeTab === 'empresas' && 'NOVA EMPRESA'}
                           </button>
                        </div>
                      </div>

                      {/* Container de Novo Cadastro - Grupos */}
                      {showNewGroupModal && activeTab === 'grupos' && (
                        <div className="mb-6 bg-gray-50 rounded-lg p-6 border-2 border-[#00A298]/20">
                          <h3 className="text-lg font-bold text-[#1D3C44] mb-4">Cadastro de Grupos</h3>
                          
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <h4 className="text-sm font-medium text-gray-700 mb-4">Dados cadastrais</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Campo Nome */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Nome
                                </label>
                                <input
                                  type="text"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                                  placeholder="Digite o nome do grupo"
                                />
                              </div>

                              {/* Campo Situação */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Situação
                                </label>
                                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent">
                                  <option value="ativo">Ativo</option>
                                  <option value="inativo">Inativo</option>
                                </select>
                              </div>
                            </div>

                            {/* Botões */}
                            <div className="flex gap-3 mt-6">
                              <button
                                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                              >
                                INCLUIR
                              </button>
                              <button
                                className="bg-blue-400 hover:bg-blue-500 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                              >
                                LIMPAR
                              </button>
                              <button
                                onClick={() => setShowNewGroupModal(false)}
                                className="bg-gray-400 hover:bg-gray-500 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                              >
                                RETORNAR
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Container de Novo Cadastro - Regiões */}
                      {showNewRegionModal && activeTab === 'regioes' && (
                        <div className="mb-6 bg-gray-50 rounded-lg p-6 border-2 border-[#00A298]/20">
                          <h3 className="text-lg font-bold text-[#1D3C44] mb-4">Cadastro de Regiões</h3>
                          
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <h4 className="text-sm font-medium text-gray-700 mb-4">Dados cadastrais</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Campo Nome */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Nome
                                </label>
                                <input
                                  type="text"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                                  placeholder="Digite o nome da região"
                                />
                              </div>

                              {/* Campo Grupo */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Grupo
                                </label>
                                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent">
                                  <option value="">Selecione um grupo</option>
                                  <option value="grupo-teste">Grupo Teste</option>
                                </select>
                              </div>

                              {/* Campo Situação */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Situação
                                </label>
                                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent">
                                  <option value="ativo">Ativo</option>
                                  <option value="inativo">Inativo</option>
                                </select>
                              </div>
                            </div>

                            {/* Botões */}
                                                         <div className="flex gap-3 mt-6">
                               <button
                                 className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                               >
                                 INCLUIR
                               </button>
                               <button
                                 className="bg-blue-400 hover:bg-blue-500 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                               >
                                 LIMPAR
                               </button>
                               <button
                                 onClick={() => setShowNewRegionModal(false)}
                                 className="bg-gray-400 hover:bg-gray-500 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                               >
                                 RETORNAR
                               </button>
                             </div>
                          </div>
                        </div>
                      )}

                      {/* Container de Novo Cadastro - Empresas */}
                      {showNewCompanyModal && activeTab === 'empresas' && (
                        <div className="mb-6 bg-gray-50 rounded-lg p-6 border-2 border-[#00A298]/20">
                          <h3 className="text-lg font-bold text-[#1D3C44] mb-4">Cadastro de Empresas</h3>
                          
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <h4 className="text-sm font-medium text-gray-700 mb-4">Dados cadastrais</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {/* Campo CNPJ */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  CNPJ
                                </label>
                                <input
                                  type="text"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                                  placeholder="00.000.000/0001-00"
                                />
                              </div>

                              {/* Campo Razão Social */}
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

                              {/* Campo Nome Fantasia */}
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

                              {/* Campo Código */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Código
                                </label>
                                <input
                                  type="text"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                                  placeholder="Digite o código"
                                />
                              </div>

                              {/* Campo Grupo */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Grupo
                                </label>
                                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent">
                                  <option value="">Selecione um grupo</option>
                                  <option value="grupo-teste">Grupo Teste</option>
                                </select>
                              </div>

                              {/* Campo Região */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Região
                                </label>
                                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent">
                                  <option value="">Selecione uma região</option>
                                  <option value="regiao-teste">Região Teste</option>
                                </select>
                              </div>

                              {/* Campo Situação */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  Situação
                                </label>
                                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent">
                                  <option value="ativo">Ativo</option>
                                  <option value="inativo">Inativo</option>
                                </select>
                              </div>
                            </div>

                            {/* Botões */}
                                                         <div className="flex gap-3 mt-6">
                               <button
                                 className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                               >
                                 INCLUIR
                               </button>
                               <button
                                 className="bg-blue-400 hover:bg-blue-500 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                               >
                                 LIMPAR
                               </button>
                               <button
                                 onClick={() => setShowNewCompanyModal(false)}
                                 className="bg-gray-400 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                               >
                                 RETORNAR
                               </button>
                             </div>
                          </div>
                        </div>
                      )}

                      {/* Tabela de resultados */}
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-100">
                            <tr>
                              {activeTab === 'grupos' && (
                                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nome</th>
                              )}
                              
                              {activeTab === 'regioes' && (
                                <>
                                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nome</th>
                                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Grupo</th>
                                </>
                              )}
                              
                              {activeTab === 'empresas' && (
                                <>
                                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">CNPJ</th>
                                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Razão Social</th>
                                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nome Fantasia</th>
                                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Código</th>
                                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Grupo</th>
                                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Região</th>
                                </>
                              )}
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td 
                                colSpan={
                                  activeTab === 'grupos' ? 1 : 
                                  activeTab === 'regioes' ? 2 : 6
                                } 
                                className="px-4 py-8 text-center text-gray-500"
                              >
                                Não existem dados para mostrar
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeMenu === 'tabelas-basicas' && (
                <>
                  {tabelasBasicasItems.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
                      <h3 className="text-xl font-bold text-[#1D3C44] mb-4">{item.name}</h3>
                      <div className="space-y-3">
                        <div className="bg-[#00A298]/10 rounded-lg p-4">
                          <div className="text-2xl font-bold text-[#00A298]">{item.icon}</div>
                          <div className="text-sm text-gray-600 mt-2">Gerenciar {item.name.toLowerCase()}</div>
                        </div>
                                              <button 
                        onClick={() => setActiveMenu(item.id)}
                        className="w-full bg-[#00A298] text-white py-2 rounded-lg hover:bg-[#1D3C44] transition-all duration-200 transform hover:scale-102 hover:shadow-lg cursor-pointer"
                      >
                          Acessar
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* Itens específicos das tabelas básicas */}
              {tabelasBasicasItems.find(item => item.id === activeMenu) && (
                <div className="col-span-full bg-white rounded-2xl shadow-xl p-8 text-center">
                  <div className="text-6xl mb-4">
                    {tabelasBasicasItems.find(item => item.id === activeMenu)?.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-[#1D3C44] mb-4">
                    {tabelasBasicasItems.find(item => item.id === activeMenu)?.name}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Esta funcionalidade está em desenvolvimento. Em breve estará disponível!
                  </p>
                  <div className="bg-[#00A298]/10 rounded-lg p-4 inline-block">
                    <span className="text-[#00A298] text-sm font-medium">🚧 Em construção</span>
                  </div>
                </div>
              )}

              {/* Outros menus que não são cadastros */}
              {!['cadastros', 'estrutura-organizacional', 'tabelas-basicas'].includes(activeMenu) && 
               !tabelasBasicasItems.find(item => item.id === activeMenu) && (
                <div className="col-span-full bg-white rounded-2xl shadow-xl p-8 text-center">
                  <div className="text-6xl mb-4">
                    {menuItems.find(item => item.id === activeMenu)?.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-[#1D3C44] mb-4">
                    {menuItems.find(item => item.id === activeMenu)?.name}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Esta funcionalidade está em desenvolvimento. Em breve estará disponível!
                  </p>
                  <div className="bg-[#00A298]/10 rounded-lg p-4 inline-block">
                    <span className="text-[#00A298] text-sm font-medium">🚧 Em construção</span>
                  </div>
                </div>
              )}
            </div>

            {/* Card de informações do usuário no rodapé */}
            {activeMenu === 'cadastros' && (
              <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-[#1D3C44] mb-4">Informações do Sistema</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-green-600 font-medium">✅ Frontend</div>
                    <div className="text-green-600">Next.js funcionando</div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-green-600 font-medium">✅ Backend</div>
                    <div className="text-green-600">Node.js + Express ativo</div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-green-600 font-medium">✅ Autenticação</div>
                    <div className="text-green-600">JWT integrado</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal de confirmação de logout */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl p-8 mx-4 max-w-md w-full animate-in zoom-in-95 duration-300">
            {/* Ícone e título */}
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl">🚪</span>
              </div>
              <h2 className="text-2xl font-bold text-[#1D3C44] mb-2">Confirmar Saída</h2>
              <p className="text-gray-600">
                Olá, <strong>{user?.first_name}</strong>! Tem certeza que deseja sair do sistema?
              </p>
            </div>

            {/* Botões */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={handleLogoutCancel}
                                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl text-sm transition-all duration-200 transform hover:scale-102 hover:shadow-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogoutConfirm}
                                      className="flex-1 bg-red-400 hover:bg-red-500 text-white font-medium py-3 px-4 rounded-xl text-sm transition-all duration-200 transform hover:scale-102 hover:shadow-lg cursor-pointer"
              >
                Sim, Sair
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
} 
