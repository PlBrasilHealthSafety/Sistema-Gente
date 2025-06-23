// Utilitários para trabalhar com CNPJ
export interface EmpresaInfo {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  situacao: string;
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
  };
  email: string;
  telefone: string;
  cnae: {
    codigo: string;
    descricao: string;
  };
}

export async function buscarEmpresaPorCNPJ(cnpj: string): Promise<EmpresaInfo | null> {
  try {
    // Remove caracteres especiais do CNPJ
    const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
    
    // Valida se tem 14 dígitos
    if (cnpjLimpo.length !== 14) {
      throw new Error('CNPJ deve ter 14 dígitos');
    }

    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('CNPJ não encontrado');
      }
      throw new Error('Erro ao consultar CNPJ');
    }

    const data = await response.json();

    return {
      cnpj: data.cnpj,
      razaoSocial: data.razao_social || data.nome || '',
      nomeFantasia: data.nome_fantasia || data.razao_social || data.nome || '',
      situacao: data.situacao || '',
      endereco: {
        cep: data.cep || '',
        logradouro: data.logradouro || '',
        numero: data.numero || '',
        complemento: data.complemento || '',
        bairro: data.bairro || '',
        cidade: data.municipio || '',
        uf: data.uf || ''
      },
      email: data.email || '',
      telefone: data.telefone || '',
      cnae: {
        codigo: data.cnae_fiscal || '',
        descricao: data.descricao_situacao_cadastral || ''
      }
    };
  } catch (error) {
    console.error('Erro ao buscar CNPJ:', error);
    throw error;
  }
}

export function formatarCNPJ(cnpj: string): string {
  const cnpjLimpo = cnpj.replace(/[^\d]/g, '');
  
  if (cnpjLimpo.length <= 14) {
    return cnpjLimpo
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  
  return cnpj;
}

export function isValidCNPJ(cnpj: string): boolean {
  const cnpjLimpo = cnpj.replace(/[^\d]/g, '');

  if (cnpjLimpo.length !== 14) return false;

  // Elimina CNPJs invalidos conhecidos
  if (/^(\d)\1+$/.test(cnpjLimpo)) return false;

  // Valida DVs
  let tamanho = cnpjLimpo.length - 2;
  let numeros = cnpjLimpo.substring(0, tamanho);
  let digitos = cnpjLimpo.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;

  tamanho = tamanho + 1;
  numeros = cnpjLimpo.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  return resultado === parseInt(digitos.charAt(1));
}