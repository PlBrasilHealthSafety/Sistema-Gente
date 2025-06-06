const { Pool } = require('pg');
require('dotenv').config({ path: 'local.env' });

console.log('🚀 === TESTE DE INSERÇÃO DE USUÁRIO ===');
console.log('📊 Configurações do Banco:');
console.log('Host:', process.env.DB_HOST);
console.log('Database:', process.env.DB_NAME);
console.log('User:', process.env.DB_USER);
console.log('Password configurada:', process.env.DB_PASSWORD ? 'SIM' : 'NÃO');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function insertTestUser() {
  let client;
  try {
    console.log('\n🔗 Conectando ao banco...');
    client = await pool.connect();
    console.log('✅ Conectado com sucesso!');

    // 1. Criar tabela de usuários se não existir
    console.log('\n📝 Criando tabela de usuários...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios_teste (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        telefone VARCHAR(20),
        cargo VARCHAR(50),
        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ativo BOOLEAN DEFAULT true
      )
    `);
    console.log('✅ Tabela criada/verificada!');

    // 2. Inserir usuário de teste
    console.log('\n👤 Inserindo usuário de teste...');
    const timestamp = Date.now();
    const novoUsuario = {
      nome: `João Silva ${timestamp}`,
      email: `joao.silva.${timestamp}@empresa.com`,
      telefone: '(11) 99999-9999',
      cargo: 'Analista'
    };

    const resultado = await client.query(`
      INSERT INTO usuarios_teste (nome, email, telefone, cargo) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
    `, [novoUsuario.nome, novoUsuario.email, novoUsuario.telefone, novoUsuario.cargo]);

    console.log('✅ Usuário inserido com sucesso!');
    console.log('📋 Dados do usuário:', resultado.rows[0]);

    // 3. Buscar todos os usuários
    console.log('\n📊 Buscando todos os usuários...');
    const todosUsuarios = await client.query('SELECT * FROM usuarios_teste ORDER BY id DESC LIMIT 5');
    console.log('✅ Usuários encontrados:', todosUsuarios.rows.length);
    todosUsuarios.rows.forEach((user, index) => {
      console.log(`${index + 1}. ${user.nome} (${user.email}) - ${user.cargo}`);
    });

    // 4. Contar total de usuários
    const total = await client.query('SELECT COUNT(*) as total FROM usuarios_teste');
    console.log('\n📈 Total de usuários na base:', total.rows[0].total);

    console.log('\n🎉 Teste de inserção concluído com sucesso!');

  } catch (error) {
    console.error('\n❌ Erro durante o teste:', error.message);
    if (error.code) {
      console.error('🔢 Código do erro:', error.code);
    }
  } finally {
    if (client) {
      client.release();
      console.log('\n🔐 Conexão liberada');
    }
    await pool.end();
    console.log('🔐 Pool de conexões fechado');
  }
}

insertTestUser(); 