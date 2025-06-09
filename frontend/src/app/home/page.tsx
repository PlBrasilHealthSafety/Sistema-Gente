'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
}

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-[grey]">Sistema</span>
              <span className="text-xl font-bold text-[#00A298] ml-2">GENTE</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Bem-vindo, <strong>{user.first_name} {user.last_name}</strong>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                {getRoleName(user.role)}
              </span>
              <button
                onClick={handleLogout}
                className="bg-[#00A298] hover:bg-[#1D3C44] text-white px-4 py-2 rounded-lg text-sm transition-all duration-200 transform hover:scale-105 hover:shadow-lg cursor-pointer"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center mb-8">
            <div className="text-4xl font-bold text-[#1D3C44] mb-2">
              <span className="text-[#00A298]">plbrasil</span> Health&Safety
            </div>
            <div className="text-lg text-gray-600">Sistema de Gestão de Pessoas</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Card de informações do usuário */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-[#1D3C44] mb-4">Meus Dados</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Nome:</span>
                  <div className="font-medium">{user.first_name} {user.last_name}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">E-mail:</span>
                  <div className="font-medium">{user.email}</div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Perfil:</span>
                  <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {getRoleName(user.role)}
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Status:</span>
                  <div className="font-medium">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card de estatísticas */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-[#1D3C44] mb-4">Dashboard</h2>
              <div className="space-y-4">
                <div className="bg-[#00A298]/10 rounded-lg p-4">
                  <div className="text-2xl font-bold text-[#00A298]">✅</div>
                  <div className="text-sm text-gray-600 mt-2">Login realizado com sucesso!</div>
                </div>
                <div className="text-sm text-gray-500">
                  Sistema integrado e funcional.
                </div>
              </div>
            </div>

            {/* Card de funcionalidades futuras */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold text-[#1D3C44] mb-4">Próximas Funcionalidades</h2>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <span className="text-[#00A298] mr-2">🚧</span>
                  Gestão de Funcionários
                </div>
                <div className="flex items-center">
                  <span className="text-[#00A298] mr-2">🚧</span>
                  Relatórios Gerenciais
                </div>
                <div className="flex items-center">
                  <span className="text-[#00A298] mr-2">🚧</span>
                  Configurações do Sistema
                </div>
                <div className="flex items-center">
                  <span className="text-[#00A298] mr-2">🚧</span>
                  Backup e Segurança
                </div>
              </div>
            </div>
          </div>

          {/* Status do sistema */}
          <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
            <h2 className="text-2xl font-bold text-[#1D3C44] mb-4">
              Sistema Funcionando Perfeitamente! 🎉
            </h2>
            <p className="text-gray-600 mb-6">
              O login está integrado com o backend, a autenticação via JWT está funcionando e você foi redirecionado com sucesso para a página home.
            </p>
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
        </div>
      </main>
    </div>
  );
} 