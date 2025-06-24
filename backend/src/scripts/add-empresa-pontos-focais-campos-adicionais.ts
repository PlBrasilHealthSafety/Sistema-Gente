import { query } from '../config/database';

async function addCamposAdicionaisEmpresaPontosFocais() {
  console.log('🔄 Iniciando migração: Adicionando campos cargo, telefone e email à tabela empresa_pontos_focais...');
  
  try {
    // Verificar se os campos já existem
    const checkResult = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'empresa_pontos_focais' 
      AND column_name IN ('cargo', 'telefone', 'email');
    `);
    
    const existingColumns = checkResult.rows.map(row => row.column_name);
    
    // Adicionar campo cargo se não existir
    if (!existingColumns.includes('cargo')) {
      console.log('✅ Adicionando campo cargo...');
      await query(`
        ALTER TABLE empresa_pontos_focais 
        ADD COLUMN cargo VARCHAR(255)
      `);
      console.log('✅ Campo cargo adicionado com sucesso!');
    } else {
      console.log('ℹ️ Campo cargo já existe.');
    }
    
    // Adicionar campo telefone se não existir
    if (!existingColumns.includes('telefone')) {
      console.log('✅ Adicionando campo telefone...');
      await query(`
        ALTER TABLE empresa_pontos_focais 
        ADD COLUMN telefone VARCHAR(20)
      `);
      console.log('✅ Campo telefone adicionado com sucesso!');
    } else {
      console.log('ℹ️ Campo telefone já existe.');
    }
    
    // Adicionar campo email se não existir
    if (!existingColumns.includes('email')) {
      console.log('✅ Adicionando campo email...');
      await query(`
        ALTER TABLE empresa_pontos_focais 
        ADD COLUMN email VARCHAR(255)
      `);
      console.log('✅ Campo email adicionado com sucesso!');
    } else {
      console.log('ℹ️ Campo email já existe.');
    }
    
    console.log('✅ Migração concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    throw error;
  }
}

// Executar a migração
addCamposAdicionaisEmpresaPontosFocais()
  .then(() => {
    console.log('✅ Script executado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Erro ao executar script:', error);
    process.exit(1);
  }); 