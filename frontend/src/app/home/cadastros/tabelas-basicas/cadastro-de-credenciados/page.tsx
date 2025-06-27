'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { credenciadosService, Credenciado as CredenciadoAPI, HorarioFuncionamento } from './services/credenciadosService';
import { formatCNPJ, formatTelefone, formatCEP, isValidCNPJ, isValidTelefone, isValidCEP, formatTexto } from '@/utils/masks';
import { buscarEmpresaPorCNPJ } from '@/utils/cnpjUtils';

// Tipos para os dados
interface Credenciado {
  id: string;
  nome: string;
  cnpj: string;
  cidade: string;
  estado: string;
  situacao: 'Ativo' | 'Inativo';
  telefone?: string;
  email?: string;
  site?: string;
  utilizar_percentual?: boolean;
  uf?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  tipo_logradouro?: string;
  observacoes_exames?: string;
  observacoes_gerais?: string;
}

// Mock de dados para demonstração - poucos dados para começar os cadastros
const mockCredenciados: Credenciado[] = [
  {
    id: '1',
    nome: 'Medicina Medicina do Trabalho',
    cnpj: '21726329000104',
    cidade: 'Ribeirão Preto',
    estado: 'SP'
  },
  {
    id: '2',
    nome: 'FF Segurança e Medicina do Trabalho - MASTERPLAN LTDA',
    cnpj: '10366026000101',
    cidade: 'Porto Alegre',
    estado: 'RS'
  },
  {
    id: '3',
    nome: 'Medicina Medicina do Trabalho',
    cnpj: '21726329000104',
    cidade: 'Ribeirão Preto',
    estado: 'SP'
  },
  
].map(item => ({ ...item, situacao: 'Ativo' as const }));

export default function CadastroCredenciados() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Estados para filtros e busca
  const [pesquisarPor, setPesquisarPor] = useState('nome');
  const [termoBusca, setTermoBusca] = useState('');
  const [situacao, setSituacao] = useState('ativo');
  const [credenciadosFiltrados, setCredenciadosFiltrados] = useState<Credenciado[]>([]);
  const [todosCredenciados, setTodosCredenciados] = useState<Credenciado[]>([]);
  
  // Estados para autocomplete
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteResults, setAutocompleteResults] = useState<Credenciado[]>([]);
  
  // Estados para paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  // Estados para formulário de cadastro
  const [showCadastroModal, setShowCadastroModal] = useState(false);
  const [activeTab, setActiveTab] = useState('dados-gerais');
  const [modoEdicao, setModoEdicao] = useState(false);
  const [credenciadoEditando, setCredenciadoEditando] = useState<string | null>(null);
  
  // Estados para modais de confirmação
  const [showConfirmacaoExclusao, setShowConfirmacaoExclusao] = useState(false);
  const [showConfirmacaoInativacao, setShowConfirmacaoInativacao] = useState(false);
  const [showConfirmacaoReativacao, setShowConfirmacaoReativacao] = useState(false);
  const [credenciadoParaAcao, setCredenciadoParaAcao] = useState<Credenciado | null>(null);
  
  // Estados para visualização
  const [showViewCredenciadoModal, setShowViewCredenciadoModal] = useState(false);
  const [credenciadoVisualizando, setCredenciadoVisualizando] = useState<Credenciado | null>(null);
  
  // Estados dos campos do formulário
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    cnpj: '',
    email: '',
    site: '',
    cep: '',
    tipoLogradouro: '',
    logradouro: '',
    numero: '',
    complemento: '',
    uf: '',
    cidade: '',
    bairro: '',
    horarioFuncionamento: {
      segunda: { ativo: false, inicio: '', fim: '' },
      terca: { ativo: false, inicio: '', fim: '' },
      quarta: { ativo: false, inicio: '', fim: '' },
      quinta: { ativo: false, inicio: '', fim: '' },
      sexta: { ativo: false, inicio: '', fim: '' },
      sabado: { ativo: false, inicio: '', fim: '' },
      domingo: { ativo: false, inicio: '', fim: '' }
    },
    observacoesExames: '',
    observacoesGerais: '',
    utilizarPercentual: false,
    situacaoCredenciado: 'Ativo'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para aplicação rápida de horários
  const [horarioRapido, setHorarioRapido] = useState({
    inicio: '08:00',
    fim: '18:00'
  });

  // Estados para API de CNPJ
  const [loadingCnpj, setLoadingCnpj] = useState(false);
  const [cnpjError, setCnpjError] = useState('');
  const [cnpjSuccess, setCnpjSuccess] = useState('');
  const cnpjTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Estados para API de CEP
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState('');

  // Estados para notificações
  const [notification, setNotification] = useState({
    show: false,
    type: 'success' as 'success' | 'error',
    message: ''
  });

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 5000);
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  // Função para buscar CEP
  const buscarCep = useCallback(async (cepValue: string) => {
    const cepLimpo = cepValue.replace(/\D/g, '');
    
    if (cepLimpo.length === 8) {
      setLoadingCep(true);
      setCepError('');
      
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
        const data = await response.json();
        
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            logradouro: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
            uf: data.uf || '',
            tipoLogradouro: data.logradouro ? data.logradouro.split(' ')[0] : ''
          }));
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
  }, []);

  // Função para buscar dados da empresa por CNPJ
  const buscarDadosEmpresa = useCallback(async (cnpj: string) => {
    if (loadingCnpj) {
      return;
    }
    
    try {
      console.log('Buscando dados para CNPJ:', cnpj);
      setLoadingCnpj(true);
      setCnpjError('');
      
      const empresaInfo = await buscarEmpresaPorCNPJ(cnpj);
      
      if (empresaInfo) {
        // Preencher campos automaticamente
        setFormData(prev => ({
          ...prev,
          nome: empresaInfo.nomeFantasia || empresaInfo.razaoSocial,
          email: empresaInfo.email || prev.email,
          telefone: empresaInfo.telefone ? formatTelefone(empresaInfo.telefone) : prev.telefone,
          
          // Preencher endereço se disponível
          cep: empresaInfo.endereco.cep ? formatCEP(empresaInfo.endereco.cep) : prev.cep,
          logradouro: empresaInfo.endereco.logradouro || prev.logradouro,
          numero: empresaInfo.endereco.numero || prev.numero,
          complemento: empresaInfo.endereco.complemento || prev.complemento,
          bairro: empresaInfo.endereco.bairro || prev.bairro,
          cidade: empresaInfo.endereco.cidade || prev.cidade,
          uf: empresaInfo.endereco.uf || prev.uf,
          tipoLogradouro: empresaInfo.endereco.logradouro ? empresaInfo.endereco.logradouro.split(' ')[0] : prev.tipoLogradouro
        }));
        
        setCnpjError('');
        setCnpjSuccess('Dados da empresa carregados automaticamente!');
        
        // Limpar mensagem de sucesso após 3 segundos
        setTimeout(() => {
          setCnpjSuccess('');
        }, 3000);
      }
    } catch (error) {
      console.error('Erro ao buscar dados da empresa:', error);
      setCnpjError(error instanceof Error ? error.message : 'Erro ao consultar CNPJ');
      setCnpjSuccess('');
    } finally {
      setLoadingCnpj(false);
    }
  }, [loadingCnpj]);

  // Verificação de autenticação
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    setLoading(false);
  }, [router]);

  // Efeito para filtrar credenciados
  useEffect(() => {
    if (!todosCredenciados.length) return;
    
    let resultados = todosCredenciados.filter(credenciado => {
      // Filtro por situação
      let matchSituacao = true;
      if (situacao === 'ativo') {
        matchSituacao = credenciado.situacao === 'Ativo';
      } else if (situacao === 'inativo') {
        matchSituacao = credenciado.situacao === 'Inativo';
      }
      // Se situacao === 'todos', mostra todos
      
      // Filtro por busca
      let matchBusca = true;
      if (termoBusca.trim()) {
        switch (pesquisarPor) {
          case 'nome':
            matchBusca = credenciado.nome.toLowerCase().includes(termoBusca.toLowerCase());
            break;
          case 'cnpj':
            matchBusca = credenciado.cnpj.includes(termoBusca);
            break;
          case 'cidade':
            matchBusca = credenciado.cidade.toLowerCase().includes(termoBusca.toLowerCase());
            break;
          case 'estado':
            matchBusca = credenciado.estado.toLowerCase().includes(termoBusca.toLowerCase());
            break;
          default:
            matchBusca = credenciado.nome.toLowerCase().includes(termoBusca.toLowerCase());
        }
      }
      
      return matchSituacao && matchBusca;
    });

    setCredenciadosFiltrados(resultados);
    setPaginaAtual(1); // Reset para primeira página quando filtrar
  }, [termoBusca, situacao, pesquisarPor, todosCredenciados]);

  // Inicializar com todos os dados
  useEffect(() => {
    if (!loading && user) {
      carregarCredenciadosAPI();
    }
  }, [loading, user]);

  // Calcular dados da paginação
  const totalItens = credenciadosFiltrados.length;
  const totalPaginas = Math.ceil(totalItens / itensPorPagina);
  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const indiceFim = indiceInicio + itensPorPagina;
  const credenciadosExibidos = credenciadosFiltrados.slice(indiceInicio, indiceFim);

  const formatarCNPJ = (cnpj: string) => {
    return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  };

  const handleProcurar = () => {
    handleProcurarCredenciados();
  };

  const carregarCredenciados = async () => {
    setTermoBusca('');
    setSituacao('ativo');
    setPaginaAtual(1);
    await carregarCredenciadosAPI();
  };

  const carregarCredenciadosAPI = async () => {
    try {
      const credenciados = await credenciadosService.listar();
      // Converter dados da API para o formato usado na interface
      const credenciadosFormatados = credenciados.map(c => ({
        id: c.id.toString(),
        nome: c.nome,
        cnpj: c.cnpj,
        cidade: c.cidade,
        estado: c.uf,
        situacao: c.status === 'ativo' ? 'Ativo' as const : 'Inativo' as const,
        telefone: c.telefone,
        email: c.email,
        site: c.site,
        utilizar_percentual: c.utilizar_percentual,
        uf: c.uf,
        logradouro: c.logradouro,
        numero: c.numero,
        complemento: c.complemento,
        bairro: c.bairro,
        cep: c.cep,
        tipo_logradouro: c.tipo_logradouro,
        observacoes_exames: c.observacoes_exames,
        observacoes_gerais: c.observacoes_gerais
      }));
      setTodosCredenciados(credenciadosFormatados);
    } catch (error) {
      console.error('Erro ao carregar credenciados:', error);
      // Em caso de erro, manter mock data
      setTodosCredenciados(mockCredenciados);
    }
  };

  const handleNovoCredenciado = () => {
    setShowCadastroModal(true);
    setActiveTab('dados-gerais');
    setFormData({
      nome: '',
      telefone: '',
      cnpj: '',
      email: '',
      site: '',
      cep: '',
      tipoLogradouro: '',
      logradouro: '',
      numero: '',
      complemento: '',
      uf: '',
      cidade: '',
      bairro: '',
      horarioFuncionamento: {
        segunda: { ativo: false, inicio: '', fim: '' },
        terca: { ativo: false, inicio: '', fim: '' },
        quarta: { ativo: false, inicio: '', fim: '' },
        quinta: { ativo: false, inicio: '', fim: '' },
        sexta: { ativo: false, inicio: '', fim: '' },
        sabado: { ativo: false, inicio: '', fim: '' },
        domingo: { ativo: false, inicio: '', fim: '' }
      },
      observacoesExames: '',
      observacoesGerais: '',
      utilizarPercentual: false,
      situacaoCredenciado: 'Ativo'
    });
    setErrors({});
  };

  const handleFecharCadastro = () => {
    setShowCadastroModal(false);
    setModoEdicao(false);
    setCredenciadoEditando(null);
    setFormData({
      nome: '',
      telefone: '',
      cnpj: '',
      email: '',
      site: '',
      cep: '',
      tipoLogradouro: '',
      logradouro: '',
      numero: '',
      complemento: '',
      uf: '',
      cidade: '',
      bairro: '',
      horarioFuncionamento: {
        segunda: { ativo: false, inicio: '', fim: '' },
        terca: { ativo: false, inicio: '', fim: '' },
        quarta: { ativo: false, inicio: '', fim: '' },
        quinta: { ativo: false, inicio: '', fim: '' },
        sexta: { ativo: false, inicio: '', fim: '' },
        sabado: { ativo: false, inicio: '', fim: '' },
        domingo: { ativo: false, inicio: '', fim: '' }
      },
      observacoesExames: '',
      observacoesGerais: '',
      utilizarPercentual: false,
      situacaoCredenciado: 'Ativo'
    });
    setErrors({});
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    let formattedValue = value;
    
    // Aplicar formatações específicas
    if (typeof value === 'string') {
      switch (field) {
        case 'nome':
          formattedValue = formatTexto(value);
          break;
        case 'cnpj':
          formattedValue = formatCNPJ(value);
          // Limpar erros anteriores
          if (cnpjError) setCnpjError('');
          if (cnpjSuccess) setCnpjSuccess('');
          
          // Limpar timeout anterior se existir
          if (cnpjTimeoutRef.current) {
            clearTimeout(cnpjTimeoutRef.current);
            cnpjTimeoutRef.current = null;
          }
          
          // Se CNPJ estiver completo, buscar dados com debounce
          const cnpjLimpo = value.replace(/[^\d]/g, '');
          if (cnpjLimpo.length === 14 && isValidCNPJ(formattedValue)) {
            cnpjTimeoutRef.current = setTimeout(() => {
              buscarDadosEmpresa(cnpjLimpo);
            }, 800);
          }
          break;
        case 'telefone':
          formattedValue = formatTelefone(value);
          break;
        case 'cep':
          formattedValue = formatCEP(value);
          // Limpar erros anteriores
          if (cepError) setCepError('');
          
          // Se CEP estiver completo, buscar dados
          const cepLimpo = value.replace(/\D/g, '');
          if (cepLimpo.length === 8) {
            buscarCep(cepLimpo);
          }
          break;
      }
    }
    
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
    
    // Limpar erro do campo se houver
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCheckboxChange = (field: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [field]: checked }));
  };

  // Função para gerenciar horários de funcionamento
  const handleHorarioChange = (dia: string, campo: string, valor: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      horarioFuncionamento: {
        ...prev.horarioFuncionamento,
        [dia]: {
          ...prev.horarioFuncionamento[dia as keyof typeof prev.horarioFuncionamento],
          [campo]: valor
        }
      }
    }));
  };

  // Funções para atalhos de horário
  const aplicarHorarioTodosDias = (inicio: string, fim: string) => {
    const novoHorario = { ...formData.horarioFuncionamento };
    diasSemana.forEach(dia => {
      novoHorario[dia.key as keyof typeof novoHorario] = { ativo: true, inicio, fim };
    });
    setFormData(prev => ({ ...prev, horarioFuncionamento: novoHorario }));
  };

  const aplicarHorarioSegundaSexta = (inicio: string, fim: string) => {
    const novoHorario = { ...formData.horarioFuncionamento };
    ['segunda', 'terca', 'quarta', 'quinta', 'sexta'].forEach(dia => {
      novoHorario[dia as keyof typeof novoHorario] = { ativo: true, inicio, fim };
    });
    setFormData(prev => ({ ...prev, horarioFuncionamento: novoHorario }));
  };

  const aplicarHorarioFimSemana = (inicio: string, fim: string) => {
    const novoHorario = { ...formData.horarioFuncionamento };
    ['sabado', 'domingo'].forEach(dia => {
      novoHorario[dia as keyof typeof novoHorario] = { ativo: true, inicio, fim };
    });
    setFormData(prev => ({ ...prev, horarioFuncionamento: novoHorario }));
  };

  // Definição dos dias da semana
  const diasSemana = [
    { key: 'segunda', label: 'Segunda-feira' },
    { key: 'terca', label: 'Terça-feira' },
    { key: 'quarta', label: 'Quarta-feira' },
    { key: 'quinta', label: 'Quinta-feira' },
    { key: 'sexta', label: 'Sexta-feira' },
    { key: 'sabado', label: 'Sábado' },
    { key: 'domingo', label: 'Domingo' }
  ];

  const limparTodosHorarios = () => {
    const novoHorario = { ...formData.horarioFuncionamento };
    diasSemana.forEach(dia => {
      novoHorario[dia.key as keyof typeof novoHorario] = { ativo: false, inicio: '', fim: '' };
    });
    setFormData(prev => ({ ...prev, horarioFuncionamento: novoHorario }));
  };

  const handleSalvarCredenciado = async () => {
    // Validar campos obrigatórios
    const newErrors: Record<string, string> = {};
    
    // Validar nome
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }
    
    // Validar CNPJ
    if (!formData.cnpj.trim()) {
      newErrors.cnpj = 'CNPJ é obrigatório';
    } else if (!isValidCNPJ(formData.cnpj)) {
      newErrors.cnpj = 'CNPJ inválido';
    }
    
    // Validar telefone
    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    } else if (!isValidTelefone(formData.telefone)) {
      newErrors.telefone = 'Telefone inválido';
    }
    
    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail deve ter um formato válido';
    }
    
    // Validar campos de endereço obrigatórios
    if (!formData.cep.trim()) {
      newErrors.cep = 'CEP é obrigatório';
    } else if (!isValidCEP(formData.cep)) {
      newErrors.cep = 'CEP inválido';
    }
    if (!formData.tipoLogradouro.trim()) {
      newErrors.tipoLogradouro = 'Tipo de logradouro é obrigatório';
    }
    if (!formData.logradouro.trim()) {
      newErrors.logradouro = 'Logradouro é obrigatório';
    }
    if (!formData.numero.trim()) {
      newErrors.numero = 'Número é obrigatório';
    }
    if (!formData.cidade.trim()) {
      newErrors.cidade = 'Cidade é obrigatória';
    }
    if (!formData.uf.trim()) {
      newErrors.uf = 'UF é obrigatória';
    }
    if (!formData.bairro.trim()) {
      newErrors.bairro = 'Bairro é obrigatório';
    }
    
    // Se houver erros, mostrar e parar
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showNotification('error', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Preparar dados para envio
      const horarios: HorarioFuncionamento[] = [];
      
      // Converter horários do formulário para o formato da API
      Object.entries(formData.horarioFuncionamento).forEach(([dia, horario]) => {
        if (horario.ativo) {
          horarios.push({
            dia_semana: dia as any,
            ativo: true,
            horario_inicio: horario.inicio,
            horario_fim: horario.fim
          });
        }
      });
      
      const dadosCredenciado = {
        nome: formData.nome,
        cnpj: formData.cnpj.replace(/\D/g, ''), // Remove formatação do CNPJ
        telefone: formData.telefone,
        email: formData.email,
        site: formData.site,
        cep: formData.cep.replace(/\D/g, ''), // Remove formatação do CEP
        tipo_logradouro: formData.tipoLogradouro,
        logradouro: formData.logradouro,
        numero: formData.numero,
        complemento: formData.complemento,
        uf: formData.uf,
        cidade: formData.cidade,
        bairro: formData.bairro,
        observacoes_exames: formData.observacoesExames,
        observacoes_gerais: formData.observacoesGerais,
        utilizar_percentual: formData.utilizarPercentual,
        status: formData.situacaoCredenciado.toLowerCase() as 'ativo' | 'inativo',
        horarios_funcionamento: horarios
      };
      
      if (modoEdicao && credenciadoEditando) {
        // Atualizar credenciado existente
        await credenciadosService.atualizar(parseInt(credenciadoEditando), dadosCredenciado);
        showNotification('success', 'Credenciado atualizado com sucesso!');
      } else {
        // Criar novo credenciado
        await credenciadosService.criar(dadosCredenciado);
        showNotification('success', 'Credenciado cadastrado com sucesso!');
      }
      
      // Limpar formulário e fechar modal
      handleLimparFormulario();
      handleFecharCadastro();
      
      // Recarregar lista de credenciados
      await carregarCredenciadosAPI();
      
    } catch (error: any) {
      console.error('Erro ao salvar credenciado:', error);
      showNotification('error', error.message || 'Erro ao salvar credenciado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLimparFormulario = () => {
    setFormData({
      nome: '',
      telefone: '',
      cnpj: '',
      email: '',
      site: '',
      cep: '',
      tipoLogradouro: '',
      logradouro: '',
      numero: '',
      complemento: '',
      uf: '',
      cidade: '',
      bairro: '',
      horarioFuncionamento: {
        segunda: { ativo: false, inicio: '', fim: '' },
        terca: { ativo: false, inicio: '', fim: '' },
        quarta: { ativo: false, inicio: '', fim: '' },
        quinta: { ativo: false, inicio: '', fim: '' },
        sexta: { ativo: false, inicio: '', fim: '' },
        sabado: { ativo: false, inicio: '', fim: '' },
        domingo: { ativo: false, inicio: '', fim: '' }
      },
      observacoesExames: '',
      observacoesGerais: '',
      utilizarPercentual: false,
      situacaoCredenciado: 'Ativo'
    });
    setErrors({});
  };

  // Funções para ações da tabela
  const handleVisualizarCredenciado = async (credenciado: Credenciado) => {
    try {
      // Buscar dados completos do credenciado na API
      const credenciadoCompleto = await credenciadosService.buscarPorId(parseInt(credenciado.id));
      
      // Mapear para o formato da interface
      const credenciadoFormatado = {
        id: credenciadoCompleto.id.toString(),
        nome: credenciadoCompleto.nome,
        cnpj: credenciadoCompleto.cnpj,
        cidade: credenciadoCompleto.cidade,
        estado: credenciadoCompleto.uf,
        situacao: credenciadoCompleto.status === 'ativo' ? 'Ativo' as const : 'Inativo' as const,
        telefone: credenciadoCompleto.telefone,
        email: credenciadoCompleto.email,
        site: credenciadoCompleto.site,
        utilizar_percentual: credenciadoCompleto.utilizar_percentual,
        uf: credenciadoCompleto.uf,
        logradouro: credenciadoCompleto.logradouro,
        numero: credenciadoCompleto.numero,
        complemento: credenciadoCompleto.complemento,
        bairro: credenciadoCompleto.bairro,
        cep: credenciadoCompleto.cep,
        tipo_logradouro: credenciadoCompleto.tipo_logradouro,
        observacoes_exames: credenciadoCompleto.observacoes_exames,
        observacoes_gerais: credenciadoCompleto.observacoes_gerais
      };
      
      setCredenciadoVisualizando(credenciadoFormatado);
      setShowViewCredenciadoModal(true);
    } catch (error) {
      console.error('Erro ao carregar dados do credenciado:', error);
      showNotification('error', 'Erro ao carregar dados do credenciado');
    }
  };

  const handleFecharVisualizacao = () => {
    setShowViewCredenciadoModal(false);
    setCredenciadoVisualizando(null);
  };

  const handleEditarCredenciado = (credenciado: Credenciado) => {
    setModoEdicao(true);
    setCredenciadoEditando(credenciado.id);
    setFormData({
      nome: credenciado.nome,
      telefone: '',
      cnpj: credenciado.cnpj,
      email: '',
      site: '',
      cep: '',
      tipoLogradouro: '',
      logradouro: '',
      numero: '',
      complemento: '',
      uf: '',
      cidade: credenciado.cidade,
      bairro: '',
      horarioFuncionamento: {
        segunda: { ativo: false, inicio: '', fim: '' },
        terca: { ativo: false, inicio: '', fim: '' },
        quarta: { ativo: false, inicio: '', fim: '' },
        quinta: { ativo: false, inicio: '', fim: '' },
        sexta: { ativo: false, inicio: '', fim: '' },
        sabado: { ativo: false, inicio: '', fim: '' },
        domingo: { ativo: false, inicio: '', fim: '' }
      },
      observacoesExames: '',
      observacoesGerais: '',
      utilizarPercentual: false,
      situacaoCredenciado: credenciado.situacao
    });
    setShowCadastroModal(true);
    setErrors({});
  };

  const handleExcluirCredenciado = (credenciado: Credenciado) => {
    setCredenciadoParaAcao(credenciado);
    setShowConfirmacaoExclusao(true);
  };

  const handleInativarCredenciado = (credenciado: Credenciado) => {
    setCredenciadoParaAcao(credenciado);
    setShowConfirmacaoInativacao(true);
  };

  const handleReativarCredenciado = (credenciado: Credenciado) => {
    setCredenciadoParaAcao(credenciado);
    setShowConfirmacaoReativacao(true);
  };

  const confirmarExclusao = async () => {
    if (!credenciadoParaAcao) return;
    
    setIsSubmitting(true);
    try {
      await credenciadosService.excluir(parseInt(credenciadoParaAcao.id));
      showNotification('success', 'Credenciado excluído com sucesso!');
      
      // Recarregar lista de credenciados
      await carregarCredenciadosAPI();
      
      setShowConfirmacaoExclusao(false);
      setCredenciadoParaAcao(null);
    } catch (error: any) {
      console.error('Erro ao excluir credenciado:', error);
      showNotification('error', error.message || 'Erro ao excluir credenciado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmarInativacao = async () => {
    if (!credenciadoParaAcao) return;
    
    setIsSubmitting(true);
    try {
      await credenciadosService.alterarStatus(parseInt(credenciadoParaAcao.id), 'inativo');
      showNotification('success', 'Credenciado inativado com sucesso!');
      
      // Recarregar lista de credenciados
      await carregarCredenciadosAPI();
      
      setShowConfirmacaoInativacao(false);
      setCredenciadoParaAcao(null);
    } catch (error: any) {
      console.error('Erro ao inativar credenciado:', error);
      showNotification('error', error.message || 'Erro ao inativar credenciado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmarReativacao = async () => {
    if (!credenciadoParaAcao) return;
    
    setIsSubmitting(true);
    try {
      await credenciadosService.alterarStatus(parseInt(credenciadoParaAcao.id), 'ativo');
      showNotification('success', 'Credenciado reativado com sucesso!');
      
      // Recarregar lista de credenciados
      await carregarCredenciadosAPI();
      
      setShowConfirmacaoReativacao(false);
      setCredenciadoParaAcao(null);
    } catch (error: any) {
      console.error('Erro ao reativar credenciado:', error);
      showNotification('error', error.message || 'Erro ao reativar credenciado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelarAcao = () => {
    setShowConfirmacaoExclusao(false);
    setShowConfirmacaoInativacao(false);
    setShowConfirmacaoReativacao(false);
    setCredenciadoParaAcao(null);
  };

  const gerarPaginacao = () => {
    const paginas = [];
    const maxPaginasVisiveis = 5;
    let inicio = Math.max(1, paginaAtual - Math.floor(maxPaginasVisiveis / 2));
    let fim = Math.min(totalPaginas, inicio + maxPaginasVisiveis - 1);

    if (fim - inicio < maxPaginasVisiveis - 1) {
      inicio = Math.max(1, fim - maxPaginasVisiveis + 1);
    }

    for (let i = inicio; i <= fim; i++) {
      paginas.push(i);
    }

    return paginas;
  };

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

  // Funções auxiliares para busca e autocomplete
  const getPlaceholder = () => {
    switch (pesquisarPor) {
      case 'nome':
        return 'Digite o nome do credenciado...';
      case 'cnpj':
        return 'Digite o CNPJ...';
      case 'cidade':
        return 'Digite a cidade...';
      case 'estado':
        return 'Digite o estado...';
      default:
        return 'Digite o termo para busca...';
    }
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

  // Função para filtrar credenciados em tempo real (autocomplete)
  const handleAutocompleteSearch = (value: string) => {
    if (!value.trim()) {
      setShowAutocomplete(false);
      return;
    }

    if (!Array.isArray(todosCredenciados)) {
      setShowAutocomplete(false);
      return;
    }

    const filtered = todosCredenciados.filter(credenciado => {
      switch (pesquisarPor) {
        case 'nome':
          return credenciado.nome?.toLowerCase().includes(value.toLowerCase());
        case 'cnpj':
          return credenciado.cnpj?.toLowerCase().includes(value.toLowerCase());
        case 'cidade':
          return credenciado.cidade?.toLowerCase().includes(value.toLowerCase());
        case 'estado':
          return credenciado.estado?.toLowerCase().includes(value.toLowerCase());
        default:
          return credenciado.nome?.toLowerCase().includes(value.toLowerCase());
      }
    }).slice(0, 5);

    setAutocompleteResults(filtered);
    setShowAutocomplete(filtered.length > 0);
  };

  // Handler customizado para mudança de busca
  const handleCustomTermoBuscaChange = (value: string) => {
    setTermoBusca(value);
    handleAutocompleteSearch(value);
  };

  // Handler para seleção do autocomplete
  const handleSelectAutocomplete = (credenciado: Credenciado) => {
    setTermoBusca(credenciado.nome);
    setShowAutocomplete(false);
  };

  // Função para procurar credenciados
  const handleProcurarCredenciados = () => {
    setShowAutocomplete(false);
    const totalFiltrados = credenciadosFiltrados.length;
    
    if (totalFiltrados === 0) {
      let tipoTexto;
      switch (pesquisarPor) {
        case 'cnpj':
          tipoTexto = 'CNPJ';
          break;
        case 'cidade':
          tipoTexto = 'cidade';
          break;
        case 'estado':
          tipoTexto = 'estado';
          break;
        default:
          tipoTexto = 'nome';
      }
      showNotification('error', `Nenhum credenciado encontrado com o ${tipoTexto} pesquisado`);
    } else {
      showNotification('success', `${totalFiltrados} credenciado(s) encontrado(s)`);
    }
  };

  if (loading) {
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
              onClick={() => hideNotification()}
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
                <span className="text-[#00A298] font-medium">Cadastro de Credenciados</span>
              </div>
              
              <h1 className="text-3xl font-bold text-[#1D3C44] mb-2">
                🏥 Cadastro de Credenciados
              </h1>
              <p className="text-gray-600">
                Cadastro e gerenciamento de profissionais e instituições credenciadas
              </p>
            </div>

            {/* Conteúdo Principal */}
            <div className="bg-white rounded-2xl shadow-xl">
              {/* Formulário de Busca */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-wrap gap-2 items-end">
                  <div className="flex-1 min-w-64 relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pesquisar por
                    </label>
                    <select
                      value={pesquisarPor}
                      onChange={(e) => {
                        setPesquisarPor(e.target.value);
                        setTermoBusca(''); // Limpar campo ao trocar tipo
                        setShowAutocomplete(false);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                    >
                      <option value="nome">Nome</option>
                      <option value="cnpj">CNPJ</option>
                      <option value="cidade">Cidade</option>
                      <option value="estado">Estado</option>
                    </select>
                  </div>
                  
                  <div className="flex-1 min-w-64 relative">
                    <input
                      type="text"
                      value={termoBusca}
                      onChange={(e) => {
                        handleCustomTermoBuscaChange(e.target.value);
                      }}
                      onFocus={() => {
                        if (termoBusca.trim()) {
                          handleAutocompleteSearch(termoBusca);
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
                        {autocompleteResults.map((credenciado) => (
                          <div
                            key={credenciado.id}
                            onClick={() => handleSelectAutocomplete(credenciado)}
                            className="px-4 py-3 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">{destacarTexto(credenciado.nome, termoBusca)}</div>
                            <div className="text-sm text-gray-500 mt-1">
                              <span className="text-blue-600">🏥 CNPJ: {formatarCNPJ(credenciado.cnpj)}</span>
                              <span className="ml-2 text-green-600">📍 {credenciado.cidade}, {credenciado.estado}</span>
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {credenciado.email && <span className="text-purple-600">📧 {credenciado.email}</span>}
                              <span className={`ml-2 ${credenciado.situacao === 'Ativo' ? 'text-green-600' : 'text-red-600'}`}>
                                {credenciado.situacao === 'Ativo' ? '✅ Ativo' : '❌ Inativo'}
                              </span>
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
                      value={situacao}
                      onChange={(e) => setSituacao(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                    >
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                      <option value="todos">Todos</option>
                    </select>
                  </div>

                  <button 
                    onClick={handleProcurarCredenciados}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer ml-2"
                  >
                    PROCURAR  
                  </button>
                  
                  <button 
                    onClick={handleNovoCredenciado}
                    className="bg-[#00A298] hover:bg-[#1D3C44] text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    NOVO CREDENCIADO
                  </button>
                  
                  <button 
                    onClick={carregarCredenciados}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    ATUALIZAR
                  </button>
                </div>
              </div>

              {/* Container de Cadastro de Credenciado */}
              {showCadastroModal && (
                <div className="p-6 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-[#1D3C44]">
                      {modoEdicao ? 'Editar Credenciado' : 'Cadastro de Credenciado'}
                    </h3>
                  </div>
                  
                  {/* Legenda de campos obrigatórios */}
                  <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center text-sm text-blue-800">
                      <span className="text-red-500 mr-2 font-bold">*</span>
                      <span className="font-medium">Campos obrigatórios</span>
                      <span className="mx-2">•</span>
                      <span className="text-blue-600">Preencha todos os campos marcados com asterisco para continuar</span>
                    </div>
                  </div>
                  
                  {/* Conteúdo do formulário */}
                  <div className="space-y-8">
                    {/* Informações Básicas */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-700 mb-6 border-b border-gray-200 pb-3">Informações Básicas</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nome do Credenciado <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.nome}
                            onChange={(e) => handleInputChange('nome', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all duration-200 ${
                              errors.nome ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="Digite o nome completo"
                          />
                          {errors.nome && (
                            <p className="text-red-500 text-xs mt-1">{errors.nome}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CNPJ <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.cnpj}
                            onChange={(e) => handleInputChange('cnpj', e.target.value)}
                            maxLength={18}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all duration-200 ${
                              errors.cnpj || cnpjError ? 'border-red-300 bg-red-50' : 
                              cnpjSuccess ? 'border-green-300 bg-green-50' : 'border-gray-300'
                            }`}
                            placeholder="00.000.000/0000-00"
                          />
                          {loadingCnpj && (
                            <p className="text-xs text-blue-500 mt-1 flex items-center">
                              <svg className="animate-spin h-3 w-3 mr-1" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Buscando dados da empresa...
                            </p>
                          )}
                          {cnpjError && <p className="text-xs text-red-500 mt-1">{cnpjError}</p>}
                          {cnpjSuccess && <p className="text-xs text-green-500 mt-1">{cnpjSuccess}</p>}
                          {errors.cnpj && (
                            <p className="text-red-500 text-xs mt-1">{errors.cnpj}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Telefone <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.telefone}
                            onChange={(e) => handleInputChange('telefone', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all duration-200 ${
                              errors.telefone ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="(00) 00000-0000"
                          />
                          {errors.telefone && (
                            <p className="mt-1 text-sm text-red-600">{errors.telefone}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            E-mail <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all duration-200 ${
                              errors.email ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="contato@exemplo.com"
                          />
                          {errors.email && (
                            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Website
                          </label>
                          <input
                            type="url"
                            value={formData.site}
                            onChange={(e) => handleInputChange('site', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all duration-200"
                            placeholder="https://www.exemplo.com"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Endereço */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-700 mb-6 border-b border-gray-200 pb-3">Endereço</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CEP <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.cep}
                            onChange={(e) => handleInputChange('cep', e.target.value)}
                            maxLength={9}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all duration-200 ${
                              errors.cep || cepError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="00000-000"
                          />
                          {loadingCep && (
                            <p className="text-xs text-blue-500 mt-1 flex items-center">
                              <svg className="animate-spin h-3 w-3 mr-1" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Buscando CEP...
                            </p>
                          )}
                          {cepError && <p className="text-xs text-red-500 mt-1">{cepError}</p>}
                          {errors.cep && (
                            <p className="mt-1 text-sm text-red-600">{errors.cep}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tipo <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.tipoLogradouro}
                            onChange={(e) => handleInputChange('tipoLogradouro', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all duration-200 ${
                              errors.tipoLogradouro ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                          >
                            <option value="">Selecione...</option>
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

                        <div className="lg:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Logradouro <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.logradouro}
                            onChange={(e) => handleInputChange('logradouro', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all duration-200 ${
                              errors.logradouro ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Nome da rua, avenida, etc."
                          />
                          {errors.logradouro && (
                            <p className="mt-1 text-sm text-red-600">{errors.logradouro}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Número <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.numero}
                            onChange={(e) => handleInputChange('numero', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all duration-200 ${
                              errors.numero ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="123"
                          />
                          {errors.numero && (
                            <p className="mt-1 text-sm text-red-600">{errors.numero}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Complemento
                          </label>
                          <input
                            type="text"
                            value={formData.complemento}
                            onChange={(e) => handleInputChange('complemento', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all duration-200"
                            placeholder="Sala, andar, etc."
                          />
                        </div>

                        <div className="lg:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cidade <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.cidade}
                            onChange={(e) => handleInputChange('cidade', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all duration-200 ${
                              errors.cidade ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Nome da cidade"
                          />
                          {errors.cidade && (
                            <p className="mt-1 text-sm text-red-600">{errors.cidade}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            UF <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={formData.uf}
                            onChange={(e) => handleInputChange('uf', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all duration-200 ${
                              errors.uf ? 'border-red-500' : 'border-gray-300'
                            }`}
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
                          {errors.uf && (
                            <p className="mt-1 text-sm text-red-600">{errors.uf}</p>
                          )}
                        </div>

                        <div className="lg:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bairro <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.bairro}
                            onChange={(e) => handleInputChange('bairro', e.target.value)}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all duration-200 ${
                              errors.bairro ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Nome do bairro"
                          />
                          {errors.bairro && (
                            <p className="mt-1 text-sm text-red-600">{errors.bairro}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Informações Complementares */}
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                      <h4 className="text-lg font-semibold text-gray-700 mb-6 border-b border-gray-200 pb-3">Informações Complementares</h4>
                      <div className="space-y-6">
                        {/* Horário de Funcionamento */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-4">
                            Horário de Funcionamento
                          </label>
                          
                          {/* Aplicação Rápida */}
                          <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-200">
                            <h5 className="text-sm font-semibold text-blue-800 mb-3">⚡ Aplicação Rápida</h5>
                            <div className="space-y-3">
                              {/* Horário padrão */}
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="text-sm text-gray-600 min-w-[60px]">Horário:</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-600">Das</span>
                                  <input
                                    type="time"
                                    value={horarioRapido.inicio}
                                    onChange={(e) => setHorarioRapido(prev => ({ ...prev, inicio: e.target.value }))}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent text-sm"
                                  />
                                  <span className="text-sm text-gray-600">às</span>
                                  <input
                                    type="time"
                                    value={horarioRapido.fim}
                                    onChange={(e) => setHorarioRapido(prev => ({ ...prev, fim: e.target.value }))}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent text-sm"
                                  />
                                </div>
                              </div>
                              
                              {/* Botões de aplicação */}
                              <div className="flex gap-2 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => aplicarHorarioTodosDias(horarioRapido.inicio, horarioRapido.fim)}
                                  className="px-3 py-2 bg-[#00A298] hover:bg-[#1D3C44] text-white text-xs rounded-lg transition-all duration-200 cursor-pointer"
                                >
                                  Todos os dias
                                </button>
                                <button
                                  type="button"
                                  onClick={() => aplicarHorarioSegundaSexta(horarioRapido.inicio, horarioRapido.fim)}
                                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition-all duration-200 cursor-pointer"
                                >
                                  Segunda a Sexta
                                </button>
                                <button
                                  type="button"
                                  onClick={() => aplicarHorarioFimSemana(horarioRapido.inicio, horarioRapido.fim)}
                                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg transition-all duration-200 cursor-pointer"
                                >
                                  Fins de semana
                                </button>
                                <button
                                  type="button"
                                  onClick={limparTodosHorarios}
                                  className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white text-xs rounded-lg transition-all duration-200 cursor-pointer"
                                >
                                  Limpar tudo
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Personalização Individual */}
                          <div>
                            <h5 className="text-sm font-medium text-gray-700 mb-3">🔧 Personalização Individual</h5>
                            <div className="space-y-2">
                              {diasSemana.map((dia) => {
                                const horarioDia = formData.horarioFuncionamento[dia.key as keyof typeof formData.horarioFuncionamento];
                                return (
                                  <div key={dia.key} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center w-32">
                                      <input
                                        type="checkbox"
                                        id={`${dia.key}-ativo`}
                                        checked={horarioDia.ativo}
                                        onChange={(e) => handleHorarioChange(dia.key, 'ativo', e.target.checked)}
                                        className="h-4 w-4 text-[#00A298] focus:ring-[#00A298] border-gray-300 rounded mr-2"
                                      />
                                      <label htmlFor={`${dia.key}-ativo`} className="text-sm font-medium text-gray-700">
                                        {dia.label}
                                      </label>
                                    </div>
                                    
                                    {horarioDia.ativo && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm text-gray-600">Das</span>
                                        <input
                                          type="time"
                                          value={horarioDia.inicio}
                                          onChange={(e) => handleHorarioChange(dia.key, 'inicio', e.target.value)}
                                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent text-sm"
                                        />
                                        <span className="text-sm text-gray-600">às</span>
                                        <input
                                          type="time"
                                          value={horarioDia.fim}
                                          onChange={(e) => handleHorarioChange(dia.key, 'fim', e.target.value)}
                                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent text-sm"
                                        />
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Situação */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Situação
                            </label>
                            <select
                              value={formData.situacaoCredenciado}
                              onChange={(e) => handleInputChange('situacaoCredenciado', e.target.value)}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all duration-200"
                            >
                              <option value="Ativo">Ativo</option>
                              <option value="Inativo">Inativo</option>
                            </select>
                          </div>
                        </div>

                        {/* Observações */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Observações para Requisição de Exames
                          </label>
                          <textarea
                            rows={3}
                            value={formData.observacoesExames}
                            onChange={(e) => handleInputChange('observacoesExames', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all duration-200"
                            placeholder="Informações importantes para requisição de exames..."
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Observações Gerais
                          </label>
                          <textarea
                            rows={3}
                            value={formData.observacoesGerais}
                            onChange={(e) => handleInputChange('observacoesGerais', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent transition-all duration-200"
                            placeholder="Outras informações relevantes..."
                          />
                        </div>

                        {/* Checkbox de percentual */}
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              type="checkbox"
                              id="utilizarPercentual"
                              checked={formData.utilizarPercentual}
                              onChange={(e) => handleCheckboxChange('utilizarPercentual', e.target.checked)}
                              className="h-4 w-4 text-[#00A298] focus:ring-[#00A298] border-gray-300 rounded"
                            />
                          </div>
                          <div className="ml-3 text-sm">
                            <label htmlFor="utilizarPercentual" className="font-medium text-gray-700">
                              Aplicar percentual de aumento da empresa
                            </label>
                            <p className="text-gray-500">
                              Utilizar o percentual de aumento da empresa sobre o valor do credenciado para calcular o valor de cobrança do cliente
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Botões de Ação */}
                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSalvarCredenciado}
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'INCLUINDO...' : (modoEdicao ? 'ATUALIZAR' : 'INCLUIR')}
                    </button>
                    <button
                      onClick={handleLimparFormulario}
                      className="bg-blue-400 hover:bg-blue-500 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                    >
                      LIMPAR
                    </button>
                    <button
                      onClick={handleFecharCadastro}
                      className="bg-gray-400 hover:bg-gray-500 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                    >
                      VOLTAR
                    </button>
                  </div>
                </div>
              )}

              {/* Tabela de Credenciados - só mostra quando não está cadastrando */}
              {!showCadastroModal && (
                                  <div className="p-6">
                  <div className="border border-gray-200 rounded-lg">
                    <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Nome do Credenciado
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          CNPJ
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Localização
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                          Situação
                        </th>
                        <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {credenciadosExibidos.length > 0 ? (
                        credenciadosExibidos.map((credenciado) => (
                          <tr key={credenciado.id} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm">
                              <div className="font-medium text-gray-900">{destacarTexto(credenciado.nome, termoBusca)}</div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              <div>
                                {pesquisarPor === 'cnpj' ? destacarTexto(formatarCNPJ(credenciado.cnpj), termoBusca) : formatarCNPJ(credenciado.cnpj)}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              <div>
                                {pesquisarPor === 'cidade' ? destacarTexto(`${credenciado.cidade}, ${credenciado.estado}`, termoBusca) : 
                                 pesquisarPor === 'estado' ? destacarTexto(`${credenciado.cidade}, ${credenciado.estado}`, termoBusca) :
                                 `${credenciado.cidade}, ${credenciado.estado}`}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-center">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                credenciado.situacao === 'Ativo' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {credenciado.situacao}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex space-x-2 justify-center">
                                <button 
                                  onClick={() => handleVisualizarCredenciado(credenciado)}
                                  className="text-green-600 hover:text-green-800 text-xs font-medium cursor-pointer"
                                >
                                  Visualizar
                                </button>
                                {/* Botão Editar - disponível para ADMIN e SUPER_ADMIN */}
                                {(user?.role === 'admin' || user?.role === 'super_admin') && (
                                  <button 
                                    onClick={() => handleEditarCredenciado(credenciado)}
                                    className="text-blue-600 hover:text-blue-800 text-xs font-medium cursor-pointer"
                                  >
                                    Editar
                                  </button>
                                )}
                                {/* Botão Reativar - apenas para ADMIN e SUPER_ADMIN quando o credenciado está inativo */}
                                {(user?.role === 'admin' || user?.role === 'super_admin') && credenciado.situacao === 'Inativo' && (
                                  <button 
                                    onClick={() => handleReativarCredenciado(credenciado)}
                                    className="text-emerald-600 hover:text-emerald-800 text-xs font-medium cursor-pointer"
                                  >
                                    Reativar
                                  </button>
                                )}
                                {/* Botão Inativar - apenas para ADMIN e SUPER_ADMIN quando o credenciado está ativo */}
                                {(user?.role === 'admin' || user?.role === 'super_admin') && credenciado.situacao === 'Ativo' && (
                                  <button 
                                    onClick={() => handleInativarCredenciado(credenciado)}
                                    className="text-orange-600 hover:text-orange-800 text-xs font-medium cursor-pointer"
                                  >
                                    Inativar
                                  </button>
                                )}
                                {/* Botão Excluir (físico) - apenas para SUPER_ADMIN */}
                                {user?.role === 'super_admin' && (
                                  <button 
                                    onClick={() => handleExcluirCredenciado(credenciado)}
                                    className="text-red-600 hover:text-red-800 text-xs font-medium cursor-pointer"
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
                          <td colSpan={5} className="px-4 py-12 text-center">
                            <div className="text-gray-500">
                              <div className="mb-2">Nenhum credenciado encontrado</div>
                              <div className="text-sm">Ajuste os filtros ou cadastre um novo credenciado</div>
                            </div>
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
      {showViewCredenciadoModal && credenciadoVisualizando && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-bold text-[#1D3C44] mb-4">Visualizar Credenciado</h3>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Dados cadastrais</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nome do Credenciado
                    </label>
                    <input
                      type="text"
                      value={credenciadoVisualizando.nome || ''}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CNPJ
                    </label>
                    <input
                      type="text"
                      value={formatarCNPJ(credenciadoVisualizando.cnpj) || ''}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefone
                    </label>
                    <input
                      type="text"
                      value={credenciadoVisualizando.telefone || 'Não informado'}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      E-mail
                    </label>
                    <input
                      type="text"
                      value={credenciadoVisualizando.email || 'Não informado'}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website
                    </label>
                    <input
                      type="text"
                      value={credenciadoVisualizando.site || 'Não informado'}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cidade/UF
                    </label>
                    <input
                      type="text"
                      value={`${credenciadoVisualizando.cidade}, ${credenciadoVisualizando.estado}` || ''}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Percentual de Aumento
                    </label>
                    <input
                      type="text"
                      value={credenciadoVisualizando.utilizar_percentual ? 'Utiliza' : 'Não utiliza'}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Situação
                    </label>
                    <input
                      type="text"
                      value={credenciadoVisualizando.situacao || ''}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>
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

      {/* Modal de Confirmação de Inativação */}
      {showConfirmacaoInativacao && credenciadoParaAcao && (
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
                    Tem certeza que deseja inativar o credenciado "{credenciadoParaAcao.nome}"?
                  </p>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Atenção:</strong> O credenciado será marcado como inativo e não aparecerá mais nos seletores. Esta ação pode ser revertida alterando o status para ativo novamente.
                </p>
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelarAcao}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg text-sm transition-all duration-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarInativacao}
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
      {showConfirmacaoExclusao && credenciadoParaAcao && (
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
                    Tem certeza que deseja excluir DEFINITIVAMENTE o credenciado "{credenciadoParaAcao.nome}"?
                  </p>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800">
                  <strong>ATENÇÃO:</strong> Esta ação é irreversível! O credenciado será excluído permanentemente do banco de dados e não poderá ser recuperado.
                </p>
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelarAcao}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg text-sm transition-all duration-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarExclusao}
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
      {showConfirmacaoReativacao && credenciadoParaAcao && (
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
                    Tem certeza que deseja reativar o credenciado "{credenciadoParaAcao.nome}"?
                  </p>
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-green-800">
                  <strong>Informação:</strong> O credenciado será marcado como ativo e voltará a aparecer nos seletores e relatórios.
                </p>
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelarAcao}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg text-sm transition-all duration-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmarReativacao}
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