<p align="center">
  <strong>Aluplan Support Desk</strong><br>
  <em>AI-Powered Customer Support Platform</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Turborepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white" alt="Turborepo" />
</p>

---

## 📋 Overview

Aluplan Support Desk is a modern, AI-powered customer support platform built for B2B companies. It combines ticket management, knowledge base, FAQ self-learning, and CRM integration into a single enterprise-grade solution.

### Key Features

| Feature | Description |
|---------|-------------|
| 🎫 **Ticket Management** | Full lifecycle with SLA tracking, escalation, and priority management |
| 📚 **Knowledge Base** | Version-controlled articles with semantic search (pgvector) |
| 🤖 **AI Assistant** | Ollama-powered intelligent responses with confidence scoring |
| 📖 **FAQ Self-Learning** | Automated FAQ generation from ticket interactions |
| 👥 **Customer Portal** | Self-registration with CRM customer number verification |
| 👨‍💼 **Team Management** | RBAC-based internal user and role management |
| 📊 **Real-time Notifications** | WebSocket-based live updates for tickets and SLA breaches |

## 🏗 Architecture

```
aluplan-support-desk-V02/
├── apps/
│   ├── backend/          # NestJS API (Port 4000)
│   └── frontend/         # Next.js 15 App (Port 3000)
├── packages/
│   └── database/         # Prisma schema, migrations, seed
├── docs/                 # Architecture & planning docs
├── docker-compose.yml    # PostgreSQL + Ollama
├── turbo.json            # Turborepo pipeline config
└── package.json          # Root workspace
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React 19, Tailwind CSS, shadcn/ui |
| **Backend** | NestJS, Passport JWT, Socket.IO |
| **Database** | PostgreSQL 16 + pgvector extension |
| **ORM** | Prisma 6 |
| **AI** | Ollama (local LLM inference) |
| **Monorepo** | Turborepo + pnpm workspaces |
| **Container** | Docker Compose |

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **pnpm** ≥ 8
- **Docker** & Docker Compose
- **Git**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/aluplan-support-desk-V02.git
cd aluplan-support-desk-V02

# 2. Install dependencies
pnpm install

# 3. Copy environment variables
cp .env.example apps/backend/.env

# 4. Start infrastructure (PostgreSQL + Ollama)
docker-compose up -d postgres ollama

# 5. Run database migrations and seed
cd packages/database
npx prisma migrate dev
npx prisma db seed
cd ../..

# 6. Start development servers
pnpm dev
```

### Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@aluplan.com` | `Admin123!` |

### API Documentation

The backend API is available at `http://localhost:4000/api/v1`. Key endpoints:

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | Public | Login |
| GET | `/auth/me` | JWT | Current user |
| POST | `/customers/register` | Public | Customer self-registration |
| GET | `/customers` | Admin/Agent | List customers |
| GET | `/tickets` | JWT | List tickets |
| POST | `/tickets` | JWT | Create ticket |
| GET | `/knowledge-base/articles` | JWT | List articles |
| POST | `/ai/query` | JWT | AI query |
| GET | `/faq/published` | Public | Published FAQs |

## 🗄 Database Schema

The system uses **15 models** organized into 6 domains:

- **Auth & RBAC:** User, Role, Permission, UserRole, RolePermission
- **Customer CRM:** CustomerProfile (linked 1:1 to User)
- **Knowledge Base:** Category, KnowledgeArticle, KnowledgeArticleVersion, KnowledgeEmbedding
- **AI & Feedback:** AiInteraction, InteractionFeedback, TrainingQueue
- **Support Tickets:** Ticket, TicketMessage, TicketEscalation
- **FAQ:** FaqEntry
- **System:** Setting, AuditLog

## 📁 Environment Variables

See [`.env.example`](.env.example) for all required variables. Critical ones:

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `JWT_SECRET` | JWT signing secret | — |
| `JWT_REFRESH_SECRET` | Refresh token secret | — |
| `OLLAMA_BASE_URL` | Ollama API endpoint | `http://localhost:11434` |
| `PORT` | Backend port | `4000` |

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, branch naming conventions, and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ by the Aluplan Engineering Team
</p>
