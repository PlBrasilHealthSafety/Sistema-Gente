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

export default function EstruturaOrganizacionalPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('grupos');
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showNewRegionModal, setShowNewRegionModal] = useState(false);
  const [showNewCompanyModal, setShowNewCompanyModal] = useState(false);

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
            <button 
              onClick={() => router.push('/home/cadastros')}
              className="hover:text-[#00A298] transition-colors"
            >
              Cadastros
            </button>
            <span>›</span>
            <span className="text-[#00A298] font-medium">Estrutura Organizacional</span>
          </nav>
        </div>

        {/* Conteúdo Principal */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Título da página */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-[#1D3C44] mb-2">
                Estrutura Organizacional
              </h1>
              <p className="text-gray-600">
                Cadastro de Grupos, Regiões e Empresas
              </p>
            </div>

            {/* Tabs para alternar entre Grupos, Regiões e Empresas */}
            <div className="bg-white rounded-2xl shadow-xl">
              {/* Header com tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('grupos')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 transform hover:scale-102 cursor-pointer ${
                      activeTab === 'grupos'
                        ? 'border-[#00A298] text-[#00A298]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    👥 Grupos
                  </button>
                  <button
                    onClick={() => setActiveTab('regioes')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 transform hover:scale-102 cursor-pointer ${
                      activeTab === 'regioes'
                        ? 'border-[#00A298] text-[#00A298]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    🗺️ Regiões
                  </button>
                  <button
                    onClick={() => setActiveTab('empresas')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 transform hover:scale-102 cursor-pointer ${
                      activeTab === 'empresas'
                        ? 'border-[#00A298] text-[#00A298]'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    🏢 Empresas
                  </button>
                </nav>
              </div>

              {/* Conteúdo da tab ativa */}
              <div className="p-6">
                {/* Formulário de busca */}
                <div className="mb-6">
                  <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-64">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pesquisar por
                      </label>
                      <div className="flex gap-2">
                        <select className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent">
                          <option value="nome">
                            {activeTab === 'empresas' ? 'Nome Fantasia' : 'Nome'}
                          </option>
                          {activeTab === 'empresas' && (
                            <>
                              <option value="cnpj">CNPJ</option>
                              <option value="razao">Razão Social</option>
                              <option value="codigo">Código</option>
                            </>
                          )}
                        </select>
                        <input
                          type="text"
                          placeholder={`Digite o ${activeTab === 'empresas' ? 'nome fantasia' : 'nome'} para buscar...`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Situação
                      </label>
                      <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent">
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                        <option value="todos">Todos</option>
                      </select>
                    </div>

                    <button 
                      onClick={() => window.location.reload()}
                      className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                    >
                      PROCURAR
                    </button>
                    
                    <button 
                      onClick={() => {
                        if (activeTab === 'grupos') {
                          setShowNewGroupModal(true);
                        } else if (activeTab === 'regioes') {
                          setShowNewRegionModal(true);
                        } else if (activeTab === 'empresas') {
                          setShowNewCompanyModal(true);
                        }
                      }}
                      className="bg-[#00A298] hover:bg-[#1D3C44] text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                    >
                      {activeTab === 'grupos' && 'NOVO GRUPO'}
                      {activeTab === 'regioes' && 'NOVA REGIÃO'}
                      {activeTab === 'empresas' && 'NOVA EMPRESA'}
                    </button>
                  </div>
                </div>

                {/* Container de Novo Cadastro - Grupos */}
                {showNewGroupModal && activeTab === 'grupos' && (
                  <div className="mb-6 bg-gray-50 rounded-lg p-6 border-2 border-[#00A298]/20">
                    <h3 className="text-lg font-bold text-[#1D3C44] mb-4">Cadastro de Grupos</h3>
                    
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h4 className="text-sm font-medium text-gray-700 mb-4">Dados cadastrais</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nome
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                            placeholder="Digite o nome do grupo"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Situação
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent">
                            <option value="ativo">Ativo</option>
                            <option value="inativo">Inativo</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer">
                          INCLUIR
                        </button>
                        <button className="bg-blue-400 hover:bg-blue-500 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer">
                          LIMPAR
                        </button>
                        <button
                          onClick={() => setShowNewGroupModal(false)}
                          className="bg-gray-400 hover:bg-gray-500 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                        >
                          RETORNAR
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Container de Novo Cadastro - Regiões */}
                {showNewRegionModal && activeTab === 'regioes' && (
                  <div className="mb-6 bg-gray-50 rounded-lg p-6 border-2 border-[#00A298]/20">
                    <h3 className="text-lg font-bold text-[#1D3C44] mb-4">Cadastro de Regiões</h3>
                    
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h4 className="text-sm font-medium text-gray-700 mb-4">Dados cadastrais</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nome
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                            placeholder="Digite o nome da região"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Grupo
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent">
                            <option value="">Selecione um grupo</option>
                            <option value="grupo-teste">Grupo Teste</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Situação
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent">
                            <option value="ativo">Ativo</option>
                            <option value="inativo">Inativo</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer">
                          INCLUIR
                        </button>
                        <button className="bg-blue-400 hover:bg-blue-500 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer">
                          LIMPAR
                        </button>
                        <button
                          onClick={() => setShowNewRegionModal(false)}
                          className="bg-gray-400 hover:bg-gray-500 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                        >
                          RETORNAR
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Container de Novo Cadastro - Empresas */}
                {showNewCompanyModal && activeTab === 'empresas' && (
                  <div className="mb-6 bg-gray-50 rounded-lg p-6 border-2 border-[#00A298]/20">
                    <h3 className="text-lg font-bold text-[#1D3C44] mb-4">Cadastro de Empresas</h3>
                    
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <h4 className="text-sm font-medium text-gray-700 mb-4">Dados cadastrais</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CNPJ
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                            placeholder="00.000.000/0001-00"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Razão Social
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                            placeholder="Digite a razão social"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nome Fantasia
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                            placeholder="Digite o nome fantasia"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Código
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                            placeholder="Digite o código"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Grupo
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent">
                            <option value="">Selecione um grupo</option>
                            <option value="grupo-teste">Grupo Teste</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Região
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent">
                            <option value="">Selecione uma região</option>
                            <option value="regiao-teste">Região Teste</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Situação
                          </label>
                          <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent">
                            <option value="ativo">Ativo</option>
                            <option value="inativo">Inativo</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-6">
                        <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer">
                          INCLUIR
                        </button>
                        <button className="bg-blue-400 hover:bg-blue-500 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer">
                          LIMPAR
                        </button>
                        <button
                          onClick={() => setShowNewCompanyModal(false)}
                          className="bg-gray-400 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                        >
                          RETORNAR
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tabela de resultados */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        {activeTab === 'grupos' && (
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nome</th>
                        )}
                        
                        {activeTab === 'regioes' && (
                          <>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nome</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Grupo</th>
                          </>
                        )}
                        
                        {activeTab === 'empresas' && (
                          <>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">CNPJ</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Razão Social</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nome Fantasia</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Código</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Grupo</th>
                            <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Região</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td 
                          colSpan={
                            activeTab === 'grupos' ? 1 : 
                            activeTab === 'regioes' ? 2 : 6
                          } 
                          className="px-4 py-8 text-center text-gray-500"
                        >
                          Não existem dados para mostrar
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 