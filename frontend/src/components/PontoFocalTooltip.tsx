import { useState, useRef, useEffect } from 'react';
import { PontoFocalDisplayData, PontoFocal } from '@/types/pontoFocal';

interface PontoFocalTooltipProps {
  data: PontoFocalDisplayData;
}

export default function PontoFocalTooltip({ data }: PontoFocalTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom'>('top');
  const triggerRef = useRef<HTMLDivElement>(null);

  // Função para converter dados atuais para novos pontos focais (compatibilidade)
  const getPontosFocais = (): PontoFocal[] => {
    // Se tem novos pontos focais, usar eles
    if (data.pontosFocais && data.pontosFocais.length > 0) {
      return data.pontosFocais.map(pf => ({
        id: pf.id?.toString() || 'temp',
        nome: pf.nome || '',
        descricao: pf.descricao || '',
        observacoes: pf.observacoes || '',
        isPrincipal: pf.is_principal || pf.isPrincipal || false
      }));
    }
    
    // Verificar se tem no formato pontos_focais (vindo do backend)
    if ((data as any).pontos_focais && Array.isArray((data as any).pontos_focais) && (data as any).pontos_focais.length > 0) {
      return (data as any).pontos_focais.map((pf: any) => ({
        id: pf.id?.toString() || 'temp',
        nome: pf.nome || '',
        descricao: pf.descricao || '',
        observacoes: pf.observacoes || '',
        isPrincipal: pf.is_principal || pf.isPrincipal || false
      }));
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

  // Função para calcular a melhor posição do tooltip
  const calculateTooltipPosition = () => {
    if (!triggerRef.current) return;
    
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceAbove = rect.top;
    const spaceBelow = viewportHeight - rect.bottom;
    
    // Se há mais espaço embaixo ou se está muito no topo, mostrar embaixo
    if (spaceBelow > spaceAbove || spaceAbove < 200) {
      setTooltipPosition('bottom');
    } else {
      setTooltipPosition('top');
    }
  };

  const handleMouseEnter = () => {
    calculateTooltipPosition();
    setShowTooltip(true);
  };

  useEffect(() => {
    if (showTooltip) {
      calculateTooltipPosition();
    }
  }, [showTooltip]);

  const pontosFocais = getPontosFocais();
  const pontoFocalPrincipal = pontosFocais.find(pf => pf.isPrincipal);
  // Se não tem principal, usar o primeiro ponto focal
  const pontoFocalExibir = pontoFocalPrincipal || pontosFocais[0];
  
  // Se não tem pontos focais, não mostrar
  if (pontosFocais.length === 0) {
    return <span className="text-gray-300">-</span>;
  }

  return (
    <div className="relative flex justify-center">
      <div 
        ref={triggerRef}
        className="cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Ícone de lâmpada acesa com contador se há múltiplos */}
        <div className="relative">
          <svg 
            className="w-5 h-5 text-yellow-500 hover:text-yellow-600 transition-colors duration-200" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.477.859h4z"/>
          </svg>
          
          {/* Contador de pontos focais */}
          {pontosFocais.length > 1 && (
            <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-3 h-3 flex items-center justify-center font-bold text-[10px]">
              {pontosFocais.length}
            </span>
          )}
        </div>
      </div>
      
      {/* Tooltip simplificado */}
      {showTooltip && (
        <div 
          className={`fixed z-[9999] left-1/2 transform -translate-x-1/2 ${
            tooltipPosition === 'top' 
              ? 'bottom-full mb-2' 
              : 'top-full mt-2'
          }`}
          style={{
            left: triggerRef.current ? 
              `${triggerRef.current.getBoundingClientRect().left + triggerRef.current.offsetWidth / 2}px` : 
              '50%',
            [tooltipPosition === 'top' ? 'bottom' : 'top']: triggerRef.current ? 
              (tooltipPosition === 'top' ? 
                `${window.innerHeight - triggerRef.current.getBoundingClientRect().top + 8}px` :
                `${triggerRef.current.getBoundingClientRect().bottom + 8}px`
              ) : 
              'auto'
          }}
        >
          <div className="bg-gray-800 text-white text-xs rounded-md py-2 px-3 shadow-lg whitespace-nowrap">
            <div className="flex items-center space-x-1">
              <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-medium">
                {pontoFocalExibir.nome}
              </span>
              {pontosFocais.length > 1 && (
                <span className="text-blue-300 text-[10px]">
                  (+{pontosFocais.length - 1})
                </span>
              )}
            </div>
            
            {/* Seta do tooltip */}
            <div className={`absolute left-1/2 transform -translate-x-1/2 ${
              tooltipPosition === 'top' ? 'top-full' : 'bottom-full'
            }`}>
              <div className={`border-3 border-transparent ${
                tooltipPosition === 'top' 
                  ? 'border-t-gray-800' 
                  : 'border-b-gray-800'
              }`}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 