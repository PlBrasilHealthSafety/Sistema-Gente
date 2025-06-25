import { pool } from '../config/database';

export interface Profissional {
  id: number;
  nome: string;
  cpf: string;
  rg?: string;
  data_nascimento?: Date;
  nis?: string;
  categoria: string;
  sigla_conselho?: string;
  numero_conselho?: string;
  telefone?: string;
  celular?: string;
  email?: string;
  observacoes?: string;
  externo: boolean;
  ofensor?: string;
  clinica?: string;
  status: 'ativo' | 'inativo';
  created_by?: number;
  updated_by?: number;
  created_at?: Date;
  updated_at?: Date;
}

export class ProfissionalModel {
  static async findAll(filters?: { status?: string; categoria?: string; nome?: string }) {
    let query = 'SELECT * FROM profissionais WHERE 1=1';
    const values: any[] = [];
    let paramCount = 1;

    if (filters?.status) {
      query += ` AND status = $${paramCount}`;
      values.push(filters.status);
      paramCount++;
    }

    if (filters?.categoria) {
      query += ` AND categoria = $${paramCount}`;
      values.push(filters.categoria);
      paramCount++;
    }

    if (filters?.nome) {
      query += ` AND LOWER(nome) LIKE LOWER($${paramCount})`;
      values.push(`%${filters.nome}%`);
      paramCount++;
    }

    query += ' ORDER BY nome ASC';

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async findById(id: number) {
    const result = await pool.query(
      'SELECT * FROM profissionais WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async findByCpf(cpf: string) {
    const result = await pool.query(
      'SELECT * FROM profissionais WHERE cpf = $1',
      [cpf]
    );
    return result.rows[0];
  }

  static async create(data: Partial<Profissional>) {
    const fields = [];
    const values = [];
    const placeholders = [];
    let paramCount = 1;

    // Campos obrigatórios
    const requiredFields = ['nome', 'cpf', 'categoria'];
    for (const field of requiredFields) {
      if (!data[field as keyof Profissional]) {
        throw new Error(`Campo obrigatório não informado: ${field}`);
      }
    }

    // Adicionar todos os campos fornecidos
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && key !== 'id') {
        fields.push(key);
        values.push(value);
        placeholders.push(`$${paramCount}`);
        paramCount++;
      }
    }

    const query = `
      INSERT INTO profissionais (${fields.join(', ')})
      VALUES (${placeholders.join(', ')})
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async update(id: number, data: Partial<Profissional>) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    // Adicionar todos os campos fornecidos exceto id
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && key !== 'id' && key !== 'created_at' && key !== 'created_by') {
        fields.push(`${key} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    }

    if (fields.length === 0) {
      throw new Error('Nenhum campo para atualizar');
    }

    values.push(id);
    const query = `
      UPDATE profissionais
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id: number) {
    const result = await pool.query(
      'DELETE FROM profissionais WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  static async checkCpfExists(cpf: string, excludeId?: number) {
    let query = 'SELECT COUNT(*) FROM profissionais WHERE cpf = $1';
    const values: any[] = [cpf];

    if (excludeId) {
      query += ' AND id != $2';
      values.push(excludeId);
    }

    const result = await pool.query(query, values);
    return parseInt(result.rows[0].count) > 0;
  }
} 