# Página de Login - Sistema PLBrasil Health&Safety

## Descrição

A página de login foi criada baseada no design fornecido, seguindo as diretrizes de cores da PLBrasil Health&Safety. A página inclui funcionalidades de login e criação de conta.

## Características

### Design
- **Background**: Gradiente com cores da PLBrasil (#00A298 e #1D3C44) + imagem de fundo
- **Logo**: PLBrasil Health&Safety no topo da página
- **Elementos visuais**: Elementos decorativos circulares espalhados pelo fundo
- **Cores**: Seguindo as especificações do arquivo de configuração

### Funcionalidades
- ✅ Formulário de login (E-mail e Senha)
- ✅ Opção "Esqueci minha Senha"
- ✅ Toggle para criar nova conta
- ✅ Formulário de criação de conta
- ✅ Botão de suporte no canto inferior direito
- ✅ Design responsivo
- ✅ Animações e transições suaves

### Navegação
- **Página inicial (/)**: Redireciona automaticamente para `/login`
- **Página de login (/login)**: Página principal de autenticação
- **Página home (/home)**: Página de destino após login (placeholder)

## Como testar

1. Execute o servidor de desenvolvimento:
```bash
cd frontend
npm run dev
```

2. Acesse `http://localhost:3000` - será redirecionado para `/login`

3. Teste as funcionalidades:
   - Alternar entre "Login" e "Criar Conta"
   - Campos de formulário funcionais
   - Links e botões responsivos

## Arquivos criados/modificados

- `src/app/login/page.tsx` - Página principal de login
- `src/app/home/page.tsx` - Página home (placeholder)
- `src/app/page.tsx` - Redirecionamento automático para login
- `public/plbrasil-background.jpg` - Placeholder para imagem de fundo

## Próximos passos

1. **Substituir a imagem de fundo**: Coloque a imagem real da PLBrasil em `public/plbrasil-background.jpg`
2. **Implementar autenticação**: Conectar com backend para validação de login
3. **Desenvolver página home**: Criar dashboard principal do sistema
4. **Adicionar validações**: Implementar validação de formulários
5. **Testes**: Criar testes unitários e de integração

## Cores utilizadas

```css
--primary: #00A298     /* Verde PLBrasil Health&Safety */
--secondary: #1D3C44   /* Verde Escuro PLBrasil */
--accent: #AECECB      /* Verde Água PLBrasil */
--text: #1D3C44        /* Texto principal */
--background: #FFFFFF  /* Fundo branco */
``` 