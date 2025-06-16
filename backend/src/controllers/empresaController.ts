import { Request, Response } from 'express';
import { EmpresaModel } from '../models/Empresa';
import { GrupoModel } from '../models/Grupo';
import { RegiaoModel } from '../models/Regiao';
import { CreateEmpresaData, UpdateEmpresaData, StatusItem } from '../types/organizacional';

// Função auxiliar para validar CNPJ
const isValidCNPJ = (cnpj: string): boolean => {
  // Remove caracteres não numéricos
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
  
  // Verifica se tem 14 dígitos
  if (cleanCNPJ.length !== 14) return false;
  
  // Verifica se não são todos iguais
  if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
  
  // Validação dos dígitos verificadores
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ[i]) * weights1[i];
  }
  
  let firstDigit = 11 - (sum % 11);
  if (firstDigit >= 10) firstDigit = 0;
  
  if (parseInt(cleanCNPJ[12]) !== firstDigit) return false;
  
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ[i]) * weights2[i];
  }
  
  let secondDigit = 11 - (sum % 11);
  if (secondDigit >= 10) secondDigit = 0;
  
  return parseInt(cleanCNPJ[13]) === secondDigit;
};

// Função auxiliar para validar CPF
const isValidCPF = (cpf: string): boolean => {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se não são todos iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validação dos dígitos verificadores
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF[i]) * (10 - i);
  }
  
  let firstDigit = 11 - (sum % 11);
  if (firstDigit >= 10) firstDigit = 0;
  
  if (parseInt(cleanCPF[9]) !== firstDigit) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF[i]) * (11 - i);
  }
  
  let secondDigit = 11 - (sum % 11);
  if (secondDigit >= 10) secondDigit = 0;
  
  return parseInt(cleanCPF[10]) === secondDigit;
};

// Função para formatar CNPJ
const formatCNPJ = (cnpj: string): string => {
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
  return cleanCNPJ.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
};

// Função para formatar CPF
const formatCPF = (cpf: string): string => {
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  return cleanCPF.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
};

// Listar todas as empresas
export const getAllEmpresas = async (req: Request, res: Response) => {
  try {
    const empresas = await EmpresaModel.findAllWithRelations();
    
    res.json({
      success: true,
      data: empresas,
      message: 'Empresas listadas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao listar empresas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao listar empresas',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Listar empresas ativas
export const getActiveEmpresas = async (req: Request, res: Response) => {
  try {
    const empresas = await EmpresaModel.findActive();
    
    res.json({
      success: true,
      data: empresas,
      message: 'Empresas ativas listadas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao listar empresas ativas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao listar empresas ativas',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Buscar empresa por ID
export const getEmpresaById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const empresaId = parseInt(id);

    if (isNaN(empresaId)) {
      return res.status(400).json({
        success: false,
        message: 'ID da empresa inválido',
        error: 'INVALID_ID'
      });
    }

    const empresa = await EmpresaModel.findByIdWithRelations(empresaId);

    if (!empresa) {
      return res.status(404).json({
        success: false,
        message: 'Empresa não encontrada',
        error: 'COMPANY_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: empresa,
      message: 'Empresa encontrada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao buscar empresa',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Buscar empresas com filtros
export const getEmpresasWithFilters = async (req: Request, res: Response) => {
  try {
    const { 
      razao_social, 
      nome_fantasia, 
      numero_inscricao, 
      status, 
      grupo_id, 
      regiao_id, 
      endereco_uf, 
      endereco_cidade 
    } = req.query;

    const filters: any = {};
    
    if (razao_social) filters.razao_social = razao_social as string;
    if (nome_fantasia) filters.nome_fantasia = nome_fantasia as string;
    if (numero_inscricao) filters.numero_inscricao = numero_inscricao as string;
    if (status) filters.status = status as StatusItem;
    if (grupo_id) filters.grupo_id = parseInt(grupo_id as string);
    if (regiao_id) filters.regiao_id = parseInt(regiao_id as string);
    if (endereco_uf) filters.endereco_uf = endereco_uf as string;
    if (endereco_cidade) filters.endereco_cidade = endereco_cidade as string;

    const empresas = await EmpresaModel.findWithFilters(filters);
    
    res.json({
      success: true,
      data: empresas,
      message: 'Empresas filtradas listadas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao filtrar empresas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao filtrar empresas',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Buscar empresas por grupo
export const getEmpresasByGroup = async (req: Request, res: Response) => {
  try {
    const { grupoId } = req.params;
    const id = parseInt(grupoId);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID do grupo inválido',
        error: 'INVALID_ID'
      });
    }

    const empresas = await EmpresaModel.findByGroup(id);
    
    res.json({
      success: true,
      data: empresas,
      message: 'Empresas do grupo listadas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar empresas por grupo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao buscar empresas por grupo',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Buscar empresas por região
export const getEmpresasByRegion = async (req: Request, res: Response) => {
  try {
    const { regiaoId } = req.params;
    const id = parseInt(regiaoId);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID da região inválido',
        error: 'INVALID_ID'
      });
    }

    const empresas = await EmpresaModel.findByRegion(id);
    
    res.json({
      success: true,
      data: empresas,
      message: 'Empresas da região listadas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar empresas por região:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao buscar empresas por região',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Criar empresa (apenas SUPER_ADMIN e ADMIN)
export const createEmpresa = async (req: Request, res: Response) => {
  try {
    console.log('=== CREATE EMPRESA REQUEST ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    
    const empresaData = req.body as CreateEmpresaData;
    const userId = req.user!.id;
    
    console.log('User ID:', userId);
    console.log('Empresa Data:', empresaData);

    // Validações básicas
    if (!empresaData.razao_social || empresaData.razao_social.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Razão social é obrigatória',
        error: 'VALIDATION_ERROR'
      });
    }

    if (!empresaData.nome_fantasia || empresaData.nome_fantasia.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nome fantasia é obrigatório',
        error: 'VALIDATION_ERROR'
      });
    }

    if (!empresaData.grupo_id) {
      return res.status(400).json({
        success: false,
        message: 'Grupo é obrigatório',
        error: 'VALIDATION_ERROR'
      });
    }

    if (!empresaData.regiao_id) {
      return res.status(400).json({
        success: false,
        message: 'Região é obrigatória',
        error: 'VALIDATION_ERROR'
      });
    }

    // Validação condicional baseada no tipo de inscrição
    if (empresaData.tipo_inscricao) {
      if (!empresaData.numero_inscricao || empresaData.numero_inscricao.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Número de inscrição é obrigatório quando tipo de inscrição é informado',
          error: 'VALIDATION_ERROR'
        });
      }

      // Validar CNPJ
      if (empresaData.tipo_inscricao === 'cnpj') {
        if (!isValidCNPJ(empresaData.numero_inscricao)) {
          return res.status(400).json({
            success: false,
            message: 'CNPJ inválido',
            error: 'INVALID_CNPJ'
          });
        }
      }

      // Validar CPF
      if (empresaData.tipo_inscricao === 'cpf') {
        if (!isValidCPF(empresaData.numero_inscricao)) {
          return res.status(400).json({
            success: false,
            message: 'CPF inválido',
            error: 'INVALID_CPF'
          });
        }
      }

      // Verificar se número de inscrição já existe
      const existingCompany = await EmpresaModel.findByNumeroInscricao(
        empresaData.tipo_inscricao === 'cnpj' 
          ? formatCNPJ(empresaData.numero_inscricao)
          : formatCPF(empresaData.numero_inscricao)
      );
      if (existingCompany) {
        return res.status(409).json({
          success: false,
          message: `${empresaData.tipo_inscricao.toUpperCase()} já cadastrado`,
          error: 'NUMERO_INSCRICAO_ALREADY_EXISTS'
        });
      }
    }

    // Verificar se grupo existe (se fornecido)
    if (empresaData.grupo_id) {
      const grupo = await GrupoModel.findById(empresaData.grupo_id);
      if (!grupo) {
        return res.status(400).json({
          success: false,
          message: 'Grupo não encontrado',
          error: 'GROUP_NOT_FOUND'
        });
      }
    }

    // Verificar se região existe (se fornecida)
    if (empresaData.regiao_id) {
      const regiao = await RegiaoModel.findById(empresaData.regiao_id);
      if (!regiao) {
        return res.status(400).json({
          success: false,
          message: 'Região não encontrada',
          error: 'REGION_NOT_FOUND'
        });
      }
    }

    // Limpar e formatar dados
    const cleanedData: CreateEmpresaData = {
      codigo: empresaData.codigo?.trim(),
      razao_social: empresaData.razao_social.trim(),
      nome_fantasia: empresaData.nome_fantasia?.trim(),
      tipo_estabelecimento: empresaData.tipo_estabelecimento,
      tipo_inscricao: empresaData.tipo_inscricao,
      numero_inscricao: empresaData.numero_inscricao 
        ? (empresaData.tipo_inscricao === 'cnpj' 
            ? formatCNPJ(empresaData.numero_inscricao)
            : formatCPF(empresaData.numero_inscricao))
        : undefined,
      cno: empresaData.cno?.trim(),
      cnae_descricao: empresaData.cnae_descricao?.trim(),
      risco: empresaData.risco?.trim(),
      endereco_cep: empresaData.endereco_cep?.replace(/[^\d]/g, ''),
      endereco_logradouro: empresaData.endereco_logradouro?.trim(),
      endereco_numero: empresaData.endereco_numero?.trim(),
      endereco_complemento: empresaData.endereco_complemento?.trim(),
      endereco_bairro: empresaData.endereco_bairro?.trim(),
      endereco_cidade: empresaData.endereco_cidade?.trim(),
      endereco_uf: empresaData.endereco_uf?.toUpperCase(),
      contato_nome: empresaData.contato_nome?.trim(),
      contato_telefone: empresaData.contato_telefone?.trim(),
      contato_email: empresaData.contato_email?.trim(),
      representante_legal_nome: empresaData.representante_legal_nome?.trim(),
      representante_legal_cpf: empresaData.representante_legal_cpf?.trim(),
      observacoes: empresaData.observacoes?.trim(),
      observacoes_os: empresaData.observacoes_os?.trim(),
      status: empresaData.status || StatusItem.ATIVO,
      grupo_id: empresaData.grupo_id,
      regiao_id: empresaData.regiao_id
    };

    const empresa = await EmpresaModel.create(cleanedData, userId);
    
    console.log('Empresa criada com sucesso:', empresa);

    res.status(201).json({
      success: true,
      data: empresa,
      message: 'Empresa criada com sucesso'
    });
  } catch (error: any) {
    console.error('=== ERRO AO CRIAR EMPRESA ===');
    console.error('Error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error code:', error.code);
    console.error('Error constraint:', error.constraint);
    
    // Erro de duplicata
    if (error.code === '23505' && error.constraint === 'empresas_numero_inscricao_key') {
      return res.status(409).json({
        success: false,
        message: 'Número de inscrição já cadastrado',
        error: 'NUMERO_INSCRICAO_ALREADY_EXISTS'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao criar empresa',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Atualizar empresa (apenas SUPER_ADMIN e ADMIN)
export const updateEmpresa = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const empresaId = parseInt(id);
    const updateData = req.body as UpdateEmpresaData;
    const userId = req.user!.id;

    if (isNaN(empresaId)) {
      return res.status(400).json({
        success: false,
        message: 'ID da empresa inválido',
        error: 'INVALID_ID'
      });
    }

    // Verificar se empresa existe
    const existingCompany = await EmpresaModel.findById(empresaId);
    if (!existingCompany) {
      return res.status(404).json({
        success: false,
        message: 'Empresa não encontrada',
        error: 'COMPANY_NOT_FOUND'
      });
    }

    // Validar razão social se fornecida
    if (updateData.razao_social !== undefined && updateData.razao_social.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Razão social não pode estar vazia',
        error: 'VALIDATION_ERROR'
      });
    }

    // Validação condicional baseada no tipo de inscrição
    if (updateData.tipo_inscricao && updateData.numero_inscricao) {
      // Validar CNPJ
      if (updateData.tipo_inscricao === 'cnpj' && !isValidCNPJ(updateData.numero_inscricao)) {
        return res.status(400).json({
          success: false,
          message: 'CNPJ inválido',
          error: 'INVALID_CNPJ'
        });
      }

      // Validar CPF
      if (updateData.tipo_inscricao === 'cpf' && !isValidCPF(updateData.numero_inscricao)) {
        return res.status(400).json({
          success: false,
          message: 'CPF inválido',
          error: 'INVALID_CPF'
        });
      }

      // Verificar se número de inscrição já existe (se diferente do atual)
      const formattedNumber = updateData.tipo_inscricao === 'cnpj' 
        ? formatCNPJ(updateData.numero_inscricao)
        : formatCPF(updateData.numero_inscricao);
      
      if (formattedNumber !== existingCompany.numero_inscricao) {
        const companyWithNumber = await EmpresaModel.findByNumeroInscricao(formattedNumber);
        if (companyWithNumber && companyWithNumber.id !== empresaId) {
          return res.status(409).json({
            success: false,
            message: `${updateData.tipo_inscricao.toUpperCase()} já cadastrado`,
            error: 'NUMERO_INSCRICAO_ALREADY_EXISTS'
          });
        }
      }
    }

    // Verificar se grupo existe (se fornecido)
    if (updateData.grupo_id) {
      const grupo = await GrupoModel.findById(updateData.grupo_id);
      if (!grupo) {
        return res.status(400).json({
          success: false,
          message: 'Grupo não encontrado',
          error: 'GROUP_NOT_FOUND'
        });
      }
    }

    // Verificar se região existe (se fornecida)
    if (updateData.regiao_id) {
      const regiao = await RegiaoModel.findById(updateData.regiao_id);
      if (!regiao) {
        return res.status(400).json({
          success: false,
          message: 'Região não encontrada',
          error: 'REGION_NOT_FOUND'
        });
      }
    }

    // Limpar e formatar dados
    const cleanedData: UpdateEmpresaData = {};
    if (updateData.codigo !== undefined) cleanedData.codigo = updateData.codigo?.trim();
    if (updateData.razao_social !== undefined) cleanedData.razao_social = updateData.razao_social.trim();
    if (updateData.nome_fantasia !== undefined) cleanedData.nome_fantasia = updateData.nome_fantasia?.trim();
    if (updateData.tipo_estabelecimento !== undefined) cleanedData.tipo_estabelecimento = updateData.tipo_estabelecimento;
    if (updateData.tipo_inscricao !== undefined) cleanedData.tipo_inscricao = updateData.tipo_inscricao;
    if (updateData.numero_inscricao !== undefined) {
      cleanedData.numero_inscricao = updateData.numero_inscricao && updateData.tipo_inscricao
        ? (updateData.tipo_inscricao === 'cnpj' 
            ? formatCNPJ(updateData.numero_inscricao)
            : formatCPF(updateData.numero_inscricao))
        : updateData.numero_inscricao;
    }
    if (updateData.cno !== undefined) cleanedData.cno = updateData.cno?.trim();
    if (updateData.cnae_descricao !== undefined) cleanedData.cnae_descricao = updateData.cnae_descricao?.trim();
    if (updateData.risco !== undefined) cleanedData.risco = updateData.risco?.trim();
    if (updateData.endereco_cep !== undefined) cleanedData.endereco_cep = updateData.endereco_cep?.replace(/[^\d]/g, '');
    if (updateData.endereco_logradouro !== undefined) cleanedData.endereco_logradouro = updateData.endereco_logradouro?.trim();
    if (updateData.endereco_numero !== undefined) cleanedData.endereco_numero = updateData.endereco_numero?.trim();
    if (updateData.endereco_complemento !== undefined) cleanedData.endereco_complemento = updateData.endereco_complemento?.trim();
    if (updateData.endereco_bairro !== undefined) cleanedData.endereco_bairro = updateData.endereco_bairro?.trim();
    if (updateData.endereco_cidade !== undefined) cleanedData.endereco_cidade = updateData.endereco_cidade?.trim();
    if (updateData.endereco_uf !== undefined) cleanedData.endereco_uf = updateData.endereco_uf?.toUpperCase();
    if (updateData.contato_nome !== undefined) cleanedData.contato_nome = updateData.contato_nome?.trim();
    if (updateData.contato_telefone !== undefined) cleanedData.contato_telefone = updateData.contato_telefone?.trim();
    if (updateData.contato_email !== undefined) cleanedData.contato_email = updateData.contato_email?.trim();
    if (updateData.representante_legal_nome !== undefined) cleanedData.representante_legal_nome = updateData.representante_legal_nome?.trim();
    if (updateData.representante_legal_cpf !== undefined) cleanedData.representante_legal_cpf = updateData.representante_legal_cpf?.trim();
    if (updateData.observacoes !== undefined) cleanedData.observacoes = updateData.observacoes?.trim();
    if (updateData.observacoes_os !== undefined) cleanedData.observacoes_os = updateData.observacoes_os?.trim();
    if (updateData.status !== undefined) cleanedData.status = updateData.status;
    if (updateData.grupo_id !== undefined) cleanedData.grupo_id = updateData.grupo_id;
    if (updateData.regiao_id !== undefined) cleanedData.regiao_id = updateData.regiao_id;

    const empresa = await EmpresaModel.update(empresaId, cleanedData, userId);

    if (!empresa) {
      return res.status(404).json({
        success: false,
        message: 'Empresa não encontrada após atualização',
        error: 'COMPANY_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: empresa,
      message: 'Empresa atualizada com sucesso'
    });
  } catch (error: any) {
    console.error('Erro ao atualizar empresa:', error);
    
    // Erro de duplicata
    if (error.code === '23505' && error.constraint === 'empresas_numero_inscricao_key') {
      return res.status(409).json({
        success: false,
        message: 'Número de inscrição já cadastrado',
        error: 'NUMERO_INSCRICAO_ALREADY_EXISTS'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao atualizar empresa',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Deletar empresa (apenas SUPER_ADMIN e ADMIN)
export const deleteEmpresa = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const empresaId = parseInt(id);
    const userId = req.user!.id;

    if (isNaN(empresaId)) {
      return res.status(400).json({
        success: false,
        message: 'ID da empresa inválido',
        error: 'INVALID_ID'
      });
    }

    // Verificar se empresa existe
    const existingCompany = await EmpresaModel.findById(empresaId);
    if (!existingCompany) {
      return res.status(404).json({
        success: false,
        message: 'Empresa não encontrada',
        error: 'COMPANY_NOT_FOUND'
      });
    }

    const success = await EmpresaModel.delete(empresaId, userId);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Empresa não encontrada para exclusão',
        error: 'COMPANY_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      message: 'Empresa excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir empresa:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao excluir empresa',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Obter estatísticas das empresas
export const getEmpresaStats = async (req: Request, res: Response) => {
  try {
    const [statusStats, groupStats, regionStats] = await Promise.all([
      EmpresaModel.countByStatus(),
      EmpresaModel.countByGroup(),
      EmpresaModel.countByRegion()
    ]);
    
    res.json({
      success: true,
      data: {
        statusStats,
        groupStats,
        regionStats
      },
      message: 'Estatísticas das empresas obtidas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas das empresas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao obter estatísticas',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
}; 