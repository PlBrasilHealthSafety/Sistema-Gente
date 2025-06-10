import { query } from '../config/database';

export interface PasswordResetToken {
  id: number;
  user_id: number;
  token: string;
  email: string;
  expires_at: Date;
  used: boolean;
  created_at: Date;
}

export class PasswordResetModel {
  
  // Criar tabela de tokens de recuperação
  static async createTable(): Promise<void> {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await query(createTableQuery);
    
    // Criar índices
    await query('CREATE INDEX IF NOT EXISTS idx_password_reset_token ON password_reset_tokens(token);');
    await query('CREATE INDEX IF NOT EXISTS idx_password_reset_email ON password_reset_tokens(email);');
    await query('CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON password_reset_tokens(expires_at);');
  }

  // Criar novo token de recuperação
  static async createToken(userId: number, email: string, token: string, expiresAt: Date): Promise<PasswordResetToken> {
    // Primeiro, marcar todos os tokens anteriores deste usuário como usados
    await query(
      'UPDATE password_reset_tokens SET used = true WHERE user_id = $1 AND used = false',
      [userId]
    );

    // Criar novo token
    const result = await query(
      `INSERT INTO password_reset_tokens (user_id, token, email, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [userId, token, email, expiresAt]
    );
    
    return result.rows[0];
  }

  // Buscar token válido
  static async findValidToken(token: string): Promise<PasswordResetToken | null> {
    const result = await query(
      `SELECT * FROM password_reset_tokens 
       WHERE token = $1 
         AND used = false 
         AND expires_at > CURRENT_TIMESTAMP`,
      [token]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Marcar token como usado
  static async markTokenAsUsed(token: string): Promise<void> {
    await query(
      'UPDATE password_reset_tokens SET used = true WHERE token = $1',
      [token]
    );
  }

  // Limpar tokens expirados (função de limpeza)
  static async cleanExpiredTokens(): Promise<number> {
    const result = await query(
      'DELETE FROM password_reset_tokens WHERE expires_at < CURRENT_TIMESTAMP'
    );
    
    return result.rowCount || 0;
  }

  // Buscar por email
  static async findByEmail(email: string): Promise<PasswordResetToken[]> {
    const result = await query(
      'SELECT * FROM password_reset_tokens WHERE email = $1 ORDER BY created_at DESC',
      [email]
    );
    
    return result.rows;
  }
} 