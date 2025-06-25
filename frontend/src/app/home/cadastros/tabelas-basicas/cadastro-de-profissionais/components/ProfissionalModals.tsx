import { Profissional } from '../types/profissional.types';
import { formatTexto } from '@/utils/masks';

interface ProfissionalModalsProps {
  // Modal de Visualização
  showViewModal: boolean;
  profissionalVisualizando: Profissional | null;
  onCloseView: () => void;

  // Modal de Edição
  showEditModal: boolean;
  profissionalEditando: Profissional | null;
  nomeProfissional: string;
  categoria: string;
  siglaConselho: string;
  numeroConselho: string;
  externo: boolean;
  ofensor: string;
  clinica: string;
  situacao: string;
  isSubmitting: boolean;
  onNomeChange: (value: string) => void;
  onCategoriaChange: (value: string) => void;
  onSiglaConselhoChange: (value: string) => void;
  onNumeroConselhoChange: (value: string) => void;
  onExternoChange: (value: boolean) => void;
  onOfensorChange: (value: string) => void;
  onClinicaChange: (value: string) => void;
  onSituacaoChange: (value: string) => void;
  onSave: () => void;
  onSaveEdit: () => void;
  onClearEdit: () => void;
  onCloseEdit: () => void;

  // Modal de Confirmação de Inativação
  showDeleteModal: boolean;
  profissionalExcluindo: Profissional | null;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;

  // Modal de Confirmação de Exclusão Definitiva
  showDeleteDefinitivoModal: boolean;
  profissionalExcluindoDefinitivo: Profissional | null;
  onConfirmDeleteDefinitivo: () => void;
  onCancelDeleteDefinitivo: () => void;
}

export default function ProfissionalModals({
  // Visualização
  showViewModal,
  profissionalVisualizando,
  onCloseView,

  // Edição
  showEditModal,
  profissionalEditando,
  nomeProfissional,
  categoria,
  siglaConselho,
  numeroConselho,
  externo,
  ofensor,
  clinica,
  situacao,
  isSubmitting,
  onNomeChange,
  onCategoriaChange,
  onSiglaConselhoChange,
  onNumeroConselhoChange,
  onExternoChange,
  onOfensorChange,
  onClinicaChange,
  onSituacaoChange,
  onSave,
  onSaveEdit,
  onClearEdit,
  onCloseEdit,

  // Inativação
  showDeleteModal,
  profissionalExcluindo,
  onConfirmDelete,
  onCancelDelete,

  // Exclusão Definitiva
  showDeleteDefinitivoModal,
  profissionalExcluindoDefinitivo,
  onConfirmDeleteDefinitivo,
  onCancelDeleteDefinitivo
}: ProfissionalModalsProps) {
  return (
    <>
      {/* Modal de Visualização */}
      {showViewModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-bold text-[#1D3C44] mb-4">Visualizar Profissional</h3>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Dados cadastrais</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                    <input
                      type="text"
                      value={profissionalVisualizando?.nome || ''}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                    <input
                      type="text"
                      value={profissionalVisualizando?.categoria || ''}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sigla Conselho</label>
                    <input
                      type="text"
                      value={profissionalVisualizando?.sigla_conselho || ''}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Número Conselho</label>
                    <input
                      type="text"
                      value={profissionalVisualizando?.numero_conselho || ''}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Profissional Externo</label>
                    <input
                      type="text"
                      value={profissionalVisualizando?.externo ? 'Sim' : 'Não'}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ofensor</label>
                    <input
                      type="text"
                      value={profissionalVisualizando?.ofensor || 'Não informado'}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Clínica</label>
                    <input
                      type="text"
                      value={profissionalVisualizando?.clinica || 'Não informado'}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Situação</label>
                    <input
                      type="text"
                      value={profissionalVisualizando?.situacao || ''}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={onCloseView}
                    className="bg-gray-400 hover:bg-gray-500 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    FECHAR
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {showEditModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-bold text-[#1D3C44] mb-4">Editar Profissional</h3>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-4">Dados cadastrais</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nome</label>
                    <input
                      type="text"
                      value={nomeProfissional}
                      onChange={(e) => onNomeChange(formatTexto(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                      placeholder="Digite o nome do profissional (apenas letras)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Categoria</label>
                    <select
                      value={categoria}
                      onChange={(e) => onCategoriaChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                    >
                      <option value="">Selecione uma categoria</option>
                      <option value="Médico">Médico</option>
                      <option value="Enfermeiro">Enfermeiro</option>
                      <option value="Técnico de Enfermagem">Técnico de Enfermagem</option>
                      <option value="Auxiliar de Enfermagem">Auxiliar de Enfermagem</option>
                      <option value="Fisioterapeuta">Fisioterapeuta</option>
                      <option value="Psicólogo">Psicólogo</option>
                      <option value="Nutricionista">Nutricionista</option>
                      <option value="Fonoaudiólogo">Fonoaudiólogo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sigla Conselho</label>
                    <select
                      value={siglaConselho}
                      onChange={(e) => onSiglaConselhoChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                    >
                      <option value="">Selecione a sigla</option>
                      <option value="CRM">CRM</option>
                      <option value="COREN">COREN</option>
                      <option value="CREFITO">CREFITO</option>
                      <option value="CRP">CRP</option>
                      <option value="CRN">CRN</option>
                      <option value="CRFa">CRFa</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Número Conselho</label>
                    <input
                      type="text"
                      value={numeroConselho}
                      onChange={(e) => onNumeroConselhoChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                      placeholder="Digite o número do conselho"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Profissional Externo</label>
                    <select
                      value={externo ? 'true' : 'false'}
                      onChange={(e) => onExternoChange(e.target.value === 'true')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                    >
                      <option value="false">Não</option>
                      <option value="true">Sim</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ofensor</label>
                    <input
                      type="text"
                      value={ofensor}
                      onChange={(e) => onOfensorChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                      placeholder="Digite o ofensor"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Clínica</label>
                    <input
                      type="text"
                      value={clinica}
                      onChange={(e) => onClinicaChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                      placeholder="Digite a clínica"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Situação</label>
                    <select
                      value={situacao}
                      onChange={(e) => onSituacaoChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={onSaveEdit}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'SALVANDO...' : 'SALVAR'}
                  </button>
                  <button
                    onClick={onClearEdit}
                    className="bg-blue-400 hover:bg-blue-500 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    LIMPAR
                  </button>
                  <button
                    onClick={onCloseEdit}
                    className="bg-gray-400 hover:bg-gray-500 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    RETORNAR
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Inativação */}
      {showDeleteModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Confirmar Inativação</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Tem certeza que deseja inativar o profissional &quot;{profissionalExcluindo?.nome}&quot;?
                  </p>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Atenção:</strong> O profissional será marcado como inativo e não aparecerá mais nos seletores. Esta ação pode ser revertida alterando o status para ativo novamente.
                </p>
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={onCancelDelete}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg text-sm transition-all duration-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={onConfirmDelete}
                  disabled={isSubmitting}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Inativando...' : 'Sim, Inativar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão Definitiva */}
      {showDeleteDefinitivoModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Excluir Definitivamente</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Tem certeza que deseja excluir DEFINITIVAMENTE o profissional &quot;{profissionalExcluindoDefinitivo?.nome}&quot;?
                  </p>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800">
                  <strong>ATENÇÃO:</strong> Esta ação é irreversível! O profissional será excluído permanentemente do banco de dados e não poderá ser recuperado.
                </p>
              </div>
              
              <div className="flex gap-3 justify-end">
                <button
                  onClick={onCancelDeleteDefinitivo}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg text-sm transition-all duration-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={onConfirmDeleteDefinitivo}
                  disabled={isSubmitting}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Excluindo...' : 'Sim, Excluir Definitivamente'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 