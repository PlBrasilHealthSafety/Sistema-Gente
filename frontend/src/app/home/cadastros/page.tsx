'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
}

export default function CadastrosPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('cards'); // 'cards' ou 'empresa'
  const [showNovaEmpresa, setShowNovaEmpresa] = useState(false);

  useEffect(() => {
    // Verificar se há token salvo
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
      <div className="pt-16">
        {/* Conteúdo Principal */}
        <main className="flex-1 p-6">
          <div className="max-w-8xl mx-auto">
            {/* Título da página */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-[#1D3C44] mb-2">
                Cadastros
              </h1>
              <p className="text-gray-600">
                Gestão de pessoas e dados
              </p>
            </div>

            {/* Abas */}
            <div className="mb-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('cards')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'cards'
                      ? 'border-[#00A298] text-[#00A298]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Módulos
                </button>
                <button
                  onClick={() => setActiveTab('empresa')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'empresa'
                      ? 'border-[#00A298] text-[#00A298]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Dados da Empresa
                </button>
              </nav>
            </div>

            {/* Conteúdo das Abas */}
            {activeTab === 'cards' && (
              /* Grid de cards */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
                  <h3 className="text-xl font-bold text-[#1D3C44] mb-4">Estrutura Organizacional</h3>
                  <div className="space-y-3">
                    <div className="bg-[#00A298]/10 rounded-lg p-4">
                      <div className="text-2xl font-bold text-[#00A298]">🏗️</div>
                      <div className="text-sm text-gray-600 mt-2">Grupos, Regiões e Empresas</div>
                    </div>
                    <button
                      onClick={() => router.push('/home/cadastros/estrutura-organizacional')}
                      className="w-full bg-[#00A298] text-white py-2 rounded-lg hover:bg-[#1D3C44] transition-all duration-200 transform hover:scale-102 hover:shadow-lg cursor-pointer"
                    >
                      Acessar
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
                  <h3 className="text-xl font-bold text-[#1D3C44] mb-4">Tabelas Básicas</h3>
                  <div className="space-y-3">
                    <div className="bg-[#00A298]/10 rounded-lg p-4">
                      <div className="text-2xl font-bold text-[#00A298]">📋</div>
                      <div className="text-sm text-gray-600 mt-2">Cadastros fundamentais</div>
                    </div>
                    <button 
                      onClick={() => router.push('/home/cadastros/tabelas-basicas')}
                      className="w-full bg-[#00A298] text-white py-2 rounded-lg hover:bg-[#1D3C44] transition-all duration-200 transform hover:scale-102 hover:shadow-lg cursor-pointer"
                    >
                      Acessar
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300">
                  <h3 className="text-xl font-bold text-[#1D3C44] mb-4">Funcionários</h3>
                  <div className="space-y-3">
                    <div className="bg-[#00A298]/10 rounded-lg p-4">
                      <div className="text-2xl font-bold text-[#00A298]">👥</div>
                      <div className="text-sm text-gray-600 mt-2">Cadastrar novos funcionários</div>
                    </div>
                    <button 
                      onClick={() => router.push('/home/funcionarios')}
                      className="w-full bg-[#00A298] text-white py-2 rounded-lg hover:bg-[#1D3C44] transition-all duration-200 transform hover:scale-102 hover:shadow-lg cursor-pointer"
                    >
                      Acessar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Formulário de Dados da Empresa */}
            {activeTab === 'empresa' && (
              <div className="bg-white rounded-xl shadow-lg p-8">
                {/* Cabeçalho com botão Nova Empresa */}
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-[#1D3C44]">Cadastro de Empresa</h2>
                  <button 
                    onClick={() => {
                      console.log('Botão clicado! Estado atual:', showNovaEmpresa);
                      setShowNovaEmpresa(!showNovaEmpresa);
                    }}
                    className="bg-[#00A298] hover:bg-[#1D3C44] text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    {showNovaEmpresa ? 'OCULTAR FORMULÁRIO' : 'NOVA EMPRESA'}
                  </button>
                </div>

                {/* Debug - Estado atual */}
                <div className="mb-2 text-xs text-gray-500">
                  Debug: showNovaEmpresa = {showNovaEmpresa.toString()}
                </div>

                {/* Formulário Nova Empresa */}
                {showNovaEmpresa ? (
                  <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-6" style={{display: 'block', visibility: 'visible'}}>
                    <h3 className="text-lg font-bold text-[#1D3C44] mb-6 flex items-center">
                      <span className="bg-[#00A298] text-white px-2 py-1 rounded mr-2 text-sm">NOVO</span>
                      Formulário de Cadastro de Empresa
                    </h3>

                    <div className="space-y-6">
                      {/* Estabelecimento */}
                      <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <h4 className="text-md font-semibold text-[#1D3C44] mb-4 border-b border-gray-200 pb-2">Estabelecimento</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                            <div className="flex space-x-4">
                              <label className="flex items-center">
                                <input type="radio" name="novoTipo" value="matriz" className="mr-2 text-[#00A298] focus:ring-[#00A298]" defaultChecked />
                                <span className="text-sm">Matriz</span>
                              </label>
                              <label className="flex items-center">
                                <input type="radio" name="novoTipo" value="filial" className="mr-2 text-[#00A298] focus:ring-[#00A298]" />
                                <span className="text-sm">Filial</span>
                              </label>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Tipo de Inscrição <span className="text-blue-600 text-xs">eSocial</span>
                            </label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent text-sm">
                              <option value="">Selecione...</option>
                              <option value="1">CNPJ</option>
                              <option value="2">CPF</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Número de Inscrição <span className="text-blue-600 text-xs">eSocial</span>
                            </label>
                            <input 
                              type="text" 
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent text-sm"
                              placeholder="00.000.000/0000-00"
                            />
                          </div>
                        </div>
                        <div className="mt-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">CNO</label>
                          <input 
                            type="text" 
                            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent text-sm"
                          />
                        </div>
                      </div>

                      {/* Dados Cadastrais */}
                      <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <h4 className="text-md font-semibold text-[#1D3C44] mb-4 border-b border-gray-200 pb-2">Dados cadastrais</h4>
                        
                        {/* Primeira linha: Código + Grupo/Região */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Código</label>
                            <input 
                              type="text" 
                              value="AUTOMÁTICO"
                              disabled
                              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Grupo / Região</label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00A298] focus:border-transparent text-sm">
                              <option value="">Selecione um grupo/região...</option>
                              <option value="1">Região Sul</option>
                              <option value="2">Região Sudeste</option>
                              <option value="3">Região Centro-Oeste</option>
                            </select>
                          </div>
                        </div>

                        {/* Segunda linha: Razão Social (largura total) */}
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Razão Social</label>
                          <input 
                            type="text" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00A298] focus:border-transparent text-sm"
                            placeholder="Digite a razão social da empresa"
                          />
                        </div>

                        {/* Terceira linha: Nome Fantasia + Inscrição Estadual + Inscrição Municipal */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nome Fantasia</label>
                            <input 
                              type="text" 
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00A298] focus:border-transparent text-sm"
                              placeholder="Digite o nome fantasia"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Inscrição Estadual</label>
                            <input 
                              type="text" 
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00A298] focus:border-transparent text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Inscrição Municipal</label>
                            <input 
                              type="text" 
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00A298] focus:border-transparent text-sm"
                            />
                          </div>
                        </div>

                        {/* Quarta linha: CNAE e Descrição (mais largo) + Risco (mais estreito) */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">CNAE e Descrição</label>
                            <input 
                              type="text" 
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00A298] focus:border-transparent text-sm"
                              placeholder="Digite o CNAE e descrição"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Risco</label>
                            <input 
                              type="text" 
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#00A298] focus:border-transparent text-sm"
                            />
                          </div>
                        </div>

                        {/* Quinta linha: Classificação Porte */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Classificação Porte</label>
                          <div className="flex space-x-6">
                            <label className="flex items-center">
                              <input type="radio" name="novoPorte" value="me" className="mr-2 text-[#00A298] focus:ring-[#00A298]" />
                              <span className="text-sm">ME</span>
                            </label>
                            <label className="flex items-center">
                              <input type="radio" name="novoPorte" value="epp" className="mr-2 text-[#00A298] focus:ring-[#00A298]" />
                              <span className="text-sm">EPP</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Representante Legal */}
                      <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <h4 className="text-md font-semibold text-[#1D3C44] mb-4 border-b border-gray-200 pb-2">Representante legal</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nome do representante legal</label>
                            <input 
                              type="text" 
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">CPF</label>
                            <input 
                              type="text" 
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent text-sm"
                              placeholder="000.000.000-00"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Assinatura digital</label>
                          <div className="flex flex-col md:flex-row items-start md:items-center space-y-3 md:space-y-0 md:space-x-4">
                            <div className="flex-1">
                              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center bg-gray-50">
                                <p className="text-sm text-gray-500 mb-2">A imagem deve ter tamanho de 8,5cm x 3cm</p>
                                <button className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm">
                                  Browse...
                                </button>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm">
                                INCLUIR ASSINATURA
                              </button>
                              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
                                EXCLUIR ASSINATURA
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Botões de Ação do Nova Empresa */}
                      <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                        <button 
                          onClick={() => setShowNovaEmpresa(false)}
                          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button className="px-6 py-2 bg-[#00A298] text-white rounded-lg hover:bg-[#00A298]/90 transition-colors">
                          Salvar Nova Empresa
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Abas do eSocial */}
                <div className="mb-6">
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8">
                      <button className="py-2 px-1 border-b-2 border-[#00A298] text-[#00A298] font-medium text-sm">
                        Dados da Empresa
                      </button>
                      <button className="py-2 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">
                        eSocial
                      </button>
                    </nav>
                  </div>
                </div>

                {/* Seções do Formulário */}
                <div className="space-y-8">
                  {/* Estabelecimento */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-[#1D3C44] mb-4">Estabelecimento</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                        <div className="flex space-x-4">
                          <label className="flex items-center">
                            <input type="radio" name="tipo" value="matriz" className="mr-2" defaultChecked />
                            <span className="text-sm">Matriz</span>
                          </label>
                          <label className="flex items-center">
                            <input type="radio" name="tipo" value="filial" className="mr-2" />
                            <span className="text-sm">Filial</span>
                          </label>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo de Inscrição <span className="text-blue-500 text-xs">Obrigatório</span>
                        </label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent">
                          <option value="">Selecione...</option>
                          <option value="1">CNPJ</option>
                          <option value="2">CPF</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Número de Inscrição <span className="text-blue-500 text-xs">Obrigatório</span>
                        </label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                          placeholder="00.000.000/0000-00"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">CNO</label>
                      <input 
                        type="text" 
                        className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Dados Cadastrais */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-[#1D3C44] mb-4">Dados cadastrais</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Código</label>
                        <input 
                          type="text" 
                          value="AUTOMÁTICO"
                          disabled
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Grupo / Região</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent">
                          <option value="">Selecione um grupo/região...</option>
                          <option value="1">Região Sul</option>
                          <option value="2">Região Sudeste</option>
                          <option value="3">Região Centro-Oeste</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Razão Social</label>
                      <textarea 
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                        placeholder="Digite a razão social da empresa"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nome Fantasia</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                          placeholder="Digite o nome fantasia"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Inscrição Estadual</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Inscrição Municipal</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CNAE e Descrição</label>
                        <textarea 
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Risco</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Classificação Porte</label>
                      <div className="flex space-x-6">
                        <label className="flex items-center">
                          <input type="radio" name="porte" value="me" className="mr-2" />
                          <span className="text-sm">ME</span>
                        </label>
                        <label className="flex items-center">
                          <input type="radio" name="porte" value="epp" className="mr-2" />
                          <span className="text-sm">EPP</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Representante Legal */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-[#1D3C44] mb-4">Representante legal</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nome do representante legal</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CPF</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                          placeholder="000.000.000-00"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Assinatura digital</label>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                            <p className="text-sm text-gray-500">A imagem deve ter tamanho de 8,5cm x 3cm</p>
                            <button className="mt-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                              Browse...
                            </button>
                          </div>
                        </div>
                        <div className="space-x-2">
                          <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                            INCLUIR ASSINATURA
                          </button>
                          <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                            EXCLUIR ASSINATURA
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Informações de Contato */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-[#1D3C44] mb-4">Informações de contato</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">CEP</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                          placeholder="00000-000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de logradouro</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent">
                          <option value="">Selecione...</option>
                          <option value="rua">Rua</option>
                          <option value="avenida">Avenida</option>
                          <option value="alameda">Alameda</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Logradouro</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Número</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Complemento</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">UF</label>
                        <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent">
                          <option value="">Selecione...</option>
                          <option value="SP">SP</option>
                          <option value="RJ">RJ</option>
                          <option value="MG">MG</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cidade</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Bairro</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                        />
                      </div>
                      <div></div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Contato</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Telefone</label>
                        <input 
                          type="text" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">E-mail</label>
                        <input 
                          type="email" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Alertas da Empresa */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-[#1D3C44] mb-4">Alertas da Empresa</h3>
                    <div className="bg-white p-4 rounded-lg border">
                      <p className="text-sm text-gray-600">Nenhum alerta configurado para esta empresa.</p>
                    </div>
                  </div>

                  {/* Informações adicionais */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-[#1D3C44] mb-4">Informações adicionais</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Observação</label>
                        <textarea 
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                          placeholder="Digite observações gerais sobre a empresa..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Observação para Ordem de Serviço</label>
                        <textarea 
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                          placeholder="Digite observações específicas para ordens de serviço..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                      Cancelar
                    </button>
                    <button className="px-6 py-2 bg-[#00A298] text-white rounded-lg hover:bg-[#00A298]/90 transition-colors">
                      Salvar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
} 