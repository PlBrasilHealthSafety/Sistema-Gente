# APIs de Cadastros - Sistema GENTE

## Estrutura Organizacional

Este documento descreve as APIs para os módulos de cadastro da estrutura organizacional: **Grupos**, **Regiões** e **Empresas**.

### Autenticação

Todas as rotas requerem autenticação via token JWT no header:
```
Authorization: Bearer {token}
```

### Níveis de Acesso

- **USER**: Apenas leitura (visualização)
- **ADMIN**: Leitura + Escrita (CRUD completo)
- **SUPER_ADMIN**: Leitura + Escrita (CRUD completo)

---

## 🏢 API de Grupos

Base URL: `/api/grupos`

### Endpoints de Leitura (USER, ADMIN, SUPER_ADMIN)

#### Listar todos os grupos
```http
GET /api/grupos
```

#### Listar grupos ativos
```http
GET /api/grupos/ativos
```

#### Listar grupos raiz (sem pai)
```http
GET /api/grupos/raiz
```

#### Buscar grupo por ID
```http
GET /api/grupos/:id
```

#### Buscar grupo com hierarquia
```http
GET /api/grupos/:id/hierarquia
```

#### Buscar subgrupos
```http
GET /api/grupos/:id/subgrupos
```

#### Estatísticas dos grupos
```http
GET /api/grupos/stats
```

### Endpoints de Escrita (ADMIN, SUPER_ADMIN)

#### Criar grupo
```http
POST /api/grupos
Content-Type: application/json

{
  "nome": "Nome do Grupo",
  "descricao": "Descrição opcional",
  "codigo": "COD_GRUPO",
  "status": "ativo",
  "grupo_pai_id": 1
}
```

#### Atualizar grupo
```http
PUT /api/grupos/:id
Content-Type: application/json

{
  "nome": "Novo nome",
  "status": "inativo"
}
```

#### Deletar grupo (soft delete)
```http
DELETE /api/grupos/:id
```

---

## 🌍 API de Regiões

Base URL: `/api/regioes`

### Endpoints de Leitura (USER, ADMIN, SUPER_ADMIN)

#### Listar todas as regiões
```http
GET /api/regioes
```

#### Listar regiões ativas
```http
GET /api/regioes/ativas
```

#### Buscar região por ID
```http
GET /api/regioes/:id
```

#### Buscar regiões por UF
```http
GET /api/regioes/uf/:uf
```

#### Buscar regiões por cidade
```http
GET /api/regioes/cidade/:cidade
```

#### Listar UFs disponíveis
```http
GET /api/regioes/ufs
```

#### Estatísticas das regiões
```http
GET /api/regioes/stats
```

### Endpoints de Escrita (ADMIN, SUPER_ADMIN)

#### Criar região
```http
POST /api/regioes
Content-Type: application/json

{
  "nome": "Nome da Região",
  "descricao": "Descrição opcional",
  "codigo": "REG_001",
  "uf": "SP",
  "cidade": "São Paulo",
  "status": "ativo"
}
```

#### Atualizar região
```http
PUT /api/regioes/:id
Content-Type: application/json

{
  "nome": "Novo nome",
  "uf": "RJ"
}
```

#### Deletar região (soft delete)
```http
DELETE /api/regioes/:id
```

---

## 🏭 API de Empresas

Base URL: `/api/empresas`

### Endpoints de Leitura (USER, ADMIN, SUPER_ADMIN)

#### Listar todas as empresas
```http
GET /api/empresas
```

#### Listar empresas ativas
```http
GET /api/empresas/ativas
```

#### Buscar empresa por ID
```http
GET /api/empresas/:id
```

#### Buscar empresas com filtros
```http
GET /api/empresas/filtros?razao_social=empresa&uf=SP&status=ativo
```

Parâmetros de filtro:
- `razao_social`: Busca por razão social (LIKE)
- `nome_fantasia`: Busca por nome fantasia (LIKE)
- `cnpj`: Busca por CNPJ exato
- `status`: Filtro por status (ativo/inativo)
- `grupo_id`: Filtro por grupo
- `regiao_id`: Filtro por região
- `uf`: Filtro por UF
- `cidade`: Busca por cidade (LIKE)

#### Buscar empresas por grupo
```http
GET /api/empresas/grupo/:grupoId
```

#### Buscar empresas por região
```http
GET /api/empresas/regiao/:regiaoId
```

#### Estatísticas das empresas
```http
GET /api/empresas/stats
```

### Endpoints de Escrita (ADMIN, SUPER_ADMIN)

#### Criar empresa
```http
POST /api/empresas
Content-Type: application/json

{
  "razao_social": "Empresa Exemplo LTDA",
  "nome_fantasia": "Empresa Exemplo",
  "cnpj": "12.345.678/0001-90",
  "inscricao_estadual": "123456789",
  "inscricao_municipal": "987654321",
  "email": "contato@empresa.com",
  "telefone": "(11) 99999-9999",
  "site": "https://empresa.com",
  "endereco": "Rua Exemplo, 123",
  "numero": "123",
  "complemento": "Sala 456",
  "bairro": "Centro",
  "cidade": "São Paulo",
  "uf": "SP",
  "cep": "01234-567",
  "status": "ativo",
  "grupo_id": 1,
  "regiao_id": 1
}
```

#### Atualizar empresa
```http
PUT /api/empresas/:id
Content-Type: application/json

{
  "nome_fantasia": "Novo Nome Fantasia",
  "telefone": "(11) 88888-8888"
}
```

#### Deletar empresa (soft delete)
```http
DELETE /api/empresas/:id
```

---

## 📊 Estrutura de Resposta

### Sucesso
```json
{
  "success": true,
  "data": { ... },
  "message": "Operação realizada com sucesso"
}
```

### Erro
```json
{
  "success": false,
  "message": "Descrição do erro",
  "error": "CODIGO_ERRO"
}
```

---

## 🔒 Códigos de Erro Comuns

- `UNAUTHORIZED`: Token não fornecido ou inválido
- `FORBIDDEN`: Permissões insuficientes
- `VALIDATION_ERROR`: Dados inválidos
- `NOT_FOUND`: Recurso não encontrado
- `CODE_ALREADY_EXISTS`: Código já existe
- `CNPJ_ALREADY_EXISTS`: CNPJ já cadastrado
- `INVALID_CNPJ`: CNPJ inválido
- `HAS_CHILDREN`: Não é possível deletar item com dependências
- `REGION_IN_USE`: Região sendo usada por empresas
- `INTERNAL_SERVER_ERROR`: Erro interno do servidor

---

## 📝 Validações

### Grupos
- **nome**: Obrigatório, não pode estar vazio
- **codigo**: Único no sistema (se fornecido)
- **grupo_pai_id**: Deve existir no banco (se fornecido)

### Regiões
- **nome**: Obrigatório, não pode estar vazio
- **codigo**: Único no sistema (se fornecido)
- **uf**: Deve ter exatamente 2 caracteres (se fornecida)

### Empresas
- **razao_social**: Obrigatória, não pode estar vazia
- **cnpj**: Obrigatório, deve ser válido e único
- **grupo_id**: Deve existir no banco (se fornecido)
- **regiao_id**: Deve existir no banco (se fornecida)

---

## 🚀 Exemplos de Uso

### Autenticação
1. Faça login em `/api/auth/login`
2. Use o token retornado nas requisições subsequentes

### Fluxo típico
1. Criar grupos organizacionais
2. Criar regiões geográficas
3. Criar empresas vinculadas aos grupos e regiões
4. Consultar dados com filtros específicos

### Hierarquia de Grupos
```
Grupo Matriz (id: 1)
├── Grupo Regional Sul (id: 2, grupo_pai_id: 1)
│   ├── Filial Porto Alegre (id: 3, grupo_pai_id: 2)
│   └── Filial Curitiba (id: 4, grupo_pai_id: 2)
└── Grupo Regional Sudeste (id: 5, grupo_pai_id: 1)
    ├── Filial São Paulo (id: 6, grupo_pai_id: 5)
    └── Filial Rio de Janeiro (id: 7, grupo_pai_id: 5)
``` 