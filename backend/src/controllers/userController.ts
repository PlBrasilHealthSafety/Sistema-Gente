import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { CreateUserData, UserRole } from '../types/user';

export class UserController {
  
  // Listar todos os usuários (apenas para admins)
  static async getUsers(req: Request, res: Response) {
    try {
      const users = await UserModel.findAll();
      
      // Remover senhas do retorno
      const usersWithoutPasswords = users.map(user => {
        const { password_hash, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      return res.json({
        message: 'Usuários listados com sucesso',
        users: usersWithoutPasswords,
        total: usersWithoutPasswords.length
      });
      
    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      return res.status(500).json({
        message: 'Erro interno do servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  // Buscar usuário por ID
  static async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(Number(id))) {
        return res.status(400).json({
          message: 'ID do usuário inválido',
          error: 'INVALID_ID'
        });
      }
      
      const user = await UserModel.findById(Number(id));
      
      if (!user) {
        return res.status(404).json({
          message: 'Usuário não encontrado',
          error: 'USER_NOT_FOUND'
        });
      }
      
      // Remover senha do retorno
      const { password_hash, ...userWithoutPassword } = user;
      
      return res.json({
        message: 'Usuário encontrado',
        user: userWithoutPassword
      });
      
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      return res.status(500).json({
        message: 'Erro interno do servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  // Criar usuário (apenas para admins)
  static async createUser(req: Request, res: Response) {
    try {
      const { first_name, last_name, email, password, role }: CreateUserData = req.body;
      
      // Validar dados obrigatórios
      if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({
          message: 'Todos os campos são obrigatórios',
          error: 'MISSING_FIELDS'
        });
      }
      
      // Validar role
      if (role && !Object.values(UserRole).includes(role)) {
        return res.status(400).json({
          message: 'Role inválido',
          error: 'INVALID_ROLE'
        });
      }
      
      // Apenas Super Admins podem criar outros Super Admins
      if (role === UserRole.SUPER_ADMIN && req.user?.role !== UserRole.SUPER_ADMIN) {
        return res.status(403).json({
          message: 'Apenas Super Administradores podem criar outros Super Administradores',
          error: 'INSUFFICIENT_PERMISSIONS'
        });
      }
      
      // Verificar se já existe usuário com este email
      const existingUser = await UserModel.findByEmail(email.toLowerCase());
      
      if (existingUser) {
        return res.status(409).json({
          message: 'Já existe um usuário com este email',
          error: 'EMAIL_ALREADY_EXISTS'
        });
      }
      
      // Criar usuário
      const newUser = await UserModel.create({
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email.toLowerCase(),
        password,
        role: role || UserRole.USER
      });
      
      // Remover senha do retorno
      const { password_hash, ...userWithoutPassword } = newUser;
      
      return res.status(201).json({
        message: 'Usuário criado com sucesso',
        user: userWithoutPassword
      });
      
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return res.status(500).json({
        message: 'Erro interno do servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  // Ativar/Desativar usuário
  static async toggleUserStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { is_active } = req.body;
      
      if (!id || isNaN(Number(id))) {
        return res.status(400).json({
          message: 'ID do usuário inválido',
          error: 'INVALID_ID'
        });
      }
      
      if (typeof is_active !== 'boolean') {
        return res.status(400).json({
          message: 'Status ativo deve ser true ou false',
          error: 'INVALID_STATUS'
        });
      }
      
      const user = await UserModel.findById(Number(id));
      
      if (!user) {
        return res.status(404).json({
          message: 'Usuário não encontrado',
          error: 'USER_NOT_FOUND'
        });
      }
      
      // Não permitir desativar própria conta
      if (Number(id) === req.user?.id) {
        return res.status(400).json({
          message: 'Não é possível alterar o status da própria conta',
          error: 'CANNOT_MODIFY_SELF'
        });
      }
      
      // Não permitir que admin desative super admin
      if (user.role === UserRole.SUPER_ADMIN && req.user?.role !== UserRole.SUPER_ADMIN) {
        return res.status(403).json({
          message: 'Apenas Super Administradores podem alterar status de outros Super Administradores',
          error: 'INSUFFICIENT_PERMISSIONS'
        });
      }
      
      const updatedUser = await UserModel.updateActiveStatus(Number(id), is_active);
      
      if (!updatedUser) {
        return res.status(404).json({
          message: 'Erro ao atualizar usuário',
          error: 'UPDATE_ERROR'
        });
      }
      
      // Remover senha do retorno
      const { password_hash, ...userWithoutPassword } = updatedUser;
      
      return res.json({
        message: `Usuário ${is_active ? 'ativado' : 'desativado'} com sucesso`,
        user: userWithoutPassword
      });
      
    } catch (error) {
      console.error('Erro ao alterar status do usuário:', error);
      return res.status(500).json({
        message: 'Erro interno do servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  // Estatísticas de usuários
  static async getUserStats(req: Request, res: Response) {
    try {
      const roleStats = await UserModel.countByRole();
      const allUsers = await UserModel.findAll();
      
      const activeUsers = allUsers.filter(user => user.is_active).length;
      const inactiveUsers = allUsers.filter(user => !user.is_active).length;
      
      return res.json({
        message: 'Estatísticas de usuários',
        stats: {
          total: allUsers.length,
          active: activeUsers,
          inactive: inactiveUsers,
          by_role: roleStats
        }
      });
      
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return res.status(500).json({
        message: 'Erro interno do servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }
} 