# 🚀 Genesis Engine

**AI-Powered Startup Automation Platform**

Genesis Engine is a comprehensive platform that automates the entire startup journey from ideation to funding, incorporating AI-driven insights, compliance management, financial planning, and investor networking.

## 🌟 Features

### Core Services
- **🏢 Company Management** - Complete company lifecycle management
- **💰 Financial Planning** - AI-powered financial projections and analysis
- **📋 Compliance Automation** - Regulatory compliance and filing management
- **🤝 CRM & Networking** - Customer relationship management with investor matching
- **📅 Calendar Integration** - Smart scheduling with availability management
- **💳 Billing & Subscriptions** - Complete subscription and payment management
- **📨 Communication Hub** - Multi-channel messaging and notifications
- **⚡ AI Integration** - OpenAI, Anthropic, Google AI, and Cohere integration

### Technical Features
- **Microservices Architecture** - Scalable, independent services
- **API Gateway** - Load balancing, circuit breakers, and service discovery
- **Queue System** - Background job processing with BullMQ
- **Real-time Monitoring** - Health checks and metrics
- **Database Integration** - PostgreSQL + Neo4j graph database
- **Security** - JWT authentication, rate limiting, CORS
- **Docker Support** - Complete containerization

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │
│   (Next.js)     │◄──►│   (Fastify)     │
└─────────────────┘    └─────────────────┘
                              │
               ┌──────────────┼──────────────┐
               │              │              │
        ┌──────▼─────┐ ┌──────▼─────┐ ┌──────▼─────┐
        │Auth Service│ │User Service│ │Company     │
        │(Port 3002) │ │(Port 3004) │ │Service     │
        └────────────┘ └────────────┘ │(Port 3005) │
                                      └────────────┘
               ┌──────────────┼──────────────┐
               │              │              │
        ┌──────▼─────┐ ┌──────▼─────┐ ┌──────▼─────┐
        │Financial   │ │Compliance  │ │CRM Service │
        │Service     │ │Service     │ │(Port 3008) │
        │(Port 3006) │ │(Port 3007) │ └────────────┘
        └────────────┘ └────────────┘        │
                                             │
        ┌──────────────┼──────────────┐       │
        │              │              │       │
 ┌──────▼─────┐ ┌──────▼─────┐ ┌──────▼─────┐ │
 │Calendar    │ │Billing     │ │Queue Service│ │
 │Service     │ │Service     │ │(Port 3014) │ │
 │(Port 3009) │ │(Port 3010) │ └────────────┘ │
 └────────────┘ └────────────┘                │
                                              │
               ┌──────────────────────────────┘
               │
        ┌──────▼─────┐ ┌──────────────┐ ┌──────────────┐
        │PostgreSQL  │ │    Redis     │ │   Neo4j      │
        │(Port 5432) │ │  (Port 6379) │ │ (Port 7687)  │
        └────────────┘ └──────────────┘ └──────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+
- Git

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/your-org/genesis-engine.git
cd genesis-engine

# Make setup scripts executable
chmod +x scripts/*.sh

# Run the complete setup
make setup
```

### 2. Start All Services

```bash
# Start all services with Docker Compose
make dev

# Or use Docker Compose directly
docker-compose up -d
```

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:3001
- **API Documentation**: http://localhost:3001/documentation
- **MailHog (Email Testing)**: http://localhost:8025
- **pgAdmin (Database Admin)**: http://localhost:5050

## 📚 API Documentation

### Authentication
```bash
# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password","firstName":"John","lastName":"Doe"}'
```

### Company Management
```bash
# Create company
curl -X POST http://localhost:3001/api/companies \
  -H "Content-Type: application/json" \
  -d '{"name":"My Startup","type":"llc","jurisdiction":"uk"}'

# Get companies
curl http://localhost:3001/api/companies
```

### Health Checks
```bash
# Overall health
curl http://localhost:3001/health

# Service-specific health
curl http://localhost:3001/api/monitoring/health/services/auth-service
```

## 🛠️ Development Commands

```bash
# Complete setup
make setup

# Start development environment
make dev

# Start only backend services
make dev-backend

# Start only frontend
make dev-frontend

# Run tests
make test

# Check service status
make status

# View logs
make logs

# Clean everything
make clean
```

## 🔧 Configuration

### Environment Variables

Create `.env` files in each service directory or use the provided setup script:

```bash
# Run setup to create environment files
make setup-env
```

### Key Configuration Files

- `docker-compose.yml` - Service orchestration
- `Makefile` - Development commands
- `scripts/setup.sh` - Initial setup script
- `scripts/create-env.sh` - Environment creation script

## 🗄️ Database Schema

### PostgreSQL Tables
- Users, Sessions, Companies
- Financial projections, Transactions
- Compliance tasks, Records, Deadlines
- CRM contacts, Deals, Campaigns
- Calendar events, Availability, Meeting rooms
- Billing subscriptions, Invoices, Payments

### Neo4j Graph Schema
- Company relationships and networks
- Knowledge graph entities and connections
- Investor-company matching algorithms

## 🔒 Security Features

- **JWT Authentication** with refresh tokens
- **Rate Limiting** per service and globally
- **CORS Protection** with configurable origins
- **Input Validation** with Zod schemas
- **SQL Injection Protection** with Prisma ORM
- **HTTPS Enforcement** in production
- **API Key Management** for external services

## 📊 Monitoring & Observability

### Health Checks
- Service-level health endpoints
- Database connectivity checks
- External API availability monitoring

### Metrics
- Request/response times
- Error rates by service
- Queue processing metrics
- Database query performance

### Logging
- Structured JSON logging
- Request/response logging
- Error tracking with context
- Performance monitoring

## 🚢 Deployment

### Docker Deployment

```bash
# Build for production
make prod-build

# Deploy to production
make prod-deploy
```

### Manual Deployment

```bash
# Install dependencies
npm run install:all

# Build all services
npm run build:all

# Start services
docker-compose -f docker-compose.yml up -d
```

## 🧪 Testing

```bash
# Run all tests
npm run test:all

# Run specific service tests
cd backend/auth-service && npm test

# Run integration tests
npm run test:integration
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes and add tests
4. Run tests: `make test`
5. Commit your changes: `git commit -am 'Add my feature'`
6. Push to the branch: `git push origin feature/my-feature`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: See API docs at `/documentation`
- **Issues**: [GitHub Issues](https://github.com/your-org/genesis-engine/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/genesis-engine/discussions)

## 🎯 Roadmap

- [x] Core microservices architecture
- [x] AI integration (OpenAI, Anthropic, Google AI)
- [x] Compliance automation
- [x] Financial planning tools
- [x] Investor networking (Nexus)
- [x] Real-time communication
- [x] Queue-based job processing
- [x] Docker containerization
- [x] API Gateway with load balancing
- [ ] Kubernetes deployment
- [ ] Multi-region deployment
- [ ] Advanced AI features
- [ ] Mobile app
- [ ] Integration marketplace

---

**Genesis Engine** - Transforming startup journeys with AI-powered automation 🚀