/**
 * 🔐 SISTEMA DE PERMISSÕES - GESTÃO DE ACESSOS
 * 
 * Este hook gerencia as permissões baseadas no role do usuário:
 * 
 * 🟣 super_admin:
 *    ✅ Pode criar, editar e excluir TUDO
 *    ✅ Pode ver informações sensíveis (Ponto Focal)
 *    ✅ Gerencia todos os grupos, regiões e empresas
 * 
 * 🔵 ADMIN:
 *    ✅ Pode criar e editar suas entidades associadas
 *    ❌ Não pode excluir (apenas inativar)
 *    ✅ Pode ver informações sensíveis (Ponto Focal)
 *    ✅ Não pode criar novos grupos (apenas editar os seus)
 * 
 * 🟢 user:
 *    ❌ Apenas visualização
 *    ❌ Não pode criar, editar ou excluir
 *    ✅ Pode ver informações sensíveis (Ponto Focal) - necessário para reuniões
 * 
 * 🎯 APLICAÇÃO:
 *    - Botões de ação são escondidos conforme permissões
 *    - Colunas sensíveis são ocultadas para usuários sem acesso
 *    - Validação em camadas: frontend + backend
 */

import { useMemo } from 'react';

interface user {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
}

interface Permissions {
  // Permissões gerais
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canViewSensitive: boolean;
  
  // Permissões específicas por entidade
  grupos: {
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
  regioes: {
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
  empresas: {
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
}

export const usePermissions = (user: user | null): Permissions => {
  return useMemo(() => {
    if (!user) {
      // Usuário não logado - sem permissões
      return {
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canViewSensitive: false,
        grupos: {
          canCreate: false,
          canEdit: false,
          canDelete: false,
        },
        regioes: {
          canCreate: false,
          canEdit: false,
          canDelete: false,
        },
        empresas: {
          canCreate: false,
          canEdit: false,
          canDelete: false,
        },
      };
    }

    switch (user.role) {
      case 'super_admin':
      case 'SUPER_ADMIN':
        // super_admin: Acesso total a tudo
        return {
          canCreate: true,
          canEdit: true,
          canDelete: true,
          canViewSensitive: true,
          grupos: {
            canCreate: true,
            canEdit: true,
            canDelete: true,
          },
          regioes: {
            canCreate: true,
            canEdit: true,
            canDelete: true,
          },
          empresas: {
            canCreate: true,
            canEdit: true,
            canDelete: true,
          },
        };

      case 'admin':
      case 'ADMIN':
        // ADMIN: Pode gerenciar apenas suas entidades associadas
        return {
          canCreate: true,
          canEdit: true,
          canDelete: false, // ADMINs não podem excluir (apenas inativar)
          canViewSensitive: true,
          grupos: {
            canCreate: false, // ADMIN não pode criar novos grupos
            canEdit: true,    // Pode editar apenas os seus grupos
            canDelete: false, // Não pode excluir grupos
          },
          regioes: {
            canCreate: true,  // Pode criar regiões dentro dos seus grupos
            canEdit: true,    // Pode editar suas regiões
            canDelete: false, // Não pode excluir regiões
          },
          empresas: {
            canCreate: true,  // Pode criar empresas nas suas regiões
            canEdit: true,    // Pode editar suas empresas
            canDelete: false, // Não pode excluir empresas
          },
        };

      case 'user':
      case 'USER':
        // user: Apenas visualização
        return {
          canCreate: false,
          canEdit: false,
          canDelete: false,
          canViewSensitive: true, // Pode ver Ponto Focal para reuniões
          grupos: {
            canCreate: false,
            canEdit: false,
            canDelete: false,
          },
          regioes: {
            canCreate: false,
            canEdit: false,
            canDelete: false,
          },
          empresas: {
            canCreate: false,
            canEdit: false,
            canDelete: false,
          },
        };

      default:
        // Fallback: sem permissões
        return {
          canCreate: false,
          canEdit: false,
          canDelete: false,
          canViewSensitive: false,
          grupos: {
            canCreate: false,
            canEdit: false,
            canDelete: false,
          },
          regioes: {
            canCreate: false,
            canEdit: false,
            canDelete: false,
          },
          empresas: {
            canCreate: false,
            canEdit: false,
            canDelete: false,
          },
        };
    }
  }, [user]);
};

// Hook auxiliar para verificar permissões específicas
export const useCanPerform = (user: user | null, action: 'create' | 'edit' | 'delete', entity?: 'grupos' | 'regioes' | 'empresas') => {
  const permissions = usePermissions(user);
  
  if (entity) {
    return permissions[entity][`can${action.charAt(0).toUpperCase() + action.slice(1)}` as keyof typeof permissions[typeof entity]];
  }
  
  return permissions[`can${action.charAt(0).toUpperCase() + action.slice(1)}` as keyof Permissions];
};

// ⚠️ FUNÇÃO DE TESTE - REMOVER EM PRODUÇÃO
export const testPermissions = () => {
  console.log('🧪 TESTE DE PERMISSÕES');
  
  const testusers = [
    { id: 1, first_name: 'Super', last_name: 'Admin', email: 'super@test.com', role: 'super_admin', is_active: true },
    { id: 2, first_name: 'Admin', last_name: 'user', email: 'admin@test.com', role: 'ADMIN', is_active: true },
    { id: 3, first_name: 'Regular', last_name: 'user', email: 'user@test.com', role: 'user', is_active: true },
  ];
  
  testusers.forEach(user => {
    console.log(`\n👤 ${user.role} (${user.first_name}):`);
    
    // Simular o hook
    let permissions;
    switch (user.role) {
      case 'super_admin':
        permissions = {
          canCreate: true, canEdit: true, canDelete: true, canViewSensitive: true,
          grupos: { canCreate: true, canEdit: true, canDelete: true },
          empresas: { canCreate: true, canEdit: true, canDelete: true }
        };
        break;
      case 'ADMIN':
        permissions = {
          canCreate: true, canEdit: true, canDelete: false, canViewSensitive: true,
          grupos: { canCreate: false, canEdit: true, canDelete: false },
          empresas: { canCreate: true, canEdit: true, canDelete: false }
        };
        break;
             case 'user':
         permissions = {
           canCreate: false, canEdit: false, canDelete: false, canViewSensitive: true,
           grupos: { canCreate: false, canEdit: false, canDelete: false },
           empresas: { canCreate: false, canEdit: false, canDelete: false }
         };
         break;
       default:
         permissions = {
           canCreate: false, canEdit: false, canDelete: false, canViewSensitive: false,
           grupos: { canCreate: false, canEdit: false, canDelete: false },
           empresas: { canCreate: false, canEdit: false, canDelete: false }
         };
    }
    
    console.log(`  ${permissions.canViewSensitive ? '✅' : '❌'} Pode ver Ponto Focal: ${permissions.canViewSensitive}`);
    console.log(`  ${permissions.grupos.canCreate ? '✅' : '❌'} Pode criar grupos: ${permissions.grupos.canCreate}`);
    console.log(`  ${permissions.grupos.canEdit ? '✅' : '❌'} Pode editar grupos: ${permissions.grupos.canEdit}`);
    console.log(`  ${permissions.grupos.canDelete ? '✅' : '❌'} Pode excluir grupos: ${permissions.grupos.canDelete}`);
    console.log(`  ${permissions.empresas.canCreate ? '✅' : '❌'} Pode criar empresas: ${permissions.empresas.canCreate}`);
    console.log(`  ${permissions.empresas.canEdit ? '✅' : '❌'} Pode editar empresas: ${permissions.empresas.canEdit}`);
    console.log(`  ${permissions.empresas.canDelete ? '✅' : '❌'} Pode excluir empresas: ${permissions.empresas.canDelete}`);
  });
};

// Chama o teste automaticamente no desenvolvimento
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  testPermissions();
} 