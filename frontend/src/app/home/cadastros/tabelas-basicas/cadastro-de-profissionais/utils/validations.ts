import { FormErrors } from '../types/profissional.types';
import { isValidCPF, isValidEmail, isValidDDD, isValidNIS, isValidTelefone, isValidCelular } from './formatters';
import { isValidCEP } from '@/utils/masks';

export const validateProfissionalForm = (formData: {
  nomeProfissional: string;
  nacionalidade: string;
  cpf: string;
  nis?: string;
  categoria: string;
  siglaConselho: string;
  regConselho: string;
  ufConselho: string;
  cep: string;
  tipoLogradouro: string;
  logradouro: string;
  numero: string;
  ufEndereco: string;
  cidade: string;
  bairro: string;
  email: string;
  telefone?: string;
  ddd: string;
  celular: string;
}): FormErrors => {
  const errors: FormErrors = {
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
  };

  // Validar nome do profissional
  if (!formData.nomeProfissional.trim()) {
    errors.nomeProfissional = 'Nome é obrigatório';
  }

  // Validar nacionalidade
  if (!formData.nacionalidade.trim()) {
    errors.nacionalidade = 'Nacionalidade é obrigatória';
  }

  // Validar CPF
  if (!formData.cpf.trim()) {
    errors.cpf = 'CPF é obrigatório';
  } else if (!isValidCPF(formData.cpf)) {
    errors.cpf = 'CPF deve ter um formato válido';
  }

  // Validar NIS (opcional, mas se preenchido deve ter 11 dígitos)
  if (formData.nis && formData.nis.trim() && !isValidNIS(formData.nis)) {
    errors.nis = 'NIS deve ter exatamente 11 dígitos';
  }

  // Validar categoria
  if (!formData.categoria.trim()) {
    errors.categoria = 'Categoria é obrigatória';
  }

  // Validar sigla do conselho
  if (!formData.siglaConselho.trim()) {
    errors.siglaConselho = 'Sigla do conselho é obrigatória';
  }

  // Validar registro do conselho
  if (!formData.regConselho.trim()) {
    errors.regConselho = 'Registro do conselho é obrigatório';
  }

  // Validar UF do conselho
  if (!formData.ufConselho.trim()) {
    errors.ufConselho = 'UF do conselho é obrigatória';
  }

  // Validar CEP
  if (!formData.cep.trim()) {
    errors.cep = 'CEP é obrigatório';
  } else if (!isValidCEP(formData.cep)) {
    errors.cep = 'CEP deve ter 8 dígitos';
  }

  // Validar tipo de logradouro
  if (!formData.tipoLogradouro.trim()) {
    errors.tipoLogradouro = 'Tipo de logradouro é obrigatório';
  }

  // Validar logradouro
  if (!formData.logradouro.trim()) {
    errors.logradouro = 'Logradouro é obrigatório';
  }

  // Validar número
  if (!formData.numero.trim()) {
    errors.numero = 'Número é obrigatório';
  }

  // Validar UF do endereço
  if (!formData.ufEndereco.trim()) {
    errors.ufEndereco = 'UF é obrigatória';
  }

  // Validar cidade
  if (!formData.cidade.trim()) {
    errors.cidade = 'Cidade é obrigatória';
  }

  // Validar bairro
  if (!formData.bairro.trim()) {
    errors.bairro = 'Bairro é obrigatório';
  }

  // Validar e-mail
  if (!formData.email.trim()) {
    errors.email = 'E-mail é obrigatório';
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'E-mail deve ter um formato válido';
  }

  // Validar telefone (opcional, mas se preenchido deve ter formato correto)
  if (formData.telefone && formData.telefone.trim() && !isValidTelefone(formData.telefone)) {
    errors.telefone = 'Telefone deve ter o formato (00) 0000-0000';
  }

  // Validar DDD
  if (!formData.ddd.trim()) {
    errors.ddd = 'DDD é obrigatório';
  } else if (!isValidDDD(formData.ddd)) {
    errors.ddd = 'DDD deve ter 2 dígitos';
  }

  // Validar celular
  if (!formData.celular.trim()) {
    errors.celular = 'Celular é obrigatório';
  } else if (!isValidCelular(formData.celular)) {
    errors.celular = 'Celular deve ter o formato (00) 90000-0000';
  }

  return errors;
};

export const hasFormErrors = (errors: FormErrors): boolean => {
  return Object.values(errors).some(error => error.trim() !== '');
}; 