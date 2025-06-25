'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { formatTexto, formatCEP, isValidCEP } from '@/utils/masks';
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

interface Profissional {
  id: number;
  nome: string;
  categoria: string;
  sigla_conselho: string;
  numero_conselho: string;
  externo: boolean;
  ofensor: string;
  clinica: string;
  situacao: 'ativo' | 'inativo';
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
}

interface Grupo {
  id: number;
  nome: string;
}

interface Regiao {
  id: number;
  nome: string;
}

export default function CadastroProfissionaisPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Hook de permissões
  const permissions = usePermissions(user);
  
  // Estados para o formulário
  const [showNewProfissionalModal, setShowNewProfissionalModal] = useState(false);
  
  // Dados cadastrais
  const [nomeProfissional, setNomeProfissional] = useState('');
  const [nacionalidade, setNacionalidade] = useState('Brasileiro');
  const [cpf, setCpf] = useState('');
  const [nis, setNis] = useState('');
  const [categoria, setCategoria] = useState('');
  const [siglaConselho, setSiglaConselho] = useState('');
  const [regConselho, setRegConselho] = useState('');
  const [ufConselho, setUfConselho] = useState('');
  const [regMte, setRegMte] = useState('');
  
  // Informações de contato
  const [cep, setCep] = useState('');
  const [tipoLogradouro, setTipoLogradouro] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [ufEndereco, setUfEndereco] = useState('');
  const [cidade, setCidade] = useState('');
  const [bairro, setBairro] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [ddd, setDdd] = useState('');
  const [celular, setCelular] = useState('');
  
  // Informações adicionais
  const [observacao, setObservacao] = useState('');
  const [agendamentoHorario, setAgendamentoHorario] = useState(false);
  const [profissionalExterno, setProfissionalExterno] = useState(false);
  const [assinaturaDigital, setAssinaturaDigital] = useState('');
  const [certificadoDigital, setCertificadoDigital] = useState('');
  const [situacao, setSituacao] = useState('Ativo');
  
  // Campos antigos mantidos para compatibilidade
  const [numeroConselho, setNumeroConselho] = useState('');
  const [externo, setExterno] = useState(false);
  const [ofensor, setOfensor] = useState('');
  const [clinica, setClinica] = useState('');
  
  // Estados para busca
  const [nomeBusca, setNomeBusca] = useState('');
  const [situacaoBusca, setSituacaoBusca] = useState('ativo');
  const [tipoPesquisa, setTipoPesquisa] = useState('nome');
  
  // Estados para dados
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [filteredProfissionais, setFilteredProfissionais] = useState<Profissional[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para notificação
  const [notification, setNotification] = useState<NotificationMessage>({
    type: 'success',
    message: '',
    show: false
  });

  // Estados para o autocomplete
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteResults, setAutocompleteResults] = useState<Profissional[]>([]);

  // Estados para CEP e endereço
  const [, setGrupos] = useState<Grupo[]>([]);
  const [, setRegioes] = useState<Regiao[]>([]);
  const [gruposAtivos, setGruposAtivos] = useState<Grupo[]>([]);
  const [regioesAtivas, setRegioesAtivas] = useState<Regiao[]>([]);
  const [regioesFiltroFiltradas, setRegioesFiltroFiltradas] = useState<Regiao[]>([]);

  // Estados para CEP e endereço
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState('');

  // Estados para validação de campos obrigatórios
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Função para exibir notificação
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message, show: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // Função para buscar CEP
  const buscarCep = async (cepValue: string) => {
    const cepLimpo = cepValue.replace(/\D/g, '');
    
    if (cepLimpo.length === 8) {
      setLoadingCep(true);
      setCepError('');
      
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setLogradouro(data.logradouro || '');
          setBairro(data.bairro || '');
          setCidade(data.localidade || '');
          setUfEndereco(data.uf || '');
          setTipoLogradouro(data.logradouro ? data.logradouro.split(' ')[0] : '');
          setCepError('');
        } else {
          setCepError('CEP não encontrado. Verifique o número digitado.');
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
        setCepError('Erro ao buscar CEP. Verifique sua conexão e tente novamente.');
      } finally {
        setLoadingCep(false);
      }
    }
  };

  // Handler para mudança no CEP
  const handleCepChange = (value: string) => {
    const formattedCep = formatCEP(value);
    setCep(formattedCep);
    
    if (cepError) {
      setCepError('');
    }
    
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 8) {
      buscarCep(numbers);
    }
  };

  // Função para formatar CPF
  const formatCPF = (value: string) => {
    // Remove tudo que não é dígito
    const onlyNumbers = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const limitedNumbers = onlyNumbers.slice(0, 11);
    
    // Aplica a formatação
    if (limitedNumbers.length <= 3) {
      return limitedNumbers;
    } else if (limitedNumbers.length <= 6) {
      return limitedNumbers.replace(/(\d{3})(\d+)/, '$1.$2');
    } else if (limitedNumbers.length <= 9) {
      return limitedNumbers.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
    } else {
      return limitedNumbers.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4');
    }
  };

  // Função para validar campos obrigatórios
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar nome
    if (!nomeProfissional.trim()) {
      newErrors.nomeProfissional = 'Nome é obrigatório';
    }

    // Validar nacionalidade
    if (!nacionalidade.trim()) {
      newErrors.nacionalidade = 'Nacionalidade é obrigatória';
    }

    // Validar CPF
    if (!cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else {
      // Remover pontos e traços para validar apenas números
      const cpfNumeros = cpf.replace(/[.-]/g, '');
      if (cpfNumeros.length !== 11 || !/^\d{11}$/.test(cpfNumeros)) {
        newErrors.cpf = 'CPF deve conter exatamente 11 números';
      }
    }

    // Validar categoria
    if (!categoria.trim()) {
      newErrors.categoria = 'Categoria é obrigatória';
    }

    // Validar sigla do conselho
    if (!siglaConselho.trim()) {
      newErrors.siglaConselho = 'Sigla do conselho é obrigatória';
    }

    // Validar registro do conselho
    if (!regConselho.trim()) {
      newErrors.regConselho = 'Registro do conselho é obrigatório';
    }

    // Validar UF do conselho
    if (!ufConselho.trim()) {
      newErrors.ufConselho = 'UF do conselho é obrigatória';
    }

    // Validar CEP
    if (!cep.trim()) {
      newErrors.cep = 'CEP é obrigatório';
    } else if (!isValidCEP(cep)) {
      newErrors.cep = 'CEP deve ter 8 dígitos';
    }

    // Validar tipo de logradouro
    if (!tipoLogradouro.trim()) {
      newErrors.tipoLogradouro = 'Tipo de logradouro é obrigatório';
    }

    // Validar logradouro
    if (!logradouro.trim()) {
      newErrors.logradouro = 'Logradouro é obrigatório';
    }

    // Validar número
    if (!numero.trim()) {
      newErrors.numero = 'Número é obrigatório';
    }

    // Validar UF do endereço
    if (!ufEndereco.trim()) {
      newErrors.ufEndereco = 'UF é obrigatória';
    }

    // Validar cidade
    if (!cidade.trim()) {
      newErrors.cidade = 'Cidade é obrigatória';
    }

    // Validar bairro
    if (!bairro.trim()) {
      newErrors.bairro = 'Bairro é obrigatório';
    }

    // Validar e-mail
    if (!email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'E-mail deve ter um formato válido';
    }

    // Validar DDD
    if (!ddd.trim()) {
      newErrors.ddd = 'DDD é obrigatório';
    } else if (!/^\d{2}$/.test(ddd)) {
      newErrors.ddd = 'DDD deve ter 2 dígitos';
    }

    // Validar celular
    if (!celular.trim()) {
      newErrors.celular = 'Celular é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  // Função para obter o placeholder dinamicamente
  const getPlaceholder = () => {
    switch (tipoPesquisa) {
      case 'nome':
        return 'Digite o nome do profissional...';
      case 'categoria':
        return 'Digite a categoria (ex: Médico, Enfermeiro)...';
      case 'numero_conselho':
        return 'Digite o número do conselho...';
      default:
        return 'Digite para pesquisar...';
    }
  };

  // Função para aplicar filtros automaticamente
  const aplicarFiltrosAutomaticos = useCallback((busca: string = nomeBusca, situacao: string = situacaoBusca, tipo: string = tipoPesquisa) => {
    if (!Array.isArray(profissionais) || profissionais.length === 0) {
      setFilteredProfissionais([]);
      return;
    }

    let filtered = profissionais;

    // Filtrar baseado no tipo de pesquisa e termo de busca
    if (busca.trim()) {
      filtered = filtered.filter(profissional => {
        switch (tipo) {
          case 'nome':
            return profissional.nome.toLowerCase().includes(busca.toLowerCase());
          case 'categoria':
            return profissional.categoria.toLowerCase().includes(busca.toLowerCase());
          case 'numero_conselho':
            return profissional.numero_conselho.toLowerCase().includes(busca.toLowerCase());
          default:
            return profissional.nome.toLowerCase().includes(busca.toLowerCase());
        }
      });
    }

    // Filtrar por situação se não for "todos"
    if (situacao && situacao !== 'todos') {
      const status = situacao === 'ativo' ? 'ativo' : 'inativo';
      filtered = filtered.filter(profissional => profissional.situacao === status);
    }

    setFilteredProfissionais(filtered);
    
    // Mostrar notificação apenas se houver filtros aplicados
    if (busca.trim() || (situacao && situacao !== 'todos')) {
      if (filtered.length === 0) {
        showNotification('error', 'Nenhum profissional encontrado com os critérios aplicados');
      } else {
        showNotification('success', `${filtered.length} profissional(is) encontrado(s)`);
      }
    }
  }, [profissionais, nomeBusca, situacaoBusca, tipoPesquisa]);

  // useEffect para aplicar filtros automaticamente quando situação muda
  useEffect(() => {
    if (profissionais.length > 0) {
      aplicarFiltrosAutomaticos(nomeBusca, situacaoBusca, tipoPesquisa);
    }
  }, [situacaoBusca, tipoPesquisa, profissionais, aplicarFiltrosAutomaticos, nomeBusca]);

  // Função para filtrar profissionais em tempo real (autocomplete)
  const handleAutocompleteSearch = (value: string) => {
    if (!value.trim()) {
      setShowAutocomplete(false);
      setAutocompleteResults([]);
      aplicarFiltrosAutomaticos('', situacaoBusca, tipoPesquisa);
      return;
    }

    if (!Array.isArray(profissionais)) {
      setShowAutocomplete(false);
      setAutocompleteResults([]);
      return;
    }

    const filtered = profissionais.filter(profissional => {
      switch (tipoPesquisa) {
        case 'nome':
          return profissional.nome.toLowerCase().includes(value.toLowerCase());
        case 'categoria':
          return profissional.categoria.toLowerCase().includes(value.toLowerCase());
        case 'numero_conselho':
          return profissional.numero_conselho.toLowerCase().includes(value.toLowerCase());
        default:
          return profissional.nome.toLowerCase().includes(value.toLowerCase());
      }
    }).slice(0, 5); // Limitar a 5 resultados

    setAutocompleteResults(filtered);
    setShowAutocomplete(filtered.length > 0);
    
    // Aplicar filtros em tempo real
    aplicarFiltrosAutomaticos(value, situacaoBusca, tipoPesquisa);
  };

  // Função para selecionar item do autocomplete
  const handleSelectAutocomplete = (profissional: Profissional) => {
    // Definir o valor do campo baseado no tipo de pesquisa
    let valorSelecionado;
    switch (tipoPesquisa) {
      case 'categoria':
        valorSelecionado = profissional.categoria;
        break;
      case 'numero_conselho':
        valorSelecionado = profissional.numero_conselho;
        break;
      default:
        valorSelecionado = profissional.nome;
    }
    setNomeBusca(valorSelecionado);
    setShowAutocomplete(false);
    aplicarFiltrosAutomaticos(valorSelecionado, situacaoBusca, tipoPesquisa);
  };

  // Função para carregar profissionais
  const carregarProfissionais = useCallback(async () => {
    console.log('=== CARREGANDO PROFISSIONAIS ===');
    
    setNomeBusca('');
    setSituacaoBusca('ativo');
    setShowAutocomplete(false);
    setAutocompleteResults([]);
    
    try {
      // Simulando dados até implementar API
      const mockData: Profissional[] = [
        {
          id: 1,
          nome: 'Dr. João Silva',
          categoria: 'Médico',
          sigla_conselho: 'CRM',
          numero_conselho: '12345',
          externo: false,
          ofensor: 'Clínica A',
          clinica: 'Clínica Central',
          situacao: 'ativo',
          created_by: 1,
          updated_by: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          nome: 'Dra. Maria Santos',
          categoria: 'Enfermeiro',
          sigla_conselho: 'COREN',
          numero_conselho: '54321',
          externo: true,
          ofensor: 'Clínica B',
          clinica: 'Clínica Norte',
          situacao: 'ativo',
          created_by: 1,
          updated_by: 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ];
      
      setProfissionais(mockData);
      setFilteredProfissionais(mockData);
      
      if (mockData.length > 0) {
        showNotification('success', `${mockData.length} profissional(is) carregado(s)`);
      } else {
        showNotification('error', 'Nenhum profissional encontrado no banco de dados');
      }
    } catch (error) {
      console.error('Erro ao carregar profissionais:', error);
      showNotification('error', 'Erro de conexão ao carregar profissionais');
      setProfissionais([]);
      setFilteredProfissionais([]);
    }
  }, []);

  // Função para procurar profissionais (botão Procurar)
  const handleProcurar = () => {
    setShowAutocomplete(false);
    
    if (!nomeBusca.trim() && situacaoBusca === 'todos') {
      setFilteredProfissionais(profissionais || []);
      return;
    }

    if (!Array.isArray(profissionais)) {
      setFilteredProfissionais([]);
      return;
    }

    let filtered = profissionais;

    if (nomeBusca.trim()) {
      filtered = filtered.filter(profissional => {
        switch (tipoPesquisa) {
          case 'nome':
            return profissional.nome.toLowerCase().includes(nomeBusca.toLowerCase());
          case 'categoria':
            return profissional.categoria.toLowerCase().includes(nomeBusca.toLowerCase());
          case 'numero_conselho':
            return profissional.numero_conselho.toLowerCase().includes(nomeBusca.toLowerCase());
          default:
            return profissional.nome.toLowerCase().includes(nomeBusca.toLowerCase());
        }
      });
    }

    if (situacaoBusca !== 'todos') {
      const status = situacaoBusca === 'ativo' ? 'ativo' : 'inativo';
      filtered = filtered.filter(profissional => profissional.situacao === status);
    }
    
    setFilteredProfissionais(filtered);
    
    if (filtered.length === 0) {
      let tipoTexto;
      switch (tipoPesquisa) {
        case 'categoria':
          tipoTexto = 'categoria';
          break;
        case 'numero_conselho':
          tipoTexto = 'número do conselho';
          break;
        default:
          tipoTexto = 'nome';
      }
      showNotification('error', `Nenhum profissional encontrado com o ${tipoTexto} pesquisado`);
    } else {
      showNotification('success', `${filtered.length} profissional(is) encontrado(s)`);
    }
  };

  // Função para incluir novo profissional
  const handleIncluir = async () => {
    if (!validateForm()) {
      showNotification('error', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulando inclusão até implementar API
      showNotification('success', 'Profissional cadastrado com sucesso!');
      handleLimpar();
      await carregarProfissionais();
      setShowNewProfissionalModal(false);
    } catch (error) {
      console.error('Erro ao cadastrar profissional:', error);
      showNotification('error', 'Erro ao cadastrar profissional. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para limpar formulário
  const handleLimpar = () => {
    // Limpar dados cadastrais
    setNomeProfissional('');
    setNacionalidade('');  // Agora é obrigatório, então fica vazio
    setCpf('');
    setNis('');
    setCategoria('');
    setSiglaConselho('');
    setRegConselho('');
    setUfConselho('');
    setRegMte('');
    
    // Limpar informações de contato
    setCep('');
    setTipoLogradouro('');
    setLogradouro('');
    setNumero('');
    setComplemento('');
    setUfEndereco('');
    setCidade('');
    setBairro('');
    setEmail('');
    setTelefone('');
    setDdd('');
    setCelular('');
    
    // Limpar informações adicionais
    setObservacao('');
    setAgendamentoHorario(false);
    setProfissionalExterno(false);
    setAssinaturaDigital('');
    setCertificadoDigital('');
    setSituacao('Ativo');
    
    // Limpar campos antigos para compatibilidade
    setNumeroConselho('');
    setExterno(false);
    setOfensor('');
    setClinica('');
    
    // Limpar erros de validação
    setErrors({});
  };

  // Função para retornar (fechar modal)
  const handleRetornar = () => {
    handleLimpar();
    setShowNewProfissionalModal(false);
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
      carregarProfissionais();
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router, carregarProfissionais]);

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
                  onClick={() => router.push('/home')}
                  className="hover:text-[#00A298] cursor-pointer"
                >
                  Tabelas Básicas
                </button>
                <span>/</span>
                <span className="text-[#00A298] font-medium">Cadastro de Profissionais</span>
              </div>
              
              <h1 className="text-3xl font-bold text-[#1D3C44] mb-2">
                👨‍⚕️ Cadastro de Profissionais
              </h1>
              <p className="text-gray-600">
                Gerencie o cadastro de profissionais do sistema
              </p>
            </div>

            {/* Conteúdo Principal */}
            <div className="bg-white rounded-2xl shadow-xl">
              {/* Formulário de busca */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-wrap gap-2 items-end">
                  <div className="flex-1 min-w-64 relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pesquisar por
                    </label>
                    <select 
                      value={tipoPesquisa}
                      onChange={(e) => {
                        setTipoPesquisa(e.target.value);
                        setNomeBusca(''); // Limpar campo ao trocar tipo
                        setShowAutocomplete(false);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                    >
                      <option value="nome">Nome</option>
                      <option value="categoria">Categoria</option>
                      <option value="numero_conselho">Número Conselho</option>
                    </select>
                  </div>
                  
                  <div className="flex-1 min-w-64 relative">
                    <input
                      type="text"
                      value={nomeBusca}
                      onChange={(e) => {
                        const value = tipoPesquisa === 'numero_conselho' ? e.target.value : formatTexto(e.target.value);
                        setNomeBusca(value);
                        handleAutocompleteSearch(value);
                      }}
                      onFocus={() => {
                        if (nomeBusca.trim()) {
                          handleAutocompleteSearch(nomeBusca);
                        }
                      }}
                      onBlur={() => {
                        setTimeout(() => setShowAutocomplete(false), 200);
                      }}
                      placeholder={getPlaceholder()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                    />
                    
                    {/* Dropdown do autocomplete */}
                    {showAutocomplete && autocompleteResults.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {autocompleteResults.map((profissional) => (
                          <div
                            key={profissional.id}
                            onClick={() => handleSelectAutocomplete(profissional)}
                            className="px-4 py-3 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">{destacarTexto(profissional.nome, nomeBusca)}</div>
                            <div className="text-sm text-gray-500">{profissional.categoria}</div>
                            <div className="text-xs text-blue-600 mt-1">
                              Situação: {profissional.situacao}
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
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer ml-2"
                  >
                    PROCURAR  
                  </button>
                  
                  <button 
                    onClick={() => setShowNewProfissionalModal(true)}
                    className="bg-[#00A298] hover:bg-[#1D3C44] text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    NOVO PROFISSIONAL
                  </button>
                  
                  <button 
                    onClick={carregarProfissionais}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    RECARREGAR
                  </button>
                </div>
              </div>

              {/* Container de Novo Cadastro */}
              {showNewProfissionalModal && (
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-[#1D3C44] mb-4">Cadastro de Profissional</h3>
                  
                  {/* Legenda de campos obrigatórios */}
                  <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center text-sm text-blue-800">
                      <span className="text-red-500 mr-2 font-bold">*</span>
                      <span className="font-medium">Campos obrigatórios</span>
                      <span className="mx-2">•</span>
                      <span className="text-blue-600">Preencha todos os campos marcados com asterisco para continuar</span>
                    </div>
                  </div>
                  
                  {/* Dados Cadastrais */}
                  <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Dados cadastrais</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          Nome <span className="text-red-500">*</span>
                          <Image src="/logo_esocial.png" alt="eSocial" width={16} height={16} className="ml-1" title="eSocial" />
                        </label>
                        <input
                          type="text"
                          value={nomeProfissional}
                          onChange={(e) => {
                            setNomeProfissional(formatTexto(e.target.value));
                            if (e.target.value.trim() && errors.nomeProfissional) {
                              setErrors({...errors, nomeProfissional: ''});
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                            errors.nomeProfissional ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Digite o nome do profissional"
                        />
                        {errors.nomeProfissional && (
                          <p className="text-red-500 text-xs mt-1">{errors.nomeProfissional}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nacionalidade <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={nacionalidade}
                          onChange={(e) => {
                            setNacionalidade(e.target.value);
                            if (e.target.value && errors.nacionalidade) {
                              setErrors({...errors, nacionalidade: ''});
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                            errors.nacionalidade ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Selecione a nacionalidade</option>
                          <option value="Brasileiro">Brasileiro</option>
                          <option value="Estrangeiro">Estrangeiro</option>
                        </select>
                        {errors.nacionalidade && (
                          <p className="text-red-500 text-xs mt-1">{errors.nacionalidade}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CPF <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={cpf}
                          onChange={(e) => {
                            const formattedCPF = formatCPF(e.target.value);
                            setCpf(formattedCPF);
                            if (formattedCPF.trim() && errors.cpf) {
                              setErrors({...errors, cpf: ''});
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                            errors.cpf ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="000.000.000-00"
                          maxLength={14}
                        />
                        {errors.cpf && (
                          <p className="text-red-500 text-xs mt-1">{errors.cpf}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          NIS
                        </label>
                        <input
                          type="text"
                          value={nis}
                          onChange={(e) => setNis(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                          placeholder="Digite o NIS"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Categoria <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={categoria}
                          onChange={(e) => {
                            setCategoria(e.target.value);
                            if (e.target.value && errors.categoria) {
                              setErrors({...errors, categoria: ''});
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                            errors.categoria ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Selecione uma categoria</option>
                          <option value="Médico">Médico</option>
                          <option value="Enfermeiro">Enfermeiro</option>
                          <option value="Técnico de Enfermagem">Técnico de Enfermagem</option>
                          <option value="Auxiliar de Enfermagem">Auxiliar de Enfermagem</option>
                          <option value="Fisioterapeuta">Fisioterapeuta</option>
                          <option value="Psicólogo">Psicólogo</option>
                          <option value="Nutricionista">Nutricionista</option>
                          <option value="Fonoaudiólogo">Fonoaudiólogo</option>
                        </select>
                        {errors.categoria && (
                          <p className="text-red-500 text-xs mt-1">{errors.categoria}</p>
                        )}
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          Sigla <span className="text-red-500">*</span>
                          <Image src="/logo_esocial.png" alt="eSocial" width={16} height={16} className="ml-1" title="eSocial" />
                        </label>
                        <select
                          value={siglaConselho}
                          onChange={(e) => {
                            setSiglaConselho(e.target.value);
                            if (e.target.value && errors.siglaConselho) {
                              setErrors({...errors, siglaConselho: ''});
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                            errors.siglaConselho ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Selecione a sigla</option>
                          <option value="CRM">CRM</option>
                          <option value="COREN">COREN</option>
                          <option value="CREFITO">CREFITO</option>
                          <option value="CRP">CRP</option>
                          <option value="CRN">CRN</option>
                          <option value="CRFa">CRFa</option>
                        </select>
                        {errors.siglaConselho && (
                          <p className="text-red-500 text-xs mt-1">{errors.siglaConselho}</p>
                        )}
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          Reg. Conselho <span className="text-red-500">*</span>
                          <Image src="/logo_esocial.png" alt="eSocial" width={16} height={16} className="ml-1" title="eSocial" />
                        </label>
                        <input
                          type="text"
                          value={regConselho}
                          onChange={(e) => {
                            setRegConselho(e.target.value);
                            if (e.target.value.trim() && errors.regConselho) {
                              setErrors({...errors, regConselho: ''});
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                            errors.regConselho ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Digite o número do conselho"
                        />
                        {errors.regConselho && (
                          <p className="text-red-500 text-xs mt-1">{errors.regConselho}</p>
                        )}
                      </div>

                      <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          UF <span className="text-red-500">*</span>
                          <Image src="/logo_esocial.png" alt="eSocial" width={16} height={16} className="ml-1" title="eSocial" />
                        </label>
                        <select
                          value={ufConselho}
                          onChange={(e) => {
                            setUfConselho(e.target.value);
                            if (e.target.value && errors.ufConselho) {
                              setErrors({...errors, ufConselho: ''});
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                            errors.ufConselho ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Selecione o estado</option>
                          <option value="AC">AC</option>
                          <option value="AL">AL</option>
                          <option value="AP">AP</option>
                          <option value="AM">AM</option>
                          <option value="BA">BA</option>
                          <option value="CE">CE</option>
                          <option value="DF">DF</option>
                          <option value="ES">ES</option>
                          <option value="GO">GO</option>
                          <option value="MA">MA</option>
                          <option value="MT">MT</option>
                          <option value="MS">MS</option>
                          <option value="MG">MG</option>
                          <option value="PA">PA</option>
                          <option value="PB">PB</option>
                          <option value="PR">PR</option>
                          <option value="PE">PE</option>
                          <option value="PI">PI</option>
                          <option value="RJ">RJ</option>
                          <option value="RN">RN</option>
                          <option value="RS">RS</option>
                          <option value="RO">RO</option>
                          <option value="RR">RR</option>
                          <option value="SC">SC</option>
                          <option value="SP">SP</option>
                          <option value="SE">SE</option>
                          <option value="TO">TO</option>
                        </select>
                        {errors.ufConselho && (
                          <p className="text-red-500 text-xs mt-1">{errors.ufConselho}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Reg. MTE
                        </label>
                        <input
                          type="text"
                          value={regMte}
                          onChange={(e) => setRegMte(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                          placeholder="Digite o registro no MTE"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Informações de Contato */}
                  <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Informações de contato</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CEP <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={cep}
                          onChange={(e) => {
                            handleCepChange(e.target.value);
                            if (e.target.value.trim() && errors.cep) {
                              setErrors({...errors, cep: ''});
                            }
                          }}
                          maxLength={9}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                            cepError || errors.cep ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="00000-000"
                        />
                        {loadingCep && <p className="text-xs text-blue-500 mt-1 flex items-center">
                          <svg className="animate-spin h-3 w-3 mr-1" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Buscando CEP...
                        </p>}
                        {cepError && <p className="text-xs text-red-500 mt-1">{cepError}</p>}
                        {errors.cep && <p className="text-red-500 text-xs mt-1">{errors.cep}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo de logradouro <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={tipoLogradouro}
                          onChange={(e) => {
                            setTipoLogradouro(e.target.value);
                            if (e.target.value && errors.tipoLogradouro) {
                              setErrors({...errors, tipoLogradouro: ''});
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                            errors.tipoLogradouro ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Selecione o tipo</option>
                          <option value="Rua">Rua</option>
                          <option value="Avenida">Avenida</option>
                          <option value="Praça">Praça</option>
                          <option value="Travessa">Travessa</option>
                          <option value="Alameda">Alameda</option>
                        </select>
                        {errors.tipoLogradouro && (
                          <p className="text-red-500 text-xs mt-1">{errors.tipoLogradouro}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Logradouro <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={logradouro}
                          onChange={(e) => {
                            setLogradouro(e.target.value);
                            if (e.target.value.trim() && errors.logradouro) {
                              setErrors({...errors, logradouro: ''});
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                            errors.logradouro ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Digite o nome da rua"
                        />
                        {errors.logradouro && (
                          <p className="text-red-500 text-xs mt-1">{errors.logradouro}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Número <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={numero}
                          onChange={(e) => {
                            setNumero(e.target.value);
                            if (e.target.value.trim() && errors.numero) {
                              setErrors({...errors, numero: ''});
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                            errors.numero ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Digite o número"
                        />
                        {errors.numero && (
                          <p className="text-red-500 text-xs mt-1">{errors.numero}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Complemento
                        </label>
                        <input
                          type="text"
                          value={complemento}
                          onChange={(e) => setComplemento(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                          placeholder="Apto, bloco, etc."
                        />
                    </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          UF <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={ufEndereco}
                          onChange={(e) => {
                            setUfEndereco(e.target.value);
                            if (e.target.value && errors.ufEndereco) {
                              setErrors({...errors, ufEndereco: ''});
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                            errors.ufEndereco ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Selecione o estado</option>
                          <option value="AC">AC</option>
                          <option value="AL">AL</option>
                          <option value="AP">AP</option>
                          <option value="AM">AM</option>
                          <option value="BA">BA</option>
                          <option value="CE">CE</option>
                          <option value="DF">DF</option>
                          <option value="ES">ES</option>
                          <option value="GO">GO</option>
                          <option value="MA">MA</option>
                          <option value="MT">MT</option>
                          <option value="MS">MS</option>
                          <option value="MG">MG</option>
                          <option value="PA">PA</option>
                          <option value="PB">PB</option>
                          <option value="PR">PR</option>
                          <option value="PE">PE</option>
                          <option value="PI">PI</option>
                          <option value="RJ">RJ</option>
                          <option value="RN">RN</option>
                          <option value="RS">RS</option>
                          <option value="RO">RO</option>
                          <option value="RR">RR</option>
                          <option value="SC">SC</option>
                          <option value="SP">SP</option>
                          <option value="SE">SE</option>
                          <option value="TO">TO</option>
                        </select>
                        {errors.ufEndereco && (
                          <p className="text-red-500 text-xs mt-1">{errors.ufEndereco}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cidade <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={cidade}
                          onChange={(e) => {
                            setCidade(e.target.value);
                            if (e.target.value.trim() && errors.cidade) {
                              setErrors({...errors, cidade: ''});
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                            errors.cidade ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Digite a cidade"
                        />
                        {errors.cidade && (
                          <p className="text-red-500 text-xs mt-1">{errors.cidade}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bairro <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={bairro}
                          onChange={(e) => {
                            setBairro(e.target.value);
                            if (e.target.value.trim() && errors.bairro) {
                              setErrors({...errors, bairro: ''});
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                            errors.bairro ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Digite o bairro"
                        />
                        {errors.bairro && (
                          <p className="text-red-500 text-xs mt-1">{errors.bairro}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          E-mail <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (e.target.value.trim() && errors.email) {
                              setErrors({...errors, email: ''});
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                            errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="Digite o e-mail"
                        />
                        {errors.email && (
                          <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Telefone
                        </label>
                        <input
                          type="text"
                          value={telefone}
                          onChange={(e) => setTelefone(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                          placeholder="(00) 0000-0000"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          DDD <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={ddd}
                          onChange={(e) => {
                            const onlyNumbers = e.target.value.replace(/\D/g, '').slice(0, 2);
                            setDdd(onlyNumbers);
                            if (onlyNumbers && errors.ddd) {
                              setErrors({...errors, ddd: ''});
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                            errors.ddd ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="00"
                          maxLength={2}
                        />
                        {errors.ddd && (
                          <p className="text-red-500 text-xs mt-1">{errors.ddd}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Celular <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={celular}
                          onChange={(e) => {
                            setCelular(e.target.value);
                            if (e.target.value.trim() && errors.celular) {
                              setErrors({...errors, celular: ''});
                            }
                          }}
                          className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                            errors.celular ? 'border-red-300 bg-red-50' : 'border-gray-300'
                          }`}
                          placeholder="(00) 90000-0000"
                        />
                        {errors.celular && (
                          <p className="text-red-500 text-xs mt-1">{errors.celular}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Informações Adicionais */}
                  <div className="bg-white rounded-lg p-4 shadow-sm mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-4">Informações adicionais</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Observação
                        </label>
                        <textarea
                          value={observacao}
                          onChange={(e) => setObservacao(e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                          placeholder="Digite observações adicionais"
                        />
                      </div>

                      <div className="flex flex-wrap gap-6 mb-4">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="agendamentoHorario"
                            checked={agendamentoHorario}
                            onChange={(e) => setAgendamentoHorario(e.target.checked)}
                            className="mr-2 w-4 h-4 text-[#00A298] focus:ring-[#00A298] border-gray-300 rounded"
                          />
                          <label htmlFor="agendamentoHorario" className="text-sm text-gray-700">
                            Agendamentos para este profissional apenas com horário marcado
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="profissionalExterno"
                            checked={profissionalExterno}
                            onChange={(e) => setProfissionalExterno(e.target.checked)}
                            className="mr-2 w-4 h-4 text-[#00A298] focus:ring-[#00A298] border-gray-300 rounded"
                          />
                          <label htmlFor="profissionalExterno" className="text-sm text-gray-700">
                            Profissional externo
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Assinatura Digitalizada
                          </label>
                          <div className="space-y-2">
                            <input
                              type="file"
                              accept="image/*"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent text-sm"
                            />
                            <p className="text-xs text-gray-500">A imagem deve ter tamanho de 8,5cm x 3cm</p>
                            <div className="flex gap-2">
                              <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-all duration-200">
                                INCLUIR ASSINATURA
                              </button>
                              <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-all duration-200">
                                EXCLUIR ASSINATURA
                              </button>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Certificado Digital
                          </label>
                          <div className="space-y-2">
                            <input
                              type="file"
                              accept=".pfx"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent text-sm"
                            />
                            <p className="text-xs text-gray-500">Selecione um arquivo .pfx</p>
                            <div className="flex gap-2">
                              <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs transition-all duration-200">
                                INCLUIR CERTIFICADO DIGITAL
                              </button>
                              <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs transition-all duration-200">
                                EXCLUIR CERTIFICADO DIGITAL
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Situação
                        </label>
                        <select
                          value={situacao}
                          onChange={(e) => setSituacao(e.target.value)}
                          className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                        >
                          <option value="Ativo">Ativo</option>
                          <option value="Inativo">Inativo</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex gap-3">
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
              )}

              {/* Tabela de resultados */}
              <div className="p-6">
                <div className="border border-gray-200 rounded-lg">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nome</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Categoria</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Sigla Conselho</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Número Conselho</th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Externo</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ofensor</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Clínica</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProfissionais && Array.isArray(filteredProfissionais) && filteredProfissionais.length > 0 ? (
                        filteredProfissionais.map((profissional) => (
                          <tr key={profissional.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">
                              <div className="font-medium text-gray-900">{destacarTexto(profissional.nome, nomeBusca)}</div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">{profissional.categoria}</td>
                            <td className="px-4 py-3 text-sm text-center text-gray-900">{profissional.sigla_conselho}</td>
                            <td className="px-4 py-3 text-sm text-center text-gray-900">{profissional.numero_conselho}</td>
                            <td className="px-4 py-3 text-sm text-center">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                profissional.externo 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {profissional.externo ? 'Sim' : 'Não'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">{profissional.ofensor}</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{profissional.clinica}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                            Não existem dados para mostrar
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