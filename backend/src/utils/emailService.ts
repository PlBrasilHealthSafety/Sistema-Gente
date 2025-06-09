import nodemailer from 'nodemailer';

// Configuração do transporter de email
const createTransporter = async () => {
  // Para desenvolvimento, vamos priorizar um fallback sempre funcional
  if (process.env.NODE_ENV !== 'production') {
    try {
      console.log('🔧 Tentando criar conta de teste Ethereal...');
      // Para desenvolvimento, criar uma conta Ethereal automaticamente
      const testAccount = await nodemailer.createTestAccount();
      
      console.log('✅ Conta Ethereal criada:', {
        user: testAccount.user,
        pass: '***hidden***'
      });
      
      return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
    } catch (error) {
      console.warn('⚠️ Erro ao criar conta Ethereal:', error);
      console.log('🔄 Usando modo de simulação para desenvolvimento...');
      // Retornar um transporter "dummy" que não vai falhar
      return {
        sendMail: async (mailOptions: any) => {
          console.log('📧 SIMULAÇÃO DE ENVIO DE EMAIL:');
          console.log('📮 Para:', mailOptions.to);
          console.log('📋 Assunto:', mailOptions.subject);
          return {
            messageId: `simulation-${Date.now()}`,
            response: 'Email simulado com sucesso'
          };
        }
      } as any;
    }
  } else {
    // Configuração para produção
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      throw new Error('Configurações de email não encontradas. Configure EMAIL_USER e EMAIL_PASSWORD.');
    }
    
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
};

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  
  // Enviar email
  static async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      console.log(`📤 Iniciando envio de email para: ${options.to}`);
      
      const transporter = await createTransporter();
      
      const mailOptions = {
        from: `"Sistema GENTE" <${process.env.EMAIL_FROM || 'noreply@sistema-gente.com'}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || ''
      };

      const info = await transporter.sendMail(mailOptions);
      
      console.log('✅ Email processado com sucesso!');
      console.log('📧 Para:', options.to);
      console.log('📋 Assunto:', options.subject);
      console.log('🆔 Message ID:', info.messageId);
      
      // Verificar se é ambiente de desenvolvimento e mostrar preview
      if (process.env.NODE_ENV !== 'production') {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          console.log('🔗 Preview do email (Ethereal):', previewUrl);
        }
        
        // Extrair token do HTML para facilitar teste
        const tokenMatch = options.html.match(/token=([a-f0-9-]+)/);
        if (tokenMatch) {
          const token = tokenMatch[1];
          const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
          console.log('🔗 Link de recuperação para teste:');
          console.log(resetUrl);
          console.log('='.repeat(80));
        }
      }

      return true;
    } catch (error: any) {
      console.error('❌ Erro ao processar email:', error);
      console.error('📋 Detalhes do erro:', {
        message: error?.message || 'Erro desconhecido',
        code: error?.code || 'N/A',
        command: error?.command || 'N/A'
      });
      
      // Em desenvolvimento, sempre simular sucesso com informações úteis
      if (process.env.NODE_ENV !== 'production') {
        console.log('⚠️ MODO FALLBACK - Simulando envio de email para desenvolvimento:');
        console.log('📧 Para:', options.to);
        console.log('📋 Assunto:', options.subject);
        
        // Extrair token do HTML para facilitar teste
        const tokenMatch = options.html.match(/token=([a-f0-9-]+)/);
        if (tokenMatch) {
          const token = tokenMatch[1];
          const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
          console.log('🔗 Link de recuperação para teste (FALLBACK):');
          console.log(resetUrl);
          console.log('='.repeat(80));
          console.log('👆 COPIE E COLE ESTE LINK NO NAVEGADOR PARA TESTAR');
          console.log('='.repeat(80));
        }
        
        return true; // Sempre retornar sucesso em desenvolvimento
      }
      
      return false; // Falha real apenas em produção
    }
  }

  // Template para recuperação de senha
  static generatePasswordResetEmail(firstName: string, resetLink: string): string {
    return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Recuperação de Senha - Sistema GENTE</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f4f4f4;
            }
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                background-color: #ffffff;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                margin-top: 40px;
            }
            .header {
                text-align: center;
                padding: 20px 0;
                border-bottom: 2px solid #00A298;
            }
            .logo {
                font-size: 24px;
                font-weight: bold;
                color: #1D3C44;
            }
            .logo .accent {
                color: #00A298;
            }
            .content {
                padding: 30px 20px;
            }
            .greeting {
                font-size: 18px;
                margin-bottom: 20px;
            }
            .message {
                margin-bottom: 30px;
                line-height: 1.6;
            }
            .button {
                display: inline-block;
                background-color: #00A298;
                color: white;
                text-decoration: none;
                padding: 12px 30px;
                border-radius: 8px;
                font-weight: bold;
                margin: 20px 0;
                text-align: center;
            }
            .button:hover {
                background-color: #1D3C44;
            }
            .warning {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 5px;
                padding: 15px;
                margin: 20px 0;
                font-size: 14px;
            }
            .footer {
                text-align: center;
                padding: 20px;
                color: #666;
                font-size: 12px;
                border-top: 1px solid #eee;
                margin-top: 30px;
            }
            .link {
                color: #00A298;
                word-break: break-all;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">
                    Sistema <span class="accent">GENTE</span>
                </div>
                <div style="font-size: 14px; color: #666; margin-top: 5px;">
                    PLBrasil Health&Safety
                </div>
            </div>
            
            <div class="content">
                <div class="greeting">
                    Olá, ${firstName}!
                </div>
                
                <div class="message">
                    Recebemos uma solicitação para redefinir a senha da sua conta no Sistema GENTE.
                </div>
                
                <div class="message">
                    Para criar uma nova senha, clique no botão abaixo:
                </div>
                
                <div style="text-align: center;">
                    <a href="${resetLink}" class="button">Redefinir Senha</a>
                </div>
                
                <div class="warning">
                    <strong>⚠️ Importante:</strong>
                    <ul>
                        <li>Este link é válido por apenas <strong>1 hora</strong></li>
                        <li>Por segurança, você só pode usar este link uma vez</li>
                        <li>Se você não solicitou esta redefinição, ignore este email</li>
                    </ul>
                </div>
                
                <div class="message">
                    Se o botão não funcionar, copie e cole o link abaixo em seu navegador:
                </div>
                
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 10px 0;">
                    <a href="${resetLink}" class="link">${resetLink}</a>
                </div>
            </div>
            
            <div class="footer">
                <p>Sistema GENTE © 2025 | PLBrasil Health&Safety</p>
                <p>Este é um email automático, não responda a esta mensagem.</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  // Enviar email de recuperação de senha
  static async sendPasswordResetEmail(
    email: string, 
    firstName: string, 
    resetToken: string
  ): Promise<boolean> {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
    
    const htmlContent = this.generatePasswordResetEmail(firstName, resetLink);
    
    return await this.sendEmail({
      to: email,
      subject: '🔐 Recuperação de Senha - Sistema GENTE',
      html: htmlContent,
      text: `
Olá, ${firstName}!

Recebemos uma solicitação para redefinir a senha da sua conta no Sistema GENTE.

Para criar uma nova senha, acesse o link abaixo:
${resetLink}

IMPORTANTE:
- Este link é válido por apenas 1 hora
- Por segurança, você só pode usar este link uma vez
- Se você não solicitou esta redefinição, ignore este email

Sistema GENTE © 2025 | PLBrasil Health&Safety
      `
    });
  }
} 