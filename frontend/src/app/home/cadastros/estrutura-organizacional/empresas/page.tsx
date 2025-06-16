'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  formatCPF, 
  formatCNPJ, 
  formatTelefone, 
  formatCEP, 
  formatNumeros, 
  formatTexto,
  isValidCPF,
  isValidTelefone
} from '@/utils/masks';

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
  status: 'ATIVO' | 'INATIVO';
}

interface Regiao {
  id: number;
  nome: string;
  descricao?: string;
  uf: string;
  cidade?: string;
  status: 'ATIVO' | 'INATIVO';
}

interface Empresa {
  id: number;
  codigo: string;
  nome_fantasia: string;
  razao_social: string;
  tipo_estabelecimento: 'MATRIZ' | 'FILIAL';
  tipo_inscricao?: 'CNPJ' | 'CPF';
  numero_inscricao?: string;
  cno?: string;
  endereco_cep?: string;
  endereco_logradouro?: string;
  endereco_numero?: string;
  endereco_complemento?: string;
  endereco_bairro?: string;
  endereco_cidade?: string;
  endereco_uf?: string;
  contato_nome?: string;
  contato_telefone?: string;
  contato_email?: string;
  representante_legal_nome?: string;
  representante_legal_cpf?: string;
  observacoes?: string;
  observacoes_os?: string;
  grupo_id?: number;
  regiao_id?: number;
  grupo?: Grupo;
  regiao?: Regiao;
  status: 'ATIVO' | 'INATIVO';
  created_by: number;
  updated_by: number;
  created_at: string;
  updated_at: string;
}

export default function EmpresasPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewCompanyModal, setShowNewCompanyModal] = useState(false);
  const [activeTab, setActiveTab] = useState('dados-empresa');
  const [tipoEstabelecimento, setTipoEstabelecimento] = useState('matriz');
  const [classificacaoPorte, setClassificacaoPorte] = useState('ME');
  const [searchType, setSearchType] = useState('nome');
  const [pesquisaTexto, setPesquisaTexto] = useState('');
  const [grupoFiltro, setGrupoFiltro] = useState('');
  const [regiaoFiltro, setRegiaoFiltro] = useState('');
  const [situacaoBusca, setSituacaoBusca] = useState('todos');
  
  // Estados para CEP e endereço
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState({
    logradouro: '',
    tipoLogradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: ''
  });
  const [loadingCep, setLoadingCep] = useState(false);
  
  // Estados para contato
  const [contato, setContato] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  
  // Estados para observações
  const [observacao, setObservacao] = useState('');
  const [observacaoOS, setObservacaoOS] = useState('');
  
  // Estados para campos com máscara
  const [nomeFantasia, setNomeFantasia] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [numeroInscricao, setNumeroInscricao] = useState('');
  const [cpfRepresentante, setCpfRepresentante] = useState('');
  const [nomeRepresentante, setNomeRepresentante] = useState('');
  const [cno, setCno] = useState('');
  const [tipoInscricao, setTipoInscricao] = useState('');
  const [grupoSelecionado, setGrupoSelecionado] = useState('');
  const [regiaoSelecionada, setRegiaoSelecionada] = useState('');
  const [cnaeDescricao, setCnaeDescricao] = useState('');
  const [risco, setRisco] = useState('');
  
  // Estados para mensagens de erro
  const [cepError, setCepError] = useState('');
  const [errors, setErrors] = useState({
    nomeFantasia: '',
    razaoSocial: '',
    grupoSelecionado: '',
    regiaoSelecionada: '',
    cnaeDescricao: '',
    risco: '',
    cep: '',
    numeroEndereco: '',
    tipoInscricao: '',
    numeroInscricao: '',
    cno: ''
  });
  
  // Estados para dados carregados
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [filteredEmpresas, setFilteredEmpresas] = useState<Empresa[]>([]);
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [regioes, setRegioes] = useState<Regiao[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<NotificationMessage>({
    type: 'success',
    message: '',
    show: false
  });
  const [showEditCompanyModal, setShowEditCompanyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [empresaEditando, setEmpresaEditando] = useState<Empresa | null>(null);
  const [empresaExcluindo, setEmpresaExcluindo] = useState<Empresa | null>(null);

  // Função para exibir notificação
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message, show: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  // Função para obter o placeholder baseado no tipo de pesquisa
  const getPlaceholder = (type: string) => {
    switch (type) {
      case 'nome':
        return 'Digite o nome fantasia...';
      case 'n de inscrição':
        return 'Digite o n° de inscrição...';
      case 'razao':
        return 'Digite a razão social...';
      case 'codigo':
        return 'Digite o código...';
        case 'regiao':
          return 'Digite a região...';
      default:
        return 'Digite para buscar...';
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
      console.log('Usuário definido, carregando dados...'); // Debug
      // Carregar dados após definir usuário
      carregarEmpresas();
      carregarGrupos();
      carregarRegioes();
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

  // Função para buscar CEP
  const buscarCep = async (cepValue: string) => {
    const cepLimpo = cepValue.replace(/\D/g, '');
    
    if (cepLimpo.length === 8) {
      setLoadingCep(true);
      setCepError(''); // Limpa erro anterior
      
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setEndereco({
            ...endereco,
            logradouro: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
            uf: data.uf || '',
            tipoLogradouro: data.logradouro ? data.logradouro.split(' ')[0] : ''
          });
          setCepError(''); // Limpa erro se sucesso
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

  const handleCepChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedCep = formatCEP(e.target.value);
    setCep(formattedCep);
    
    // Limpa erro quando usuário está digitando
    if (cepError) {
      setCepError('');
    }
    
    const numbers = e.target.value.replace(/\D/g, '');
    if (numbers.length === 8) {
      buscarCep(numbers);
    }
  };

  // Função para lidar com mudanças em campos específicos
  const handleNumeroInscricaoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const tipoInscricao = (document.querySelector('select[name="tipoInscricao"]') as HTMLSelectElement)?.value;
    
    if (tipoInscricao === 'cnpj') {
      const formatted = formatCNPJ(value);
      setNumeroInscricao(formatted);
    } else if (tipoInscricao === 'cpf') {
      const formatted = formatCPF(value);
      setNumeroInscricao(formatted);
    } else {
      setNumeroInscricao(value);
    }
  };

  const handleCpfRepresentanteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setCpfRepresentante(formatted);
  };

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTelefone(e.target.value);
    setTelefone(formatted);
  };

  const handleNomeRepresentanteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatTexto(e.target.value);
    setNomeRepresentante(formatted);
  };

  const handleCnoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumeros(e.target.value, 14);
    setCno(formatted);
  };

  // Função para carregar empresas
  const carregarEmpresas = async () => {
    console.log('=== CARREGANDO EMPRESAS ===');
    
    // Limpar campos de pesquisa quando recarregar
    setPesquisaTexto('');
    setGrupoFiltro('');
    setRegiaoFiltro('');
    setSituacaoBusca('todos');
    
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token ? 'Existe' : 'Não existe');
      
      const response = await fetch('http://localhost:3001/api/empresas', {
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
        
        // A API retorna { success: true, data: empresas[], message: string }
        const data = result.data || result; // Fallback para compatibilidade
        console.log('Extracted data:', data);
        console.log('Data type:', typeof data);
        console.log('Data is array:', Array.isArray(data));
        
        const validData = Array.isArray(data) ? data : [];
        console.log('Valid data:', validData);
        console.log('Valid data length:', validData.length);
        
        setEmpresas(validData);
        setFilteredEmpresas(validData);
        
        if (validData.length > 0) {
          showNotification('success', `${validData.length} empresa(s) carregada(s)`);
        } else {
          showNotification('error', 'Nenhuma empresa encontrada no banco de dados');
        }
      } else {
        const errorText = await response.text();
        console.error('Erro na resposta da API de empresas:', errorText);
        showNotification('error', `Erro ao carregar empresas: ${response.status}`);
        setEmpresas([]);
        setFilteredEmpresas([]);
      }
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      showNotification('error', 'Erro de conexão ao carregar empresas');
      setEmpresas([]);
      setFilteredEmpresas([]);
    }
  };

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
        console.log('Resposta da API de grupos:', result); // Debug
        // A API pode retornar {success: true, data: Array} ou Array direto
        const validData = result.success && Array.isArray(result.data) 
          ? result.data
          : Array.isArray(result) 
            ? result
            : [];
        console.log('Grupos carregados:', validData); // Debug
        setGrupos(validData);
      } else {
        console.error('Erro na resposta da API de grupos. Status:', response.status);
        showNotification('error', `Erro ao carregar grupos: ${response.status}`);
        setGrupos([]);
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      showNotification('error', 'Erro de conexão ao carregar grupos');
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
        const result = await response.json();
        console.log('Resposta da API de regiões:', result); // Debug
        // A API pode retornar {success: true, data: Array} ou Array direto
        const validData = result.success && Array.isArray(result.data) 
          ? result.data
          : Array.isArray(result) 
            ? result
            : [];
        console.log('Regiões carregadas:', validData); // Debug
        setRegioes(validData);
      } else {
        console.error('Erro na resposta da API de regiões. Status:', response.status);
        showNotification('error', `Erro ao carregar regiões: ${response.status}`);
        setRegioes([]);
      }
    } catch (error) {
      console.error('Erro ao carregar regiões:', error);
      showNotification('error', 'Erro de conexão ao carregar regiões');
      setRegioes([]);
    }
  };

  // Função para procurar empresas
  const handleProcurar = () => {
    console.log('=== DEBUG BUSCA ===');
    console.log('pesquisaTexto:', pesquisaTexto);
    console.log('searchType:', searchType);
    console.log('grupoFiltro:', grupoFiltro);
    console.log('regiaoFiltro:', regiaoFiltro);
    console.log('situacaoBusca:', situacaoBusca);
    console.log('empresas array:', empresas);
    console.log('empresas length:', empresas?.length);
    
    if (!pesquisaTexto.trim() && !grupoFiltro && !regiaoFiltro && situacaoBusca === 'todos') {
      console.log('Campos de busca vazios, mostrando todas as empresas');
      setFilteredEmpresas(empresas || []);
      return;
    }

    if (!Array.isArray(empresas)) {
      console.log('empresas não é array:', typeof empresas);
      setFilteredEmpresas([]);
      return;
    }

    console.log('Iniciando filtro...');
    let filtered = empresas;

    // Filtrar por texto baseado no tipo de pesquisa
    if (pesquisaTexto.trim()) {
      filtered = filtered.filter(empresa => {
        let match = false;
        switch (searchType) {
          case 'nome':
            match = empresa.nome_fantasia.toLowerCase().includes(pesquisaTexto.toLowerCase());
            break;
          case 'n de inscrição':
            match = empresa.numero_inscricao?.includes(pesquisaTexto) || false;
            break;
          case 'razao':
            match = empresa.razao_social.toLowerCase().includes(pesquisaTexto.toLowerCase());
            break;
          case 'codigo':
            match = empresa.codigo.includes(pesquisaTexto);
            break;
          case 'regiao':
            match = empresa.regiao?.nome.toLowerCase().includes(pesquisaTexto.toLowerCase()) || false;
            break;
          default:
            match = false;
        }
        console.log(`Empresa "${empresa.nome_fantasia}" - Match ${searchType}: ${match}`);
        return match;
      });
    }

    // Filtrar por grupo se houver seleção
    if (grupoFiltro) {
      filtered = filtered.filter(empresa => {
        const match = empresa.grupo_id === parseInt(grupoFiltro);
        console.log(`Empresa "${empresa.nome_fantasia}" - Match grupo: ${match}`);
        return match;
      });
    }

    // Filtrar por região se houver seleção
    if (regiaoFiltro) {
      filtered = filtered.filter(empresa => {
        const match = empresa.regiao_id === parseInt(regiaoFiltro);
        console.log(`Empresa "${empresa.nome_fantasia}" - Match região: ${match}`);
        return match;
      });
    }

    // Filtrar por situação se não for "todos"
    if (situacaoBusca !== 'todos') {
      const status = situacaoBusca === 'ativo' ? 'ATIVO' : 'INATIVO';
      filtered = filtered.filter(empresa => {
        const match = empresa.status === status;
        console.log(`Empresa "${empresa.nome_fantasia}" - Match situação: ${match}`);
        return match;
      });
    }
    
    console.log('Empresas filtradas:', filtered);
    setFilteredEmpresas(filtered);
    
    if (filtered.length === 0) {
      showNotification('error', 'Nenhuma empresa encontrada com os critérios pesquisados');
    } else {
      showNotification('success', `${filtered.length} empresa(s) encontrada(s)`);
    }
  };

  // Função para validar campos obrigatórios
  const validateForm = () => {
    const newErrors = {
      nomeFantasia: '',
      razaoSocial: '',
      grupoSelecionado: '',
      regiaoSelecionada: '',
      cnaeDescricao: '',
      risco: '',
      cep: '',
      numeroEndereco: '',
      tipoInscricao: '',
      numeroInscricao: '',
      cno: ''
    };

    if (!nomeFantasia.trim()) {
      newErrors.nomeFantasia = 'Nome fantasia é obrigatório';
    }

    if (!razaoSocial.trim()) {
      newErrors.razaoSocial = 'Razão social é obrigatória';
    }

    if (!grupoSelecionado) {
      newErrors.grupoSelecionado = 'Grupo é obrigatório';
    }

    if (!regiaoSelecionada) {
      newErrors.regiaoSelecionada = 'Região é obrigatória';
    }

    if (!cnaeDescricao.trim()) {
      newErrors.cnaeDescricao = 'CNAE e descrição é obrigatório';
    }

    if (!risco.trim()) {
      newErrors.risco = 'Risco é obrigatório';
    }

    if (!cep.trim()) {
      newErrors.cep = 'CEP é obrigatório';
    }

    if (!endereco.numero.trim()) {
      newErrors.numeroEndereco = 'Número é obrigatório';
    }

    if (!tipoInscricao) {
      newErrors.tipoInscricao = 'Tipo de inscrição é obrigatório';
    }

    if (!numeroInscricao.trim()) {
      newErrors.numeroInscricao = 'Número de inscrição é obrigatório';
    }



    setErrors(newErrors);

    // Retorna true se não há erros
    return !Object.values(newErrors).some(error => error !== '');
  };

  // Função para incluir nova empresa
  const handleIncluir = async () => {
    if (!validateForm()) {
      showNotification('error', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const empresaData = {
        nome_fantasia: nomeFantasia,
        razao_social: razaoSocial,
        tipo_estabelecimento: tipoEstabelecimento.toUpperCase(),
        tipo_inscricao: tipoInscricao,
        numero_inscricao: numeroInscricao,
        cno: cno,
        cnae_descricao: cnaeDescricao,
        risco: risco,
        endereco_cep: cep,
        endereco_logradouro: endereco.logradouro || null,
        endereco_numero: endereco.numero,
        endereco_complemento: endereco.complemento || null,
        endereco_bairro: endereco.bairro || null,
        endereco_cidade: endereco.cidade || null,
        endereco_uf: endereco.uf || null,
        contato_nome: contato || null,
        contato_telefone: telefone || null,
        contato_email: email || null,
        representante_legal_nome: nomeRepresentante || null,
        representante_legal_cpf: cpfRepresentante || null,
        observacoes: observacao || null,
        observacoes_os: observacaoOS || null,
        grupo_id: grupoSelecionado,
        regiao_id: regiaoSelecionada
      };

      const response = await fetch('http://localhost:3001/api/empresas', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(empresaData)
      });

      if (response.ok) {
        showNotification('success', 'Empresa cadastrada com sucesso!');
        handleLimpar();
        await carregarEmpresas();
        setShowNewCompanyModal(false);
      } else {
        const error = await response.json();
        showNotification('error', `Erro ao cadastrar empresa: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao cadastrar empresa:', error);
      showNotification('error', 'Erro ao cadastrar empresa. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para limpar formulário
  const handleLimpar = () => {
    setNomeFantasia('');
    setRazaoSocial('');
    setTipoEstabelecimento('matriz');
    setTipoInscricao('');
    setNumeroInscricao('');
    setCno('');
    setCep('');
    setEndereco({
      logradouro: '',
      tipoLogradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: ''
    });
    setContato('');
    setTelefone('');
    setEmail('');
    setNomeRepresentante('');
    setCpfRepresentante('');
    setObservacao('');
    setObservacaoOS('');
    setGrupoSelecionado('');
    setRegiaoSelecionada('');
    setCepError('');
    setCnaeDescricao('');
    setRisco('');
    setErrors({
      nomeFantasia: '',
      razaoSocial: '',
      grupoSelecionado: '',
      regiaoSelecionada: '',
      cnaeDescricao: '',
      risco: '',
      cep: '',
      numeroEndereco: '',
      tipoInscricao: '',
      numeroInscricao: '',
      cno: ''
    });
  };

  // Função para retornar (fechar modal)
  const handleRetornar = () => {
    handleLimpar();
    setShowNewCompanyModal(false);
  };

  // Função para abrir modal de edição
  const handleEditarEmpresa = (empresa: Empresa) => {
    setEmpresaEditando(empresa);
    setNomeFantasia(empresa.nome_fantasia);
    setRazaoSocial(empresa.razao_social);
    setTipoEstabelecimento(empresa.tipo_estabelecimento.toLowerCase());
    setTipoInscricao(empresa.tipo_inscricao || '');
    setNumeroInscricao(empresa.numero_inscricao || '');
    setCno(empresa.cno || '');
    setCep(empresa.endereco_cep || '');
    setEndereco({
      logradouro: empresa.endereco_logradouro || '',
      tipoLogradouro: '',
      numero: empresa.endereco_numero || '',
      complemento: empresa.endereco_complemento || '',
      bairro: empresa.endereco_bairro || '',
      cidade: empresa.endereco_cidade || '',
      uf: empresa.endereco_uf || ''
    });
    setContato(empresa.contato_nome || '');
    setTelefone(empresa.contato_telefone || '');
    setEmail(empresa.contato_email || '');
    setNomeRepresentante(empresa.representante_legal_nome || '');
    setCpfRepresentante(empresa.representante_legal_cpf || '');
    setObservacao(empresa.observacoes || '');
    setObservacaoOS(empresa.observacoes_os || '');
    setGrupoSelecionado(empresa.grupo_id ? empresa.grupo_id.toString() : '');
    setRegiaoSelecionada(empresa.regiao_id ? empresa.regiao_id.toString() : '');
    setShowEditCompanyModal(true);
  };

  // Função para salvar edição
  const handleSalvarEdicao = async () => {
    if (!validateForm()) {
      showNotification('error', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const empresaData = {
        nome_fantasia: nomeFantasia,
        razao_social: razaoSocial,
        tipo_estabelecimento: tipoEstabelecimento.toUpperCase(),
        tipo_inscricao: tipoInscricao,
        numero_inscricao: numeroInscricao,
        cno: cno,
        cnae_descricao: cnaeDescricao,
        risco: risco,
        endereco_cep: cep,
        endereco_logradouro: endereco.logradouro || null,
        endereco_numero: endereco.numero,
        endereco_complemento: endereco.complemento || null,
        endereco_bairro: endereco.bairro || null,
        endereco_cidade: endereco.cidade || null,
        endereco_uf: endereco.uf || null,
        contato_nome: contato || null,
        contato_telefone: telefone || null,
        contato_email: email || null,
        representante_legal_nome: nomeRepresentante || null,
        representante_legal_cpf: cpfRepresentante || null,
        observacoes: observacao || null,
        observacoes_os: observacaoOS || null,
        grupo_id: grupoSelecionado,
        regiao_id: regiaoSelecionada
      };

      const response = await fetch(`http://localhost:3001/api/empresas/${empresaEditando?.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(empresaData)
      });
      
      if (response.ok) {
        showNotification('success', 'Empresa atualizada com sucesso!');
        handleLimpar();
        await carregarEmpresas();
        setShowEditCompanyModal(false);
        setEmpresaEditando(null);
      } else {
        const error = await response.json();
        showNotification('error', `Erro ao atualizar empresa: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar empresa:', error);
      showNotification('error', 'Erro ao atualizar empresa. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para fechar modal de edição
  const handleFecharEdicao = () => {
    handleLimpar();
    setShowEditCompanyModal(false);
    setEmpresaEditando(null);
  };

  // Função para abrir modal de exclusão
  const handleExcluirEmpresa = (empresa: Empresa) => {
    setEmpresaExcluindo(empresa);
    setShowDeleteModal(true);
  };

  // Função para confirmar exclusão
  const handleConfirmarExclusao = async () => {
    if (!empresaExcluindo) return;
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3001/api/empresas/${empresaExcluindo.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showNotification('success', 'Empresa excluída com sucesso!');
        await carregarEmpresas();
        setShowDeleteModal(false);
        setEmpresaExcluindo(null);
      } else {
        const error = await response.json();
        showNotification('error', `Erro ao excluir empresa: ${error.message}`);
      }
    } catch (error) {
      console.error('Erro ao excluir empresa:', error);
      showNotification('error', 'Erro ao excluir empresa. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para cancelar exclusão
  const handleCancelarExclusao = () => {
    setShowDeleteModal(false);
    setEmpresaExcluindo(null);
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
          {/* Espaço vazio para balanceamento */}
          <div className="w-1/3">
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
              {/* Formulário de busca */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="flex gap-2 min-w-96">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pesquisar por
                      </label>
                      <select 
                        value={searchType}
                        onChange={(e) => setSearchType(e.target.value)}
                        className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                      >
                        <option value="nome">Nome Fantasia</option>
                        <option value="n de inscrição">N° de Inscrição</option>
                        <option value="razao">Razão Social</option>
                        <option value="codigo">Código</option>
                        <option value="regiao">Região</option>
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        &nbsp;
                      </label>
                      <input
                        type="text"
                        value={pesquisaTexto}
                        onChange={(e) => setPesquisaTexto(e.target.value)}
                        placeholder={getPlaceholder(searchType)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                      />
                    </div>
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
                      {grupos && Array.isArray(grupos) && grupos.map(grupo => (
                        <option key={grupo.id} value={grupo.id}>{grupo.nome}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Região
                    </label>
                    <select 
                      value={regiaoFiltro}
                      onChange={(e) => setRegiaoFiltro(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                    >
                      <option value="">Todas as regiões</option>
                      {regioes && Array.isArray(regioes) && regioes.map(regiao => (
                        <option key={regiao.id} value={regiao.id}>{regiao.nome}</option>
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

                  <div className="flex gap-6 ml-auto">
                    <button 
                      onClick={handleProcurar}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer text-xs"
                    >
                      PROCURAR
                    </button>
                    
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
              </div>

              {/* Container de Novo Cadastro */}
              {showNewCompanyModal && (
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-[#1D3C44] mb-4">Cadastro de Empresas</h3>
                  
                  {/* Legenda de campos obrigatórios */}
                  <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center text-sm text-blue-800">
                      <span className="text-red-500 mr-2 font-bold">*</span>
                      <span className="font-medium">Campos obrigatórios</span>
                      <span className="mx-2">•</span>
                      <span className="text-blue-600">Preencha todos os campos marcados com asterisco para continuar</span>
                    </div>
                  </div>
                  
                  {/* Abas */}
                  <div className="border-b border-gray-200 mb-6">
                    <nav className="flex space-x-8">
                      <button
                        onClick={() => setActiveTab('dados-empresa')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                          activeTab === 'dados-empresa'
                            ? 'border-[#00A298] text-[#00A298]'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Dados da Empresa
                      </button>
                      <button
                        onClick={() => setActiveTab('esocial')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                          activeTab === 'esocial'
                            ? 'border-[#00A298] text-[#00A298]'
                            : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        eSocial
                      </button>
                    </nav>
                  </div>

                  {/* Conteúdo da aba Dados da Empresa */}
                  {activeTab === 'dados-empresa' && (
                    <div className="bg-white rounded-lg p-6 shadow-sm space-y-6">
                      {/* Seção Estabelecimento */}
                      <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                        <div className="flex items-center mb-6">
                          <h4 className="text-lg font-semibold text-[#1D3C44]">Estabelecimento</h4>
                        </div>
                        
                                                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                           <div className="space-y-2">
                             <label className="block text-sm font-medium text-gray-700">
                               Tipo
                             </label>
                             <div className="flex gap-3">
                               <label className="flex items-center cursor-pointer">
                                 <input
                                   type="radio"
                                   name="tipo"
                                   value="matriz"
                                   checked={tipoEstabelecimento === 'matriz'}
                                   onChange={(e) => setTipoEstabelecimento(e.target.value)}
                                   className="mr-2 text-[#00A298] focus:ring-[#00A298]"
                                 />
                                 <span className="text-sm font-medium">Matriz</span>
                               </label>
                               <label className="flex items-center cursor-pointer">
                                 <input
                                   type="radio"
                                   name="tipo"
                                   value="filial"
                                   checked={tipoEstabelecimento === 'filial'}
                                   onChange={(e) => setTipoEstabelecimento(e.target.value)}
                                   className="mr-2 text-[#00A298] focus:ring-[#00A298]"
                                 />
                                 <span className="text-sm font-medium">Filial</span>
                               </label>
                             </div>
                           </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Tipo de Inscrição <span className="text-red-500">*</span>
                            </label>
                            <select 
                              name="tipoInscricao"
                              value={tipoInscricao}
                              onChange={(e) => {
                                setTipoInscricao(e.target.value);
                                if (e.target.value && errors.tipoInscricao) {
                                  setErrors({...errors, tipoInscricao: ''});
                                }
                              }}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all ${
                                errors.tipoInscricao ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                            >
                              <option value="">Selecione...</option>
                              <option value="cnpj">CNPJ</option>
                              <option value="cpf">CPF</option>
                            </select>
                            {errors.tipoInscricao && (
                              <p className="text-red-500 text-xs mt-1">{errors.tipoInscricao}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Número de Inscrição <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={numeroInscricao}
                              onChange={(e) => {
                                handleNumeroInscricaoChange(e);
                                if (e.target.value.trim() && errors.numeroInscricao) {
                                  setErrors({...errors, numeroInscricao: ''});
                                }
                              }}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all ${
                                errors.numeroInscricao ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                              placeholder="Digite o número"
                            />
                            {errors.numeroInscricao && (
                              <p className="text-red-500 text-xs mt-1">{errors.numeroInscricao}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              CNO
                            </label>
                            <input
                              type="text"
                              value={cno}
                              onChange={handleCnoChange}
                              maxLength={14}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all"
                              placeholder="Digite o CNO (máx. 14 dígitos)"
                            />

                          </div>
                        </div>
                      </div>

                                             {/* Seção Dados cadastrais */}
                       <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
                         <div className="flex items-center mb-6">
                           <h4 className="text-lg font-semibold text-[#1D3C44]">Dados cadastrais</h4>
                         </div>
                         
                                                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                           <div className="space-y-2">
                             <label className="block text-sm font-medium text-gray-700">
                               Código
                             </label>
                             <input
                               type="text"
                               value="AUTOMÁTICO"
                               disabled
                               className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                             />
                           </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Grupo <span className="text-red-500">*</span>
                            </label>
                            <select 
                              value={grupoSelecionado}
                              onChange={(e) => {
                                setGrupoSelecionado(e.target.value);
                                if (e.target.value && errors.grupoSelecionado) {
                                  setErrors({...errors, grupoSelecionado: ''});
                                }
                              }}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all ${
                                errors.grupoSelecionado ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                            >
                              <option value="">Selecione um grupo</option>
                              {grupos && Array.isArray(grupos) && grupos.map(grupo => (
                                <option key={grupo.id} value={grupo.id}>{grupo.nome}</option>
                              ))}
                            </select>
                            {errors.grupoSelecionado && (
                              <p className="text-red-500 text-xs mt-1">{errors.grupoSelecionado}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Região <span className="text-red-500">*</span>
                            </label>
                            <select 
                              value={regiaoSelecionada}
                              onChange={(e) => {
                                setRegiaoSelecionada(e.target.value);
                                if (e.target.value && errors.regiaoSelecionada) {
                                  setErrors({...errors, regiaoSelecionada: ''});
                                }
                              }}
                              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all ${
                                errors.regiaoSelecionada ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                            >
                              <option value="">Selecione uma região</option>
                              {regioes && Array.isArray(regioes) && regioes.map(regiao => (
                                <option key={regiao.id} value={regiao.id}>{regiao.nome}</option>
                              ))}
                            </select>
                            {errors.regiaoSelecionada && (
                              <p className="text-red-500 text-xs mt-1">{errors.regiaoSelecionada}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Razão Social <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={razaoSocial}
                              onChange={(e) => {
                                setRazaoSocial(e.target.value);
                                if (e.target.value.trim() && errors.razaoSocial) {
                                  setErrors({...errors, razaoSocial: ''});
                                }
                              }}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                                errors.razaoSocial ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                              placeholder="Digite a razão social"
                            />
                            {errors.razaoSocial && (
                              <p className="text-red-500 text-xs mt-1">{errors.razaoSocial}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nome Fantasia <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={nomeFantasia}
                              onChange={(e) => {
                                setNomeFantasia(e.target.value);
                                if (e.target.value.trim() && errors.nomeFantasia) {
                                  setErrors({...errors, nomeFantasia: ''});
                                }
                              }}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                                errors.nomeFantasia ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                              placeholder="Digite o nome fantasia"
                            />
                            {errors.nomeFantasia && (
                              <p className="text-red-500 text-xs mt-1">{errors.nomeFantasia}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Inscrição Estadual
                            </label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="Digite a inscrição estadual"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Inscrição Municipal
                            </label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="Digite a inscrição municipal"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              CNAE e Descrição <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={cnaeDescricao}
                              onChange={(e) => {
                                setCnaeDescricao(e.target.value);
                                if (e.target.value.trim() && errors.cnaeDescricao) {
                                  setErrors({...errors, cnaeDescricao: ''});
                                }
                              }}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                                errors.cnaeDescricao ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                              placeholder="Digite o CNAE e descrição"
                            />
                            {errors.cnaeDescricao && (
                              <p className="text-red-500 text-xs mt-1">{errors.cnaeDescricao}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Risco <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={risco}
                              onChange={(e) => {
                                setRisco(e.target.value);
                                if (e.target.value.trim() && errors.risco) {
                                  setErrors({...errors, risco: ''});
                                }
                              }}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                                errors.risco ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                              placeholder="Digite o risco"
                            />
                            {errors.risco && (
                              <p className="text-red-500 text-xs mt-1">{errors.risco}</p>
                            )}
                          </div>

                                                     <div className="space-y-2">
                             <label className="block text-sm font-medium text-gray-700">
                               Classificação Porte
                             </label>
                             <div className="flex gap-4">
                               <label className="flex items-center cursor-pointer">
                                 <input
                                   type="radio"
                                   name="classificacao"
                                   value="ME"
                                   checked={classificacaoPorte === 'ME'}
                                   onChange={(e) => setClassificacaoPorte(e.target.value)}
                                   className="mr-2 text-[#00A298] focus:ring-[#00A298]"
                                 />
                                 <span className="text-sm font-medium">ME</span>
                               </label>
                               <label className="flex items-center cursor-pointer">
                                 <input
                                   type="radio"
                                   name="classificacao"
                                   value="EPP"
                                   checked={classificacaoPorte === 'EPP'}
                                   onChange={(e) => setClassificacaoPorte(e.target.value)}
                                   className="mr-2 text-[#00A298] focus:ring-[#00A298]"
                                 />
                                 <span className="text-sm font-medium">EPP</span>
                               </label>
                             </div>
                           </div>
                        </div>
                      </div>

                      {/* Seção Representante legal */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-4 bg-gray-100 px-3 py-2 rounded">Representante legal</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nome do representante legal
                            </label>
                            <input
                              type="text"
                              value={nomeRepresentante}
                              onChange={handleNomeRepresentanteChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="Digite o nome do representante (apenas letras)"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              CPF
                            </label>
                            <input
                              type="text"
                              value={cpfRepresentante}
                              onChange={handleCpfRepresentanteChange}
                              maxLength={14}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="000.000.000-00"
                            />
                            {cpfRepresentante && !isValidCPF(cpfRepresentante) && (
                              <p className="text-red-500 text-xs mt-1">CPF inválido</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Assinatura digital
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
                        </div>
                      </div>

                      {/* Seção Informações de contato */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-4 bg-gray-100 px-3 py-2 rounded">Informações de contato</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              CEP <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={cep}
                              onChange={(e) => {
                                handleCepChange(e);
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
                            {loadingCep && <p className="text-xs text-blue-500 mt-1">Buscando CEP...</p>}
                            {cepError && <p className="text-xs text-red-500 mt-1">{cepError}</p>}
                            {errors.cep && <p className="text-xs text-red-500 mt-1">{errors.cep}</p>}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Tipo de logradouro
                            </label>
                            <select 
                              value={endereco.tipoLogradouro}
                              onChange={(e) => setEndereco({...endereco, tipoLogradouro: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                            >
                              <option value="">Selecione...</option>
                              <option value="Rua">Rua</option>
                              <option value="Avenida">Avenida</option>
                              <option value="Travessa">Travessa</option>
                              <option value="Alameda">Alameda</option>
                              <option value="Praça">Praça</option>
                              <option value="Estrada">Estrada</option>
                            </select>
                          </div>

                          <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Logradouro
                            </label>
                            <input
                              type="text"
                              value={endereco.logradouro}
                              onChange={(e) => setEndereco({...endereco, logradouro: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="Nome da rua"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Número <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={endereco.numero}
                              onChange={(e) => {
                                setEndereco({...endereco, numero: e.target.value});
                                if (e.target.value.trim() && errors.numeroEndereco) {
                                  setErrors({...errors, numeroEndereco: ''});
                                }
                              }}
                              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                                errors.numeroEndereco ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                              placeholder="Número"
                            />
                            {errors.numeroEndereco && (
                              <p className="text-red-500 text-xs mt-1">{errors.numeroEndereco}</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Complemento
                            </label>
                            <input
                              type="text"
                              value={endereco.complemento}
                              onChange={(e) => setEndereco({...endereco, complemento: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="Apartamento, sala, etc."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              UF
                            </label>
                            <select 
                              value={endereco.uf}
                              onChange={(e) => setEndereco({...endereco, uf: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                            >
                              <option value="">Selecione...</option>
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
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Cidade
                            </label>
                            <input
                              type="text"
                              value={endereco.cidade}
                              onChange={(e) => setEndereco({...endereco, cidade: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="Nome da cidade"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Bairro
                            </label>
                            <input
                              type="text"
                              value={endereco.bairro}
                              onChange={(e) => setEndereco({...endereco, bairro: e.target.value})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="Nome do bairro"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Contato
                            </label>
                            <input
                              type="text"
                              value={contato}
                              onChange={(e) => setContato(formatTexto(e.target.value))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="Nome do contato (apenas letras)"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Telefone
                            </label>
                            <input
                              type="tel"
                              value={telefone}
                              onChange={handleTelefoneChange}
                              maxLength={15}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="(00) 00000-0000"
                            />
                            {telefone && !isValidTelefone(telefone) && (
                              <p className="text-red-500 text-xs mt-1">Telefone inválido (10 ou 11 dígitos)</p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              E-mail
                            </label>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="email@exemplo.com"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Seção Alertas da Empresa */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-4 bg-gray-100 px-3 py-2 rounded">Alertas da Empresa</h4>
                        <div className="text-center py-4 text-gray-500 text-sm">
                          Nenhum alerta configurado
                        </div>
                      </div>

                      {/* Seção Informações adicionais */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-4 bg-gray-100 px-3 py-2 rounded">Informações adicionais</h4>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Observação
                            </label>
                            <textarea
                              rows={3}
                              value={observacao}
                              onChange={(e) => setObservacao(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="Digite observações gerais sobre a empresa..."
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Observação para Ordem de Serviço
                            </label>
                            <textarea
                              rows={3}
                              value={observacaoOS}
                              onChange={(e) => setObservacaoOS(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                              placeholder="Digite observações específicas para ordens de serviço..."
                            />
                          </div>
                        </div>
                      </div>

                      {/* Botões de ação */}
                      <div className="flex gap-3 pt-4 border-t border-gray-200">
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

                  {/* Conteúdo da aba eSocial */}
                  {activeTab === 'esocial' && (
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <div className="text-center py-8 text-gray-500">
                        <p>Conteúdo da aba eSocial será implementado aqui.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tabela de resultados - apenas quando não estiver no modo de cadastro */}
              {!showNewCompanyModal && (
                <div className="p-6">
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">CNPJ</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Razão Social</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nome Fantasia</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Código</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Grupo</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Região</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Situação</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredEmpresas.length > 0 ? (
                          filteredEmpresas.map((empresa) => (
                            <tr key={empresa.id} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm">{empresa.numero_inscricao || '-'}</td>
                              <td className="px-4 py-3 text-sm">{empresa.razao_social}</td>
                              <td className="px-4 py-3 text-sm">{empresa.nome_fantasia}</td>
                              <td className="px-4 py-3 text-sm">{empresa.codigo}</td>
                              <td className="px-4 py-3 text-sm">{empresa.grupo?.nome || '-'}</td>
                              <td className="px-4 py-3 text-sm">{empresa.regiao?.nome || '-'}</td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  empresa.status === 'ATIVO' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {empresa.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <div className="flex space-x-2">
                                  <button className="text-blue-600 hover:text-blue-800 text-xs font-medium" onClick={() => handleEditarEmpresa(empresa)}>
                                    Editar
                                  </button>
                                  <button className="text-red-600 hover:text-red-800 text-xs font-medium" onClick={() => handleExcluirEmpresa(empresa)}>
                                    Excluir
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                              {pesquisaTexto ? 'Nenhuma empresa encontrada com os critérios pesquisados' : 'Não existem dados para mostrar'}
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

      {/* Modal de Edição */}
      {showEditCompanyModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-bold text-[#1D3C44] mb-4">Editar Empresa</h3>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Dados da empresa</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome Fantasia <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={nomeFantasia}
                      onChange={(e) => {
                        setNomeFantasia(e.target.value);
                        if (e.target.value.trim() && errors.nomeFantasia) {
                          setErrors({...errors, nomeFantasia: ''});
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                        errors.nomeFantasia ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Digite o nome fantasia"
                    />
                    {errors.nomeFantasia && (
                      <p className="text-red-500 text-xs mt-1">{errors.nomeFantasia}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Razão Social <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={razaoSocial}
                      onChange={(e) => {
                        setRazaoSocial(e.target.value);
                        if (e.target.value.trim() && errors.razaoSocial) {
                          setErrors({...errors, razaoSocial: ''});
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                        errors.razaoSocial ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Digite a razão social"
                    />
                    {errors.razaoSocial && (
                      <p className="text-red-500 text-xs mt-1">{errors.razaoSocial}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grupo <span className="text-red-500">*</span>
                    </label>
                    <select 
                      value={grupoSelecionado}
                      onChange={(e) => {
                        setGrupoSelecionado(e.target.value);
                        if (e.target.value && errors.grupoSelecionado) {
                          setErrors({...errors, grupoSelecionado: ''});
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                        errors.grupoSelecionado ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Selecione um grupo</option>
                      {grupos && Array.isArray(grupos) && grupos.map(grupo => (
                        <option key={grupo.id} value={grupo.id}>{grupo.nome}</option>
                      ))}
                    </select>
                    {errors.grupoSelecionado && (
                      <p className="text-red-500 text-xs mt-1">{errors.grupoSelecionado}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Região <span className="text-red-500">*</span>
                    </label>
                    <select 
                      value={regiaoSelecionada}
                      onChange={(e) => {
                        setRegiaoSelecionada(e.target.value);
                        if (e.target.value && errors.regiaoSelecionada) {
                          setErrors({...errors, regiaoSelecionada: ''});
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                        errors.regiaoSelecionada ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Selecione uma região</option>
                      {regioes && Array.isArray(regioes) && regioes.map(regiao => (
                        <option key={regiao.id} value={regiao.id}>{regiao.nome}</option>
                      ))}
                    </select>
                    {errors.regiaoSelecionada && (
                      <p className="text-red-500 text-xs mt-1">{errors.regiaoSelecionada}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CNAE e Descrição <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={cnaeDescricao}
                      onChange={(e) => {
                        setCnaeDescricao(e.target.value);
                        if (e.target.value.trim() && errors.cnaeDescricao) {
                          setErrors({...errors, cnaeDescricao: ''});
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                        errors.cnaeDescricao ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Digite o CNAE e descrição"
                    />
                    {errors.cnaeDescricao && (
                      <p className="text-red-500 text-xs mt-1">{errors.cnaeDescricao}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Risco <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={risco}
                      onChange={(e) => {
                        setRisco(e.target.value);
                        if (e.target.value.trim() && errors.risco) {
                          setErrors({...errors, risco: ''});
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent ${
                        errors.risco ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Digite o risco"
                    />
                    {errors.risco && (
                      <p className="text-red-500 text-xs mt-1">{errors.risco}</p>
                    )}
                  </div>
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

      {/* Modal de Confirmação de Exclusão */}
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
                  <h3 className="text-lg font-medium text-gray-900">Confirmar Exclusão</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Tem certeza que deseja excluir a empresa "{empresaExcluindo?.nome_fantasia}"?
                  </p>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Atenção:</strong> Esta ação não pode ser desfeita. A empresa será permanentemente removida do sistema.
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
                  {isSubmitting ? 'Excluindo...' : 'Sim, Excluir'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 