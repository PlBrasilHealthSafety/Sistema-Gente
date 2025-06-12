'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatTexto } from '@/utils/masks';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
}

interface Grupo {
  id: number;
  nome: string;
  descricao?: string;
  grupo_pai_id?: number;
  grupo_pai?: Grupo;
  status: 'ATIVO' | 'INATIVO';
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  visible: boolean;
}

export default function GruposPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [nomeGrupo, setNomeGrupo] = useState('');
  const [nomeBusca, setNomeBusca] = useState('');
  const [descricaoGrupo, setDescricaoGrupo] = useState('');
  const [grupoPai, setGrupoPai] = useState('');
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [filteredGrupos, setFilteredGrupos] = useState<Grupo[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [editingGroup, setEditingGroup] = useState<Grupo | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<Grupo | null>(null);

  // Função para carregar grupos
  const carregarGrupos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/grupos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const validData = Array.isArray(data) ? data : [];
        setGrupos(validData);
        setFilteredGrupos(validData);
        
        if (validData.length === 0) {
          showNotification('info', 'Nenhum grupo cadastrado encontrado.');
        }
      } else {
        console.error('Erro na resposta da API de grupos');
        showNotification('error', 'Erro ao carregar grupos. Verifique sua conexão.');
        setGrupos([]);
        setFilteredGrupos([]);
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      showNotification('error', 'Erro ao conectar com o servidor. Tente novamente.');
      setGrupos([]);
      setFilteredGrupos([]);
    }
  };

  // Função para procurar grupos
  const handleProcurar = () => {
    if (!nomeBusca.trim()) {
      setFilteredGrupos(grupos || []);
      return;
    }

    if (!Array.isArray(grupos)) {
      setFilteredGrupos([]);
      return;
    }

    const filtered = grupos.filter(grupo =>
      grupo.nome.toLowerCase().includes(nomeBusca.toLowerCase())
    );
    setFilteredGrupos(filtered);
  };

  // Função para mostrar notificação
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    const notification: Notification = {
      id,
      type,
      message,
      visible: true
    };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto remover após 5 segundos
    setTimeout(() => {
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, visible: false } : notif
        )
      );
      
      // Remover completamente após animação
      setTimeout(() => {
        setNotifications(prev => prev.filter(notif => notif.id !== id));
      }, 300);
    }, 5000);
  };

  // Função para incluir novo grupo
  const handleIncluir = async () => {
    if (!nomeGrupo.trim()) {
      showNotification('error', 'Por favor, informe o nome do grupo.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/grupos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome: nomeGrupo,
          descricao: descricaoGrupo || null,
          grupo_pai_id: grupoPai || null
        })
      });

      if (response.ok) {
        showNotification('success', `Grupo "${nomeGrupo}" cadastrado com sucesso!`);
        handleLimpar();
        await carregarGrupos();
        setShowNewGroupModal(false);
      } else {
        const error = await response.json();
        showNotification('error', `Erro ao cadastrar grupo: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao cadastrar grupo:', error);
      showNotification('error', 'Erro ao cadastrar grupo. Verifique sua conexão e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para limpar formulário
  const handleLimpar = () => {
    setNomeGrupo('');
    setDescricaoGrupo('');
    setGrupoPai('');
  };

  // Função para retornar (fechar modal)
  const handleRetornar = () => {
    handleLimpar();
    setShowNewGroupModal(false);
    setEditingGroup(null);
  };

  // Função para editar grupo
  const handleEditGroup = (grupo: Grupo) => {
    setEditingGroup(grupo);
    setNomeGrupo(grupo.nome);
    setDescricaoGrupo(grupo.descricao || '');
    setGrupoPai(grupo.grupo_pai_id?.toString() || '');
    setShowNewGroupModal(true);
  };

  // Função para atualizar grupo
  const handleUpdateGroup = async () => {
    if (!editingGroup || !nomeGrupo.trim()) {
      showNotification('error', 'Por favor, informe o nome do grupo.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/grupos/${editingGroup.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome: nomeGrupo,
          descricao: descricaoGrupo || null,
          grupo_pai_id: grupoPai || null
        })
      });

      if (response.ok) {
        showNotification('success', `Grupo "${nomeGrupo}" atualizado com sucesso!`);
        handleLimpar();
        await carregarGrupos();
        setShowNewGroupModal(false);
        setEditingGroup(null);
      } else {
        const error = await response.json();
        showNotification('error', `Erro ao atualizar grupo: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar grupo:', error);
      showNotification('error', 'Erro ao atualizar grupo. Verifique sua conexão e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para confirmar exclusão
  const handleDeleteGroup = (grupo: Grupo) => {
    setGroupToDelete(grupo);
    setShowDeleteModal(true);
  };

  // Função para excluir grupo
  const confirmDeleteGroup = async () => {
    if (!groupToDelete) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/grupos/${groupToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showNotification('success', `Grupo "${groupToDelete.nome}" excluído com sucesso!`);
        await carregarGrupos();
      } else {
        const error = await response.json();
        showNotification('error', `Erro ao excluir grupo: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao excluir grupo:', error);
      showNotification('error', 'Erro ao excluir grupo. Verifique sua conexão e tente novamente.');
    } finally {
      setShowDeleteModal(false);
      setGroupToDelete(null);
    }
  };

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
      // Carregar grupos após definir usuário
      carregarGrupos();
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
            <Image
              src="/logo.png"
              alt="PLBrasil Health&Safety"
              width={120}
              height={30}
              className="object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
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
        {/* Conteúdo Principal */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumb e Navegação */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                <button 
                  onClick={() => router.push('/home/cadastros')}
                  className="hover:text-[#00A298] cursor-pointer"
                >
                  Cadastros
                </button>
                <span>/</span>
                <button 
                  onClick={() => router.push('/home/cadastros/estrutura-organizacional')}
                  className="hover:text-[#00A298] cursor-pointer"
                >
                  Estrutura Organizacional
                </button>
                <span>/</span>
                <span className="text-[#00A298] font-medium">Grupos</span>
              </div>
              
              <h1 className="text-3xl font-bold text-[#1D3C44] mb-2">
                👥 Cadastro de Grupos
              </h1>
              <p className="text-gray-600">
                Gerencie os grupos da sua organização
              </p>
            </div>

            {/* Navegação entre seções */}
            <div className="mb-6">
              <div className="flex space-x-4">
                <button
                  onClick={() => router.push('/home/cadastros/estrutura-organizacional/grupos')}
                  className="bg-[#00A298] text-white px-4 py-2 rounded-lg font-medium"
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
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer"
                >
                  🏢 Empresas
                </button>
              </div>
            </div>

            {/* Conteúdo Principal */}
            <div className="bg-white rounded-2xl shadow-xl">
              {/* Formulário de busca */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="flex-1 min-w-64">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pesquisar por Nome
                    </label>
                    <input
                      type="text"
                      value={nomeBusca}
                      onChange={(e) => setNomeBusca(formatTexto(e.target.value))}
                      placeholder="Digite o nome do grupo para buscar (apenas letras)..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                    />
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
                    onClick={handleProcurar}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    PROCURAR
                  </button>
                  
                  <button 
                    onClick={() => setShowNewGroupModal(true)}
                    className="bg-[#00A298] hover:bg-[#1D3C44] text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    NOVO GRUPO
                  </button>
                </div>
              </div>

              {/* Container de Novo Cadastro */}
              {showNewGroupModal && (
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-[#1D3C44] mb-4">
                    {editingGroup ? 'Editar Grupo' : 'Cadastro de Grupos'}
                  </h3>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Dados cadastrais</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nome
                        </label>
                        <input
                          type="text"
                          value={nomeGrupo}
                          onChange={(e) => setNomeGrupo(formatTexto(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                          placeholder="Digite o nome do grupo (apenas letras)"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Grupo Pai (Opcional)
                        </label>
                        <select 
                          value={grupoPai}
                          onChange={(e) => setGrupoPai(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                        >
                          <option value="">Nenhum (grupo raiz)</option>
                          {grupos && Array.isArray(grupos) && grupos.map(grupo => (
                            <option key={grupo.id} value={grupo.id.toString()}>
                              {grupo.nome}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descrição (Opcional)
                      </label>
                      <textarea
                        value={descricaoGrupo}
                        onChange={(e) => setDescricaoGrupo(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                        placeholder="Digite uma descrição para o grupo..."
                      />
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button 
                        onClick={editingGroup ? handleUpdateGroup : handleIncluir}
                        disabled={isSubmitting}
                        className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting 
                          ? (editingGroup ? 'ATUALIZANDO...' : 'INCLUINDO...') 
                          : (editingGroup ? 'ATUALIZAR' : 'INCLUIR')
                        }
                      </button>
                      <button 
                        onClick={handleLimpar}
                        className="bg-blue-400 hover:bg-blue-500 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                      >
                        LIMPAR
                      </button>
                      <button
                        onClick={handleRetornar}
                        className="bg-gray-400 hover:bg-gray-500 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                      >
                        RETORNAR
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tabela de resultados */}
              <div className="p-6">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nome</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Situação</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGrupos && Array.isArray(filteredGrupos) && filteredGrupos.length > 0 ? (
                        filteredGrupos.map((grupo) => (
                          <tr key={grupo.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">
                              <div>
                                <div className="font-medium text-gray-900">{grupo.nome}</div>
                                {grupo.descricao && (
                                  <div className="text-gray-500 text-xs mt-1">{grupo.descricao}</div>
                                )}
                                {grupo.grupo_pai && (
                                  <div className="text-blue-600 text-xs mt-1">
                                    👥 Grupo pai: {grupo.grupo_pai.nome}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                grupo.status === 'ATIVO' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {grupo.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => handleEditGroup(grupo)}
                                  className="text-blue-600 hover:text-blue-800 text-xs font-medium transition-colors"
                                >
                                  Editar
                                </button>
                                <button 
                                  onClick={() => handleDeleteGroup(grupo)}
                                  className="text-red-600 hover:text-red-800 text-xs font-medium transition-colors"
                                >
                                  Excluir
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                            {nomeBusca ? 'Nenhum grupo encontrado com o nome pesquisado' : 'Não existem dados para mostrar'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Sistema de Notificações */}
      <div className="fixed top-20 right-4 z-[9999] space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`transform transition-all duration-300 ease-in-out ${
              notification.visible 
                ? 'translate-x-0 opacity-100' 
                : 'translate-x-full opacity-0'
            }`}
          >
            <div className={`min-w-80 max-w-md p-4 rounded-lg shadow-lg border-l-4 ${
              notification.type === 'success'
                ? 'bg-green-50 border-green-400 text-green-800'
                : notification.type === 'error'
                ? 'bg-red-50 border-red-400 text-red-800'
                : 'bg-blue-50 border-blue-400 text-blue-800'
            }`}>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {notification.type === 'success' && (
                    <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  {notification.type === 'error' && (
                    <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  {notification.type === 'info' && (
                    <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium">
                    {notification.message}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <button
                    onClick={() => {
                      setNotifications(prev =>
                        prev.map(notif =>
                          notif.id === notification.id
                            ? { ...notif, visible: false }
                            : notif
                        )
                      );
                      setTimeout(() => {
                        setNotifications(prev => prev.filter(notif => notif.id !== notification.id));
                      }, 300);
                    }}
                    className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      notification.type === 'success'
                        ? 'text-green-500 hover:bg-green-100 focus:ring-green-600'
                        : notification.type === 'error'
                        ? 'text-red-500 hover:bg-red-100 focus:ring-red-600'
                        : 'text-blue-500 hover:bg-blue-100 focus:ring-blue-600'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && groupToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900">Confirmar Exclusão</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir o grupo <strong>"{groupToDelete.nome}"</strong>? 
              Esta ação não pode ser desfeita.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setGroupToDelete(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors rounded-md hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteGroup}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 