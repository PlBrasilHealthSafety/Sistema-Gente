import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { PasswordResetModel } from '../models/PasswordReset';
import { verifyPassword, generateToken, hashPassword } from '../utils/auth';
import { CreateUserData, LoginData, UserRole } from '../types/user';
import { EmailService } from '../utils/emailService';
import { v4 as uuidv4 } from 'uuid';

export class AuthController {
  
  // Login
  static async login(req: Request, res: Response) {
    try {
      const { email, password }: LoginData = req.body;

      // Validar dados obrigatórios
      if (!email || !password) {
        return res.status(400).json({
          message: 'Email e senha são obrigatórios',
          error: 'MISSING_FIELDS'
        });
      }

      // Buscar usuário por email
      const user = await UserModel.findByEmail(email.toLowerCase());
      
      if (!user) {
        return res.status(401).json({
          message: 'Credenciais inválidas',
          error: 'INVALID_CREDENTIALS'
        });
      }

      // Verificar se o usuário está ativo
      if (!user.is_active) {
        return res.status(401).json({
          message: 'Conta desativada. Entre em contato com o administrador.',
          error: 'ACCOUNT_DISABLED'
        });
      }

      // Verificar senha
      const isPasswordValid = await verifyPassword(password, user.password_hash);
      
      if (!isPasswordValid) {
        return res.status(401).json({
          message: 'Credenciais inválidas',
          error: 'INVALID_CREDENTIALS'
        });
      }

      // Atualizar último login
      await UserModel.updateLastLogin(user.id);

      // Gerar token JWT
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      // Remover senha do retorno
      const { password_hash, ...userWithoutPassword } = user;

      return res.json({
        message: 'Login realizado com sucesso',
        user: userWithoutPassword,
        token
      });

    } catch (error) {
      console.error('Erro no login:', error);
      return res.status(500).json({
        message: 'Erro interno do servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  // Registro (apenas para usuários normais via frontend)
  static async register(req: Request, res: Response) {
    try {
      const { first_name, last_name, email, password }: CreateUserData = req.body;

      // Validar dados obrigatórios
      if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({
          message: 'Todos os campos são obrigatórios',
          error: 'MISSING_FIELDS'
        });
      }

      // Validar formato do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          message: 'Formato de email inválido',
          error: 'INVALID_EMAIL'
        });
      }

      // Validar força da senha
      if (password.length < 6) {
        return res.status(400).json({
          message: 'Senha deve ter pelo menos 6 caracteres',
          error: 'WEAK_PASSWORD'
        });
      }

      // Validar se possui pelo menos um caractere especial
      const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
      if (!specialCharRegex.test(password)) {
        return res.status(400).json({
          message: 'Senha deve conter pelo menos um caractere especial (!@#$%^&*)',
          error: 'PASSWORD_MISSING_SPECIAL_CHAR'
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

      // Criar usuário (sempre como USER via registro público)
      const newUser = await UserModel.create({
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        email: email.toLowerCase(),
        password,
        role: UserRole.USER
      });

      // Remover senha do retorno
      const { password_hash, ...userWithoutPassword } = newUser;

      return res.status(201).json({
        message: 'Usuário criado com sucesso',
        user: userWithoutPassword
      });

    } catch (error) {
      console.error('Erro no registro:', error);
      return res.status(500).json({
        message: 'Erro interno do servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  // Recuperação de senha
  static async forgotPassword(req: Request, res: Response) {
    try {
      console.log('🔐 Início do processo de recuperação de senha');
      const { email } = req.body;

      if (!email) {
        console.log('❌ Email não fornecido na requisição');
        return res.status(400).json({
          message: 'Email é obrigatório',
          error: 'MISSING_EMAIL'
        });
      }

      console.log(`🔍 Buscando usuário com email: ${email}`);
      // Verificar se o usuário existe
      const user = await UserModel.findByEmail(email.toLowerCase());
      
      if (!user) {
        console.log(`❓ Usuário não encontrado para email: ${email}`);
        // Por segurança, sempre retornar sucesso mesmo se o email não existir
        return res.json({
          message: 'Se o email estiver cadastrado, você receberá as instruções de recuperação'
        });
      }

      console.log(`✅ Usuário encontrado: ${user.first_name} ${user.last_name} (ID: ${user.id})`);

      // Verificar se o usuário está ativo
      if (!user.is_active) {
        console.log(`⚠️ Usuário inativo para email: ${email}`);
        return res.json({
          message: 'Se o email estiver cadastrado, você receberá as instruções de recuperação'
        });
      }

      // Gerar token único
      const resetToken = uuidv4();
      console.log(`🔑 Token gerado: ${resetToken}`);
      
      // Token expira em 1 hora
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);
      console.log(`⏰ Token expira em: ${expiresAt.toLocaleString('pt-BR')}`);

      // Salvar token no banco
      console.log('💾 Salvando token no banco de dados...');
      await PasswordResetModel.createToken(user.id, user.email, resetToken, expiresAt);
      console.log('✅ Token salvo no banco com sucesso');

      // Enviar email
      console.log(`📧 Iniciando envio de email para: ${user.email}`);
      const emailSent = await EmailService.sendPasswordResetEmail(
        user.email,
        user.first_name,
        resetToken
      );

      if (!emailSent) {
        console.error(`❌ Falha no envio de email para: ${user.email}`);
        // Por segurança, sempre retornar sucesso mesmo se o email falhar
        // Em produção, você pode querer logar este erro para monitoramento
        console.log('⚠️ Retornando sucesso por segurança, mesmo com falha no email');
      } else {
        console.log(`✅ Email processado com sucesso para: ${user.email}`);
      }

      console.log('🎯 Processo de recuperação concluído com sucesso');
      return res.json({
        message: 'Se o email estiver cadastrado, você receberá as instruções de recuperação'
      });

    } catch (error) {
      console.error('💥 Erro na recuperação de senha:', error);
      return res.status(500).json({
        message: 'Erro interno do servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  // Redefinir senha
  static async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          message: 'Token e nova senha são obrigatórios',
          error: 'MISSING_FIELDS'
        });
      }

      // Validar força da senha
      if (newPassword.length < 6) {
        return res.status(400).json({
          message: 'Senha deve ter pelo menos 6 caracteres',
          error: 'WEAK_PASSWORD'
        });
      }

      // Validar se possui pelo menos um caractere especial
      const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;
      if (!specialCharRegex.test(newPassword)) {
        return res.status(400).json({
          message: 'Senha deve conter pelo menos um caractere especial (!@#$%^&*)',
          error: 'PASSWORD_MISSING_SPECIAL_CHAR'
        });
      }

      // Verificar se o token é válido
      const resetToken = await PasswordResetModel.findValidToken(token);
      
      if (!resetToken) {
        return res.status(400).json({
          message: 'Token inválido ou expirado',
          error: 'INVALID_TOKEN'
        });
      }

      // Buscar usuário
      const user = await UserModel.findById(resetToken.user_id);
      
      if (!user || !user.is_active) {
        return res.status(400).json({
          message: 'Usuário não encontrado ou inativo',
          error: 'USER_NOT_FOUND'
        });
      }

      // Atualizar senha
      const newPasswordHash = await hashPassword(newPassword);
      await UserModel.updatePassword(user.id, newPasswordHash);

      // Marcar token como usado
      await PasswordResetModel.markTokenAsUsed(token);

      return res.json({
        message: 'Senha redefinida com sucesso! Você já pode fazer login.'
      });

    } catch (error) {
      console.error('Erro na redefinição de senha:', error);
      return res.status(500).json({
        message: 'Erro interno do servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  // Verificar token (middleware de autenticação já faz isso, mas útil para frontend)
  static async verifyToken(req: Request, res: Response) {
    try {
      // Se chegou até aqui, o token é válido (middleware de auth já verificou)
      const user = req.user;
      
      return res.json({
        message: 'Token válido',
        user
      });

    } catch (error) {
      console.error('Erro na verificação de token:', error);
      return res.status(500).json({
        message: 'Erro interno do servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }
} 