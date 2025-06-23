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

export default function FuncionariosPage() {
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
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1D3C44] mb-2">Funcionários</h1>
        <p className="text-gray-600">Gestão de informações dos colaboradores</p>
      </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-[#1D3C44]">Lista de Funcionários</h2>
                <button className="bg-[#00A298] text-white px-4 py-2 rounded-lg hover:bg-[#00A298]/90 transition-colors">
                  Adicionar Funcionário
                </button>
              </div>

              <div className="mb-4">
                <div className="flex gap-4">
                  <input
                    type="text"
                    placeholder="Buscar funcionário..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                  />
                  <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent">
                    <option value="">Todos os departamentos</option>
                    <option value="rh">Recursos Humanos</option>
                    <option value="ti">Tecnologia da Informação</option>
                    <option value="financeiro">Financeiro</option>
                  </select>
                  <button className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
                    Filtrar
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-[#1D3C44]">Nome</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#1D3C44]">CPF</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#1D3C44]">Cargo</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#1D3C44]">Departamento</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#1D3C44]">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-[#1D3C44]">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-[#1D3C44]">João Silva Santos</div>
                          <div className="text-sm text-gray-500">joao.silva@empresa.com</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">123.456.789-00</td>
                      <td className="py-3 px-4 text-gray-600">Analista de Sistemas</td>
                      <td className="py-3 px-4 text-gray-600">Tecnologia da Informação</td>
                      <td className="py-3 px-4">
                        <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Ativo
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800 text-sm">Editar</button>
                          <button className="text-red-600 hover:text-red-800 text-sm">Remover</button>
                        </div>
                      </td>
                    </tr>
                    {/* Mais linhas podem ser adicionadas aqui */}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Mostrando 1-10 de 50 funcionários
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                    Anterior
                  </button>
                  <button className="px-3 py-1 bg-[#00A298] text-white rounded text-sm">
                    1
                  </button>
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                    2
                  </button>
                  <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50">
                    Próximo
                  </button>
                </div>
              </div>
            </div>
    </div>
  );
} 