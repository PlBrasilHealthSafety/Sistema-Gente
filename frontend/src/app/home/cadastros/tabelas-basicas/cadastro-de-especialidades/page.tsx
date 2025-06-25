'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CadastroEspecialidades() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Verificação de autenticação
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    // Simular carregamento de dados do usuário
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00A298]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1D3C44] mb-2">
                Cadastro de Especialidades
              </h1>
              <p className="text-gray-600">
                Gerencie as especialidades médicas e profissionais
              </p>
            </div>
            <button
              onClick={() => router.push('/home/cadastros/estrutura-organizacional')}
              className="bg-[#00A298] hover:bg-[#008A82] text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              <span>←</span>
              Voltar para Cadastros
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎓</div>
            <h2 className="text-xl font-semibold text-[#1D3C44] mb-2">
              Cadastro de Especialidades
            </h2>
            <p className="text-gray-600 mb-4">
              Esta funcionalidade está em desenvolvimento
            </p>
            <div className="bg-[#00A298]/10 border border-[#00A298]/20 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-[#1D3C44] text-sm">
                Em breve você poderá gerenciar especialidades médicas, técnicas e outras áreas de expertise.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 