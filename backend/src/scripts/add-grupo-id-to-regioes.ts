#!/usr/bin/env ts-node

import { query } from '../config/database';

async function addGrupoIdToRegioes() {
  try {
    console.log('🔧 Iniciando migração: Adicionando coluna grupo_id à tabela regioes...');
    
    // Verificar se a coluna já existe
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'regioes' AND column_name = 'grupo_id';
    `;
    
    const checkResult = await query(checkColumnQuery);
    
    if (checkResult.rows.length > 0) {
      console.log('✅ Coluna grupo_id já existe na tabela regioes');
      return;
    }
    
    // Adicionar a coluna grupo_id
    const addColumnQuery = `
      ALTER TABLE regioes 
      ADD COLUMN grupo_id INTEGER REFERENCES grupos(id);
    `;
    
    await query(addColumnQuery);
    console.log('✅ Coluna grupo_id adicionada com sucesso');
    
    // Criar índice para a nova coluna
    const addIndexQuery = `
      CREATE INDEX IF NOT EXISTS idx_regioes_grupo_id ON regioes(grupo_id);
    `;
    
    await query(addIndexQuery);
    console.log('✅ Índice idx_regioes_grupo_id criado com sucesso');
    
    console.log('🎉 Migração concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  addGrupoIdToRegioes()
    .then(() => {
      console.log('✅ Script executado com sucesso');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no script:', error);
      process.exit(1);
    });
}

export { addGrupoIdToRegioes }; 