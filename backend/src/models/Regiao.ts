import { query } from '../config/database';
import { Regiao, CreateRegiaoData, UpdateRegiaoData, StatusItem } from '../types/organizacional';

export class RegiaoModel {
  
  // Criar tabela de regiões
  static async createTable(): Promise<void> {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS regioes (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        descricao TEXT,
        codigo VARCHAR(50) UNIQUE,
        uf VARCHAR(2),
        cidade VARCHAR(255),
        grupo_id INTEGER REFERENCES grupos(id),
        status VARCHAR(20) NOT NULL DEFAULT 'ativo',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER NOT NULL REFERENCES users(id),
        updated_by INTEGER REFERENCES users(id),
        CONSTRAINT regioes_status_check CHECK (status IN ('ativo', 'inativo'))
      );
    `;
    
    await query(createTableQuery);
    
    // Criar índices
    await query('CREATE INDEX IF NOT EXISTS idx_regioes_nome ON regioes(nome);');
    await query('CREATE INDEX IF NOT EXISTS idx_regioes_codigo ON regioes(codigo);');
    await query('CREATE INDEX IF NOT EXISTS idx_regioes_status ON regioes(status);');
    await query('CREATE INDEX IF NOT EXISTS idx_regioes_uf ON regioes(uf);');
    await query('CREATE INDEX IF NOT EXISTS idx_regioes_cidade ON regioes(cidade);');
    await query('CREATE INDEX IF NOT EXISTS idx_regioes_grupo_id ON regioes(grupo_id);');
  }

  // Buscar região por ID
  static async findById(id: number): Promise<Regiao | null> {
    const result = await query(
      'SELECT * FROM regioes WHERE id = $1',
      [id]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Buscar região por código
  static async findByCode(codigo: string): Promise<Regiao | null> {
    const result = await query(
      'SELECT * FROM regioes WHERE codigo = $1',
      [codigo]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Criar nova região
  static async create(regiaoData: CreateRegiaoData, userId: number): Promise<Regiao> {
    const { 
      nome, 
      descricao, 
      codigo, 
      uf,
      cidade,
      grupo_id,
      status = StatusItem.ATIVO
    } = regiaoData;
    
    const result = await query(
      `INSERT INTO regioes (nome, descricao, codigo, uf, cidade, grupo_id, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [nome, descricao, codigo, uf, cidade, grupo_id || null, status, userId]
    );
    
    return result.rows[0];
  }

  // Listar todas as regiões
  static async findAll(): Promise<Regiao[]> {
    const result = await query(
      'SELECT * FROM regioes ORDER BY nome ASC'
    );
    
    return result.rows;
  }

  // Listar regiões ativas
  static async findActive(): Promise<Regiao[]> {
    const result = await query(
      'SELECT * FROM regioes WHERE status = $1 ORDER BY nome ASC',
      [StatusItem.ATIVO]
    );
    
    return result.rows;
  }

  // Buscar regiões por UF
  static async findByUF(uf: string): Promise<Regiao[]> {
    const result = await query(
      'SELECT * FROM regioes WHERE uf = $1 ORDER BY nome ASC',
      [uf]
    );
    
    return result.rows;
  }

  // Buscar regiões por cidade
  static async findByCity(cidade: string): Promise<Regiao[]> {
    const result = await query(
      'SELECT * FROM regioes WHERE cidade ILIKE $1 ORDER BY nome ASC',
      [`%${cidade}%`]
    );
    
    return result.rows;
  }

  // Atualizar região
  static async update(id: number, regiaoData: UpdateRegiaoData, userId: number): Promise<Regiao | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (regiaoData.nome !== undefined) {
      fields.push(`nome = $${paramCount}`);
      values.push(regiaoData.nome);
      paramCount++;
    }

    if (regiaoData.descricao !== undefined) {
      fields.push(`descricao = $${paramCount}`);
      values.push(regiaoData.descricao);
      paramCount++;
    }

    if (regiaoData.codigo !== undefined) {
      fields.push(`codigo = $${paramCount}`);
      values.push(regiaoData.codigo);
      paramCount++;
    }

    if (regiaoData.uf !== undefined) {
      fields.push(`uf = $${paramCount}`);
      values.push(regiaoData.uf);
      paramCount++;
    }

    if (regiaoData.cidade !== undefined) {
      fields.push(`cidade = $${paramCount}`);
      values.push(regiaoData.cidade);
      paramCount++;
    }

    if (regiaoData.grupo_id !== undefined) {
      fields.push(`grupo_id = $${paramCount}`);
      values.push(regiaoData.grupo_id);
      paramCount++;
    }

    if (regiaoData.status !== undefined) {
      fields.push(`status = $${paramCount}`);
      values.push(regiaoData.status);
      paramCount++;
    }

    if (fields.length === 0) {
      return await this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    fields.push(`updated_by = $${paramCount}`);
    values.push(userId);
    paramCount++;

    values.push(id);

    const result = await query(
      `UPDATE regioes SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Deletar região (soft delete - desativar)
  static async delete(id: number, userId: number): Promise<boolean> {
    const result = await query(
      'UPDATE regioes SET status = $1, updated_at = CURRENT_TIMESTAMP, updated_by = $2 WHERE id = $3',
      [StatusItem.INATIVO, userId, id]
    );
    
    return (result.rowCount || 0) > 0;
  }

  // Contar regiões por status
  static async countByStatus(): Promise<{ status: string; count: number }[]> {
    const result = await query(
      'SELECT status, COUNT(*) as count FROM regioes GROUP BY status ORDER BY status'
    );
    
    return result.rows;
  }

  // Listar UFs disponíveis
  static async getAvailableUFs(): Promise<string[]> {
    const result = await query(
      'SELECT DISTINCT uf FROM regioes WHERE uf IS NOT NULL ORDER BY uf'
    );
    
    return result.rows.map(row => row.uf);
  }

  // Verificar se região está sendo usada por empresas
  static async isUsedByCompanies(id: number): Promise<boolean> {
    const result = await query(
      'SELECT COUNT(*) as count FROM empresas WHERE regiao_id = $1',
      [id]
    );
    
    return parseInt(result.rows[0].count) > 0;
  }
} 