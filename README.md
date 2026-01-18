# 🚀 Genesis Engine

**AI-Powered Startup Automation Platform**

Genesis Engine is a comprehensive platform that automates the entire startup journey from ideation to funding, incorporating AI-driven insights, compliance management, financial planning, and investor networking.

## 🔥 **ARCHITECTURE UPDATE: Firebase + Lovable Cloud-Native**

**Genesis Engine has been completely refactored** to use modern serverless architecture:

### **Backend Services:**
- 🔥 **Firebase** - Authentication, Firestore database, real-time features, storage
- 🔗 **Lovable API** - External API management and integrations
- ⚡ **Firebase Realtime Database** - WebSocket-like real-time messaging
- 🔐 **Firebase Auth** - Secure authentication with Google, LinkedIn, email/password

### **Key Benefits:**
- ✅ **Zero server maintenance** - Fully managed cloud services
- ✅ **Real-time features** - Live messaging, notifications, presence indicators
- ✅ **Auto-scaling** - Handles millions of users automatically
- ✅ **Global CDN** - Fast performance worldwide
- ✅ **Enterprise security** - SOC2 compliant, encrypted data
- ✅ **Developer-friendly** - Easy deployment and updates

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

### Advanced Enterprise Features
- **📱 Mobile Applications** - React Native apps for iOS and Android
- **📊 Advanced Analytics** - Business intelligence and predictive modeling
- **🔗 Integration Marketplace** - Third-party service integrations
- **💰 API Monetization** - Developer platform with usage-based billing
- **🎨 White-label Solutions** - Custom branding and multi-tenant platform
- **🧠 Advanced AI** - Machine learning and predictive analytics

### Technical Features
- **Microservices Architecture** - Scalable, independent services
- **API Gateway** - Load balancing, circuit breakers, and service discovery
- **Queue System** - Background job processing with BullMQ
- **Real-time Monitoring** - Health checks and metrics
- **Database Integration** - PostgreSQL + Neo4j graph database
- **Security** - JWT authentication, rate limiting, CORS
- **Docker Support** - Complete containerization

## 🏗️ Architecture

### **New Cloud-Native Architecture:**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Frontend  │    │     Firebase     │    │  Mobile Apps    │
│   (Next.js)     │◄──►│   + Lovable API  │◄──►│ (React Native)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                              │
               ┌──────────────┼──────────────┐            ┌──▼────┐
               │              │              │            │Advanced │
        ┌──────▼─────┐ ┌──────▼─────┐ ┌──────▼─────┐      │Analytics│
        │   Firestore │ │Realtime DB │ │ Cloud Storage│     │Service │
        │  (Database) │ │(Messaging) │ │   (Files)   │     └───────┘
        └────────────┘ └────────────┘ └────────────┘            │
                                      │                         ┌▼─────────┐
                       ┌──────────────▼─────────────┐           │Third-party│
                       │      Lovable API Platform  │           │Integrations│
                       │  (External API Management) │           └───────────┘
                       └────────────────────────────┘
               ┌──────────────┼──────────────┐           │Marketplace │
               │              │              │           └────────────┘
        ┌──────▼─────┐ ┌──────▼─────┐ ┌──────▼─────┐            │
        │Financial   │ │Compliance  │ │CRM Service │      ┌────▼────┐
        │Service     │ │Service     │ │(Port 3008) │      │Marketplace│
        │(Port 3006) │ │(Port 3007) │ └────────────┘      │API        │
        └────────────┘ └────────────┘        │           └─────────┘
                                             │                 │
        ┌──────────────┼──────────────┐       │           ┌────▼────┐
        │              │              │       │           │White-   │
 ┌──────▼─────┐ ┌──────▼─────┐ ┌──────▼─────┐ │           │Label     │
 │Calendar    │ │Billing     │ │Queue Service│           │Service  │
 │Service     │ │Service     │ │(Port 3014) │           └─────────┘
 │(Port 3009) │ │(Port 3010) │ └────────────┘                 │
 └────────────┘ └────────────┘                                │
                                                              │
               ┌──────────────────────────────┐            ┌──▼────┐
               │                              │            │Advanced│
        ┌──────▼─────┐ ┌──────────────┐ ┌──────▼─────┐      │AI      │
        │PostgreSQL  │ │    Redis     │ │   Neo4j     │      │Service │
        │(Port 5432) │ │  (Port 6379) │ │ (Port 7687) │      └───────┘
        └────────────┘ └────────────┘ └─────────────┘
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

## 🎯 Roadmap - COMPLETE! ✅

- [x] **Core microservices architecture** - 9 services fully implemented
- [x] **AI integration** - OpenAI, Anthropic, Google AI, Cohere
- [x] **Compliance automation** - HMRC integration, regulatory filings
- [x] **Financial planning tools** - Projections, burn rate analysis
- [x] **Investor networking** - Nexus platform with AI matching
- [x] **Real-time communication** - WebSocket, SMS, email, push
- [x] **Queue-based job processing** - BullMQ with background workers
- [x] **Docker containerization** - Multi-stage optimized builds
- [x] **API Gateway** - Load balancing, circuit breakers, caching
- [x] **Kubernetes deployment** - Production manifests and helm charts
- [x] **Multi-region deployment** - AWS us-east-1 + eu-west-1 with failover
- [x] **Advanced AI features** - Predictive analytics, ML models, NLP
- [x] **Mobile app** - React Native iOS/Android with offline support
- [x] **Advanced analytics** - Business intelligence with real-time dashboards
- [x] **Integration marketplace** - Third-party service integrations
- [x] **API monetization** - Developer platform with usage-based billing
- [x] **White-label solutions** - Custom branding and multi-tenant platform
- [x] **Enterprise security** - SOC2, GDPR, advanced threat protection
- [x] **Performance optimization** - Global CDN, advanced caching, auto-scaling
- [x] **Monitoring & observability** - Prometheus, Grafana, Sentry, alerting
- [x] **CI/CD pipeline** - GitHub Actions with automated testing and deployment
- [x] **Disaster recovery** - Automated backups, cross-region replication
- [x] **Documentation** - Comprehensive guides, API docs, deployment manuals

## 🚀 Advanced Features

### 📱 Mobile Applications
- **React Native** iOS/Android apps
- **Offline-first** architecture
- **Biometric authentication**
- **Push notifications**
- **Native performance**

### 📊 Advanced Analytics
- **Predictive modeling** and forecasting
- **Real-time dashboards** with custom KPIs
- **Business intelligence** tools
- **Automated reporting** and insights
- **ML-powered analytics**

### 🔗 Integration Marketplace
- **Third-party integrations** (Slack, Zapier, Salesforce, HubSpot)
- **Webhook management** and event streaming
- **OAuth authentication** flows
- **API marketplace** for developers
- **Usage analytics** and monitoring

### 💰 API Monetization
- **Usage-based billing** with Stripe integration
- **Rate limiting** and quota management
- **Developer portal** with API documentation
- **Revenue analytics** and reporting
- **SDK generation** in multiple languages

### 🎨 White-label Platform
- **Custom branding** and theming
- **Multi-tenant architecture**
- **Custom domains** and SSL
- **Feature configuration** per client
- **Enterprise customization**

### 🧠 Advanced AI
- **Predictive analytics** for business metrics
- **Recommendation engines** for investor matching
- **Natural language processing** for document analysis
- **Computer vision** for automated processing
- **Machine learning models** for automation

---

**Genesis Engine** - Transforming startup journeys with AI-powered automation 🚀