import { query } from '../config/database';
import { User, CreateUserData, UserRole } from '../types/user';
import { hashPassword } from '../utils/auth';

export class UserModel {
  
  // Criar tabela de usuários
  static async createTable(): Promise<void> {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'user',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP,
        CONSTRAINT users_role_check CHECK (role IN ('super_admin', 'admin', 'user'))
      );
    `;
    
    await query(createTableQuery);
    
    // Criar índices
    await query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);');
    await query('CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);');
    await query('CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);');
  }

  // Buscar usuário por email
  static async findByEmail(email: string): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Buscar usuário por ID
  static async findById(id: number): Promise<User | null> {
    const result = await query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Criar novo usuário
  static async create(userData: CreateUserData): Promise<User> {
    const { first_name, last_name, email, password, role = UserRole.USER } = userData;
    
    // Hash da senha
    const password_hash = await hashPassword(password);
    
    const result = await query(
      `INSERT INTO users (first_name, last_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [first_name, last_name, email, password_hash, role]
    );
    
    return result.rows[0];
  }

  // Listar todos os usuários
  static async findAll(): Promise<User[]> {
    const result = await query(
      'SELECT * FROM users ORDER BY created_at DESC'
    );
    
    return result.rows;
  }

  // Atualizar último login
  static async updateLastLogin(id: number): Promise<void> {
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
  }

  // Atualizar status ativo
  static async updateActiveStatus(id: number, isActive: boolean): Promise<User | null> {
    const result = await query(
      'UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [isActive, id]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Contar usuários por role
  static async countByRole(): Promise<{ role: string; count: number }[]> {
    const result = await query(
      'SELECT role, COUNT(*) as count FROM users GROUP BY role ORDER BY role'
    );
    
    return result.rows;
  }

  // Atualizar senha
  static async updatePassword(id: number, passwordHash: string): Promise<void> {
    await query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [passwordHash, id]
    );
  }

  // Deletar usuário (soft delete - desativar)
  static async delete(id: number): Promise<boolean> {
    const result = await query(
      'UPDATE users SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
    
    return (result.rowCount || 0) > 0;
  }
} 