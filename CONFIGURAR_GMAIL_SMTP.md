# 🎯 CONFIGURAÇÃO GMAIL SMTP - MODO PRODUÇÃO

## ✅ SISTEMA CONFIGURADO PARA EMAILS REAIS

O sistema está agora configurado para **ENVIAR EMAILS REAIS** diretamente do Gmail.

### ⚠️ STATUS ATUAL
- ❌ **Gmail SMTP não configurado**
- ✅ Sistema pronto para produção
- ✅ Fallbacks de teste removidos

## 🚀 CONFIGURAÇÃO OBRIGATÓRIA

### 📋 PASSO 1: Gerar Senha de App Gmail

1. **Acesse**: [myaccount.google.com](https://myaccount.google.com)
2. **Vá em**: Segurança → Verificação em duas etapas
3. **Ative** a verificação em duas etapas (se não estiver ativa)
4. **Procure**: "Senhas de app" ou "App passwords"
5. **Clique**: "Senhas de app"
6. **Selecione**:
   - App: **Email** ou **Other (Custom)**
   - Nome: **Sistema GENTE**
7. **Clique**: Gerar
8. **COPIE** a senha de 16 caracteres (exemplo: `lnul xkoq idfk xgai`)

### 📝 PASSO 2: Atualizar local.env

**SUBSTITUA** esta linha no arquivo `backend/local.env`:

```env
EMAIL_PASSWORD=INSIRA_AQUI_A_SENHA_DE_APP_DO_GMAIL
```

**POR** (usando sua senha gerada):

```env
EMAIL_PASSWORD=sua_senha_de_16_caracteres_aqui
```

**Exemplo real:**
```env
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

### 🔄 PASSO 3: Reiniciar Servidor

```powershell
# Parar servidor atual (Ctrl+C na janela do servidor)
# Depois executar:
cd backend
npm run dev
```

### 🎯 PASSO 4: Testar Sistema

**No console do backend, você verá:**

✅ **Se configurado corretamente:**
```
✅ Gmail SMTP configurado com sucesso!
📮 Enviando emails reais de: plhealthgithub@gmail.com
🎯 MODO PRODUÇÃO - Emails serão enviados para usuários reais
```

❌ **Se não configurado:**
```
❌ CONFIGURAÇÃO GMAIL OBRIGATÓRIA!
Gmail SMTP não configurado. Configure EMAIL_PASSWORD no local.env
```

### 📧 TESTE REAL

1. **Use a recuperação de senha no frontend**
2. **Email será enviado IMEDIATAMENTE** para o email cadastrado no banco
3. **Verifique a caixa de entrada** (inclusive spam) do email destinatário

## 🔒 CARACTERÍSTICAS DO MODO PRODUÇÃO

- ✅ **Emails reais** enviados via Gmail SMTP
- ✅ **Sem fallbacks** de teste
- ✅ **Falha** se não conseguir enviar (comportamento correto)
- ✅ **Logs detalhados** para debug
- ✅ **Validação** de configuração obrigatória

## 🚨 PROBLEMAS COMUNS

### ❌ "Gmail SMTP não configurado"
- Configure a senha de app no `EMAIL_PASSWORD`

### ❌ "Invalid login"
- Use **senha de app**, não a senha normal do Gmail
- Verifique se verificação em duas etapas está ativa

### ❌ Email não chega
- Verifique pasta **SPAM** do destinatário
- Aguarde alguns minutos
- Certifique-se que o email existe no banco de dados

---

**🎯 RESULTADO**: Emails reais serão enviados para qualquer email cadastrado no banco de dados! 