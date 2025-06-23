'use client';

import { useRouter } from 'next/navigation';

export default function RelatoriosPage() {
  const router = useRouter();

  return (
    <div>
      {/* Conteúdo Principal */}
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#1D3C44] mb-2">Relatórios</h1>
            <p className="text-gray-600">Geração e análise de relatórios</p>
          </div>

          {/* Resumo de Relatórios */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Relatórios Hoje</p>
                  <p className="text-2xl font-bold text-[#00A298]">12</p>
                </div>
                <div className="text-3xl">📊</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Este Mês</p>
                  <p className="text-2xl font-bold text-blue-500">324</p>
                </div>
                <div className="text-3xl">📈</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Automáticos</p>
                  <p className="text-2xl font-bold text-green-500">156</p>
                </div>
                <div className="text-3xl">⚡</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Agendados</p>
                  <p className="text-2xl font-bold text-orange-500">28</p>
                </div>
                <div className="text-3xl">⏰</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tipos de Relatórios */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-[#1D3C44] mb-4">Gerar Relatórios</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-3">👥</span>
                    <span className="font-medium text-[#1D3C44]">Funcionários</span>
                  </div>
                  <p className="text-sm text-gray-600">Relatório detalhado de funcionários</p>
                </button>

                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-3">🏥</span>
                    <span className="font-medium text-[#1D3C44]">Exames</span>
                  </div>
                  <p className="text-sm text-gray-600">Relatório de exames médicos</p>
                </button>

                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-3">📋</span>
                    <span className="font-medium text-[#1D3C44]">ASO</span>
                  </div>
                  <p className="text-sm text-gray-600">Atestados de Saúde Ocupacional</p>
                </button>

                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-3">⚠️</span>
                    <span className="font-medium text-[#1D3C44]">Acidentes</span>
                  </div>
                  <p className="text-sm text-gray-600">Relatório de acidentes de trabalho</p>
                </button>

                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-3">📊</span>
                    <span className="font-medium text-[#1D3C44]">Indicadores</span>
                  </div>
                  <p className="text-sm text-gray-600">Relatório de indicadores de SST</p>
                </button>

                <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-3">💰</span>
                    <span className="font-medium text-[#1D3C44]">Financeiro</span>
                  </div>
                  <p className="text-sm text-gray-600">Relatório financeiro detalhado</p>
                </button>
              </div>
            </div>

            {/* Relatórios Recentes */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-[#1D3C44] mb-4">Relatórios Recentes</h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">👥</span>
                    <div>
                      <div className="font-medium text-[#1D3C44]">Relatório de Funcionários</div>
                      <div className="text-sm text-gray-600">Gerado em 15/12/2024 às 14:30</div>
                    </div>
                  </div>
                  <button className="text-[#00A298] hover:text-[#00A298]/80 text-sm font-medium">
                    Download
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🏥</span>
                    <div>
                      <div className="font-medium text-[#1D3C44]">Exames do Mês</div>
                      <div className="text-sm text-gray-600">Gerado em 14/12/2024 às 09:15</div>
                    </div>
                  </div>
                  <button className="text-[#00A298] hover:text-[#00A298]/80 text-sm font-medium">
                    Download
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">📊</span>
                    <div>
                      <div className="font-medium text-[#1D3C44]">Indicadores SST</div>
                      <div className="text-sm text-gray-600">Gerado em 13/12/2024 às 16:45</div>
                    </div>
                  </div>
                  <button className="text-[#00A298] hover:text-[#00A298]/80 text-sm font-medium">
                    Download
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">💰</span>
                    <div>
                      <div className="font-medium text-[#1D3C44]">Relatório Financeiro</div>
                      <div className="text-sm text-gray-600">Gerado em 12/12/2024 às 11:20</div>
                    </div>
                  </div>
                  <button className="text-[#00A298] hover:text-[#00A298]/80 text-sm font-medium">
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Agendamentos */}
          <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-[#1D3C44] mb-4">Agendamento de Relatórios</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-[#1D3C44]">Relatório Mensal de SST</span>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Ativo</span>
                </div>
                <p className="text-sm text-gray-600">Todo dia 1º do mês às 08:00</p>
                <p className="text-sm text-gray-500">Próximo: 01/01/2025</p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-[#1D3C44]">Indicadores Semanais</span>
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Ativo</span>
                </div>
                <p className="text-sm text-gray-600">Toda segunda-feira às 07:00</p>
                <p className="text-sm text-gray-500">Próximo: 23/12/2024</p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-[#1D3C44]">Backup de Dados</span>
                  <span className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded-full">Pausado</span>
                </div>
                <p className="text-sm text-gray-600">Diariamente às 23:00</p>
                <p className="text-sm text-gray-500">Último: 15/12/2024</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 