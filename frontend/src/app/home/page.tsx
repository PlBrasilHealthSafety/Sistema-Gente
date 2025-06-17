'use client';

import { useState, useEffect } from 'react';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    }
  }, []);

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

  return (
    <div className="min-h-[calc(100vh-12rem)] relative overflow-hidden">
      {/* Background com efeitos visuais */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00A298]/5 via-transparent to-[#1D3C44]/5"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00A298]/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#1D3C44]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-12 pt-6">
          <div className="inline-block mb-6">
            <div className="bg-gradient-to-r from-[#00A298] to-[#1D3C44] text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg">
              ✨ Sistema em Desenvolvimento - Versão Beta
            </div>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-extrabold bg-gradient-to-r from-[#1D3C44] via-[#00A298] to-[#1D3C44] bg-clip-text text-transparent mb-6 leading-tight">
            Sistema GENTE
          </h1>
          
          {user && (
            <div className="mb-6">
              <p className="text-2xl text-gray-600 mb-2">
                Bem-vindo de volta, 
              </p>
              <p className="text-3xl font-bold text-[#00A298] mb-2">
                {user.first_name} {user.last_name}
              </p>
              <div className="inline-block px-4 py-2 bg-[#00A298]/10 rounded-full">
                <span className="text-sm font-medium text-[#1D3C44]">
                  {getRoleName(user.role)}
                </span>
              </div>
            </div>
          )}
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Plataforma do novo Sistema da 
            <span className="font-semibold text-[#00A298]"> PLBrasil Health&Safety</span>
          </p>
        </div>


        {/* Dashboard Preview */}
        <div className="bg-gradient-to-r from-[#00A298]/10 to-[#1D3C44]/10 backdrop-blur-sm rounded-3xl p-6 border border-gray-200/50 shadow-lg mb-12">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-[#1D3C44] mb-3">
              Dashboard Inteligente em Desenvolvimento
            </h3>
            <p className="text-base text-gray-600">
              Em breve, você terá acesso a insights poderosos e visualizações interativas
            </p>
          </div>
          
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl h-48 flex items-center justify-center border-2 border-dashed border-gray-300">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#00A298] to-[#1D3C44] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <span className="text-white text-3xl">📊</span>
              </div>
              <p className="text-xl font-semibold text-gray-600 mb-2">Dashboard em Construção</p>
              <p className="text-sm text-gray-500">Visualizações avançadas chegando em breve!</p>
            </div>
          </div>
        </div>

        {/* Status do Sistema */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-gray-200/50">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-[#1D3C44] mb-3">Status do Sistema</h3>
            <p className="text-sm text-gray-600">Acompanhe o progresso de desenvolvimento da plataforma</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-2xl border border-green-200">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-xl">✅</span>
              </div>
              <h4 className="font-bold text-green-700 mb-2">Frontend</h4>
              <p className="text-sm text-green-600">Funcionando corretamente</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-2xl border border-green-200">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-xl">✅</span>
              </div>
              <h4 className="font-bold text-green-700 mb-2">Backend</h4>
              <p className="text-sm text-green-600">Funcionando corretamente</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-2xl border border-green-200">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white text-xl">✅</span>
              </div>
              <h4 className="font-bold text-green-700 mb-2">Database</h4>
              <p className="text-sm text-green-600">Funcionando corretamente</p>
            </div>
          </div>
          
          <div className="text-center mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">
              PLBrasil Health&Safety - Sistema GENTE v1.1.0-beta
            </p>
            <p className="text-xs text-gray-400">
              Desenvolvido com ❤️ para revolucionar a gestão de pessoas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 
