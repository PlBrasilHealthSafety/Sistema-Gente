import { Profissional } from '../types/profissional.types';
import { formatTexto } from '@/utils/masks';

interface FormularioBuscaProps {
  // Estados de busca
  tipoPesquisa: string;
  nomeBusca: string;
  situacaoBusca: string;
  
  // Autocomplete
  showAutocomplete: boolean;
  autocompleteResults: Profissional[];
  
  // Callbacks
  onTipoPesquisaChange: (tipo: string) => void;
  onNomeBuscaChange: (texto: string) => void;
  onSituacaoBuscaChange: (situacao: string) => void;
  onProcurar: () => void;
  onNovoProfissional: () => void;
  onRecarregar: () => void;
  onSelectAutocomplete: (profissional: Profissional) => void;
  getPlaceholder: (tipo: string) => string;
  destacarTexto: (texto: string, busca: string) => React.ReactNode;
}

export default function FormularioBusca({
  tipoPesquisa,
  nomeBusca,
  situacaoBusca,
  showAutocomplete,
  autocompleteResults,
  onTipoPesquisaChange,
  onNomeBuscaChange,
  onSituacaoBuscaChange,
  onProcurar,
  onNovoProfissional,
  onRecarregar,
  onSelectAutocomplete,
  getPlaceholder,
  destacarTexto
}: FormularioBuscaProps) {
  return (
    <div className="p-6 border-b border-gray-200">
      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-64 relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pesquisar por
          </label>
          <select 
            value={tipoPesquisa}
            onChange={(e) => onTipoPesquisaChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
          >
            <option value="nome">Nome</option>
            <option value="categoria">Categoria</option>
            <option value="numero_conselho">Número Conselho</option>
          </select>
        </div>
        
        <div className="flex-1 min-w-64 relative">
          <input
            type="text"
            value={nomeBusca}
            onChange={(e) => {
              const value = tipoPesquisa === 'numero_conselho' ? e.target.value : formatTexto(e.target.value);
              onNomeBuscaChange(value);
            }}
            onFocus={() => {
              if (nomeBusca.trim()) {
                // Trigger autocomplete when focusing with existing text
              }
            }}
            onBlur={() => {
              setTimeout(() => {
                // Hide autocomplete after delay to allow click
              }, 200);
            }}
            placeholder={getPlaceholder(tipoPesquisa)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
          />
          
          {/* Dropdown do autocomplete */}
          {showAutocomplete && autocompleteResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {autocompleteResults.map((profissional) => (
                <div
                  key={profissional.id}
                  onClick={() => onSelectAutocomplete(profissional)}
                  className="px-4 py-3 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900">{destacarTexto(profissional.nome, nomeBusca)}</div>
                  <div className="text-sm text-gray-500">{profissional.categoria}</div>
                  <div className="text-xs text-blue-600 mt-1">
                    Situação: {profissional.situacao}
                  </div>
                </div>
              ))}
            </div>
          )}
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

        <button 
          onClick={onProcurar}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer ml-2"
        >
          PROCURAR  
        </button>
        
        <button 
          onClick={onNovoProfissional}
          className="bg-[#00A298] hover:bg-[#1D3C44] text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
        >
          NOVO PROFISSIONAL
        </button>
        
        <button 
          onClick={onRecarregar}
          className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
        >
          RECARREGAR
        </button>
      </div>
    </div>
  );
} 