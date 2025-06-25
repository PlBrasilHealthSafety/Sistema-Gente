import { Request, Response } from 'express';
import { ProfissionalModel } from '../models/Profissional';

export const profissionalController = {
  // Listar todos os profissionais
  async index(req: Request, res: Response) {
    try {
      const { status, categoria, nome } = req.query;
      
      const filters = {
        status: status as string,
        categoria: categoria as string,
        nome: nome as string
      };

      const profissionais = await ProfissionalModel.findAll(filters);
      
      res.json({
        success: true,
        data: profissionais,
        message: 'Profissionais listados com sucesso'
      });
    } catch (error) {
      console.error('Erro ao listar profissionais:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao listar profissionais'
      });
    }
  },

  // Buscar profissional por ID
  async show(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const profissional = await ProfissionalModel.findById(parseInt(id));
      
      if (!profissional) {
        return res.status(404).json({
          success: false,
          message: 'Profissional não encontrado'
        });
      }
      
      res.json({
        success: true,
        data: profissional
      });
    } catch (error) {
      console.error('Erro ao buscar profissional:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar profissional'
      });
    }
  },

  // Criar novo profissional
  async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
      // Verificar se o CPF já existe
      if (req.body.cpf) {
        const cpfExists = await ProfissionalModel.checkCpfExists(req.body.cpf);
        if (cpfExists) {
          return res.status(400).json({
            success: false,
            message: 'CPF já cadastrado'
          });
        }
      }

      const profissionalData = {
        ...req.body,
        created_by: userId,
        updated_by: userId
      };

      const novoProfissional = await ProfissionalModel.create(profissionalData);
      
      res.status(201).json({
        success: true,
        data: novoProfissional,
        message: 'Profissional criado com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao criar profissional:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao criar profissional'
      });
    }
  },

  // Atualizar profissional
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      
      // Verificar se o profissional existe
      const profissionalExistente = await ProfissionalModel.findById(parseInt(id));
      if (!profissionalExistente) {
        return res.status(404).json({
          success: false,
          message: 'Profissional não encontrado'
        });
      }

      // Verificar se o CPF já existe (se estiver sendo alterado)
      if (req.body.cpf && req.body.cpf !== profissionalExistente.cpf) {
        const cpfExists = await ProfissionalModel.checkCpfExists(req.body.cpf, parseInt(id));
        if (cpfExists) {
          return res.status(400).json({
            success: false,
            message: 'CPF já cadastrado'
          });
        }
      }

      const profissionalData = {
        ...req.body,
        updated_by: userId
      };

      const profissionalAtualizado = await ProfissionalModel.update(parseInt(id), profissionalData);
      
      res.json({
        success: true,
        data: profissionalAtualizado,
        message: 'Profissional atualizado com sucesso'
      });
    } catch (error: any) {
      console.error('Erro ao atualizar profissional:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao atualizar profissional'
      });
    }
  },

  // Excluir profissional
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userRole = (req as any).user?.role;
      
      // Apenas SUPER_ADMIN pode excluir definitivamente
      if (userRole !== 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'Apenas super administradores podem excluir profissionais'
        });
      }

      const profissional = await ProfissionalModel.findById(parseInt(id));
      if (!profissional) {
        return res.status(404).json({
          success: false,
          message: 'Profissional não encontrado'
        });
      }

      await ProfissionalModel.delete(parseInt(id));
      
      res.json({
        success: true,
        message: 'Profissional excluído com sucesso'
      });
    } catch (error) {
      console.error('Erro ao excluir profissional:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao excluir profissional'
      });
    }
  }
}; 