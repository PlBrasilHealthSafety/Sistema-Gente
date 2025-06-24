import { Request, Response } from 'express';
import { GrupoModel } from '../models/Grupo';
import { GrupoPontoFocalModel } from '../models/GrupoPontoFocal';
import { CreateGrupoData, UpdateGrupoData, StatusItem, CreateGrupoPontoFocalData } from '../types/organizacional';
import { UserRole } from '../types/user';

// Listar todos os grupos
export const getAllGrupos = async (req: Request, res: Response) => {
  try {
    const grupos = await GrupoModel.findAll();
    
    res.json({
      success: true,
      data: grupos,
      message: 'Grupos listados com sucesso'
    });
  } catch (error) {
    console.error('Erro ao listar grupos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao listar grupos',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Listar grupos ativos
export const getActiveGrupos = async (req: Request, res: Response) => {
  try {
    const grupos = await GrupoModel.findActive();
    
    res.json({
      success: true,
      data: grupos,
      message: 'Grupos ativos listados com sucesso'
    });
  } catch (error) {
    console.error('Erro ao listar grupos ativos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao listar grupos ativos',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Buscar grupo por ID
export const getGrupoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const grupoId = parseInt(id);

    if (isNaN(grupoId)) {
      return res.status(400).json({
        success: false,
        message: 'ID do grupo inválido',
        error: 'INVALID_ID'
      });
    }

    const grupo = await GrupoModel.findById(grupoId);

    if (!grupo) {
      return res.status(404).json({
        success: false,
        message: 'Grupo não encontrado',
        error: 'GROUP_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: grupo,
      message: 'Grupo encontrado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar grupo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao buscar grupo',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Buscar grupo com hierarquia
export const getGrupoWithHierarchy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const grupoId = parseInt(id);

    if (isNaN(grupoId)) {
      return res.status(400).json({
        success: false,
        message: 'ID do grupo inválido',
        error: 'INVALID_ID'
      });
    }

    const grupo = await GrupoModel.findWithHierarchy(grupoId);

    if (!grupo) {
      return res.status(404).json({
        success: false,
        message: 'Grupo não encontrado',
        error: 'GROUP_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      data: grupo,
      message: 'Grupo com hierarquia encontrado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao buscar grupo com hierarquia:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao buscar grupo com hierarquia',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Buscar grupos raiz
export const getRootGroups = async (req: Request, res: Response) => {
  try {
    const grupos = await GrupoModel.findRootGroups();
    
    res.json({
      success: true,
      data: grupos,
      message: 'Grupos raiz listados com sucesso'
    });
  } catch (error) {
    console.error('Erro ao listar grupos raiz:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao listar grupos raiz',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Buscar subgrupos
export const getSubgroups = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const grupoId = parseInt(id);

    if (isNaN(grupoId)) {
      return res.status(400).json({
        success: false,
        message: 'ID do grupo inválido',
        error: 'INVALID_ID'
      });
    }

    const subgrupos = await GrupoModel.findSubgroups(grupoId);
    
    res.json({
      success: true,
      data: subgrupos,
      message: 'Subgrupos listados com sucesso'
    });
  } catch (error) {
    console.error('Erro ao listar subgrupos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao listar subgrupos',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Criar grupo (apenas SUPER_ADMIN e ADMIN)
export const createGrupo = async (req: Request, res: Response) => {
  try {
    const { nome, descricao, codigo, status, grupo_pai_id, ponto_focal_nome, ponto_focal_descricao, ponto_focal_observacoes, ponto_focal_principal, pontos_focais } = req.body as CreateGrupoData;
    const userId = req.user!.id;

    // Validações básicas
    if (!nome || nome.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nome do grupo é obrigatório',
        error: 'VALIDATION_ERROR'
      });
    }

    // Verificar se código já existe (se fornecido)
    if (codigo) {
      const existingGroup = await GrupoModel.findByCode(codigo);
      if (existingGroup) {
        return res.status(409).json({
          success: false,
          message: 'Código do grupo já existe',
          error: 'CODE_ALREADY_EXISTS'
        });
      }
    }

    // Verificar se grupo pai existe (se fornecido)
    if (grupo_pai_id) {
      const parentGroup = await GrupoModel.findById(grupo_pai_id);
      if (!parentGroup) {
        return res.status(400).json({
          success: false,
          message: 'Grupo pai não encontrado',
          error: 'PARENT_GROUP_NOT_FOUND'
        });
      }
    }

    const grupo = await GrupoModel.create({
      nome: nome.trim(),
      descricao: descricao?.trim(),
      codigo: codigo?.trim(),
      status: status || StatusItem.ATIVO,
      grupo_pai_id,
      ponto_focal_nome: ponto_focal_nome?.trim(),
      ponto_focal_descricao: ponto_focal_descricao?.trim(),
      ponto_focal_observacoes: ponto_focal_observacoes?.trim(),
      ponto_focal_principal: ponto_focal_principal || false
    }, userId);

    // Criar múltiplos pontos focais se fornecidos
    if (pontos_focais && Array.isArray(pontos_focais) && pontos_focais.length > 0) {
      console.log('Pontos focais recebidos do frontend:', pontos_focais);
      
      const pontosFocaisProcessados: CreateGrupoPontoFocalData[] = pontos_focais.map((pf, index) => ({
        nome: pf.nome?.trim() || '',
        cargo: pf.cargo?.trim(),
        descricao: pf.descricao?.trim(),
        observacoes: pf.observacoes?.trim(),
        telefone: pf.telefone?.trim(),
        email: pf.email?.trim(),
        is_principal: pf.is_principal || false,
        ordem: pf.ordem || (index + 1)
      }));

      console.log('Pontos focais processados para salvar:', pontosFocaisProcessados);

      await GrupoPontoFocalModel.createMultiple(grupo.id, pontosFocaisProcessados, userId);
      
      // Recarregar grupo com pontos focais
      const grupoComPontosFocais = await GrupoModel.findById(grupo.id);
      if (grupoComPontosFocais) {
        console.log('Grupo recarregado com pontos focais:', grupoComPontosFocais.pontos_focais);
        grupo.pontos_focais = grupoComPontosFocais.pontos_focais;
      }
    }

    res.status(201).json({
      success: true,
      data: grupo,
      message: 'Grupo criado com sucesso'
    });
  } catch (error: any) {
    console.error('Erro ao criar grupo:', error);
    
    // Erro de duplicata de código
    if (error.code === '23505' && error.constraint === 'grupos_codigo_key') {
      return res.status(409).json({
        success: false,
        message: 'Código do grupo já existe',
        error: 'CODE_ALREADY_EXISTS'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao criar grupo',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Atualizar grupo (apenas SUPER_ADMIN e ADMIN)
export const updateGrupo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const grupoId = parseInt(id);
    const updateData = req.body as UpdateGrupoData;
    const userId = req.user!.id;

    if (isNaN(grupoId)) {
      return res.status(400).json({
        success: false,
        message: 'ID do grupo inválido',
        error: 'INVALID_ID'
      });
    }

    // Verificar se grupo existe
    const existingGroup = await GrupoModel.findById(grupoId);
    if (!existingGroup) {
      return res.status(404).json({
        success: false,
        message: 'Grupo não encontrado',
        error: 'GROUP_NOT_FOUND'
      });
    }

    // Validar nome se fornecido
    if (updateData.nome !== undefined && updateData.nome.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nome do grupo não pode estar vazio',
        error: 'VALIDATION_ERROR'
      });
    }

    // Verificar se código já existe (se fornecido e diferente do atual)
    if (updateData.codigo && updateData.codigo !== existingGroup.codigo) {
      const groupWithCode = await GrupoModel.findByCode(updateData.codigo);
      if (groupWithCode && groupWithCode.id !== grupoId) {
        return res.status(409).json({
          success: false,
          message: 'Código do grupo já existe',
          error: 'CODE_ALREADY_EXISTS'
        });
      }
    }

    // Verificar se grupo pai existe (se fornecido)
    if (updateData.grupo_pai_id) {
      const parentGroup = await GrupoModel.findById(updateData.grupo_pai_id);
      if (!parentGroup) {
        return res.status(400).json({
          success: false,
          message: 'Grupo pai não encontrado',
          error: 'PARENT_GROUP_NOT_FOUND'
        });
      }

      // Evitar referência circular
      if (updateData.grupo_pai_id === grupoId) {
        return res.status(400).json({
          success: false,
          message: 'Um grupo não pode ser pai de si mesmo',
          error: 'CIRCULAR_REFERENCE'
        });
      }
    }

    // Limpar strings se fornecidas
    const cleanedData: UpdateGrupoData = {};
    if (updateData.nome !== undefined) cleanedData.nome = updateData.nome.trim();
    if (updateData.descricao !== undefined) cleanedData.descricao = updateData.descricao?.trim();
    if (updateData.codigo !== undefined) cleanedData.codigo = updateData.codigo?.trim();
    if (updateData.status !== undefined) cleanedData.status = updateData.status;
    if (updateData.grupo_pai_id !== undefined) cleanedData.grupo_pai_id = updateData.grupo_pai_id;
    if (updateData.ponto_focal_nome !== undefined) cleanedData.ponto_focal_nome = updateData.ponto_focal_nome?.trim();
    if (updateData.ponto_focal_descricao !== undefined) cleanedData.ponto_focal_descricao = updateData.ponto_focal_descricao?.trim();
    if (updateData.ponto_focal_observacoes !== undefined) cleanedData.ponto_focal_observacoes = updateData.ponto_focal_observacoes?.trim();
    if (updateData.ponto_focal_principal !== undefined) cleanedData.ponto_focal_principal = updateData.ponto_focal_principal;

    const grupo = await GrupoModel.update(grupoId, cleanedData, userId);

    if (!grupo) {
      return res.status(404).json({
        success: false,
        message: 'Grupo não encontrado após atualização',
        error: 'GROUP_NOT_FOUND'
      });
    }

    // Atualizar múltiplos pontos focais se fornecidos
    if (updateData.pontos_focais !== undefined) {
      console.log('Atualizando pontos focais:', updateData.pontos_focais);
      
      if (Array.isArray(updateData.pontos_focais) && updateData.pontos_focais.length > 0) {
        const pontosFocaisProcessados: CreateGrupoPontoFocalData[] = updateData.pontos_focais.map((pf, index) => ({
          nome: pf.nome?.trim() || '',
          cargo: pf.cargo?.trim(),
          descricao: pf.descricao?.trim(),
          observacoes: pf.observacoes?.trim(),
          telefone: pf.telefone?.trim(),
          email: pf.email?.trim(),
          is_principal: pf.is_principal || false,
          ordem: pf.ordem || (index + 1)
        }));

        console.log('Pontos focais processados para atualização:', pontosFocaisProcessados);

        await GrupoPontoFocalModel.updateByGrupoId(grupoId, pontosFocaisProcessados, userId);
      } else {
        // Se array vazio, remover todos os pontos focais
        await GrupoPontoFocalModel.deleteByGrupoId(grupoId);
      }
      
      // Recarregar grupo com pontos focais atualizados
      const grupoAtualizado = await GrupoModel.findById(grupoId);
      if (grupoAtualizado) {
        console.log('Grupo atualizado com pontos focais:', grupoAtualizado.pontos_focais);
        grupo.pontos_focais = grupoAtualizado.pontos_focais;
      }
    }

    res.json({
      success: true,
      data: grupo,
      message: 'Grupo atualizado com sucesso'
    });
  } catch (error: any) {
    console.error('Erro ao atualizar grupo:', error);
    
    // Erro de duplicata de código
    if (error.code === '23505' && error.constraint === 'grupos_codigo_key') {
      return res.status(409).json({
        success: false,
        message: 'Código do grupo já existe',
        error: 'CODE_ALREADY_EXISTS'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao atualizar grupo',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Deletar grupo (apenas SUPER_ADMIN)
export const deleteGrupo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const grupoId = parseInt(id);
    const userRole = req.user!.role;

    // Verificar se é SUPER_ADMIN
    if (userRole !== UserRole.SUPER_ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Apenas SUPER_ADMIN pode excluir grupos definitivamente',
        error: 'FORBIDDEN'
      });
    }

    if (isNaN(grupoId)) {
      return res.status(400).json({
        success: false,
        message: 'ID do grupo inválido',
        error: 'INVALID_ID'
      });
    }

    // Verificar se grupo existe
    const existingGroup = await GrupoModel.findById(grupoId);
    if (!existingGroup) {
      return res.status(404).json({
        success: false,
        message: 'Grupo não encontrado',
        error: 'GROUP_NOT_FOUND'
      });
    }

    // Verificar se grupo tem filhos
    const hasChildren = await GrupoModel.hasChildren(grupoId);
    if (hasChildren) {
      return res.status(409).json({
        success: false,
        message: 'Não é possível excluir um grupo que possui subgrupos',
        error: 'HAS_CHILDREN'
      });
    }

    // Verificar se há empresas associadas
    const hasEmpresas = await GrupoModel.hasAssociatedEmpresas(grupoId);
    if (hasEmpresas) {
      return res.status(409).json({
        success: false,
        message: 'Não é possível excluir um grupo que possui empresas associadas. Primeiro mova as empresas para outro grupo ou exclua-as.',
        error: 'HAS_ASSOCIATED_EMPRESAS'
      });
    }

    // Verificar se há regiões associadas
    const hasRegioes = await GrupoModel.hasAssociatedRegioes(grupoId);
    if (hasRegioes) {
      return res.status(409).json({
        success: false,
        message: 'Não é possível excluir um grupo que possui regiões associadas. Primeiro mova as regiões para outro grupo ou exclua-as.',
        error: 'HAS_ASSOCIATED_REGIOES'
      });
    }

    // Usar hard delete para SUPER_ADMIN
    const success = await GrupoModel.hardDelete(grupoId);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Grupo não encontrado para exclusão',
        error: 'GROUP_NOT_FOUND'
      });
    }

    res.json({
      success: true,
      message: 'Grupo excluído definitivamente com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir grupo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao excluir grupo',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
};

// Obter estatísticas dos grupos
export const getGrupoStats = async (req: Request, res: Response) => {
  try {
    const statusStats = await GrupoModel.countByStatus();
    
    res.json({
      success: true,
      data: {
        statusStats
      },
      message: 'Estatísticas dos grupos obtidas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas dos grupos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor ao obter estatísticas',
      error: 'INTERNAL_SERVER_ERROR'
    });
  }
}; 