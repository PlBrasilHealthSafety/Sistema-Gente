'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';

// Tipos para os dados
interface Documento {
  id: string;
  nome: string;
  arquivo?: File | null;
  situacao: 'Ativo' | 'Inativo';
}

// Mock de dados para demonstração
const mockDocumentos: Documento[] = [
  {
    id: '1',
    nome: 'Atestado de Saúde Ocupacional (ASO)',
    situacao: 'Ativo'
  },
  {
    id: '2',
    nome: 'Programa de Prevenção de Riscos Ambientais (PPRA)',
    situacao: 'Ativo'
  },
  {
    id: '3',
    nome: 'Programa de Controle Médico de Saúde Ocupacional (PCMSO)',
    situacao: 'Ativo'
  },
  {
    id: '4',
    nome: 'Laudo Técnico das Condições Ambientais do Trabalho (LTCAT)',
    situacao: 'Ativo'
  },
  {
    id: '5',
    nome: 'Perfil Profissiográfico Previdenciário (PPP)',
    situacao: 'Ativo'
  }
];

export default function CadastroDocumentos() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // Estados para filtros e busca
  const [termoBusca, setTermoBusca] = useState('');
  const [situacao, setSituacao] = useState('Ativo');
  const [documentosFiltrados, setDocumentosFiltrados] = useState<Documento[]>([]);
  
  // Estados para paginação
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;

  // Estados para formulário de cadastro
  const [showCadastroModal, setShowCadastroModal] = useState(false);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [documentoEditando, setDocumentoEditando] = useState<string | null>(null);
  
  // Estados para modais de confirmação
  const [showConfirmacaoExclusao, setShowConfirmacaoExclusao] = useState(false);
  const [showConfirmacaoInativacao, setShowConfirmacaoInativacao] = useState(false);
  const [documentoParaAcao, setDocumentoParaAcao] = useState<Documento | null>(null);
  
  // Estados para visualização
  const [showViewDocumentoModal, setShowViewDocumentoModal] = useState(false);
  const [documentoVisualizando, setDocumentoVisualizando] = useState<Documento | null>(null);
  
  // Estados para edição de documento
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [documentoConteudo, setDocumentoConteudo] = useState('');
  const [isLoadingDocument, setIsLoadingDocument] = useState(false);
  
  // Estados para modal de sucesso
  const [showSucessoModal, setShowSucessoModal] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');
  
  // Estados dos campos do formulário
  const [formData, setFormData] = useState({
    nome: '',
    arquivo: null as File | null,
    situacaoDocumento: 'Ativo'
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verificação de autenticação
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    
    setLoading(false);
  }, [router]);

  // Efeito para filtrar documentos
  useEffect(() => {
    let resultados = mockDocumentos.filter(documento => {
      const matchSituacao = situacao === 'Todos' || documento.situacao === situacao;
      const matchBusca = termoBusca === '' || 
        documento.nome.toLowerCase().includes(termoBusca.toLowerCase());
      
      return matchSituacao && matchBusca;
    });

    setDocumentosFiltrados(resultados);
    setPaginaAtual(1); // Reset para primeira página quando filtrar
  }, [termoBusca, situacao]);

  // Inicializar apenas com dados ativos
  useEffect(() => {
    const documentosAtivos = mockDocumentos.filter(documento => documento.situacao === 'Ativo');
    setDocumentosFiltrados(documentosAtivos);
  }, []);

  // Calcular dados da paginação
  const totalItens = documentosFiltrados.length;
  const totalPaginas = Math.ceil(totalItens / itensPorPagina);
  const indiceInicio = (paginaAtual - 1) * itensPorPagina;
  const indiceFim = indiceInicio + itensPorPagina;
  const documentosExibidos = documentosFiltrados.slice(indiceInicio, indiceFim);

  const handleProcurar = () => {
    // A busca já é feita automaticamente via useEffect
    // Este método pode ser usado para ações adicionais se necessário
  };

  const carregarDocumentos = () => {
    setTermoBusca('');
    setSituacao('Ativo');
    const documentosAtivos = mockDocumentos.filter(documento => documento.situacao === 'Ativo');
    setDocumentosFiltrados(documentosAtivos);
    setPaginaAtual(1);
  };

  const handleNovoDocumento = () => {
    setModoEdicao(false);
    setDocumentoEditando(null);
    setShowCadastroModal(true);
    setFormData({
      nome: '',
      arquivo: null,
      situacaoDocumento: 'Ativo'
    });
    setErrors({});
    // Limpar input de arquivo
    const input = document.getElementById('arquivo-upload') as HTMLInputElement;
    if (input) input.value = '';
  };

  const handleFecharCadastro = () => {
    setShowCadastroModal(false);
    setModoEdicao(false);
    setDocumentoEditando(null);
    setFormData({
      nome: '',
      arquivo: null,
      situacaoDocumento: 'Ativo'
    });
    setErrors({});
    // Limpar input de arquivo
    const input = document.getElementById('arquivo-upload') as HTMLInputElement;
    if (input) input.value = '';
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleIncluirDocumento = async () => {
    // Validar campos obrigatórios
    const newErrors: Record<string, string> = {};
    
    // Validar nome
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome do documento é obrigatório';
    }
    
    // Se houver erros, mostrar e parar
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    // TODO: Implementar lógica de salvamento
    try {
      // Aqui será implementada a chamada para a API
      console.log('Dados do documento:', formData);
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1000));
      handleFecharCadastro();
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLimparFormulario = () => {
    setFormData({
      nome: '',
      arquivo: null,
      situacaoDocumento: 'Ativo'
    });
    setErrors({});
    // Limpar input de arquivo
    const input = document.getElementById('arquivo-upload') as HTMLInputElement;
    if (input) input.value = '';
  };

  const handleVisualizarDocumento = (documento: Documento) => {
    setDocumentoVisualizando(documento);
    setShowViewDocumentoModal(true);
  };

  const handleFecharVisualizacao = () => {
    setShowViewDocumentoModal(false);
    setDocumentoVisualizando(null);
  };

  const handleEditarDocumento = (documento: Documento) => {
    setModoEdicao(true);
    setDocumentoEditando(documento.id);
    setFormData({
      nome: documento.nome,
      situacaoDocumento: documento.situacao
    });
    setShowCadastroModal(true);
    setErrors({});
  };

  const handleExcluirDocumento = (documento: Documento) => {
    setDocumentoParaAcao(documento);
    setShowConfirmacaoExclusao(true);
  };

  const handleInativarDocumento = (documento: Documento) => {
    setDocumentoParaAcao(documento);
    setShowConfirmacaoInativacao(true);
  };

  const confirmarExclusao = () => {
    // TODO: Implementar lógica de exclusão
    console.log('Excluindo documento:', documentoParaAcao);
    setShowConfirmacaoExclusao(false);
    setDocumentoParaAcao(null);
  };

  const confirmarInativacao = () => {
    // TODO: Implementar lógica de inativação/ativação
    console.log('Alterando status do documento:', documentoParaAcao);
    setShowConfirmacaoInativacao(false);
    setDocumentoParaAcao(null);
  };

  const cancelarAcao = () => {
    setShowConfirmacaoExclusao(false);
    setShowConfirmacaoInativacao(false);
    setDocumentoParaAcao(null);
  };

  // Função para processar arquivo Word e extrair conteúdo
  const processarArquivoWord = async (arquivo: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          
          // Para arquivos .docx, usamos uma abordagem simples de extração de texto
          // Em produção, seria recomendado usar uma biblioteca como mammoth.js
          const uint8Array = new Uint8Array(arrayBuffer);
          const decoder = new TextDecoder('utf-8');
          
          // Converte para string e remove caracteres de controle
          let conteudo = decoder.decode(uint8Array);
          
          // Remove caracteres não imprimíveis e mantém apenas texto legível
          conteudo = conteudo.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
          
          // Se o arquivo está vazio ou não tem conteúdo legível, cria um template
          if (!conteudo.trim() || conteudo.length < 50) {
            conteudo = `# ${arquivo.name.replace(/\.[^/.]+$/, "")}\n\n` +
                      `## Documento\n\n` +
                      `Este é o conteúdo do documento ${arquivo.name}.\n\n` +
                      `Você pode editar este texto usando o editor abaixo.\n\n` +
                      `### Instruções:\n` +
                      `- Use formatação markdown\n` +
                      `- Organize o conteúdo em seções\n` +
                      `- Salve suas alterações quando terminar`;
          }
          
          resolve(conteudo);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Erro ao ler o arquivo'));
      reader.readAsArrayBuffer(arquivo);
    });
  };

  // Função para abrir o editor de documento
  const abrirEditorDocumento = async () => {
    if (!formData.arquivo) return;
    
    setIsLoadingDocument(true);
    try {
      const conteudo = await processarArquivoWord(formData.arquivo);
      setDocumentoConteudo(conteudo);
      setShowEditorModal(true);
    } catch (error) {
      console.error('Erro ao processar documento:', error);
      alert('Erro ao processar o documento. Verifique se o arquivo é válido.');
    } finally {
      setIsLoadingDocument(false);
    }
  };

  // Função para salvar o documento editado
  const salvarDocumentoEditado = () => {
    // Aqui você pode implementar a lógica para salvar o documento
    // Por exemplo, converter de volta para .docx ou salvar como texto
    console.log('Conteúdo editado:', documentoConteudo);
    
    // Criar um novo arquivo blob com o conteúdo editado
    const blob = new Blob([documentoConteudo], { type: 'text/plain' });
    const arquivo = new File([blob], formData.arquivo?.name || 'documento.txt', { type: 'text/plain' });
    
    setFormData(prev => ({ ...prev, arquivo }));
    setShowEditorModal(false);
    
    // Mostrar modal de sucesso em vez de alert
    setMensagemSucesso(`Documento "${formData.arquivo?.name}" foi salvo com sucesso!`);
    setShowSucessoModal(true);
  };

  const fecharEditor = () => {
    setShowEditorModal(false);
    setDocumentoConteudo('');
  };

  const fecharModalSucesso = () => {
    setShowSucessoModal(false);
    setMensagemSucesso('');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Administrador';
      case 'admin':
        return 'Administrador';
      case 'user':
        return 'Usuário';
      default:
        return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'user':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-[#00A298]/15 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#00A298]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-[#00A298]/15">
      {/* Header Superior */}
      <header className="bg-white shadow-sm border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
        <div className="flex justify-between items-center h-16 px-4">
          {/* Logo */}
          <div className="flex items-center w-1/3">
            <Image
              src="/logo.png"
              alt="PLBrasil Health&Safety"
              width={120}
              height={30}
              className="object-contain opacity-80 hover:opacity-100 transition-opacity"
            />
          </div>
          
          {/* Logo do Sistema Centralizado */}
          <div className="flex-1 text-center flex justify-center">
            <button onClick={() => router.push('/home')} className="cursor-pointer">
              <Image
                src="/sistemagente_logo.png"
                alt="Sistema GENTE"
                width={150}
                height={15}
                className="object-contain hover:opacity-80 transition-opacity"
                priority
              />
            </button>
          </div>
          
          {/* Informações do usuário e logout */}
          <div className="flex items-center space-x-6 w-1/3 justify-end">
            <div className="text-right">
              <div className="text-sm font-medium text-[#1D3C44] mb-1">
                {user.first_name} {user.last_name}
              </div>
              <div className={`text-xs px-3 py-1 rounded-full inline-block ${getRoleColor(user.role)}`}>
                {getRoleName(user.role)}
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="bg-[#00A298] hover:bg-red-500 text-white px-5 py-2 rounded-xl text-sm transition-all duration-200 transform hover:scale-102 hover:shadow-lg cursor-pointer"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="pt-16">
        {/* Conteúdo Principal */}
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Breadcrumb e Navegação */}
            <div className="mb-6">
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
                <button 
                  onClick={() => router.push('/home')}
                  className="hover:text-[#00A298] cursor-pointer"
                >
                  Tabelas Básicas
                </button>
                <span>/</span>
                <span className="text-[#00A298] font-medium">Cadastro de Documentos</span>
              </div>
              
              <h1 className="text-3xl font-bold text-[#1D3C44] mb-2">
                📄 Cadastro de Documentos
              </h1>
              <p className="text-gray-600">
                Cadastro e gerenciamento de tipos de documentos médicos e ocupacionais
              </p>
            </div>

            {/* Conteúdo Principal */}
            <div className="bg-white rounded-2xl shadow-xl">
              {/* Formulário de Busca */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-wrap gap-2 items-end">
                  <div className="flex-1 min-w-64">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Buscar por Nome:
                    </label>
                    <input
                      type="text"
                      value={termoBusca}
                      onChange={(e) => setTermoBusca(e.target.value)}
                      placeholder="Digite o nome do documento para busca..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Situação
                    </label>
                    <select
                      value={situacao}
                      onChange={(e) => setSituacao(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00A298] focus:border-transparent"
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                      <option value="Todos">Todos</option>
                    </select>
                  </div>

                  <button
                    onClick={handleProcurar}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer ml-2"
                  >
                    PROCURAR
                  </button>
                  
                  <button
                    onClick={handleNovoDocumento}
                    className="bg-[#00A298] hover:bg-[#1D3C44] text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    NOVO DOCUMENTO
                  </button>
                  
                  <button 
                    onClick={carregarDocumentos}
                    className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    RECARREGAR
                  </button>
                </div>
              </div>

              {/* Container de Cadastro de Documento */}
              {showCadastroModal && (
                <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200 rounded-b-2xl">
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-[#1D3C44]">
                      {modoEdicao ? 'Editar Documento' : 'Novo Documento'}
                    </h3>
                  </div>
                  
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                    {/* Seção: Informações Básicas */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-[#1D3C44] mb-4 flex items-center space-x-2">
                        <svg className="w-5 h-5 text-[#00A298]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Informações do Documento</span>
                      </h4>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                            <svg className="w-4 h-4 text-[#00A298]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <span>Nome do Documento</span>
                            <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.nome}
                            onChange={(e) => handleInputChange('nome', e.target.value)}
                            className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-[#00A298] focus:border-[#00A298] transition-all duration-200 ${
                              errors.nome ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-gray-400'
                            }`}
                            placeholder="Ex: ASO, PPRA, PCMSO, LTCAT..."
                          />
                          {errors.nome && (
                            <p className="text-red-500 text-sm mt-2 flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              <span>{errors.nome}</span>
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                            <svg className="w-4 h-4 text-[#00A298]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Situação</span>
                          </label>
                          <select
                            value={formData.situacaoDocumento}
                            onChange={(e) => handleInputChange('situacaoDocumento', e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00A298] focus:border-[#00A298] hover:border-gray-400 transition-all duration-200"
                          >
                            <option value="Ativo">Ativo</option>
                            <option value="Inativo">Inativo</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Seção: Upload de Documento */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold text-[#1D3C44] mb-4 flex items-center space-x-2">
                        <svg className="w-5 h-5 text-[#00A298]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span>Documento Word</span>
                      </h4>
                      
                      <div className="grid grid-cols-1 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                            <svg className="w-4 h-4 text-[#00A298]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            <span>Enviar Arquivo Word (.docx)</span>
                          </label>
                          <div className="flex items-center space-x-4">
                            <input
                              type="file"
                              accept=".docx,.doc"
                              onChange={(e) => {
                                const file = e.target.files?.[0] || null;
                                setFormData(prev => ({ ...prev, arquivo: file }));
                              }}
                              className="hidden"
                              id="arquivo-upload"
                            />
                            <label
                              htmlFor="arquivo-upload"
                              className="bg-[#00A298] hover:bg-[#1D3C44] text-white px-4 py-2 rounded-lg cursor-pointer transition-all duration-200 flex items-center space-x-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              <span>Escolher Arquivo</span>
                            </label>
                            {formData.arquivo && (
                              <span className="text-sm text-green-600 flex items-center space-x-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{formData.arquivo.name}</span>
                              </span>
                            )}
                          </div>
                          {formData.arquivo && (
                            <div className="mt-4 flex space-x-2">
                              <button
                                type="button"
                                onClick={abrirEditorDocumento}
                                disabled={isLoadingDocument}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isLoadingDocument ? (
                                  <>
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Carregando...</span>
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    <span>Editar Documento</span>
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, arquivo: null }));
                                  const input = document.getElementById('arquivo-upload') as HTMLInputElement;
                                  if (input) input.value = '';
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-all duration-200 flex items-center space-x-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>Remover</span>
                              </button>
                            </div>
                          )}
                          <p className="text-sm text-gray-500 mt-2">
                            Formatos aceitos: .docx, .doc (máximo 10MB)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Botões de Ação */}
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={handleIncluirDocumento}
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting 
                        ? (modoEdicao ? 'SALVANDO...' : 'INCLUINDO...') 
                        : (modoEdicao ? 'SALVAR' : 'INCLUIR')
                      }
                    </button>
                    <button
                      onClick={handleLimparFormulario}
                      className="bg-blue-400 hover:bg-blue-500 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                    >
                      LIMPAR
                    </button>
                    <button
                      onClick={handleFecharCadastro}
                      className="bg-gray-400 hover:bg-gray-500 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                    >
                      VOLTAR
                    </button>
                  </div>
                </div>
              )}

              {/* Tabela de Documentos - só mostra quando não está cadastrando */}
              {!showCadastroModal && (
                <div className="p-6 rounded-b-2xl">
                  <div className="border border-gray-200 rounded-lg overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-3/5">Nome</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 w-1/5">Situação</th>
                          <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 w-1/5">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {documentosExibidos.length > 0 ? (
                          documentosExibidos.map((documento) => (
                            <tr key={documento.id} className="border-b border-gray-200 hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm">
                                <div className="font-medium text-gray-900">{documento.nome}</div>
                              </td>
                              <td className="px-4 py-3 text-sm text-center">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  documento.situacao === 'Ativo' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {documento.situacao}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <div className="flex space-x-2 justify-center">
                                  <button 
                                    onClick={() => handleVisualizarDocumento(documento)}
                                    className="text-green-600 hover:text-green-800 text-xs font-medium cursor-pointer"
                                  >
                                    Visualizar
                                  </button>
                                  <button 
                                    onClick={() => handleEditarDocumento(documento)}
                                    className="text-blue-600 hover:text-blue-800 text-xs font-medium cursor-pointer"
                                  >
                                    Editar
                                  </button>
                                  <button 
                                    onClick={() => handleInativarDocumento(documento)}
                                    className={`text-xs font-medium cursor-pointer ${
                                      documento.situacao === 'Ativo' 
                                        ? 'text-orange-600 hover:text-orange-800' 
                                        : 'text-green-600 hover:text-green-800'
                                    }`}
                                  >
                                    {documento.situacao === 'Ativo' ? 'Inativar' : 'Ativar'}
                                  </button>
                                  <button 
                                    onClick={() => handleExcluirDocumento(documento)}
                                    className="text-red-600 hover:text-red-800 text-xs font-medium cursor-pointer"
                                  >
                                    Excluir
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                              Não existem dados para mostrar
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal do Editor de Documento */}
      {showEditorModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-[#1D3C44] flex items-center space-x-2">
                  <svg className="w-6 h-6 text-[#00A298]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Editor de Documento - {formData.arquivo?.name}</span>
                </h3>
                <button
                  onClick={fecharEditor}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto" style={{maxHeight: 'calc(90vh - 140px)'}}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Conteúdo do Documento:
                </label>
                <textarea
                  value={documentoConteudo}
                  onChange={(e) => setDocumentoConteudo(e.target.value)}
                  placeholder="Edite o conteúdo do documento aqui..."
                  className="w-full h-96 px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00A298] focus:border-[#00A298] transition-all duration-200 resize-none font-mono text-sm"
                />
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">💡 Dicas de Edição:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Use <code className="bg-gray-200 px-1 rounded"># Título</code> para criar títulos principais</li>
                  <li>• Use <code className="bg-gray-200 px-1 rounded">## Subtítulo</code> para criar subtítulos</li>
                  <li>• Use <code className="bg-gray-200 px-1 rounded">**texto**</code> para texto em negrito</li>
                  <li>• Use <code className="bg-gray-200 px-1 rounded">*texto*</code> para texto em itálico</li>
                  <li>• Use <code className="bg-gray-200 px-1 rounded">- item</code> para criar listas</li>
                </ul>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex gap-3 justify-end">
                <button
                  onClick={fecharEditor}
                  className="bg-gray-400 hover:bg-gray-500 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                >
                  CANCELAR
                </button>
                <button
                  onClick={salvarDocumentoEditado}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                >
                  SALVAR DOCUMENTO
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Visualização */}
      {showViewDocumentoModal && documentoVisualizando && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-[#1D3C44] mb-6">Visualizar Documento</h3>
              
              <div className="space-y-6">
                {/* Informações Básicas */}
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-700 mb-4 border-b border-gray-200 pb-3">Informações do Documento</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome do Documento
                      </label>
                      <input
                        type="text"
                        value={documentoVisualizando.nome}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Situação
                      </label>
                      <div className="flex items-center">
                        <span className={`inline-flex px-3 py-2 text-sm font-semibold rounded-full ${
                          documentoVisualizando.situacao === 'Ativo' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {documentoVisualizando.situacao}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={handleFecharVisualizacao}
                  className="bg-gray-400 hover:bg-gray-500 text-white font-medium py-2 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer"
                >
                  FECHAR
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showConfirmacaoExclusao && documentoParaAcao && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.98-.833-2.75 0L3.164 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Confirmar Exclusão</h3>
                <p className="text-sm text-gray-500">Esta ação não pode ser desfeita.</p>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-gray-700">
                Tem certeza que deseja excluir o documento <strong>"{documentoParaAcao.nome}"</strong>?
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelarAcao}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarExclusao}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all duration-200 cursor-pointer"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Inativação/Ativação */}
      {showConfirmacaoInativacao && documentoParaAcao && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                documentoParaAcao.situacao === 'Ativo' ? 'bg-orange-100' : 'bg-green-100'
              }`}>
                <svg className={`w-6 h-6 ${
                  documentoParaAcao.situacao === 'Ativo' ? 'text-orange-600' : 'text-green-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Confirmar {documentoParaAcao.situacao === 'Ativo' ? 'Inativação' : 'Ativação'}
                </h3>
                <p className="text-sm text-gray-500">
                  {documentoParaAcao.situacao === 'Ativo' 
                    ? 'O documento ficará indisponível para uso.' 
                    : 'O documento ficará disponível para uso novamente.'
                  }
                </p>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-gray-700">
                Tem certeza que deseja {documentoParaAcao.situacao === 'Ativo' ? 'inativar' : 'ativar'} o documento <strong>"{documentoParaAcao.nome}"</strong>?
              </p>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelarAcao}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all duration-200 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarInativacao}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 cursor-pointer text-white ${
                  documentoParaAcao.situacao === 'Ativo' 
                    ? 'bg-orange-600 hover:bg-orange-700' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {documentoParaAcao.situacao === 'Ativo' ? 'Inativar' : 'Ativar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Sucesso */}
      {showSucessoModal && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="p-6">
              {/* Ícone de Sucesso */}
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              
              {/* Título */}
              <h3 className="text-xl font-bold text-[#1D3C44] text-center mb-4">
                Sucesso!
              </h3>
              
              {/* Mensagem */}
              <p className="text-gray-600 text-center mb-6">
                {mensagemSucesso}
              </p>
              
              {/* Botão */}
              <div className="flex justify-center">
                <button
                  onClick={fecharModalSucesso}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg text-sm transition-all duration-200 transform hover:scale-102 shadow-md hover:shadow-lg cursor-pointer min-w-24"
                >
                  OK
                </button>
              </div>
            </div>
            
            {/* Animação de confetes (opcional) */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
              <div className="absolute top-4 left-4 w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
              <div className="absolute top-6 right-8 w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              <div className="absolute top-8 left-1/3 w-1 h-1 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
              <div className="absolute top-3 right-1/4 w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.6s'}}></div>
              <div className="absolute top-10 right-6 w-1 h-1 bg-pink-400 rounded-full animate-bounce" style={{animationDelay: '0.8s'}}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 