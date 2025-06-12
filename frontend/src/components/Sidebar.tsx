'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface MenuItem {
  id: string;
  name: string;
  icon: string;
  href: string;
  children?: MenuItem[];
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<{[key: string]: boolean}>({
    cadastros: true,
    'tabelas-basicas': false
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    }
  }, []);

  const getRoleName = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Super Admin';
      case 'ADMIN':
        return 'Admin';
      case 'USER':
        return 'User';
      default:
        return role.toLowerCase();
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

  const menuItems: MenuItem[] = [
    {
      id: 'cadastros',
      name: 'Cadastros',
      icon: '👥',
      href: '/home/cadastros',
      children: [
        {
          id: 'estrutura-organizacional',
          name: 'Estrutura Organizacional',
          icon: '',
          href: '/home/cadastros/estrutura-organizacional'
        },
        {
          id: 'tabelas-basicas',
          name: 'Tabelas Básicas',
          icon: '',
          href: '/home/cadastros/tabelas-basicas',
          children: [
            { id: 'profissionais', name: 'Profissionais', icon: '', href: '/home/cadastros/profissionais' },
            { id: 'credenciados', name: 'Credenciados', icon: '', href: '/home/cadastros/credenciados' },
            { id: 'servicos', name: 'Serviços', icon: '', href: '/home/cadastros/servicos' },
            { id: 'agentes-risco', name: 'Agentes de Risco', icon: '', href: '/home/cadastros/agentes-risco' },
            { id: 'tipos-afastamento', name: 'Tipos de Afastamento', icon: '', href: '/home/cadastros/tipos-afastamento' },
            { id: 'especialidades', name: 'Especialidades', icon: '', href: '/home/cadastros/especialidades' },
            { id: 'procedimentos', name: 'Procedimentos', icon: '', href: '/home/cadastros/procedimentos' },
            { id: 'queixas', name: 'Queixas', icon: '', href: '/home/cadastros/queixas' },
            { id: 'documentos', name: 'Documentos', icon: '', href: '/home/cadastros/documentos' }
          ]
        }
      ]
    },
    {
      id: 'funcionarios',
      name: 'Funcionários',
      icon: '👤',
      href: '/home/funcionarios'
    },
    {
      id: 'empresa',
      name: 'Empresa',
      icon: '🏢',
      href: '/home/empresa'
    },
    {
      id: 'faturamento',
      name: 'Faturamento',
      icon: '💰',
      href: '/home/faturamento'
    },
    {
      id: 'relatorios',
      name: 'Relatórios',
      icon: '📊',
      href: '/home/relatorios'
    },
    {
      id: 'indicadores',
      name: 'Indicadores',
      icon: '📈',
      href: '/home/indicadores'
    },
    {
      id: 'sst',
      name: 'SST',
      icon: '🛡️',
      href: '/home/sst'
    },
    {
      id: 'esocial',
      name: 'eSocial',
      icon: '🔄',
      href: '/home/esocial'
    },
    
  ];

  const toggleMenuExpansion = (menuId: string) => {
    if (collapsed) return; // Não permite expandir se o sidebar estiver colapsado
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const handleNavigation = (href: string) => {
    router.push(href);
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus[item.id];

    return (
      <div key={item.id}>
        <button
          onClick={() => {
            if (hasChildren && !collapsed) {
              toggleMenuExpansion(item.id);
            } else {
              handleNavigation(item.href);
            }
          }}
          className={`w-full flex items-center justify-between p-${level === 0 ? '3' : '2'} ${level === 0 ? 'mb-1' : ''} rounded-lg transition-all duration-200 hover:bg-gray-${level === 0 ? '100' : '50'} cursor-pointer text-[#1D3C44] hover:text-[#00A298] ${collapsed && level === 0 ? 'justify-center' : ''}`}
          title={collapsed ? item.name : ''}
        >
          <div className={`flex items-center ${collapsed && level === 0 ? 'justify-center' : 'w-full'}`}>
            {level === 0 && (
              <span className="text-xl min-w-[24px]">{item.icon}</span>
            )}
            {!collapsed && (
              <span className={`${level === 0 ? 'ml-3' : 'ml-2'} font-medium text-${level === 0 ? 'sm' : 'xs'} text-left ${collapsed && level === 0 ? 'hidden' : 'w-full'}`}>
                {item.name}
              </span>
            )}
          </div>
          {hasChildren && !collapsed && (
            <span className={`text-${level === 0 ? 'sm' : 'xs'} transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          )}
        </button>

        {hasChildren && isExpanded && !collapsed && (
          <div className="ml-4 space-y-0.5 mt-1">
            {item.children!.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 fixed left-0 top-16 bottom-0 z-40`}>
      {/* Toggle Button */}
      <div className="p-2 border-b border-gray-200">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 text-[#1D3C44] hover:text-[#00A298] transition-colors"
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          <svg className={`w-5 h-5 transition-transform duration-200 ${collapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
          {!collapsed && <span className="ml-2 text-sm font-medium"></span>}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto p-2 pb-4 menu-scrollbar">
        <div className="space-y-1">
          {menuItems.map(item => renderMenuItem(item))}
        </div>
        
        {/* Informações do usuário no fundo da página */}
        {!collapsed && user && (
          <div className="absolute bottom-4 left-0 right-0 px-4">
            <div className="bg-gradient-to-r from-[#00A298]/5 to-[#1D3C44]/5 rounded-xl p-4 border border-gray-200/50 backdrop-blur-sm">
              <div className="text-center">
                {/* Avatar do usuário */}
                <div className="w-12 h-12 bg-gradient-to-br from-[#00A298] to-[#1D3C44] rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white font-bold text-lg">
                    {user.first_name.charAt(0).toUpperCase()}{user.last_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                
                {/* Nome do usuário */}
                <div className="text-sm font-medium text-[#1D3C44] mb-2 leading-tight">
                  {user.first_name} {user.last_name}
                </div>
                
                {/* Email do usuário */}
                <div className="text-xs text-gray-600 mb-2 truncate">
                  {user.email}
                </div>
                
                {/* Role do usuário */}
                <div className={`text-xs px-3 py-1 rounded-full inline-block ${getRoleColor(user.role)} font-medium`}>
                  {getRoleName(user.role)}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Ícone do usuário quando collapsed */}
        {collapsed && user && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#00A298] to-[#1D3C44] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">
                {user.first_name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
} 