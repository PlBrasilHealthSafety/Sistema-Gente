import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

// Configurar dotenv para usar local.env
dotenv.config({ path: 'local.env' });

// Configuração do pool de conexões
const dbConfig: PoolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'sistema_gente',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  // Configurações do pool
  max: 20, // máximo de conexões simultâneas
  idleTimeoutMillis: 30000, // tempo para fechar conexões inativas
  connectionTimeoutMillis: 2000, // tempo limite para conectar
};

// Criar o pool de conexões
export const pool = new Pool(dbConfig);

// Função para testar a conexão
export const testConnection = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Conexão com PostgreSQL estabelecida com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com PostgreSQL:', error);
    return false;
  }
};

// Função para executar queries
export const query = async (text: string, params?: any[]) => {
  try {
    const start = Date.now();
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    console.log('Query executada:', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Erro na query:', error);
    throw error;
  }
};

// Fechar todas as conexões (útil para testes e shutdown)
export const closePool = async () => {
  await pool.end();
  console.log('🔐 Pool de conexões fechado');
}; 