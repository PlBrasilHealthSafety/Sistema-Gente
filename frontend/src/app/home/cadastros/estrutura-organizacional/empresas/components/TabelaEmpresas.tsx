import { Empresa } from '../types/empresa.types';

interface TabelaEmpresasProps {
  empresas: Empresa[];
  onEditar: (empresa: Empresa) => void;
  onExcluir: (empresa: Empresa) => void;
  pesquisaTexto?: string;
}

export default function TabelaEmpresas({ empresas, onEditar, onExcluir, pesquisaTexto }: TabelaEmpresasProps) {
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
              <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Ponto Focal</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Situação</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Ações</th>
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
                  <td className="px-4 py-3 text-center">
                    {empresa.ponto_focal_descricao ? (
                      <div className="flex justify-center">
                        <div 
                          className="w-6 h-6 bg-[#00A298] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#1D3C44] transition-colors duration-200"
                          title={`Ponto Focal: ${empresa.ponto_focal_descricao.substring(0, 100)}${empresa.ponto_focal_descricao.length > 100 ? '...' : ''}`}
                        >
                          <span className="text-white text-xs">💚</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-300">-</span>
                    )}
                  </td>
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
                    <div className="flex space-x-2">
                      <button 
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium" 
                        onClick={() => onEditar(empresa)}
                      >
                        Editar
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-800 text-xs font-medium" 
                        onClick={() => onExcluir(empresa)}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
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