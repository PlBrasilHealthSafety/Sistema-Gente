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

export default function FuncionariosPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
        {/* Navegação */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <nav className="flex items-center space-x-1 text-sm text-gray-500">
            <button 
              onClick={() => router.push('/home')}
              className="hover:text-[#00A298] transition-colors"
            >
              Home
            </button>
            <span>›</span>
            <span className="text-[#00A298] font-medium">Funcionários</span>
          </nav>
        </div>

        {/* Conteúdo Principal */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Título da página */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-[#1D3C44] mb-2">
                Funcionários
              </h1>
              <p className="text-gray-600">
                Cadastro e gestão de funcionários
              </p>
            </div>

            {/* Conteúdo em desenvolvimento */}
            <div className="col-span-full bg-white rounded-2xl shadow-xl p-8 text-center">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-2xl font-bold text-[#1D3C44] mb-4">
                Cadastro de Funcionários
              </h3>
              <p className="text-gray-600 mb-6">
                Esta funcionalidade está em desenvolvimento. Em breve estará disponível!
              </p>
              <div className="bg-[#00A298]/10 rounded-lg p-4 inline-block">
                <span className="text-[#00A298] text-sm font-medium">🚧 Em construção</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 