import { query } from '../config/database';

async function addPontoFocalColumns() {
  try {
    console.log('Iniciando migração para adicionar colunas de ponto focal...');

    // Adicionar colunas na tabela grupos
    console.log('Adicionando colunas de ponto focal na tabela grupos...');
    await query(`
      ALTER TABLE grupos 
      ADD COLUMN IF NOT EXISTS ponto_focal_nome VARCHAR(255),
      ADD COLUMN IF NOT EXISTS ponto_focal_descricao TEXT,
      ADD COLUMN IF NOT EXISTS ponto_focal_observacoes TEXT;
    `);

    // Adicionar colunas na tabela empresas
    console.log('Adicionando colunas de ponto focal na tabela empresas...');
    await query(`
      ALTER TABLE empresas 
      ADD COLUMN IF NOT EXISTS ponto_focal_nome VARCHAR(255),
      ADD COLUMN IF NOT EXISTS ponto_focal_descricao TEXT,
      ADD COLUMN IF NOT EXISTS ponto_focal_observacoes TEXT;
    `);

    console.log('Migração concluída com sucesso!');
    console.log('Colunas de ponto focal (nome, descrição e observações) adicionadas às tabelas grupos e empresas.');

  } catch (error) {
    console.error('Erro durante a migração:', error);
    throw error;
  }
}

// Executar a migração se o script for chamado diretamente
if (require.main === module) {
  addPontoFocalColumns()
    .then(() => {
      console.log('Script de migração executado com sucesso');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Erro ao executar script de migração:', error);
      process.exit(1);
    });
}

export { addPontoFocalColumns }; 