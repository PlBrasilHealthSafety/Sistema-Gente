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

// Função para formatar CNPJ
const formatCNPJ = (cnpj: string): string => {
  const cleanCNPJ = cnpj.replace(/[^\d]/g, '');
  return cleanCNPJ.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
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
      cnpj, 
      status, 
      grupo_id, 
      regiao_id, 
      uf, 
      cidade 
    } = req.query;

    const filters: any = {};
    
    if (razao_social) filters.razao_social = razao_social as string;
    if (nome_fantasia) filters.nome_fantasia = nome_fantasia as string;
    if (cnpj) filters.cnpj = cnpj as string;
    if (status) filters.status = status as StatusItem;
    if (grupo_id) filters.grupo_id = parseInt(grupo_id as string);
    if (regiao_id) filters.regiao_id = parseInt(regiao_id as string);
    if (uf) filters.uf = uf as string;
    if (cidade) filters.cidade = cidade as string;

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
    const empresaData = req.body as CreateEmpresaData;
    const userId = req.user!.id;

    // Validações básicas
    if (!empresaData.razao_social || empresaData.razao_social.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Razão social é obrigatória',
        error: 'VALIDATION_ERROR'
      });
    }

    if (!empresaData.cnpj || empresaData.cnpj.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'CNPJ é obrigatório',
        error: 'VALIDATION_ERROR'
      });
    }

    // Validar CNPJ
    if (!isValidCNPJ(empresaData.cnpj)) {
      return res.status(400).json({
        success: false,
        message: 'CNPJ inválido',
        error: 'INVALID_CNPJ'
      });
    }

    // Verificar se CNPJ já existe
    const existingCompany = await EmpresaModel.findByCNPJ(formatCNPJ(empresaData.cnpj));
    if (existingCompany) {
      return res.status(409).json({
        success: false,
        message: 'CNPJ já cadastrado',
        error: 'CNPJ_ALREADY_EXISTS'
      });
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
      razao_social: empresaData.razao_social.trim(),
      nome_fantasia: empresaData.nome_fantasia?.trim(),
      cnpj: formatCNPJ(empresaData.cnpj),
      inscricao_estadual: empresaData.inscricao_estadual?.trim(),
      inscricao_municipal: empresaData.inscricao_municipal?.trim(),
      email: empresaData.email?.trim(),
      telefone: empresaData.telefone?.trim(),
      site: empresaData.site?.trim(),
      endereco: empresaData.endereco?.trim(),
      numero: empresaData.numero?.trim(),
      complemento: empresaData.complemento?.trim(),
      bairro: empresaData.bairro?.trim(),
      cidade: empresaData.cidade?.trim(),
      uf: empresaData.uf?.toUpperCase(),
      cep: empresaData.cep?.replace(/[^\d]/g, ''),
      status: empresaData.status || StatusItem.ATIVO,
      grupo_id: empresaData.grupo_id,
      regiao_id: empresaData.regiao_id
    };

    const empresa = await EmpresaModel.create(cleanedData, userId);

    res.status(201).json({
      success: true,
      data: empresa,
      message: 'Empresa criada com sucesso'
    });
  } catch (error: any) {
    console.error('Erro ao criar empresa:', error);
    
    // Erro de duplicata de CNPJ
    if (error.code === '23505' && error.constraint === 'empresas_cnpj_key') {
      return res.status(409).json({
        success: false,
        message: 'CNPJ já cadastrado',
        error: 'CNPJ_ALREADY_EXISTS'
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

    // Validar CNPJ se fornecido
    if (updateData.cnpj && !isValidCNPJ(updateData.cnpj)) {
      return res.status(400).json({
        success: false,
        message: 'CNPJ inválido',
        error: 'INVALID_CNPJ'
      });
    }

    // Verificar se CNPJ já existe (se fornecido e diferente do atual)
    if (updateData.cnpj) {
      const formattedCNPJ = formatCNPJ(updateData.cnpj);
      if (formattedCNPJ !== existingCompany.cnpj) {
        const companyWithCNPJ = await EmpresaModel.findByCNPJ(formattedCNPJ);
        if (companyWithCNPJ && companyWithCNPJ.id !== empresaId) {
          return res.status(409).json({
            success: false,
            message: 'CNPJ já cadastrado',
            error: 'CNPJ_ALREADY_EXISTS'
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
    if (updateData.razao_social !== undefined) cleanedData.razao_social = updateData.razao_social.trim();
    if (updateData.nome_fantasia !== undefined) cleanedData.nome_fantasia = updateData.nome_fantasia?.trim();
    if (updateData.cnpj !== undefined) cleanedData.cnpj = formatCNPJ(updateData.cnpj);
    if (updateData.inscricao_estadual !== undefined) cleanedData.inscricao_estadual = updateData.inscricao_estadual?.trim();
    if (updateData.inscricao_municipal !== undefined) cleanedData.inscricao_municipal = updateData.inscricao_municipal?.trim();
    if (updateData.email !== undefined) cleanedData.email = updateData.email?.trim();
    if (updateData.telefone !== undefined) cleanedData.telefone = updateData.telefone?.trim();
    if (updateData.site !== undefined) cleanedData.site = updateData.site?.trim();
    if (updateData.endereco !== undefined) cleanedData.endereco = updateData.endereco?.trim();
    if (updateData.numero !== undefined) cleanedData.numero = updateData.numero?.trim();
    if (updateData.complemento !== undefined) cleanedData.complemento = updateData.complemento?.trim();
    if (updateData.bairro !== undefined) cleanedData.bairro = updateData.bairro?.trim();
    if (updateData.cidade !== undefined) cleanedData.cidade = updateData.cidade?.trim();
    if (updateData.uf !== undefined) cleanedData.uf = updateData.uf?.toUpperCase();
    if (updateData.cep !== undefined) cleanedData.cep = updateData.cep?.replace(/[^\d]/g, '');
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
    
    // Erro de duplicata de CNPJ
    if (error.code === '23505' && error.constraint === 'empresas_cnpj_key') {
      return res.status(409).json({
        success: false,
        message: 'CNPJ já cadastrado',
        error: 'CNPJ_ALREADY_EXISTS'
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