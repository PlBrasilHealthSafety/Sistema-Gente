'use client';

import { useRouter } from 'next/navigation';

export default function IndicadoresPage() {
  const router = useRouter();

  return (
    <div>
      {/* Conteúdo Principal */}
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#1D3C44] mb-2">Indicadores</h1>
            <p className="text-gray-600">Métricas e indicadores de performance</p>
          </div>

          {/* Cards de Indicadores */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Produtividade</p>
                  <p className="text-2xl font-bold text-[#00A298]">87.5%</p>
                </div>
                <div className="text-3xl">📈</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Eficiência</p>
                  <p className="text-2xl font-bold text-blue-500">92.1%</p>
                </div>
                <div className="text-3xl">⚡</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Satisfação</p>
                  <p className="text-2xl font-bold text-green-500">94.8%</p>
                </div>
                <div className="text-3xl">😊</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">ROI</p>
                  <p className="text-2xl font-bold text-purple-500">15.7%</p>
                </div>
                <div className="text-3xl">💎</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Performance */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-[#1D3C44] mb-4">Performance Mensal</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Janeiro</span>
                  <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                    <div className="bg-[#00A298] h-2 rounded-full" style={{width: '85%'}}></div>
                  </div>
                  <span className="text-sm font-medium">85%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Fevereiro</span>
                  <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                    <div className="bg-[#00A298] h-2 rounded-full" style={{width: '92%'}}></div>
                  </div>
                  <span className="text-sm font-medium">92%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Março</span>
                  <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                    <div className="bg-[#00A298] h-2 rounded-full" style={{width: '78%'}}></div>
                  </div>
                  <span className="text-sm font-medium">78%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Abril</span>
                  <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                    <div className="bg-[#00A298] h-2 rounded-full" style={{width: '89%'}}></div>
                  </div>
                  <span className="text-sm font-medium">89%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Maio</span>
                  <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                    <div className="bg-[#00A298] h-2 rounded-full" style={{width: '94%'}}></div>
                  </div>
                  <span className="text-sm font-medium">94%</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Junho</span>
                  <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                    <div className="bg-[#00A298] h-2 rounded-full" style={{width: '87%'}}></div>
                  </div>
                  <span className="text-sm font-medium">87%</span>
                </div>
              </div>
            </div>

            {/* Metas e Objetivos */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-[#1D3C44] mb-4">Metas e Objetivos</h2>
              
              <div className="space-y-4">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-[#1D3C44]">Produtividade Anual</span>
                    <span className="text-sm text-gray-500">87% / 90%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{width: '96%'}}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Faltam 3% para a meta</p>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-[#1D3C44]">Satisfação do Cliente</span>
                    <span className="text-sm text-gray-500">94% / 95%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '99%'}}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Falta 1% para a meta</p>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-[#1D3C44]">ROI Trimestral</span>
                    <span className="text-sm text-gray-500">15.7% / 18%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '87%'}}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Faltam 2.3% para a meta</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 