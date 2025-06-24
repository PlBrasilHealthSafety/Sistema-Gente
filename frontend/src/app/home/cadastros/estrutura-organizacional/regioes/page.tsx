'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatTexto } from '@/utils/masks';
import { usePermissions } from '@/hooks/usePermissions';

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
  status: 'ativo' | 'inativo';
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
  status: 'ativo' | 'inativo';
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
}

interface Cidade {
  id: number;
  nome: string;
}

export default function RegioesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Hook de permissões
  const permissions = usePermissions(user);
  const [showNewRegionModal, setShowNewRegionModal] = useState(false);
  const [nomeRegiao, setNomeRegiao] = useState('');
  const [nomeBusca, setNomeBusca] = useState('');
  const [situacaoBusca, setSituacaoBusca] = useState('ativo');
  const [descricaoRegiao, setDescricaoRegiao] = useState('');
  const [ufRegiao, setUfRegiao] = useState('');
  const [cidadeRegiao, setCidadeRegiao] = useState('');
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [loadingCidades, setLoadingCidades] = useState(false);
  const [regioes, setRegioes] = useState<Regiao[]>([]);
  const [filteredRegioes, setFilteredRegioes] = useState<Regiao[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [gruposAtivos, setGruposAtivos] = useState<Grupo[]>([]);
  const [grupoSelecionado, setGrupoSelecionado] = useState('');
  const [grupoFiltro, setGrupoFiltro] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<NotificationMessage>({
    type: 'success',
    message: '',
    show: false
  });
  const [showEditRegionModal, setShowEditRegionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteDefinitivoModal, setShowDeleteDefinitivoModal] = useState(false);
  const [regiaoEditando, setRegiaoEditando] = useState<Regiao | null>(null);
  const [regiaoExcluindo, setRegiaoExcluindo] = useState<Regiao | null>(null);
  const [regiaoExcluindoDefinitivo, setRegiaoExcluindoDefinitivo] = useState<Regiao | null>(null);
  const [showViewRegionModal, setShowViewRegionModal] = useState(false);
  const [regiaoVisualizando, setRegiaoVisualizando] = useState<Regiao | null>(null);
  
  // Estados para o autocomplete
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteResults, setAutocompleteResults] = useState<Regiao[]>([]);

  // Lista de UFs brasileiras
  const ufs = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  // Função para exibir notificação
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message, show: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // Função para aplicar filtros automaticamente
  const aplicarFiltrosAutomaticos = useCallback((nome: string = nomeBusca, grupo: string = grupoFiltro, situacao: string = situacaoBusca) => {
    if (!Array.isArray(regioes) || regioes.length === 0) {
      setFilteredRegioes([]);
      return;
    }

    let filtered = regioes;

    // Filtrar por nome se houver busca
    if (nome.trim()) {
      filtered = filtered.filter(regiao => 
        regiao.nome.toLowerCase().includes(nome.toLowerCase())
      );
    }

    // Filtrar por grupo se houver seleção
    if (grupo) {
      filtered = filtered.filter(regiao => regiao.grupo_id === parseInt(grupo));
    }

    // Filtrar por situação se não for "todos"
    if (situacao && situacao !== 'todos') {
      const status = situacao === 'ativo' ? 'ativo' : 'inativo';
      filtered = filtered.filter(regiao => regiao.status === status);
    }

    setFilteredRegioes(filtered);
    
    // Mostrar notificação apenas se houver filtros aplicados
    if (nome.trim() || grupo || (situacao && situacao !== 'todos')) {
      if (filtered.length === 0) {
        showNotification('error', 'Nenhuma região encontrada com os critérios aplicados');
      } else {
        showNotification('success', `${filtered.length} região(ões) encontrada(s)`);
      }
    }
  }, [regioes, nomeBusca, grupoFiltro, situacaoBusca]);

  // useEffect para aplicar filtros automaticamente quando situação ou grupo mudam
  useEffect(() => {
    if (regioes.length > 0) {
      aplicarFiltrosAutomaticos(nomeBusca, grupoFiltro, situacaoBusca);
    }
  }, [situacaoBusca, grupoFiltro, regioes, aplicarFiltrosAutomaticos, nomeBusca]);

  // Função para filtrar regiões em tempo real (autocomplete)
  const handleAutocompleteSearch = (value: string) => {
    if (!value.trim()) {
      setShowAutocomplete(false);
      setAutocompleteResults([]);
      // Aplicar filtros mesmo sem texto de busca
      aplicarFiltrosAutomaticos('', grupoFiltro, situacaoBusca);
      return;
    }

    if (!Array.isArray(regioes)) {
      setShowAutocomplete(false);
      setAutocompleteResults([]);
      return;
    }

    const filtered = regioes.filter(regiao => 
      regiao.nome.toLowerCase().includes(value.toLowerCase())
    ).slice(0, 5); // Limitar a 5 resultados

    setAutocompleteResults(filtered);
    setShowAutocomplete(filtered.length > 0);
    
    // Aplicar filtros em tempo real
    aplicarFiltrosAutomaticos(value, grupoFiltro, situacaoBusca);
  };

  // Função para selecionar item do autocomplete
  const handleSelectAutocomplete = (regiao: Regiao) => {
    setNomeBusca(regiao.nome);
    setShowAutocomplete(false);
    // Aplicar filtro automaticamente
    aplicarFiltrosAutomaticos(regiao.nome, grupoFiltro, situacaoBusca);
  };

  // Função para carregar grupos
  const carregarGrupos = useCallback(async () => {
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
        
        // Filtrar apenas grupos ativos para os seletores
        const gruposAtivos = validData.filter((grupo: Grupo) => grupo.status === 'ativo');
        setGruposAtivos(gruposAtivos);
      } else {
        console.error('Erro na resposta da API de grupos. Status:', response.status);
        showNotification('error', `Erro ao carregar grupos: ${response.status}`);
        setGrupos([]);
        setGruposAtivos([]);
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      showNotification('error', 'Erro de conexão ao carregar grupos');
      setGrupos([]);
      setGruposAtivos([]);
    }
  }, []);

  // Função para carregar regiões
  const carregarRegioes = useCallback(async () => {
    console.log('=== CARREGANDO REGIÕES ===');
    
    // Limpar campos de pesquisa quando recarregar
    setNomeBusca('');
    setSituacaoBusca('ativo');
    setGrupoFiltro('');
    setShowAutocomplete(false);
    setAutocompleteResults([]);
    
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'Existe' : 'Não existe');
      
      const response = await fetch('http://localhost:3001/api/regioes', {
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
        
        // A API retorna { success: true, data: regioes[], message: string }
        const data = result.data || result; // Fallback para compatibilidade
        console.log('Extracted data:', data);
        console.log('Data type:', typeof data);
        console.log('Data is array:', Array.isArray(data));
        
        const validData = Array.isArray(data) ? data : [];
        console.log('Valid data:', validData);
        console.log('Valid data length:', validData.length);

        
        setRegioes(validData);
        setFilteredRegioes(validData);
        
        if (validData.length > 0) {
          showNotification('success', `${validData.length} região(ões) carregada(s)`);
        } else {
          showNotification('error', 'Nenhuma região encontrada no banco de dados');
        }
      } else {
        const errorText = await response.text();
        console.error('Erro na resposta da API de regiões:', errorText);
        showNotification('error', `Erro ao carregar regiões: ${response.status}`);
        setRegioes([]);
        setFilteredRegioes([]);
      }
    } catch (error) {
      console.error('Erro ao carregar regiões:', error);
      showNotification('error', 'Erro de conexão ao carregar regiões');
      setRegioes([]);
      setFilteredRegioes([]);
    }
  }, []);

  // Função para procurar regiões (botão Procurar)
  const handleProcurar = () => {
    console.log('=== DEBUG BUSCA ===');
    console.log('nomeBusca:', nomeBusca);
    console.log('grupoFiltro:', grupoFiltro);
    console.log('situacaoBusca:', situacaoBusca);
    console.log('regioes array:', regioes);
    console.log('regioes length:', regioes?.length);
    
    // Fechar autocomplete ao usar o botão
    setShowAutocomplete(false);
    
    if (!nomeBusca.trim() && !grupoFiltro && situacaoBusca === 'todos') {
      console.log('Campos de busca vazios, mostrando todas as regiões');
      setFilteredRegioes(regioes || []);
      return;
    }

    if (!Array.isArray(regioes)) {
      console.log('regioes não é array:', typeof regioes);
      setFilteredRegioes([]);
      return;
    }

    console.log('Iniciando filtro...');
    let filtered = regioes;

    // Filtrar por nome se houver busca
    if (nomeBusca.trim()) {
      filtered = filtered.filter(regiao => {
        const match = regiao.nome.toLowerCase().includes(nomeBusca.toLowerCase());
        console.log(`Região "${regiao.nome}" - Match nome: ${match}`);
        return match;
      });
    }

    // Filtrar por grupo se houver seleção
    if (grupoFiltro) {
      filtered = filtered.filter(regiao => {
        const match = regiao.grupo_id === parseInt(grupoFiltro);
        console.log(`Região "${regiao.nome}" - Match grupo: ${match}`);
        return match;
      });
    }

    // Filtrar por situação se não for "todos"
    if (situacaoBusca !== 'todos') {
      const status = situacaoBusca === 'ativo' ? 'ativo' : 'inativo';
      filtered = filtered.filter(regiao => {
        const match = regiao.status === status;
        console.log(`Região "${regiao.nome}" - Match situação: ${match}`);
        return match;
      });
    }
    
    console.log('Regiões filtradas:', filtered);
    setFilteredRegioes(filtered);
    
    if (filtered.length === 0) {
      showNotification('error', 'Nenhuma região encontrada com os critérios pesquisados');
    } else {
      showNotification('success', `${filtered.length} região(ões) encontrada(s)`);
    }
  };

  // Função para incluir nova região
  const handleIncluir = async () => {
    if (!nomeRegiao.trim()) {
      showNotification('error', 'Por favor, informe o nome da região.');
      return;
    }
    if (!ufRegiao) {
      showNotification('error', 'Por favor, selecione a UF.');
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
        showNotification('success', 'Região cadastrada com sucesso!');
        handleLimpar();
        await carregarRegioes();
        await carregarGrupos(); // Recarregar grupos para sincronizar
        setShowNewRegionModal(false);
      } else {
        const error = await response.json();
        showNotification('error', `Erro ao cadastrar região: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao cadastrar região:', error);
      showNotification('error', 'Erro ao cadastrar região. Tente novamente.');
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
    setCidades([]); // Limpar cidades ao limpar formulário
  };

  // Função para retornar (fechar modal)
  const handleRetornar = () => {
    handleLimpar();
    setShowNewRegionModal(false);
  };

  // Função para abrir modal de visualização
  const handleVisualizarRegiao = (regiao: Regiao) => {
    setRegiaoVisualizando(regiao);
    setShowViewRegionModal(true);
  };

  // Função para fechar modal de visualização
  const handleFecharVisualizacao = () => {
    setShowViewRegionModal(false);
    setRegiaoVisualizando(null);
  };

  // Função para abrir modal de edição
  const handleEditarRegiao = (regiao: Regiao) => {
    setRegiaoEditando(regiao);
    setNomeRegiao(regiao.nome);
    setDescricaoRegiao(regiao.descricao || '');
    setUfRegiao(regiao.uf);
    setCidadeRegiao(regiao.cidade || '');
    setGrupoSelecionado(regiao.grupo_id ? regiao.grupo_id.toString() : '');
    
    // Carregar cidades da UF ao abrir modal de edição
    if (regiao.uf) {
      buscarCidadesPorUF(regiao.uf);
    }
    
    setShowEditRegionModal(true);
  };

  // Função para salvar edição
  const handleSalvarEdicao = async () => {
    if (!nomeRegiao.trim()) {
      showNotification('error', 'Por favor, informe o nome da região.');
      return;
    }
    if (!ufRegiao) {
      showNotification('error', 'Por favor, selecione a UF.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/regioes/${regiaoEditando?.id}`, {
        method: 'PUT',
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
        showNotification('success', 'Região atualizada com sucesso!');
        handleLimpar();
        await carregarRegioes();
        setShowEditRegionModal(false);
        setRegiaoEditando(null);
      } else {
        const error = await response.json();
        showNotification('error', `Erro ao atualizar região: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar região:', error);
      showNotification('error', 'Erro ao atualizar região. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para fechar modal de edição
  const handleFecharEdicao = () => {
    handleLimpar();
    setShowEditRegionModal(false);
    setRegiaoEditando(null);
  };

  // Função para abrir modal de inativação (soft delete)
  const handleInativarRegiao = (regiao: Regiao) => {
    setRegiaoExcluindo(regiao);
    setShowDeleteModal(true);
  };

  // Função para abrir modal de exclusão definitiva (apenas SUPER_ADMIN)
  const handleExcluirDefinitivo = (regiao: Regiao) => {
    setRegiaoExcluindoDefinitivo(regiao);
    setShowDeleteDefinitivoModal(true);
  };

  // Função para confirmar inativação (soft delete - marcar como inativo)
  const handleConfirmarExclusao = async () => {
    if (!regiaoExcluindo) return;
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/regioes/${regiaoExcluindo.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome: regiaoExcluindo.nome,
          descricao: regiaoExcluindo.descricao,
          uf: regiaoExcluindo.uf,
          cidade: regiaoExcluindo.cidade,
          grupo_id: regiaoExcluindo.grupo_id,
          status: 'inativo'
        })
      });

      if (response.ok) {
        showNotification('success', 'Região inativada com sucesso!');
        await carregarRegioes();
        setShowDeleteModal(false);
        setRegiaoExcluindo(null);
      } else {
        const error = await response.json();
        showNotification('error', `Erro ao inativar região: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao inativar região:', error);
      showNotification('error', 'Erro ao inativar região. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para cancelar inativação
  const handleCancelarExclusao = () => {
    setShowDeleteModal(false);
    setRegiaoExcluindo(null);
  };

  // Função para confirmar exclusão definitiva
  const handleConfirmarExclusaoDefinitiva = async () => {
    if (!regiaoExcluindoDefinitivo) return;
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3001/api/regioes/${regiaoExcluindoDefinitivo.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showNotification('success', 'Região excluída definitivamente!');
        await carregarRegioes();
      } else {
        const error = await response.json();
        showNotification('error', `Erro ao excluir região: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao excluir região:', error);
      showNotification('error', 'Erro ao excluir região. Tente novamente.');
    } finally {
      setIsSubmitting(false);
      setShowDeleteDefinitivoModal(false);
      setRegiaoExcluindoDefinitivo(null);
    }
  };

  // Função para cancelar exclusão definitiva
  const handleCancelarExclusaoDefinitiva = () => {
    setShowDeleteDefinitivoModal(false);
    setRegiaoExcluindoDefinitivo(null);
  };

  // Função para reativar região
  const handleReativarRegiao = async (regiao: Regiao) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3001/api/regioes/${regiao.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome: regiao.nome,
          descricao: regiao.descricao,
          uf: regiao.uf,
          cidade: regiao.cidade,
          grupo_id: regiao.grupo_id,
          status: 'ativo'
        })
      });

      if (response.ok) {
        showNotification('success', 'Região reativada com sucesso!');
        await carregarRegioes();
      } else {
        const error = await response.json();
        showNotification('error', `Erro ao reativar região: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao reativar região:', error);
      showNotification('error', 'Erro ao reativar região. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para buscar cidades por UF usando API do IBGE
  const buscarCidadesPorUF = async (uf: string) => {
    if (!uf) {
      setCidades([]);
      return;
    }

    setLoadingCidades(true);
    try {
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
      
      if (response.ok) {
        const data = await response.json();
        const cidadesFormatadas: Cidade[] = data.map((cidade: any) => ({
          id: cidade.id,
          nome: cidade.nome
        })).sort((a: Cidade, b: Cidade) => a.nome.localeCompare(b.nome));
        
        setCidades(cidadesFormatadas);
      } else {
        console.error('Erro ao buscar cidades:', response.status);
        setCidades([]);
        showNotification('error', 'Erro ao carregar cidades. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao buscar cidades:', error);
      setCidades([]);
      showNotification('error', 'Erro de conexão ao carregar cidades.');
    } finally {
      setLoadingCidades(false);
    }
  };

  // Função para lidar com mudança de UF
  const handleUfChange = (novaUf: string) => {
    setUfRegiao(novaUf);
    setCidadeRegiao(''); // Limpar cidade quando UF mudar
    buscarCidadesPorUF(novaUf);
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
  }, [router, carregarGrupos, carregarRegioes]);

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
  }, [carregarGrupos, carregarRegioes]);


  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Administrador';
      case 'admin':
        return 'Administrador';
      case 'user':
        return 'Usuário';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'user':
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
                  <div className="flex-1 min-w-64 relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pesquisar por Nome
                    </label>
                    <input
                      type="text"
                      value={nomeBusca}
                      onChange={(e) => {
                        const value = formatTexto(e.target.value);
                        setNomeBusca(value);
                        handleAutocompleteSearch(value);
                      }}
                      onFocus={() => {
                        if (nomeBusca.trim()) {
                          handleAutocompleteSearch(nomeBusca);
                        }
                      }}
                      onBlur={() => {
                        // Delay para permitir seleção do item
                        setTimeout(() => setShowAutocomplete(false), 200);
                      }}
                      placeholder="Digite o nome da região para buscar (apenas letras)..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                    />
                    
                    {/* Dropdown do autocomplete */}
                    {showAutocomplete && autocompleteResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {autocompleteResults.map((regiao) => (
                          <div
                            key={regiao.id}
                            onClick={() => handleSelectAutocomplete(regiao)}
                            className="px-4 py-3 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">{regiao.nome}</div>
                            <div className="text-sm text-gray-500">
                              📍 {regiao.uf}{regiao.cidade ? ` - ${regiao.cidade}` : ''}
                              {regiao.grupo_id && (
                                <span className="ml-2 text-blue-600">
                                  👥 {grupos.find(g => g.id === regiao.grupo_id)?.nome || 'Grupo'}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
                      {gruposAtivos.map(grupo => (
                        <option key={grupo.id} value={grupo.id}>{grupo.nome}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Situação
                    </label>
                    <select 
                      value={situacaoBusca}
                      onChange={(e) => setSituacaoBusca(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                    >
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
                  
                  <button 
                    onClick={carregarRegioes}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    RECARREGAR
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
                          onChange={(e) => setNomeRegiao(formatTexto(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                          placeholder="Digite o nome da região (apenas letras)"
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
                          {gruposAtivos.map(grupo => (
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
                          onChange={(e) => handleUfChange(e.target.value)}
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
                          Cidade 
                        </label>
                        <select
                          value={cidadeRegiao}
                          onChange={(e) => setCidadeRegiao(e.target.value)}
                          disabled={!ufRegiao || loadingCidades}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <option value="">
                            {!ufRegiao 
                              ? 'Selecione primeiro a UF' 
                              : loadingCidades 
                                ? 'Carregando cidades...' 
                                : 'Selecione uma cidade'
                            }
                          </option>
                          {cidades.map(cidade => (
                            <option key={cidade.id} value={cidade.nome}>
                              {cidade.nome}
                            </option>
                          ))}
                        </select>
                        {loadingCidades && (
                          <p className="text-xs text-blue-500 mt-1 flex items-center">
                            <svg className="animate-spin h-3 w-3 mr-1" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Buscando cidades...
                          </p>
                        )}
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
                      {permissions.regioes.canCreate && (
                        <button 
                          onClick={handleIncluir}
                          disabled={isSubmitting}
                          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? 'INCLUINDO...' : 'INCLUIR'}
                        </button>
                      )}
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
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-1/2">Nome</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 w-32">Grupo</th>
                        <th className="px-12 py-3 text-center text-sm font-medium text-gray-700 w-32">Situação</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 w-48">Ações</th>
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
                            <td className="px-4 py-3 text-sm text-center text-gray-500">
                              {regiao.grupo_id ? 
                                grupos.find(g => g.id === regiao.grupo_id)?.nome || 'Grupo não encontrado'
                                : '-'
                              }
                            </td>
                            <td className="px-12 py-3 text-sm text-center">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                regiao.status === 'ativo' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {regiao.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex space-x-2 justify-center">
                                <button className="text-green-600 hover:text-green-800 text-xs font-medium cursor-pointer" onClick={() => handleVisualizarRegiao(regiao)}>
                                  Visualizar
                                </button>
                                {permissions.regioes.canEdit && (
                                  <button className="text-blue-600 hover:text-blue-800 text-xs font-medium cursor-pointer" onClick={() => handleEditarRegiao(regiao)}>
                                    Editar
                                  </button>
                                )}
                                {/* Botão Reativar - apenas para ADMIN e SUPER_ADMIN quando a região está inativa */}
                                {(user?.role === 'admin' || user?.role === 'super_admin') && regiao.status === 'inativo' && (
                                  <button 
                                    className="text-emerald-600 hover:text-emerald-800 text-xs font-medium cursor-pointer" 
                                    onClick={() => handleReativarRegiao(regiao)}
                                  >
                                    Reativar
                                  </button>
                                )}
                                {/* Botão Inativar - apenas para ADMIN e SUPER_ADMIN quando a região está ativa */}
                                {(user?.role === 'admin' || user?.role === 'super_admin') && regiao.status === 'ativo' && (
                                  <button 
                                    className="text-orange-600 hover:text-orange-800 text-xs font-medium cursor-pointer" 
                                    onClick={() => handleInativarRegiao(regiao)}
                                  >
                                    Inativar
                                  </button>
                                )}
                                {/* Botão Excluir (físico) - apenas para SUPER_ADMIN */}
                                {user?.role === 'super_admin' && (
                                  <button 
                                    className="text-red-600 hover:text-red-800 text-xs font-medium cursor-pointer" 
                                    onClick={() => handleExcluirDefinitivo(regiao)}
                                  >
                                    Excluir
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td 
                            colSpan={4} 
                            className="px-4 py-8 text-center text-gray-500"
                          >
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

      {/* Modal de Visualização */}
      {showViewRegionModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-bold text-[#1D3C44] mb-4">Visualizar Região</h3>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Dados cadastrais</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={regiaoVisualizando?.nome || ''}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grupo
                    </label>
                    <input
                      type="text"
                      value={regiaoVisualizando?.grupo_id ? 
                        grupos.find(g => g.id === regiaoVisualizando?.grupo_id)?.nome || 'Grupo não encontrado'
                        : 'Nenhum grupo associado'
                      }
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      UF (Estado)
                    </label>
                    <input
                      type="text"
                      value={regiaoVisualizando?.uf || ''}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={regiaoVisualizando?.cidade || 'Não informado'}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    value={regiaoVisualizando?.descricao || 'Não informado'}
                    readOnly
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleFecharVisualizacao}
                    className="bg-gray-400 hover:bg-gray-500 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    FECHAR
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {showEditRegionModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-bold text-[#1D3C44] mb-4">Editar Região</h3>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Dados cadastrais</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={nomeRegiao}
                      onChange={(e) => setNomeRegiao(formatTexto(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                      placeholder="Digite o nome da região (apenas letras)"
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
                      {gruposAtivos.map(grupo => (
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
                      onChange={(e) => handleUfChange(e.target.value)}
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
                    <select
                      value={cidadeRegiao}
                      onChange={(e) => setCidadeRegiao(e.target.value)}
                      disabled={!ufRegiao || loadingCidades}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {!ufRegiao 
                          ? 'Selecione primeiro a UF' 
                          : loadingCidades 
                            ? 'Carregando cidades...' 
                            : 'Selecione uma cidade'
                        }
                      </option>
                      {cidades.map(cidade => (
                        <option key={cidade.id} value={cidade.nome}>
                          {cidade.nome}
                        </option>
                      ))}
                    </select>
                    {loadingCidades && (
                      <p className="text-xs text-blue-500 mt-1 flex items-center">
                        <svg className="animate-spin h-3 w-3 mr-1" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Buscando cidades...
                      </p>
                    )}
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
                    onClick={handleSalvarEdicao}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'SALVANDO...' : 'SALVAR'}
                  </button>
                  <button
                    onClick={handleLimpar}
                    className="bg-blue-400 hover:bg-blue-500 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    LIMPAR
                  </button>
                  <button
                    onClick={handleFecharEdicao}
                    className="bg-gray-400 hover:bg-gray-500 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    RETORNAR
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Inativação */}
      {showDeleteModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Confirmar Inativação</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Tem certeza que deseja inativar a região &quot;{regiaoExcluindo?.nome}&quot;?
                  </p>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Atenção:</strong> A região será marcada como inativa e não aparecerá mais nos seletores. Esta ação pode ser revertida alterando o status para ativo novamente.
                </p>
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleCancelarExclusao}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg text-sm transition-all duration-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmarExclusao}
                  disabled={isSubmitting}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Inativando...' : 'Sim, Inativar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão Definitiva */}
      {showDeleteDefinitivoModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Excluir Definitivamente</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Tem certeza que deseja excluir DEFINITIVAMENTE a região &quot;{regiaoExcluindoDefinitivo?.nome}&quot;?
                  </p>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800">
                  <strong>ATENÇÃO:</strong> Esta ação é irreversível! A região será excluída permanentemente do banco de dados e não poderá ser recuperada.
                </p>
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleCancelarExclusaoDefinitiva}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg text-sm transition-all duration-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmarExclusaoDefinitiva}
                  disabled={isSubmitting}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Excluindo...' : 'Sim, Excluir Definitivamente'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 