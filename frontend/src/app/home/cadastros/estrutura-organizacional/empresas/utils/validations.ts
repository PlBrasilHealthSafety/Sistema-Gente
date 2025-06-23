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
    cno: ''
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

  return errors;
};

export const hasFormErrors = (errors: FormErrors): boolean => {
  return Object.values(errors).some(error => error !== '');
}; 