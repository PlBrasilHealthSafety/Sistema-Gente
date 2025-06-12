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

interface Grupo {
  id: number;
  nome: string;
  descricao?: string;
  status: 'ATIVO' | 'INATIVO';
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
}

interface Regiao {
  id: number;
  nome: string;
  descricao?: string;
  uf: string;
  cidade?: string;
  grupo_id?: number;
  status: 'ATIVO' | 'INATIVO';
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
}

export default function RegioesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewRegionModal, setShowNewRegionModal] = useState(false);
  const [nomeRegiao, setNomeRegiao] = useState('');
  const [nomeBusca, setNomeBusca] = useState('');
  const [descricaoRegiao, setDescricaoRegiao] = useState('');
  const [ufRegiao, setUfRegiao] = useState('');
  const [cidadeRegiao, setCidadeRegiao] = useState('');
  const [regioes, setRegioes] = useState<Regiao[]>([]);
  const [filteredRegioes, setFilteredRegioes] = useState<Regiao[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [grupoSelecionado, setGrupoSelecionado] = useState('');
  const [grupoFiltro, setGrupoFiltro] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Lista de UFs brasileiras
  const ufs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

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
        const result = await response.json();
        // A API retorna {success: true, data: Array, message: string}
        const validData = result.success && Array.isArray(result.data) ? result.data : [];
        setGrupos(validData);
      } else {
        console.error('Erro na resposta da API de grupos. Status:', response.status);
        setGrupos([]);
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      setGrupos([]);
    }
  };

  // Função para carregar regiões
  const carregarRegioes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/regioes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRegioes(data);
        setFilteredRegioes(data);
      }
    } catch (error) {
      console.error('Erro ao carregar regiões:', error);
    }
  };

  // Função para procurar regiões
  const handleProcurar = () => {
    let filtered = regioes;

    // Filtrar por nome se houver busca
    if (nomeBusca.trim()) {
      filtered = filtered.filter(regiao =>
        regiao.nome.toLowerCase().includes(nomeBusca.toLowerCase())
      );
    }

    // Filtrar por grupo se houver seleção
    if (grupoFiltro) {
      filtered = filtered.filter(regiao =>
        regiao.grupo_id === parseInt(grupoFiltro)
      );
    }

    setFilteredRegioes(filtered);
  };

  // Função para incluir nova região
  const handleIncluir = async () => {
    if (!nomeRegiao.trim()) {
      alert('Por favor, informe o nome da região.');
      return;
    }
    if (!ufRegiao) {
      alert('Por favor, selecione a UF.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/api/regioes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome: nomeRegiao,
          descricao: descricaoRegiao || null,
          uf: ufRegiao,
          cidade: cidadeRegiao || null,
          grupo_id: grupoSelecionado ? parseInt(grupoSelecionado) : null
        })
      });

      if (response.ok) {
        alert('Região cadastrada com sucesso!');
        handleLimpar();
        await carregarRegioes();
        await carregarGrupos(); // Recarregar grupos para sincronizar
        setShowNewRegionModal(false);
      } else {
        const error = await response.json();
        alert(`Erro ao cadastrar região: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao cadastrar região:', error);
      alert('Erro ao cadastrar região. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para limpar formulário
  const handleLimpar = () => {
    setNomeRegiao('');
    setDescricaoRegiao('');
    setUfRegiao('');
    setCidadeRegiao('');
    setGrupoSelecionado('');
  };

  // Função para retornar (fechar modal)
  const handleRetornar = () => {
    handleLimpar();
    setShowNewRegionModal(false);
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
      // Carregar dados após definir usuário
      carregarGrupos();
      carregarRegioes();
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  // Recarregar dados quando a página ganhar foco (para pegar novos grupos cadastrados)
  useEffect(() => {
    const handleFocus = () => {
      carregarGrupos();
      carregarRegioes();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);


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
                <span className="text-[#00A298] font-medium">Regiões</span>
              </div>
              
              <h1 className="text-3xl font-bold text-[#1D3C44] mb-2">
                🗺️ Cadastro de Regiões
              </h1>
              <p className="text-gray-600">
                Gerencie as regiões da sua organização
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
                  className="bg-[#00A298] text-white px-4 py-2 rounded-lg font-medium"
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
                      onChange={(e) => setNomeBusca(e.target.value)}
                      placeholder="Digite o nome da região para buscar..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grupo
                    </label>
                    <select 
                      value={grupoFiltro}
                      onChange={(e) => setGrupoFiltro(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                    >
                      <option value="">Todos os grupos</option>
                      {grupos.map(grupo => (
                        <option key={grupo.id} value={grupo.id}>{grupo.nome}</option>
                      ))}
                    </select>
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
                    onClick={() => setShowNewRegionModal(true)}
                    className="bg-[#00A298] hover:bg-[#1D3C44] text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    NOVA REGIÃO
                  </button>
                </div>
              </div>

              {/* Container de Novo Cadastro */}
              {showNewRegionModal && (
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-[#1D3C44] mb-4">Cadastro de Regiões</h3>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Dados cadastrais</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nome
                        </label>
                        <input
                          type="text"
                          value={nomeRegiao}
                          onChange={(e) => setNomeRegiao(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                          placeholder="Digite o nome da região"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Grupo
                        </label>
                        <select 
                          value={grupoSelecionado}
                          onChange={(e) => setGrupoSelecionado(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                        >
                          <option value="">Selecione um grupo</option>
                          {grupos.filter(grupo => grupo.status === 'ATIVO').map(grupo => (
                            <option key={grupo.id} value={grupo.id}>{grupo.nome}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          UF (Estado)
                        </label>
                        <select 
                          value={ufRegiao}
                          onChange={(e) => setUfRegiao(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                        >
                          <option value="">Selecione a UF</option>
                          {ufs.map(uf => (
                            <option key={uf} value={uf}>{uf}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cidade (Opcional)
                        </label>
                        <input
                          type="text"
                          value={cidadeRegiao}
                          onChange={(e) => setCidadeRegiao(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                          placeholder="Digite o nome da cidade"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descrição (Opcional)
                      </label>
                      <textarea
                        value={descricaoRegiao}
                        onChange={(e) => setDescricaoRegiao(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                        placeholder="Digite uma descrição para a região..."
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
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Grupo</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Situação</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRegioes.length > 0 ? (
                        filteredRegioes.map((regiao) => (
                          <tr key={regiao.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">
                              <div>
                                <div className="font-medium text-gray-900">{regiao.nome}</div>
                                {regiao.descricao && (
                                  <div className="text-gray-500 text-xs mt-1">{regiao.descricao}</div>
                                )}
                                <div className="text-blue-600 text-xs mt-1">
                                  📍 {regiao.uf}{regiao.cidade ? ` - ${regiao.cidade}` : ''}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {regiao.grupo_id ? 
                                grupos.find(g => g.id === regiao.grupo_id)?.nome || 'Grupo não encontrado'
                                : '-'
                              }
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                regiao.status === 'ATIVO' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {regiao.status}
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
                          <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                            {nomeBusca ? 'Nenhuma região encontrada com o nome pesquisado' : 'Não existem dados para mostrar'}
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