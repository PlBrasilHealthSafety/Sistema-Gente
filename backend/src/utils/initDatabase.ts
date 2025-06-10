import { UserModel } from '../models/User';
import { PasswordResetModel } from '../models/PasswordReset';
import { UserRole } from '../types/user';

export const initializeDatabase = async (): Promise<void> => {
  try {
    console.log('🔄 Inicializando banco de dados...');
    
    // Criar tabela de usuários
    await UserModel.createTable();
    console.log('✅ Tabela de usuários criada/verificada');
    
    // Criar tabela de tokens de recuperação de senha
    await PasswordResetModel.createTable();
    console.log('✅ Tabela de tokens de recuperação criada/verificada');
    
    // Verificar se já existem usuários
    const existingUsers = await UserModel.findAll();
    
    if (existingUsers.length > 0) {
      console.log(`📊 Banco já possui ${existingUsers.length} usuário(s)`);
      return;
    }
    
    console.log('🔄 Criando usuários iniciais...');
    
    // Criar Super Administrador
    const superAdmin = await UserModel.create({
      first_name: 'Super',
      last_name: 'Admin',
      email: 'superadmin@sistemagente.com',
      password: 'SuperAdmin@2025',
      role: UserRole.SUPER_ADMIN
    });
    console.log('✅ Super Administrador criado:', superAdmin.email);
    
    // Criar Administrador
    const admin = await UserModel.create({
      first_name: 'Admin',
      last_name: 'Sistema',
      email: 'admin@sistemagente.com',
      password: 'Admin@2025',
      role: UserRole.ADMIN
    });
    console.log('✅ Administrador criado:', admin.email);
    
    // Criar Usuário normal
    const user = await UserModel.create({
      first_name: 'Usuário',
      last_name: 'Teste',
      email: 'usuario@sistemagente.com',
      password: 'Usuario@2025',
      role: UserRole.USER
    });
    console.log('✅ Usuário normal criado:', user.email);
    
    console.log('\n🎉 Usuários iniciais criados com sucesso!');
    console.log('\n📋 CREDENCIAIS DE ACESSO:');
    console.log('━'.repeat(50));
    console.log('🔴 SUPER ADMIN:');
    console.log('   Email: superadmin@sistemagente.com');
    console.log('   Senha: SuperAdmin@2025');
    console.log('');
    console.log('🟠 ADMIN:');
    console.log('   Email: admin@sistemagente.com');
    console.log('   Senha: Admin@2025');
    console.log('');
    console.log('🟢 USER:');
    console.log('   Email: usuario@sistemagente.com');
    console.log('   Senha: Usuario@2025');
    console.log('━'.repeat(50));
    
  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
    throw error;
  }
}; 