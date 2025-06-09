import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractTokenFromHeader } from '../utils/auth';
import { UserModel } from '../models/User';
import { UserRole } from '../types/user';

// Estender interface Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        role: UserRole;
      };
    }
  }
}

// Middleware para verificar se o usuário está autenticado
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({
        message: 'Token de acesso não fornecido',
        error: 'UNAUTHORIZED'
      });
    }

    // Verificar e decodificar o token
    const decoded = verifyToken(token);
    
    // Buscar usuário no banco para verificar se ainda está ativo
    const user = await UserModel.findById(decoded.userId);
    
    if (!user || !user.is_active) {
      return res.status(401).json({
        message: 'Usuário não encontrado ou inativo',
        error: 'UNAUTHORIZED'
      });
    }

    // Adicionar informações do usuário ao request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Token inválido',
      error: 'INVALID_TOKEN'
    });
  }
};

// Middleware para verificar se o usuário tem permissão específica
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Usuário não autenticado',
        error: 'UNAUTHORIZED'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Acesso negado. Permissões insuficientes.',
        error: 'FORBIDDEN',
        required_roles: allowedRoles,
        user_role: req.user.role
      });
    }

    next();
  };
};

// Middlewares específicos para cada nível
export const requireSuperAdmin = requireRole([UserRole.SUPER_ADMIN]);
export const requireAdmin = requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]);
export const requireUser = requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER]); 