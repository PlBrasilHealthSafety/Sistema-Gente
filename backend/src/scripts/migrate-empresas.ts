import { query } from '../config/database';

async function migrateEmpresasTable() {
  try {
    console.log('🔄 Iniciando migração da tabela empresas...');

    // Criar backup da tabela atual
    console.log('📋 Criando backup da tabela atual...');
    await query(`
      CREATE TABLE IF NOT EXISTS empresas_backup AS 
      SELECT * FROM empresas WHERE 1=2;
    `);
    
    await query(`
      INSERT INTO empresas_backup 
      SELECT * FROM empresas;
    `);

    // Remover a tabela atual
    console.log('🗑️ Removendo tabela atual...');
    await query('DROP TABLE IF EXISTS empresas;');

    // Recriar a tabela com a nova estrutura
    console.log('🏗️ Recriando tabela com nova estrutura...');
    await query(`
      CREATE TABLE empresas (
        id SERIAL PRIMARY KEY,
        codigo VARCHAR(20) UNIQUE,
        razao_social VARCHAR(255) NOT NULL,
        nome_fantasia VARCHAR(255),
        tipo_estabelecimento VARCHAR(20) NOT NULL DEFAULT 'MATRIZ',
        tipo_inscricao VARCHAR(10),
        numero_inscricao VARCHAR(20),
        cno VARCHAR(20),
        cnae_descricao TEXT,
        risco VARCHAR(50),
        endereco_cep VARCHAR(10),
        endereco_logradouro VARCHAR(255),
        endereco_numero VARCHAR(20),
        endereco_complemento VARCHAR(100),
        endereco_bairro VARCHAR(100),
        endereco_cidade VARCHAR(100),
        endereco_uf VARCHAR(2),
        contato_nome VARCHAR(255),
        contato_telefone VARCHAR(20),
        contato_email VARCHAR(255),
        representante_legal_nome VARCHAR(255),
        representante_legal_cpf VARCHAR(14),
        observacoes TEXT,
        observacoes_os TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'ATIVO',
        grupo_id INTEGER REFERENCES grupos(id) ON DELETE SET NULL,
        regiao_id INTEGER REFERENCES regioes(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER NOT NULL REFERENCES users(id),
        updated_by INTEGER REFERENCES users(id),
        CONSTRAINT empresas_status_check CHECK (status IN ('ATIVO', 'INATIVO')),
        CONSTRAINT empresas_tipo_estabelecimento_check CHECK (tipo_estabelecimento IN ('MATRIZ', 'FILIAL')),
        CONSTRAINT empresas_tipo_inscricao_check CHECK (tipo_inscricao IN ('cnpj', 'cpf') OR tipo_inscricao IS NULL)
      );
    `);

    // Criar índices
    console.log('📊 Criando índices...');
    await query('CREATE INDEX IF NOT EXISTS idx_empresas_codigo ON empresas(codigo);');
    await query('CREATE INDEX IF NOT EXISTS idx_empresas_razao_social ON empresas(razao_social);');
    await query('CREATE INDEX IF NOT EXISTS idx_empresas_nome_fantasia ON empresas(nome_fantasia);');
    await query('CREATE INDEX IF NOT EXISTS idx_empresas_numero_inscricao ON empresas(numero_inscricao);');
    await query('CREATE INDEX IF NOT EXISTS idx_empresas_tipo_inscricao ON empresas(tipo_inscricao);');
    await query('CREATE INDEX IF NOT EXISTS idx_empresas_status ON empresas(status);');
    await query('CREATE INDEX IF NOT EXISTS idx_empresas_grupo ON empresas(grupo_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_empresas_regiao ON empresas(regiao_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_empresas_endereco_uf ON empresas(endereco_uf);');
    await query('CREATE INDEX IF NOT EXISTS idx_empresas_endereco_cidade ON empresas(endereco_cidade);');

    // Migrar dados do backup se existir algum
    console.log('📤 Verificando se há dados para migrar...');
    const backupCount = await query('SELECT COUNT(*) FROM empresas_backup;');
    
    if (parseInt(backupCount.rows[0].count) > 0) {
      console.log('🔄 Migrando dados existentes...');
      
      // Migrar dados antigos para nova estrutura
      await query(`
        INSERT INTO empresas (
          codigo, razao_social, nome_fantasia, tipo_estabelecimento,
          tipo_inscricao, numero_inscricao, status, grupo_id, regiao_id,
          created_at, updated_at, created_by, updated_by
        )
        SELECT 
          'EMP' || LPAD(ROW_NUMBER() OVER (ORDER BY id)::text, 4, '0') as codigo,
          razao_social,
          nome_fantasia,
          'MATRIZ' as tipo_estabelecimento,
          CASE 
            WHEN LENGTH(REPLACE(REPLACE(REPLACE(cnpj, '.', ''), '/', ''), '-', '')) = 14 THEN 'cnpj'
            WHEN LENGTH(REPLACE(REPLACE(REPLACE(cnpj, '.', ''), '/', ''), '-', '')) = 11 THEN 'cpf'
            ELSE NULL
          END as tipo_inscricao,
          cnpj as numero_inscricao,
          CASE 
            WHEN status = 'ativo' THEN 'ATIVO'
            WHEN status = 'inativo' THEN 'INATIVO'
            ELSE 'ATIVO'
          END as status,
          grupo_id,
          regiao_id,
          created_at,
          updated_at,
          created_by,
          updated_by
        FROM empresas_backup
        WHERE cnpj IS NOT NULL AND cnpj != '';
      `);
      
      console.log(`✅ ${backupCount.rows[0].count} registros migrados com sucesso!`);
    }

    // Remover tabela de backup
    console.log('🗑️ Removendo tabela de backup...');
    await query('DROP TABLE IF EXISTS empresas_backup;');

    console.log('✅ Migração concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    
    // Tentar restaurar do backup em caso de erro
    try {
      console.log('🔄 Tentando restaurar do backup...');
      await query('DROP TABLE IF EXISTS empresas;');
      await query('ALTER TABLE empresas_backup RENAME TO empresas;');
      console.log('✅ Backup restaurado com sucesso!');
    } catch (restoreError) {
      console.error('❌ Erro ao restaurar backup:', restoreError);
    }
    
    throw error;
  }
}

// Executar migração se o script for chamado diretamente
if (require.main === module) {
  migrateEmpresasTable()
    .then(() => {
      console.log('🎉 Migração finalizada!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Falha na migração:', error);
      process.exit(1);
    });
}

export { migrateEmpresasTable }; 