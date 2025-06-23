'use client';

import { useRouter } from 'next/navigation';

export default function SSTPage() {
  const router = useRouter();

  return (
    <div>


        {/* Conteúdo Principal */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-[#1D3C44] mb-2">SST</h1>
              <p className="text-gray-600">Segurança e Saúde do Trabalho</p>
            </div>

            {/* Cards de Status */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Exames em Dia</p>
                    <p className="text-2xl font-bold text-green-500">96.2%</p>
                  </div>
                  <div className="text-3xl">✅</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pendentes</p>
                    <p className="text-2xl font-bold text-orange-500">47</p>
                  </div>
                  <div className="text-3xl">⏳</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Acidentes</p>
                    <p className="text-2xl font-bold text-red-500">3</p>
                  </div>
                  <div className="text-3xl">⚠️</div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Treinamentos</p>
                    <p className="text-2xl font-bold text-blue-500">89.5%</p>
                  </div>
                  <div className="text-3xl">🎓</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Exames Médicos */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-[#1D3C44]">Exames Médicos</h2>
                  <button className="bg-[#00A298] text-white px-4 py-2 rounded-lg hover:bg-[#00A298]/90 transition-colors">
                    Agendar Exame
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium text-[#1D3C44]">João Silva Santos</div>
                      <div className="text-sm text-gray-600">Exame Admissional</div>
                      <div className="text-sm text-gray-500">Agendado: 15/12/2024</div>
                    </div>
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      Agendado
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium text-[#1D3C44]">Maria Oliveira</div>
                      <div className="text-sm text-gray-600">Exame Periódico</div>
                      <div className="text-sm text-gray-500">Vencimento: 20/12/2024</div>
                    </div>
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                      Pendente
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div>
                      <div className="font-medium text-[#1D3C44]">Carlos Pereira</div>
                      <div className="text-sm text-gray-600">Exame de Retorno</div>
                      <div className="text-sm text-gray-500">Realizado: 10/12/2024</div>
                    </div>
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Concluído
                    </span>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <button className="text-[#00A298] hover:text-[#00A298]/80 text-sm font-medium">
                    Ver todos os exames
                  </button>
                </div>
              </div>

              {/* Documentos SST */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-[#1D3C44] mb-4">Documentos e Certificações</h2>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">📄</span>
                      <div>
                        <div className="font-medium text-[#1D3C44]">PCMSO</div>
                        <div className="text-sm text-gray-600">Programa de Controle Médico</div>
                      </div>
                    </div>
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Válido
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">📋</span>
                      <div>
                        <div className="font-medium text-[#1D3C44]">PPRA</div>
                        <div className="text-sm text-gray-600">Programa de Prevenção de Riscos</div>
                      </div>
                    </div>
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                      Vence em 30 dias
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">🏆</span>
                      <div>
                        <div className="font-medium text-[#1D3C44]">ISO 45001</div>
                        <div className="text-sm text-gray-600">Sistema de Gestão de SST</div>
                      </div>
                    </div>
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Certificado
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-[#1D3C44] mb-4">Ações Rápidas</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="text-3xl mb-2">📊</div>
                  <span className="font-medium text-[#1D3C44]">Relatório de Acidentes</span>
                </button>
                
                <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="text-3xl mb-2">🎓</div>
                  <span className="font-medium text-[#1D3C44]">Agendar Treinamento</span>
                </button>
                
                <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="text-3xl mb-2">🔍</div>
                  <span className="font-medium text-[#1D3C44]">Inspeção de Segurança</span>
                </button>
                
                <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="text-3xl mb-2">📋</div>
                  <span className="font-medium text-[#1D3C44]">Checklist de EPI</span>
                </button>
              </div>
            </div>
          </div>
        </main>
    </div>
  );
} 