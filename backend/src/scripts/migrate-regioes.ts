import { query } from '../config/database';

async function migrateRegioes() {
  try {
    console.log('🔄 Iniciando migração das regiões...');

    // Verificar se a coluna grupo_id já existe
    const checkColumn = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'regioes' AND column_name = 'grupo_id'
    `);

    if (checkColumn.rows.length === 0) {
      console.log('➕ Adicionando coluna grupo_id à tabela regioes...');
      
      // Adicionar a coluna grupo_id
      await query(`
        ALTER TABLE regioes 
        ADD COLUMN grupo_id INTEGER REFERENCES grupos(id)
      `);
      
      // Criar índice
      await query(`
        CREATE INDEX IF NOT EXISTS idx_regioes_grupo_id ON regioes(grupo_id)
      `);
      
      console.log('✅ Coluna grupo_id adicionada com sucesso!');
    } else {
      console.log('✅ Coluna grupo_id já existe na tabela regioes');
    }

    // Verificar dados
    const regioes = await query('SELECT id, nome, grupo_id FROM regioes');
    console.log(`📊 Total de regiões: ${regioes.rows.length}`);
    
    regioes.rows.forEach(regiao => {
      console.log(`🔍 Região: ${regiao.nome} - grupo_id: ${regiao.grupo_id || 'NULL'}`);
    });

    console.log('✅ Migração concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro na migração:', error);
    throw error;
  }
}

// Executar se for chamado diretamente
if (require.main === module) {
  migrateRegioes()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Falha na migração:', error);
      process.exit(1);
    });
}

export { migrateRegioes }; 