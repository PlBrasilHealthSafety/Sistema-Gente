import { FormErrors } from '../types/empresa.types';

export const validateEmpresaForm = (formData: {
  nomeFantasia: string;
  razaoSocial: string;
  grupoSelecionado: string;
  regiaoSelecionada: string;
  cnaeCodigo: string;
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
  };

  // Garantir que todos os campos sejam strings
  const nomeFantasia = (formData.nomeFantasia || '').toString();
  const razaoSocial = (formData.razaoSocial || '').toString();
  const grupoSelecionado = (formData.grupoSelecionado || '').toString();
  const regiaoSelecionada = (formData.regiaoSelecionada || '').toString();
  const cnaeCodigo = (formData.cnaeCodigo || '').toString();
  const cnaeDescricao = (formData.cnaeDescricao || '').toString();
  const risco = (formData.risco || '').toString();
  const cep = (formData.cep || '').toString();
  const numeroEndereco = (formData.numeroEndereco || '').toString();
  const tipoInscricao = (formData.tipoInscricao || '').toString();
  const numeroInscricao = (formData.numeroInscricao || '').toString();
  const cno = (formData.cno || '').toString();
  const tipoLogradouro = (formData.tipoLogradouro || '').toString();
  const logradouro = (formData.logradouro || '').toString();
  const uf = (formData.uf || '').toString();
  const cidade = (formData.cidade || '').toString();
  const bairro = (formData.bairro || '').toString();
  const telefone = (formData.telefone || '').toString();
  const email = (formData.email || '').toString();

  if (!nomeFantasia || !nomeFantasia.trim()) {
    errors.nomeFantasia = 'Nome fantasia é obrigatório';
  }

  if (!razaoSocial || !razaoSocial.trim()) {
    errors.razaoSocial = 'Razão social é obrigatória';
  }

  if (!grupoSelecionado) {
    errors.grupoSelecionado = 'Grupo é obrigatório';
  }

  if (!regiaoSelecionada) {
    errors.regiaoSelecionada = 'Região é obrigatória';
  }

  if (!cnaeCodigo || !cnaeCodigo.trim()) {
    errors.cnaeCodigo = 'CNAE é obrigatório';
  } else if (!/^\d{7}$/.test(cnaeCodigo)) {
    errors.cnaeCodigo = 'CNAE deve ter exatamente 7 dígitos';
  }

  if (!cnaeDescricao || !cnaeDescricao.trim()) {
    errors.cnaeDescricao = 'Descrição da atividade é obrigatória';
  }

  if (!risco || !risco.trim()) {
    errors.risco = 'Risco é obrigatório';
  }

  if (!cep || !cep.trim()) {
    errors.cep = 'CEP é obrigatório';
  }

  if (!numeroEndereco || !numeroEndereco.trim()) {
    errors.numeroEndereco = 'Número é obrigatório';
  }

  if (!tipoInscricao) {
    errors.tipoInscricao = 'Tipo de inscrição é obrigatório';
  }

  if (!numeroInscricao || !numeroInscricao.trim()) {
    errors.numeroInscricao = 'Número de inscrição é obrigatório';
  }

  if (!tipoLogradouro) {
    errors.tipoLogradouro = 'Tipo de logradouro é obrigatório';
  }

  if (!logradouro || !logradouro.trim()) {
    errors.logradouro = 'Logradouro é obrigatório';
  }

  if (!uf) {
    errors.uf = 'UF é obrigatório';
  }

  if (!cidade || !cidade.trim()) {
    errors.cidade = 'Cidade é obrigatória';
  }

  if (!bairro || !bairro.trim()) {
    errors.bairro = 'Bairro é obrigatório';
  }

  // Telefone e email não são mais obrigatórios - foram movidos para ponto focal
  // Validação apenas se preenchidos
  if (email && email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'E-mail deve ter um formato válido';
  }

  return errors;
};

export const hasFormErrors = (errors: FormErrors): boolean => {
  return Object.values(errors).some(error => error !== '');
}; 