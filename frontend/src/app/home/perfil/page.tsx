'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
  phone?: string;
  department?: string;
  position?: string;
  hire_date?: string;
  birth_date?: string;
  cpf?: string;
  address?: string;
}

export default function PerfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});


  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData(parsedUser);
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      // Aqui você faria a chamada para a API para salvar os dados
      console.log('Salvando dados:', formData);
      
      // Por agora, vamos apenas simular o salvamento
      const updatedUser = { ...user, ...formData };
      setUser(updatedUser as User);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setIsEditing(false);
      
      // Aqui você poderia mostrar uma notificação de sucesso
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      // Aqui você poderia mostrar uma notificação de erro
    }
  };

  const handleCancel = () => {
    setFormData(user || {});
    setIsEditing(false);
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Super Administrador';
      case 'ADMIN':
        return 'Administrador';
      case 'USER':
        return 'Usuário';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800';
      case 'USER':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-[#00A298]/15 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00A298]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1D3C44] mb-2">Meu Perfil</h1>
        <p className="text-gray-600">Gerencie suas informações pessoais e preferências</p>
      </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Header do Perfil */}
              <div className="bg-gradient-to-r from-[#00A298] to-[#1D3C44] p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
                      {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <h2 className="text-2xl font-bold">{user.first_name} {user.last_name}</h2>
                      <p className="text-white/80">{user.email}</p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-2 ${getRoleColor(user.role)} text-[#1D3C44]`}>
                        {getRoleName(user.role)}
                      </span>
                    </div>
                  </div>
                  <div>
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="bg-white text-[#00A298] px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center cursor-pointer"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                        </svg>
                        Editar Perfil
                      </button>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={handleCancel}
                          className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleSave}
                          className="bg-white text-[#00A298] px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Salvar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Conteúdo do Perfil */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Informações Pessoais */}
                  <div>
                    <h3 className="text-lg font-semibold text-[#1D3C44] mb-4">Informações Pessoais</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="first_name"
                            value={formData.first_name || ''}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-900">{user.first_name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Sobrenome
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="last_name"
                            value={formData.last_name || ''}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-900">{user.last_name}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        {isEditing ? (
                          <input
                            type="email"
                            name="email"
                            value={formData.email || ''}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                          />
                        ) : (
                          <p className="text-gray-900">{user.email}</p>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* Informações Profissionais */}
                  <div>
                    <h3 className="text-lg font-semibold text-[#1D3C44] mb-4">Informações Profissionais</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cargo
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="position"
                            value={formData.position || ''}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                            placeholder="Ex: Analista de Sistemas"
                          />
                        ) : (
                          <p className="text-gray-900">{user.position || 'Não informado'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Departamento
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="department"
                            value={formData.department || ''}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                            placeholder="Ex: Tecnologia da Informação"
                          />
                        ) : (
                          <p className="text-gray-900">{user.department || 'Não informado'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Perfil de Acesso
                        </label>
                        <p className="text-gray-900">{getRoleName(user.role)}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          O perfil de acesso é definido pelo administrador do sistema
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status da Conta
                        </label>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Ativa' : 'Inativa'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
    </div>
  );
} 