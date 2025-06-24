import { query } from '../config/database';

async function addGrupoPontosFocaisCamposAdicionais() {
  try {
    console.log('🔄 Iniciando migração: Adicionando campos cargo, telefone e email à tabela grupo_pontos_focais...');
    
    // Verificar se as colunas já existem
    const checkColumnsQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'grupo_pontos_focais' 
      AND column_name IN ('cargo', 'telefone', 'email');
    `;
    
    const existingColumns = await query(checkColumnsQuery);
    const existingColumnNames = existingColumns.rows.map(row => row.column_name);
    
    console.log('Colunas existentes:', existingColumnNames);
    
    // Adicionar coluna cargo se não existir
    if (!existingColumnNames.includes('cargo')) {
      await query('ALTER TABLE grupo_pontos_focais ADD COLUMN cargo VARCHAR(255);');
      console.log('✅ Coluna cargo adicionada');
    } else {
      console.log('ℹ️ Coluna cargo já existe');
    }
    
    // Adicionar coluna telefone se não existir
    if (!existingColumnNames.includes('telefone')) {
      await query('ALTER TABLE grupo_pontos_focais ADD COLUMN telefone VARCHAR(20);');
      console.log('✅ Coluna telefone adicionada');
    } else {
      console.log('ℹ️ Coluna telefone já existe');
    }
    
    // Adicionar coluna email se não existir
    if (!existingColumnNames.includes('email')) {
      await query('ALTER TABLE grupo_pontos_focais ADD COLUMN email VARCHAR(255);');
      console.log('✅ Coluna email adicionada');
    } else {
      console.log('ℹ️ Coluna email já existe');
    }
    
    console.log('🎉 Migração concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    throw error;
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  addGrupoPontosFocaisCamposAdicionais()
    .then(() => {
      console.log('✅ Migração executada com sucesso');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro na migração:', error);
      process.exit(1);
    });
}

export default addGrupoPontosFocaisCamposAdicionais; 