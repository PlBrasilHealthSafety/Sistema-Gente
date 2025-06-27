import { Request, Response } from 'express';
import { pool } from '../config/database';
import { CreateCredenciadoDTO, UpdateCredenciadoDTO, HorarioFuncionamento } from '../models/Credenciado';

export const credenciadoController = {
  // Listar todos os credenciados
  async listar(req: Request, res: Response) {
    try {
      const { status, search } = req.query;
      
      let query = `
        SELECT 
          c.*, 
          array_agg(
            json_build_object(
              'dia_semana', ch.dia_semana,
              'ativo', ch.ativo,
              'horario_inicio', ch.horario_inicio,
              'horario_fim', ch.horario_fim
            )
            ORDER BY 
              CASE ch.dia_semana
                WHEN 'segunda' THEN 1
                WHEN 'terca' THEN 2
                WHEN 'quarta' THEN 3
                WHEN 'quinta' THEN 4
                WHEN 'sexta' THEN 5
                WHEN 'sabado' THEN 6
                WHEN 'domingo' THEN 7
              END
          ) FILTER (WHERE ch.id IS NOT NULL) as horarios_funcionamento
        FROM credenciados c
        LEFT JOIN credenciados_horarios ch ON c.id = ch.credenciado_id
        WHERE 1=1
      `;
      
      const params: any[] = [];
      
      if (status && status !== 'todos') {
        params.push(status);
        query += ` AND c.status = $${params.length}`;
      }
      
      if (search) {
        params.push(`%${search}%`);
        query += ` AND (c.nome ILIKE $${params.length} OR c.cnpj LIKE $${params.length} OR c.cidade ILIKE $${params.length})`;
      }
      
      query += ' GROUP BY c.id ORDER BY c.nome';
      
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (error) {
      console.error('Erro ao listar credenciados:', error);
      res.status(500).json({ error: 'Erro ao listar credenciados' });
    }
  },

  // Buscar credenciado por ID
  async buscarPorId(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const query = `
        SELECT 
          c.*, 
          array_agg(
            json_build_object(
              'dia_semana', ch.dia_semana,
              'ativo', ch.ativo,
              'horario_inicio', ch.horario_inicio,
              'horario_fim', ch.horario_fim
            )
            ORDER BY 
              CASE ch.dia_semana
                WHEN 'segunda' THEN 1
                WHEN 'terca' THEN 2
                WHEN 'quarta' THEN 3
                WHEN 'quinta' THEN 4
                WHEN 'sexta' THEN 5
                WHEN 'sabado' THEN 6
                WHEN 'domingo' THEN 7
              END
          ) FILTER (WHERE ch.id IS NOT NULL) as horarios_funcionamento
        FROM credenciados c
        LEFT JOIN credenciados_horarios ch ON c.id = ch.credenciado_id
        WHERE c.id = $1
        GROUP BY c.id
      `;
      
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Credenciado não encontrado' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao buscar credenciado:', error);
      res.status(500).json({ error: 'Erro ao buscar credenciado' });
    }
  },

  // Criar novo credenciado
  async criar(req: Request, res: Response) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const dados: CreateCredenciadoDTO = req.body;
      const horarios = dados.horarios_funcionamento || [];
      
      // Inserir credenciado
      const queryCredenciado = `
        INSERT INTO credenciados (
          nome, cnpj, telefone, email, site,
          cep, tipo_logradouro, logradouro, numero, complemento,
          uf, cidade, bairro,
          observacoes_exames, observacoes_gerais, utilizar_percentual,
          status
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10,
          $11, $12, $13,
          $14, $15, $16,
          $17
        ) RETURNING *
      `;
      
      const valoresCredenciado = [
        dados.nome,
        dados.cnpj,
        dados.telefone,
        dados.email,
        dados.site || null,
        dados.cep,
        dados.tipo_logradouro || null,
        dados.logradouro,
        dados.numero,
        dados.complemento || null,
        dados.uf,
        dados.cidade,
        dados.bairro,
        dados.observacoes_exames || null,
        dados.observacoes_gerais || null,
        dados.utilizar_percentual || false,
        dados.status || 'ativo'
      ];
      
      const resultCredenciado = await client.query(queryCredenciado, valoresCredenciado);
      const credenciadoId = resultCredenciado.rows[0].id;
      
      // Inserir horários de funcionamento
      if (horarios.length > 0) {
        const valoresHorarios = horarios.map((h: HorarioFuncionamento) => 
          `(${credenciadoId}, '${h.dia_semana}', ${h.ativo}, ${h.horario_inicio ? `'${h.horario_inicio}'` : 'NULL'}, ${h.horario_fim ? `'${h.horario_fim}'` : 'NULL'})`
        ).join(',');
        
        await client.query(`
          INSERT INTO credenciados_horarios (credenciado_id, dia_semana, ativo, horario_inicio, horario_fim)
          VALUES ${valoresHorarios}
        `);
      }
      
      await client.query('COMMIT');
      
      // Buscar credenciado completo com horários
      const credenciadoCompleto = await credenciadoController.buscarPorId(
        { params: { id: credenciadoId } } as any,
        res
      );
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erro ao criar credenciado:', error);
      res.status(500).json({ error: 'Erro ao criar credenciado' });
    } finally {
      client.release();
    }
  },

  // Atualizar credenciado
  async atualizar(req: Request, res: Response) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const { id } = req.params;
      const dados: UpdateCredenciadoDTO = req.body;
      
      // Verificar se existe
      const checkQuery = 'SELECT id FROM credenciados WHERE id = $1';
      const checkResult = await client.query(checkQuery, [id]);
      
      if (checkResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Credenciado não encontrado' });
      }
      
      // Atualizar credenciado
      const campos: string[] = [];
      const valores: any[] = [];
      let paramCount = 1;
      
      Object.entries(dados).forEach(([campo, valor]) => {
        if (campo !== 'horarios_funcionamento' && valor !== undefined) {
          campos.push(`${campo} = $${paramCount}`);
          valores.push(valor);
          paramCount++;
        }
      });
      
      if (campos.length > 0) {
        valores.push(id);
        const queryUpdate = `
          UPDATE credenciados 
          SET ${campos.join(', ')}, updated_at = CURRENT_TIMESTAMP
          WHERE id = $${paramCount}
          RETURNING *
        `;
        
        await client.query(queryUpdate, valores);
      }
      
      // Atualizar horários se fornecidos
      if (dados.horarios_funcionamento) {
        // Deletar horários existentes
        await client.query('DELETE FROM credenciados_horarios WHERE credenciado_id = $1', [id]);
        
        // Inserir novos horários
        if (dados.horarios_funcionamento.length > 0) {
          const valoresHorarios = dados.horarios_funcionamento.map((h: HorarioFuncionamento) => 
            `(${id}, '${h.dia_semana}', ${h.ativo}, ${h.horario_inicio ? `'${h.horario_inicio}'` : 'NULL'}, ${h.horario_fim ? `'${h.horario_fim}'` : 'NULL'})`
          ).join(',');
          
          await client.query(`
            INSERT INTO credenciados_horarios (credenciado_id, dia_semana, ativo, horario_inicio, horario_fim)
            VALUES ${valoresHorarios}
          `);
        }
      }
      
      await client.query('COMMIT');
      
      // Buscar credenciado atualizado
      const credenciadoAtualizado = await credenciadoController.buscarPorId(
        { params: { id } } as any,
        res
      );
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Erro ao atualizar credenciado:', error);
      res.status(500).json({ error: 'Erro ao atualizar credenciado' });
    } finally {
      client.release();
    }
  },

  // Excluir credenciado
  async excluir(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const query = 'DELETE FROM credenciados WHERE id = $1 RETURNING id';
      const result = await pool.query(query, [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Credenciado não encontrado' });
      }
      
      res.json({ message: 'Credenciado excluído com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir credenciado:', error);
      res.status(500).json({ error: 'Erro ao excluir credenciado' });
    }
  },

  // Inativar/Reativar credenciado
  async alterarStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!['ativo', 'inativo'].includes(status)) {
        return res.status(400).json({ error: 'Status inválido' });
      }
      
      const query = `
        UPDATE credenciados 
        SET status = $1, updated_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *
      `;
      
      const result = await pool.query(query, [status, id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Credenciado não encontrado' });
      }
      
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Erro ao alterar status do credenciado:', error);
      res.status(500).json({ error: 'Erro ao alterar status do credenciado' });
    }
  }
}; 