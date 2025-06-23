import { query } from '../config/database';

async function addPontoFocalPrincipalToEmpresas() {
  try {
    console.log('🔄 Adicionando coluna ponto_focal_principal à tabela empresas...');
    
    // Adicionar a coluna ponto_focal_principal
    await query(`
      ALTER TABLE empresas 
      ADD COLUMN IF NOT EXISTS ponto_focal_principal BOOLEAN DEFAULT false;
    `);
    
    console.log('✅ Coluna ponto_focal_principal adicionada à tabela empresas com sucesso!');
    
    // Criar índice para melhor performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_empresas_ponto_focal_principal 
      ON empresas(ponto_focal_principal);
    `);
    
    console.log('✅ Índice criado com sucesso!');
    console.log('🎉 Migração da tabela empresas concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao adicionar coluna ponto_focal_principal à tabela empresas:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

// Executar migração
addPontoFocalPrincipalToEmpresas(); 