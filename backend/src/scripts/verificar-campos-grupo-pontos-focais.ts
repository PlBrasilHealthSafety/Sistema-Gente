import { query } from '../config/database';

async function verificarCamposGrupoPontosFocais() {
  try {
    console.log('🔍 Verificando estrutura da tabela grupo_pontos_focais...');
    
    // Verificar se a tabela existe
    const checkTableQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name = 'grupo_pontos_focais';
    `;
    
    const tableExists = await query(checkTableQuery);
    
    if (tableExists.rows.length === 0) {
      console.log('❌ Tabela grupo_pontos_focais não existe!');
      return;
    }
    
    console.log('✅ Tabela grupo_pontos_focais existe');
    
    // Verificar colunas da tabela
    const checkColumnsQuery = `
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'grupo_pontos_focais'
      ORDER BY ordinal_position;
    `;
    
    const columns = await query(checkColumnsQuery);
    
    console.log('\n📋 Colunas da tabela grupo_pontos_focais:');
    columns.rows.forEach(col => {
      console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'}`);
    });
    
    // Verificar especificamente os novos campos
    const newFields = ['cargo', 'telefone', 'email'];
    console.log('\n🎯 Verificando campos específicos:');
    
    newFields.forEach(field => {
      const exists = columns.rows.some(col => col.column_name === field);
      console.log(`  - ${field}: ${exists ? '✅ EXISTE' : '❌ NÃO EXISTE'}`);
    });
    
    // Verificar dados existentes
    const countQuery = 'SELECT COUNT(*) as count FROM grupo_pontos_focais;';
    const countResult = await query(countQuery);
    console.log(`\n📊 Total de registros na tabela: ${countResult.rows[0].count}`);
    
    if (parseInt(countResult.rows[0].count) > 0) {
      const sampleQuery = 'SELECT * FROM grupo_pontos_focais LIMIT 3;';
      const sampleResult = await query(sampleQuery);
      
      console.log('\n🔍 Amostra de dados:');
      sampleResult.rows.forEach((row, index) => {
        console.log(`  Registro ${index + 1}:`, {
          id: row.id,
          grupo_id: row.grupo_id,
          nome: row.nome,
          cargo: row.cargo,
          telefone: row.telefone,
          email: row.email,
          descricao: row.descricao,
          is_principal: row.is_principal
        });
      });
    }
    
    console.log('\n🎉 Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante a verificação:', error);
    throw error;
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  verificarCamposGrupoPontosFocais()
    .then(() => {
      console.log('✅ Verificação executada com sucesso');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro na verificação:', error);
      process.exit(1);
    });
}

export default verificarCamposGrupoPontosFocais; 