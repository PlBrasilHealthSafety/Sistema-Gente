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

export default function EstruturaOrganizacionalPage() {
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
        {/* Conteúdo Principal */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
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
                <span className="text-[#00A298] font-medium">Estrutura Organizacional</span>
              </div>
              
              <h1 className="text-3xl font-bold text-[#1D3C44] mb-2">
                Estrutura Organizacional
              </h1>
              <p className="text-gray-600">
                Gerencie a estrutura da sua organização: grupos, regiões e empresas
              </p>
            </div>

            {/* Cards de Navegação */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card Grupos */}
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-200 border border-gray-100 hover:border-[#00A298]/20 flex flex-col">
                <div className="text-center flex-1 flex flex-col">
                  <div className="text-5xl mb-4 opacity-80">👥</div>
                  <h3 className="text-xl font-semibold text-[#1D3C44] mb-3">Grupos</h3>
                  <p className="text-gray-600 mb-6 text-sm flex-1">
                    Cadastre e gerencie os grupos da sua organização.
                  </p>
                  <button
                    onClick={() => router.push('/home/cadastros/estrutura-organizacional/grupos')}
                    className="w-full bg-[#00A298] hover:bg-[#1D3C44] text-white px-6 py-2.5 rounded-md font-medium transition-colors duration-200 cursor-pointer mt-auto"
                  >
                    Acessar Grupos
                  </button>
                </div>
              </div>

              {/* Card Regiões */}
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-200 border border-gray-100 hover:border-[#00A298]/20 flex flex-col">
                <div className="text-center flex-1 flex flex-col">
                  <div className="text-5xl mb-4 opacity-80">🗺️</div>
                  <h3 className="text-xl font-semibold text-[#1D3C44] mb-3">Regiões</h3>
                  <p className="text-gray-600 mb-6 text-sm flex-1">
                    Cadastre e gerencie as regiões vinculadas aos grupos da sua organização.
                  </p>
                  <button
                    onClick={() => router.push('/home/cadastros/estrutura-organizacional/regioes')}
                    className="w-full bg-[#00A298] hover:bg-[#1D3C44] text-white px-6 py-2.5 rounded-md font-medium transition-colors duration-200 cursor-pointer mt-auto"
                  >
                    Acessar Regiões
                  </button>
                </div>
              </div>

              {/* Card Empresas */}
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-200 border border-gray-100 hover:border-[#00A298]/20 flex flex-col">
                <div className="text-center flex-1 flex flex-col">
                  <div className="text-5xl mb-4 opacity-80">🏢</div>
                  <h3 className="text-xl font-semibold text-[#1D3C44] mb-3">Empresas</h3>
                  <p className="text-gray-600 mb-6 text-sm flex-1">
                    Cadastre e gerencie as empresas vinculadas aos grupos e regiões da sua organização.
                  </p>
                  <button
                    onClick={() => router.push('/home/cadastros/estrutura-organizacional/empresas')}
                    className="w-full bg-[#00A298] hover:bg-[#1D3C44] text-white px-6 py-2.5 rounded-md font-medium transition-colors duration-200 cursor-pointer mt-auto"
                  >
                    Acessar Empresas
                  </button>
                </div>
              </div>
            </div>

            {/* Seção de Resumo/Estatísticas */}
            <div className="mt-8 bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-[#1D3C44] mb-4">Resumo da Estrutura</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 font-medium text-sm">Total de Grupos</p>
                      <p className="text-xl font-semibold text-blue-800">0</p>
                    </div>
                    <div className="text-blue-500 text-lg opacity-70">👥</div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-md border border-green-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 font-medium text-sm">Total de Regiões</p>
                      <p className="text-xl font-semibold text-green-800">0</p>
                    </div>
                    <div className="text-green-500 text-lg opacity-70">🗺️</div>
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-md border border-purple-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 font-medium text-sm">Total de Empresas</p>
                      <p className="text-xl font-semibold text-purple-800">0</p>
                    </div>
                    <div className="text-purple-500 text-lg opacity-70">🏢</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Instruções */}
            <div className="mt-8 bg-[#00A298]/5 rounded-xl p-6 border border-[#00A298]/15">
              <h3 className="text-lg font-semibold text-[#1D3C44] mb-3">Como usar a Estrutura Organizacional</h3>
              <div className="space-y-2 text-gray-700 text-sm">
                <p><span className="text-base">📋</span> <strong>1. Grupos:</strong> Comece criando os grupos principais da sua organização</p>
                <p><span className="text-base">📍</span> <strong>2. Regiões:</strong> Crie regiões e associe-as aos grupos correspondentes</p>
                <p><span className="text-base">🏢</span> <strong>3. Empresas:</strong> Cadastre as empresas vinculando-as às regiões</p>
                <p><span className="text-base">✅</span> Esta hierarquia garante uma organização estruturada dos seus dados</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 