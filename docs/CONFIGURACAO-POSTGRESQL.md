# 🗄️ Configuração do PostgreSQL - Sistema GENTE

## 📋 Passo a Passo Completo

### 1. **Instalar PostgreSQL**
- Baixe: https://www.postgresql.org/download/windows/
- Durante instalação:
  - **Porta**: 5432 (padrão)
  - **Senha superuser**: Anote esta senha!
  - **Locale**: Portuguese, Brazil

### 2. **Configurar Banco de Dados**
Abra o **pgAdmin** ou **psql** e execute:

```sql
-- Criar banco
CREATE DATABASE sistema_gente;

-- Criar usuário (opcional)
CREATE USER gente_user WITH PASSWORD 'sua_senha_segura';
GRANT ALL PRIVILEGES ON DATABASE sistema_gente TO gente_user;
```

### 3. **Configurar Variáveis de Ambiente**
```powershell
cd backend
copy config.example.env .env
```

Edite o arquivo `.env` com suas configurações:
```env
# Configurações do Banco
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sistema_gente
DB_USER=postgres         # ou gente_user se criou
DB_PASSWORD=sua_senha    # senha que você definiu
```

### 4. **Executar Script de Configuração**
No pgAdmin ou psql, conecte ao banco `sistema_gente` e execute:
```powershell
# Copie o conteúdo do arquivo:
backend/scripts/setup-database.sql
```

### 5. **Testar Conexão**
```powershell
cd backend
npm run dev
```

Acesse:
- **Health Check**: http://localhost:3001/health
- **Teste DB**: http://localhost:3001/db-test

## ✅ Verificações

### Health Check deve retornar:
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### DB Test deve retornar:
```json
{
  "message": "Conexão com banco funcionando!",
  "data": {
    "current_time": "2024-01-01T00:00:00.000Z",
    "postgres_version": "PostgreSQL 16..."
  }
}
```

## 🚨 Problemas Comuns

### "ECONNREFUSED"
- Verifique se PostgreSQL está rodando
- Confirme porta 5432
- Verifique firewall

### "password authentication failed"
- Confirme senha no arquivo `.env`
- Verifique usuário criado

### "database does not exist"
- Crie o banco `sistema_gente`
- Verifique nome no `.env`

## 📁 Arquivos Importantes

- `backend/.env` - Suas configurações (NÃO committar)
- `backend/config.example.env` - Exemplo
- `backend/src/config/database.ts` - Configuração de conexão
- `backend/scripts/setup-database.sql` - Script inicial 