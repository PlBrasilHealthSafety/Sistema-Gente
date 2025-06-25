import { pool } from '../config/database';

const createProfissionaisTable = async () => {
  try {
    console.log('Criando tabela profissionais...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS profissionais (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        cpf VARCHAR(14) UNIQUE NOT NULL,
        rg VARCHAR(20),
        data_nascimento DATE,
        nis VARCHAR(11),
        categoria VARCHAR(100) NOT NULL,
        sigla_conselho VARCHAR(20),
        numero_conselho VARCHAR(50),
        telefone VARCHAR(15),
        celular VARCHAR(15),
        email VARCHAR(255),
        observacoes TEXT,
        externo BOOLEAN DEFAULT false,
        ofensor VARCHAR(255),
        clinica VARCHAR(255),
        status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
        created_by INTEGER REFERENCES users(id),
        updated_by INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Criar índices
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_profissionais_cpf ON profissionais(cpf);
      CREATE INDEX IF NOT EXISTS idx_profissionais_nome ON profissionais(nome);
      CREATE INDEX IF NOT EXISTS idx_profissionais_status ON profissionais(status);
      CREATE INDEX IF NOT EXISTS idx_profissionais_categoria ON profissionais(categoria);
    `);

    // Criar trigger para atualizar updated_at
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_profissionais_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await pool.query(`
      DROP TRIGGER IF EXISTS update_profissionais_updated_at ON profissionais;
      CREATE TRIGGER update_profissionais_updated_at
      BEFORE UPDATE ON profissionais
      FOR EACH ROW
      EXECUTE FUNCTION update_profissionais_updated_at();
    `);

    console.log('Tabela profissionais criada com sucesso!');
  } catch (error) {
    console.error('Erro ao criar tabela profissionais:', error);
  } finally {
    process.exit();
  }
};

createProfissionaisTable(); 