'use client';

import { useRouter } from 'next/navigation';

export default function ESocialPage() {
  const router = useRouter();

  return (
    <div>
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
  );
} 