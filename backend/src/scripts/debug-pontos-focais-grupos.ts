import { query } from '../config/database';

async function debugPontosFocaisGrupos() {
  try {
    console.log('🔍 Debug completo dos pontos focais de grupos...');
    
    // Buscar todos os grupos
    const gruposQuery = `
      SELECT id, nome, status, 
             ponto_focal_nome, ponto_focal_descricao, ponto_focal_observacoes, ponto_focal_principal
      FROM grupos 
      ORDER BY id;
    `;
    
    const grupos = await query(gruposQuery);
    console.log(`\n📊 Total de grupos: ${grupos.rows.length}`);
    
    for (const grupo of grupos.rows) {
      console.log(`\n=== GRUPO: ${grupo.nome} (ID: ${grupo.id}) ===`);
      console.log(`Status: ${grupo.status}`);
      
      // Campos antigos (compatibilidade)
      console.log('\n📋 Campos antigos (compatibilidade):');
      console.log(`  - ponto_focal_nome: ${grupo.ponto_focal_nome || 'NULL'}`);
      console.log(`  - ponto_focal_descricao: ${grupo.ponto_focal_descricao || 'NULL'}`);
      console.log(`  - ponto_focal_observacoes: ${grupo.ponto_focal_observacoes || 'NULL'}`);
      console.log(`  - ponto_focal_principal: ${grupo.ponto_focal_principal || 'NULL'}`);
      
      // Buscar pontos focais da nova estrutura
      const pontosFocaisQuery = `
        SELECT * FROM grupo_pontos_focais 
        WHERE grupo_id = $1 
        ORDER BY ordem ASC, is_principal DESC;
      `;
      
      const pontosFocais = await query(pontosFocaisQuery, [grupo.id]);
      
      console.log(`\n🎯 Pontos focais (nova estrutura): ${pontosFocais.rows.length} encontrado(s)`);
      
      pontosFocais.rows.forEach((pf, index) => {
        console.log(`\n  Ponto Focal ${index + 1}:`);
        console.log(`    - ID: ${pf.id}`);
        console.log(`    - Nome: ${pf.nome || 'NULL'}`);
        console.log(`    - Cargo: ${pf.cargo || 'NULL'}`);
        console.log(`    - Telefone: ${pf.telefone || 'NULL'}`);
        console.log(`    - Email: ${pf.email || 'NULL'}`);
        console.log(`    - Descrição: ${pf.descricao || 'NULL'}`);
        console.log(`    - Observações: ${pf.observacoes || 'NULL'}`);
        console.log(`    - Principal: ${pf.is_principal}`);
        console.log(`    - Ordem: ${pf.ordem}`);
        console.log(`    - Criado em: ${pf.created_at}`);
        console.log(`    - Atualizado em: ${pf.updated_at}`);
      });
    }
    
    console.log('\n🎉 Debug concluído!');
    
  } catch (error) {
    console.error('❌ Erro durante o debug:', error);
    throw error;
  }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
  debugPontosFocaisGrupos()
    .then(() => {
      console.log('✅ Debug executado com sucesso');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no debug:', error);
      process.exit(1);
    });
}

export default debugPontosFocaisGrupos; 