import { FormErrors } from '../types/empresa.types';

export const validateEmpresaForm = (formData: {
  nomeFantasia: string;
  razaoSocial: string;
  grupoSelecionado: string;
  regiaoSelecionada: string;
  cnaeDescricao: string;
  risco: string;
  cep: string;
  numeroEndereco: string;
  tipoInscricao: string;
  numeroInscricao: string;
  cno: string;
  tipoLogradouro: string;
  logradouro: string;
  uf: string;
  cidade: string;
  bairro: string;
  telefone: string;
  email: string;
}): FormErrors => {
  const errors: FormErrors = {
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
    cno: '',
    tipoLogradouro: '',
    logradouro: '',
    uf: '',
    cidade: '',
    bairro: '',
    telefone: '',
    email: ''
  };

  if (!formData.nomeFantasia.trim()) {
    errors.nomeFantasia = 'Nome fantasia é obrigatório';
  }

  if (!formData.razaoSocial.trim()) {
    errors.razaoSocial = 'Razão social é obrigatória';
  }

  if (!formData.grupoSelecionado) {
    errors.grupoSelecionado = 'Grupo é obrigatório';
  }

  if (!formData.regiaoSelecionada) {
    errors.regiaoSelecionada = 'Região é obrigatória';
  }

  if (!formData.cnaeDescricao.trim()) {
    errors.cnaeDescricao = 'CNAE e descrição é obrigatório';
  }

  if (!formData.risco.trim()) {
    errors.risco = 'Risco é obrigatório';
  }

  if (!formData.cep.trim()) {
    errors.cep = 'CEP é obrigatório';
  }

  if (!formData.numeroEndereco.trim()) {
    errors.numeroEndereco = 'Número é obrigatório';
  }

  if (!formData.tipoInscricao) {
    errors.tipoInscricao = 'Tipo de inscrição é obrigatório';
  }

  if (!formData.numeroInscricao.trim()) {
    errors.numeroInscricao = 'Número de inscrição é obrigatório';
  }

  if (!formData.tipoLogradouro) {
    errors.tipoLogradouro = 'Tipo de logradouro é obrigatório';
  }

  if (!formData.logradouro.trim()) {
    errors.logradouro = 'Logradouro é obrigatório';
  }

  if (!formData.uf) {
    errors.uf = 'UF é obrigatório';
  }

  if (!formData.cidade.trim()) {
    errors.cidade = 'Cidade é obrigatória';
  }

  if (!formData.bairro.trim()) {
    errors.bairro = 'Bairro é obrigatório';
  }

  if (!formData.telefone.trim()) {
    errors.telefone = 'Telefone é obrigatório';
  }

  if (!formData.email.trim()) {
    errors.email = 'E-mail é obrigatório';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = 'E-mail deve ter um formato válido';
  }

  return errors;
};

export const hasFormErrors = (errors: FormErrors): boolean => {
  return Object.values(errors).some(error => error !== '');
}; 