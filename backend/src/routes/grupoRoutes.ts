import express from 'express';
import { authenticateToken, requireAdmin, requireUser } from '../middleware/auth';
import {
  getAllGrupos,
  getActiveGrupos,
  getGrupoById,
  getGrupoWithHierarchy,
  getRootGroups,
  getSubgroups,
  createGrupo,
  updateGrupo,
  deleteGrupo,
  getGrupoStats
} from '../controllers/grupoController';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Rotas de leitura - Todos os usuários autenticados podem acessar
router.get('/', requireUser, getAllGrupos);
router.get('/ativos', requireUser, getActiveGrupos);
router.get('/raiz', requireUser, getRootGroups);
router.get('/stats', requireUser, getGrupoStats);
router.get('/:id', requireUser, getGrupoById);
router.get('/:id/hierarquia', requireUser, getGrupoWithHierarchy);
router.get('/:id/subgrupos', requireUser, getSubgroups);

// Rotas de escrita - Apenas SUPER_ADMIN e ADMIN podem acessar
router.post('/', requireAdmin, createGrupo);
router.put('/:id', requireAdmin, updateGrupo);
router.delete('/:id', requireAdmin, deleteGrupo);

export default router; 