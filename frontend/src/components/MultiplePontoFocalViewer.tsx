import React from 'react';
import { PontoFocal } from '@/types/pontoFocal';

interface MultiplePontoFocalViewerProps {
  pontosFocais: PontoFocal[];
  showSection: boolean;
  onToggleSection: () => void;
}

const MultiplePontoFocalViewer: React.FC<MultiplePontoFocalViewerProps> = ({
  pontosFocais,
  showSection,
  onToggleSection,
}) => {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700">
          Pontos Focais
        </label>
        
        <button
          type="button"
          onClick={onToggleSection}
          className="flex items-center space-x-2 px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-200"
        >
          <span>
            {showSection ? 'Ocultar Pontos Focais' : 'Visualizar Pontos Focais'}
            {pontosFocais.length > 0 && (
              <span className="ml-1 bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                {pontosFocais.length}
              </span>
            )}
          </span>
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${
              showSection ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {showSection && (
        <div className="space-y-4">
          {pontosFocais.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <p>Nenhum ponto focal cadastrado</p>
            </div>
          ) : (
            pontosFocais.map((pontoFocal, index) => (
              <div
                key={pontoFocal.id}
                className={`border rounded-lg p-4 ${
                  pontoFocal.isPrincipal
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h6 className="text-sm font-medium text-gray-700">
                    Ponto Focal {index + 1}
                  </h6>
                  {pontoFocal.isPrincipal && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Principal
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Nome
                    </label>
                    <input
                      type="text"
                      value={pontoFocal.nome}
                      readOnly
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Descrição
                    </label>
                    <textarea
                      value={pontoFocal.descricao}
                      readOnly
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Observações
                    </label>
                    <textarea
                      value={pontoFocal.observacoes}
                      readOnly
                      rows={2}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed resize-none"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MultiplePontoFocalViewer; 