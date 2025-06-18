import { useState, useCallback } from 'react';
import { Endereco, FormErrors, Grupo, Regiao, Empresa } from '../types/empresa.types';
import { validateEmpresaForm, hasFormErrors } from '../utils/validations';
import { 
  formatCEP, 
  formatCPF, 
  formatTelefone, 
  formatTexto, 
  isValidCPF,
  isValidTelefone,
  formatarNumeroInscricao,
  formatarCno
} from '../utils/formatters';

export const useFormularioEmpresa = () => {
  // Estados do formulário
  const [activeTab, setActiveTab] = useState('dados-empresa');
  const [tipoEstabelecimento, setTipoEstabelecimento] = useState('matriz');
  const [classificacaoPorte, setClassificacaoPorte] = useState('ME');
  
  // Estados para CEP e endereço
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState<Endereco>({
    logradouro: '',
    tipoLogradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: ''
  });
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState('');
  
  // Estados para contato
  const [contato, setContato] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  
  // Estados para observações
  const [observacao, setObservacao] = useState('');
  const [observacaoOS, setObservacaoOS] = useState('');
  
  // Estados para campos principais
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
  
  // Estados para Ponto Focal
  const [showPontoFocal, setShowPontoFocal] = useState(false);
  const [pontoFocalNome, setPontoFocalNome] = useState('');
  const [pontoFocalDescricao, setPontoFocalDescricao] = useState('');
  const [pontoFocalObservacoes, setPontoFocalObservacoes] = useState('');
  const [pontoFocalPrincipal, setPontoFocalPrincipal] = useState(false);
  
  // Estados para erros
  const [errors, setErrors] = useState<FormErrors>({
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

  // Estados para grupos e regiões filtradas
  const [regioesFiltradas, setRegioesFiltradas] = useState<Regiao[]>([]);
  const [gruposFiltradosPorRegiao, setGruposFiltradosPorRegiao] = useState<Grupo[]>([]);

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
          setEndereco(prev => ({
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

  // Handlers para mudanças nos campos
  const handleCepChange = useCallback((value: string) => {
    const formattedCep = formatCEP(value);
    setCep(formattedCep);
    
    if (cepError) {
      setCepError('');
    }
    
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 8) {
      buscarCep(numbers);
    }
  }, [cepError, buscarCep]);

  const handleNumeroInscricaoChange = useCallback((value: string) => {
    const formatted = formatarNumeroInscricao(value, tipoInscricao);
    setNumeroInscricao(formatted);
  }, [tipoInscricao]);

  const handleCpfRepresentanteChange = useCallback((value: string) => {
    const formatted = formatCPF(value);
    setCpfRepresentante(formatted);
  }, []);

  const handleTelefoneChange = useCallback((value: string) => {
    const formatted = formatTelefone(value);
    setTelefone(formatted);
  }, []);

  const handleNomeRepresentanteChange = useCallback((value: string) => {
    const formatted = formatTexto(value);
    setNomeRepresentante(formatted);
  }, []);

  const handleContatoChange = useCallback((value: string) => {
    const formatted = formatTexto(value);
    setContato(formatted);
  }, []);

  const handleCnoChange = useCallback((value: string) => {
    const formatted = formatarCno(value);
    setCno(formatted);
  }, []);

  // Função para filtrar regiões por grupo
  const handleGrupoChange = useCallback((grupoId: string, regioesAtivas: Regiao[]) => {
    setGrupoSelecionado(grupoId);
    
    if (grupoId) {
      const regioesFiltradas = regioesAtivas.filter(regiao => 
        regiao.grupo_id === parseInt(grupoId)
      );
      setRegioesFiltradas(regioesFiltradas);
      
      if (regioesFiltradas.length === 1) {
        setRegiaoSelecionada(regioesFiltradas[0].id.toString());
      } else {
        setRegiaoSelecionada('');
      }
    } else {
      setRegioesFiltradas(regioesAtivas);
      setRegiaoSelecionada('');
    }
  }, []);

  // Função para filtrar grupos por região
  const handleRegiaoChange = useCallback((regiaoId: string, regioesAtivas: Regiao[], gruposAtivos: Grupo[]) => {
    setRegiaoSelecionada(regiaoId);
    
    if (regiaoId) {
      const regiaoSelecionadaObj = regioesAtivas.find(regiao => regiao.id === parseInt(regiaoId));
      
      if (regiaoSelecionadaObj && regiaoSelecionadaObj.grupo_id) {
        const grupoAssociado = gruposAtivos.find(grupo => grupo.id === regiaoSelecionadaObj.grupo_id);
        setGruposFiltradosPorRegiao(grupoAssociado ? [grupoAssociado] : []);
        setGrupoSelecionado(regiaoSelecionadaObj.grupo_id.toString());
      } else {
        setGruposFiltradosPorRegiao(gruposAtivos);
        setGrupoSelecionado('');
      }
    } else {
      setGruposFiltradosPorRegiao(gruposAtivos);
      setGrupoSelecionado('');
    }
  }, []);

  // Função para validar formulário
  const validateForm = useCallback(() => {
    const formData = {
      nomeFantasia,
      razaoSocial,
      grupoSelecionado,
      regiaoSelecionada,
      cnaeDescricao,
      risco,
      cep,
      numeroEndereco: endereco.numero,
      tipoInscricao,
      numeroInscricao,
      cno
    };

    const newErrors = validateEmpresaForm(formData);
    setErrors(newErrors);
    return !hasFormErrors(newErrors);
  }, [nomeFantasia, razaoSocial, grupoSelecionado, regiaoSelecionada, cnaeDescricao, risco, cep, endereco.numero, tipoInscricao, numeroInscricao, cno]);

  // Função para obter dados do formulário
  const getFormData = useCallback(() => {
    return {
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
      ponto_focal_nome: pontoFocalNome || null,
      ponto_focal_descricao: pontoFocalDescricao || null,
      ponto_focal_observacoes: pontoFocalObservacoes || null,
      ponto_focal_principal: pontoFocalPrincipal,
      grupo_id: grupoSelecionado,
      regiao_id: regiaoSelecionada
    };
  }, [
    nomeFantasia, razaoSocial, tipoEstabelecimento, tipoInscricao, numeroInscricao,
    cno, cnaeDescricao, risco, cep, endereco, contato, telefone, email,
    nomeRepresentante, cpfRepresentante, observacao, observacaoOS, pontoFocalNome, pontoFocalDescricao, pontoFocalObservacoes, pontoFocalPrincipal,
    grupoSelecionado, regiaoSelecionada
  ]);

  // Função para limpar formulário
  const limparFormulario = useCallback((regioesAtivas: Regiao[], gruposAtivos: Grupo[]) => {
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
    setRegioesFiltradas(regioesAtivas);
    setGruposFiltradosPorRegiao(gruposAtivos);
    setCepError('');
    setCnaeDescricao('');
    setRisco('');
    setClassificacaoPorte('ME');
    setActiveTab('dados-empresa');
    setShowPontoFocal(false);
    setPontoFocalNome('');
    setPontoFocalDescricao('');
    setPontoFocalObservacoes('');
    setPontoFocalPrincipal(false);
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
  }, []);

  // Função para carregar dados de uma empresa (para edição)
  const carregarEmpresa = useCallback((empresa: Empresa, regioesAtivas: Regiao[], gruposAtivos: Grupo[]) => {
    setNomeFantasia(empresa.nome_fantasia);
    setRazaoSocial(empresa.razao_social);
    setTipoEstabelecimento(empresa.tipo_estabelecimento.toLowerCase());
    setTipoInscricao(empresa.tipo_inscricao || '');
    setNumeroInscricao(empresa.numero_inscricao || '');
    setCno(empresa.cno || '');
    setCnaeDescricao(empresa.cnae_descricao || '');
    setRisco(empresa.risco || '');
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
    setPontoFocalNome(empresa.ponto_focal_nome || '');
    setPontoFocalDescricao(empresa.ponto_focal_descricao || '');
    setPontoFocalObservacoes(empresa.ponto_focal_observacoes || '');
    setPontoFocalPrincipal(empresa.ponto_focal_principal || false);
    setShowPontoFocal(!!(empresa.ponto_focal_nome || empresa.ponto_focal_descricao || empresa.ponto_focal_observacoes));
    setGrupoSelecionado(empresa.grupo_id ? empresa.grupo_id.toString() : '');
    setRegiaoSelecionada(empresa.regiao_id ? empresa.regiao_id.toString() : '');
    
    // Configurar regiões e grupos filtrados
    if (empresa.grupo_id) {
      const regioesFiltradas = regioesAtivas.filter(regiao => 
        regiao.grupo_id === empresa.grupo_id
      );
      setRegioesFiltradas(regioesFiltradas);
    } else {
      setRegioesFiltradas(regioesAtivas);
    }
    
    if (empresa.regiao_id) {
      handleRegiaoChange(empresa.regiao_id.toString(), regioesAtivas, gruposAtivos);
    } else {
      setGruposFiltradosPorRegiao(gruposAtivos);
    }
  }, [handleRegiaoChange]);

  // Função para limpar erro de um campo específico
  const clearFieldError = useCallback((field: keyof FormErrors) => {
    setErrors(prev => ({ ...prev, [field]: '' }));
  }, []);

  // Função para inicializar os arrays filtrados
  const initializeForm = useCallback((regioesAtivas: Regiao[], gruposAtivos: Grupo[]) => {
    setRegioesFiltradas(regioesAtivas);
    setGruposFiltradosPorRegiao(gruposAtivos);
  }, []);

  return {
    // Estados
    activeTab,
    tipoEstabelecimento,
    classificacaoPorte,
    cep,
    endereco,
    loadingCep,
    cepError,
    contato,
    telefone,
    email,
    observacao,
    observacaoOS,
    nomeFantasia,
    razaoSocial,
    numeroInscricao,
    cpfRepresentante,
    nomeRepresentante,
    cno,
    tipoInscricao,
    grupoSelecionado,
    regiaoSelecionada,
    cnaeDescricao,
    risco,
    errors,
    regioesFiltradas,
    gruposFiltradosPorRegiao,
    showPontoFocal,
    pontoFocalNome,
    pontoFocalDescricao,
    pontoFocalObservacoes,
    pontoFocalPrincipal,

    // Setters
    setActiveTab,
    setTipoEstabelecimento,
    setClassificacaoPorte,
    setCep,
    setEndereco,
    setContato,
    setTelefone,
    setEmail,
    setObservacao,
    setObservacaoOS,
    setNomeFantasia,
    setRazaoSocial,
    setTipoInscricao,
    setCnaeDescricao,
    setRisco,
    setNomeRepresentante,
    setCpfRepresentante,
    setNumeroInscricao,
    setCno,
    setGrupoSelecionado,
    setRegiaoSelecionada,
    setRegioesFiltradas,
    setGruposFiltradosPorRegiao,
    setShowPontoFocal,
    setPontoFocalNome,
    setPontoFocalDescricao,
    setPontoFocalObservacoes,
    setPontoFocalPrincipal,

    // Handlers
    handleCepChange,
    handleNumeroInscricaoChange,
    handleCpfRepresentanteChange,
    handleTelefoneChange,
    handleNomeRepresentanteChange,
    handleContatoChange,
    handleCnoChange,
    handleGrupoChange,
    handleRegiaoChange,

    // Utilitários
    validateForm,
    getFormData,
    limparFormulario,
    carregarEmpresa,
    clearFieldError,
    initializeForm,

    // Validações inline
    isValidCPF: (cpf: string) => isValidCPF(cpf),
    isValidTelefone: (tel: string) => isValidTelefone(tel)
  };
}; 