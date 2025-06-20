import { useState } from 'react';
import { PontoFocalDisplayData, PontoFocal } from '@/types/pontoFocal';

interface PontoFocalTooltipProps {
  data: PontoFocalDisplayData;
}

export default function PontoFocalTooltip({ data }: PontoFocalTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  // Função para converter dados atuais para novos pontos focais (compatibilidade)
  const getPontosFocais = (): PontoFocal[] => {
    // Se tem novos pontos focais, usar eles
    if (data.pontosFocais && data.pontosFocais.length > 0) {
      return data.pontosFocais;
    }
    
    // Se tem dados antigos, converter para novo formato
    if (data.ponto_focal_nome || data.ponto_focal_descricao || data.ponto_focal_observacoes) {
      return [{
        id: 'legacy',
        nome: data.ponto_focal_nome || '',
        descricao: data.ponto_focal_descricao || '',
        observacoes: data.ponto_focal_observacoes || '',
        isPrincipal: data.ponto_focal_principal || false
      }];
    }

    return [];
  };

  const pontosFocais = getPontosFocais();
  const pontoFocalPrincipal = pontosFocais.find(pf => pf.isPrincipal);
  
  // Se não tem pontos focais ou não tem principal, não mostrar
  if (pontosFocais.length === 0 || !pontoFocalPrincipal) {
    return <span className="text-gray-300">-</span>;
  }

  return (
    <div className="relative flex justify-center">
      <div 
        className="cursor-pointer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Ícone de lâmpada acesa com contador se há múltiplos */}
        <div className="relative">
          <svg 
            className="w-6 h-6 text-yellow-500 hover:text-yellow-600 transition-colors duration-200" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.477.859h4z"/>
          </svg>
          
          {/* Contador de pontos focais */}
          {pontosFocais.length > 1 && (
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
              {pontosFocais.length}
            </span>
          )}
        </div>
      </div>
      
      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-gray-800 text-white text-xs rounded-lg py-3 px-4 shadow-lg max-w-xs w-64">
            <div className="space-y-3">
              {/* Cabeçalho */}
              <div className="text-yellow-300 font-semibold border-b border-gray-600 pb-1">
                🌟 Ponto Focal Principal
                {pontosFocais.length > 1 && (
                  <span className="ml-2 text-blue-300">
                    (1 de {pontosFocais.length})
                  </span>
                )}
              </div>
              
              {/* Dados do ponto focal principal */}
              {pontoFocalPrincipal.nome && (
                <div>
                  <span className="text-gray-300 font-medium">Nome:</span>
                  <div className="text-white mt-1">{pontoFocalPrincipal.nome}</div>
                </div>
              )}
              
              {pontoFocalPrincipal.descricao && (
                <div>
                  <span className="text-gray-300 font-medium">Descrição:</span>
                  <div className="text-white mt-1 break-words">{pontoFocalPrincipal.descricao}</div>
                </div>
              )}
              
              {pontoFocalPrincipal.observacoes && (
                <div>
                  <span className="text-gray-300 font-medium">Observações:</span>
                  <div className="text-white mt-1 break-words">{pontoFocalPrincipal.observacoes}</div>
                </div>
              )}

              {/* Indicador de pontos focais adicionais */}
              {pontosFocais.length > 1 && (
                <div className="border-t border-gray-600 pt-2 mt-2">
                  <div className="text-blue-300 text-xs font-medium">
                    + {pontosFocais.length - 1} outro(s) ponto(s) focal(is)
                  </div>
                  <div className="text-gray-400 text-xs mt-1">
                    Clique em "Visualizar" para ver todos
                  </div>
                </div>
              )}
            </div>
            
            {/* Seta do tooltip */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2">
              <div className="border-4 border-transparent border-t-gray-800"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 