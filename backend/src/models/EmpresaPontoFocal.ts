import { query } from '../config/database';
import { EmpresaPontoFocal, CreateEmpresaPontoFocalData, UpdateEmpresaPontoFocalData } from '../types/organizacional';

export class EmpresaPontoFocalModel {
  
  // Buscar pontos focais por empresa ID
  static async findByEmpresaId(empresaId: number): Promise<EmpresaPontoFocal[]> {
    const result = await query(
      'SELECT * FROM empresa_pontos_focais WHERE empresa_id = $1 ORDER BY ordem ASC, is_principal DESC, id ASC',
      [empresaId]
    );
    
    return result.rows;
  }

  // Buscar ponto focal principal de uma empresa
  static async findPrincipalByEmpresaId(empresaId: number): Promise<EmpresaPontoFocal | null> {
    const result = await query(
      'SELECT * FROM empresa_pontos_focais WHERE empresa_id = $1 AND is_principal = true ORDER BY ordem ASC LIMIT 1',
      [empresaId]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Criar ponto focal
  static async create(
    empresaId: number, 
    data: CreateEmpresaPontoFocalData, 
    userId: number
  ): Promise<EmpresaPontoFocal> {
    const result = await query(
      `INSERT INTO empresa_pontos_focais 
       (empresa_id, nome, cargo, descricao, observacoes, telefone, email, is_principal, ordem, created_by, updated_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
       RETURNING *`,
      [
        empresaId,
        data.nome,
        data.cargo || null,
        data.descricao || null,
        data.observacoes || null,
        data.telefone || null,
        data.email || null,
        data.is_principal || false,
        data.ordem || 0,
        userId,
        userId
      ]
    );
    
    return result.rows[0];
  }

  // Atualizar ponto focal
  static async update(
    id: number,
    data: UpdateEmpresaPontoFocalData,
    userId: number
  ): Promise<EmpresaPontoFocal | null> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.nome !== undefined) {
      fields.push(`nome = $${paramCount}`);
      values.push(data.nome);
      paramCount++;
    }

    if (data.cargo !== undefined) {
      fields.push(`cargo = $${paramCount}`);
      values.push(data.cargo);
      paramCount++;
    }

    if (data.descricao !== undefined) {
      fields.push(`descricao = $${paramCount}`);
      values.push(data.descricao);
      paramCount++;
    }

    if (data.observacoes !== undefined) {
      fields.push(`observacoes = $${paramCount}`);
      values.push(data.observacoes);
      paramCount++;
    }

    if (data.telefone !== undefined) {
      fields.push(`telefone = $${paramCount}`);
      values.push(data.telefone);
      paramCount++;
    }

    if (data.email !== undefined) {
      fields.push(`email = $${paramCount}`);
      values.push(data.email);
      paramCount++;
    }

    if (data.is_principal !== undefined) {
      fields.push(`is_principal = $${paramCount}`);
      values.push(data.is_principal);
      paramCount++;
    }

    if (data.ordem !== undefined) {
      fields.push(`ordem = $${paramCount}`);
      values.push(data.ordem);
      paramCount++;
    }

    if (fields.length === 0) {
      return null;
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    fields.push(`updated_by = $${paramCount}`);
    values.push(userId);
    paramCount++;

    values.push(id);

    const result = await query(
      `UPDATE empresa_pontos_focais SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );

    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Deletar ponto focal
  static async delete(id: number): Promise<boolean> {
    const result = await query('DELETE FROM empresa_pontos_focais WHERE id = $1', [id]);
    return (result.rowCount || 0) > 0;
  }

  // Deletar pontos focais de uma empresa
  static async deleteByEmpresaId(empresaId: number): Promise<boolean> {
    const result = await query('DELETE FROM empresa_pontos_focais WHERE empresa_id = $1', [empresaId]);
    return (result.rowCount || 0) > 0;
  }

  // Garantir que apenas um ponto focal seja principal por empresa
  static async ensureOnlyOnePrincipal(empresaId: number, newPrincipalId?: number): Promise<void> {
    if (newPrincipalId) {
      // Desmarcar todos os outros como principal
      await query(
        'UPDATE empresa_pontos_focais SET is_principal = false WHERE empresa_id = $1 AND id != $2',
        [empresaId, newPrincipalId]
      );
      
      // Marcar o novo como principal
      await query(
        'UPDATE empresa_pontos_focais SET is_principal = true WHERE id = $1',
        [newPrincipalId]
      );
    } else {
      // Desmarcar todos como principal
      await query(
        'UPDATE empresa_pontos_focais SET is_principal = false WHERE empresa_id = $1',
        [empresaId]
      );
    }
  }

  // Buscar por ID
  static async findById(id: number): Promise<EmpresaPontoFocal | null> {
    const result = await query('SELECT * FROM empresa_pontos_focais WHERE id = $1', [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Atualizar ordem dos pontos focais
  static async updateOrdem(pontosFocais: { id: number; ordem: number }[]): Promise<void> {
    for (const pf of pontosFocais) {
      await query(
        'UPDATE empresa_pontos_focais SET ordem = $1 WHERE id = $2',
        [pf.ordem, pf.id]
      );
    }
  }
} 