import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { testConnection, query } from './config/database';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import { initializeDatabase } from './utils/initDatabase';

// Configurar dotenv para usar local.env
dotenv.config({ path: 'local.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(helmet()); // Segurança
app.use(cors()); // CORS
app.use(morgan('combined')); // Logging
app.use(express.json()); // Parser JSON
app.use(express.urlencoded({ extended: true })); // Parser URL

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({
    message: 'Sistema GENTE - Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      health: '/health',
      db_test: '/db-test'
    }
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

// Rota para testar inserção no banco
app.get('/db-insert-test', async (req, res) => {
  try {
    // Criar tabela de teste se não existir
    await query(`
      CREATE TABLE IF NOT EXISTS teste_conexao (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Inserir dados de teste
    const timestamp = new Date().toISOString().slice(0, 19);
    const testName = `Usuário Teste ${Date.now()}`;
    const testEmail = `teste${Date.now()}@sistema.com`;

    const insertResult = await query(
      'INSERT INTO teste_conexao (nome, email) VALUES ($1, $2) RETURNING *',
      [testName, testEmail]
    );

    // Buscar todos os registros de teste
    const selectResult = await query('SELECT * FROM teste_conexao ORDER BY id DESC LIMIT 5');

    // Contar total de registros
    const countResult = await query('SELECT COUNT(*) as total FROM teste_conexao');

    res.json({
      message: 'Teste de inserção no banco realizado com sucesso!',
      dados_inseridos: insertResult.rows[0],
      ultimos_registros: selectResult.rows,
      total_registros: countResult.rows[0].total,
      status: 'success'
    });

  } catch (error) {
    res.status(500).json({
      message: 'Erro ao testar inserção no banco',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      status: 'error'
    });
  }
});

// Rota para limpar dados de teste
app.delete('/db-clean-test', async (req, res) => {
  try {
    const deleteResult = await query('DELETE FROM teste_conexao');
    
    res.json({
      message: 'Dados de teste removidos com sucesso!',
      registros_removidos: deleteResult.rowCount,
      status: 'success'
    });

  } catch (error) {
    res.status(500).json({
      message: 'Erro ao limpar dados de teste',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      status: 'error'
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
  console.log(`🔐 API Auth: http://localhost:${PORT}/api/auth`);
  
  // Testar conexão com banco na inicialização
  const dbConnected = await testConnection();
  
  if (dbConnected) {
    // Inicializar banco de dados e criar usuários iniciais
    await initializeDatabase();
  }
}); 