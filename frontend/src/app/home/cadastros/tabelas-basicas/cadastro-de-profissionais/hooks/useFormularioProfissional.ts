import { useState } from 'react';
import { Profissional, Endereco, FormErrors, ProfissionalFormData } from '../types/profissional.types';
import { formatCPF, formatTelefone, formatDDD } from '../utils/formatters';
import { validateProfissionalForm, hasFormErrors } from '../utils/validations';
import { formatCEP, isValidCEP } from '@/utils/masks';

interface FormDataCompatibility {
  nome: string;
  cpf: string;
  rg: string;
  dataNascimento: string;
  nis: string;
  categoria: string;
  siglaConselho: string;
  numeroConselho: string;
  telefone: string;
  celular: string;
  email: string;
  observacoes: string;
  externo: boolean;
  ofensor: string;
  clinica: string;
}

export const useFormularioProfissional = () => {
  // Estados do formulário de dados cadastrais
  const [nomeProfissional, setNomeProfissional] = useState('');
  const [nacionalidade, setNacionalidade] = useState('');
  const [cpf, setCpf] = useState('');
  const [nis, setNis] = useState('');
  const [categoria, setCategoria] = useState('');
  const [siglaConselho, setSiglaConselho] = useState('');
  const [regConselho, setRegConselho] = useState('');
  const [ufConselho, setUfConselho] = useState('');
  const [regMte, setRegMte] = useState('');

  // Estados do endereço
  const [cep, setCep] = useState('');
  const [endereco, setEndereco] = useState<Endereco>({
    cep: '',
    tipoLogradouro: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: ''
  });
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState('');

  // Estados de contato
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [ddd, setDdd] = useState('');
  const [celular, setCelular] = useState('');

  // Estados de informações adicionais
  const [observacao, setObservacao] = useState('');
  const [agendamentoHorario, setAgendamentoHorario] = useState(false);
  const [profissionalExterno, setProfissionalExterno] = useState(false);
  const [assinaturaDigital, setAssinaturaDigital] = useState('');
  const [certificadoDigital, setCertificadoDigital] = useState('');
  const [situacao, setSituacao] = useState('ativo');

  // Estados de validação
  const [errors, setErrors] = useState<FormErrors>({
    nomeProfissional: '',
    nacionalidade: '',
    cpf: '',
    categoria: '',
    siglaConselho: '',
    regConselho: '',
    ufConselho: '',
    cep: '',
    tipoLogradouro: '',
    logradouro: '',
    numero: '',
    ufEndereco: '',
    cidade: '',
    bairro: '',
    email: '',
    ddd: '',
    celular: ''
  });

  // Estados adicionais para compatibilidade
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rg, setRg] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [numeroConselho, setNumeroConselho] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [externo, setExterno] = useState(false);
  const [ofensor, setOfensor] = useState('');
  const [clinica, setClinica] = useState('');

  // Objeto formData para compatibilidade
  const formData: FormDataCompatibility = {
    nome: nomeProfissional,
    cpf,
    rg,
    dataNascimento,
    nis,
    categoria,
    siglaConselho,
    numeroConselho,
    telefone,
    celular,
    email,
    observacoes,
    externo,
    ofensor,
    clinica
  };

  // Objeto erros para compatibilidade
  const erros = {
    nome: errors.nomeProfissional,
    cpf: errors.cpf,
    nis: errors.cpf, // Assumindo que nis usa validação similar
    categoria: errors.categoria,
    telefone: errors.celular, // Assumindo que telefone usa validação similar
    celular: errors.celular
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
  };

  // Handlers
  const handleCepChange = (value: string) => {
    const formattedCep = formatCEP(value);
    setCep(formattedCep);
    setEndereco(prev => ({ ...prev, cep: formattedCep }));
    
    if (cepError) {
      setCepError('');
    }
    
    const numbers = value.replace(/\D/g, '');
    if (numbers.length === 8) {
      buscarCep(numbers);
    }
  };

  const handleCpfChange = (value: string) => {
    const formattedCPF = formatCPF(value);
    setCpf(formattedCPF);
  };

  const handleTelefoneChange = (value: string) => {
    const formattedTelefone = formatTelefone(value);
    setTelefone(formattedTelefone);
  };

  const handleCelularChange = (value: string) => {
    const formattedCelular = formatTelefone(value);
    setCelular(formattedCelular);
  };

  const handleDddChange = (value: string) => {
    const formattedDDD = formatDDD(value);
    setDdd(formattedDDD);
  };

  // Validação do formulário
  const validateForm = (): boolean => {
    const formDataValidation = {
      nomeProfissional,
      nacionalidade,
      cpf,
      categoria,
      siglaConselho,
      regConselho,
      ufConselho,
      cep,
      tipoLogradouro: endereco.tipoLogradouro,
      logradouro: endereco.logradouro,
      numero: endereco.numero,
      ufEndereco: endereco.uf,
      cidade: endereco.cidade,
      bairro: endereco.bairro,
      email,
      ddd,
      celular
    };

    const newErrors = validateProfissionalForm(formDataValidation);
    setErrors(newErrors);
    return !hasFormErrors(newErrors);
  };

  // Validar formulário (compatibilidade)
  const validarFormulario = (): boolean => {
    return validateForm();
  };

  // Limpar formulário
  const limparFormulario = () => {
    // Dados cadastrais
    setNomeProfissional('');
    setNacionalidade('');
    setCpf('');
    setNis('');
    setCategoria('');
    setSiglaConselho('');
    setRegConselho('');
    setUfConselho('');
    setRegMte('');
    
    // Endereço
    setCep('');
    setEndereco({
      cep: '',
      tipoLogradouro: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: ''
    });
    
    // Contato
    setEmail('');
    setTelefone('');
    setDdd('');
    setCelular('');
    
    // Informações adicionais
    setObservacao('');
    setAgendamentoHorario(false);
    setProfissionalExterno(false);
    setAssinaturaDigital('');
    setCertificadoDigital('');
    setSituacao('ativo');
    
    // Compatibilidade
    setRg('');
    setDataNascimento('');
    setNumeroConselho('');
    setObservacoes('');
    setExterno(false);
    setOfensor('');
    setClinica('');
    
    // Limpar erros
    setErrors({
      nomeProfissional: '',
      nacionalidade: '',
      cpf: '',
      categoria: '',
      siglaConselho: '',
      regConselho: '',
      ufConselho: '',
      cep: '',
      tipoLogradouro: '',
      logradouro: '',
      numero: '',
      ufEndereco: '',
      cidade: '',
      bairro: '',
      email: '',
      ddd: '',
      celular: ''
    });
  };

  // Reset form (compatibilidade)
  const resetForm = () => {
    limparFormulario();
  };

  // Limpar erros (compatibilidade)
  const limparErros = () => {
    setErrors({
      nomeProfissional: '',
      nacionalidade: '',
      cpf: '',
      categoria: '',
      siglaConselho: '',
      regConselho: '',
      ufConselho: '',
      cep: '',
      tipoLogradouro: '',
      logradouro: '',
      numero: '',
      ufEndereco: '',
      cidade: '',
      bairro: '',
      email: '',
      ddd: '',
      celular: ''
    });
  };

  // Função para definir formData
  const setFormData = (newFormData: Partial<FormDataCompatibility>) => {
    if (newFormData.nome !== undefined) setNomeProfissional(newFormData.nome);
    if (newFormData.cpf !== undefined) setCpf(newFormData.cpf);
    if (newFormData.rg !== undefined) setRg(newFormData.rg);
    if (newFormData.dataNascimento !== undefined) setDataNascimento(newFormData.dataNascimento);
    if (newFormData.nis !== undefined) setNis(newFormData.nis);
    if (newFormData.categoria !== undefined) setCategoria(newFormData.categoria);
    if (newFormData.siglaConselho !== undefined) setSiglaConselho(newFormData.siglaConselho);
    if (newFormData.numeroConselho !== undefined) setNumeroConselho(newFormData.numeroConselho);
    if (newFormData.telefone !== undefined) setTelefone(newFormData.telefone);
    if (newFormData.celular !== undefined) setCelular(newFormData.celular);
    if (newFormData.email !== undefined) setEmail(newFormData.email);
    if (newFormData.observacoes !== undefined) setObservacoes(newFormData.observacoes);
    if (newFormData.externo !== undefined) setExterno(newFormData.externo);
    if (newFormData.ofensor !== undefined) setOfensor(newFormData.ofensor);
    if (newFormData.clinica !== undefined) setClinica(newFormData.clinica);
  };

  // Carregar dados de um profissional para edição
  const carregarProfissional = (profissional: Profissional) => {
    setNomeProfissional(profissional.nome || '');
    setNacionalidade(profissional.nacionalidade || '');
    setCpf(profissional.cpf || '');
    setNis(profissional.nis || '');
    setCategoria(profissional.categoria || '');
    setSiglaConselho(profissional.sigla_conselho || '');
    setRegConselho(profissional.reg_conselho || '');
    setUfConselho(profissional.uf_conselho || '');
    setRegMte(profissional.reg_mte || '');
    
    // Endereço
    setCep(profissional.cep || '');
    setEndereco({
      cep: profissional.cep || '',
      tipoLogradouro: profissional.tipo_logradouro || '',
      logradouro: profissional.logradouro || '',
      numero: profissional.numero || '',
      complemento: profissional.complemento || '',
      bairro: profissional.bairro || '',
      cidade: profissional.cidade || '',
      uf: profissional.uf_endereco || ''
    });
    
    // Contato
    setEmail(profissional.email || '');
    setTelefone(profissional.telefone || '');
    setDdd(profissional.ddd || '');
    setCelular(profissional.celular || '');
    
    // Informações adicionais
    setObservacao(profissional.observacao || '');
    setAgendamentoHorario(profissional.agendamento_horario || false);
    setProfissionalExterno(profissional.profissional_externo || false);
    setAssinaturaDigital(profissional.assinatura_digital || '');
    setCertificadoDigital(profissional.certificado_digital || '');
    setSituacao((profissional.situacao || profissional.status) === 'ativo' ? 'ativo' : 'inativo');
  };

  // Obter dados do formulário para envio
  const getFormData = (): ProfissionalFormData => {
    return {
      nome: nomeProfissional,
      nacionalidade,
      cpf,
      nis,
      categoria,
      sigla_conselho: siglaConselho,
      reg_conselho: regConselho,
      uf_conselho: ufConselho,
      reg_mte: regMte,
      
      // Endereço
      cep,
      tipo_logradouro: endereco.tipoLogradouro,
      logradouro: endereco.logradouro,
      numero: endereco.numero,
      complemento: endereco.complemento,
      uf_endereco: endereco.uf,
      cidade: endereco.cidade,
      bairro: endereco.bairro,
      
      // Contato
      email,
      telefone,
      ddd,
      celular,
      
      // Informações adicionais
      observacao,
      agendamento_horario: agendamentoHorario,
      profissional_externo: profissionalExterno,
      assinatura_digital: assinaturaDigital,
      certificado_digital: certificadoDigital,
      status: situacao as 'ativo' | 'inativo'
    };
  };

  return {
    // Propriedades de compatibilidade
    formData,
    erros,
    isSubmitting,
    resetForm,
    setFormData,
    validarFormulario,
    limparErros,

    // Estados do formulário
    nomeProfissional,
    nacionalidade,
    cpf,
    nis,
    categoria,
    siglaConselho,
    regConselho,
    ufConselho,
    regMte,
    cep,
    endereco,
    loadingCep,
    cepError,
    email,
    telefone,
    ddd,
    celular,
    observacao,
    agendamentoHorario,
    profissionalExterno,
    assinaturaDigital,
    certificadoDigital,
    situacao,
    errors,
    setErrors,

    // Estados adicionais
    rg,
    dataNascimento,
    numeroConselho,
    observacoes,
    externo,
    ofensor,
    clinica,

    // Setters
    setNomeProfissional,
    setNacionalidade,
    setCpf,
    setNis,
    setCategoria,
    setSiglaConselho,
    setRegConselho,
    setUfConselho,
    setRegMte,
    setCep,
    setEndereco,
    setEmail,
    setTelefone,
    setDdd,
    setCelular,
    setObservacao,
    setAgendamentoHorario,
    setProfissionalExterno,
    setAssinaturaDigital,
    setCertificadoDigital,
    setSituacao,
    setIsSubmitting,
    
    // Setters adicionais para compatibilidade
    setNumeroConselho,
    setExterno,
    setOfensor,
    setClinica,

    // Handlers
    handleCepChange,
    handleCpfChange,
    handleTelefoneChange,
    handleCelularChange,
    handleDddChange,

    // Funções utilitárias
    validateForm,
    limparFormulario,
    carregarProfissional,
    getFormData
  };
}; 