import nodemailer from 'nodemailer';

// Configuração do transporter de email - MODO PRODUÇÃO
const createTransporter = async () => {
  // Verificar se temos configurações Gmail válidas
  const hasGmailConfig = process.env.EMAIL_USER && 
                        process.env.EMAIL_PASSWORD && 
                        process.env.EMAIL_PASSWORD !== 'INSIRA_AQUI_A_SENHA_DE_APP_DO_GMAIL';
  
  if (!hasGmailConfig) {
    console.error('❌ CONFIGURAÇÃO GMAIL OBRIGATÓRIA!');
    console.log('💡 Para enviar emails reais:');
    console.log('   1. Acesse myaccount.google.com');
    console.log('   2. Ative verificação em duas etapas');
    console.log('   3. Gere uma "senha de app" para Email');
    console.log('   4. Coloque a senha no EMAIL_PASSWORD do local.env');
    throw new Error('Gmail SMTP não configurado. Configure EMAIL_PASSWORD no local.env');
  }

  console.log('📧 Configurando Gmail SMTP para PRODUÇÃO...');
  
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    // Verificar a configuração
    await transporter.verify();
    console.log('✅ Gmail SMTP configurado com sucesso!');
    console.log('📮 Enviando emails reais de:', process.env.EMAIL_USER);
    console.log('🎯 MODO PRODUÇÃO - Emails serão enviados para usuários reais');
    
    return transporter;
  } catch (error) {
    console.error('❌ Erro na configuração Gmail SMTP:', error);
    console.log('💡 Verifique se:');
    console.log('   1. EMAIL_USER e EMAIL_PASSWORD estão corretos no local.env');
    console.log('   2. Você está usando uma "senha de app" do Gmail (não sua senha normal)');
    console.log('   3. A verificação em duas etapas está ativada na conta Gmail');
    throw error; // Falhar completamente se não conseguir configurar
  }
};

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailService {
  
  // Enviar email - MODO PRODUÇÃO
  static async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      console.log(`📤 ENVIANDO EMAIL REAL para: ${options.to}`);
      
      const transporter = await createTransporter();
      
      const mailOptions = {
        from: `"Sistema GENTE" <${process.env.EMAIL_FROM}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || ''
      };

      console.log('📮 Remetente:', mailOptions.from);
      console.log('📧 Destinatário:', options.to);
      console.log('📋 Assunto:', options.subject);

      const info = await transporter.sendMail(mailOptions);
      
      console.log('✅ EMAIL REAL ENVIADO COM SUCESSO!');
      console.log('🎯 Email enviado para:', options.to);
      console.log('🆔 Message ID:', info.messageId);
      console.log('📬 VERIFIQUE A CAIXA DE ENTRADA (inclusive spam)');
      
      // Extrair token apenas para logs de segurança
      const tokenMatch = options.html.match(/token=([a-f0-9-]+)/);
      if (tokenMatch) {
        const token = tokenMatch[1];
        console.log('🔐 Token de recuperação gerado:', token.substring(0, 8) + '...');
      }
      
      console.log('='.repeat(80));

      return true;
    } catch (error: any) {
      console.error('❌ ERRO CRÍTICO ao enviar email:', error);
      console.error('📋 Detalhes do erro:', {
        message: error?.message || 'Erro desconhecido',
        code: error?.code || 'N/A',
        command: error?.command || 'N/A',
        para: options.to,
        assunto: options.subject
      });
      
      console.log('💡 Verifique:');
      console.log('   1. Configuração Gmail SMTP no local.env');
      console.log('   2. Conexão com internet');
      console.log('   3. Senha de app válida');
      
      // Em modo produção, sempre falhar se não conseguir enviar
      throw error;
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
                color: #ffffff !important;
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
                    Você solicitou a recuperação de senha para sua conta no <strong>Sistema GENTE</strong> da PLBrasil Health&Safety.
                </div>
                
                <div class="message">
                    Para definir uma nova senha e acessar sua conta novamente, clique no botão abaixo:
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
                <p><strong>Sistema GENTE © 2025 | PLBrasil Health&Safety</strong></p>
                <p>Este é um email automático enviado de: plbrasilrecovery01@gmail.com</p>
                <p>Se você não solicitou esta recuperação, entre em contato conosco.</p>
                <p>© 2025 PLBrasil Health&Safety - Todos os direitos reservados</p>
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
      subject: '🔐 Solicitação de Recuperação de Senha - Sistema GENTE | PLBrasil Health&Safety',
      html: htmlContent,
      text: `
Olá, ${firstName}!

Você solicitou a recuperação de senha para sua conta no Sistema GENTE da PLBrasil Health&Safety.

Para criar uma nova senha, acesse o link abaixo:
${resetLink}

IMPORTANTE:
- Este link é válido por apenas 1 hora
- Por segurança, você só pode usar este link uma vez
- Se você não solicitou esta redefinição, ignore este email

Atenciosamente,
Equipe Sistema GENTE
PLBrasil Health&Safety

© 2025 PLBrasil Health&Safety - Todos os direitos reservados
      `
    });
  }
} 