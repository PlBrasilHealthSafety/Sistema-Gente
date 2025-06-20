import { query } from '../config/database';

async function addEmpresaPontosFocaisTable() {
  try {
    console.log('🔄 Iniciando migração: Adicionando tabela de pontos focais para empresas...');
    
    // Criar tabela de pontos focais para empresas
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS empresa_pontos_focais (
        id SERIAL PRIMARY KEY,
        empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
        nome VARCHAR(255) NOT NULL,
        descricao TEXT,
        observacoes TEXT,
        is_principal BOOLEAN DEFAULT false,
        ordem INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER NOT NULL REFERENCES users(id),
        updated_by INTEGER REFERENCES users(id)
      );
    `;
    
    await query(createTableQuery);
    console.log('✅ Tabela empresa_pontos_focais criada com sucesso');
    
    // Criar índices
    await query('CREATE INDEX IF NOT EXISTS idx_empresa_pontos_focais_empresa_id ON empresa_pontos_focais(empresa_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_empresa_pontos_focais_principal ON empresa_pontos_focais(is_principal);');
    console.log('✅ Índices criados com sucesso');
    
    // Migrar dados existentes das empresas que têm pontos focais
    const migrateQuery = `
      INSERT INTO empresa_pontos_focais (empresa_id, nome, descricao, observacoes, is_principal, ordem, created_by, updated_by)
      SELECT 
        id as empresa_id,
        ponto_focal_nome as nome,
        ponto_focal_descricao as descricao,
        ponto_focal_observacoes as observacoes,
        ponto_focal_principal as is_principal,
        1 as ordem,
        created_by,
        updated_by
      FROM empresas 
      WHERE ponto_focal_nome IS NOT NULL AND ponto_focal_nome != '';
    `;
    
    const result = await query(migrateQuery);
    console.log(`✅ Migrados ${result.rowCount || 0} pontos focais existentes para a nova tabela`);
    
    console.log('🎉 Migração concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    throw error;
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  addEmpresaPontosFocaisTable()
    .then(() => {
      console.log('✅ Migração executada com sucesso');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro na migração:', error);
      process.exit(1);
    });
}

export default addEmpresaPontosFocaisTable; 