const { Pool } = require('pg');
require('dotenv').config();

console.log('=== TESTE DE CONEXÃO POSTGRESQL ===');
console.log('Host:', process.env.DB_HOST || 'localhost');
console.log('Port:', process.env.DB_PORT || '5432');
console.log('Database:', process.env.DB_NAME || 'sistema_gente');
console.log('User:', process.env.DB_USER || 'postgres');
console.log('Password definida:', process.env.DB_PASSWORD ? 'SIM' : 'NÃO');
console.log('Tipo da password:', typeof process.env.DB_PASSWORD);

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'sistema_gente',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function testConnection() {
  try {
    console.log('\n--- Tentando conectar...');
    const client = await pool.connect();
    console.log('✅ Conexão estabelecida com sucesso!');
    
    const result = await client.query('SELECT NOW() as now, version() as version');
    console.log('✅ Query executada com sucesso!');
    console.log('Data/Hora:', result.rows[0].now);
    console.log('Versão PostgreSQL:', result.rows[0].version);
    
    client.release();
    await pool.end();
    console.log('✅ Conexão fechada com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao conectar:', error.message);
    console.error('❌ Código do erro:', error.code);
    
    if (error.message.includes('password')) {
      console.log('\n🔐 DICA: Verifique se a senha no arquivo .env está correta');
      console.log('🔐 Senha atual no .env:', process.env.DB_PASSWORD);
    }
    
    if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.log('\n📊 DICA: O banco de dados "sistema_gente" não existe');
      console.log('📊 Execute: CREATE DATABASE sistema_gente; no PostgreSQL');
    }
    
    await pool.end();
  }
}

testConnection(); 