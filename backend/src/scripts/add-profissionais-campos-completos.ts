import { pool } from '../config/database';

const addProfissionaisCamposCompletos = async () => {
  try {
    console.log('Adicionando campos faltantes na tabela profissionais...');
    
    // Adicionar campos de dados cadastrais
    await pool.query(`
      ALTER TABLE profissionais
      ADD COLUMN IF NOT EXISTS nacionalidade VARCHAR(100),
      ADD COLUMN IF NOT EXISTS reg_conselho VARCHAR(50),
      ADD COLUMN IF NOT EXISTS uf_conselho VARCHAR(2),
      ADD COLUMN IF NOT EXISTS reg_mte VARCHAR(50);
    `);
    console.log('✓ Campos de dados cadastrais adicionados');

    // Adicionar campos de endereço
    await pool.query(`
      ALTER TABLE profissionais
      ADD COLUMN IF NOT EXISTS cep VARCHAR(10),
      ADD COLUMN IF NOT EXISTS tipo_logradouro VARCHAR(50),
      ADD COLUMN IF NOT EXISTS logradouro VARCHAR(255),
      ADD COLUMN IF NOT EXISTS numero VARCHAR(20),
      ADD COLUMN IF NOT EXISTS complemento VARCHAR(100),
      ADD COLUMN IF NOT EXISTS bairro VARCHAR(100),
      ADD COLUMN IF NOT EXISTS cidade VARCHAR(100),
      ADD COLUMN IF NOT EXISTS uf_endereco VARCHAR(2);
    `);
    console.log('✓ Campos de endereço adicionados');

    // Adicionar campos de contato
    await pool.query(`
      ALTER TABLE profissionais
      ADD COLUMN IF NOT EXISTS ddd VARCHAR(3);
    `);
    console.log('✓ Campo DDD adicionado');

    // Adicionar campos de informações adicionais
    await pool.query(`
      ALTER TABLE profissionais
      ADD COLUMN IF NOT EXISTS observacao TEXT,
      ADD COLUMN IF NOT EXISTS agendamento_horario BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS profissional_externo BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS assinatura_digital TEXT,
      ADD COLUMN IF NOT EXISTS certificado_digital TEXT;
    `);
    console.log('✓ Campos de informações adicionais adicionados');

    // Alterar campo situacao/status para aceitar tanto 'ativo'/'inativo' quanto 'Ativo'/'Inativo'
    await pool.query(`
      ALTER TABLE profissionais
      DROP CONSTRAINT IF EXISTS profissionais_status_check;
    `);
    
    await pool.query(`
      ALTER TABLE profissionais
      ADD CONSTRAINT profissionais_status_check 
      CHECK (status IN ('ativo', 'inativo', 'Ativo', 'Inativo'));
    `);
    console.log('✓ Constraint de status atualizada');

    // Adicionar coluna situacao como alias para status (para compatibilidade)
    await pool.query(`
      ALTER TABLE profissionais
      ADD COLUMN IF NOT EXISTS situacao VARCHAR(20) 
      GENERATED ALWAYS AS (
        CASE 
          WHEN status IN ('ativo', 'Ativo') THEN 'ativo'
          WHEN status IN ('inativo', 'Inativo') THEN 'inativo'
          ELSE 'ativo'
        END
      ) STORED;
    `).catch(async (err) => {
      // Se falhar (PostgreSQL < 12), criar como coluna normal
      console.log('Criando coluna situacao como coluna normal...');
      await pool.query(`
        ALTER TABLE profissionais
        ADD COLUMN IF NOT EXISTS situacao VARCHAR(20) DEFAULT 'ativo';
      `);
    });
    console.log('✓ Coluna situacao adicionada');

    // Criar índices para melhor performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_profissionais_cep ON profissionais(cep);
      CREATE INDEX IF NOT EXISTS idx_profissionais_cidade ON profissionais(cidade);
      CREATE INDEX IF NOT EXISTS idx_profissionais_uf_endereco ON profissionais(uf_endereco);
    `);
    console.log('✓ Índices criados');

    console.log('\n✅ Migração concluída com sucesso!');
    console.log('Todos os campos foram adicionados à tabela profissionais.');
    
  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    throw error;
  } finally {
    await pool.end();
    process.exit();
  }
};

// Executar a migração
addProfissionaisCamposCompletos().catch(console.error); 