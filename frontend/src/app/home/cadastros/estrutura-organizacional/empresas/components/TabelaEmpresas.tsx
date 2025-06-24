import { Empresa } from '../types/empresa.types';
import PontoFocalTooltip from '@/components/PontoFocalTooltip';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
}

interface Permissions {
  canEdit: boolean;
  canDelete: boolean;
  canViewSensitive: boolean;
}

interface TabelaEmpresasProps {
  empresas: Empresa[];
  onEditar: (empresa: Empresa) => void;
  onExcluir: (empresa: Empresa) => void;
  onInativar: (empresa: Empresa) => void;
  onReativar: (empresa: Empresa) => void;
  onExcluirDefinitivo: (empresa: Empresa) => void;
  onVisualizar: (empresa: Empresa) => void;
  pesquisaTexto?: string;
  permissions: Permissions;
  user: User;
}



export default function TabelaEmpresas({ empresas, onEditar, onExcluir, onInativar, onReativar, onExcluirDefinitivo, onVisualizar, pesquisaTexto, permissions, user }: TabelaEmpresasProps) {
  return (
    <div className="p-6">
      <div className="border border-gray-200 rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">CPF ou CNPJ</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Razão Social</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Nome Fantasia</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Código</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Grupo</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Região</th>
              {permissions.canViewSensitive && (
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Ponto Focal</th>
              )}
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Situação</th>
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Ações</th>
            </tr>
          </thead>
          <tbody>
            {empresas.length > 0 ? (
              empresas.map((empresa) => (
                <tr key={empresa.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{empresa.numero_inscricao || '-'}</td>
                  <td className="px-4 py-3 text-sm">{empresa.razao_social}</td>
                  <td className="px-4 py-3 text-sm">{empresa.nome_fantasia}</td>
                  <td className="px-4 py-3 text-sm">{empresa.codigo}</td>
                  <td className="px-4 py-3 text-sm">{empresa.grupo?.nome || '-'}</td>
                  <td className="px-4 py-3 text-sm">{empresa.regiao?.nome || '-'}</td>
                                      {permissions.canViewSensitive && (
                      <td className="px-4 py-3 text-center">
                        <PontoFocalTooltip data={empresa} />
                      </td>
                    )}
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      empresa.status === 'ativo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {empresa.status.toLowerCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex space-x-2 justify-center">
                      <button 
                        className="text-green-600 hover:text-green-800 text-xs font-medium cursor-pointer" 
                        onClick={() => onVisualizar(empresa)}
                      >
                        Visualizar
                      </button>
                      {permissions.canEdit && (
                        <button 
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium cursor-pointer" 
                          onClick={() => onEditar(empresa)}
                        >
                          Editar
                        </button>
                      )}
                      {/* Botão Reativar - apenas para ADMIN e SUPER_ADMIN quando a empresa está inativa */}
                      {(user.role === 'admin' || user.role === 'super_admin') && empresa.status === 'inativo' && (
                        <button 
                          className="text-emerald-600 hover:text-emerald-800 text-xs font-medium cursor-pointer" 
                          onClick={() => onReativar(empresa)}
                        >
                          Reativar
                        </button>
                      )}
                      {/* Botão Inativar - apenas para ADMIN e SUPER_ADMIN quando a empresa está ativa */}
                      {(user.role === 'admin' || user.role === 'super_admin') && empresa.status === 'ativo' && (
                        <button 
                          className="text-orange-600 hover:text-orange-800 text-xs font-medium cursor-pointer" 
                          onClick={() => onInativar(empresa)}
                        >
                          Inativar
                        </button>
                      )}
                      {/* Botão Excluir (físico) - apenas para SUPER_ADMIN */}
                      {user.role === 'super_admin' && (
                        <button 
                          className="text-red-600 hover:text-red-800 text-xs font-medium cursor-pointer" 
                          onClick={() => onExcluirDefinitivo(empresa)}
                        >
                          Excluir
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={
                    8 + 
                    (permissions.canViewSensitive ? 1 : 0)
                  } 
                  className="px-4 py-8 text-center text-gray-500"
                >
                  {pesquisaTexto ? 'Nenhuma empresa encontrada com os critérios pesquisados' : 'Não existem dados para mostrar'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 