'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function EstruturaOrganizacionalPage() {
  const router = useRouter();
  
  // States para armazenar os totais
  const [totalGrupos, setTotalGrupos] = useState(0);
  const [totalRegioes, setTotalRegioes] = useState(0);
  const [totalEmpresas, setTotalEmpresas] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Função para buscar total de grupos
  const buscarTotalGrupos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/grupos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        const validData = Array.isArray(data) ? data : [];
        setTotalGrupos(validData.length);
      } else {
        console.error('Erro ao buscar grupos:', response.status);
        setTotalGrupos(0);
      }
    } catch (error) {
      console.error('Erro ao buscar grupos:', error);
      setTotalGrupos(0);
    }
  };

  // Função para buscar total de regiões
  const buscarTotalRegioes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/regioes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        const validData = Array.isArray(data) ? data : [];
        setTotalRegioes(validData.length);
      } else {
        console.error('Erro ao buscar regiões:', response.status);
        setTotalRegioes(0);
      }
    } catch (error) {
      console.error('Erro ao buscar regiões:', error);
      setTotalRegioes(0);
    }
  };

  // Função para buscar total de empresas
  const buscarTotalEmpresas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/empresas', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        const validData = Array.isArray(data) ? data : [];
        setTotalEmpresas(validData.length);
      } else {
        console.error('Erro ao buscar empresas:', response.status);
        setTotalEmpresas(0);
      }
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
      setTotalEmpresas(0);
    }
  };

  // Função para carregar todos os totais
  const carregarTotais = async () => {
    setIsLoading(true);
    await Promise.all([
      buscarTotalGrupos(),
      buscarTotalRegioes(),
      buscarTotalEmpresas()
    ]);
    setIsLoading(false);
  };

  // useEffect para carregar os dados quando a página é montada
  useEffect(() => {
    carregarTotais();
  }, []);

  return (
    <div>
        {/* Conteúdo Principal */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumb e Navegação */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                <span className="text-[#00A298] font-medium">Estrutura Organizacional</span>
              </div>
              
              <h1 className="text-3xl font-bold text-[#1D3C44] mb-2">
                Estrutura Organizacional
              </h1>
              <p className="text-gray-600">
                Gerencie a estrutura da sua organização: grupos, regiões e empresas
              </p>
            </div>

            {/* Cards de Navegação */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card Grupos */}
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-200 border border-gray-100 hover:border-[#00A298]/20 flex flex-col">
                <div className="text-center flex-1 flex flex-col">
                  <div className="text-5xl mb-4 opacity-80">👥</div>
                  <h3 className="text-xl font-semibold text-[#1D3C44] mb-3">Grupos</h3>
                  <p className="text-gray-600 mb-6 text-sm flex-1">
                    Cadastre e gerencie os grupos da sua organização.
                  </p>
                  <button
                    onClick={() => router.push('/home/cadastros/estrutura-organizacional/grupos')}
                    className="w-full bg-[#00A298] hover:bg-[#1D3C44] text-white px-6 py-2.5 rounded-md font-medium transition-colors duration-200 cursor-pointer mt-auto"
                  >
                    Acessar Grupos
                  </button>
                </div>
              </div>

              {/* Card Regiões */}
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-200 border border-gray-100 hover:border-[#00A298]/20 flex flex-col">
                <div className="text-center flex-1 flex flex-col">
                  <div className="text-5xl mb-4 opacity-80">🗺️</div>
                  <h3 className="text-xl font-semibold text-[#1D3C44] mb-3">Regiões</h3>
                  <p className="text-gray-600 mb-6 text-sm flex-1">
                    Cadastre e gerencie as regiões vinculadas aos grupos da sua organização.
                  </p>
                  <button
                    onClick={() => router.push('/home/cadastros/estrutura-organizacional/regioes')}
                    className="w-full bg-[#00A298] hover:bg-[#1D3C44] text-white px-6 py-2.5 rounded-md font-medium transition-colors duration-200 cursor-pointer mt-auto"
                  >
                    Acessar Regiões
                  </button>
                </div>
              </div>

              {/* Card Empresas */}
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-200 border border-gray-100 hover:border-[#00A298]/20 flex flex-col">
                <div className="text-center flex-1 flex flex-col">
                  <div className="text-5xl mb-4 opacity-80">🏢</div>
                  <h3 className="text-xl font-semibold text-[#1D3C44] mb-3">Empresas</h3>
                  <p className="text-gray-600 mb-6 text-sm flex-1">
                    Cadastre e gerencie as empresas vinculadas aos grupos e regiões da sua organização.
                  </p>
                  <button
                    onClick={() => router.push('/home/cadastros/estrutura-organizacional/empresas')}
                    className="w-full bg-[#00A298] hover:bg-[#1D3C44] text-white px-6 py-2.5 rounded-md font-medium transition-colors duration-200 cursor-pointer mt-auto"
                  >
                    Acessar Empresas
                  </button>
                </div>
              </div>
            </div>

            {/* Seção de Resumo/Estatísticas */}
            <div className="mt-8 bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#1D3C44]">Resumo da Estrutura</h3>
                <button
                  onClick={carregarTotais}
                  disabled={isLoading}
                  className="bg-[#00A298] hover:bg-[#1D3C44] text-white px-4 py-2 rounded-md font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isLoading ? 'Carregando...' : 'Atualizar'}
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 font-medium text-sm">Total de Grupos</p>
                      <p className="text-xl font-semibold text-blue-800">
                        {isLoading ? '...' : totalGrupos}
                      </p>
                    </div>
                    <div className="text-blue-500 text-lg opacity-70">👥</div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-md border border-green-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 font-medium text-sm">Total de Regiões</p>
                      <p className="text-xl font-semibold text-green-800">
                        {isLoading ? '...' : totalRegioes}
                      </p>
                    </div>
                    <div className="text-green-500 text-lg opacity-70">🗺️</div>
                  </div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-md border border-purple-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 font-medium text-sm">Total de Empresas</p>
                      <p className="text-xl font-semibold text-purple-800">
                        {isLoading ? '...' : totalEmpresas}
                      </p>
                    </div>
                    <div className="text-purple-500 text-lg opacity-70">🏢</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Instruções */}
            <div className="mt-8 bg-[#00A298]/5 rounded-xl p-6 border border-[#00A298]/15">
              <h3 className="text-lg font-semibold text-[#1D3C44] mb-3">Como usar a Estrutura Organizacional</h3>
              <div className="space-y-2 text-gray-700 text-sm">
                <p><span className="text-base">📋</span> <strong>1. Grupos:</strong> Comece criando os grupos principais da sua organização.</p>
                <p><span className="text-base">📍</span> <strong>2. Regiões:</strong> Crie regiões e associe-as aos grupos correspondentes.</p>
                <p><span className="text-base">🏢</span> <strong>3. Empresas:</strong> Cadastre as empresas vinculando-as aos grupos e regiões.</p>
                <p><span className="text-base">✅</span> Esta hierarquia garante uma organização estruturada dos seus dados</p>
              </div>
            </div>
          </div>
        </main>
    </div>
  );
} 