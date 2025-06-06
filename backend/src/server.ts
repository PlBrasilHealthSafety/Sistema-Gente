import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { testConnection, query } from './config/database';

// Configurar dotenv
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(helmet()); // Segurança
app.use(cors()); // CORS
app.use(morgan('combined')); // Logging
app.use(express.json()); // Parser JSON
app.use(express.urlencoded({ extended: true })); // Parser URL

// Rota de teste
app.get('/', (req, res) => {
  res.json({
    message: 'Sistema GENTE - Backend API',
    version: '1.0.0',
    status: 'running'
  });
});

// Rota de health check
app.get('/health', async (req, res) => {
  const dbStatus = await testConnection();
  res.json({
    status: 'healthy',
    database: dbStatus ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Rota para testar query no banco
app.get('/db-test', async (req, res) => {
  try {
    const result = await query('SELECT NOW() as current_time, version() as postgres_version');
    res.json({
      message: 'Conexão com banco funcionando!',
      data: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({
      message: 'Erro ao conectar com banco',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
});

// Middleware de tratamento de erros
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Algo deu errado!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno do servidor'
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Rota não encontrada'
  });
});

app.listen(PORT, async () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 Acesse: http://localhost:${PORT}`);
  
  // Testar conexão com banco na inicialização
  await testConnection();
}); 