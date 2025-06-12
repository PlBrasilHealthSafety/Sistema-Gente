import { query } from '../config/database';
import { Empresa, CreateEmpresaData, UpdateEmpresaData, StatusItem, EmpresaWithRelations } from '../types/organizacional';

export class EmpresaModel {
  
  // Criar tabela de empresas
  static async createTable(): Promise<void> {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS empresas (
        id SERIAL PRIMARY KEY,
        razao_social VARCHAR(255) NOT NULL,
        nome_fantasia VARCHAR(255),
        cnpj VARCHAR(18) UNIQUE NOT NULL,
        inscricao_estadual VARCHAR(50),
        inscricao_municipal VARCHAR(50),
        email VARCHAR(255),
        telefone VARCHAR(20),
        site VARCHAR(255),
        endereco TEXT,
        numero VARCHAR(20),
        complemento VARCHAR(100),
        bairro VARCHAR(100),
        cidade VARCHAR(100),
        uf VARCHAR(2),
        cep VARCHAR(10),
        status VARCHAR(20) NOT NULL DEFAULT 'ativo',
        grupo_id INTEGER REFERENCES grupos(id) ON DELETE SET NULL,
        regiao_id INTEGER REFERENCES regioes(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER NOT NULL REFERENCES users(id),
        updated_by INTEGER REFERENCES users(id),
        CONSTRAINT empresas_status_check CHECK (status IN ('ativo', 'inativo'))
      );
    `;
    
    await query(createTableQuery);
    
    // Criar índices
    await query('CREATE INDEX IF NOT EXISTS idx_empresas_razao_social ON empresas(razao_social);');
    await query('CREATE INDEX IF NOT EXISTS idx_empresas_nome_fantasia ON empresas(nome_fantasia);');
    await query('CREATE INDEX IF NOT EXISTS idx_empresas_cnpj ON empresas(cnpj);');
    await query('CREATE INDEX IF NOT EXISTS idx_empresas_status ON empresas(status);');
    await query('CREATE INDEX IF NOT EXISTS idx_empresas_grupo ON empresas(grupo_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_empresas_regiao ON empresas(regiao_id);');
    await query('CREATE INDEX IF NOT EXISTS idx_empresas_uf ON empresas(uf);');
    await query('CREATE INDEX IF NOT EXISTS idx_empresas_cidade ON empresas(cidade);');
  }

  // Buscar empresa por ID
  static async findById(id: number): Promise<Empresa | null> {
    const result = await query(
      'SELECT * FROM empresas WHERE id = $1',
      [id]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Buscar empresa por CNPJ
  static async findByCNPJ(cnpj: string): Promise<Empresa | null> {
    const result = await query(
      'SELECT * FROM empresas WHERE cnpj = $1',
      [cnpj]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Buscar empresa com relacionamentos
  static async findByIdWithRelations(id: number): Promise<EmpresaWithRelations | null> {
    const result = await query(`
      SELECT 
        e.*,
        g.id as grupo_id_ref,
        g.nome as grupo_nome,
        g.descricao as grupo_descricao,
        g.codigo as grupo_codigo,
        g.status as grupo_status,
        g.grupo_pai_id as grupo_grupo_pai_id,
        g.created_at as grupo_created_at,
        g.updated_at as grupo_updated_at,
        g.created_by as grupo_created_by,
        g.updated_by as grupo_updated_by,
        r.id as regiao_id_ref,
        r.nome as regiao_nome,
        r.descricao as regiao_descricao,
        r.codigo as regiao_codigo,
        r.uf as regiao_uf,
        r.cidade as regiao_cidade,
        r.status as regiao_status,
        r.created_at as regiao_created_at,
        r.updated_at as regiao_updated_at,
        r.created_by as regiao_created_by,
        r.updated_by as regiao_updated_by
      FROM empresas e
      LEFT JOIN grupos g ON e.grupo_id = g.id
      LEFT JOIN regioes r ON e.regiao_id = r.id
      WHERE e.id = $1
    `, [id]);
    
    if (result.rows.length === 0) return null;

    const empresa = result.rows[0];
    
    return {
      ...empresa,
      grupo: empresa.grupo_id_ref ? {
        id: empresa.grupo_id_ref,
        nome: empresa.grupo_nome,
        descricao: empresa.grupo_descricao,
        codigo: empresa.grupo_codigo,
        status: empresa.grupo_status,
        grupo_pai_id: empresa.grupo_grupo_pai_id,
        created_at: empresa.grupo_created_at,
        updated_at: empresa.grupo_updated_at,
        created_by: empresa.grupo_created_by,
        updated_by: empresa.grupo_updated_by
      } : undefined,
      regiao: empresa.regiao_id_ref ? {
        id: empresa.regiao_id_ref,
        nome: empresa.regiao_nome,
        descricao: empresa.regiao_descricao,
        codigo: empresa.regiao_codigo,
        uf: empresa.regiao_uf,
        cidade: empresa.regiao_cidade,
        status: empresa.regiao_status,
        created_at: empresa.regiao_created_at,
        updated_at: empresa.regiao_updated_at,
        created_by: empresa.regiao_created_by,
        updated_by: empresa.regiao_updated_by
      } : undefined
    };
  }

  // Criar nova empresa
  static async create(empresaData: CreateEmpresaData, userId: number): Promise<Empresa> {
    const { 
      razao_social,
      nome_fantasia,
      cnpj,
      inscricao_estadual,
      inscricao_municipal,
      email,
      telefone,
      site,
      endereco,
      numero,
      complemento,
      bairro,
      cidade,
      uf,
      cep,
      status = StatusItem.ATIVO,
      grupo_id,
      regiao_id
    } = empresaData;
    
    const result = await query(
      `INSERT INTO empresas (
        razao_social, nome_fantasia, cnpj, inscricao_estadual, inscricao_municipal,
        email, telefone, site, endereco, numero, complemento, bairro, cidade, uf, cep,
        status, grupo_id, regiao_id, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
       RETURNING *`,
      [
        razao_social, nome_fantasia, cnpj, inscricao_estadual, inscricao_municipal,
        email, telefone, site, endereco, numero, complemento, bairro, cidade, uf, cep,
        status, grupo_id, regiao_id, userId
      ]
    );
    
    return result.rows[0];
  }

  // Listar todas as empresas
  static async findAll(): Promise<Empresa[]> {
    const result = await query(
      'SELECT * FROM empresas ORDER BY razao_social ASC'
    );
    
    return result.rows;
  }

  // Listar empresas ativas
  static async findActive(): Promise<Empresa[]> {
    const result = await query(
      'SELECT * FROM empresas WHERE status = $1 ORDER BY razao_social ASC',
      [StatusItem.ATIVO]
    );
    
    return result.rows;
  }

    // Listar empresas com relacionamentos
  static async findAllWithRelations(): Promise<Empresa[]> {
    return await this.findAll();
  }

  // Buscar empresas por grupo
  static async findByGroup(grupoId: number): Promise<Empresa[]> {
    const result = await query(
      'SELECT * FROM empresas WHERE grupo_id = $1 ORDER BY razao_social ASC',
      [grupoId]
    );
    
    return result.rows;
  }

  // Buscar empresas por região
  static async findByRegion(regiaoId: number): Promise<Empresa[]> {
    const result = await query(
      'SELECT * FROM empresas WHERE regiao_id = $1 ORDER BY razao_social ASC',
      [regiaoId]
    );
    
    return result.rows;
  }

  // Buscar empresas por UF
  static async findByUF(uf: string): Promise<Empresa[]> {
    const result = await query(
      'SELECT * FROM empresas WHERE uf = $1 ORDER BY razao_social ASC',
      [uf]
    );
    
    return result.rows;
  }

  // Buscar empresas por cidade
  static async findByCity(cidade: string): Promise<Empresa[]> {
    const result = await query(
      'SELECT * FROM empresas WHERE cidade ILIKE $1 ORDER BY razao_social ASC',
      [`%${cidade}%`]
    );
    
    return result.rows;
  }

  // Atualizar empresa
  static async update(id: number, empresaData: UpdateEmpresaData, userId: number): Promise<Empresa | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Mapear todos os campos possíveis
    const fieldMappings = {
      razao_social: empresaData.razao_social,
      nome_fantasia: empresaData.nome_fantasia,
      cnpj: empresaData.cnpj,
      inscricao_estadual: empresaData.inscricao_estadual,
      inscricao_municipal: empresaData.inscricao_municipal,
      email: empresaData.email,
      telefone: empresaData.telefone,
      site: empresaData.site,
      endereco: empresaData.endereco,
      numero: empresaData.numero,
      complemento: empresaData.complemento,
      bairro: empresaData.bairro,
      cidade: empresaData.cidade,
      uf: empresaData.uf,
      cep: empresaData.cep,
      status: empresaData.status,
      grupo_id: empresaData.grupo_id,
      regiao_id: empresaData.regiao_id
    };

    Object.entries(fieldMappings).forEach(([field, value]) => {
      if (value !== undefined) {
        fields.push(`${field} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return await this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    fields.push(`updated_by = $${paramCount}`);
    values.push(userId);
    paramCount++;

    values.push(id);

    const result = await query(
      `UPDATE empresas SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Deletar empresa (soft delete - desativar)
  static async delete(id: number, userId: number): Promise<boolean> {
    const result = await query(
      'UPDATE empresas SET status = $1, updated_at = CURRENT_TIMESTAMP, updated_by = $2 WHERE id = $3',
      [StatusItem.INATIVO, userId, id]
    );
    
    return (result.rowCount || 0) > 0;
  }

  // Contar empresas por status
  static async countByStatus(): Promise<{ status: string; count: number }[]> {
    const result = await query(
      'SELECT status, COUNT(*) as count FROM empresas GROUP BY status ORDER BY status'
    );
    
    return result.rows;
  }

  // Contar empresas por grupo
  static async countByGroup(): Promise<{ grupo_id: number; grupo_nome: string; count: number }[]> {
    const result = await query(`
      SELECT 
        g.id as grupo_id, 
        g.nome as grupo_nome, 
        COUNT(e.id) as count 
      FROM grupos g
      LEFT JOIN empresas e ON g.id = e.grupo_id
      GROUP BY g.id, g.nome
      ORDER BY g.nome
    `);
    
    return result.rows;
  }

  // Contar empresas por região
  static async countByRegion(): Promise<{ regiao_id: number; regiao_nome: string; count: number }[]> {
    const result = await query(`
      SELECT 
        r.id as regiao_id, 
        r.nome as regiao_nome, 
        COUNT(e.id) as count 
      FROM regioes r
      LEFT JOIN empresas e ON r.id = e.regiao_id
      GROUP BY r.id, r.nome
      ORDER BY r.nome
    `);
    
    return result.rows;
  }

  // Buscar empresas com filtros avançados
  static async findWithFilters(filters: {
    razao_social?: string;
    nome_fantasia?: string;
    cnpj?: string;
    status?: StatusItem;
    grupo_id?: number;
    regiao_id?: number;
    uf?: string;
    cidade?: string;
  }): Promise<Empresa[]> {
    let query_text = 'SELECT * FROM empresas WHERE 1=1';
    const values: any[] = [];
    let paramCount = 1;

    if (filters.razao_social) {
      query_text += ` AND razao_social ILIKE $${paramCount}`;
      values.push(`%${filters.razao_social}%`);
      paramCount++;
    }

    if (filters.nome_fantasia) {
      query_text += ` AND nome_fantasia ILIKE $${paramCount}`;
      values.push(`%${filters.nome_fantasia}%`);
      paramCount++;
    }

    if (filters.cnpj) {
      query_text += ` AND cnpj = $${paramCount}`;
      values.push(filters.cnpj);
      paramCount++;
    }

    if (filters.status) {
      query_text += ` AND status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters.grupo_id) {
      query_text += ` AND grupo_id = $${paramCount}`;
      values.push(filters.grupo_id);
      paramCount++;
    }

    if (filters.regiao_id) {
      query_text += ` AND regiao_id = $${paramCount}`;
      values.push(filters.regiao_id);
      paramCount++;
    }

    if (filters.uf) {
      query_text += ` AND uf = $${paramCount}`;
      values.push(filters.uf);
      paramCount++;
    }

    if (filters.cidade) {
      query_text += ` AND cidade ILIKE $${paramCount}`;
      values.push(`%${filters.cidade}%`);
      paramCount++;
    }

    query_text += ' ORDER BY razao_social ASC';

    const result = await query(query_text, values);
    return result.rows;
  }
} 