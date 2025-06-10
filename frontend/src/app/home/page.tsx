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
    <div className="min-h-[calc(100vh-12rem)]">
      {/* Header de Boas-vindas */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold text-[#1D3C44] mb-4">
          Bem-vindo ao Sistema GENTE
        </h1>
        {user && (
          <p className="text-2xl text-gray-600 mb-2">
            Olá, <span className="font-semibold text-[#00A298]">{user.first_name} {user.last_name}</span>
          </p>
        )}
        <p className="text-xl text-gray-500">
          Sistema de Gestão de Pessoas - PLBrasil Health&Safety
        </p>
      </div>

      {/* Grid de Módulos Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex flex-col items-center text-center">
            <span className="text-5xl mb-4">👥</span>
            <span className="text-xl font-semibold text-[#1D3C44] mb-2">Cadastros</span>
            <span className="text-sm text-gray-600">Gestão completa de pessoas e dados organizacionais</span>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex flex-col items-center text-center">
            <span className="text-5xl mb-4">👤</span>
            <span className="text-xl font-semibold text-[#1D3C44] mb-2">Funcionários</span>
            <span className="text-sm text-gray-600">Controle de colaboradores e informações pessoais</span>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex flex-col items-center text-center">
            <span className="text-5xl mb-4">🛡️</span>
            <span className="text-xl font-semibold text-[#1D3C44] mb-2">SST</span>
            <span className="text-sm text-gray-600">Segurança e Saúde do Trabalho</span>
          </div>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex flex-col items-center text-center">
            <span className="text-5xl mb-4">📊</span>
            <span className="text-xl font-semibold text-[#1D3C44] mb-2">Relatórios</span>
            <span className="text-sm text-gray-600">Análises detalhadas e insights estratégicos</span>
          </div>
        </div>
      </div>

      

      {/* Footer da Página Inicial */}
      <div className="text-center">
        <p className="text-gray-500 text-lg mb-4">
          Use o menu lateral para navegar entre os módulos do sistema
        </p>
        <div className="text-sm text-gray-400">
          PLBrasil Health&Safety - Sistema GENTE V 1.0
        </div>
      </div>
    </div>
  );
} 
