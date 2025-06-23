import express from 'express';
import { authenticateToken, requireAdmin, requireUser, requireSuperAdmin } from '../middleware/auth';
import {
  getAllRegioes,
  getActiveRegioes,
  getRegiaoById,
  getRegioesByUF,
  getRegioesByCity,
  getAvailableUFs,
  createRegiao,
  updateRegiao,
  deleteRegiao,
  getRegiaoStats
} from '../controllers/regiaoController';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Rotas de leitura - Todos os usuários autenticados podem acessar
router.get('/', requireUser, getAllRegioes);
router.get('/ativas', requireUser, getActiveRegioes);
router.get('/ufs', requireUser, getAvailableUFs);
router.get('/stats', requireUser, getRegiaoStats);
router.get('/uf/:uf', requireUser, getRegioesByUF);
router.get('/cidade/:cidade', requireUser, getRegioesByCity);
router.get('/:id', requireUser, getRegiaoById);

// Rotas de escrita - Apenas SUPER_ADMIN e ADMIN podem acessar
router.post('/', requireAdmin, createRegiao);
router.put('/:id', requireAdmin, updateRegiao);
// Rota de exclusão física - Apenas SUPER_ADMIN pode acessar
router.delete('/:id', requireSuperAdmin, deleteRegiao);

export default router; 