# Configuração das Variáveis de Ambiente

## Como configurar

1. Copie o arquivo `config.example.env` para `.env`:
   ```powershell
   copy config.example.env .env
   ```

2. Edite o arquivo `.env` com suas configurações locais:
   - Defina uma senha segura para o banco PostgreSQL
   - Gere um JWT_SECRET seguro (pode usar: https://generate-secret.vercel.app/32)
   - Ajuste outras configurações conforme necessário

## Variáveis Principais

- **PORT**: Porta do servidor backend (padrão: 3001)
- **NODE_ENV**: Ambiente de execução (development/production)
- **DB_***: Configurações do banco PostgreSQL
- **JWT_SECRET**: Chave secreta para tokens JWT
- **FRONTEND_URL**: URL do frontend para configuração de CORS

## Segurança

⚠️ **NUNCA** commite o arquivo `.env` no Git. Ele já está incluído no `.gitignore`. 