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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00A298]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00A298]/10 to-[#1D3C44]/10">
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
            <Image
              src="/sistemagente_logo.png"
              alt="Sistema GENTE"
              width={150}
              height={15}
              className="object-contain"
              priority
            />
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
              onClick={handleLogoutClick}
              className="bg-[#00A298] hover:bg-red-600 text-white px-5 py-2 rounded-xl text-sm transition-all duration-200 transform hover:scale-105 hover:shadow-lg cursor-pointer"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar Lateral */}
        <aside className={`${sidebarCollapsed ? 'w-16' : 'w-48'} bg-white shadow-lg border-r border-gray-200 fixed left-0 top-16 bottom-0 overflow-hidden transition-all duration-300 z-40`}>
          {/* Botão de toggle */}
          <div className="p-3 border-b border-gray-200">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full flex items-center justify-center p-2 bg-[#00A298] hover:bg-[#1D3C44] text-white rounded-lg transition-colors"
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
          <nav className="p-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveMenu(item.id)}
                className={`w-full flex items-center p-3 mb-1 rounded-lg transition-all duration-200 hover:bg-gray-100 ${
                  activeMenu === item.id 
                    ? 'bg-[#00A298]/10 border-l-4 border-[#00A298] text-[#00A298]' 
                    : 'text-[#1D3C44] hover:text-[#00A298]'
                }`}
                title={sidebarCollapsed ? item.name : ''}
              >
                <span className="text-xl min-w-[24px]">{item.icon}</span>
                {!sidebarCollapsed && (
                  <span className="ml-3 font-medium text-sm">{item.name}</span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Conteúdo Principal */}
        <main className={`${sidebarCollapsed ? 'ml-16' : 'ml-48'} flex-1 p-6 transition-all duration-300`}>
          <div className="max-w-6xl mx-auto">
            {/* Título da seção ativa */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-[#1D3C44] mb-2">
                {menuItems.find(item => item.id === activeMenu)?.name || 'Dashboard'}
              </h1>
              <p className="text-gray-600">
                {menuItems.find(item => item.id === activeMenu)?.description || 'Bem-vindo ao sistema'}
              </p>
            </div>

            {/* Grid de cards baseado no menu ativo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeMenu === 'cadastros' && (
                <>
                  <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
                    <h3 className="text-xl font-bold text-[#1D3C44] mb-4">Funcionários</h3>
                    <div className="space-y-3">
                      <div className="bg-[#00A298]/10 rounded-lg p-4">
                        <div className="text-2xl font-bold text-[#00A298]">👥</div>
                        <div className="text-sm text-gray-600 mt-2">Cadastrar novos funcionários</div>
                      </div>
                      <button className="w-full bg-[#00A298] text-white py-2 rounded-lg hover:bg-[#1D3C44] transition-colors">
                        Acessar
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
                    <h3 className="text-xl font-bold text-[#1D3C44] mb-4">Empresas</h3>
                    <div className="space-y-3">
                      <div className="bg-[#00A298]/10 rounded-lg p-4">
                        <div className="text-2xl font-bold text-[#00A298]">🏢</div>
                        <div className="text-sm text-gray-600 mt-2">Gerenciar dados empresariais</div>
                      </div>
                      <button className="w-full bg-[#00A298] text-white py-2 rounded-lg hover:bg-[#1D3C44] transition-colors">
                        Acessar
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
                    <h3 className="text-xl font-bold text-[#1D3C44] mb-4">Usuários</h3>
                    <div className="space-y-3">
                      <div className="bg-[#00A298]/10 rounded-lg p-4">
                        <div className="text-2xl font-bold text-[#00A298]">⚙️</div>
                        <div className="text-sm text-gray-600 mt-2">Controle de acesso do sistema</div>
                      </div>
                      <button className="w-full bg-[#00A298] text-white py-2 rounded-lg hover:bg-[#1D3C44] transition-colors">
                        Acessar
                      </button>
                    </div>
                  </div>
                </>
              )}

              {activeMenu !== 'cadastros' && (
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
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl text-sm transition-all duration-200 transform hover:scale-105"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-xl text-sm transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
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