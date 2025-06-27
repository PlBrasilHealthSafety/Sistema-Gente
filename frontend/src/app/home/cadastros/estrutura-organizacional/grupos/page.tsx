'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatTexto } from '@/utils/masks';
import { usePermissions } from '@/hooks/usePermissions';
import PontoFocalTooltip from '@/components/PontoFocalTooltip';
import MultiplePontoFocalManager from '@/components/MultiplePontoFocalManager';
import MultiplePontoFocalViewer from '@/components/MultiplePontoFocalViewer';
import { PontoFocal } from '@/types/pontoFocal';

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

interface GrupoPontoFocal {
  id: number;
  grupo_id: number;
  nome: string;
  descricao?: string;
  observacoes?: string;
  is_principal: boolean;
  ordem: number;
  created_at: string;
  updated_at: string;
  created_by: number;
  updated_by?: number;
}

interface Grupo {
  id: number;
  nome: string;
  descricao?: string;
  ponto_focal_nome?: string;
  ponto_focal_descricao?: string;
  ponto_focal_observacoes?: string;
  ponto_focal_principal?: boolean;
  pontos_focais?: GrupoPontoFocal[];
  status: 'ativo' | 'inativo';
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
}



export default function GruposPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Hook de permissões
  const permissions = usePermissions(user);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [nomeGrupo, setNomeGrupo] = useState('');
  const [nomeBusca, setNomeBusca] = useState('');
  const [descricaoGrupo, setDescricaoGrupo] = useState('');
  const [showPontoFocal, setShowPontoFocal] = useState(false);
  const [pontosFocais, setPontosFocais] = useState<PontoFocal[]>([]);
  
  // Estados para compatibilidade (removidos pois agora usamos pontosFocais)
  // const [pontoFocalNome, setPontoFocalNome] = useState('');
  // const [pontoFocalDescricao, setPontoFocalDescricao] = useState('');
  // const [pontoFocalObservacoes, setPontoFocalObservacoes] = useState('');
  // const [pontoFocalPrincipal, setPontoFocalPrincipal] = useState(false);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [filteredGrupos, setFilteredGrupos] = useState<Grupo[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<NotificationMessage>({
    type: 'success',
    message: '',
    show: false
  });
  const [showEditGroupModal, setShowEditGroupModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeleteDefinitivoModal, setShowDeleteDefinitivoModal] = useState(false);
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [grupoEditando, setGrupoEditando] = useState<Grupo | null>(null);
  const [grupoExcluindo, setGrupoExcluindo] = useState<Grupo | null>(null);
  const [grupoExcluindoDefinitivo, setGrupoExcluindoDefinitivo] = useState<Grupo | null>(null);
  const [grupoReativando, setGrupoReativando] = useState<Grupo | null>(null);
  const [showViewGroupModal, setShowViewGroupModal] = useState(false);
  const [grupoVisualizando, setGrupoVisualizando] = useState<Grupo | null>(null);
  const [showPontoFocalVisualizacao, setShowPontoFocalVisualizacao] = useState(false);
  const [pontosFocaisVisualizacao, setPontosFocaisVisualizacao] = useState<PontoFocal[]>([]);

  // Estados para o autocomplete
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteResults, setAutocompleteResults] = useState<Grupo[]>([]);
  const [situacaoBusca, setSituacaoBusca] = useState('ativo');

  // Função para exibir notificação
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message, show: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // Função para destacar texto pesquisado
  const destacarTexto = (texto: string, busca: string) => {
    if (!busca.trim()) return texto;
    
    const regex = new RegExp(`(${busca.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const partes = texto.split(regex);
    
    return partes.map((parte, index) => {
      if (parte.toLowerCase() === busca.toLowerCase()) {
        return <span key={index} className="bg-gray-200 text-gray-700 font-medium">{parte}</span>;
      }
      return parte;
    });
  };

  // Função para aplicar filtros automaticamente
  const aplicarFiltrosAutomaticos = useCallback((nome: string = nomeBusca, situacao: string = situacaoBusca) => {
    if (!Array.isArray(grupos) || grupos.length === 0) {
      setFilteredGrupos([]);
      return;
    }

    let filtered = grupos;

    // Filtrar por nome se houver busca
    if (nome.trim()) {
      filtered = filtered.filter(grupo => 
        grupo.nome.toLowerCase().includes(nome.toLowerCase())
      );
    }

    // Filtrar por situação se não for "todos"
    if (situacao && situacao !== 'todos') {
      const status = situacao === 'ativo' ? 'ativo' : 'inativo';
      filtered = filtered.filter(grupo => grupo.status === status);
    }

    setFilteredGrupos(filtered);
    
    // Mostrar notificação apenas se houver filtros aplicados
    if (nome.trim() || (situacao && situacao !== 'todos')) {
      if (filtered.length === 0) {
        showNotification('error', 'Nenhum grupo encontrado com os critérios aplicados');
      } else {
        showNotification('success', `${filtered.length} grupo(s) encontrado(s)`);
      }
    }
  }, [grupos, nomeBusca, situacaoBusca]);

  // useEffect para aplicar filtros automaticamente quando situação muda
  useEffect(() => {
    if (grupos.length > 0) {
      aplicarFiltrosAutomaticos(nomeBusca, situacaoBusca);
    }
  }, [situacaoBusca, grupos, aplicarFiltrosAutomaticos, nomeBusca]);

  // Função para filtrar grupos em tempo real (autocomplete)
  const handleAutocompleteSearch = (value: string) => {
    if (!value.trim()) {
      setShowAutocomplete(false);
      setAutocompleteResults([]);
      // Aplicar filtros mesmo sem texto de busca
      aplicarFiltrosAutomaticos('', situacaoBusca);
      return;
    }

    if (!Array.isArray(grupos)) {
      setShowAutocomplete(false);
      setAutocompleteResults([]);
      return;
    }

    const filtered = grupos.filter(grupo => 
      grupo.nome.toLowerCase().includes(value.toLowerCase())
    ).slice(0, 5); // Limitar a 5 resultados

    setAutocompleteResults(filtered);
    setShowAutocomplete(filtered.length > 0);
    
    // Aplicar filtros em tempo real
    aplicarFiltrosAutomaticos(value, situacaoBusca);
  };

  // Função para selecionar item do autocomplete
  const handleSelectAutocomplete = (grupo: Grupo) => {
    setNomeBusca(grupo.nome);
    setShowAutocomplete(false);
    // Aplicar filtro automaticamente
    aplicarFiltrosAutomaticos(grupo.nome, situacaoBusca);
  };

  // Função para carregar grupos
  const carregarGrupos = useCallback(async () => {
    console.log('=== CARREGANDO GRUPOS ===');
    
    // Limpar campos de pesquisa quando recarregar
    setNomeBusca('');
    setSituacaoBusca('ativo');
    setShowAutocomplete(false);
    setAutocompleteResults([]);
    
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
  }, []);

  // Função para procurar grupos (botão Procurar)
  const handleProcurar = () => {
    console.log('=== DEBUG BUSCA ===');
    console.log('nomeBusca:', nomeBusca);
    console.log('grupos array:', grupos);
    console.log('grupos length:', grupos?.length);
    
    // Fechar autocomplete ao usar o botão
    setShowAutocomplete(false);
    
    if (!nomeBusca.trim() && situacaoBusca === 'todos') {
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
    let filtered = grupos;

    // Filtrar por nome se houver busca
    if (nomeBusca.trim()) {
      filtered = filtered.filter(grupo => {
        const match = grupo.nome.toLowerCase().includes(nomeBusca.toLowerCase());
        console.log(`Grupo "${grupo.nome}" - Match nome: ${match}`);
        return match;
      });
    }

    // Filtrar por situação se não for "todos"
    if (situacaoBusca !== 'todos') {
      const status = situacaoBusca === 'ativo' ? 'ativo' : 'inativo';
      filtered = filtered.filter(grupo => {
        const match = grupo.status === status;
        console.log(`Grupo "${grupo.nome}" - Match situação: ${match}`);
        return match;
      });
    }
    
    console.log('Grupos filtrados:', filtered);
    setFilteredGrupos(filtered);
    
    if (filtered.length === 0) {
      showNotification('error', 'Nenhum grupo encontrado com o nome pesquisado');
    } else {
      showNotification('success', `${filtered.length} grupo(s) encontrado(s)`);
    }
  };

  // Função helper para mapear pontos focais para envio ao backend
  const mapearPontosFocaisParaBackend = (pontosFocais: PontoFocal[]) => {
    return pontosFocais.map(pf => ({
      nome: pf.nome,
      cargo: pf.cargo,
      descricao: pf.descricao,
      observacoes: pf.observacoes,
      telefone: pf.telefone,
      email: pf.email,
      is_principal: pf.isPrincipal,
      ordem: pontosFocais.indexOf(pf) + 1
    }));
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
      
      // Usar o ponto focal principal se há múltiplos pontos focais
      const pontoFocalPrincipal = pontosFocais.find(pf => pf.isPrincipal);
      
      const dadosParaEnviar = {
        nome: nomeGrupo,
        descricao: descricaoGrupo || null,
        ponto_focal_nome: pontoFocalPrincipal?.nome || null,
        ponto_focal_descricao: pontoFocalPrincipal?.descricao || null,
        ponto_focal_observacoes: pontoFocalPrincipal?.observacoes || null,
        ponto_focal_principal: !!pontoFocalPrincipal,
        pontos_focais: pontosFocais.length > 0 ? pontosFocais.map(pf => ({
          nome: pf.nome,
          cargo: pf.cargo,
          descricao: pf.descricao,
          observacoes: pf.observacoes,
          telefone: pf.telefone,
          email: pf.email,
          is_principal: pf.isPrincipal,
          ordem: pontosFocais.indexOf(pf) + 1
        })) : null,
      };
      

      
      const response = await fetch('http://localhost:3001/api/grupos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosParaEnviar)
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
    setShowPontoFocal(false);
    setPontosFocais([]);
  };

  // Função para retornar (fechar modal)
  const handleRetornar = () => {
    handleLimpar();
    setShowNewGroupModal(false);
  };

  // Função para abrir modal de edição
  const handleEditarGrupo = (grupo: Grupo) => {
    setGrupoEditando(grupo);
    setNomeGrupo(grupo.nome);
    setDescricaoGrupo(grupo.descricao || '');
    
    // Carregar pontos focais existentes
    const pontosFocaisExistentes: PontoFocal[] = [];
    
    // Primeiro, tentar carregar do array de pontos focais (nova estrutura)
    if (grupo.pontos_focais && Array.isArray(grupo.pontos_focais) && grupo.pontos_focais.length > 0) {
      grupo.pontos_focais.forEach((pf: any) => {
        pontosFocaisExistentes.push({
          id: pf.id.toString(),
          nome: pf.nome || '',
          cargo: pf.cargo || '',
          descricao: pf.descricao || '',
          observacoes: pf.observacoes || '',
          telefone: pf.telefone || '',
          email: pf.email || '',
          isPrincipal: pf.is_principal || false
        });
      });
    } 
    // Fallback: carregar dos campos antigos (compatibilidade)
    else if (grupo.ponto_focal_nome || grupo.ponto_focal_descricao || grupo.ponto_focal_observacoes) {
      pontosFocaisExistentes.push({
        id: 'existing',
        nome: grupo.ponto_focal_nome || '',
        cargo: '',
        descricao: grupo.ponto_focal_descricao || '',
        observacoes: grupo.ponto_focal_observacoes || '',
        telefone: '',
        email: '',
        isPrincipal: grupo.ponto_focal_principal || false
      });
    }
    
    setPontosFocais(pontosFocaisExistentes);
    setShowPontoFocal(pontosFocaisExistentes.length > 0);
    
    setShowEditGroupModal(true);
  };

  // Função para salvar edição
  const handleSalvarEdicao = async () => {
    if (!nomeGrupo.trim()) {
      showNotification('error', 'Por favor, informe o nome do grupo.');
      return;
    }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      // Usar o ponto focal principal se há múltiplos pontos focais
      const pontoFocalPrincipal = pontosFocais.find(pf => pf.isPrincipal);
      
      const dadosParaEnviar = {
        nome: nomeGrupo,
        descricao: descricaoGrupo || null,
        ponto_focal_nome: pontoFocalPrincipal?.nome || null,
        ponto_focal_descricao: pontoFocalPrincipal?.descricao || null,
        ponto_focal_observacoes: pontoFocalPrincipal?.observacoes || null,
        ponto_focal_principal: !!pontoFocalPrincipal,
        pontos_focais: pontosFocais.length > 0 ? pontosFocais.map(pf => ({
          nome: pf.nome,
          cargo: pf.cargo,
          descricao: pf.descricao,
          observacoes: pf.observacoes,
          telefone: pf.telefone,
          email: pf.email,
          is_principal: pf.isPrincipal,
          ordem: pontosFocais.indexOf(pf) + 1
        })) : null,
      };
      

      
      const response = await fetch(`http://localhost:3001/api/grupos/${grupoEditando?.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosParaEnviar)
      });
      
      if (response.ok) {
        showNotification('success', 'Grupo atualizado com sucesso!');
        handleLimpar();
        await carregarGrupos();
        setShowEditGroupModal(false);
        setGrupoEditando(null);
      } else {
        const error = await response.json();
        showNotification('error', `Erro ao atualizar grupo: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar grupo:', error);
      showNotification('error', 'Erro ao atualizar grupo. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para fechar modal de edição
  const handleFecharEdicao = () => {
    handleLimpar();
    setShowEditGroupModal(false);
    setGrupoEditando(null);
  };



  // Função para inativar regiões associadas ao grupo
  const inativarRegioesPorGrupo = async (grupoId: number, token: string) => {
    try {
      // Primeiro, buscar todas as regiões do grupo
      const responseRegioes = await fetch(`http://localhost:3001/api/regioes?grupo_id=${grupoId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (responseRegioes.ok) {
        const resultRegioes = await responseRegioes.json();
        const regioes = resultRegioes.success && Array.isArray(resultRegioes.data) ? resultRegioes.data : [];
        
        // Inativar cada região do grupo
        for (const regiao of regioes) {
          if (regiao.grupo_id === grupoId && regiao.status === 'ativo') {
            await fetch(`http://localhost:3001/api/regioes/${regiao.id}`, {
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
                status: 'inativo'
              })
            });
          }
        }
        
        return regioes.filter((r: { grupo_id: number; status: string }) => r.grupo_id === grupoId && r.status === 'ativo').length;
      }
    } catch (error) {
      console.error('Erro ao inativar regiões do grupo:', error);
      return 0;
    }
    return 0;
  };

  // Função para confirmar exclusão (soft delete - marcar como inativo)
  const handleConfirmarExclusao = async () => {
    if (!grupoExcluindo) return;
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      // Primeiro, inativar o grupo
      const response = await fetch(`http://localhost:3001/api/grupos/${grupoExcluindo.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome: grupoExcluindo.nome,
          descricao: grupoExcluindo.descricao,
          status: 'inativo'
        })
      });

      if (response.ok) {
        // Após inativar o grupo, inativar todas as regiões associadas
        const regioesInativadas = await inativarRegioesPorGrupo(grupoExcluindo.id, token || '');
        
        let mensagem = 'Grupo inativado com sucesso!';
        if (regioesInativadas > 0) {
          mensagem += ` ${regioesInativadas} região(ões) também foram inativadas automaticamente.`;
        }
        
        showNotification('success', mensagem);
        await carregarGrupos();
        setShowDeleteModal(false);
        setGrupoExcluindo(null);
      } else {
        const error = await response.json();
        showNotification('error', `Erro ao inativar grupo: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao inativar grupo:', error);
      showNotification('error', 'Erro ao inativar grupo. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para cancelar exclusão
  const handleCancelarExclusao = () => {
    setShowDeleteModal(false);
    setGrupoExcluindo(null);
  };

  // Função para reativar grupo
  const handleReativarGrupo = (grupo: Grupo) => {
    setGrupoReativando(grupo);
    setShowReactivateModal(true);
  };

  const handleConfirmarReativacao = async () => {
    if (!grupoReativando) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3001/api/grupos/${grupoReativando.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nome: grupoReativando.nome,
          descricao: grupoReativando.descricao,
          status: 'ativo'
        })
      });

      if (response.ok) {
        showNotification('success', 'Grupo reativado com sucesso!');
        await carregarGrupos();
      } else {
        const error = await response.json();
        showNotification('error', `Erro ao reativar grupo: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao reativar grupo:', error);
      showNotification('error', 'Erro ao reativar grupo. Tente novamente.');
    } finally {
      setIsSubmitting(false);
      setShowReactivateModal(false);
      setGrupoReativando(null);
    }
  };

  const handleCancelarReativacao = () => {
    setShowReactivateModal(false);
    setGrupoReativando(null);
  };

  // Função para inativar grupo (soft delete) - igual ao antigo handleExcluirGrupo
  const handleInativarGrupo = (grupo: Grupo) => {
    setGrupoExcluindo(grupo);
    setShowDeleteModal(true);
  };

  // Função para abrir modal de exclusão definitiva (apenas SUPER_ADMIN)
  const handleExcluirDefinitivo = (grupo: Grupo) => {
    setGrupoExcluindoDefinitivo(grupo);
    setShowDeleteDefinitivoModal(true);
  };

  // Função para confirmar exclusão definitiva
  const handleConfirmarExclusaoDefinitiva = async () => {
    if (!grupoExcluindoDefinitivo) return;
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://localhost:3001/api/grupos/${grupoExcluindoDefinitivo.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showNotification('success', 'Grupo excluído definitivamente!');
        await carregarGrupos();
      } else {
        const error = await response.json();
        showNotification('error', `Erro ao excluir grupo: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao excluir grupo:', error);
      showNotification('error', 'Erro ao excluir grupo. Tente novamente.');
    } finally {
      setIsSubmitting(false);
      setShowDeleteDefinitivoModal(false);
      setGrupoExcluindoDefinitivo(null);
    }
  };

  // Função para cancelar exclusão definitiva
  const handleCancelarExclusaoDefinitiva = () => {
    setShowDeleteDefinitivoModal(false);
    setGrupoExcluindoDefinitivo(null);
  };

  // Função para abrir modal de visualização
  const handleVisualizarGrupo = (grupo: Grupo) => {
    setGrupoVisualizando(grupo);
    
    // Carregar pontos focais existentes
    const pontosFocaisExistentes: PontoFocal[] = [];
    
    // Primeiro, tentar carregar do array de pontos focais (nova estrutura)
    if (grupo.pontos_focais && Array.isArray(grupo.pontos_focais) && grupo.pontos_focais.length > 0) {
      grupo.pontos_focais.forEach((pf: any, index: number) => {
        pontosFocaisExistentes.push({
          id: pf.id?.toString() || `pf-${index}`,
          nome: pf.nome || '',
          cargo: pf.cargo || '',
          descricao: pf.descricao || '',
          observacoes: pf.observacoes || '',
          telefone: pf.telefone || '',
          email: pf.email || '',
          isPrincipal: pf.is_principal || false
        });
      });
    } 
    // Fallback: carregar dos campos antigos (compatibilidade)
    else if (grupo.ponto_focal_nome || grupo.ponto_focal_descricao || grupo.ponto_focal_observacoes) {
      pontosFocaisExistentes.push({
        id: 'existing',
        nome: grupo.ponto_focal_nome || '',
        cargo: '', // Campo não existe na estrutura antiga
        descricao: grupo.ponto_focal_descricao || '',
        observacoes: grupo.ponto_focal_observacoes || '',
        telefone: '', // Campo não existe na estrutura antiga
        email: '', // Campo não existe na estrutura antiga
        isPrincipal: grupo.ponto_focal_principal || false
      });
    }
    
    setPontosFocaisVisualizacao(pontosFocaisExistentes);
    setShowPontoFocalVisualizacao(pontosFocaisExistentes.length > 0); // Abrir automaticamente se houver pontos focais
    setShowViewGroupModal(true);
  };

  // Função para fechar modal de visualização
  const handleFecharVisualizacao = () => {
    setShowViewGroupModal(false);
    setGrupoVisualizando(null);
    setPontosFocaisVisualizacao([]);
    setShowPontoFocalVisualizacao(false);
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
  }, [router, carregarGrupos]);

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
                      placeholder="Digite o nome do grupo para buscar (apenas letras)..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                    />
                    
                    {/* Dropdown do autocomplete */}
                    {showAutocomplete && autocompleteResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {autocompleteResults.map((grupo) => (
                          <div
                            key={grupo.id}
                            onClick={() => handleSelectAutocomplete(grupo)}
                            className="px-4 py-3 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">{destacarTexto(grupo.nome, nomeBusca)}</div>
                            {grupo.descricao && (
                              <div className="text-sm text-gray-500">{destacarTexto(grupo.descricao, nomeBusca)}</div>
                            )}
                            <div className="text-xs text-blue-600 mt-1">
                              Status: {grupo.status}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
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
                    onClick={() => setShowNewGroupModal(true)}
                    className="bg-[#00A298] hover:bg-[#1D3C44] text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    NOVO GRUPO
                  </button>
                  
                                      <button 
                      onClick={carregarGrupos}
                      className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                    >
                      ATUALIZAR
                    </button>
                </div>
              </div>

              {/* Container de Novo Cadastro */}
              {showNewGroupModal && (
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-[#1D3C44] mb-4">Cadastro de Grupos</h3>
                  
                  {/* Legenda de campos obrigatórios */}
                  <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center text-sm text-blue-800">
                      <span className="text-red-500 mr-2 font-bold">*</span>
                      <span className="font-medium">Campos obrigatórios</span>
                      <span className="mx-2">•</span>
                      <span className="text-blue-600">Preencha todos os campos marcados com asterisco para continuar</span>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Dados cadastrais</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nome <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={nomeGrupo}
                          onChange={(e) => setNomeGrupo(formatTexto(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                          placeholder="Digite o nome do grupo (apenas letras)"
                        />
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

                    {/* Seção de Múltiplos Pontos Focais - apenas para usuários com permissão */}
                    {permissions.canViewSensitive && (
                      <MultiplePontoFocalManager
                        pontosFocais={pontosFocais}
                        onPontosFocaisChange={setPontosFocais}
                        showSection={showPontoFocal}
                        onToggleSection={() => setShowPontoFocal(!showPontoFocal)}
                      />
                    )}

                    <div className="flex gap-3 mt-6">
                      {permissions.grupos.canCreate && (
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
                        VOLTAR
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tabela de resultados - só mostra quando não está no modo de cadastro */}
              {!showNewGroupModal && (
                <div className="p-6">
                  <div className="border border-gray-200 rounded-lg">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-1/2">Nome</th>
                          {permissions.canViewSensitive && (
                            <th className="px-11 py-3 text-center text-sm font-medium text-gray-700 w-100">Ponto Focal</th>
                          )}
                          <th className="px-12 py-3 text-center text-sm font-medium text-gray-700 w-32">Situação</th>
                          <th className="px-12 py-3 text-center text-sm font-medium text-gray-700 w-48">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredGrupos && Array.isArray(filteredGrupos) && filteredGrupos.length > 0 ? (
                          filteredGrupos.map((grupo) => (
                            <tr key={grupo.id} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm">
                                <div>
                                  <div className="font-medium text-gray-900">{destacarTexto(grupo.nome, nomeBusca)}</div>
                                  {grupo.descricao && (
                                    <div className="text-gray-500 text-xs mt-1">{destacarTexto(grupo.descricao, nomeBusca)}</div>
                                  )}

                                </div>
                              </td>
                              {permissions.canViewSensitive && (
                                <td className="px-12 py-3 text-center">
                                  <PontoFocalTooltip data={grupo} />
                                </td>
                              )}
                              <td className="px-12 py-3 text-sm text-center">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  grupo.status === 'ativo' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {grupo.status}
                                </span>
                              </td>
                              <td className="px-12 py-3 text-sm">
                <div className="flex space-x-2 justify-center">
                  <button className="text-green-600 hover:text-green-800 text-xs font-medium cursor-pointer" onClick={() => handleVisualizarGrupo(grupo)}>
                    Visualizar
                  </button>
                  {permissions.grupos.canEdit && (
                    <button className="text-blue-600 hover:text-blue-800 text-xs font-medium cursor-pointer" onClick={() => handleEditarGrupo(grupo)}>
                      Editar
                    </button>
                  )}
                  {/* Botão Reativar - apenas para ADMIN e SUPER_ADMIN quando o grupo está inativo */}
                  {(user?.role === 'admin' || user?.role === 'super_admin') && grupo.status === 'inativo' && (
                    <button 
                      className="text-emerald-600 hover:text-emerald-800 text-xs font-medium cursor-pointer" 
                      onClick={() => handleReativarGrupo(grupo)}
                    >
                      Reativar
                    </button>
                  )}
                  {/* Botão Inativar - apenas para ADMIN e SUPER_ADMIN quando o grupo está ativo */}
                  {(user?.role === 'admin' || user?.role === 'super_admin') && grupo.status === 'ativo' && (
                    <button 
                      className="text-orange-600 hover:text-orange-800 text-xs font-medium cursor-pointer" 
                      onClick={() => handleInativarGrupo(grupo)}
                    >
                      Inativar
                    </button>
                  )}
                  {/* Botão Excluir (físico) - apenas para SUPER_ADMIN */}
                  {user?.role === 'super_admin' && (
                    <button 
                      className="text-red-600 hover:text-red-800 text-xs font-medium cursor-pointer" 
                      onClick={() => handleExcluirDefinitivo(grupo)}
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
                              colSpan={
                                3 + 
                                (permissions.canViewSensitive ? 1 : 0)
                              } 
                              className="px-4 py-8 text-center text-gray-500"
                            >
                              {nomeBusca ? 'Nenhum grupo encontrado com o nome pesquisado' : 'Não existem dados para mostrar'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

              {/* Modal de Visualização */}
        {showViewGroupModal && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-bold text-[#1D3C44] mb-4">Visualizar Grupo</h3>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Dados cadastrais</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={grupoVisualizando?.nome || ''}
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
                    value={grupoVisualizando?.descricao || ''}
                    readOnly
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  />
                </div>

                {/* Seção de Múltiplos Pontos Focais - apenas para usuários com permissão */}
                {permissions.canViewSensitive && (
                  <MultiplePontoFocalViewer
                    pontosFocais={pontosFocaisVisualizacao}
                    showSection={showPontoFocalVisualizacao}
                    onToggleSection={() => setShowPontoFocalVisualizacao(!showPontoFocalVisualizacao)}
                  />
                )}
                
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
        {showEditGroupModal && (
          <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-bold text-[#1D3C44] mb-4">Editar Grupo</h3>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Dados cadastrais</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={nomeGrupo}
                      onChange={(e) => setNomeGrupo(formatTexto(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                      placeholder="Digite o nome do grupo (apenas letras)"
                    />
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

                {/* Seção de Múltiplos Pontos Focais - apenas para usuários com permissão */}
                {permissions.canViewSensitive && (
                  <MultiplePontoFocalManager
                    pontosFocais={pontosFocais}
                    onPontosFocaisChange={setPontosFocais}
                    showSection={showPontoFocal}
                    onToggleSection={() => setShowPontoFocal(!showPontoFocal)}
                  />
                )}
                
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

              {/* Modal de Confirmação de Exclusão (Inativação) */}
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
                    Tem certeza que deseja inativar o grupo &quot;{grupoExcluindo?.nome}&quot;?
                  </p>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Atenção:</strong> O grupo será marcado como inativo e não aparecerá mais nos seletores. Todas as regiões associadas a este grupo também serão inativadas automaticamente. Esta ação pode ser revertida alterando o status para ativo novamente.
                </p>
              </div>
              
              <div className="flex gap-3 justify-center">
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
                    Tem certeza que deseja excluir DEFINITIVAMENTE o grupo &quot;{grupoExcluindoDefinitivo?.nome}&quot;?
                  </p>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800">
                  <strong>ATENÇÃO:</strong> Esta ação é irreversível! O grupo será excluído permanentemente do banco de dados e não poderá ser recuperado. Certifique-se de que não há empresas ou regiões associadas a este grupo.
                </p>
              </div>
              
              <div className="flex gap-3 justify-center">
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

      {/* Modal de Confirmação de Reativação */}
      {showReactivateModal && grupoReativando && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Confirmar Reativação</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Tem certeza que deseja reativar o grupo "{grupoReativando.nome}"?
                  </p>
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-green-800">
                  <strong>Informação:</strong> O grupo será marcado como ativo e voltará a aparecer nos seletores e relatórios.
                </p>
              </div>
              
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleCancelarReativacao}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg text-sm transition-all duration-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmarReativacao}
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Reativando...' : 'Sim, Reativar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 