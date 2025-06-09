'use client';

import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);



  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui será implementada a lógica de login
    console.log('Login:', { email, password });
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Verifica se as senhas coincidem
    if (password !== confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }
    
    // Aqui será implementada a lógica de criação de conta
    console.log('Criar conta:', { firstName, lastName, email, password });
    
    // Simula criação de conta e volta para login
    alert('Conta criada com sucesso! Faça login para continuar.');
    setShowCreateAccount(false);
    // Limpa os campos
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background com imagem da PLBrasil */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00A298]/90 to-[#1D3C44]/50 z-0">
        <div className="absolute inset-0 bg-[url('/plbrasil-background.png')] bg-cover bg-center opacity-30"></div>
        {/* Elementos decorativos no fundo */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
        <div className="absolute top-1/3 right-20 w-24 h-24 bg-[#AECECB]/20 rounded-full blur-lg"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-white/10 rounded-full blur-md"></div>
        <div className="absolute bottom-1/3 right-1/3 w-20 h-20 bg-[#AECECB]/15 rounded-full blur-lg"></div>
      </div>



      {/* Container principal */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          {/* Header com logos */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <span className="text-2xl font-bold text-[grey]">Sistema</span>
              <span className="text-2xl font-bold text-[#00A298] ml-2">GENTE</span>
            </div>
            
            <div className="flex items-center justify-center mb-6">
              <Image
                src="/logo.png"
                alt="PLBrasil Health&Safety"
                width={120}
                height={60}
                className="object-contain"
              />
            </div>
          </div>

          {/* Título da seção */}
          <div className="flex items-center mb-6">
            <div className="flex-1 h-px bg-gray-200"></div>
            <div className="px-4 text-gray-500 text-sm font-medium">
              {showCreateAccount ? 'CRIAR CONTA' : 'ACESSO AO SISTEMA'}
            </div>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Formulário */}
          <form onSubmit={showCreateAccount ? handleCreateAccount : handleLogin} className="space-y-4">
            {showCreateAccount && (
              <>
                <div>
                  <label htmlFor="firstName" className="block text-sm text-gray-600 mb-2">
                    Nome
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00A298] focus:ring-2 focus:ring-[#00A298]/20 outline-none transition-all"
                    placeholder="Seu nome"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm text-gray-600 mb-2">
                    Sobrenome
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00A298] focus:ring-2 focus:ring-[#00A298]/20 outline-none transition-all"
                    placeholder="Seu sobrenome"
                    required
                  />
                </div>
              </>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm text-gray-600 mb-2">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#00A298] focus:ring-2 focus:ring-[#00A298]/20 outline-none transition-all"
                placeholder="Seu e-mail"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm text-gray-600 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-200 focus:border-[#00A298] focus:ring-2 focus:ring-[#00A298]/20 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#00A298] transition-colors"
                >
                  {showPassword ? (
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
                      <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
                      <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.708zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                      <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {showCreateAccount && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm text-gray-600 mb-2">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-lg border border-gray-200 focus:border-[#00A298] focus:ring-2 focus:ring-[#00A298]/20 outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#00A298] transition-colors"
                  >
                    {showConfirmPassword ? (
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.944 5.944 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/>
                        <path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.299.822.822a3.5 3.5 0 0 1-4.474-4.474l.823.823a2.5 2.5 0 0 0 2.829 2.829z"/>
                        <path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.708zm10.296 8.884-12-12 .708-.708 12 12-.708.708z"/>
                      </svg>
                    ) : (
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                        <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}

                         {!showCreateAccount && (
               <div className="text-center">
                 <Link 
                   href="/forgot-password" 
                   className="text-sm text-[#00A298] hover:text-[#1D3C44] transition-colors"
                 >
                   Esqueci minha Senha
                 </Link>
               </div>
             )}

            <button
              type="submit"
              className="w-full bg-[#00A298] hover:bg-[#1D3C44] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:ring-2 focus:ring-[#00A298]/20 outline-none"
            >
              {showCreateAccount ? 'CRIAR CONTA' : 'ENTRAR'}
            </button>
          </form>

          {/* Toggle entre login e criar conta */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowCreateAccount(!showCreateAccount)}
              className="text-sm text-[#00A298] hover:text-[#1D3C44] transition-colors font-medium"
            >
              {showCreateAccount 
                ? 'Já tem uma conta? Faça login' 
                : 'Não tem uma conta? Criar conta'
              }
            </button>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-6">
          <p className="text-sm text-white/80">
            Sistema GENTE © 2025 | Versão 1.0
          </p>
        </div>
      </div>

      {/* Botão de suporte */}
      <div className="fixed bottom-6 right-6 z-30">
        <button className="bg-[#00A298] hover:bg-[#1D3C44] text-white px-4 py-2 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 flex items-center space-x-2">
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
          </svg>
          <span className="text-sm">Suporte</span>
        </button>
      </div>
    </div>
  );
} 