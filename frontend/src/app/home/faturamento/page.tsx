'use client';

import { useRouter } from 'next/navigation';

export default function FaturamentoPage() {
  const router = useRouter();

  return (
    <div>
      {/* Conteúdo Principal */}
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#1D3C44] mb-2">Faturamento</h1>
            <p className="text-gray-600">Gestão financeira e faturamento</p>
          </div>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Faturamento Mensal</p>
                  <p className="text-2xl font-bold text-[#00A298]">R$ 125.450,00</p>
                </div>
                <div className="text-3xl">💰</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pendente</p>
                  <p className="text-2xl font-bold text-orange-500">R$ 15.230,00</p>
                </div>
                <div className="text-3xl">⏳</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Recebido</p>
                  <p className="text-2xl font-bold text-green-500">R$ 110.220,00</p>
                </div>
                <div className="text-3xl">✅</div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Em Atraso</p>
                  <p className="text-2xl font-bold text-red-500">R$ 3.450,00</p>
                </div>
                <div className="text-3xl">⚠️</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lista de Faturas */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-[#1D3C44]">Últimas Faturas</h2>
                <button className="bg-[#00A298] text-white px-4 py-2 rounded-lg hover:bg-[#00A298]/90 transition-colors">
                  Nova Fatura
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-[#1D3C44]">Fatura #001234</div>
                    <div className="text-sm text-gray-600">Cliente: Empresa ABC Ltda</div>
                    <div className="text-sm text-gray-500">Vencimento: 15/12/2024</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-[#1D3C44]">R$ 5.450,00</div>
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Pago
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-[#1D3C44]">Fatura #001235</div>
                    <div className="text-sm text-gray-600">Cliente: Construtora XYZ</div>
                    <div className="text-sm text-gray-500">Vencimento: 20/12/2024</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-[#1D3C44]">R$ 8.750,00</div>
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                      Pendente
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-medium text-[#1D3C44]">Fatura #001236</div>
                    <div className="text-sm text-gray-600">Cliente: Indústria 123</div>
                    <div className="text-sm text-gray-500">Vencimento: 25/12/2024</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-[#1D3C44]">R$ 12.300,00</div>
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      Emitida
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center">
                <button className="text-[#00A298] hover:text-[#00A298]/80 text-sm font-medium">
                  Ver todas as faturas
                </button>
              </div>
            </div>

            {/* Gráfico de Faturamento */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-[#1D3C44] mb-4">Faturamento dos Últimos 6 Meses</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Janeiro</span>
                  <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                    <div className="bg-[#00A298] h-2 rounded-full" style={{width: '85%'}}></div>
                  </div>
                  <span className="text-sm font-medium">R$ 102k</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Fevereiro</span>
                  <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                    <div className="bg-[#00A298] h-2 rounded-full" style={{width: '92%'}}></div>
                  </div>
                  <span className="text-sm font-medium">R$ 115k</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Março</span>
                  <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                    <div className="bg-[#00A298] h-2 rounded-full" style={{width: '78%'}}></div>
                  </div>
                  <span className="text-sm font-medium">R$ 98k</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Abril</span>
                  <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                    <div className="bg-[#00A298] h-2 rounded-full" style={{width: '88%'}}></div>
                  </div>
                  <span className="text-sm font-medium">R$ 110k</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Maio</span>
                  <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                    <div className="bg-[#00A298] h-2 rounded-full" style={{width: '95%'}}></div>
                  </div>
                  <span className="text-sm font-medium">R$ 119k</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Dezembro</span>
                  <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                    <div className="bg-[#00A298] h-2 rounded-full" style={{width: '100%'}}></div>
                  </div>
                  <span className="text-sm font-medium">R$ 125k</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 