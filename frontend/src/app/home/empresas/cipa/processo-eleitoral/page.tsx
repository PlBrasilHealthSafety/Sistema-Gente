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

export default function ProcessoEleitoralPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-[#00A298]/15 pt-16">
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-[#1D3C44] mb-2">Processo Eleitoral</h1>
            <p className="text-gray-600">Gestão do processo eleitoral da CIPA</p>
          </div>

          {/* Card principal */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏛️</div>
              <h2 className="text-2xl font-bold text-[#1D3C44] mb-4">Processo Eleitoral</h2>
              <p className="text-gray-600 mb-8">
                Esta seção está em desenvolvimento.<br />
                Em breve você poderá gerenciar o processo eleitoral da CIPA.
              </p>
              <div className="flex justify-center space-x-4">
                <button 
                  onClick={() => router.push('/home/empresas/listagem-de-empresas')}
                  className="px-6 py-3 bg-[#00A298] text-white rounded-lg hover:bg-[#00A298]/90 transition-colors font-medium"
                >
                  Voltar para Empresas
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 