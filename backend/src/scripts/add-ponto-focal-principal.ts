import { query } from '../config/database';

async function addPontoFocalPrincipalColumn() {
  try {
    console.log('🔄 Adicionando coluna ponto_focal_principal à tabela grupos...');
    
    // Adicionar a coluna ponto_focal_principal
    await query(`
      ALTER TABLE grupos 
      ADD COLUMN IF NOT EXISTS ponto_focal_principal BOOLEAN DEFAULT false;
    `);
    
    console.log('✅ Coluna ponto_focal_principal adicionada com sucesso!');
    
    // Criar índice para melhor performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_grupos_ponto_focal_principal 
      ON grupos(ponto_focal_principal);
    `);
    
    console.log('✅ Índice criado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao adicionar coluna ponto_focal_principal:', error);
    throw error;
  }
}

// Executar a migração se o script for chamado diretamente
if (require.main === module) {
  addPontoFocalPrincipalColumn()
    .then(() => {
      console.log('🎉 Migração concluída com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Erro na migração:', error);
      process.exit(1);
    });
}

export { addPontoFocalPrincipalColumn }; 