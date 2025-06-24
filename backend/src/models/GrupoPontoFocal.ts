import { query } from '../config/database';
import { GrupoPontoFocal, CreateGrupoPontoFocalData, UpdateGrupoPontoFocalData } from '../types/organizacional';

export class GrupoPontoFocalModel {
  
  // Buscar pontos focais por grupo ID
  static async findByGrupoId(grupoId: number): Promise<GrupoPontoFocal[]> {
    const result = await query(
      'SELECT * FROM grupo_pontos_focais WHERE grupo_id = $1 ORDER BY ordem ASC, is_principal DESC, id ASC',
      [grupoId]
    );
    
    return result.rows;
  }

  // Buscar ponto focal principal de um grupo
  static async findPrincipalByGrupoId(grupoId: number): Promise<GrupoPontoFocal | null> {
    const result = await query(
      'SELECT * FROM grupo_pontos_focais WHERE grupo_id = $1 AND is_principal = true ORDER BY ordem ASC LIMIT 1',
      [grupoId]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Criar pontos focais para um grupo
  static async createMultiple(grupoId: number, pontosFocais: CreateGrupoPontoFocalData[], userId: number): Promise<GrupoPontoFocal[]> {
    const results: GrupoPontoFocal[] = [];
    
    for (let i = 0; i < pontosFocais.length; i++) {
      const pontoFocal = pontosFocais[i];
      const result = await query(`
        INSERT INTO grupo_pontos_focais (grupo_id, nome, cargo, descricao, observacoes, telefone, email, is_principal, ordem, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `, [
        grupoId,
        pontoFocal.nome,
        pontoFocal.cargo || null,
        pontoFocal.descricao || null,
        pontoFocal.observacoes || null,
        pontoFocal.telefone || null,
        pontoFocal.email || null,
        pontoFocal.is_principal || false,
        pontoFocal.ordem || (i + 1),
        userId
      ]);
      
      results.push(result.rows[0]);
    }
    
    return results;
  }

  // Atualizar pontos focais de um grupo (remove todos e recria)
  static async updateByGrupoId(grupoId: number, pontosFocais: CreateGrupoPontoFocalData[], userId: number): Promise<GrupoPontoFocal[]> {
    // Remover pontos focais existentes
    await query('DELETE FROM grupo_pontos_focais WHERE grupo_id = $1', [grupoId]);
    
    // Criar novos pontos focais
    if (pontosFocais.length === 0) {
      return [];
    }
    
    return await this.createMultiple(grupoId, pontosFocais, userId);
  }

  // Deletar pontos focais de um grupo
  static async deleteByGrupoId(grupoId: number): Promise<boolean> {
    const result = await query('DELETE FROM grupo_pontos_focais WHERE grupo_id = $1', [grupoId]);
    return (result.rowCount || 0) > 0;
  }

  // Contar pontos focais de um grupo
  static async countByGrupoId(grupoId: number): Promise<number> {
    const result = await query(
      'SELECT COUNT(*) as count FROM grupo_pontos_focais WHERE grupo_id = $1',
      [grupoId]
    );
    
    return parseInt(result.rows[0].count);
  }

  // Garantir que apenas um ponto focal seja principal por grupo
  static async ensureOnlyOnePrincipal(grupoId: number, principalId: number): Promise<void> {
    // Desmarcar todos os outros como não principal
    await query(`
      UPDATE grupo_pontos_focais 
      SET is_principal = false 
      WHERE grupo_id = $1 AND id != $2
    `, [grupoId, principalId]);
  }

  // Migrar dados dos campos antigos para a nova tabela
  static async migrateFromOldFields(): Promise<number> {
    const result = await query(`
      INSERT INTO grupo_pontos_focais (grupo_id, nome, descricao, observacoes, is_principal, ordem, created_by, updated_by)
      SELECT 
        id as grupo_id,
        ponto_focal_nome as nome,
        ponto_focal_descricao as descricao,
        ponto_focal_observacoes as observacoes,
        ponto_focal_principal as is_principal,
        1 as ordem,
        created_by,
        updated_by
      FROM grupos 
      WHERE ponto_focal_nome IS NOT NULL 
        AND ponto_focal_nome != ''
        AND id NOT IN (SELECT DISTINCT grupo_id FROM grupo_pontos_focais)
    `);
    
    return result.rowCount || 0;
  }
} 