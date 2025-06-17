'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Imports dos componentes modularizados
import NotificationToast from './components/NotificationToast';
import TabelaEmpresas from './components/TabelaEmpresas';
// import FormularioBusca from './components/FormularioBusca';
// import NovaEmpresaModal from './components/NovaEmpresaModal';
// import EditarEmpresaModal from './components/EditarEmpresaModal';
// import ConfirmarExclusaoModal from './components/ConfirmarExclusaoModal';

// Imports dos hooks customizados
import { useNotification } from './hooks/useNotification';
// import { useEmpresas } from './hooks/useEmpresas';
// import { useFormularioEmpresa } from './hooks/useFormularioEmpresa';

// Imports dos tipos
import { User, Empresa } from './types/empresa.types';

// Imports dos serviços
import { empresasService } from './services/empresasService';

export default function EmpresasPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [filteredEmpresas, setFilteredEmpresas] = useState<Empresa[]>([]);
  
  // Hooks customizados
  const { notification, showNotification, hideNotification } = useNotification();
  
  // Estados dos modais
  const [showNewCompanyModal, setShowNewCompanyModal] = useState(false);
  const [showEditCompanyModal, setShowEditCompanyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [empresaEditando, setEmpresaEditando] = useState<Empresa | null>(null);
  const [empresaExcluindo, setEmpresaExcluindo] = useState<Empresa | null>(null);

  // Função para lidar com logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  // Função para carregar empresas usando o serviço
  const carregarEmpresas = async () => {
    try {
      const result = await empresasService.buscarEmpresas();
      setEmpresas(result);
      setFilteredEmpresas(result);
      
      if (result.length > 0) {
        showNotification('success', `${result.length} empresa(s) carregada(s)`);
      } else {
        showNotification('error', 'Nenhuma empresa encontrada no banco de dados');
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      showNotification('error', 'Erro de conexão ao carregar empresas');
      setEmpresas([]);
      setFilteredEmpresas([]);
    }
  };

  // Função para abrir modal de edição
  const handleEditarEmpresa = (empresa: Empresa) => {
    setEmpresaEditando(empresa);
    setShowEditCompanyModal(true);
  };

  // Função para abrir modal de exclusão
  const handleExcluirEmpresa = (empresa: Empresa) => {
    setEmpresaExcluindo(empresa);
    setShowDeleteModal(true);
  };

  // Utilitárias para role
  const getRoleName = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'Super Administrador';
      case 'ADMIN': return 'Administrador';
      case 'USER': return 'Usuário';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-purple-100 text-purple-800';
      case 'ADMIN': return 'bg-blue-100 text-blue-800';
      case 'USER': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // useEffect para inicialização
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
      carregarEmpresas();
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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-[#00A298]/15">
      {/* Componente de Notificação */}
      <NotificationToast 
        notification={notification} 
        onClose={hideNotification} 
      />

      {/* Header Superior */}
      <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="flex justify-between items-center h-16 px-4">
          <div className="w-1/3"></div>
          
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
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb e Navegação */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                <button 
                  onClick={() => router.push('/home/cadastros/estrutura-organizacional')}
                  className="hover:text-[#00A298] cursor-pointer"
                >
                  Estrutura Organizacional
                </button>
                <span>/</span>
                <span className="text-[#00A298] font-medium">Empresas</span>
              </div>
              
              <h1 className="text-3xl font-bold text-[#1D3C44] mb-2">
                🏢 Cadastro de Empresas
              </h1>
              <p className="text-gray-600">
                Gerencie as empresas da sua organização
              </p>
            </div>

            {/* Navegação entre seções */}
            <div className="mb-6">
              <div className="flex space-x-4">
                <button
                  onClick={() => router.push('/home/cadastros/estrutura-organizacional/grupos')}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer"
                >
                  👥 Grupos
                </button>
                <button
                  onClick={() => router.push('/home/cadastros/estrutura-organizacional/regioes')}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer"
                >
                  🗺️ Regiões
                </button>
                <button
                  onClick={() => router.push('/home/cadastros/estrutura-organizacional/empresas')}
                  className="bg-[#00A298] text-white px-4 py-2 rounded-lg font-medium"
                >
                  🏢 Empresas
                </button>
              </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="bg-white rounded-2xl shadow-xl">
              {/* Aqui entraria o FormularioBusca */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex gap-6 ml-auto justify-end">
                  <button 
                    onClick={() => setShowNewCompanyModal(true)}
                    className="bg-[#00A298] hover:bg-[#1D3C44] text-white px-3 py-1.5 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer text-xs"
                  >
                    NOVA EMPRESA
                  </button>
                  
                  <button 
                    onClick={carregarEmpresas}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1.5 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer text-xs"
                  >
                    RECARREGAR
                  </button>
                </div>
              </div>

              {/* Componente de Tabela */}
              {!showNewCompanyModal && (
                <TabelaEmpresas 
                  empresas={filteredEmpresas}
                  onEditar={handleEditarEmpresa}
                  onExcluir={handleExcluirEmpresa}
                />
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Aqui entrariam os Modais como componentes separados */}
      {/* 
      {showNewCompanyModal && (
        <NovaEmpresaModal 
          onClose={() => setShowNewCompanyModal(false)}
          onSuccess={carregarEmpresas}
        />
      )}
      
      {showEditCompanyModal && empresaEditando && (
        <EditarEmpresaModal 
          empresa={empresaEditando}
          onClose={() => setShowEditCompanyModal(false)}
          onSuccess={carregarEmpresas}
        />
      )}
      
      {showDeleteModal && empresaExcluindo && (
        <ConfirmarExclusaoModal 
          empresa={empresaExcluindo}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={carregarEmpresas}
        />
      )}
      */}
    </div>
  );
} 