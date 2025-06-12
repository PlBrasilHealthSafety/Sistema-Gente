'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatTexto } from '@/utils/masks';

interface NotificationMessage {
  type: 'success' | 'error';
  message: string;
  show: boolean;
}

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
  const [notification, setNotification] = useState<NotificationMessage>({
    type: 'success',
    message: '',
    show: false
  });

  // Função para exibir notificação
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message, show: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // Função para carregar grupos
  const carregarGrupos = async () => {
    console.log('=== CARREGANDO GRUPOS ===');
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'Existe' : 'Não existe');
      
      const response = await fetch('http://localhost:3001/api/grupos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('Raw response from API:', result);
        
        // A API retorna { success: true, data: grupos[], message: string }
        const data = result.data || result; // Fallback para compatibilidade
        console.log('Extracted data:', data);
        console.log('Data type:', typeof data);
        console.log('Data is array:', Array.isArray(data));
        
        const validData = Array.isArray(data) ? data : [];
        console.log('Valid data:', validData);
        console.log('Valid data length:', validData.length);
        
        setGrupos(validData);
        setFilteredGrupos(validData);
        
        if (validData.length > 0) {
          showNotification('success', `${validData.length} grupo(s) carregado(s)`);
        } else {
          showNotification('error', 'Nenhum grupo encontrado no banco de dados');
        }
      } else {
        const errorText = await response.text();
        console.error('Erro na resposta da API de grupos:', errorText);
        showNotification('error', `Erro ao carregar grupos: ${response.status}`);
        setGrupos([]);
        setFilteredGrupos([]);
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      showNotification('error', 'Erro de conexão ao carregar grupos');
      setGrupos([]);
      setFilteredGrupos([]);
    }
  };

  // Função para procurar grupos
  const handleProcurar = () => {
    console.log('=== DEBUG BUSCA ===');
    console.log('nomeBusca:', nomeBusca);
    console.log('grupos array:', grupos);
    console.log('grupos length:', grupos?.length);
    
    if (!nomeBusca.trim()) {
      console.log('Campo busca vazio, mostrando todos os grupos');
      setFilteredGrupos(grupos || []);
      return;
    }

    if (!Array.isArray(grupos)) {
      console.log('grupos não é array:', typeof grupos);
      setFilteredGrupos([]);
      return;
    }

    console.log('Iniciando filtro...');
    const filtered = grupos.filter(grupo => {
      const match = grupo.nome.toLowerCase().includes(nomeBusca.toLowerCase());
      console.log(`Grupo "${grupo.nome}" - Match: ${match}`);
      return match;
    });
    
    console.log('Grupos filtrados:', filtered);
    setFilteredGrupos(filtered);
    
    if (filtered.length === 0) {
      showNotification('error', 'Nenhum grupo encontrado com o nome pesquisado');
    } else {
      showNotification('success', `${filtered.length} grupo(s) encontrado(s)`);
    }
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
        showNotification('success', 'Grupo cadastrado com sucesso!');
        handleLimpar();
        await carregarGrupos();
        setShowNewGroupModal(false);
      } else {
        const error = await response.json();
        showNotification('error', `Erro ao cadastrar grupo: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao cadastrar grupo:', error);
      showNotification('error', 'Erro ao cadastrar grupo. Tente novamente.');
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
      {/* Notificação Toast */}
      {notification.show && (
        <div className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-100 border border-green-400 text-green-700' 
            : 'bg-red-100 border border-red-400 text-red-700'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span className="font-medium">{notification.message}</span>
            <button
              onClick={() => setNotification(prev => ({ ...prev, show: false }))}
              className="ml-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

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
                  
                  <button 
                    onClick={carregarGrupos}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    RECARREGAR
                  </button>
                </div>
              </div>

              {/* Container de Novo Cadastro */}
              {showNewGroupModal && (
                <div className="p-6 bg-gray-50 border-b border-gray-200">
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
                        onClick={handleIncluir}
                        disabled={isSubmitting}
                        className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'INCLUINDO...' : 'INCLUIR'}
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
                                <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                                  Editar
                                </button>
                                <button className="text-red-600 hover:text-red-800 text-xs font-medium">
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
    </div>
  );
} 