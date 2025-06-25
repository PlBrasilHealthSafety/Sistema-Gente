import { Empresa } from '../types/empresa.types';

interface ConfirmarExclusaoDefinitivaModalProps {
  empresa: Empresa;
  isSubmitting: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
}

export default function ConfirmarExclusaoDefinitivaModal({
  empresa,
  isSubmitting,
  onConfirmar,
  onCancelar
}: ConfirmarExclusaoDefinitivaModalProps) {
  return (
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
              <h3 className="text-lg font-medium text-gray-900">Confirmar Exclusão Definitiva</h3>
              <p className="text-sm text-gray-500 mt-1">
                Tem certeza que deseja EXCLUIR DEFINITIVAMENTE a empresa "{empresa.nome_fantasia}"?
              </p>
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-800">
              <strong>⚠️ ATENÇÃO:</strong> Esta ação NÃO pode ser desfeita! A empresa será removida permanentemente do sistema, incluindo todos os seus dados associados.
            </p>
          </div>
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={onCancelar}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg text-sm transition-all duration-200 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirmar}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Excluindo...' : 'Sim, Excluir Definitivamente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 