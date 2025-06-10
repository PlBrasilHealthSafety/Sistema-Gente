'use client';

import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:3001/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

             if (response.ok) {
         console.log('✅ Email de recuperação enviado para:', email);
         setIsSubmitted(true);
       } else {
         console.error('❌ Erro ao enviar email:', data.message);
         // Mesmo com erro, mostramos sucesso por segurança (para não revelar se email existe)
         setIsSubmitted(true);
       }
         } catch (error) {
       console.error('❌ Erro na requisição:', error);
       // Mesmo com erro, mostramos sucesso por segurança (para não revelar se email existe)
       setIsSubmitted(true);
     }
  };

  const handleBackToLogin = () => {
    setIsSubmitted(false);
    setEmail('');
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
          {/* Header com logo Sistema GENTE */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Image
                src="/sistemagente_logo.png"
                alt="Sistema GENTE"
                width={120}
                height={15}
                className="object-contain"
              />
            </div>
          </div>

          {!isSubmitted ? (
            <>
              {/* Título da seção */}
              <div className="flex items-center mb-6">
                <div className="flex-1 h-px bg-gray-200"></div>
                <div className="px-4 text-gray-500 text-sm font-medium">
                  RECUPERAR SENHA
                </div>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              {/* Descrição */}
              <div className="text-center mb-6">
                <p className="text-gray-600 text-sm font-medium leading-relaxed">
                  Digite seu e-mail para receber as instruções de recuperação de senha.
                </p>
              </div>

              {/* Formulário */}
              <form onSubmit={handleSubmit} className="space-y-4">
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
                    placeholder="Seu e-mail cadastrado"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#00A298] hover:bg-[#1D3C44] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg focus:ring-2 focus:ring-[#00A298]/20 outline-none cursor-pointer"
                >
                  ENVIAR INSTRUÇÕES
                </button>
              </form>

              {/* Link para voltar ao login */}
              <div className="mt-6 text-center">
                <Link 
                  href="/login"
                  className="text-sm text-[#00A298] hover:text-[#1D3C44] transition-all duration-200 font-medium hover:underline hover:scale-105 cursor-pointer flex items-center justify-center space-x-2"
                >
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" className="rotate-180">
                    <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                  </svg>
                  <span>Voltar ao login</span>
                </Link>
              </div>
            </>
          ) : (
            <>
              {/* Tela de confirmação */}
              <div className="text-center">
                {/* Ícone de confirmação */}
                <div className="w-16 h-16 bg-[#00A298]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" fill="currentColor" viewBox="0 0 16 16" className="text-[#00A298]">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.061L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                  </svg>
                </div>

                <h2 className="text-lg font-semibold text-[#1D3C44] mb-2">
                  E-mail Enviado!
                </h2>
                
                <p className="text-gray-600 text-sm mb-6">
                  Enviamos as instruções de recuperação de senha para <strong>{email}</strong>. 
                  Verifique sua caixa de entrada e spam.
                </p>

                <div className="space-y-4">
                  <button
                    onClick={handleBackToLogin}
                    className="w-full bg-[#00A298] hover:bg-[#1D3C44] text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] hover:shadow-lg focus:ring-2 focus:ring-[#00A298]/20 outline-none cursor-pointer"
                  >
                    VOLTAR AO LOGIN
                  </button>

                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="w-full text-[#00A298] hover:text-[#1D3C44] font-medium py-2 px-4 rounded-lg transition-all duration-200 border border-[#00A298]/20 hover:border-[#1D3C44]/20 hover:bg-gray-50 transform hover:scale-[1.02] cursor-pointer"
                  >
                    Tentar outro e-mail
                  </button>
                </div>
              </div>
            </>
          )}
          
          {/* Logo PLBrasil */}
          <div className="flex items-center justify-center mt-8">
            <Image
              src="/logo.png"
              alt="PLBrasil Health&Safety"
              width={115}
              height={10}
              className="object-contain"
            />
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-4">
          <p className="text-xs text-white/70">
            Sistema GENTE © 2025 | Versão 1.0
          </p>
        </div>
      </div>

      {/* Botão de suporte */}
      <div className="fixed bottom-6 right-6 z-30">
        <button className="bg-[#00A298] hover:bg-[#1D3C44] text-white px-4 py-2 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105 hover:shadow-xl cursor-pointer flex items-center space-x-2">
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