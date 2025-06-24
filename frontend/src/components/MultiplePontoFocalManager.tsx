'use client';

import { useEffect, useState } from 'react';
import { PontoFocal } from '@/types/pontoFocal';

interface MultiplePontoFocalManagerProps {
  pontosFocais: PontoFocal[];
  onPontosFocaisChange: (pontosFocais: PontoFocal[]) => void;
  showSection: boolean;
  onToggleSection: () => void;
  onValidationChange?: (hasErrors: boolean) => void; // Callback opcional para informar sobre erros
}

export default function MultiplePontoFocalManager({
  pontosFocais,
  onPontosFocaisChange,
  showSection,
  onToggleSection,
  onValidationChange
}: MultiplePontoFocalManagerProps) {
  
  // Estado para armazenar erros de validação
  const [errosValidacao, setErrosValidacao] = useState<{[key: string]: {telefone?: string, email?: string}}>({});
  
  // Função para gerar ID único temporário
  const generateTempId = () => `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Função para validar telefone
  const validarTelefone = (telefone: string): string | null => {
    if (!telefone.trim()) return null; // Campo opcional
    
    // Remove todos os caracteres não numéricos
    const numeroLimpo = telefone.replace(/\D/g, '');
    
    // Verifica se tem pelo menos 10 dígitos (telefone fixo) ou 11 dígitos (celular)
    if (numeroLimpo.length < 10) {
      return 'Telefone deve ter pelo menos 10 dígitos';
    }
    
    if (numeroLimpo.length > 11) {
      return 'Telefone deve ter no máximo 11 dígitos';
    }
    
    // Se tem 11 dígitos, verifica se o primeiro dígito do celular é 9
    if (numeroLimpo.length === 11) {
      const codigoArea = numeroLimpo.substring(0, 2);
      const primeiroDigitoCelular = numeroLimpo.substring(2, 3);
      
      // Códigos de área válidos do Brasil (principais)
      const codigosAreaValidos = [
        '11', '12', '13', '14', '15', '16', '17', '18', '19', // SP
        '21', '22', '24', // RJ/ES
        '27', '28', // ES
        '31', '32', '33', '34', '35', '37', '38', // MG
        '41', '42', '43', '44', '45', '46', // PR
        '47', '48', '49', // SC
        '51', '53', '54', '55', // RS
        '61', // DF
        '62', '64', // GO
        '63', // TO
        '65', '66', // MT
        '67', // MS
        '68', // AC
        '69', // RO
        '71', '73', '74', '75', '77', // BA
        '79', // SE
        '81', '87', // PE
        '82', // AL
        '83', // PB
        '84', // RN
        '85', '88', // CE
        '86', '89', // PI
        '91', '93', '94', // PA
        '92', '97', // AM
        '95', // RR
        '96', // AP
        '98', '99' // MA
      ];
      
      if (!codigosAreaValidos.includes(codigoArea)) {
        return 'Código de área inválido';
      }
      
      if (primeiroDigitoCelular !== '9') {
        return 'Celular deve começar com 9 após o código de área';
      }
    }
    
    return null;
  };

  // Função para validar email
  const validarEmail = (email: string): string | null => {
    if (!email.trim()) return null; // Campo opcional
    
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!regexEmail.test(email)) {
      return 'Email deve ter um formato válido (exemplo@dominio.com)';
    }
    
    // Verificações adicionais
    if (email.length > 254) {
      return 'Email muito longo (máximo 254 caracteres)';
    }
    
    const partes = email.split('@');
    if (partes[0].length > 64) {
      return 'Parte local do email muito longa (máximo 64 caracteres)';
    }
    
    return null;
  };

  // Função para validar campo e atualizar erros
  const validarCampo = (pontoFocalId: string, campo: 'telefone' | 'email', valor: string) => {
    let erro: string | null = null;
    
    if (campo === 'telefone') {
      erro = validarTelefone(valor);
    } else if (campo === 'email') {
      erro = validarEmail(valor);
    }
    
    setErrosValidacao(prev => ({
      ...prev,
      [pontoFocalId]: {
        ...prev[pontoFocalId],
        [campo]: erro || undefined
      }
    }));
    
    return erro === null;
  };

  // Função para adicionar novo ponto focal
  const adicionarPontoFocal = () => {
    const novoPontoFocal: PontoFocal = {
      id: generateTempId(),
      nome: '',
      cargo: '',
      descricao: '',
      observacoes: '',
      telefone: '',
      email: '',
      isPrincipal: pontosFocais.length === 0 // Primeiro ponto focal é principal por padrão
    };

    onPontosFocaisChange([...pontosFocais, novoPontoFocal]);
  };

  // Função para remover ponto focal
  const removerPontoFocal = (id: string) => {
    const pontosFocaisAtualizados = pontosFocais.filter(pf => pf.id !== id);
    
    // Se removeu o principal e ainda há pontos focais, definir o primeiro como principal
    if (pontosFocaisAtualizados.length > 0) {
      const temPrincipal = pontosFocaisAtualizados.some(pf => pf.isPrincipal);
      if (!temPrincipal) {
        pontosFocaisAtualizados[0].isPrincipal = true;
      }
    }
    
    // Remover erros de validação do ponto focal removido
    setErrosValidacao(prev => {
      const novosErros = { ...prev };
      delete novosErros[id];
      return novosErros;
    });
    
    onPontosFocaisChange(pontosFocaisAtualizados);
  };

  // Função para atualizar ponto focal
  const atualizarPontoFocal = (id: string, campo: keyof PontoFocal, valor: string | boolean) => {
    const pontosFocaisAtualizados = pontosFocais.map(pf => {
      if (pf.id === id) {
        return { ...pf, [campo]: valor };
      }
      // Se está marcando outro como principal, desmarcar este
      if (campo === 'isPrincipal' && valor === true) {
        return { ...pf, isPrincipal: false };
      }
      return pf;
    });

    onPontosFocaisChange(pontosFocaisAtualizados);
  };

  // Efeito para garantir que sempre há um principal se há pontos focais
  useEffect(() => {
    if (pontosFocais.length > 0) {
      const temPrincipal = pontosFocais.some(pf => pf.isPrincipal);
      if (!temPrincipal) {
        const pontosFocaisAtualizados = [...pontosFocais];
        pontosFocaisAtualizados[0].isPrincipal = true;
        onPontosFocaisChange(pontosFocaisAtualizados);
      }
    }
  }, [pontosFocais, onPontosFocaisChange]);

  // Efeito para notificar quando há erros de validação
  useEffect(() => {
    if (onValidationChange) {
      const hasErrors = Object.values(errosValidacao).some(erros => 
        erros.telefone || erros.email
      );
      onValidationChange(hasErrors);
    }
  }, [errosValidacao, onValidationChange]);

  return (
    <div className="mt-3">
      {/* Botão para expandir seção - mantendo o mesmo layout */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={onToggleSection}
          className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 hover:border-[#1D3C44] cursor-pointer ${
            showSection 
              ? 'bg-[#00A298] border-[#00A298] text-white' 
              : 'border-[#00A298] text-[#00A298] hover:bg-[#00A298]/10'
          }`}
        >
          <span className="text-sm font-bold">
            {showSection ? '−' : '+'}
          </span>
        </button>
        <span className="ml-2 text-sm font-medium text-gray-700">
          Pontos Focais
          {pontosFocais.length > 0 && (
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {pontosFocais.length}
            </span>
          )}
        </span>
      </div>

      {/* Seção expandível dos Pontos Focais */}
      {showSection && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg transition-all duration-300">
          {/* Botão para adicionar novo ponto focal */}
          <div className="mb-4 flex justify-between items-center">
            <h6 className="text-sm font-medium text-gray-700">
              Gerenciar Pontos Focais
            </h6>
            <button
              type="button"
              onClick={adicionarPontoFocal}
              className="bg-[#00A298] hover:bg-[#1D3C44] text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 transform hover:scale-102 shadow-sm cursor-pointer"
            >
              + Adicionar Ponto Focal
            </button>
          </div>

          {/* Lista de pontos focais */}
          {pontosFocais.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-sm">
              Nenhum ponto focal adicionado ainda.
              <br />
              Clique em &quot;Adicionar Ponto Focal&quot; para começar.
            </div>
          ) : (
            <div className="space-y-4">
              {pontosFocais.map((pontoFocal, index) => (
                <div 
                  key={pontoFocal.id} 
                  className={`border border-gray-200 rounded-lg p-4 ${
                    pontoFocal.isPrincipal 
                      ? 'bg-yellow-50 border-yellow-300' 
                      : 'bg-white'
                  }`}
                >
                  {/* Cabeçalho do ponto focal */}
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-700">
                        Ponto Focal #{index + 1}
                      </span>
                      {pontoFocal.isPrincipal && (
                        <span className="ml-2 px-2 py-1 bg-yellow-200 text-yellow-800 text-xs rounded-full font-medium">
                          🌟 Principal
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removerPontoFocal(pontoFocal.id!)}
                      className="text-red-500 hover:text-red-700 p-1 rounded transition-colors duration-200"
                      title="Remover ponto focal"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>

                  {/* Campos do ponto focal */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome do Ponto Focal
                      </label>
                      <input
                        type="text"
                        value={pontoFocal.nome || ''}
                        onChange={(e) => atualizarPontoFocal(pontoFocal.id!, 'nome', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent text-sm"
                        placeholder="Digite o nome do ponto focal..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cargo do Ponto Focal
                      </label>
                      <input
                        type="text"
                        value={pontoFocal.cargo || ''}
                        onChange={(e) => atualizarPontoFocal(pontoFocal.id!, 'cargo', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent text-sm"
                        placeholder="Digite o cargo do ponto focal..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descrição do Ponto Focal
                      </label>
                      <textarea
                        rows={2}
                        value={pontoFocal.descricao || ''}
                        onChange={(e) => atualizarPontoFocal(pontoFocal.id!, 'descricao', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent text-sm"
                        placeholder="Digite a descrição do ponto focal..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefone do Ponto Focal
                      </label>
                      <input
                        type="text"
                        value={pontoFocal.telefone || ''}
                        onChange={(e) => {
                          const valor = e.target.value;
                          atualizarPontoFocal(pontoFocal.id!, 'telefone', valor);
                          validarCampo(pontoFocal.id!, 'telefone', valor);
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent text-sm ${
                          errosValidacao[pontoFocal.id!]?.telefone 
                            ? 'border-red-300 bg-red-50' 
                            : 'border-gray-300'
                        }`}
                        placeholder="Ex: (11) 99999-9999 ou 11999999999"
                      />
                      {errosValidacao[pontoFocal.id!]?.telefone && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errosValidacao[pontoFocal.id!].telefone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email do Ponto Focal
                      </label>
                      <input
                        type="email"
                        value={pontoFocal.email || ''}
                        onChange={(e) => {
                          const valor = e.target.value;
                          atualizarPontoFocal(pontoFocal.id!, 'email', valor);
                          validarCampo(pontoFocal.id!, 'email', valor);
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent text-sm ${
                          errosValidacao[pontoFocal.id!]?.email 
                            ? 'border-red-300 bg-red-50' 
                            : 'border-gray-300'
                        }`}
                        placeholder="Ex: nome@empresa.com.br"
                      />
                      {errosValidacao[pontoFocal.id!]?.email && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          {errosValidacao[pontoFocal.id!].email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Observações Importantes
                      </label>
                      <textarea
                        rows={2}
                        value={pontoFocal.observacoes || ''}
                        onChange={(e) => atualizarPontoFocal(pontoFocal.id!, 'observacoes', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent text-sm"
                        placeholder="Observações para reuniões..."
                      />
                    </div>

                    {/* Checkbox para marcar como principal */}
                    <div className="flex items-center space-x-2 pt-2">
                      <input
                        type="checkbox"
                        id={`pontoFocalPrincipal_${pontoFocal.id}`}
                        checked={pontoFocal.isPrincipal}
                        onChange={(e) => atualizarPontoFocal(pontoFocal.id!, 'isPrincipal', e.target.checked)}
                        className="w-4 h-4 text-[#00A298] bg-gray-100 border-gray-300 rounded focus:ring-[#00A298] focus:ring-2"
                      />
                      <label 
                        htmlFor={`pontoFocalPrincipal_${pontoFocal.id}`} 
                        className="text-sm font-medium text-gray-700 cursor-pointer"
                      >
                        Marcar como Ponto Focal Principal
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Informação sobre ponto focal principal */}
          {pontosFocais.length > 1 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-4 h-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-800">
                  <strong>Ponto Focal Principal:</strong> Apenas um ponto focal pode ser marcado como principal. 
                  Este será exibido na listagem e terá prioridade na visualização.
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 