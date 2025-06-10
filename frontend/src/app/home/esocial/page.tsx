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

export default function ESocialPage() {
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
            <span className="text-[#00A298] font-medium">eSocial</span>
          </nav>
        </div>

        {/* Conteúdo Principal */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-[#1D3C44] mb-2">eSocial</h1>
              <p className="text-gray-600">Sistema de Escrituração Digital das Obrigações Fiscais</p>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Eventos Enviados</p>
                    <p className="text-2xl font-bold text-green-500">1,247</p>
                  </div>
                  <div className="text-3xl">✅</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pendentes</p>
                    <p className="text-2xl font-bold text-orange-500">23</p>
                  </div>
                  <div className="text-3xl">⏳</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Com Erro</p>
                    <p className="text-2xl font-bold text-red-500">5</p>
                  </div>
                  <div className="text-3xl">❌</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Taxa de Sucesso</p>
                    <p className="text-2xl font-bold text-blue-500">98.2%</p>
                  </div>
                  <div className="text-3xl">📊</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Últimos Eventos */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-[#1D3C44]">Últimos Eventos</h2>
                  <button className="bg-[#00A298] text-white px-4 py-2 rounded-lg hover:bg-[#00A298]/90 transition-colors">
                    Enviar Evento
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium text-[#1D3C44]">S-2200 - Admissão</div>
                      <div className="text-sm text-gray-600">João Silva Santos</div>
                      <div className="text-sm text-gray-500">Enviado: 14/12/2024 10:30</div>
                    </div>
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Sucesso
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium text-[#1D3C44]">S-1200 - Remuneração</div>
                      <div className="text-sm text-gray-600">Maria Oliveira</div>
                      <div className="text-sm text-gray-500">Enviado: 14/12/2024 09:15</div>
                    </div>
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                      Pendente
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium text-[#1D3C44]">S-2299 - Desligamento</div>
                      <div className="text-sm text-gray-600">Carlos Pereira</div>
                      <div className="text-sm text-gray-500">Enviado: 13/12/2024 16:45</div>
                    </div>
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                      Erro
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium text-[#1D3C44]">S-2230 - Afastamento</div>
                      <div className="text-sm text-gray-600">Ana Costa</div>
                      <div className="text-sm text-gray-500">Enviado: 13/12/2024 14:20</div>
                    </div>
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Sucesso
                    </span>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <button className="text-[#00A298] hover:text-[#00A298]/80 text-sm font-medium">
                    Ver todos os eventos
                  </button>
                </div>
              </div>

              {/* Tipos de Eventos */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-[#1D3C44] mb-4">Tipos de Eventos</h2>
                
                <div className="space-y-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-[#1D3C44]">S-1000 - Informações do Empregador</span>
                      <span className="text-sm text-green-600">✓ Ativo</span>
                    </div>
                    <div className="text-sm text-gray-600">Status da empresa no eSocial</div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-[#1D3C44]">S-2200 - Cadastramento Inicial</span>
                      <span className="text-sm text-blue-600">📤 Enviável</span>
                    </div>
                    <div className="text-sm text-gray-600">Admissão de trabalhadores</div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-[#1D3C44]">S-1200 - Remuneração</span>
                      <span className="text-sm text-blue-600">📤 Enviável</span>
                    </div>
                    <div className="text-sm text-gray-600">Informações de remuneração</div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-[#1D3C44]">S-2299 - Desligamento</span>
                      <span className="text-sm text-blue-600">📤 Enviável</span>
                    </div>
                    <div className="text-sm text-gray-600">Desligamento de trabalhadores</div>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-[#1D3C44]">S-2230 - Afastamento Temporário</span>
                      <span className="text-sm text-blue-600">📤 Enviável</span>
                    </div>
                    <div className="text-sm text-gray-600">Afastamentos temporários</div>
                  </div>
                </div>
              </div>

              {/* Validações e Consistência */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-[#1D3C44] mb-4">Validações e Consistência</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-green-500 text-xl mr-3">✅</span>
                    <div>
                      <div className="font-medium text-green-700">Dados Básicos Válidos</div>
                      <div className="text-sm text-green-600">Todas as informações obrigatórias estão preenchidas</div>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-green-500 text-xl mr-3">✅</span>
                    <div>
                      <div className="font-medium text-green-700">Certificado Digital</div>
                      <div className="text-sm text-green-600">Certificado válido até 15/06/2025</div>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <span className="text-yellow-500 text-xl mr-3">⚠️</span>
                    <div>
                      <div className="font-medium text-yellow-700">Tabelas de Domínio</div>
                      <div className="text-sm text-yellow-600">Algumas tabelas precisam ser atualizadas</div>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="text-blue-500 text-xl mr-3">ℹ️</span>
                    <div>
                      <div className="font-medium text-blue-700">Layout S-1.0</div>
                      <div className="text-sm text-blue-600">Utilizando a versão mais recente do layout</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Relatórios e Consultas */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-[#1D3C44] mb-4">Relatórios e Consultas</h2>
                
                <div className="space-y-3">
                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">📊</span>
                      <div>
                        <div className="font-medium text-[#1D3C44]">Relatório de Status</div>
                        <div className="text-sm text-gray-600">Status dos últimos envios</div>
                      </div>
                    </div>
                  </button>

                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">🔍</span>
                      <div>
                        <div className="font-medium text-[#1D3C44]">Consulta por CPF</div>
                        <div className="text-sm text-gray-600">Buscar eventos por funcionário</div>
                      </div>
                    </div>
                  </button>

                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">📅</span>
                      <div>
                        <div className="font-medium text-[#1D3C44]">Eventos por Período</div>
                        <div className="text-sm text-gray-600">Consultar por data de envio</div>
                      </div>
                    </div>
                  </button>

                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">📋</span>
                      <div>
                        <div className="font-medium text-[#1D3C44]">Log de Transmissão</div>
                        <div className="text-sm text-gray-600">Histórico detalhado de envios</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-[#1D3C44] mb-4">Ações Rápidas</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="text-3xl mb-2">📤</div>
                  <span className="font-medium text-[#1D3C44]">Envio em Lote</span>
                </button>
                
                <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="text-3xl mb-2">🔄</div>
                  <span className="font-medium text-[#1D3C44]">Reenviar Erros</span>
                </button>
                
                <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="text-3xl mb-2">📋</div>
                  <span className="font-medium text-[#1D3C44]">Validar Dados</span>
                </button>
                
                <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="text-3xl mb-2">⚙️</div>
                  <span className="font-medium text-[#1D3C44]">Configurações</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 