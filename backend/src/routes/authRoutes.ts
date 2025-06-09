import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Rotas públicas (não requerem autenticação)
router.post('/login', AuthController.login);
router.post('/register', AuthController.register);
router.post('/forgot-password', AuthController.forgotPassword);

// Rotas protegidas (requerem autenticação)
router.get('/verify-token', authenticateToken, AuthController.verifyToken);

export default router; 