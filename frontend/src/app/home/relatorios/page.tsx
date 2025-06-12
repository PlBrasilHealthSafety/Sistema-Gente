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

export default function RelatoriosPage() {
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
            <Image
              src="/logo.png"
              alt="PLBrasil Health&Safety"
              width={120}
              height={30}
              className="object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
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
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-[#1D3C44] mb-2">Relatórios</h1>
              <p className="text-gray-600">Análises e relatórios do sistema</p>
            </div>

            {/* Filtros */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-[#1D3C44] mb-4">Filtros</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent">
                    <option value="mes">Último mês</option>
                    <option value="trimestre">Último trimestre</option>
                    <option value="semestre">Último semestre</option>
                    <option value="ano">Último ano</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent">
                    <option value="">Todos</option>
                    <option value="funcionarios">Funcionários</option>
                    <option value="financeiro">Financeiro</option>
                    <option value="sst">SST</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent">
                    <option value="">Todas</option>
                    <option value="plbrasil">PLBrasil Health&Safety</option>
                    <option value="filial1">Filial São Paulo</option>
                    <option value="filial2">Filial Rio de Janeiro</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button className="w-full bg-[#00A298] text-white px-4 py-2 rounded-lg hover:bg-[#00A298]/90 transition-colors">
                    Aplicar Filtros
                  </button>
                </div>
              </div>
            </div>

            {/* Tipos de Relatórios */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Relatórios de Funcionários */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-[#1D3C44] mb-4 flex items-center">
                  <span className="text-2xl mr-3">👥</span>
                  Funcionários
                </h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-[#1D3C44]">Lista de Funcionários</div>
                    <div className="text-sm text-gray-600">Relatório completo dos colaboradores</div>
                  </button>
                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-[#1D3C44]">Admissões e Demissões</div>
                    <div className="text-sm text-gray-600">Movimentação de pessoal</div>
                  </button>
                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-[#1D3C44]">Aniversariantes</div>
                    <div className="text-sm text-gray-600">Datas de nascimento e admissão</div>
                  </button>
                </div>
              </div>

              {/* Relatórios Financeiros */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-[#1D3C44] mb-4 flex items-center">
                  <span className="text-2xl mr-3">💰</span>
                  Financeiro
                </h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-[#1D3C44]">Faturamento Mensal</div>
                    <div className="text-sm text-gray-600">Resumo do faturamento</div>
                  </button>
                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-[#1D3C44]">Contas a Receber</div>
                    <div className="text-sm text-gray-600">Pendências financeiras</div>
                  </button>
                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-[#1D3C44]">Análise de Clientes</div>
                    <div className="text-sm text-gray-600">Performance por cliente</div>
                  </button>
                </div>
              </div>

              {/* Relatórios SST */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-[#1D3C44] mb-4 flex items-center">
                  <span className="text-2xl mr-3">🛡️</span>
                  SST
                </h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-[#1D3C44]">Exames Médicos</div>
                    <div className="text-sm text-gray-600">Status dos exames</div>
                  </button>
                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-[#1D3C44]">Acidentes de Trabalho</div>
                    <div className="text-sm text-gray-600">Registro de acidentes</div>
                  </button>
                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-[#1D3C44]">Treinamentos</div>
                    <div className="text-sm text-gray-600">Capacitações realizadas</div>
                  </button>
                </div>
              </div>

              {/* Relatórios Operacionais */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-[#1D3C44] mb-4 flex items-center">
                  <span className="text-2xl mr-3">🏢</span>
                  Operacional
                </h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-[#1D3C44]">Produtividade</div>
                    <div className="text-sm text-gray-600">Métricas de produtividade</div>
                  </button>
                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-[#1D3C44]">Departamentos</div>
                    <div className="text-sm text-gray-600">Análise por departamento</div>
                  </button>
                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-[#1D3C44]">Absenteísmo</div>
                    <div className="text-sm text-gray-600">Faltas e afastamentos</div>
                  </button>
                </div>
              </div>

              {/* Relatórios eSocial */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-[#1D3C44] mb-4 flex items-center">
                  <span className="text-2xl mr-3">🔄</span>
                  eSocial
                </h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-[#1D3C44]">Eventos Enviados</div>
                    <div className="text-sm text-gray-600">Status dos envios</div>
                  </button>
                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-[#1D3C44]">Pendências</div>
                    <div className="text-sm text-gray-600">Eventos pendentes</div>
                  </button>
                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-[#1D3C44]">Compliance</div>
                    <div className="text-sm text-gray-600">Status de conformidade</div>
                  </button>
                </div>
              </div>

              {/* Relatórios Personalizados */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-[#1D3C44] mb-4 flex items-center">
                  <span className="text-2xl mr-3">⚙️</span>
                  Personalizados
                </h3>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-[#1D3C44]">Criar Relatório</div>
                    <div className="text-sm text-gray-600">Construtor de relatórios</div>
                  </button>
                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-[#1D3C44]">Meus Relatórios</div>
                    <div className="text-sm text-gray-600">Relatórios salvos</div>
                  </button>
                  <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="font-medium text-[#1D3C44]">Agendamentos</div>
                    <div className="text-sm text-gray-600">Relatórios automáticos</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Estatísticas Rápidas */}
            <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-[#1D3C44] mb-4">Estatísticas Rápidas</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#00A298] mb-1">1,247</div>
                  <div className="text-sm text-gray-600">Funcionários Ativos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#00A298] mb-1">R$ 2.4M</div>
                  <div className="text-sm text-gray-600">Faturamento Anual</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#00A298] mb-1">98.5%</div>
                  <div className="text-sm text-gray-600">Compliance eSocial</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#00A298] mb-1">2.1%</div>
                  <div className="text-sm text-gray-600">Taxa de Absenteísmo</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 