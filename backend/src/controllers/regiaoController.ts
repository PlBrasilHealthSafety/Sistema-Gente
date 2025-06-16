import { Request, Response } from 'express';
import { RegiaoModel } from '../models/Regiao';
import { CreateRegiaoData, UpdateRegiaoData, StatusItem } from '../types/organizacional';

// Listar todas as regiões
export const getAllRegioes = async (req: Request, res: Response) => {
  try {
    const regioes = await RegiaoModel.findAll();
    
    res.json({
      success: true,
      data: regioes,
      message: 'Regiões listadas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao listar regiões:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao listar regiões',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Listar regiões ativas
export const getActiveRegioes = async (req: Request, res: Response) => {
  try {
    const regioes = await RegiaoModel.findActive();
    
    res.json({
      success: true,
      data: regioes,
      message: 'Regiões ativas listadas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao listar regiões ativas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao listar regiões ativas',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Buscar região por ID
export const getRegiaoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const regiaoId = parseInt(id);

    if (isNaN(regiaoId)) {
      return res.status(400).json({
        success: false,
        message: 'ID da região inválido',
        error: 'INVALID_ID'
      });
    }

    const regiao = await RegiaoModel.findById(regiaoId);

    if (!regiao) {
      return res.status(404).json({
        success: false,
        message: 'Região não encontrada',
        error: 'REGION_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: regiao,
      message: 'Região encontrada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar região:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao buscar região',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Buscar regiões por UF
export const getRegioesByUF = async (req: Request, res: Response) => {
  try {
    const { uf } = req.params;

    if (!uf || uf.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'UF deve ter exatamente 2 caracteres',
        error: 'INVALID_UF'
      });
    }

    const regioes = await RegiaoModel.findByUF(uf.toUpperCase());
    
    res.json({
      success: true,
      data: regioes,
      message: 'Regiões por UF listadas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar regiões por UF:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao buscar regiões por UF',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Buscar regiões por cidade
export const getRegioesByCity = async (req: Request, res: Response) => {
  try {
    const { cidade } = req.params;

    if (!cidade || cidade.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nome da cidade é obrigatório',
        error: 'INVALID_CITY'
      });
    }

    const regioes = await RegiaoModel.findByCity(cidade);
    
    res.json({
      success: true,
      data: regioes,
      message: 'Regiões por cidade listadas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar regiões por cidade:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao buscar regiões por cidade',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Listar UFs disponíveis
export const getAvailableUFs = async (req: Request, res: Response) => {
  try {
    const ufs = await RegiaoModel.getAvailableUFs();
    
    res.json({
      success: true,
      data: ufs,
      message: 'UFs disponíveis listadas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao listar UFs disponíveis:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao listar UFs',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Criar região (apenas SUPER_ADMIN e ADMIN)
export const createRegiao = async (req: Request, res: Response) => {
  try {
    const { nome, descricao, codigo, uf, cidade, grupo_id, status } = req.body as CreateRegiaoData;
    const userId = req.user!.id;

    // Validações básicas
    if (!nome || nome.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nome da região é obrigatório',
        error: 'VALIDATION_ERROR'
      });
    }

    // Validar UF se fornecida
    if (uf && uf.length !== 2) {
      return res.status(400).json({
        success: false,
        message: 'UF deve ter exatamente 2 caracteres',
        error: 'INVALID_UF'
      });
    }

    // Verificar se código já existe (se fornecido)
    if (codigo) {
      const existingRegion = await RegiaoModel.findByCode(codigo);
      if (existingRegion) {
        return res.status(409).json({
          success: false,
          message: 'Código da região já existe',
          error: 'CODE_ALREADY_EXISTS'
        });
      }
    }

    const regiao = await RegiaoModel.create({
      nome: nome.trim(),
      descricao: descricao?.trim(),
      codigo: codigo?.trim(),
      uf: uf?.toUpperCase(),
      cidade: cidade?.trim(),
      grupo_id,
      status: status || StatusItem.ATIVO
    }, userId);

    res.status(201).json({
      success: true,
      data: regiao,
      message: 'Região criada com sucesso'
    });
  } catch (error: any) {
    console.error('Erro ao criar região:', error);
    
    // Erro de duplicata de código
    if (error.code === '23505' && error.constraint === 'regioes_codigo_key') {
      return res.status(409).json({
        success: false,
        message: 'Código da região já existe',
        error: 'CODE_ALREADY_EXISTS'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao criar região',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Atualizar região (apenas SUPER_ADMIN e ADMIN)
export const updateRegiao = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const regiaoId = parseInt(id);
    const updateData = req.body as UpdateRegiaoData;
    const userId = req.user!.id;

    if (isNaN(regiaoId)) {
      return res.status(400).json({
        success: false,
        message: 'ID da região inválido',
        error: 'INVALID_ID'
      });
    }

    // Verificar se região existe
    const existingRegion = await RegiaoModel.findById(regiaoId);
    if (!existingRegion) {
      return res.status(404).json({
        success: false,
        message: 'Região não encontrada',
        error: 'REGION_NOT_FOUND'
      });
    }

    // Validar nome se fornecido
    if (updateData.nome !== undefined && updateData.nome.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nome da região não pode estar vazio',
        error: 'VALIDATION_ERROR'
      });
    }

    // Validar UF se fornecida
    if (updateData.uf !== undefined && updateData.uf.length !== 2 && updateData.uf.length !== 0) {
      return res.status(400).json({
        success: false,
        message: 'UF deve ter exatamente 2 caracteres',
        error: 'INVALID_UF'
      });
    }

    // Verificar se código já existe (se fornecido e diferente do atual)
    if (updateData.codigo && updateData.codigo !== existingRegion.codigo) {
      const regionWithCode = await RegiaoModel.findByCode(updateData.codigo);
      if (regionWithCode && regionWithCode.id !== regiaoId) {
        return res.status(409).json({
          success: false,
          message: 'Código da região já existe',
          error: 'CODE_ALREADY_EXISTS'
        });
      }
    }

    // Limpar strings se fornecidas
    const cleanedData: UpdateRegiaoData = {};
    if (updateData.nome !== undefined) cleanedData.nome = updateData.nome.trim();
    if (updateData.descricao !== undefined) cleanedData.descricao = updateData.descricao?.trim();
    if (updateData.codigo !== undefined) cleanedData.codigo = updateData.codigo?.trim();
    if (updateData.uf !== undefined) cleanedData.uf = updateData.uf?.toUpperCase();
    if (updateData.cidade !== undefined) cleanedData.cidade = updateData.cidade?.trim();
    if (updateData.grupo_id !== undefined) cleanedData.grupo_id = updateData.grupo_id;
    if (updateData.status !== undefined) cleanedData.status = updateData.status;

    const regiao = await RegiaoModel.update(regiaoId, cleanedData, userId);

    if (!regiao) {
      return res.status(404).json({
        success: false,
        message: 'Região não encontrada após atualização',
        error: 'REGION_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: regiao,
      message: 'Região atualizada com sucesso'
    });
  } catch (error: any) {
    console.error('Erro ao atualizar região:', error);
    
    // Erro de duplicata de código
    if (error.code === '23505' && error.constraint === 'regioes_codigo_key') {
      return res.status(409).json({
        success: false,
        message: 'Código da região já existe',
        error: 'CODE_ALREADY_EXISTS'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao atualizar região',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Deletar região (apenas SUPER_ADMIN e ADMIN)
export const deleteRegiao = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const regiaoId = parseInt(id);
    const userId = req.user!.id;

    console.log(`=== DELETAR REGIÃO ===`);
    console.log(`ID recebido: ${id}`);
    console.log(`ID parseado: ${regiaoId}`);
    console.log(`User ID: ${userId}`);

    if (isNaN(regiaoId)) {
      console.log(`Erro: ID da região inválido`);
      return res.status(400).json({
        success: false,
        message: 'ID da região inválido',
        error: 'INVALID_ID'
      });
    }

    // Verificar se região existe
    console.log(`Verificando se região ${regiaoId} existe...`);
    const existingRegion = await RegiaoModel.findById(regiaoId);
    console.log(`Região encontrada:`, existingRegion ? 'Sim' : 'Não');
    
    if (!existingRegion) {
      return res.status(404).json({
        success: false,
        message: 'Região não encontrada',
        error: 'REGION_NOT_FOUND'
      });
    }

    // Verificar se região está sendo usada por empresas
    console.log(`Verificando se região ${regiaoId} está sendo usada por empresas...`);
    const isUsed = await RegiaoModel.isUsedByCompanies(regiaoId);
    console.log(`Região em uso:`, isUsed ? 'Sim' : 'Não');
    
    if (isUsed) {
      console.log(`Erro: Região está sendo usada por empresas`);
      return res.status(409).json({
        success: false,
        message: 'Não é possível excluir uma região que possui empresas vinculadas',
        error: 'REGION_IN_USE'
      });
    }

    console.log(`Executando exclusão (soft delete) da região ${regiaoId}...`);
    const success = await RegiaoModel.delete(regiaoId, userId);
    console.log(`Exclusão bem-sucedida:`, success ? 'Sim' : 'Não');

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Região não encontrada para exclusão',
        error: 'REGION_NOT_FOUND'
      });
    }

    console.log(`=== REGIÃO ${regiaoId} EXCLUÍDA COM SUCESSO ===`);
    res.json({
      success: true,
      message: 'Região excluída com sucesso'
    });
  } catch (error) {
    console.error('=== ERRO AO EXCLUIR REGIÃO ===');
    console.error('Erro completo:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'N/A');
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao excluir região',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Obter estatísticas das regiões
export const getRegiaoStats = async (req: Request, res: Response) => {
  try {
    const statusStats = await RegiaoModel.countByStatus();
    
    res.json({
      success: true,
      data: {
        statusStats
      },
      message: 'Estatísticas das regiões obtidas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas das regiões:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao obter estatísticas',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
}; 