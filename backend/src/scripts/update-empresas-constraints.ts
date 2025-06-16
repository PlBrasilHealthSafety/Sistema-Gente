import { query } from '../config/database';

async function updateEmpresasConstraints() {
  try {
    console.log('🔄 Atualizando constraints da tabela empresas...');

    // Verificar se há empresas com dados inválidos antes de aplicar as constraints
    console.log('📋 Verificando dados existentes...');
    
    const invalidEmpresas = await query(`
      SELECT id, razao_social, nome_fantasia, grupo_id, regiao_id 
      FROM empresas 
      WHERE nome_fantasia IS NULL 
         OR nome_fantasia = '' 
         OR grupo_id IS NULL 
         OR regiao_id IS NULL
    `);

    if (invalidEmpresas.rows.length > 0) {
      console.log(`⚠️ Encontradas ${invalidEmpresas.rows.length} empresas com dados inválidos. Corrigindo...`);
      
      for (const empresa of invalidEmpresas.rows) {
        // Corrigir nome_fantasia se estiver vazio
        if (!empresa.nome_fantasia || empresa.nome_fantasia.trim() === '') {
          await query(
            'UPDATE empresas SET nome_fantasia = razao_social WHERE id = $1',
            [empresa.id]
          );
          console.log(`✅ Corrigido nome_fantasia para empresa ID ${empresa.id}`);
        }

        // Corrigir grupo_id se estiver nulo (atribuir ao primeiro grupo ativo)
        if (!empresa.grupo_id) {
          const firstGroup = await query('SELECT id FROM grupos WHERE status = $1 LIMIT 1', ['ativo']);
          if (firstGroup.rows.length > 0) {
            await query(
              'UPDATE empresas SET grupo_id = $1 WHERE id = $2',
              [firstGroup.rows[0].id, empresa.id]
            );
            console.log(`✅ Atribuído grupo ${firstGroup.rows[0].id} para empresa ID ${empresa.id}`);
          }
        }

        // Corrigir regiao_id se estiver nulo (atribuir à primeira região ativa)
        if (!empresa.regiao_id) {
          const firstRegion = await query('SELECT id FROM regioes WHERE status = $1 LIMIT 1', ['ativo']);
          if (firstRegion.rows.length > 0) {
            await query(
              'UPDATE empresas SET regiao_id = $1 WHERE id = $2',
              [firstRegion.rows[0].id, empresa.id]
            );
            console.log(`✅ Atribuída região ${firstRegion.rows[0].id} para empresa ID ${empresa.id}`);
          }
        }
      }
    }

    // Aplicar as novas constraints
    console.log('🔧 Aplicando constraints...');

    // Atualizar nome_fantasia para NOT NULL
    await query('ALTER TABLE empresas ALTER COLUMN nome_fantasia SET NOT NULL;');
    console.log('✅ Constraint NOT NULL aplicada para nome_fantasia');

    // Atualizar grupo_id para NOT NULL
    await query('ALTER TABLE empresas ALTER COLUMN grupo_id SET NOT NULL;');
    console.log('✅ Constraint NOT NULL aplicada para grupo_id');

    // Atualizar regiao_id para NOT NULL
    await query('ALTER TABLE empresas ALTER COLUMN regiao_id SET NOT NULL;');
    console.log('✅ Constraint NOT NULL aplicada para regiao_id');

    // Remover e recriar foreign keys com RESTRICT
    console.log('🔗 Atualizando foreign keys...');
    
    // Primeiro, obter os nomes das constraints existentes
    const constraints = await query(`
      SELECT constraint_name 
      FROM information_schema.table_constraints 
      WHERE table_name = 'empresas' 
        AND constraint_type = 'FOREIGN KEY'
        AND (constraint_name LIKE '%grupo%' OR constraint_name LIKE '%regiao%')
    `);

    // Remover constraints existentes
    for (const constraint of constraints.rows) {
      await query(`ALTER TABLE empresas DROP CONSTRAINT IF EXISTS ${constraint.constraint_name};`);
      console.log(`🗑️ Removida constraint ${constraint.constraint_name}`);
    }

    // Recriar foreign keys com RESTRICT
    await query(`
      ALTER TABLE empresas 
      ADD CONSTRAINT empresas_grupo_id_fkey 
      FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE RESTRICT;
    `);
    console.log('✅ Foreign key grupo_id recriada com RESTRICT');

    await query(`
      ALTER TABLE empresas 
      ADD CONSTRAINT empresas_regiao_id_fkey 
      FOREIGN KEY (regiao_id) REFERENCES regioes(id) ON DELETE RESTRICT;
    `);
    console.log('✅ Foreign key regiao_id recriada com RESTRICT');

    console.log('✅ Constraints atualizadas com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao atualizar constraints:', error);
    throw error;
  }
}

// Executar atualização se o script for chamado diretamente
if (require.main === module) {
  updateEmpresasConstraints()
    .then(() => {
      console.log('🎉 Atualização finalizada!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Falha na atualização:', error);
      process.exit(1);
    });
}

export { updateEmpresasConstraints }; 