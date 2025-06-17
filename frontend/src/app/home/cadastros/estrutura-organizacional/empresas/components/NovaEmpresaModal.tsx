import React, { useEffect } from 'react';
import { Grupo, Regiao, NotificationInput } from '../types/empresa.types';
import { useFormularioEmpresa } from '../hooks/useFormularioEmpresa';
import { empresasService } from '../services/empresasService';

interface NovaEmpresaModalProps {
  isOpen: boolean;
  onClose: () => void;
  regioesAtivas: Regiao[];
  gruposAtivos: Grupo[];
  atualizarListaEmpresas: () => void;
  setNotification: (message: NotificationInput) => void;
}

export const NovaEmpresaModal: React.FC<NovaEmpresaModalProps> = ({
  isOpen,
  onClose,
  regioesAtivas,
  gruposAtivos,
  atualizarListaEmpresas,
  setNotification
}) => {
  const {
    // Estados
    activeTab,
    tipoEstabelecimento,
    classificacaoPorte,
    cep,
    endereco,
    loadingCep,
    cepError,
    contato,
    telefone,
    email,
    observacao,
    observacaoOS,
    nomeFantasia,
    razaoSocial,
    numeroInscricao,
    cpfRepresentante,
    nomeRepresentante,
    cno,
    tipoInscricao,
    grupoSelecionado,
    regiaoSelecionada,
    cnaeDescricao,
    risco,
    errors,
    regioesFiltradas,
    gruposFiltradosPorRegiao,

    // Setters
    setActiveTab,
    setTipoEstabelecimento,
    setClassificacaoPorte,
    setEndereco,
    setContato,
    setTelefone,
    setEmail,
    setObservacao,
    setObservacaoOS,
    setNomeFantasia,
    setRazaoSocial,
    setTipoInscricao,
    setCnaeDescricao,
    setRisco,

    // Handlers
    handleCepChange,
    handleNumeroInscricaoChange,
    handleCpfRepresentanteChange,
    handleTelefoneChange,
    handleNomeRepresentanteChange,
    handleContatoChange,
    handleCnoChange,
    handleGrupoChange,
    handleRegiaoChange,

    // Utilitários
    validateForm,
    getFormData,
    limparFormulario,
    clearFieldError,
    isValidCPF,
    isValidTelefone
  } = useFormularioEmpresa();

  // Limpar formulário quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      limparFormulario(regioesAtivas, gruposAtivos);
    }
  }, [isOpen, regioesAtivas, gruposAtivos, limparFormulario]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setNotification({
        type: 'error',
        message: 'Por favor, corrija os erros no formulário antes de continuar.'
      });
      return;
    }

    try {
      const formData = getFormData();
      await empresasService.criarEmpresa(formData);
      
      setNotification({
        type: 'success',
        message: 'Empresa criada com sucesso!'
      });
      
      onClose();
      atualizarListaEmpresas();
    } catch (error) {
      console.error('Erro ao criar empresa:', error);
      setNotification({
        type: 'error',
        message: 'Ocorreu um erro ao criar a empresa. Tente novamente.'
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Nova Empresa</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Abas */}
          <div className="flex border-b bg-gray-50">
            <button
              type="button"
              onClick={() => setActiveTab('dados-empresa')}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === 'dados-empresa'
                  ? 'border-b-2 border-blue-500 text-blue-600 bg-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Dados da Empresa
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('esocial')}
              className={`px-6 py-3 font-medium text-sm transition-colors ${
                activeTab === 'esocial'
                  ? 'border-b-2 border-blue-500 text-blue-600 bg-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              eSocial
            </button>
          </div>

          {/* Conteúdo das abas */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'dados-empresa' && (
              <div className="space-y-6">
                {/* Informações Básicas */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome Fantasia <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={nomeFantasia}
                        onChange={(e) => {
                          setNomeFantasia(e.target.value);
                          if (errors.nomeFantasia) clearFieldError('nomeFantasia');
                        }}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.nomeFantasia ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Digite o nome fantasia"
                      />
                      {errors.nomeFantasia && (
                        <p className="text-red-500 text-xs mt-1">{errors.nomeFantasia}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Razão Social <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={razaoSocial}
                        onChange={(e) => {
                          setRazaoSocial(e.target.value);
                          if (errors.razaoSocial) clearFieldError('razaoSocial');
                        }}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.razaoSocial ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Digite a razão social"
                      />
                      {errors.razaoSocial && (
                        <p className="text-red-500 text-xs mt-1">{errors.razaoSocial}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Estabelecimento
                      </label>
                      <select
                        value={tipoEstabelecimento}
                        onChange={(e) => setTipoEstabelecimento(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="matriz">Matriz</option>
                        <option value="filial">Filial</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Classificação de Porte
                      </label>
                      <select
                        value={classificacaoPorte}
                        onChange={(e) => setClassificacaoPorte(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="ME">Microempresa</option>
                        <option value="EPP">Empresa de Pequeno Porte</option>
                        <option value="DEMAIS">Demais</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Organização */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Organização</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Grupo <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={grupoSelecionado}
                        onChange={(e) => {
                          handleGrupoChange(e.target.value, regioesAtivas);
                          if (errors.grupoSelecionado) clearFieldError('grupoSelecionado');
                        }}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.grupoSelecionado ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Selecione um grupo</option>
                        {gruposFiltradosPorRegiao.map((grupo) => (
                          <option key={grupo.id} value={grupo.id}>
                            {grupo.nome}
                          </option>
                        ))}
                      </select>
                      {errors.grupoSelecionado && (
                        <p className="text-red-500 text-xs mt-1">{errors.grupoSelecionado}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Região <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={regiaoSelecionada}
                        onChange={(e) => {
                          handleRegiaoChange(e.target.value, regioesAtivas, gruposAtivos);
                          if (errors.regiaoSelecionada) clearFieldError('regiaoSelecionada');
                        }}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.regiaoSelecionada ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Selecione uma região</option>
                        {regioesFiltradas.map((regiao) => (
                          <option key={regiao.id} value={regiao.id}>
                            {regiao.nome}
                          </option>
                        ))}
                      </select>
                      {errors.regiaoSelecionada && (
                        <p className="text-red-500 text-xs mt-1">{errors.regiaoSelecionada}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Endereço */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Endereço</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CEP <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={cep}
                        onChange={(e) => handleCepChange(e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.cep || cepError ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="00000-000"
                        maxLength={9}
                      />
                      {(errors.cep || cepError) && (
                        <p className="text-red-500 text-xs mt-1">{errors.cep || cepError}</p>
                      )}
                      {loadingCep && (
                        <p className="text-blue-500 text-xs mt-1">Buscando CEP...</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={endereco.numero}
                        onChange={(e) => {
                          setEndereco(prev => ({ ...prev, numero: e.target.value }));
                          if (errors.numeroEndereco) clearFieldError('numeroEndereco');
                        }}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.numeroEndereco ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Número"
                      />
                      {errors.numeroEndereco && (
                        <p className="text-red-500 text-xs mt-1">{errors.numeroEndereco}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Complemento
                      </label>
                      <input
                        type="text"
                        value={endereco.complemento}
                        onChange={(e) => setEndereco(prev => ({ ...prev, complemento: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Apto, sala, etc."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Logradouro
                      </label>
                      <input
                        type="text"
                        value={endereco.logradouro}
                        onChange={(e) => setEndereco(prev => ({ ...prev, logradouro: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Logradouro"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bairro
                      </label>
                      <input
                        type="text"
                        value={endereco.bairro}
                        onChange={(e) => setEndereco(prev => ({ ...prev, bairro: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Bairro"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        UF
                      </label>
                      <input
                        type="text"
                        value={endereco.uf}
                        onChange={(e) => setEndereco(prev => ({ ...prev, uf: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="SP"
                        maxLength={2}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cidade
                    </label>
                    <input
                      type="text"
                      value={endereco.cidade}
                      onChange={(e) => setEndereco(prev => ({ ...prev, cidade: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Cidade"
                    />
                  </div>
                </div>

                {/* Contato */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Contato</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome do Contato
                      </label>
                      <input
                        type="text"
                        value={contato}
                        onChange={(e) => handleContatoChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nome do responsável"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefone
                      </label>
                      <input
                        type="text"
                        value={telefone}
                        onChange={(e) => handleTelefoneChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="(11) 99999-9999"
                      />
                      {telefone && !isValidTelefone(telefone) && (
                        <p className="text-yellow-600 text-xs mt-1">Formato de telefone inválido</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        E-mail
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="contato@empresa.com"
                      />
                    </div>
                  </div>
                </div>

                {/* Representante Legal */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Representante Legal</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome do Representante
                      </label>
                      <input
                        type="text"
                        value={nomeRepresentante}
                        onChange={(e) => handleNomeRepresentanteChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nome completo"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CPF do Representante
                      </label>
                      <input
                        type="text"
                        value={cpfRepresentante}
                        onChange={(e) => handleCpfRepresentanteChange(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="000.000.000-00"
                      />
                      {cpfRepresentante && !isValidCPF(cpfRepresentante) && (
                        <p className="text-yellow-600 text-xs mt-1">CPF inválido</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Observações */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Observações</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Observações Gerais
                      </label>
                      <textarea
                        value={observacao}
                        onChange={(e) => setObservacao(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Observações gerais sobre a empresa..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Observações OS
                      </label>
                      <textarea
                        value={observacaoOS}
                        onChange={(e) => setObservacaoOS(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Observações específicas para OS..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'esocial' && (
              <div className="space-y-6">
                {/* Informações eSocial */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Informações eSocial</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Inscrição <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={tipoInscricao}
                        onChange={(e) => {
                          setTipoInscricao(e.target.value);
                          if (errors.tipoInscricao) clearFieldError('tipoInscricao');
                        }}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.tipoInscricao ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Selecione o tipo</option>
                        <option value="1">1 - CNPJ</option>
                        <option value="2">2 - CPF</option>
                        <option value="3">3 - CAEPF</option>
                        <option value="4">4 - CNO</option>
                      </select>
                      {errors.tipoInscricao && (
                        <p className="text-red-500 text-xs mt-1">{errors.tipoInscricao}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número da Inscrição <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={numeroInscricao}
                        onChange={(e) => {
                          handleNumeroInscricaoChange(e.target.value);
                          if (errors.numeroInscricao) clearFieldError('numeroInscricao');
                        }}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.numeroInscricao ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder={
                          tipoInscricao === '1' ? '00.000.000/0000-00' :
                          tipoInscricao === '2' ? '000.000.000-00' :
                          'Digite o número da inscrição'
                        }
                      />
                      {errors.numeroInscricao && (
                        <p className="text-red-500 text-xs mt-1">{errors.numeroInscricao}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CNO <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={cno}
                        onChange={(e) => {
                          handleCnoChange(e.target.value);
                          if (errors.cno) clearFieldError('cno');
                        }}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.cno ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="000000.00.00"
                      />
                      {errors.cno && (
                        <p className="text-red-500 text-xs mt-1">{errors.cno}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CNAE Principal <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={cnaeDescricao}
                        onChange={(e) => {
                          setCnaeDescricao(e.target.value);
                          if (errors.cnaeDescricao) clearFieldError('cnaeDescricao');
                        }}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.cnaeDescricao ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Descrição do CNAE"
                      />
                      {errors.cnaeDescricao && (
                        <p className="text-red-500 text-xs mt-1">{errors.cnaeDescricao}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Grau de Risco <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={risco}
                        onChange={(e) => {
                          setRisco(e.target.value);
                          if (errors.risco) clearFieldError('risco');
                        }}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.risco ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Selecione o grau de risco</option>
                        <option value="1">1 - Baixo</option>
                        <option value="2">2 - Médio</option>
                        <option value="3">3 - Alto</option>
                        <option value="4">4 - Muito Alto</option>
                      </select>
                      {errors.risco && (
                        <p className="text-red-500 text-xs mt-1">{errors.risco}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Criar Empresa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 