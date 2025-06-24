import { query } from '../config/database';

/**
 * Script para adicionar campo cnae_codigo à tabela empresas
 * Separa o campo cnae_descricao em cnae_codigo e cnae_descricao
 */

async function addCnaeCodigoField() {
  try {
    console.log('🔄 Iniciando migração para separar CNAE código e descrição...');
    
    // 1. Adicionar nova coluna cnae_codigo
    console.log('📝 Adicionando coluna cnae_codigo...');
    await query(`
      ALTER TABLE empresas 
      ADD COLUMN IF NOT EXISTS cnae_codigo VARCHAR(7)
    `);
    
    // 2. Verificar se existem dados para migrar
    const empresasComCnae = await query(`
      SELECT id, cnae_descricao 
      FROM empresas 
      WHERE cnae_descricao IS NOT NULL 
      AND cnae_descricao != ''
    `);
    
    console.log(`📊 Encontradas ${empresasComCnae.rows.length} empresas com CNAE para migrar`);
    
    // 3. Migrar dados existentes (assumindo formato "CODIGO - DESCRIÇÃO" ou "CODIGO DESCRIÇÃO")
    for (const empresa of empresasComCnae.rows) {
      const cnaeCompleto = empresa.cnae_descricao;
      let codigo = '';
      let descricao = cnaeCompleto;
      
      // Tentar extrair código CNAE (formato comum: 1234567 ou 1234-5/67)
      const matches = cnaeCompleto.match(/^(\d{7}|\d{4}-?\d\/?\d{2})\s*[-\s]\s*(.+)$/);
      if (matches) {
        codigo = matches[1].replace(/[^\d]/g, ''); // Remove caracteres não numéricos
        descricao = matches[2].trim();
      } else {
        // Se não conseguir separar, tentar pegar apenas 7 números no início
        const codeMatch = cnaeCompleto.match(/^(\d{7})/);
        if (codeMatch) {
          codigo = codeMatch[1];
          descricao = cnaeCompleto.replace(codigo, '').replace(/^[-\s]+/, '').trim();
        }
      }
      
      // Garantir que o código tenha exatamente 7 dígitos
      if (codigo && codigo.length === 7) {
        await query(`
          UPDATE empresas 
          SET cnae_codigo = $1, cnae_descricao = $2 
          WHERE id = $3
        `, [codigo, descricao, empresa.id]);
        
        console.log(`✅ Empresa ${empresa.id}: "${codigo}" - "${descricao}"`);
      } else {
        console.log(`⚠️  Empresa ${empresa.id}: Não foi possível separar CNAE: "${cnaeCompleto}"`);
      }
    }
    
    // 4. Criar índice para o novo campo
    console.log('🔍 Criando índice para cnae_codigo...');
    await query(`
      CREATE INDEX IF NOT EXISTS idx_empresas_cnae_codigo 
      ON empresas(cnae_codigo)
    `);
    
    // 5. Mostrar estatísticas finais
    const stats = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(cnae_codigo) as com_codigo,
        COUNT(cnae_descricao) as com_descricao
      FROM empresas
    `);
    
    console.log('📈 Estatísticas finais:');
    console.log(`   Total de empresas: ${stats.rows[0].total}`);
    console.log(`   Com código CNAE: ${stats.rows[0].com_codigo}`);
    console.log(`   Com descrição CNAE: ${stats.rows[0].com_descricao}`);
    
    console.log('✅ Migração concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    throw error;
  }
}

// Executar migração se chamado diretamente
if (require.main === module) {
  addCnaeCodigoField()
    .then(() => {
      console.log('🎉 Script executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Falha na execução:', error);
      process.exit(1);
    });
}

export { addCnaeCodigoField };