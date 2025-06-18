import { Empresa } from '../types/empresa.types';
import PontoFocalTooltip from '@/components/PontoFocalTooltip';

interface Permissions {
  canEdit: boolean;
  canDelete: boolean;
  canViewSensitive: boolean;
}

interface TabelaEmpresasProps {
  empresas: Empresa[];
  onEditar: (empresa: Empresa) => void;
  onExcluir: (empresa: Empresa) => void;
  pesquisaTexto?: string;
  permissions: Permissions;
}



export default function TabelaEmpresas({ empresas, onEditar, onExcluir, pesquisaTexto, permissions }: TabelaEmpresasProps) {
  return (
    <div className="p-6">
      <div className="border border-gray-200 rounded-lg overflow-hidden">
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
              {(permissions.canEdit || permissions.canDelete) && (
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ações</th>
              )}
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
                  {(permissions.canEdit || permissions.canDelete) && (
                    <td className="px-4 py-3 text-sm">
                      <div className="flex space-x-2">
                        {permissions.canEdit && (
                          <button 
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium cursor-pointer" 
                            onClick={() => onEditar(empresa)}
                          >
                            Editar
                          </button>
                        )}
                        {permissions.canDelete && (
                          <button 
                            className="text-red-600 hover:text-red-800 text-xs font-medium cursor-pointer" 
                            onClick={() => onExcluir(empresa)}
                          >
                            Excluir
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td 
                  colSpan={
                    7 + 
                    (permissions.canViewSensitive ? 1 : 0) + 
                    (permissions.canEdit || permissions.canDelete ? 1 : 0)
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