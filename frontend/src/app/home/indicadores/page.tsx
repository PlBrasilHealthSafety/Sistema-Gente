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

export default function IndicadoresPage() {
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
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-[#1D3C44] mb-2">Indicadores</h1>
              <p className="text-gray-600">Métricas e KPIs do sistema</p>
            </div>

            {/* Resumo Executivo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Funcionários Ativos</p>
                    <p className="text-3xl font-bold">1,247</p>
                    <p className="text-blue-100 text-xs">+12 este mês</p>
                  </div>
                  <div className="text-3xl opacity-80">👥</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Taxa de Satisfação</p>
                    <p className="text-3xl font-bold">94.2%</p>
                    <p className="text-green-100 text-xs">+2.1% vs mês anterior</p>
                  </div>
                  <div className="text-3xl opacity-80">😊</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Taxa de Absenteísmo</p>
                    <p className="text-3xl font-bold">2.1%</p>
                    <p className="text-orange-100 text-xs">-0.3% vs mês anterior</p>
                  </div>
                  <div className="text-3xl opacity-80">📊</div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Produtividade</p>
                    <p className="text-3xl font-bold">87.5%</p>
                    <p className="text-purple-100 text-xs">+5.2% vs mês anterior</p>
                  </div>
                  <div className="text-3xl opacity-80">🚀</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Indicadores de RH */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-[#1D3C44] mb-6">Indicadores de RH</h2>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Turnover</span>
                      <span className="text-sm font-bold text-[#1D3C44]">3.2%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '32%'}}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Meta: ≤ 5%</div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Tempo Médio de Contratação</span>
                      <span className="text-sm font-bold text-[#1D3C44]">18 dias</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{width: '72%'}}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Meta: ≤ 25 dias</div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Índice de Capacitação</span>
                      <span className="text-sm font-bold text-[#1D3C44]">92.8%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '92.8%'}}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Meta: ≥ 90%</div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Avaliação de Desempenho</span>
                      <span className="text-sm font-bold text-[#1D3C44]">4.3/5.0</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '86%'}}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Meta: ≥ 4.0</div>
                  </div>
                </div>
              </div>

              {/* Indicadores Financeiros */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-[#1D3C44] mb-6">Indicadores Financeiros</h2>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Margem de Lucro</span>
                      <span className="text-sm font-bold text-[#1D3C44]">28.5%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '85.5%'}}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Meta: ≥ 25%</div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Inadimplência</span>
                      <span className="text-sm font-bold text-[#1D3C44]">1.2%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '24%'}}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Meta: ≤ 3%</div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Crescimento da Receita</span>
                      <span className="text-sm font-bold text-[#1D3C44]">15.8%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '79%'}}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Meta: ≥ 12%</div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">ROI</span>
                      <span className="text-sm font-bold text-[#1D3C44]">22.3%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '89.2%'}}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Meta: ≥ 18%</div>
                  </div>
                </div>
              </div>

              {/* Indicadores de SST */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-[#1D3C44] mb-6">Indicadores de SST</h2>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Taxa de Acidentes</span>
                      <span className="text-sm font-bold text-[#1D3C44]">0.8%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '16%'}}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Meta: ≤ 2%</div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Exames em Dia</span>
                      <span className="text-sm font-bold text-[#1D3C44]">96.2%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '96.2%'}}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Meta: ≥ 95%</div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Treinamentos Concluídos</span>
                      <span className="text-sm font-bold text-[#1D3C44]">89.5%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{width: '89.5%'}}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Meta: ≥ 95%</div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Conformidade SESMT</span>
                      <span className="text-sm font-bold text-[#1D3C44]">98.7%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '98.7%'}}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Meta: ≥ 95%</div>
                  </div>
                </div>
              </div>

              {/* Indicadores Operacionais */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-[#1D3C44] mb-6">Indicadores Operacionais</h2>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Eficiência Operacional</span>
                      <span className="text-sm font-bold text-[#1D3C44]">87.3%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: '87.3%'}}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Meta: ≥ 85%</div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Tempo Médio de Resposta</span>
                      <span className="text-sm font-bold text-[#1D3C44]">2.3h</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '77%'}}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Meta: ≤ 4h</div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">SLA Cumprido</span>
                      <span className="text-sm font-bold text-[#1D3C44]">94.8%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '94.8%'}}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Meta: ≥ 90%</div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Satisfação do Cliente</span>
                      <span className="text-sm font-bold text-[#1D3C44]">4.6/5.0</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: '92%'}}></div>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">Meta: ≥ 4.0</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tendências */}
            <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-[#1D3C44] mb-6">Tendências dos Últimos 6 Meses</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl mb-2">📈</div>
                  <div className="text-lg font-semibold text-green-700">Crescimento</div>
                  <div className="text-sm text-gray-600">Produtividade +12%</div>
                  <div className="text-sm text-gray-600">Satisfação +8%</div>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl mb-2">🎯</div>
                  <div className="text-lg font-semibold text-blue-700">Estável</div>
                  <div className="text-sm text-gray-600">Turnover mantido</div>
                  <div className="text-sm text-gray-600">SST em conformidade</div>
                </div>
                
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl mb-2">⚠️</div>
                  <div className="text-lg font-semibold text-orange-700">Atenção</div>
                  <div className="text-sm text-gray-600">Absenteísmo em alta</div>
                  <div className="text-sm text-gray-600">Treinamentos atrasados</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 