# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Important Information

- **Environment: Windows PowerShell - ALWAYS USE COMMANDS AIMED AT POWERSHELL**
- **Shadcn Command**: `npx shadcn@latest add`
- **Always analyze Pull Requests for potential breaking changes and adjust code for best integration**
- **Always use local.env as the main .env file for configuration in development**
- **Always use npm run dev in the correct directory**

## Project Overview

Sistema GENTE is a full-stack business management system focused on occupational health and safety compliance for PLBrasil Health&Safety. The application consists of:

- **Backend**: Express.js + TypeScript API (port 3001)
- **Frontend**: Next.js 15 + TypeScript with App Router (port 3000)
- **Database**: PostgreSQL with connection pooling

## Tech Stack

### Frontend
- **Next.js 15** with App Router and TypeScript
- **Tailwind CSS** with custom PLBrasil design system
- **ShadcnUI** for component library
- **Lucide React** for icons

### Backend
- **Node.js with Express** REST API
- **TypeScript** for type safety
- **PostgreSQL** with connection pooling
- **JWT authentication** with bcryptjs
- **Nodemailer** for email services

## Development Commands

### Backend (Express API)
```bash
cd backend
npm run dev        # Start development server with nodemon
npm run build      # Compile TypeScript to JavaScript
npm start          # Run compiled production build
```

### Frontend (Next.js)
```bash
cd frontend
npm run dev        # Start development server with Turbopack
npm run build      # Build for production
npm start          # Start production server
npm run lint       # Run ESLint
```

### Database Setup
```bash
# PostgreSQL must be running first
cd backend
node database-test.js  # Test database connection
```

## ShadcnUI Integration

### Installation
```bash
# Initialize ShadcnUI in frontend directory
npx shadcn@latest init

# Add components as needed
npx shadcn@latest add <component>
# Example: npx shadcn@latest add toast
```

### Tailwind Configuration
```bash
# Initialize Tailwind (already configured)
npx tailwindcss init -p
```

## Architecture & Key Patterns

### Authentication Flow
- JWT-based authentication with bcryptjs password hashing
- Role-based access control (SUPER_ADMIN, ADMIN, USER)
- Password reset via email tokens with expiration
- Frontend auth state managed in localStorage with useEffect protection
- **Password Requirements**: Minimum 6 characters + special characters (!@#$%^&*)

### Backend Structure
- **Model-Controller-Route pattern**: `/models`, `/controllers`, `/routes`
- **Middleware stack**: Auth, CORS, security (helmet), logging (morgan)
- **Database abstraction**: Custom query wrapper with connection pooling
- **Email service**: Production Gmail SMTP integration with Gmail App Password

### Frontend Structure
- **App Router architecture**: `/app` directory with layout.tsx
- **Component-based design**: Reusable UI with Tailwind CSS + Lucide icons
- **Client-side routing**: Protected routes with authentication checks
- **State management**: React hooks with localStorage persistence
- **Real-time validation**: Password strength indicators in registration forms

### Security Implementation
- Parameterized queries for SQL injection protection
- CORS configuration for frontend URL whitelisting
- JWT token validation middleware for protected routes
- Input validation for email formats and password strength with special characters
- Secure password hashing with bcryptjs (12 salt rounds)

## Environment Configuration

### Backend (.env)
Copy `config.example.env` to `.env` and configure:
- PostgreSQL credentials (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)
- JWT_SECRET for token signing
- Gmail SMTP credentials for email service
- FRONTEND_URL for CORS configuration

### Frontend (.env.local)
Copy `config.example.env` to `.env.local` and set:
- API backend URL (typically http://localhost:3001)

## Database Schema

The system uses PostgreSQL with these key tables:
- **users**: Complete user management with roles and timestamps
- **password_reset_tokens**: Secure token-based password recovery
- UUID primary keys with `uuid-ossp` extension
- Audit fields: created_at, updated_at, last_login

## Business Modules

Core functionality areas:
- **Authentication**: Login, registration, password recovery with email
- **Dashboard**: Multi-module navigation (SST, eSocial, Funcionários, Cadastros, Relatórios, Faturamento)
- **User Management**: Role-based access control
- **Email Integration**: Gmail SMTP for notifications and recovery systems
- **Occupational Safety (SST)**: Core business feature for compliance
- **eSocial Integration**: Brazilian government integration requirements

## Testing & Quality

- No formal test suite currently implemented
- Manual testing via `test-api.html` and `database-test.js`
- ESLint configured for frontend code quality
- TypeScript strict mode enabled for both backend and frontend

## Development Workflow

1. Ensure PostgreSQL is running locally
2. Configure environment files:
   - Backend: Copy `config.example.env` to `local.env`
   - Frontend: Copy `config.example.env` to `.env.local`
3. Run `npm run dev` in both directories simultaneously
4. Backend API available at http://localhost:3001
5. Frontend application at http://localhost:3000

## Project Creation Commands

### Frontend
```bash
npx create-next-app@latest sistema_gente
# Add TypeScript, Tailwind, and App Router during setup
```

### Backend
```bash
# Created manually with Express + TypeScript structure
npm init -y
npm install express typescript @types/express ts-node nodemon
```

## Color Palette

### Light Mode
```css
:root.light {
--primary: #00A298; /* Verde PLBrasil Health&Safety - cor vibrante para elementos principais */
--secondary: #1D3C44; /* Verde Escuro PLBrasil - para contraste e hierarquia */
--accent: #AECECB; /* Verde Água PLBrasil - para destaques suaves */
--text: #1D3C44; /* Verde Escuro PLBrasil - melhor legibilidade que #333333 */
--background: #FFFFFF; /* Mantém o branco para máximo contraste */
}
```

## Common Issues

- **Email service**: Requires Gmail App Password configuration (see CONFIGURAR_GMAIL_SMTP.md)
- **Database connection**: Verify PostgreSQL service and credentials in local.env
- **CORS errors**: Check FRONTEND_URL in backend local.env matches frontend URL
- **PowerShell commands**: Always use Windows PowerShell syntax for file operations
- **Environment files**: Use `local.env` in backend, `.env.local` in frontend
- **ShadcnUI components**: Initialize before adding components with `npx shadcn@latest init`

## Pull Request Guidelines

- Always analyze PRs for potential breaking changes
- Test authentication flows after merging auth-related changes
- Verify email functionality when modifying email services
- Check database migrations and schema changes
- Ensure both frontend and backend start successfully after changes