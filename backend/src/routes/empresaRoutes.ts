import express from 'express';
import { authenticateToken, requireAdmin, requireUser } from '../middleware/auth';
import {
  getAllEmpresas,
  getActiveEmpresas,
  getEmpresaById,
  getEmpresasWithFilters,
  getEmpresasByGroup,
  getEmpresasByRegion,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
  getEmpresaStats
} from '../controllers/empresaController';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Rotas de leitura - Todos os usuários autenticados podem acessar
router.get('/', requireUser, getAllEmpresas);
router.get('/ativas', requireUser, getActiveEmpresas);
router.get('/filtros', requireUser, getEmpresasWithFilters);
router.get('/stats', requireUser, getEmpresaStats);
router.get('/grupo/:grupoId', requireUser, getEmpresasByGroup);
router.get('/regiao/:regiaoId', requireUser, getEmpresasByRegion);
router.get('/:id', requireUser, getEmpresaById);

// Rotas de escrita - Apenas SUPER_ADMIN e ADMIN podem acessar
router.post('/', requireAdmin, createEmpresa);
router.put('/:id', requireAdmin, updateEmpresa);
router.delete('/:id', requireAdmin, deleteEmpresa);

export default router; 