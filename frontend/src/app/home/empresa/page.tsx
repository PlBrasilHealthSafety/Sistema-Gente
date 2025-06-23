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

export default function EmpresaPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-[#00A298]/15 pt-16">
      {/* Conteúdo Principal */}
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#1D3C44] mb-2">Empresa</h1>
            <p className="text-gray-600">Gestão de dados empresariais</p>
          </div>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600">Total de Funcionários</p>
                    <p className="text-2xl font-bold text-[#00A298]">1,247</p>
                </div>
                <div className="text-3xl">👥</div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600">Ambientes</p>
                    <p className="text-2xl font-bold text-blue-500">23</p>
                </div>
                <div className="text-3xl">🏭</div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600">Exames Realizados</p>
                    <p className="text-2xl font-bold text-green-500">3,456</p>
                </div>
                <div className="text-3xl">🩺</div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-600">Anos de Mercado</p>
                    <p className="text-2xl font-bold text-purple-500">25</p>
                </div>
                <div className="text-3xl">📅</div>
                </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informações da Empresa */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-[#1D3C44] mb-4">Informações da Empresa</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                    <span className="font-medium text-[#1D3C44]">Razão Social:</span>
                    <span className="text-gray-600">PLBrasil Health&Safety Ltda</span>
                </div>

                <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                    <span className="font-medium text-[#1D3C44]">CNPJ:</span>
                    <span className="text-gray-600">12.345.678/0001-90</span>
                </div>

                <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                    <span className="font-medium text-[#1D3C44]">Inscrição Estadual:</span>
                    <span className="text-gray-600">123.456.789.123</span>
                </div>

                <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                    <span className="font-medium text-[#1D3C44]">Telefone:</span>
                    <span className="text-gray-600">(11) 3456-7890</span>
                </div>

                <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                    <span className="font-medium text-[#1D3C44]">E-mail:</span>
                    <span className="text-gray-600">contato@plbrasil.com.br</span>
                </div>

                <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                    <span className="font-medium text-[#1D3C44]">Endereço:</span>
                    <span className="text-gray-600">Av. Paulista, 1000 - São Paulo/SP</span>
                </div>
              </div>
            </div>

            {/* Indicadores de Segurança e Saúde */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-[#1D3C44] mb-4">Indicadores de Segurança e Saúde</h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🛡️</span>
                    <div>
                      <div className="font-medium text-[#1D3C44]">Acidentes no Mês</div>
                      <div className="text-sm text-gray-600">2 ocorrências registradas</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded-full">Atenção</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">📋</span>
                    <div>
                      <div className="font-medium text-[#1D3C44]">Treinamentos Pendentes</div>
                      <div className="text-sm text-gray-600">87 funcionários aguardando</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-800 rounded-full">Urgente</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">🩺</span>
                    <div>
                      <div className="font-medium text-[#1D3C44]">Exames Vencidos</div>
                      <div className="text-sm text-gray-600">23 exames a renovar</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">Pendente</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">✅</span>
                    <div>
                      <div className="font-medium text-[#1D3C44]">Taxa de Conformidade</div>
                      <div className="text-sm text-gray-600">94% em cumprimento das NRs</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Excelente</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Certificações e Licenças */}
          <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-[#1D3C44] mb-4">Certificações e Licenças</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-[#1D3C44]">ISO 45001</span>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Válida</span>
                </div>
                <p className="text-sm text-gray-600">Sistemas de Gestão de SST</p>
                <p className="text-sm text-gray-500">Válida até: 15/08/2025</p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-[#1D3C44]">ISO 14001</span>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">Válida</span>
                </div>
                <p className="text-sm text-gray-600">Sistema de Gestão Ambiental</p>
                <p className="text-sm text-gray-500">Válida até: 22/11/2024</p>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-[#1D3C44]">Alvará de Funcionamento</span>
                    <span className="text-xs px-2 py-1 bg-orange-100 text-orange-800 rounded-full">Renovar</span>
                </div>
                <p className="text-sm text-gray-600">Licença Municipal</p>
                <p className="text-sm text-gray-500">Vence em: 31/12/2024</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}