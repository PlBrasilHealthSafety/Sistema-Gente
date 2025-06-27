import { Router } from 'express';
import { credenciadoController } from '../controllers/credenciadoController';
import { authenticateToken, requireRole } from '../middleware/auth';
import { UserRole } from '../types/user';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Listar credenciados
router.get('/', credenciadoController.listar);

// Buscar credenciado por ID
router.get('/:id', credenciadoController.buscarPorId);

// Criar credenciado (apenas admin e super_admin)
router.post('/', requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]), credenciadoController.criar);

// Atualizar credenciado (apenas admin e super_admin)
router.put('/:id', requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]), credenciadoController.atualizar);

// Alterar status do credenciado (apenas admin e super_admin)
router.patch('/:id/status', requireRole([UserRole.ADMIN, UserRole.SUPER_ADMIN]), credenciadoController.alterarStatus);

// Excluir credenciado (apenas super_admin)
router.delete('/:id', requireRole([UserRole.SUPER_ADMIN]), credenciadoController.excluir);

export default router; 