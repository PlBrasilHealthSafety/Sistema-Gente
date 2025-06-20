import { Grupo, Regiao, Empresa } from '../types/empresa.types';

interface FormularioBuscaProps {
  // Estados de busca
  searchType: string;
  pesquisaTexto: string;
  grupoFiltro: string;
  regiaoFiltro: string;
  situacaoBusca: string;
  
  // Dados para seletores
  gruposAtivos: Grupo[];
  regioesFiltroFiltradas: Regiao[];
  
  // Autocomplete
  showAutocomplete: boolean;
  autocompleteResults: Empresa[];
  
  // Callbacks
  onSearchTypeChange: (type: string) => void;
  onPesquisaTextoChange: (texto: string) => void;
  onGrupoFiltroChange: (grupo: string) => void;
  onRegiaoFiltroChange: (regiao: string) => void;
  onSituacaoBuscaChange: (situacao: string) => void;
  onProcurar: () => void;
  onNovaEmpresa: () => void;
  onRecarregar: () => void;
  onSelectAutocomplete: (empresa: Empresa) => void;
}

export default function FormularioBusca({
  searchType,
  pesquisaTexto,
  grupoFiltro,
  regiaoFiltro,
  situacaoBusca,
  gruposAtivos,
  regioesFiltroFiltradas,
  showAutocomplete,
  autocompleteResults,
  onSearchTypeChange,
  onPesquisaTextoChange,
  onGrupoFiltroChange,
  onRegiaoFiltroChange,
  onSituacaoBuscaChange,
  onProcurar,
  onNovaEmpresa,
  onRecarregar,
  onSelectAutocomplete
}: FormularioBuscaProps) {

  const getPlaceholder = (type: string) => {
    switch (type) {
      case 'nome':
        return 'Digite o nome fantasia...';
      case 'n de inscrição':
        return 'Digite o n° de inscrição...';
      case 'razao':
        return 'Digite a razão social...';
      case 'codigo':
        return 'Digite o código...';
      case 'regiao':
        return 'Digite a região...';
      default:
        return 'Digite para buscar...';
    }
  };

  return (
    <div className="p-6 border-b border-gray-200">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex gap-2 min-w-96">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pesquisar por
            </label>
            <select 
              value={searchType}
              onChange={(e) => onSearchTypeChange(e.target.value)}
              className="w-40 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
            >
              <option value="nome">Nome Fantasia</option>
              <option value="n de inscrição">N° de Inscrição</option>
              <option value="razao">Razão Social</option>
              <option value="codigo">Código</option>
              <option value="regiao">Região</option>
            </select>
          </div>
          <div className="flex-1 relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              &nbsp;
            </label>
            <input
              type="text"
              value={pesquisaTexto}
              onChange={(e) => onPesquisaTextoChange(e.target.value)}
              placeholder={getPlaceholder(searchType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
            />
            
            {/* Dropdown do autocomplete */}
            {showAutocomplete && autocompleteResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {autocompleteResults.map((empresa) => (
                  <div
                    key={empresa.id}
                    onClick={() => onSelectAutocomplete(empresa)}
                    className="px-4 py-3 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="font-medium text-gray-900">{empresa.nome_fantasia}</div>
                    <div className="text-sm text-gray-500 mt-1">
                      <span className="text-blue-600">📋 {empresa.codigo}</span>
                      {empresa.numero_inscricao && (
                        <span className="ml-2 text-green-600">🆔 {empresa.numero_inscricao}</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {empresa.razao_social}
                      {empresa.regiao && (
                        <span className="ml-2 text-purple-600">📍 {empresa.regiao.nome}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Grupo
          </label>
          <select 
            value={grupoFiltro}
            onChange={(e) => onGrupoFiltroChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
          >
            <option value="">Todos os grupos</option>
            {gruposAtivos && Array.isArray(gruposAtivos) && gruposAtivos.map(grupo => (
              <option key={grupo.id} value={grupo.id}>{grupo.nome}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Região
          </label>
          <select 
            value={regiaoFiltro}
            onChange={(e) => onRegiaoFiltroChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
          >
            <option value="">Todas as regiões</option>
            {regioesFiltroFiltradas && Array.isArray(regioesFiltroFiltradas) && regioesFiltroFiltradas.map(regiao => (
              <option key={regiao.id} value={regiao.id}>{regiao.nome}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Situação
          </label>
          <select 
            value={situacaoBusca}
            onChange={(e) => onSituacaoBuscaChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
          >
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
            <option value="todos">Todos</option>
          </select>
        </div>

        {/* Botões alinhados na mesma linha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            &nbsp;
          </label>
          <button 
            onClick={onProcurar}
            className="bg-green-600 hover:bg-green-700 text-white px-2 py-1.5 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer text-xs"
          >
            PROCURAR
          </button>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            &nbsp;
          </label>
          <button 
            onClick={onNovaEmpresa}
            className="bg-[#00A298] hover:bg-[#1D3C44] text-white px-2 py-1.5 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer text-xs"
          >
            NOVA EMPRESA
          </button>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            &nbsp;
          </label>
          <button 
            onClick={onRecarregar}
            className="bg-gray-400 hover:bg-gray-500 text-white px-2 py-1.5 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer text-xs"
          >
            RECARREGAR
          </button>
        </div>
      </div>
    </div>
  );
} 