import { Router } from 'express';
import { profissionalController } from '../controllers/profissionalController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Rotas de profissionais
router.get('/', profissionalController.index);
router.get('/:id', profissionalController.show);
router.post('/', profissionalController.create);
router.put('/:id', profissionalController.update);
router.delete('/:id', profissionalController.delete);

export default router; 