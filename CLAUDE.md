# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sistema GENTE is a full-stack business management system focused on occupational health and safety compliance for PLBrasil Health&Safety. The application consists of:

- **Backend**: Express.js + TypeScript API (port 3001)
- **Frontend**: Next.js 15 + TypeScript with App Router (port 3000)
- **Database**: PostgreSQL with connection pooling

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

## Architecture & Key Patterns

### Authentication Flow
- JWT-based authentication with bcryptjs password hashing
- Role-based access control (SUPER_ADMIN, ADMIN, USER)
- Password reset via email tokens with expiration
- Frontend auth state managed in localStorage with useEffect protection

### Backend Structure
- **Model-Controller-Route pattern**: `/models`, `/controllers`, `/routes`
- **Middleware stack**: Auth, CORS, security (helmet), logging (morgan)
- **Database abstraction**: Custom query wrapper with connection pooling
- **Email service**: Production Gmail SMTP integration

### Frontend Structure
- **App Router architecture**: `/app` directory with layout.tsx
- **Component-based design**: Reusable UI with Tailwind CSS + Lucide icons
- **Client-side routing**: Protected routes with authentication checks
- **State management**: React hooks with localStorage persistence

### Security Implementation
- Parameterized queries for SQL injection protection
- CORS configuration for frontend URL whitelisting
- JWT token validation middleware for protected routes
- Input validation for email formats and password strength

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
- **Authentication**: Login, registration, password recovery
- **Dashboard**: Multi-module navigation (SST, eSocial, Funcionários)
- **User Management**: Role-based access control
- **Email Integration**: Notification and recovery systems

## Testing & Quality

- No formal test suite currently implemented
- Manual testing via `test-api.html` and `database-test.js`
- ESLint configured for frontend code quality
- TypeScript strict mode enabled for both backend and frontend

## Development Workflow

1. Ensure PostgreSQL is running locally
2. Configure environment files in both backend and frontend
3. Run `npm run dev` in both directories simultaneously
4. Backend API available at http://localhost:3001
5. Frontend application at http://localhost:3000

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

- Email service requires Gmail App Password configuration (see CONFIGURAR_GMAIL_SMTP.md)
- Database connection issues: verify PostgreSQL service and credentials
- CORS errors: check FRONTEND_URL in backend .env matches frontend URL