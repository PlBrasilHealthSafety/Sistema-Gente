import { pool } from '../config/database';

async function createCredenciadosTable() {
  try {
    // Criar tabela de credenciados
    await pool.query(`
      CREATE TABLE IF NOT EXISTS credenciados (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        cnpj VARCHAR(18) UNIQUE NOT NULL,
        telefone VARCHAR(20) NOT NULL,
        email VARCHAR(255) NOT NULL,
        site VARCHAR(255),
        
        -- Endereço
        cep VARCHAR(9) NOT NULL,
        tipo_logradouro VARCHAR(50),
        logradouro VARCHAR(255) NOT NULL,
        numero VARCHAR(20) NOT NULL,
        complemento VARCHAR(255),
        uf CHAR(2) NOT NULL,
        cidade VARCHAR(100) NOT NULL,
        bairro VARCHAR(100) NOT NULL,
        
        -- Informações complementares
        observacoes_exames TEXT,
        observacoes_gerais TEXT,
        utilizar_percentual BOOLEAN DEFAULT false,
        
        -- Controle
        status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Tabela credenciados criada com sucesso!');
    
    // Criar tabela de horários de funcionamento
    await pool.query(`
      CREATE TABLE IF NOT EXISTS credenciados_horarios (
        id SERIAL PRIMARY KEY,
        credenciado_id INTEGER NOT NULL REFERENCES credenciados(id) ON DELETE CASCADE,
        dia_semana VARCHAR(20) NOT NULL CHECK (dia_semana IN ('segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo')),
        ativo BOOLEAN DEFAULT false,
        horario_inicio TIME,
        horario_fim TIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(credenciado_id, dia_semana)
      )
    `);
    
    console.log('✅ Tabela credenciados_horarios criada com sucesso!');
    
    // Criar índices
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_credenciados_cnpj ON credenciados(cnpj);
      CREATE INDEX IF NOT EXISTS idx_credenciados_nome ON credenciados(nome);
      CREATE INDEX IF NOT EXISTS idx_credenciados_status ON credenciados(status);
      CREATE INDEX IF NOT EXISTS idx_credenciados_cidade_uf ON credenciados(cidade, uf);
      CREATE INDEX IF NOT EXISTS idx_credenciados_horarios_credenciado ON credenciados_horarios(credenciado_id);
    `);
    
    console.log('✅ Índices criados com sucesso!');
    
    // Criar trigger para atualizar updated_at
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
      
      DROP TRIGGER IF EXISTS update_credenciados_updated_at ON credenciados;
      CREATE TRIGGER update_credenciados_updated_at 
        BEFORE UPDATE ON credenciados 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
        
      DROP TRIGGER IF EXISTS update_credenciados_horarios_updated_at ON credenciados_horarios;
      CREATE TRIGGER update_credenciados_horarios_updated_at 
        BEFORE UPDATE ON credenciados_horarios 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
    `);
    
    console.log('✅ Triggers criados com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao criar tabelas de credenciados:', error);
    throw error;
  }
}

// Executar se for chamado diretamente
if (require.main === module) {
  createCredenciadosTable()
    .then(() => {
      console.log('✅ Migração de credenciados concluída!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro na migração:', error);
      process.exit(1);
    });
}

export default createCredenciadosTable; 