import { useState, useCallback, useRef } from 'react';
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
import { buscarEmpresaPorCNPJ, formatarCNPJ, isValidCNPJ } from '@/utils/cnpjUtils';
import { PontoFocal } from '@/types/pontoFocal';

export const useFormularioEmpresa = () => {
  // Ref para controlar timeout do CNPJ
  const cnpjTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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
  const [cnaeCodigo, setCnaeCodigo] = useState<string>('');
  const [cnaeDescricao, setCnaeDescricao] = useState<string>('');
  const [risco, setRisco] = useState<string>('');
  
  // Estados para Ponto Focal (mantidos para compatibilidade)
  const [showPontoFocal, setShowPontoFocal] = useState(false);
  const [pontoFocalNome, setPontoFocalNome] = useState('');
  const [pontoFocalDescricao, setPontoFocalDescricao] = useState('');
  const [pontoFocalObservacoes, setPontoFocalObservacoes] = useState('');
  const [pontoFocalPrincipal, setPontoFocalPrincipal] = useState(false);
  
  // Estados para Múltiplos Pontos Focais
  const [pontosFocais, setPontosFocais] = useState<PontoFocal[]>([]);
  const [hasValidationErrors, setHasValidationErrors] = useState(false);
  
  // Estados para erros
  const [errors, setErrors] = useState<FormErrors>({
    nomeFantasia: '',
    razaoSocial: '',
    grupoSelecionado: '',
    regiaoSelecionada: '',
    cnaeCodigo: '',
    cnaeDescricao: '',
    risco: '',
    cep: '',
    numeroEndereco: '',
    tipoInscricao: '',
    numeroInscricao: '',
    cno: '',
    tipoLogradouro: '',
    logradouro: '',
    uf: '',
    cidade: '',
    bairro: '',
    telefone: '',
    email: ''
  });

  // Estados para grupos e regiões filtradas
  const [regioesFiltradas, setRegioesFiltradas] = useState<Regiao[]>([]);
  const [gruposFiltradosPorRegiao, setGruposFiltradosPorRegiao] = useState<Grupo[]>([]);

  // Estados para autocomplete CNPJ
  const [loadingCnpj, setLoadingCnpj] = useState(false);
  const [cnpjError, setCnpjError] = useState('');
  const [cnpjSuccess, setCnpjSuccess] = useState('');

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

  // Função para buscar dados da empresa por CNPJ
  const buscarDadosEmpresa = useCallback(async (cnpj: string) => {
    // Evitar múltiplas chamadas simultâneas
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
        setRazaoSocial(empresaInfo.razaoSocial);
        setNomeFantasia(empresaInfo.nomeFantasia);
        
        // Preencher endereço
        if (empresaInfo.endereco.cep) {
          setCep(formatCEP(empresaInfo.endereco.cep));
          setEndereco({
            logradouro: empresaInfo.endereco.logradouro,
            tipoLogradouro: empresaInfo.endereco.logradouro ? empresaInfo.endereco.logradouro.split(' ')[0] : '',
            numero: empresaInfo.endereco.numero,
            complemento: empresaInfo.endereco.complemento,
            bairro: empresaInfo.endereco.bairro,
            cidade: empresaInfo.endereco.cidade,
            uf: empresaInfo.endereco.uf
          });
        }
        
        // Preencher contatos
        if (empresaInfo.email) {
          setEmail(empresaInfo.email);
        }
        if (empresaInfo.telefone) {
          setTelefone(formatTelefone(empresaInfo.telefone));
        }
        
        // Preencher CNAE
        if (empresaInfo.cnae.codigo) {
          setCnaeCodigo(empresaInfo.cnae.codigo);
        }
        if (empresaInfo.cnae.descricao) {
          setCnaeDescricao(empresaInfo.cnae.descricao);
        }
        
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

  const handleNumeroInscricaoChange = useCallback((value: string) => {
    const formatted = formatarNumeroInscricao(value, tipoInscricao);
    setNumeroInscricao(formatted);
    
    // Limpar erro e sucesso anterior
    if (cnpjError) {
      setCnpjError('');
    }
    if (cnpjSuccess) {
      setCnpjSuccess('');
    }
    
    // Limpar timeout anterior se existir
    if (cnpjTimeoutRef.current) {
      clearTimeout(cnpjTimeoutRef.current);
      cnpjTimeoutRef.current = null;
    }
    
    // Se for CNPJ e estiver completo, buscar dados com debounce
    if (tipoInscricao === 'cnpj') {
      const cnpjLimpo = value.replace(/[^\d]/g, '');
      if (cnpjLimpo.length === 14 && isValidCNPJ(formatted)) {
        cnpjTimeoutRef.current = setTimeout(() => {
          buscarDadosEmpresa(cnpjLimpo);
        }, 800);
      }
    }
  }, [tipoInscricao, cnpjError, cnpjSuccess]);

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

  // Handler para CNAE código (apenas números, máximo 7 dígitos)
  const handleCnaeCodigoChange = useCallback((value: string) => {
    const onlyNumbers = (value || '').toString().replace(/\D/g, '');
    if (onlyNumbers.length <= 7) {
      setCnaeCodigo(onlyNumbers);
    }
  }, []);

  // Validação para CNAE de 7 dígitos
  const isValidCNAE = useCallback((cnae: string): boolean => {
    return /^\d{7}$/.test(cnae);
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
      cnaeCodigo,
      cnaeDescricao,
      risco,
      cep,
      numeroEndereco: endereco.numero,
      tipoInscricao,
      numeroInscricao,
      cno,
      tipoLogradouro: endereco.tipoLogradouro,
      logradouro: endereco.logradouro,
      uf: endereco.uf,
      cidade: endereco.cidade,
      bairro: endereco.bairro,
      telefone,
      email
    };

    const newErrors = validateEmpresaForm(formData);
    setErrors(newErrors);
    return !hasFormErrors(newErrors);
  }, [nomeFantasia, razaoSocial, grupoSelecionado, regiaoSelecionada, cnaeCodigo, cnaeDescricao, risco, cep, endereco, tipoInscricao, numeroInscricao, cno, telefone, email]);

  // Função para mapear pontos focais para backend
  const mapearPontosFocaisParaBackend = useCallback((pontosFocais: PontoFocal[]) => {
    return pontosFocais.map((pf, index) => ({
      nome: pf.nome,
      cargo: pf.cargo || '',
      descricao: pf.descricao || '',
      observacoes: pf.observacoes || '',
      telefone: pf.telefone || '',
      email: pf.email || '',
      is_principal: pf.isPrincipal,
      ordem: index + 1
    }));
  }, []);

  // Função para obter dados do formulário
  const getFormData = useCallback(() => {
    // Validar e converter grupo_id e regiao_id corretamente
    const grupoId = grupoSelecionado ? parseInt(grupoSelecionado) : null;
    const regiaoId = regiaoSelecionada ? parseInt(regiaoSelecionada) : null;
    
    // Verificar se a conversão foi bem-sucedida
    if (!grupoId || isNaN(grupoId)) {
      throw new Error('Grupo é obrigatório e deve ser válido');
    }
    
    if (!regiaoId || isNaN(regiaoId)) {
      throw new Error('Região é obrigatória e deve ser válida');
    }
    
    const baseData = {
      nome_fantasia: nomeFantasia.trim(),
      razao_social: razaoSocial.trim(),
      tipo_estabelecimento: tipoEstabelecimento.toUpperCase() as 'MATRIZ' | 'FILIAL',
      tipo_inscricao: tipoInscricao || undefined,
      numero_inscricao: numeroInscricao.trim() || undefined,
      cno: cno.trim() || undefined,
      cnae_codigo: cnaeCodigo.trim() || undefined,
      cnae_descricao: cnaeDescricao.trim() || undefined,
      risco: risco || undefined,
      endereco_cep: cep.replace(/\D/g, '') || undefined,
      endereco_tipo_logradouro: endereco.tipoLogradouro || undefined,
      endereco_logradouro: endereco.logradouro.trim() || undefined,
      endereco_numero: endereco.numero.trim() || undefined,
      endereco_complemento: endereco.complemento.trim() || undefined,
      endereco_bairro: endereco.bairro.trim() || undefined,
      endereco_cidade: endereco.cidade.trim() || undefined,
      endereco_uf: endereco.uf || undefined,
      contato_nome: contato.trim() || undefined,
      contato_telefone: telefone.trim() || undefined,
      contato_email: email.trim() || undefined,
      representante_legal_nome: nomeRepresentante.trim() || undefined,
      representante_legal_cpf: cpfRepresentante.replace(/\D/g, '') || undefined,
      observacoes: observacao.trim() || undefined,
      observacoes_os: observacaoOS.trim() || undefined,
      ponto_focal_nome: pontoFocalNome.trim() || undefined,
      ponto_focal_descricao: pontoFocalDescricao.trim() || undefined,
      ponto_focal_observacoes: pontoFocalObservacoes.trim() || undefined,
      ponto_focal_principal: pontoFocalPrincipal,
      grupo_id: grupoId,
      regiao_id: regiaoId
    };

    // Adicionar pontos focais se existirem
    if (pontosFocais.length > 0) {
      return {
        ...baseData,
        pontos_focais: mapearPontosFocaisParaBackend(pontosFocais)
      };
    }

    return baseData;
  }, [
    nomeFantasia, razaoSocial, tipoEstabelecimento, tipoInscricao, numeroInscricao,
    cno, cnaeCodigo, cnaeDescricao, risco, cep, endereco, contato, telefone, email,
    nomeRepresentante, cpfRepresentante, observacao, observacaoOS, pontoFocalNome, pontoFocalDescricao, pontoFocalObservacoes, pontoFocalPrincipal,
    grupoSelecionado, regiaoSelecionada, pontosFocais, mapearPontosFocaisParaBackend
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
    setCnpjError('');
    setCnpjSuccess('');
    setCnaeCodigo('');
    setCnaeDescricao('');
    setRisco('');
    setClassificacaoPorte('ME');
    setActiveTab('dados-empresa');
    setShowPontoFocal(false);
    setPontoFocalNome('');
    setPontoFocalDescricao('');
    setPontoFocalObservacoes('');
    setPontoFocalPrincipal(false);
    setPontosFocais([]);
    setHasValidationErrors(false);
    setErrors({
      nomeFantasia: '',
      razaoSocial: '',
      grupoSelecionado: '',
      regiaoSelecionada: '',
      cnaeCodigo: '',
      cnaeDescricao: '',
      risco: '',
      cep: '',
      numeroEndereco: '',
      tipoInscricao: '',
      numeroInscricao: '',
      cno: '',
      tipoLogradouro: '',
      logradouro: '',
      uf: '',
      cidade: '',
      bairro: '',
      telefone: '',
      email: ''
    });
  }, []);

  // Função para carregar pontos focais de uma empresa
  const carregarPontosFocaisEmpresa = useCallback((empresa: Empresa): PontoFocal[] => {
    const pontosFocaisExistentes: PontoFocal[] = [];

    // Se há múltiplos pontos focais, usar eles
    if (empresa.pontos_focais && empresa.pontos_focais.length > 0) {
      empresa.pontos_focais.forEach(pf => {
        pontosFocaisExistentes.push({
          id: pf.id ? pf.id.toString() : `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
    // Caso contrário, verificar se há ponto focal legado
    else if (empresa.ponto_focal_nome || empresa.ponto_focal_descricao || empresa.ponto_focal_observacoes) {
      pontosFocaisExistentes.push({
        id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        nome: empresa.ponto_focal_nome || '',
        cargo: '',
        descricao: empresa.ponto_focal_descricao || '',
        observacoes: empresa.ponto_focal_observacoes || '',
        telefone: '',
        email: '',
        isPrincipal: empresa.ponto_focal_principal || true
      });
    }

    return pontosFocaisExistentes;
  }, []);

  // Função para carregar dados de uma empresa (para edição)
  const carregarEmpresa = useCallback((empresa: Empresa, regioesAtivas: Regiao[], gruposAtivos: Grupo[]) => {
    setNomeFantasia(empresa.nome_fantasia);
    setRazaoSocial(empresa.razao_social);
    setTipoEstabelecimento(empresa.tipo_estabelecimento.toLowerCase());
    setTipoInscricao(empresa.tipo_inscricao || '');
    setNumeroInscricao(empresa.numero_inscricao || '');
    setCno(empresa.cno || '');
    setCnaeCodigo((empresa.cnae_codigo || '').toString());
    setCnaeDescricao((empresa.cnae_descricao || '').toString());
    setRisco((empresa.risco || '').toString());
    setCep(empresa.endereco_cep || '');
    // Verificar se há tipo de logradouro salvo no banco
    let tipoLogradouro = (empresa as any).endereco_tipo_logradouro || '';
    let logradouro = empresa.endereco_logradouro || '';
    
    // Se não há tipo de logradouro no banco, tentar extrair do campo logradouro
    if (!tipoLogradouro && logradouro) {
      const tiposLogradouro = ['Rua', 'Avenida', 'Travessa', 'Alameda', 'Praça', 'Estrada'];
      for (const tipo of tiposLogradouro) {
        if (logradouro.toLowerCase().startsWith(tipo.toLowerCase())) {
          tipoLogradouro = tipo;
          logradouro = logradouro.substring(tipo.length).trim();
          break;
        }
      }
    }
    
    // Se ainda não tem tipo, usar "Rua" como padrão
    if (!tipoLogradouro) {
      tipoLogradouro = 'Rua';
    }
    
    setEndereco({
      logradouro: logradouro,
      tipoLogradouro: tipoLogradouro,
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
    
    // Carregar pontos focais
    const pontosFocaisExistentes = carregarPontosFocaisEmpresa(empresa);
    setPontosFocais(pontosFocaisExistentes);
    
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
  }, [handleRegiaoChange, carregarPontosFocaisEmpresa]);

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
    loadingCnpj,
    cnpjError,
    cnpjSuccess,
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
    cnaeCodigo,
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
    pontosFocais,
    hasValidationErrors,

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
    setCnaeCodigo,
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
    setPontosFocais,
    setHasValidationErrors,

    // Handlers
    handleCepChange,
    handleNumeroInscricaoChange,
    handleCpfRepresentanteChange,
    handleTelefoneChange,
    handleNomeRepresentanteChange,
    handleContatoChange,
    handleCnoChange,
    handleCnaeCodigoChange,
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
    isValidTelefone: (tel: string) => isValidTelefone(tel),
    isValidCNAE
  };
}; 