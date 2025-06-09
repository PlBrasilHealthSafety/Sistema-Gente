import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticateToken, requireAdmin, requireSuperAdmin } from '../middleware/auth';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Rotas para admins e super admins
router.get('/', requireAdmin, UserController.getUsers);
router.get('/stats', requireAdmin, UserController.getUserStats);
router.get('/:id', requireAdmin, UserController.getUserById);
router.post('/', requireAdmin, UserController.createUser);
router.patch('/:id/status', requireAdmin, UserController.toggleUserStatus);

export default router; 