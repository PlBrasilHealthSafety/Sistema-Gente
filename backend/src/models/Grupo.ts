import { query } from '../config/database';
import { Grupo, CreateGrupoData, UpdateGrupoData, StatusItem, GrupoWithHierarchy } from '../types/organizacional';

export class GrupoModel {
  
  // Criar tabela de grupos
  static async createTable(): Promise<void> {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS grupos (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        descricao TEXT,
        codigo VARCHAR(50) UNIQUE,
        status VARCHAR(20) NOT NULL DEFAULT 'ativo',
        grupo_pai_id INTEGER REFERENCES grupos(id) ON DELETE SET NULL,
        ponto_focal_nome VARCHAR(255),
        ponto_focal_descricao TEXT,
        ponto_focal_observacoes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER NOT NULL REFERENCES users(id),
        updated_by INTEGER REFERENCES users(id),
        CONSTRAINT grupos_status_check CHECK (status IN ('ativo', 'inativo'))
      );
    `;
    
    await query(createTableQuery);
    
    // Criar índices
    await query('CREATE INDEX IF NOT EXISTS idx_grupos_nome ON grupos(nome);');
    await query('CREATE INDEX IF NOT EXISTS idx_grupos_codigo ON grupos(codigo);');
    await query('CREATE INDEX IF NOT EXISTS idx_grupos_status ON grupos(status);');
    await query('CREATE INDEX IF NOT EXISTS idx_grupos_pai ON grupos(grupo_pai_id);');
  }

  // Buscar grupo por ID
  static async findById(id: number): Promise<Grupo | null> {
    const result = await query(
      'SELECT * FROM grupos WHERE id = $1',
      [id]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Buscar grupo por código
  static async findByCode(codigo: string): Promise<Grupo | null> {
    const result = await query(
      'SELECT * FROM grupos WHERE codigo = $1',
      [codigo]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Criar novo grupo
  static async create(grupoData: CreateGrupoData, userId: number): Promise<Grupo> {
    const { 
      nome, 
      descricao, 
      codigo, 
      status = StatusItem.ATIVO, 
      grupo_pai_id,
      ponto_focal_nome,
      ponto_focal_descricao,
      ponto_focal_observacoes
    } = grupoData;
    
    const result = await query(
      `INSERT INTO grupos (nome, descricao, codigo, status, grupo_pai_id, ponto_focal_nome, ponto_focal_descricao, ponto_focal_observacoes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [nome, descricao, codigo, status, grupo_pai_id, ponto_focal_nome, ponto_focal_descricao, ponto_focal_observacoes, userId]
    );
    
    return result.rows[0];
  }

  // Listar todos os grupos
  static async findAll(): Promise<Grupo[]> {
    const result = await query(
      'SELECT * FROM grupos ORDER BY nome ASC'
    );
    
    return result.rows;
  }

  // Listar grupos ativos
  static async findActive(): Promise<Grupo[]> {
    const result = await query(
      'SELECT * FROM grupos WHERE status = $1 ORDER BY nome ASC',
      [StatusItem.ATIVO]
    );
    
    return result.rows;
  }

  // Buscar grupos com hierarquia (incluindo pai e filhos)
  static async findWithHierarchy(id: number): Promise<GrupoWithHierarchy | null> {
    const result = await query(`
      SELECT 
        g.*,
        gp.id as grupo_pai_id_ref,
        gp.nome as grupo_pai_nome,
        gp.descricao as grupo_pai_descricao,
        gp.codigo as grupo_pai_codigo,
        gp.status as grupo_pai_status,
        gp.grupo_pai_id as grupo_pai_grupo_pai_id,
        gp.created_at as grupo_pai_created_at,
        gp.updated_at as grupo_pai_updated_at,
        gp.created_by as grupo_pai_created_by,
        gp.updated_by as grupo_pai_updated_by
      FROM grupos g
      LEFT JOIN grupos gp ON g.grupo_pai_id = gp.id
      WHERE g.id = $1
    `, [id]);
    
    if (result.rows.length === 0) return null;

    const grupo = result.rows[0];
    
    // Buscar subgrupos
    const subgruposResult = await query(
      'SELECT * FROM grupos WHERE grupo_pai_id = $1 ORDER BY nome ASC',
      [id]
    );

    return {
      id: grupo.id,
      nome: grupo.nome,
      descricao: grupo.descricao,
      codigo: grupo.codigo,
      status: grupo.status,
      grupo_pai_id: grupo.grupo_pai_id,
      created_at: grupo.created_at,
      updated_at: grupo.updated_at,
      created_by: grupo.created_by,
      updated_by: grupo.updated_by,
      grupo_pai: grupo.grupo_pai_id_ref ? {
        id: grupo.grupo_pai_id_ref,
        nome: grupo.grupo_pai_nome,
        descricao: grupo.grupo_pai_descricao,
        codigo: grupo.grupo_pai_codigo,
        status: grupo.grupo_pai_status,
        grupo_pai_id: grupo.grupo_pai_grupo_pai_id,
        created_at: grupo.grupo_pai_created_at,
        updated_at: grupo.grupo_pai_updated_at,
        created_by: grupo.grupo_pai_created_by,
        updated_by: grupo.grupo_pai_updated_by
      } : undefined,
      subgrupos: subgruposResult.rows
    };
  }

  // Buscar grupos raiz (sem pai)
  static async findRootGroups(): Promise<Grupo[]> {
    const result = await query(
      'SELECT * FROM grupos WHERE grupo_pai_id IS NULL ORDER BY nome ASC'
    );
    
    return result.rows;
  }

  // Buscar subgrupos de um grupo
  static async findSubgroups(grupoId: number): Promise<Grupo[]> {
    const result = await query(
      'SELECT * FROM grupos WHERE grupo_pai_id = $1 ORDER BY nome ASC',
      [grupoId]
    );
    
    return result.rows;
  }

  // Atualizar grupo
  static async update(id: number, grupoData: UpdateGrupoData, userId: number): Promise<Grupo | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (grupoData.nome !== undefined) {
      fields.push(`nome = $${paramCount}`);
      values.push(grupoData.nome);
      paramCount++;
    }

    if (grupoData.descricao !== undefined) {
      fields.push(`descricao = $${paramCount}`);
      values.push(grupoData.descricao);
      paramCount++;
    }

    if (grupoData.codigo !== undefined) {
      fields.push(`codigo = $${paramCount}`);
      values.push(grupoData.codigo);
      paramCount++;
    }

    if (grupoData.status !== undefined) {
      fields.push(`status = $${paramCount}`);
      values.push(grupoData.status);
      paramCount++;
    }

    if (grupoData.ponto_focal_nome !== undefined) {
      fields.push(`ponto_focal_nome = $${paramCount}`);
      values.push(grupoData.ponto_focal_nome);
      paramCount++;
    }

    if (grupoData.ponto_focal_descricao !== undefined) {
      fields.push(`ponto_focal_descricao = $${paramCount}`);
      values.push(grupoData.ponto_focal_descricao);
      paramCount++;
    }

    if (grupoData.ponto_focal_observacoes !== undefined) {
      fields.push(`ponto_focal_observacoes = $${paramCount}`);
      values.push(grupoData.ponto_focal_observacoes);
      paramCount++;
    }

    if (grupoData.grupo_pai_id !== undefined) {
      fields.push(`grupo_pai_id = $${paramCount}`);
      values.push(grupoData.grupo_pai_id);
      paramCount++;
    }

    if (grupoData.ponto_focal_descricao !== undefined) {
      fields.push(`ponto_focal_descricao = $${paramCount}`);
      values.push(grupoData.ponto_focal_descricao);
      paramCount++;
    }

    if (grupoData.ponto_focal_observacoes !== undefined) {
      fields.push(`ponto_focal_observacoes = $${paramCount}`);
      values.push(grupoData.ponto_focal_observacoes);
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
      `UPDATE grupos SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Deletar grupo (soft delete - desativar)
  static async delete(id: number, userId: number): Promise<boolean> {
    const result = await query(
      'UPDATE grupos SET status = $1, updated_at = CURRENT_TIMESTAMP, updated_by = $2 WHERE id = $3',
      [StatusItem.INATIVO, userId, id]
    );
    
    return (result.rowCount || 0) > 0;
  }

  // Verificar se o grupo tem filhos
  static async hasChildren(id: number): Promise<boolean> {
    const result = await query(
      'SELECT COUNT(*) as count FROM grupos WHERE grupo_pai_id = $1',
      [id]
    );
    
    return parseInt(result.rows[0].count) > 0;
  }

  // Contar grupos por status
  static async countByStatus(): Promise<{ status: string; count: number }[]> {
    const result = await query(
      'SELECT status, COUNT(*) as count FROM grupos GROUP BY status ORDER BY status'
    );
    
    return result.rows;
  }
} 