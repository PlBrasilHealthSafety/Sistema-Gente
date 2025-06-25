import { useState } from 'react';
import { Profissional, Endereco, FormErrors, ProfissionalFormData } from '../types/profissional.types';
import { formatCPF, formatTelefone, formatDDD } from '../utils/formatters';
import { validateProfissionalForm, hasFormErrors } from '../utils/validations';
import { formatCEP, isValidCEP } from '@/utils/masks';

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
  const [situacao, setSituacao] = useState('Ativo');

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
    const formData = {
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

    const newErrors = validateProfissionalForm(formData);
    setErrors(newErrors);
    return !hasFormErrors(newErrors);
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
    setSituacao('Ativo');
    
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
    setSituacao(profissional.situacao === 'ativo' ? 'Ativo' : 'Inativo');
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
      situacao: situacao.toLowerCase() as 'ativo' | 'inativo'
    };
  };

  return {
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
    setErrors,

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