# GENESIS ENGINE — COMPLETE TECHNICAL SPECIFICATION

**Version:** 1.0.0  
**Classification:** Product Requirements Document (PRD) / Technical Specification  
**Purpose:** Complete implementation guide — populate config, deploy, run.

---

# TABLE OF CONTENTS

1. [Configuration System](#1-configuration-system)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [Database Schemas](#4-database-schemas)
5. [Core Services](#5-core-services)
6. [Genesis Engine Core](#6-genesis-engine-core)
7. [The Nexus](#7-the-nexus)
8. [Pulse](#8-pulse)
9. [Knowledge Graph](#9-knowledge-graph)
10. [API Specifications](#10-api-specifications)
11. [Error Handling](#11-error-handling)
12. [Security](#12-security)
13. [Deployment](#13-deployment)
14. [Monitoring & Observability](#14-monitoring--observability)

---

# 1. CONFIGURATION SYSTEM

All secrets, API keys, and environment-specific values are stored in a single configuration file. Populate this file to make the system live.

## 1.1 Master Configuration File

**File:** `config/genesis.env`

```env
# ============================================================================
# GENESIS ENGINE - MASTER CONFIGURATION
# ============================================================================
# Populate all values below. System will not start with missing required fields.
# Required fields marked with [REQUIRED], optional with [OPTIONAL]
# ============================================================================

# ----------------------------------------------------------------------------
# ENVIRONMENT
# ----------------------------------------------------------------------------
NODE_ENV=production                                    # [REQUIRED] production | staging | development
APP_NAME=genesis-engine                                # [REQUIRED] Application identifier
APP_VERSION=1.0.0                                      # [REQUIRED] Semantic version
APP_URL=https://app.genesis-engine.com                 # [REQUIRED] Primary application URL
API_URL=https://api.genesis-engine.com                 # [REQUIRED] API base URL
APP_SECRET=                                            # [REQUIRED] 64-char hex string for encryption
JWT_SECRET=                                            # [REQUIRED] 64-char hex string for JWT signing
JWT_EXPIRY=86400                                       # [OPTIONAL] Token expiry in seconds (default: 24h)
CORS_ORIGINS=https://app.genesis-engine.com            # [REQUIRED] Comma-separated allowed origins

# ----------------------------------------------------------------------------
# DATABASE - PRIMARY (PostgreSQL)
# ----------------------------------------------------------------------------
POSTGRES_HOST=                                         # [REQUIRED] Database host
POSTGRES_PORT=5432                                     # [OPTIONAL] Database port
POSTGRES_DB=genesis_engine                             # [REQUIRED] Database name
POSTGRES_USER=                                         # [REQUIRED] Database user
POSTGRES_PASSWORD=                                     # [REQUIRED] Database password
POSTGRES_SSL=true                                      # [OPTIONAL] Enable SSL
POSTGRES_POOL_MIN=5                                    # [OPTIONAL] Minimum pool connections
POSTGRES_POOL_MAX=20                                   # [OPTIONAL] Maximum pool connections

# ----------------------------------------------------------------------------
# DATABASE - GRAPH (Neo4j)
# ----------------------------------------------------------------------------
NEO4J_URI=                                             # [REQUIRED] bolt://host:7687
NEO4J_USER=                                            # [REQUIRED] Neo4j username
NEO4J_PASSWORD=                                        # [REQUIRED] Neo4j password
NEO4J_DATABASE=genesis                                 # [OPTIONAL] Database name

# ----------------------------------------------------------------------------
# DATABASE - CACHE (Redis)
# ----------------------------------------------------------------------------
REDIS_URL=                                             # [REQUIRED] redis://user:pass@host:6379
REDIS_TLS=true                                         # [OPTIONAL] Enable TLS
REDIS_PREFIX=genesis:                                  # [OPTIONAL] Key prefix

# ----------------------------------------------------------------------------
# DATABASE - SEARCH (Elasticsearch)
# ----------------------------------------------------------------------------
ELASTICSEARCH_URL=                                     # [REQUIRED] https://host:9200
ELASTICSEARCH_USER=                                    # [REQUIRED] Username
ELASTICSEARCH_PASSWORD=                                # [REQUIRED] Password
ELASTICSEARCH_INDEX_PREFIX=genesis_                    # [OPTIONAL] Index prefix

# ----------------------------------------------------------------------------
# DATABASE - VECTOR (Pinecone)
# ----------------------------------------------------------------------------
PINECONE_API_KEY=                                      # [REQUIRED] Pinecone API key
PINECONE_ENVIRONMENT=                                  # [REQUIRED] e.g., us-east-1-aws
PINECONE_INDEX_NAME=genesis-knowledge                  # [REQUIRED] Index name

# ----------------------------------------------------------------------------
# OBJECT STORAGE (S3-Compatible)
# ----------------------------------------------------------------------------
S3_ENDPOINT=                                           # [REQUIRED] S3 endpoint URL
S3_REGION=                                             # [REQUIRED] e.g., eu-west-2
S3_ACCESS_KEY=                                         # [REQUIRED] Access key ID
S3_SECRET_KEY=                                         # [REQUIRED] Secret access key
S3_BUCKET_DOCUMENTS=genesis-documents                  # [REQUIRED] Documents bucket
S3_BUCKET_MEDIA=genesis-media                          # [REQUIRED] Media bucket
S3_BUCKET_BACKUPS=genesis-backups                      # [REQUIRED] Backups bucket

# ----------------------------------------------------------------------------
# AI / LLM PROVIDERS
# ----------------------------------------------------------------------------
# OpenAI
OPENAI_API_KEY=                                        # [REQUIRED] OpenAI API key
OPENAI_ORG_ID=                                         # [OPTIONAL] Organization ID
OPENAI_MODEL_DEFAULT=gpt-4-turbo-preview               # [OPTIONAL] Default model
OPENAI_MODEL_FAST=gpt-3.5-turbo                        # [OPTIONAL] Fast/cheap model
OPENAI_MODEL_EMBEDDING=text-embedding-3-large          # [OPTIONAL] Embedding model

# Anthropic
ANTHROPIC_API_KEY=                                     # [REQUIRED] Anthropic API key
ANTHROPIC_MODEL_DEFAULT=claude-3-opus-20240229         # [OPTIONAL] Default model
ANTHROPIC_MODEL_FAST=claude-3-haiku-20240307           # [OPTIONAL] Fast model

# Google AI
GOOGLE_AI_API_KEY=                                     # [OPTIONAL] Google AI API key
GOOGLE_AI_MODEL=gemini-pro                             # [OPTIONAL] Default model

# Cohere (for reranking)
COHERE_API_KEY=                                        # [OPTIONAL] Cohere API key

# ----------------------------------------------------------------------------
# UK GOVERNMENT APIs
# ----------------------------------------------------------------------------
# Companies House
COMPANIES_HOUSE_API_KEY=                               # [REQUIRED] API key from developer.company-information.service.gov.uk
COMPANIES_HOUSE_STREAM_KEY=                            # [OPTIONAL] Streaming API key
COMPANIES_HOUSE_FILING_PRESENTER_ID=                   # [REQUIRED] Presenter ID for filing
COMPANIES_HOUSE_FILING_PRESENTER_AUTH=                 # [REQUIRED] Presenter authentication code

# HMRC
HMRC_CLIENT_ID=                                        # [REQUIRED] OAuth client ID
HMRC_CLIENT_SECRET=                                    # [REQUIRED] OAuth client secret
HMRC_ENVIRONMENT=production                            # [REQUIRED] production | sandbox
HMRC_CALLBACK_URL=                                     # [REQUIRED] OAuth callback URL

# ICO (Data Protection)
ICO_API_KEY=                                           # [OPTIONAL] If available

# ----------------------------------------------------------------------------
# PAYMENT PROCESSING
# ----------------------------------------------------------------------------
# Stripe
STRIPE_SECRET_KEY=                                     # [REQUIRED] Stripe secret key
STRIPE_PUBLISHABLE_KEY=                                # [REQUIRED] Stripe publishable key
STRIPE_WEBHOOK_SECRET=                                 # [REQUIRED] Webhook signing secret
STRIPE_CONNECT_CLIENT_ID=                              # [REQUIRED] Connect platform client ID

# GoCardless (Direct Debit)
GOCARDLESS_ACCESS_TOKEN=                               # [OPTIONAL] GoCardless access token
GOCARDLESS_ENVIRONMENT=live                            # [OPTIONAL] live | sandbox
GOCARDLESS_WEBHOOK_SECRET=                             # [OPTIONAL] Webhook secret

# ----------------------------------------------------------------------------
# BANKING APIs
# ----------------------------------------------------------------------------
# Open Banking (TrueLayer / Plaid)
TRUELAYER_CLIENT_ID=                                   # [OPTIONAL] TrueLayer client ID
TRUELAYER_CLIENT_SECRET=                               # [OPTIONAL] TrueLayer client secret
TRUELAYER_ENVIRONMENT=live                             # [OPTIONAL] live | sandbox

PLAID_CLIENT_ID=                                       # [OPTIONAL] Plaid client ID
PLAID_SECRET=                                          # [OPTIONAL] Plaid secret
PLAID_ENVIRONMENT=production                           # [OPTIONAL] production | sandbox

# ----------------------------------------------------------------------------
# COMMUNICATION
# ----------------------------------------------------------------------------
# Email (SendGrid)
SENDGRID_API_KEY=                                      # [REQUIRED] SendGrid API key
SENDGRID_FROM_EMAIL=hello@genesis-engine.com           # [REQUIRED] From email
SENDGRID_FROM_NAME=Genesis Engine                      # [REQUIRED] From name

# SMS/WhatsApp (Twilio)
TWILIO_ACCOUNT_SID=                                    # [REQUIRED] Account SID
TWILIO_AUTH_TOKEN=                                     # [REQUIRED] Auth token
TWILIO_PHONE_NUMBER=                                   # [REQUIRED] Twilio phone number
TWILIO_WHATSAPP_NUMBER=                                # [REQUIRED] WhatsApp sender number
TWILIO_MESSAGING_SERVICE_SID=                          # [OPTIONAL] Messaging service SID

# Telegram
TELEGRAM_BOT_TOKEN=                                    # [OPTIONAL] Bot token from @BotFather

# Push Notifications (Firebase)
FIREBASE_PROJECT_ID=                                   # [OPTIONAL] Firebase project ID
FIREBASE_PRIVATE_KEY=                                  # [OPTIONAL] Service account private key
FIREBASE_CLIENT_EMAIL=                                 # [OPTIONAL] Service account email

# ----------------------------------------------------------------------------
# CALENDAR / SCHEDULING
# ----------------------------------------------------------------------------
GOOGLE_CALENDAR_CLIENT_ID=                             # [OPTIONAL] OAuth client ID
GOOGLE_CALENDAR_CLIENT_SECRET=                         # [OPTIONAL] OAuth client secret
CALENDLY_API_KEY=                                      # [OPTIONAL] Calendly API key

# ----------------------------------------------------------------------------
# DOCUMENT GENERATION
# ----------------------------------------------------------------------------
# DocuSign
DOCUSIGN_INTEGRATION_KEY=                              # [OPTIONAL] Integration key
DOCUSIGN_USER_ID=                                      # [OPTIONAL] API user ID
DOCUSIGN_ACCOUNT_ID=                                   # [OPTIONAL] Account ID
DOCUSIGN_RSA_PRIVATE_KEY=                              # [OPTIONAL] RSA private key (base64)
DOCUSIGN_ENVIRONMENT=production                        # [OPTIONAL] production | demo

# PandaDoc
PANDADOC_API_KEY=                                      # [OPTIONAL] API key

# ----------------------------------------------------------------------------
# IDENTITY VERIFICATION
# ----------------------------------------------------------------------------
# Onfido
ONFIDO_API_TOKEN=                                      # [OPTIONAL] API token
ONFIDO_WEBHOOK_SECRET=                                 # [OPTIONAL] Webhook secret

# Jumio
JUMIO_API_TOKEN=                                       # [OPTIONAL] API token
JUMIO_API_SECRET=                                      # [OPTIONAL] API secret

# ----------------------------------------------------------------------------
# ACCOUNTING INTEGRATIONS
# ----------------------------------------------------------------------------
# Xero
XERO_CLIENT_ID=                                        # [OPTIONAL] OAuth client ID
XERO_CLIENT_SECRET=                                    # [OPTIONAL] OAuth client secret

# QuickBooks
QUICKBOOKS_CLIENT_ID=                                  # [OPTIONAL] OAuth client ID
QUICKBOOKS_CLIENT_SECRET=                              # [OPTIONAL] OAuth client secret

# FreeAgent
FREEAGENT_CLIENT_ID=                                   # [OPTIONAL] OAuth client ID
FREEAGENT_CLIENT_SECRET=                               # [OPTIONAL] OAuth client secret

# ----------------------------------------------------------------------------
# EXTERNAL DATA SOURCES
# ----------------------------------------------------------------------------
# Crunchbase
CRUNCHBASE_API_KEY=                                    # [OPTIONAL] API key

# PitchBook
PITCHBOOK_API_KEY=                                     # [OPTIONAL] API key

# LinkedIn
LINKEDIN_CLIENT_ID=                                    # [OPTIONAL] OAuth client ID
LINKEDIN_CLIENT_SECRET=                                # [OPTIONAL] OAuth client secret

# ClearBit
CLEARBIT_API_KEY=                                      # [OPTIONAL] API key

# ----------------------------------------------------------------------------
# FUNDING PLATFORM INTEGRATIONS
# ----------------------------------------------------------------------------
# Seedrs
SEEDRS_API_KEY=                                        # [OPTIONAL] Partner API key
SEEDRS_WEBHOOK_SECRET=                                 # [OPTIONAL] Webhook secret

# Crowdcube
CROWDCUBE_API_KEY=                                     # [OPTIONAL] Partner API key

# Clearco
CLEARCO_API_KEY=                                       # [OPTIONAL] Partner API key
CLEARCO_WEBHOOK_SECRET=                                # [OPTIONAL] Webhook secret

# Wayflyer
WAYFLYER_API_KEY=                                      # [OPTIONAL] Partner API key

# ----------------------------------------------------------------------------
# MONITORING & OBSERVABILITY
# ----------------------------------------------------------------------------
# Error Tracking (Sentry)
SENTRY_DSN=                                            # [REQUIRED] Sentry DSN
SENTRY_ENVIRONMENT=production                          # [REQUIRED] Environment name

# APM (Datadog)
DATADOG_API_KEY=                                       # [OPTIONAL] API key
DATADOG_APP_KEY=                                       # [OPTIONAL] Application key

# Logging (LogTail / Papertrail)
LOGTAIL_SOURCE_TOKEN=                                  # [OPTIONAL] LogTail token

# Uptime (Better Uptime)
BETTERUPTIME_API_KEY=                                  # [OPTIONAL] API key

# ----------------------------------------------------------------------------
# FEATURE FLAGS
# ----------------------------------------------------------------------------
LAUNCHDARKLY_SDK_KEY=                                  # [OPTIONAL] LaunchDarkly SDK key
# Or use built-in flags:
FEATURE_NEXUS_ENABLED=true                             # [OPTIONAL] Enable The Nexus
FEATURE_PULSE_ENABLED=true                             # [OPTIONAL] Enable Pulse
FEATURE_COMMUNITY_ROUNDS_ENABLED=false                 # [OPTIONAL] Enable community rounds (requires FCA)
FEATURE_RBF_ENABLED=true                               # [OPTIONAL] Enable RBF matching

# ----------------------------------------------------------------------------
# RATE LIMITING
# ----------------------------------------------------------------------------
RATE_LIMIT_WINDOW_MS=900000                            # [OPTIONAL] 15 minutes
RATE_LIMIT_MAX_REQUESTS=100                            # [OPTIONAL] Max requests per window
RATE_LIMIT_TRUST_PROXY=true                            # [OPTIONAL] Trust X-Forwarded-For

# ----------------------------------------------------------------------------
# QUEUE SYSTEM (BullMQ)
# ----------------------------------------------------------------------------
QUEUE_REDIS_URL=                                       # [REQUIRED] Redis URL for queues (can be same as REDIS_URL)
QUEUE_DEFAULT_ATTEMPTS=3                               # [OPTIONAL] Default retry attempts
QUEUE_DEFAULT_BACKOFF=exponential                      # [OPTIONAL] Backoff strategy

# ----------------------------------------------------------------------------
# WORKER CONFIGURATION
# ----------------------------------------------------------------------------
WORKER_CONCURRENCY=5                                   # [OPTIONAL] Concurrent job processing
WORKER_LIMITER_MAX=10                                  # [OPTIONAL] Max jobs per interval
WORKER_LIMITER_DURATION=1000                           # [OPTIONAL] Interval in ms

# ----------------------------------------------------------------------------
# INTERNAL SERVICES
# ----------------------------------------------------------------------------
SERVICE_KNOWLEDGE_GRAPH_URL=http://knowledge-graph:3001    # [REQUIRED] Internal service URL
SERVICE_FINANCIAL_ENGINE_URL=http://financial:3002         # [REQUIRED] Internal service URL
SERVICE_DOCUMENT_ENGINE_URL=http://documents:3003          # [REQUIRED] Internal service URL
SERVICE_NEXUS_URL=http://nexus:3004                        # [REQUIRED] Internal service URL
SERVICE_PULSE_URL=http://pulse:3005                        # [REQUIRED] Internal service URL
SERVICE_COMPLIANCE_URL=http://compliance:3006              # [REQUIRED] Internal service URL

# ----------------------------------------------------------------------------
# ENCRYPTION
# ----------------------------------------------------------------------------
ENCRYPTION_KEY=                                        # [REQUIRED] 32-byte hex key for AES-256
ENCRYPTION_IV_LENGTH=16                                # [OPTIONAL] IV length
FIELD_ENCRYPTION_KEY=                                  # [REQUIRED] Separate key for field-level encryption

# ----------------------------------------------------------------------------
# SESSION
# ----------------------------------------------------------------------------
SESSION_SECRET=                                        # [REQUIRED] Session signing secret
SESSION_NAME=genesis_session                           # [OPTIONAL] Session cookie name
SESSION_MAX_AGE=604800000                              # [OPTIONAL] 7 days in ms

# ----------------------------------------------------------------------------
# GEOGRAPHIC / LOCALISATION
# ----------------------------------------------------------------------------
DEFAULT_TIMEZONE=Europe/London                         # [OPTIONAL] Default timezone
DEFAULT_LOCALE=en-GB                                   # [OPTIONAL] Default locale
DEFAULT_CURRENCY=GBP                                   # [OPTIONAL] Default currency
SUPPORTED_COUNTRIES=GB,IE                              # [OPTIONAL] Supported countries
```

## 1.2 Configuration Validation Schema

**File:** `config/schema.ts`

```typescript
import { z } from 'zod';

export const ConfigSchema = z.object({
  // Environment
  NODE_ENV: z.enum(['production', 'staging', 'development']),
  APP_NAME: z.string().min(1),
  APP_VERSION: z.string().regex(/^\d+\.\d+\.\d+$/),
  APP_URL: z.string().url(),
  API_URL: z.string().url(),
  APP_SECRET: z.string().length(64),
  JWT_SECRET: z.string().length(64),
  JWT_EXPIRY: z.coerce.number().positive().default(86400),
  CORS_ORIGINS: z.string().transform(s => s.split(',')),

  // PostgreSQL
  POSTGRES_HOST: z.string().min(1),
  POSTGRES_PORT: z.coerce.number().default(5432),
  POSTGRES_DB: z.string().min(1),
  POSTGRES_USER: z.string().min(1),
  POSTGRES_PASSWORD: z.string().min(1),
  POSTGRES_SSL: z.coerce.boolean().default(true),
  POSTGRES_POOL_MIN: z.coerce.number().default(5),
  POSTGRES_POOL_MAX: z.coerce.number().default(20),

  // Neo4j
  NEO4J_URI: z.string().startsWith('bolt://').or(z.string().startsWith('neo4j://')),
  NEO4J_USER: z.string().min(1),
  NEO4J_PASSWORD: z.string().min(1),
  NEO4J_DATABASE: z.string().default('genesis'),

  // Redis
  REDIS_URL: z.string().startsWith('redis://').or(z.string().startsWith('rediss://')),
  REDIS_TLS: z.coerce.boolean().default(true),
  REDIS_PREFIX: z.string().default('genesis:'),

  // Elasticsearch
  ELASTICSEARCH_URL: z.string().url(),
  ELASTICSEARCH_USER: z.string().min(1),
  ELASTICSEARCH_PASSWORD: z.string().min(1),
  ELASTICSEARCH_INDEX_PREFIX: z.string().default('genesis_'),

  // Pinecone
  PINECONE_API_KEY: z.string().min(1),
  PINECONE_ENVIRONMENT: z.string().min(1),
  PINECONE_INDEX_NAME: z.string().min(1),

  // S3
  S3_ENDPOINT: z.string().url(),
  S3_REGION: z.string().min(1),
  S3_ACCESS_KEY: z.string().min(1),
  S3_SECRET_KEY: z.string().min(1),
  S3_BUCKET_DOCUMENTS: z.string().min(1),
  S3_BUCKET_MEDIA: z.string().min(1),
  S3_BUCKET_BACKUPS: z.string().min(1),

  // AI Providers
  OPENAI_API_KEY: z.string().startsWith('sk-'),
  OPENAI_ORG_ID: z.string().optional(),
  OPENAI_MODEL_DEFAULT: z.string().default('gpt-4-turbo-preview'),
  OPENAI_MODEL_FAST: z.string().default('gpt-3.5-turbo'),
  OPENAI_MODEL_EMBEDDING: z.string().default('text-embedding-3-large'),
  
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-'),
  ANTHROPIC_MODEL_DEFAULT: z.string().default('claude-3-opus-20240229'),
  ANTHROPIC_MODEL_FAST: z.string().default('claude-3-haiku-20240307'),

  // Companies House
  COMPANIES_HOUSE_API_KEY: z.string().min(1),
  COMPANIES_HOUSE_STREAM_KEY: z.string().optional(),
  COMPANIES_HOUSE_FILING_PRESENTER_ID: z.string().min(1),
  COMPANIES_HOUSE_FILING_PRESENTER_AUTH: z.string().min(1),

  // HMRC
  HMRC_CLIENT_ID: z.string().min(1),
  HMRC_CLIENT_SECRET: z.string().min(1),
  HMRC_ENVIRONMENT: z.enum(['production', 'sandbox']),
  HMRC_CALLBACK_URL: z.string().url(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  STRIPE_CONNECT_CLIENT_ID: z.string().startsWith('ca_'),

  // SendGrid
  SENDGRID_API_KEY: z.string().startsWith('SG.'),
  SENDGRID_FROM_EMAIL: z.string().email(),
  SENDGRID_FROM_NAME: z.string().min(1),

  // Twilio
  TWILIO_ACCOUNT_SID: z.string().startsWith('AC'),
  TWILIO_AUTH_TOKEN: z.string().min(1),
  TWILIO_PHONE_NUMBER: z.string().regex(/^\+\d{10,15}$/),
  TWILIO_WHATSAPP_NUMBER: z.string().regex(/^\+\d{10,15}$/),
  TWILIO_MESSAGING_SERVICE_SID: z.string().startsWith('MG').optional(),

  // Sentry
  SENTRY_DSN: z.string().url(),
  SENTRY_ENVIRONMENT: z.string().min(1),

  // Feature Flags
  FEATURE_NEXUS_ENABLED: z.coerce.boolean().default(true),
  FEATURE_PULSE_ENABLED: z.coerce.boolean().default(true),
  FEATURE_COMMUNITY_ROUNDS_ENABLED: z.coerce.boolean().default(false),
  FEATURE_RBF_ENABLED: z.coerce.boolean().default(true),

  // Encryption
  ENCRYPTION_KEY: z.string().length(64),
  FIELD_ENCRYPTION_KEY: z.string().length(64),
  
  // Session
  SESSION_SECRET: z.string().min(32),
});

export type Config = z.infer<typeof ConfigSchema>;

export function validateConfig(): Config {
  const result = ConfigSchema.safeParse(process.env);
  
  if (!result.success) {
    const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
    console.error('Configuration validation failed:');
    errors.forEach(e => console.error(`  - ${e}`));
    process.exit(1);
  }
  
  return result.data;
}
```

## 1.3 Configuration Loader

**File:** `config/loader.ts`

```typescript
import { config as dotenvConfig } from 'dotenv';
import { resolve } from 'path';
import { validateConfig, Config } from './schema';

let cachedConfig: Config | null = null;

export function loadConfig(): Config {
  if (cachedConfig) return cachedConfig;

  // Load environment-specific config
  const env = process.env.NODE_ENV || 'development';
  const configPath = resolve(process.cwd(), 'config', `genesis.${env}.env`);
  const defaultPath = resolve(process.cwd(), 'config', 'genesis.env');

  // Load default first, then environment-specific (overrides)
  dotenvConfig({ path: defaultPath });
  dotenvConfig({ path: configPath, override: true });

  // Validate and cache
  cachedConfig = validateConfig();
  
  // Mask sensitive values in logs
  logConfigLoaded(cachedConfig);
  
  return cachedConfig;
}

function logConfigLoaded(config: Config): void {
  const masked = { ...config };
  const sensitiveKeys = [
    'APP_SECRET', 'JWT_SECRET', 'POSTGRES_PASSWORD', 'NEO4J_PASSWORD',
    'OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'STRIPE_SECRET_KEY',
    'ENCRYPTION_KEY', 'FIELD_ENCRYPTION_KEY', 'SESSION_SECRET'
  ];
  
  sensitiveKeys.forEach(key => {
    if (masked[key as keyof Config]) {
      (masked as any)[key] = '***REDACTED***';
    }
  });
  
  console.log('Configuration loaded:', JSON.stringify(masked, null, 2));
}

export { Config };
```

---

# 2. TECHNOLOGY STACK

## 2.1 Runtime & Languages

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Runtime | Node.js | 20.x LTS | Primary runtime |
| Language | TypeScript | 5.3.x | Type safety |
| Package Manager | pnpm | 8.x | Fast, efficient |

## 2.2 Backend Framework

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| HTTP Framework | Fastify | 4.x | High-performance API |
| GraphQL | Mercurius | 13.x | GraphQL layer |
| WebSocket | @fastify/websocket | 8.x | Real-time |
| Validation | Zod | 3.x | Schema validation |
| ORM | Drizzle | 0.29.x | Type-safe SQL |
| Queue | BullMQ | 5.x | Job processing |

## 2.3 Frontend Framework

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | Next.js | 14.x | React framework |
| UI Library | React | 18.x | UI components |
| State | Zustand | 4.x | State management |
| Data Fetching | TanStack Query | 5.x | Server state |
| Forms | React Hook Form | 7.x | Form handling |
| UI Components | Radix UI | Latest | Accessible primitives |
| Styling | Tailwind CSS | 3.x | Utility CSS |
| Charts | Recharts | 2.x | Data visualisation |

## 2.4 Mobile (React Native)

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Framework | Expo | 50.x | React Native |
| Navigation | React Navigation | 6.x | Navigation |
| State | Zustand | 4.x | State management |

## 2.5 Databases

| Type | Technology | Version | Purpose |
|------|------------|---------|---------|
| Primary | PostgreSQL | 16.x | Relational data |
| Graph | Neo4j | 5.x | Knowledge graph |
| Cache | Redis | 7.x | Caching, queues |
| Search | Elasticsearch | 8.x | Full-text search |
| Vector | Pinecone | Latest | Embeddings |
| Time Series | TimescaleDB | 2.x | Metrics (extension) |

## 2.6 Infrastructure

| Component | Technology | Purpose |
|-----------|------------|---------|
| Container Runtime | Docker | Containerisation |
| Orchestration | Kubernetes | Container orchestration |
| Service Mesh | Istio | Traffic management |
| Ingress | NGINX | Load balancing |
| CI/CD | GitHub Actions | Automation |
| IaC | Terraform | Infrastructure as code |
| Secrets | HashiCorp Vault | Secrets management |

## 2.7 Cloud Services (Primary: AWS)

| Service | AWS | Alternative |
|---------|-----|-------------|
| Compute | EKS | GKE, AKS |
| Database | RDS, Aurora | Cloud SQL |
| Cache | ElastiCache | Memorystore |
| Storage | S3 | GCS, Azure Blob |
| CDN | CloudFront | Cloud CDN |
| DNS | Route53 | Cloud DNS |
| Monitoring | CloudWatch | Stackdriver |

---

# 3. SYSTEM ARCHITECTURE

## 3.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                         │
├─────────────────┬─────────────────┬─────────────────┬───────────────────────┤
│   Web App       │   Mobile App    │   Pulse (SMS/   │   Third-Party         │
│   (Next.js)     │   (Expo)        │   WhatsApp)     │   Integrations        │
└────────┬────────┴────────┬────────┴────────┬────────┴───────────┬───────────┘
         │                 │                 │                     │
         ▼                 ▼                 ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           API GATEWAY (Kong / NGINX)                         │
│  • Rate Limiting  • Authentication  • Request Routing  • SSL Termination    │
└─────────────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CORE API SERVICES                                    │
├─────────────────┬─────────────────┬─────────────────┬───────────────────────┤
│   Auth Service  │   User Service  │   Company       │   API Gateway         │
│   (Fastify)     │   (Fastify)     │   Service       │   Service             │
│   Port: 3010    │   Port: 3011    │   Port: 3012    │   Port: 3000          │
└────────┬────────┴────────┬────────┴────────┬────────┴───────────┬───────────┘
         │                 │                 │                     │
         ▼                 ▼                 ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DOMAIN SERVICES                                       │
├───────────────┬───────────────┬───────────────┬───────────────┬─────────────┤
│  Knowledge    │  Financial    │  Document     │  Compliance   │  Task       │
│  Graph        │  Engine       │  Engine       │  Engine       │  Engine     │
│  Port: 3001   │  Port: 3002   │  Port: 3003   │  Port: 3006   │  Port: 3007 │
├───────────────┼───────────────┼───────────────┼───────────────┼─────────────┤
│  The Nexus    │  Pulse        │  CRM          │  Calendar     │  Billing    │
│  (Network/    │  (Messaging)  │  Service      │  Service      │  Service    │
│  Funding)     │               │               │               │             │
│  Port: 3004   │  Port: 3005   │  Port: 3008   │  Port: 3009   │  Port: 3013 │
└───────────────┴───────────────┴───────────────┴───────────────┴─────────────┘
         │                 │                 │                     │
         ▼                 ▼                 ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BACKGROUND WORKERS                                   │
├───────────────┬───────────────┬───────────────┬───────────────┬─────────────┤
│  AI Worker    │  Document     │  Email        │  Sync         │  Analytics  │
│  (LLM calls)  │  Worker       │  Worker       │  Worker       │  Worker     │
└───────────────┴───────────────┴───────────────┴───────────────┴─────────────┘
         │                 │                 │                     │
         ▼                 ▼                 ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DATA LAYER                                          │
├───────────────┬───────────────┬───────────────┬───────────────┬─────────────┤
│  PostgreSQL   │  Neo4j        │  Redis        │  Elasticsearch│  Pinecone   │
│  (Primary)    │  (Graph)      │  (Cache/Queue)│  (Search)     │  (Vectors)  │
└───────────────┴───────────────┴───────────────┴───────────────┴─────────────┘
         │                 │                 │                     │
         ▼                 ▼                 ▼                     ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       EXTERNAL INTEGRATIONS                                  │
├───────────────┬───────────────┬───────────────┬───────────────┬─────────────┤
│  Companies    │  HMRC         │  Stripe       │  Twilio       │  AI         │
│  House API    │  API          │  (Payments)   │  (Comms)      │  Providers  │
├───────────────┼───────────────┼───────────────┼───────────────┼─────────────┤
│  Banking      │  DocuSign     │  Calendar     │  Accounting   │  Funding    │
│  (TrueLayer)  │  (E-Sign)     │  (Google)     │  (Xero etc)   │  Platforms  │
└───────────────┴───────────────┴───────────────┴───────────────┴─────────────┘
```

## 3.2 Service Communication

### 3.2.1 Synchronous (REST/GraphQL)

```typescript
// Internal service client
import { createServiceClient } from '@genesis/service-client';

const knowledgeGraph = createServiceClient({
  name: 'knowledge-graph',
  baseUrl: process.env.SERVICE_KNOWLEDGE_GRAPH_URL,
  timeout: 30000,
  retries: 3,
  circuitBreaker: {
    threshold: 5,
    timeout: 30000,
  },
});

// Usage
const entity = await knowledgeGraph.get('/entities/:id', { params: { id } });
```

### 3.2.2 Asynchronous (Message Queue)

```typescript
// Queue definitions
export const queues = {
  // High priority - user-facing
  'ai:completion': { priority: 1, attempts: 3, backoff: 'exponential' },
  'document:generate': { priority: 2, attempts: 3, backoff: 'exponential' },
  'email:send': { priority: 2, attempts: 5, backoff: 'exponential' },
  'sms:send': { priority: 1, attempts: 3, backoff: 'fixed' },
  
  // Medium priority
  'sync:companies-house': { priority: 5, attempts: 3 },
  'sync:banking': { priority: 5, attempts: 3 },
  'compliance:check': { priority: 5, attempts: 3 },
  
  // Low priority - background
  'analytics:process': { priority: 10, attempts: 2 },
  'embedding:generate': { priority: 10, attempts: 3 },
  'backup:create': { priority: 10, attempts: 2 },
} as const;
```

### 3.2.3 Event Bus

```typescript
// Event definitions
export const events = {
  // Company events
  'company.created': z.object({
    companyId: z.string().uuid(),
    userId: z.string().uuid(),
    companyNumber: z.string().optional(),
    timestamp: z.string().datetime(),
  }),
  'company.incorporated': z.object({
    companyId: z.string().uuid(),
    companyNumber: z.string(),
    incorporationDate: z.string().datetime(),
  }),
  
  // User events
  'user.registered': z.object({
    userId: z.string().uuid(),
    email: z.string().email(),
  }),
  
  // Knowledge graph events
  'entity.created': z.object({
    entityId: z.string().uuid(),
    entityType: z.string(),
    companyId: z.string().uuid(),
  }),
  
  // Financial events
  'transaction.recorded': z.object({
    transactionId: z.string().uuid(),
    companyId: z.string().uuid(),
    amount: z.number(),
    currency: z.string(),
  }),
  
  // Nexus events
  'introduction.requested': z.object({
    requestId: z.string().uuid(),
    fromUserId: z.string().uuid(),
    toUserId: z.string().uuid(),
  }),
  'funding.application.submitted': z.object({
    applicationId: z.string().uuid(),
    companyId: z.string().uuid(),
    fundingType: z.enum(['seis', 'eis', 'grant', 'rbf', 'community']),
    amount: z.number(),
  }),
  
  // Pulse events
  'message.received': z.object({
    messageId: z.string().uuid(),
    userId: z.string().uuid(),
    channel: z.enum(['sms', 'whatsapp', 'telegram', 'email']),
    content: z.string(),
  }),
  'message.sent': z.object({
    messageId: z.string().uuid(),
    userId: z.string().uuid(),
    channel: z.enum(['sms', 'whatsapp', 'telegram', 'email']),
  }),
} as const;
```

## 3.3 Service Definitions

| Service | Port | Responsibility | Dependencies |
|---------|------|----------------|--------------|
| api-gateway | 3000 | Request routing, auth | All services |
| auth | 3010 | Authentication, sessions | PostgreSQL, Redis |
| user | 3011 | User management | PostgreSQL |
| company | 3012 | Company management | PostgreSQL, Companies House |
| knowledge-graph | 3001 | Knowledge graph operations | Neo4j, Pinecone |
| financial | 3002 | Financial modelling | PostgreSQL, Banking APIs |
| documents | 3003 | Document generation | S3, DocuSign |
| nexus | 3004 | Networking, funding | Neo4j, PostgreSQL |
| pulse | 3005 | Messaging interface | Twilio, Redis |
| compliance | 3006 | Compliance tracking | PostgreSQL, HMRC |
| tasks | 3007 | Task management | PostgreSQL |
| crm | 3008 | Contact management | PostgreSQL |
| calendar | 3009 | Calendar sync | Google Calendar |
| billing | 3013 | Subscription billing | Stripe |

---

# 4. DATABASE SCHEMAS

## 4.1 PostgreSQL Schema

### 4.1.1 Core Tables

```sql
-- ============================================================================
-- GENESIS ENGINE - PostgreSQL Schema
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- Fuzzy text search
CREATE EXTENSION IF NOT EXISTS "timescaledb";  -- Time series (optional)

-- ============================================================================
-- USERS & AUTHENTICATION
-- ============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    email_verified BOOLEAN DEFAULT FALSE,
    phone VARCHAR(20),
    phone_verified BOOLEAN DEFAULT FALSE,
    password_hash VARCHAR(255),  -- NULL for OAuth-only users
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    timezone VARCHAR(50) DEFAULT 'Europe/London',
    locale VARCHAR(10) DEFAULT 'en-GB',
    
    -- Onboarding
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_step VARCHAR(50),
    
    -- Pulse preferences
    pulse_enabled BOOLEAN DEFAULT TRUE,
    pulse_preferred_channel VARCHAR(20) DEFAULT 'whatsapp',
    pulse_active_hours_start TIME DEFAULT '08:00',
    pulse_active_hours_end TIME DEFAULT '22:00',
    pulse_digest_time TIME DEFAULT '07:00',
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted')),
    last_active_at TIMESTAMPTZ,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_status ON users(status) WHERE deleted_at IS NULL;

-- User authentication methods
CREATE TABLE user_auth_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,  -- 'email', 'google', 'apple', 'linkedin'
    provider_user_id VARCHAR(255),
    access_token_encrypted TEXT,
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(provider, provider_user_id)
);

CREATE INDEX idx_user_auth_methods_user ON user_auth_methods(user_id);

-- Sessions
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(64) NOT NULL UNIQUE,
    device_info JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    last_used_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token_hash);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- ============================================================================
-- COMPANIES
-- ============================================================================

CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Basic Info
    name VARCHAR(255) NOT NULL,
    trading_name VARCHAR(255),
    company_number VARCHAR(20) UNIQUE,  -- Companies House number
    
    -- Type & Structure
    company_type VARCHAR(50) DEFAULT 'ltd' CHECK (company_type IN (
        'ltd', 'plc', 'llp', 'partnership', 'sole_trader', 'cic', 'charity'
    )),
    company_status VARCHAR(30) DEFAULT 'pre_incorporation' CHECK (company_status IN (
        'pre_incorporation', 'active', 'dormant', 'dissolved', 'liquidation'
    )),
    
    -- Dates
    incorporation_date DATE,
    accounting_reference_date DATE,  -- Year end day/month
    first_accounts_due DATE,
    next_accounts_due DATE,
    next_confirmation_statement_due DATE,
    
    -- Registered Office
    registered_address_line1 VARCHAR(255),
    registered_address_line2 VARCHAR(255),
    registered_address_city VARCHAR(100),
    registered_address_county VARCHAR(100),
    registered_address_postcode VARCHAR(20),
    registered_address_country VARCHAR(2) DEFAULT 'GB',
    
    -- Business Address (if different)
    business_address_line1 VARCHAR(255),
    business_address_line2 VARCHAR(255),
    business_address_city VARCHAR(100),
    business_address_county VARCHAR(100),
    business_address_postcode VARCHAR(20),
    business_address_country VARCHAR(2) DEFAULT 'GB',
    
    -- Classification
    sic_codes VARCHAR(5)[] DEFAULT '{}',
    nature_of_business TEXT,
    industry VARCHAR(100),
    sector VARCHAR(100),
    
    -- Tax & Compliance
    corporation_tax_reference VARCHAR(20),
    vat_number VARCHAR(20),
    vat_registered BOOLEAN DEFAULT FALSE,
    paye_reference VARCHAR(20),
    paye_registered BOOLEAN DEFAULT FALSE,
    
    -- SEIS/EIS
    seis_eligible BOOLEAN,
    seis_advance_assurance_status VARCHAR(30),
    seis_advance_assurance_date DATE,
    seis_allocation_remaining DECIMAL(12, 2) DEFAULT 150000,
    eis_eligible BOOLEAN,
    eis_advance_assurance_status VARCHAR(30),
    eis_advance_assurance_date DATE,
    
    -- Financials (snapshot)
    current_cash_balance DECIMAL(15, 2),
    monthly_burn_rate DECIMAL(15, 2),
    runway_months DECIMAL(5, 1),
    total_funding_raised DECIMAL(15, 2) DEFAULT 0,
    last_valuation DECIMAL(15, 2),
    last_valuation_date DATE,
    
    -- Settings
    default_currency VARCHAR(3) DEFAULT 'GBP',
    financial_year_end_month INTEGER DEFAULT 3 CHECK (financial_year_end_month BETWEEN 1 AND 12),
    
    -- Knowledge Graph
    knowledge_graph_id VARCHAR(100),  -- Neo4j node ID
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_companies_number ON companies(company_number) WHERE company_number IS NOT NULL;
CREATE INDEX idx_companies_status ON companies(company_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_companies_name_trgm ON companies USING gin(name gin_trgm_ops);

-- Company-User relationship (roles)
CREATE TABLE company_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL CHECK (role IN (
        'owner', 'admin', 'member', 'viewer', 'advisor', 'investor'
    )),
    title VARCHAR(100),  -- e.g., "CEO", "CTO"
    is_founder BOOLEAN DEFAULT FALSE,
    is_director BOOLEAN DEFAULT FALSE,
    is_shareholder BOOLEAN DEFAULT FALSE,
    shareholding_percentage DECIMAL(5, 2),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    invited_by UUID REFERENCES users(id),
    invite_accepted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, user_id)
);

CREATE INDEX idx_company_members_company ON company_members(company_id);
CREATE INDEX idx_company_members_user ON company_members(user_id);

-- ============================================================================
-- OFFICERS & SHAREHOLDERS
-- ============================================================================

CREATE TABLE officers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),  -- NULL if external person
    
    -- Officer Type
    officer_type VARCHAR(30) NOT NULL CHECK (officer_type IN (
        'director', 'secretary', 'member', 'llp_member', 'psc'
    )),
    officer_role VARCHAR(50),  -- e.g., "Managing Director"
    
    -- Personal Details
    title VARCHAR(20),
    first_name VARCHAR(100) NOT NULL,
    middle_names VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    former_names JSONB DEFAULT '[]',
    date_of_birth DATE,
    nationality VARCHAR(100),
    occupation VARCHAR(100),
    
    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    address_city VARCHAR(100),
    address_county VARCHAR(100),
    address_postcode VARCHAR(20),
    address_country VARCHAR(2),
    
    -- Service Address (if different)
    service_address_line1 VARCHAR(255),
    service_address_line2 VARCHAR(255),
    service_address_city VARCHAR(100),
    service_address_postcode VARCHAR(20),
    service_address_country VARCHAR(2),
    
    -- Appointment
    appointed_on DATE,
    resigned_on DATE,
    
    -- Companies House
    companies_house_id VARCHAR(50),
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resigned', 'removed')),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_officers_company ON officers(company_id);
CREATE INDEX idx_officers_user ON officers(user_id) WHERE user_id IS NOT NULL;

-- Shareholders
CREATE TABLE shareholders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),  -- NULL if external
    
    -- Entity Type
    shareholder_type VARCHAR(30) NOT NULL CHECK (shareholder_type IN (
        'individual', 'company', 'trust', 'nominee'
    )),
    
    -- For individuals
    title VARCHAR(20),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    date_of_birth DATE,
    
    -- For companies
    company_name VARCHAR(255),
    company_number VARCHAR(20),
    company_jurisdiction VARCHAR(100),
    
    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    address_city VARCHAR(100),
    address_postcode VARCHAR(20),
    address_country VARCHAR(2),
    
    -- Contact
    email VARCHAR(255),
    phone VARCHAR(20),
    
    -- Classification
    investor_type VARCHAR(50),  -- 'founder', 'angel', 'vc', 'employee', 'other'
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shareholders_company ON shareholders(company_id);
CREATE INDEX idx_shareholders_user ON shareholders(user_id) WHERE user_id IS NOT NULL;

-- Share Classes
CREATE TABLE share_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    class_name VARCHAR(50) NOT NULL,  -- 'Ordinary', 'Preference A', etc.
    class_code VARCHAR(10) NOT NULL,  -- 'ORD', 'PREF-A', etc.
    
    -- Rights
    nominal_value DECIMAL(10, 4) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GBP',
    voting_rights BOOLEAN DEFAULT TRUE,
    votes_per_share DECIMAL(10, 4) DEFAULT 1,
    dividend_rights BOOLEAN DEFAULT TRUE,
    dividend_priority INTEGER,  -- Lower = higher priority
    liquidation_preference DECIMAL(10, 4),  -- Multiplier
    participating BOOLEAN DEFAULT FALSE,
    anti_dilution VARCHAR(30),  -- 'none', 'full_ratchet', 'weighted_average'
    conversion_rights TEXT,
    redemption_rights TEXT,
    
    -- Totals
    total_authorised INTEGER,
    total_issued INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(company_id, class_code)
);

-- Shareholdings
CREATE TABLE shareholdings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    shareholder_id UUID NOT NULL REFERENCES shareholders(id) ON DELETE CASCADE,
    share_class_id UUID NOT NULL REFERENCES share_classes(id) ON DELETE CASCADE,
    
    -- Holding
    number_of_shares INTEGER NOT NULL,
    percentage DECIMAL(10, 6) NOT NULL,
    
    -- Acquisition
    acquisition_date DATE,
    acquisition_type VARCHAR(30),  -- 'subscription', 'transfer', 'bonus', 'conversion'
    acquisition_price_per_share DECIMAL(15, 4),
    total_consideration DECIMAL(15, 2),
    
    -- Tax
    seis_relief_claimed BOOLEAN DEFAULT FALSE,
    eis_relief_claimed BOOLEAN DEFAULT FALSE,
    relief_amount DECIMAL(15, 2),
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'transferred', 'redeemed')),
    
    -- Certificates
    certificate_numbers VARCHAR(50)[],
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shareholdings_company ON shareholdings(company_id);
CREATE INDEX idx_shareholdings_shareholder ON shareholdings(shareholder_id);

-- ============================================================================
-- DOCUMENTS
-- ============================================================================

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),  -- Who uploaded/created
    
    -- Document Info
    name VARCHAR(255) NOT NULL,
    description TEXT,
    document_type VARCHAR(50) NOT NULL,  -- See enum below
    category VARCHAR(50),
    
    -- File
    file_key VARCHAR(500) NOT NULL,  -- S3 key
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    
    -- Versioning
    version INTEGER DEFAULT 1,
    parent_id UUID REFERENCES documents(id),  -- Previous version
    is_latest BOOLEAN DEFAULT TRUE,
    
    -- Status
    status VARCHAR(30) DEFAULT 'draft' CHECK (status IN (
        'draft', 'pending_review', 'approved', 'signed', 'filed', 'archived'
    )),
    
    -- E-Signature
    requires_signature BOOLEAN DEFAULT FALSE,
    signature_provider VARCHAR(30),  -- 'docusign', 'pandadoc'
    signature_envelope_id VARCHAR(100),
    signature_status VARCHAR(30),
    signed_at TIMESTAMPTZ,
    
    -- Filing (Companies House)
    filed_with VARCHAR(50),  -- 'companies_house', 'hmrc'
    filing_reference VARCHAR(100),
    filed_at TIMESTAMPTZ,
    
    -- Compliance
    retention_until DATE,
    gdpr_category VARCHAR(50),
    
    -- AI
    ai_generated BOOLEAN DEFAULT FALSE,
    embedding_id VARCHAR(100),  -- Pinecone vector ID
    extracted_text TEXT,
    extracted_entities JSONB DEFAULT '[]',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    tags VARCHAR(50)[] DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_documents_company ON documents(company_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_tags ON documents USING gin(tags);

-- Document Types Enum Reference:
-- Legal: 'articles_of_association', 'shareholder_agreement', 'board_resolution',
--        'employment_contract', 'nda', 'terms_of_service', 'privacy_policy',
--        'ip_assignment', 'vesting_agreement', 'loan_agreement', 'convertible_note'
-- Financial: 'invoice', 'receipt', 'bank_statement', 'financial_model',
--            'management_accounts', 'budget', 'forecast', 'valuation'
-- Tax: 'vat_return', 'corporation_tax_return', 'p11d', 'annual_accounts'
-- Investor: 'pitch_deck', 'one_pager', 'data_room', 'term_sheet', 'sha'
-- Compliance: 'confirmation_statement', 'annual_return', 'psc_register',
--             'register_of_members', 'register_of_directors'
-- HR: 'offer_letter', 'contract', 'handbook', 'policy'

-- ============================================================================
-- TASKS
-- ============================================================================

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),  -- Assigned to
    created_by UUID REFERENCES users(id),
    
    -- Task Info
    title VARCHAR(255) NOT NULL,
    description TEXT,
    task_type VARCHAR(50),  -- 'manual', 'automated', 'approval', 'reminder'
    category VARCHAR(50),   -- 'legal', 'financial', 'compliance', 'admin'
    
    -- Priority & Status
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN (
        'pending', 'in_progress', 'waiting', 'completed', 'cancelled', 'failed'
    )),
    
    -- Dates
    due_date DATE,
    due_time TIME,
    reminder_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Automation
    is_automated BOOLEAN DEFAULT FALSE,
    automation_action VARCHAR(100),
    automation_params JSONB DEFAULT '{}',
    automation_result JSONB,
    
    -- Dependencies
    parent_task_id UUID REFERENCES tasks(id),
    blocked_by UUID[] DEFAULT '{}',  -- Task IDs
    
    -- Source
    source VARCHAR(50),  -- 'system', 'user', 'pulse', 'compliance'
    source_reference VARCHAR(100),
    
    -- Knowledge Graph
    related_entities UUID[] DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tasks_company ON tasks(company_id);
CREATE INDEX idx_tasks_user ON tasks(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due ON tasks(due_date) WHERE status NOT IN ('completed', 'cancelled');

-- ============================================================================
-- COMPLIANCE DEADLINES
-- ============================================================================

CREATE TABLE compliance_deadlines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Deadline Info
    deadline_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Dates
    due_date DATE NOT NULL,
    warning_date DATE,  -- When to start warning
    
    -- Recurrence
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_rule VARCHAR(100),  -- iCal RRULE format
    next_occurrence DATE,
    
    -- Status
    status VARCHAR(30) DEFAULT 'upcoming' CHECK (status IN (
        'upcoming', 'due_soon', 'overdue', 'completed', 'dismissed'
    )),
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES users(id),
    
    -- Automation
    auto_complete BOOLEAN DEFAULT FALSE,
    auto_complete_action VARCHAR(100),
    
    -- Linked Task
    task_id UUID REFERENCES tasks(id),
    
    -- Penalty Info
    penalty_description TEXT,
    penalty_amount DECIMAL(10, 2),
    
    -- Source
    source VARCHAR(50),  -- 'companies_house', 'hmrc', 'ico', 'manual'
    external_reference VARCHAR(100),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_compliance_company ON compliance_deadlines(company_id);
CREATE INDEX idx_compliance_due ON compliance_deadlines(due_date);
CREATE INDEX idx_compliance_status ON compliance_deadlines(status);

-- Deadline Types:
-- Companies House: 'confirmation_statement', 'annual_accounts', 'change_of_director',
--                  'change_of_address', 'psc_notification'
-- HMRC: 'corporation_tax_return', 'corporation_tax_payment', 'vat_return',
--       'paye_return', 'p11d', 'annual_accounts_ct'
-- ICO: 'data_protection_renewal'
-- Other: 'insurance_renewal', 'licence_renewal', 'custom'

-- ============================================================================
-- FINANCIAL TRANSACTIONS
-- ============================================================================

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Transaction Info
    transaction_date DATE NOT NULL,
    description TEXT NOT NULL,
    reference VARCHAR(100),
    
    -- Amount
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GBP',
    exchange_rate DECIMAL(10, 6),
    amount_gbp DECIMAL(15, 2),  -- Converted amount
    
    -- Type
    transaction_type VARCHAR(30) NOT NULL CHECK (transaction_type IN (
        'income', 'expense', 'transfer', 'investment', 'loan', 'refund'
    )),
    
    -- Category
    category VARCHAR(100),
    subcategory VARCHAR(100),
    
    -- Account
    bank_account_id UUID,
    counterparty_name VARCHAR(255),
    counterparty_account VARCHAR(50),
    
    -- Reconciliation
    is_reconciled BOOLEAN DEFAULT FALSE,
    reconciled_at TIMESTAMPTZ,
    bank_transaction_id VARCHAR(100),  -- From bank feed
    
    -- Tax
    vat_amount DECIMAL(15, 2),
    vat_rate DECIMAL(5, 2),
    is_vatable BOOLEAN DEFAULT TRUE,
    tax_category VARCHAR(50),
    
    -- Invoice/Receipt
    document_id UUID REFERENCES documents(id),
    invoice_number VARCHAR(50),
    
    -- Sync
    source VARCHAR(50),  -- 'manual', 'bank_feed', 'accounting_software', 'stripe'
    external_id VARCHAR(100),
    
    -- AI
    ai_categorised BOOLEAN DEFAULT FALSE,
    ai_confidence DECIMAL(3, 2),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_company ON transactions(company_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_category ON transactions(category);

-- ============================================================================
-- INVOICES
-- ============================================================================

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Invoice Details
    invoice_number VARCHAR(50) NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE NOT NULL,
    
    -- Type
    invoice_type VARCHAR(20) DEFAULT 'invoice' CHECK (invoice_type IN (
        'invoice', 'credit_note', 'quote', 'proforma'
    )),
    
    -- Customer
    customer_id UUID,
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255),
    customer_address TEXT,
    customer_vat_number VARCHAR(30),
    
    -- Amounts
    subtotal DECIMAL(15, 2) NOT NULL,
    discount_amount DECIMAL(15, 2) DEFAULT 0,
    discount_percentage DECIMAL(5, 2),
    vat_amount DECIMAL(15, 2) DEFAULT 0,
    total DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GBP',
    
    -- Payment
    status VARCHAR(30) DEFAULT 'draft' CHECK (status IN (
        'draft', 'sent', 'viewed', 'partial', 'paid', 'overdue', 'void', 'written_off'
    )),
    amount_paid DECIMAL(15, 2) DEFAULT 0,
    amount_due DECIMAL(15, 2),
    paid_at TIMESTAMPTZ,
    
    -- Notes
    notes TEXT,
    terms TEXT,
    
    -- Document
    document_id UUID REFERENCES documents(id),
    
    -- Stripe
    stripe_invoice_id VARCHAR(100),
    stripe_payment_intent_id VARCHAR(100),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoices_company ON invoices(company_id);
CREATE INDEX idx_invoices_number ON invoices(company_id, invoice_number);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due ON invoices(due_date) WHERE status IN ('sent', 'viewed', 'partial');

-- Invoice Line Items
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    
    description TEXT NOT NULL,
    quantity DECIMAL(10, 4) NOT NULL DEFAULT 1,
    unit_price DECIMAL(15, 4) NOT NULL,
    discount_percentage DECIMAL(5, 2) DEFAULT 0,
    vat_rate DECIMAL(5, 2) DEFAULT 20,
    amount DECIMAL(15, 2) NOT NULL,
    
    -- Product/Service
    product_id UUID,
    product_code VARCHAR(50),
    
    sort_order INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);


-- ============================================================================
-- THE NEXUS - NETWORKING & FUNDING
-- ============================================================================

-- Network Connections
CREATE TABLE network_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Users involved
    user_a_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user_b_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Connection Type
    connection_type VARCHAR(30) NOT NULL CHECK (connection_type IN (
        'introduction', 'direct', 'event', 'funding', 'collaboration'
    )),
    
    -- Status
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN (
        'pending', 'accepted', 'declined', 'blocked'
    )),
    
    -- Trust Score
    trust_score DECIMAL(3, 2),  -- 0.00 to 1.00
    
    -- Interaction metrics
    meetings_count INTEGER DEFAULT 0,
    messages_count INTEGER DEFAULT 0,
    last_interaction_at TIMESTAMPTZ,
    
    -- Source
    introduced_by UUID REFERENCES users(id),
    introduction_id UUID,
    
    -- Metadata
    relationship_notes TEXT,
    tags VARCHAR(50)[] DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_a_id, user_b_id),
    CHECK (user_a_id < user_b_id)  -- Ensure canonical ordering
);

CREATE INDEX idx_network_user_a ON network_connections(user_a_id);
CREATE INDEX idx_network_user_b ON network_connections(user_b_id);

-- Introduction Requests
CREATE TABLE introduction_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Parties
    requester_id UUID NOT NULL REFERENCES users(id),
    target_id UUID NOT NULL REFERENCES users(id),
    introducer_id UUID REFERENCES users(id),  -- Mutual connection
    
    -- Company context
    requester_company_id UUID REFERENCES companies(id),
    target_company_id UUID REFERENCES companies(id),
    
    -- Request Details
    introduction_type VARCHAR(30) NOT NULL CHECK (introduction_type IN (
        'investor', 'advisor', 'customer', 'partner', 'talent', 'other'
    )),
    message TEXT,
    context TEXT,
    
    -- AI Matching
    ai_match_score DECIMAL(3, 2),
    ai_match_reasons JSONB DEFAULT '[]',
    
    -- Status
    status VARCHAR(30) DEFAULT 'pending' CHECK (status IN (
        'pending', 'ai_approved', 'introducer_approved', 'target_approved',
        'accepted', 'declined', 'expired', 'meeting_scheduled'
    )),
    
    -- Double opt-in tracking
    introducer_approved_at TIMESTAMPTZ,
    target_approved_at TIMESTAMPTZ,
    
    -- Outcome
    meeting_scheduled_at TIMESTAMPTZ,
    outcome VARCHAR(30),
    outcome_notes TEXT,
    
    -- Expiry
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_intro_requests_requester ON introduction_requests(requester_id);
CREATE INDEX idx_intro_requests_target ON introduction_requests(target_id);
CREATE INDEX idx_intro_requests_status ON introduction_requests(status);

-- Trust Graph Scores
CREATE TABLE trust_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Overall Score
    overall_score DECIMAL(5, 2) DEFAULT 0,  -- 0-100
    tier VARCHAR(20) DEFAULT 'bronze' CHECK (tier IN (
        'bronze', 'silver', 'gold', 'platinum', 'diamond'
    )),
    
    -- Component Scores (0-100)
    delivery_score DECIMAL(5, 2) DEFAULT 0,      -- 30% weight
    voucher_score DECIMAL(5, 2) DEFAULT 0,       -- 25% weight
    introduction_score DECIMAL(5, 2) DEFAULT 0,  -- 20% weight
    responsiveness_score DECIMAL(5, 2) DEFAULT 0, -- 15% weight
    contribution_score DECIMAL(5, 2) DEFAULT 0,  -- 10% weight
    
    -- Metrics
    total_introductions_made INTEGER DEFAULT 0,
    successful_introductions INTEGER DEFAULT 0,
    total_introductions_received INTEGER DEFAULT 0,
    average_response_time_hours DECIMAL(10, 2),
    vouches_received INTEGER DEFAULT 0,
    vouches_given INTEGER DEFAULT 0,
    
    -- History
    score_history JSONB DEFAULT '[]',  -- [{date, score}]
    
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

CREATE INDEX idx_trust_scores_tier ON trust_scores(tier);
CREATE INDEX idx_trust_scores_overall ON trust_scores(overall_score DESC);

-- Investor Profiles
CREATE TABLE investor_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Investor Type
    investor_type VARCHAR(30) NOT NULL CHECK (investor_type IN (
        'angel', 'vc', 'family_office', 'corporate', 'syndicate', 'crowd'
    )),
    
    -- Investment Criteria
    check_size_min DECIMAL(15, 2),
    check_size_max DECIMAL(15, 2),
    check_size_sweet_spot DECIMAL(15, 2),
    currency VARCHAR(3) DEFAULT 'GBP',
    
    -- Stage preferences (array of stages)
    stages VARCHAR(30)[] DEFAULT '{}',  -- 'pre_seed', 'seed', 'series_a', etc.
    
    -- Sector preferences
    sectors VARCHAR(100)[] DEFAULT '{}',
    sector_exclusions VARCHAR(100)[] DEFAULT '{}',
    
    -- Geography
    geographies VARCHAR(50)[] DEFAULT '{}',
    
    -- Investment style
    lead_investor BOOLEAN DEFAULT FALSE,
    follow_investor BOOLEAN DEFAULT TRUE,
    board_seat_interest BOOLEAN DEFAULT FALSE,
    hands_on BOOLEAN DEFAULT FALSE,
    
    -- Deal flow
    deals_reviewed_per_month INTEGER,
    investments_per_year INTEGER,
    
    -- Tax schemes
    seis_investor BOOLEAN DEFAULT FALSE,
    eis_investor BOOLEAN DEFAULT FALSE,
    
    -- Track record
    portfolio_companies INTEGER DEFAULT 0,
    exits INTEGER DEFAULT 0,
    total_invested DECIMAL(15, 2),
    
    -- Status
    actively_investing BOOLEAN DEFAULT TRUE,
    last_investment_date DATE,
    
    -- Visibility
    is_public BOOLEAN DEFAULT FALSE,
    visible_to_network_only BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

CREATE INDEX idx_investor_profiles_type ON investor_profiles(investor_type);
CREATE INDEX idx_investor_profiles_active ON investor_profiles(actively_investing) WHERE actively_investing = TRUE;
CREATE INDEX idx_investor_profiles_stages ON investor_profiles USING gin(stages);
CREATE INDEX idx_investor_profiles_sectors ON investor_profiles USING gin(sectors);

-- Funding Rounds
CREATE TABLE funding_rounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Round Details
    round_name VARCHAR(100) NOT NULL,  -- "Seed Round", "SEIS Round 1"
    round_type VARCHAR(30) NOT NULL CHECK (round_type IN (
        'pre_seed', 'seed', 'series_a', 'series_b', 'series_c', 'bridge',
        'convertible', 'seis', 'eis', 'grant', 'debt', 'rbf', 'community'
    )),
    
    -- Target
    target_amount DECIMAL(15, 2),
    minimum_amount DECIMAL(15, 2),
    maximum_amount DECIMAL(15, 2),
    currency VARCHAR(3) DEFAULT 'GBP',
    
    -- Progress
    amount_raised DECIMAL(15, 2) DEFAULT 0,
    amount_committed DECIMAL(15, 2) DEFAULT 0,
    investors_count INTEGER DEFAULT 0,
    
    -- Valuation
    pre_money_valuation DECIMAL(15, 2),
    post_money_valuation DECIMAL(15, 2),
    share_price DECIMAL(10, 6),
    
    -- Terms
    share_class_id UUID REFERENCES share_classes(id),
    discount_percentage DECIMAL(5, 2),
    valuation_cap DECIMAL(15, 2),
    
    -- Dates
    opened_at TIMESTAMPTZ,
    target_close_date DATE,
    closed_at TIMESTAMPTZ,
    
    -- Status
    status VARCHAR(30) DEFAULT 'planning' CHECK (status IN (
        'planning', 'open', 'closing', 'closed', 'cancelled'
    )),
    
    -- Documents
    pitch_deck_id UUID REFERENCES documents(id),
    data_room_url TEXT,
    
    -- Tax Relief
    seis_eligible BOOLEAN DEFAULT FALSE,
    eis_eligible BOOLEAN DEFAULT FALSE,
    
    -- Platform
    platform VARCHAR(50),  -- 'genesis', 'seedrs', 'crowdcube', 'direct'
    platform_round_id VARCHAR(100),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_funding_rounds_company ON funding_rounds(company_id);
CREATE INDEX idx_funding_rounds_status ON funding_rounds(status);
CREATE INDEX idx_funding_rounds_type ON funding_rounds(round_type);

-- Investments
CREATE TABLE investments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    funding_round_id UUID NOT NULL REFERENCES funding_rounds(id),
    investor_id UUID NOT NULL REFERENCES users(id),
    company_id UUID NOT NULL REFERENCES companies(id),
    
    -- Investment Details
    amount DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'GBP',
    share_price DECIMAL(10, 6),
    shares_allocated INTEGER,
    shareholding_id UUID REFERENCES shareholdings(id),
    
    -- Status
    status VARCHAR(30) DEFAULT 'committed' CHECK (status IN (
        'interested', 'committed', 'documentation', 'funds_received', 
        'completed', 'withdrawn', 'refunded'
    )),
    
    -- Tax Relief
    seis_relief BOOLEAN DEFAULT FALSE,
    eis_relief BOOLEAN DEFAULT FALSE,
    relief_certificate_id UUID REFERENCES documents(id),
    
    -- Source
    source VARCHAR(50),  -- 'direct', 'nexus_intro', 'community', 'platform'
    introduction_id UUID REFERENCES introduction_requests(id),
    
    -- Dates
    committed_at TIMESTAMPTZ,
    documentation_completed_at TIMESTAMPTZ,
    funds_received_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Payment
    payment_method VARCHAR(30),  -- 'bank_transfer', 'stripe', 'nominee'
    payment_reference VARCHAR(100),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_investments_round ON investments(funding_round_id);
CREATE INDEX idx_investments_investor ON investments(investor_id);
CREATE INDEX idx_investments_company ON investments(company_id);
CREATE INDEX idx_investments_status ON investments(status);

-- Grant Applications
CREATE TABLE grant_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Grant Details
    grant_name VARCHAR(255) NOT NULL,
    grant_provider VARCHAR(255) NOT NULL,  -- "Innovate UK", "Horizon Europe"
    grant_scheme VARCHAR(255),
    
    -- Amounts
    amount_requested DECIMAL(15, 2),
    amount_awarded DECIMAL(15, 2),
    match_funding_required DECIMAL(15, 2),
    match_funding_percentage DECIMAL(5, 2),
    
    -- Status
    status VARCHAR(30) DEFAULT 'researching' CHECK (status IN (
        'researching', 'drafting', 'submitted', 'under_review', 
        'awarded', 'rejected', 'withdrawn'
    )),
    
    -- Dates
    submission_deadline DATE,
    submitted_at TIMESTAMPTZ,
    decision_expected DATE,
    decision_received_at TIMESTAMPTZ,
    
    -- Application
    application_reference VARCHAR(100),
    application_document_id UUID REFERENCES documents(id),
    
    -- AI
    ai_eligibility_score DECIMAL(3, 2),
    ai_success_probability DECIMAL(3, 2),
    ai_generated_draft BOOLEAN DEFAULT FALSE,
    
    -- Notes
    notes TEXT,
    feedback TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_grants_company ON grant_applications(company_id);
CREATE INDEX idx_grants_status ON grant_applications(status);
CREATE INDEX idx_grants_deadline ON grant_applications(submission_deadline);

-- RBF Applications
CREATE TABLE rbf_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Provider
    provider VARCHAR(50) NOT NULL,  -- 'clearco', 'wayflyer', 'uncapped', 'outfund'
    
    -- Application
    amount_requested DECIMAL(15, 2),
    amount_offered DECIMAL(15, 2),
    fee_percentage DECIMAL(5, 2),  -- Flat fee, e.g., 8%
    repayment_percentage DECIMAL(5, 2),  -- % of revenue, e.g., 10%
    
    -- Status
    status VARCHAR(30) DEFAULT 'draft' CHECK (status IN (
        'draft', 'submitted', 'under_review', 'offer_received', 
        'accepted', 'active', 'repaid', 'rejected', 'withdrawn'
    )),
    
    -- Dates
    submitted_at TIMESTAMPTZ,
    offer_received_at TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    first_repayment_date DATE,
    expected_repayment_date DATE,
    
    -- Repayment tracking
    total_to_repay DECIMAL(15, 2),
    amount_repaid DECIMAL(15, 2) DEFAULT 0,
    
    -- Integration
    provider_application_id VARCHAR(100),
    api_credentials_encrypted TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rbf_company ON rbf_applications(company_id);
CREATE INDEX idx_rbf_status ON rbf_applications(status);

-- ============================================================================
-- PULSE - MESSAGING
-- ============================================================================

-- Pulse Conversations
CREATE TABLE pulse_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES companies(id),
    
    -- Channel
    channel VARCHAR(20) NOT NULL CHECK (channel IN (
        'sms', 'whatsapp', 'telegram', 'imessage', 'email'
    )),
    channel_identifier VARCHAR(100) NOT NULL,  -- Phone number, email, etc.
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN (
        'active', 'paused', 'closed'
    )),
    
    -- Metrics
    messages_count INTEGER DEFAULT 0,
    last_message_at TIMESTAMPTZ,
    last_user_message_at TIMESTAMPTZ,
    last_pulse_message_at TIMESTAMPTZ,
    
    -- Context
    current_context JSONB DEFAULT '{}',  -- Current conversation state
    pending_action JSONB,  -- Action awaiting approval
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, channel)
);

CREATE INDEX idx_pulse_conversations_user ON pulse_conversations(user_id);
CREATE INDEX idx_pulse_conversations_channel ON pulse_conversations(channel);

-- Pulse Messages
CREATE TABLE pulse_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES pulse_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Direction
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    
    -- Content
    message_type VARCHAR(30) NOT NULL CHECK (message_type IN (
        'text', 'voice', 'image', 'document', 'location', 'action', 'system'
    )),
    content TEXT,
    media_url TEXT,
    media_type VARCHAR(100),
    
    -- Voice transcription
    transcription TEXT,
    transcription_confidence DECIMAL(3, 2),
    
    -- Intent (for inbound)
    detected_intent VARCHAR(50),
    intent_confidence DECIMAL(3, 2),
    extracted_entities JSONB DEFAULT '{}',
    
    -- Processing
    processed BOOLEAN DEFAULT FALSE,
    processing_result JSONB,
    
    -- Action (if message triggered/requested action)
    action_type VARCHAR(50),
    action_params JSONB,
    action_status VARCHAR(30),
    action_result JSONB,
    
    -- Response (for outbound)
    response_to_id UUID REFERENCES pulse_messages(id),
    response_latency_ms INTEGER,
    
    -- External
    external_id VARCHAR(100),  -- Twilio SID, etc.
    external_status VARCHAR(30),  -- delivered, read, failed
    
    -- Errors
    error_code VARCHAR(50),
    error_message TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pulse_messages_conversation ON pulse_messages(conversation_id);
CREATE INDEX idx_pulse_messages_user ON pulse_messages(user_id);
CREATE INDEX idx_pulse_messages_created ON pulse_messages(created_at DESC);
CREATE INDEX idx_pulse_messages_intent ON pulse_messages(detected_intent);

-- Pulse Scheduled Messages
CREATE TABLE pulse_scheduled_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES pulse_conversations(id),
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Schedule
    scheduled_for TIMESTAMPTZ NOT NULL,
    timezone VARCHAR(50) DEFAULT 'Europe/London',
    
    -- Message
    message_type VARCHAR(30) NOT NULL,
    content TEXT,
    template VARCHAR(50),  -- 'morning_briefing', 'meeting_prep', etc.
    template_params JSONB DEFAULT '{}',
    
    -- Recurrence
    is_recurring BOOLEAN DEFAULT FALSE,
    recurrence_rule VARCHAR(100),  -- iCal RRULE
    
    -- Status
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN (
        'scheduled', 'sent', 'failed', 'cancelled'
    )),
    sent_at TIMESTAMPTZ,
    message_id UUID REFERENCES pulse_messages(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pulse_scheduled_for ON pulse_scheduled_messages(scheduled_for) 
    WHERE status = 'scheduled';

-- User Preferences learned by Pulse
CREATE TABLE pulse_user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Communication Style
    preferred_response_length VARCHAR(20) DEFAULT 'medium',  -- brief, medium, detailed
    preferred_format VARCHAR(20) DEFAULT 'prose',  -- prose, bullets, structured
    use_emojis BOOLEAN DEFAULT FALSE,
    formality_level VARCHAR(20) DEFAULT 'professional',  -- casual, professional, formal
    
    -- Terminology mappings
    terminology_map JSONB DEFAULT '{}',  -- {"the deck": "investor_presentation", "J": "James"}
    
    -- Activity patterns
    most_active_hours INTEGER[] DEFAULT '{}',  -- Hours (0-23) when most responsive
    least_active_hours INTEGER[] DEFAULT '{}',
    average_response_time_minutes INTEGER,
    
    -- Decision patterns
    auto_approve_threshold DECIMAL(10, 2),  -- Auto-approve expenses under this
    auto_approve_categories VARCHAR(50)[] DEFAULT '{}',
    
    -- Topic priorities
    current_focus_areas VARCHAR(100)[] DEFAULT '{}',  -- e.g., ['fundraising', 'hiring']
    
    -- Learning data
    feedback_positive INTEGER DEFAULT 0,
    feedback_negative INTEGER DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id)
);

-- ============================================================================
-- CRM
-- ============================================================================

CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),  -- If contact is also a user
    
    -- Basic Info
    contact_type VARCHAR(30) NOT NULL CHECK (contact_type IN (
        'lead', 'customer', 'investor', 'advisor', 'supplier', 'partner', 'other'
    )),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255),
    phone VARCHAR(20),
    
    -- Company
    contact_company_name VARCHAR(255),
    contact_company_id UUID,  -- If their company is in our system
    job_title VARCHAR(100),
    
    -- Address
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    address_city VARCHAR(100),
    address_postcode VARCHAR(20),
    address_country VARCHAR(2),
    
    -- Social
    linkedin_url TEXT,
    twitter_handle VARCHAR(50),
    
    -- Status
    status VARCHAR(30) DEFAULT 'active',
    lead_score INTEGER,
    lead_source VARCHAR(50),
    
    -- Tags & Notes
    tags VARCHAR(50)[] DEFAULT '{}',
    notes TEXT,
    
    -- Enrichment
    enriched_at TIMESTAMPTZ,
    enrichment_data JSONB DEFAULT '{}',
    
    -- Knowledge Graph
    knowledge_graph_id VARCHAR(100),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contacts_company ON contacts(company_id);
CREATE INDEX idx_contacts_type ON contacts(contact_type);
CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_tags ON contacts USING gin(tags);

-- ============================================================================
-- AUDIT LOG
-- ============================================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Who
    user_id UUID REFERENCES users(id),
    company_id UUID REFERENCES companies(id),
    
    -- What
    action VARCHAR(50) NOT NULL,  -- 'create', 'update', 'delete', 'view', 'export'
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    
    -- Changes
    old_values JSONB,
    new_values JSONB,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(100),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partition audit logs by month for performance
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_company ON audit_logs(company_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================================================
-- SUBSCRIPTIONS & BILLING
-- ============================================================================

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    company_id UUID REFERENCES companies(id),
    
    -- Plan
    plan_id VARCHAR(50) NOT NULL,  -- 'free', 'starter', 'growth', 'scale'
    plan_name VARCHAR(100),
    
    -- Stripe
    stripe_customer_id VARCHAR(100),
    stripe_subscription_id VARCHAR(100),
    
    -- Status
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN (
        'active', 'past_due', 'cancelled', 'paused', 'trialing'
    )),
    
    -- Billing
    billing_cycle VARCHAR(20) DEFAULT 'monthly',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    
    -- Trial
    trial_start TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    
    -- Cancellation
    cancel_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_company ON subscriptions(company_id);
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);

## 4.2 Neo4j Schema (Knowledge Graph)

### 4.2.1 Node Types

```cypher
// ============================================================================
// GENESIS ENGINE - Neo4j Knowledge Graph Schema
// ============================================================================

// ----------------------------------------------------------------------------
// CORE NODES
// ----------------------------------------------------------------------------

// Company Node
CREATE CONSTRAINT company_id IF NOT EXISTS FOR (c:Company) REQUIRE c.id IS UNIQUE;

// Example Company Node
(:Company {
    id: "uuid",
    name: "string",
    company_number: "string",
    status: "string",
    industry: "string",
    sector: "string",
    founded_date: date,
    employee_count: integer,
    funding_stage: "string",
    total_funding: float,
    last_valuation: float,
    postgres_id: "uuid",  // Reference to PostgreSQL
    created_at: datetime,
    updated_at: datetime
})

// Person Node (can be user, contact, or external person)
CREATE CONSTRAINT person_id IF NOT EXISTS FOR (p:Person) REQUIRE p.id IS UNIQUE;

(:Person {
    id: "uuid",
    name: "string",
    email: "string",
    user_id: "uuid",  // NULL if not a platform user
    linkedin_url: "string",
    role: "string",  // Current primary role
    expertise: ["string"],
    trust_score: float,
    investor_type: "string",  // NULL if not investor
    created_at: datetime,
    updated_at: datetime
})

// Idea Node
CREATE CONSTRAINT idea_id IF NOT EXISTS FOR (i:Idea) REQUIRE i.id IS UNIQUE;

(:Idea {
    id: "uuid",
    title: "string",
    description: "string",
    status: "string",  // 'raw', 'validated', 'pivoted', 'abandoned'
    validation_score: float,
    company_id: "uuid",
    created_at: datetime
})

// Product Node
CREATE CONSTRAINT product_id IF NOT EXISTS FOR (p:Product) REQUIRE p.id IS UNIQUE;

(:Product {
    id: "uuid",
    name: "string",
    description: "string",
    product_type: "string",  // 'saas', 'marketplace', 'service', etc.
    status: "string",
    company_id: "uuid",
    created_at: datetime
})

// Market Node
CREATE CONSTRAINT market_id IF NOT EXISTS FOR (m:Market) REQUIRE m.id IS UNIQUE;

(:Market {
    id: "uuid",
    name: "string",
    description: "string",
    tam: float,
    sam: float,
    som: float,
    growth_rate: float,
    created_at: datetime
})

// Competitor Node
CREATE CONSTRAINT competitor_id IF NOT EXISTS FOR (c:Competitor) REQUIRE c.id IS UNIQUE;

(:Competitor {
    id: "uuid",
    name: "string",
    website: "string",
    description: "string",
    funding_raised: float,
    employee_count: integer,
    founded_year: integer,
    threat_level: "string",  // 'low', 'medium', 'high'
    created_at: datetime
})

// Document Node
CREATE CONSTRAINT document_id IF NOT EXISTS FOR (d:Document) REQUIRE d.id IS UNIQUE;

(:Document {
    id: "uuid",
    name: "string",
    document_type: "string",
    status: "string",
    postgres_id: "uuid",
    created_at: datetime
})

// Task Node
CREATE CONSTRAINT task_id IF NOT EXISTS FOR (t:Task) REQUIRE t.id IS UNIQUE;

(:Task {
    id: "uuid",
    title: "string",
    status: "string",
    priority: "string",
    due_date: date,
    postgres_id: "uuid",
    created_at: datetime
})

// Metric Node (for KPIs)
CREATE CONSTRAINT metric_id IF NOT EXISTS FOR (m:Metric) REQUIRE m.id IS UNIQUE;

(:Metric {
    id: "uuid",
    name: "string",
    metric_type: "string",  // 'revenue', 'users', 'mrr', 'churn', etc.
    value: float,
    unit: "string",
    period: "string",
    period_start: date,
    period_end: date,
    company_id: "uuid",
    created_at: datetime
})

// Funding Round Node
CREATE CONSTRAINT funding_round_id IF NOT EXISTS FOR (f:FundingRound) REQUIRE f.id IS UNIQUE;

(:FundingRound {
    id: "uuid",
    name: "string",
    round_type: "string",
    target_amount: float,
    amount_raised: float,
    status: "string",
    postgres_id: "uuid",
    created_at: datetime
})

// Skill Node (for matching)
CREATE CONSTRAINT skill_id IF NOT EXISTS FOR (s:Skill) REQUIRE s.id IS UNIQUE;

(:Skill {
    id: "uuid",
    name: "string",
    category: "string",
    created_at: datetime
})

// Industry Node
CREATE CONSTRAINT industry_id IF NOT EXISTS FOR (i:Industry) REQUIRE i.id IS UNIQUE;

(:Industry {
    id: "uuid",
    name: "string",
    parent_industry: "string",
    sic_codes: ["string"],
    created_at: datetime
})

// ----------------------------------------------------------------------------
// RELATIONSHIPS
// ----------------------------------------------------------------------------

// Person-Company Relationships
(:Person)-[:FOUNDED {date: date, equity_percentage: float}]->(:Company)
(:Person)-[:WORKS_AT {role: "string", started_at: date, ended_at: date}]->(:Company)
(:Person)-[:ADVISES {started_at: date, capacity: "string"}]->(:Company)
(:Person)-[:INVESTED_IN {amount: float, date: date, round: "string"}]->(:Company)
(:Person)-[:DIRECTS {appointed_on: date, resigned_on: date}]->(:Company)

// Person-Person Relationships
(:Person)-[:KNOWS {strength: float, since: date, source: "string"}]->(:Person)
(:Person)-[:INTRODUCED {date: datetime, outcome: "string"}]->(:Person)
(:Person)-[:VOUCHES_FOR {date: datetime, context: "string"}]->(:Person)
(:Person)-[:REPORTED_TO {started_at: date, ended_at: date}]->(:Person)

// Company Relationships
(:Company)-[:COMPETES_WITH {overlap_score: float}]->(:Company)
(:Company)-[:PARTNERS_WITH {since: date, partnership_type: "string"}]->(:Company)
(:Company)-[:ACQUIRED {date: date, amount: float}]->(:Company)
(:Company)-[:OPERATES_IN]->(:Market)
(:Company)-[:IN_INDUSTRY]->(:Industry)

// Product/Idea Relationships
(:Company)-[:OWNS]->(:Product)
(:Company)-[:EXPLORING]->(:Idea)
(:Idea)-[:EVOLVED_INTO]->(:Product)
(:Product)-[:TARGETS]->(:Market)
(:Product)-[:COMPETES_WITH]->(:Product)

// Document Relationships
(:Document)-[:BELONGS_TO]->(:Company)
(:Document)-[:CREATED_BY]->(:Person)
(:Document)-[:RELATES_TO]->(:Entity)  // Any entity type
(:Document)-[:VERSION_OF]->(:Document)

// Task Relationships
(:Task)-[:ASSIGNED_TO]->(:Person)
(:Task)-[:RELATES_TO]->(:Entity)
(:Task)-[:BLOCKED_BY]->(:Task)
(:Task)-[:SUBTASK_OF]->(:Task)

// Funding Relationships
(:FundingRound)-[:FOR]->(:Company)
(:Person)-[:LED]->(:FundingRound)
(:Person)-[:PARTICIPATED_IN]->(:FundingRound)

// Skill Relationships
(:Person)-[:HAS_SKILL {level: "string", years: integer}]->(:Skill)
(:Company)-[:NEEDS_SKILL {priority: "string"}]->(:Skill)

// ----------------------------------------------------------------------------
// INDEXES FOR PERFORMANCE
// ----------------------------------------------------------------------------

// Full-text search indexes
CREATE FULLTEXT INDEX company_search IF NOT EXISTS
FOR (c:Company) ON EACH [c.name, c.description];

CREATE FULLTEXT INDEX person_search IF NOT EXISTS
FOR (p:Person) ON EACH [p.name, p.email];

CREATE FULLTEXT INDEX document_search IF NOT EXISTS
FOR (d:Document) ON EACH [d.name];

// Composite indexes
CREATE INDEX company_status IF NOT EXISTS FOR (c:Company) ON (c.status, c.industry);
CREATE INDEX person_trust IF NOT EXISTS FOR (p:Person) ON (p.trust_score);
CREATE INDEX task_due IF NOT EXISTS FOR (t:Task) ON (t.due_date, t.status);
```

### 4.2.2 Common Graph Queries

```cypher
// Find all connections for a person (2 degrees)
MATCH path = (p:Person {id: $personId})-[*1..2]-(connected)
RETURN path

// Find mutual connections between two people
MATCH (p1:Person {id: $person1Id})-[:KNOWS]-(mutual)-[:KNOWS]-(p2:Person {id: $person2Id})
RETURN mutual

// Find investors who invest in similar companies
MATCH (investor:Person)-[:INVESTED_IN]->(c1:Company)-[:IN_INDUSTRY]->(ind:Industry)
      <-[:IN_INDUSTRY]-(c2:Company {id: $companyId})
WHERE NOT (investor)-[:INVESTED_IN]->(c2)
RETURN investor, COUNT(c1) AS overlap
ORDER BY overlap DESC
LIMIT 10

// Get company's full context (for AI)
MATCH (c:Company {id: $companyId})
OPTIONAL MATCH (c)<-[:FOUNDED]-(founder:Person)
OPTIONAL MATCH (c)<-[:INVESTED_IN]-(investor:Person)
OPTIONAL MATCH (c)-[:IN_INDUSTRY]->(ind:Industry)
OPTIONAL MATCH (c)-[:OPERATES_IN]->(market:Market)
OPTIONAL MATCH (c)-[:COMPETES_WITH]->(competitor:Competitor)
OPTIONAL MATCH (c)<-[:BELONGS_TO]-(doc:Document)
RETURN c, 
       COLLECT(DISTINCT founder) AS founders,
       COLLECT(DISTINCT investor) AS investors,
       COLLECT(DISTINCT ind) AS industries,
       COLLECT(DISTINCT market) AS markets,
       COLLECT(DISTINCT competitor) AS competitors,
       COLLECT(DISTINCT doc) AS documents

// Calculate introduction path
MATCH path = shortestPath(
    (p1:Person {id: $fromPersonId})-[:KNOWS*..4]-(p2:Person {id: $toPersonId})
)
RETURN path

// Find best introducer
MATCH (p1:Person {id: $fromPersonId})-[:KNOWS]->(introducer)-[:KNOWS]->(p2:Person {id: $toPersonId})
RETURN introducer, introducer.trust_score AS trust
ORDER BY trust DESC
LIMIT 5
```

---

# 5. CORE SERVICES

## 5.1 Auth Service

**Port:** 3010  
**Responsibility:** Authentication, authorization, session management

### 5.1.1 Endpoints

```typescript
// routes/auth.ts

// POST /auth/register
// Register new user with email/password
interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}
interface RegisterResponse {
  user: User;
  session: Session;
  accessToken: string;
  refreshToken: string;
}

// POST /auth/login
// Login with email/password
interface LoginRequest {
  email: string;
  password: string;
  deviceInfo?: DeviceInfo;
}
interface LoginResponse {
  user: User;
  session: Session;
  accessToken: string;
  refreshToken: string;
  requiresMfa?: boolean;
  mfaToken?: string;
}

// POST /auth/logout
// Logout current session
interface LogoutRequest {
  refreshToken?: string;
  allDevices?: boolean;
}

// POST /auth/refresh
// Refresh access token
interface RefreshRequest {
  refreshToken: string;
}
interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

// POST /auth/forgot-password
interface ForgotPasswordRequest {
  email: string;
}

// POST /auth/reset-password
interface ResetPasswordRequest {
  token: string;
  password: string;
}

// POST /auth/verify-email
interface VerifyEmailRequest {
  token: string;
}

// OAuth routes
// GET /auth/oauth/:provider (google, apple, linkedin)
// GET /auth/oauth/:provider/callback
```

### 5.1.2 Implementation

```typescript
// services/auth.service.ts

import { hash, verify } from 'argon2';
import { SignJWT, jwtVerify } from 'jose';
import { randomBytes } from 'crypto';

export class AuthService {
  private readonly jwtSecret: Uint8Array;
  private readonly jwtExpiry: string;
  private readonly refreshExpiry: string;

  constructor(
    private readonly db: Database,
    private readonly redis: Redis,
    private readonly config: Config
  ) {
    this.jwtSecret = new TextEncoder().encode(config.JWT_SECRET);
    this.jwtExpiry = '15m';
    this.refreshExpiry = '7d';
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    // Validate email uniqueness
    const existing = await this.db.users.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('Email already registered');
    }

    // Hash password
    const passwordHash = await hash(data.password, {
      type: 2, // argon2id
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    // Create user
    const user = await this.db.users.create({
      email: data.email.toLowerCase(),
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      status: 'active',
    });

    // Create auth method
    await this.db.userAuthMethods.create({
      userId: user.id,
      provider: 'email',
      providerUserId: data.email.toLowerCase(),
    });

    // Create session
    const session = await this.createSession(user.id);

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user, session);

    // Send verification email
    await this.sendVerificationEmail(user);

    // Emit event
    await this.events.emit('user.registered', { userId: user.id, email: user.email });

    return {
      user: this.sanitizeUser(user),
      session,
      accessToken,
      refreshToken,
    };
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    // Find user
    const user = await this.db.users.findByEmail(data.email.toLowerCase());
    if (!user || !user.passwordHash) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check status
    if (user.status === 'suspended') {
      throw new ForbiddenError('Account suspended');
    }
    if (user.status === 'deleted') {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Verify password
    const valid = await verify(user.passwordHash, data.password);
    if (!valid) {
      // Rate limit failed attempts
      await this.recordFailedAttempt(data.email);
      throw new UnauthorizedError('Invalid credentials');
    }

    // Check MFA
    if (user.mfaEnabled) {
      const mfaToken = await this.createMfaToken(user.id);
      return {
        user: null as any,
        session: null as any,
        accessToken: '',
        refreshToken: '',
        requiresMfa: true,
        mfaToken,
      };
    }

    // Create session
    const session = await this.createSession(user.id, data.deviceInfo);

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user, session);

    // Update last active
    await this.db.users.update(user.id, { lastActiveAt: new Date() });

    return {
      user: this.sanitizeUser(user),
      session,
      accessToken,
      refreshToken,
    };
  }

  async verifyToken(token: string): Promise<TokenPayload> {
    try {
      const { payload } = await jwtVerify(token, this.jwtSecret, {
        algorithms: ['HS256'],
      });

      // Check if session is still valid
      const session = await this.db.sessions.findById(payload.sessionId as string);
      if (!session || session.expiresAt < new Date()) {
        throw new UnauthorizedError('Session expired');
      }

      return payload as TokenPayload;
    } catch (error) {
      if (error instanceof UnauthorizedError) throw error;
      throw new UnauthorizedError('Invalid token');
    }
  }

  async refreshTokens(refreshToken: string): Promise<RefreshResponse> {
    // Verify refresh token
    const tokenHash = this.hashToken(refreshToken);
    const session = await this.db.sessions.findByTokenHash(tokenHash);

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Get user
    const user = await this.db.users.findById(session.userId);
    if (!user || user.status !== 'active') {
      throw new UnauthorizedError('Invalid refresh token');
    }

    // Rotate refresh token
    const newRefreshToken = this.generateRefreshToken();
    await this.db.sessions.update(session.id, {
      tokenHash: this.hashToken(newRefreshToken),
      lastUsedAt: new Date(),
    });

    // Generate new access token
    const accessToken = await this.generateAccessToken(user, session);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  private async generateTokens(user: User, session: Session) {
    const accessToken = await this.generateAccessToken(user, session);
    const refreshToken = this.generateRefreshToken();

    // Store refresh token hash
    await this.db.sessions.update(session.id, {
      tokenHash: this.hashToken(refreshToken),
    });

    return { accessToken, refreshToken };
  }

  private async generateAccessToken(user: User, session: Session): Promise<string> {
    return new SignJWT({
      sub: user.id,
      email: user.email,
      sessionId: session.id,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(this.jwtExpiry)
      .sign(this.jwtSecret);
  }

  private generateRefreshToken(): string {
    return randomBytes(32).toString('base64url');
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private async createSession(userId: string, deviceInfo?: DeviceInfo): Promise<Session> {
    return this.db.sessions.create({
      userId,
      deviceInfo: deviceInfo || {},
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
  }

  private sanitizeUser(user: User): Omit<User, 'passwordHash'> {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }

  private async recordFailedAttempt(email: string): Promise<void> {
    const key = `auth:failed:${email}`;
    const attempts = await this.redis.incr(key);
    await this.redis.expire(key, 900); // 15 minutes

    if (attempts >= 5) {
      // Lock account temporarily
      await this.redis.setex(`auth:locked:${email}`, 900, '1');
    }
  }
}
```

### 5.1.3 Error Handling

```typescript
// errors/auth.errors.ts

export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

export class UnauthorizedError extends AuthError {
  constructor(message = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401);
  }
}

export class ForbiddenError extends AuthError {
  constructor(message = 'Forbidden') {
    super(message, 'FORBIDDEN', 403);
  }
}

export class ConflictError extends AuthError {
  constructor(message = 'Conflict') {
    super(message, 'CONFLICT', 409);
  }
}

export class RateLimitError extends AuthError {
  constructor(retryAfter: number) {
    super('Too many requests', 'RATE_LIMITED', 429, { retryAfter });
  }
}

// Error codes for client handling
export const AUTH_ERROR_CODES = {
  INVALID_CREDENTIALS: 'AUTH_001',
  ACCOUNT_SUSPENDED: 'AUTH_002',
  EMAIL_NOT_VERIFIED: 'AUTH_003',
  TOKEN_EXPIRED: 'AUTH_004',
  TOKEN_INVALID: 'AUTH_005',
  SESSION_EXPIRED: 'AUTH_006',
  MFA_REQUIRED: 'AUTH_007',
  MFA_INVALID: 'AUTH_008',
  PASSWORD_TOO_WEAK: 'AUTH_009',
  EMAIL_IN_USE: 'AUTH_010',
  RATE_LIMITED: 'AUTH_011',
} as const;
```


## 5.2 Knowledge Graph Service

**Port:** 3001  
**Responsibility:** Graph operations, entity management, semantic search

### 5.2.1 Core Functions

```typescript
// services/knowledge-graph.service.ts

import neo4j, { Driver, Session } from 'neo4j-driver';
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

export class KnowledgeGraphService {
  private driver: Driver;
  private pinecone: Pinecone;
  private openai: OpenAI;

  constructor(config: Config) {
    this.driver = neo4j.driver(
      config.NEO4J_URI,
      neo4j.auth.basic(config.NEO4J_USER, config.NEO4J_PASSWORD)
    );
    this.pinecone = new Pinecone({ apiKey: config.PINECONE_API_KEY });
    this.openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });
  }

  // =========================================================================
  // ENTITY OPERATIONS
  // =========================================================================

  async createEntity(type: string, data: Record<string, any>): Promise<Entity> {
    const session = this.driver.session();
    try {
      const id = uuidv4();
      const now = new Date().toISOString();

      const result = await session.run(
        `CREATE (e:${type} $props) RETURN e`,
        {
          props: {
            id,
            ...data,
            created_at: now,
            updated_at: now,
          },
        }
      );

      const entity = this.nodeToEntity(result.records[0].get('e'));

      // Create embedding for semantic search
      if (this.shouldEmbed(type)) {
        await this.createEmbedding(entity);
      }

      // Emit event
      await this.events.emit('entity.created', {
        entityId: id,
        entityType: type,
        companyId: data.company_id,
      });

      return entity;
    } finally {
      await session.close();
    }
  }

  async updateEntity(
    type: string,
    id: string,
    data: Record<string, any>
  ): Promise<Entity> {
    const session = this.driver.session();
    try {
      const result = await session.run(
        `MATCH (e:${type} {id: $id})
         SET e += $props, e.updated_at = datetime()
         RETURN e`,
        { id, props: data }
      );

      if (result.records.length === 0) {
        throw new NotFoundError(`${type} not found: ${id}`);
      }

      const entity = this.nodeToEntity(result.records[0].get('e'));

      // Update embedding
      if (this.shouldEmbed(type)) {
        await this.updateEmbedding(entity);
      }

      return entity;
    } finally {
      await session.close();
    }
  }

  async createRelationship(
    fromType: string,
    fromId: string,
    relationType: string,
    toType: string,
    toId: string,
    properties?: Record<string, any>
  ): Promise<void> {
    const session = this.driver.session();
    try {
      await session.run(
        `MATCH (a:${fromType} {id: $fromId})
         MATCH (b:${toType} {id: $toId})
         MERGE (a)-[r:${relationType}]->(b)
         SET r += $props`,
        {
          fromId,
          toId,
          props: properties || {},
        }
      );
    } finally {
      await session.close();
    }
  }

  // =========================================================================
  // CONTEXT RETRIEVAL (for AI)
  // =========================================================================

  async getCompanyContext(companyId: string): Promise<CompanyContext> {
    const session = this.driver.session();
    try {
      const result = await session.run(
        `MATCH (c:Company {id: $companyId})
         
         // Founders & Team
         OPTIONAL MATCH (c)<-[:FOUNDED]-(founder:Person)
         OPTIONAL MATCH (c)<-[:WORKS_AT]-(employee:Person)
         
         // Investors
         OPTIONAL MATCH (c)<-[inv:INVESTED_IN]-(investor:Person)
         
         // Market & Industry
         OPTIONAL MATCH (c)-[:IN_INDUSTRY]->(industry:Industry)
         OPTIONAL MATCH (c)-[:OPERATES_IN]->(market:Market)
         
         // Competition
         OPTIONAL MATCH (c)-[:COMPETES_WITH]->(competitor:Competitor)
         
         // Products & Ideas
         OPTIONAL MATCH (c)-[:OWNS]->(product:Product)
         OPTIONAL MATCH (c)-[:EXPLORING]->(idea:Idea)
         
         // Funding
         OPTIONAL MATCH (c)<-[:FOR]-(round:FundingRound)
         
         // Recent metrics
         OPTIONAL MATCH (c)<-[:BELONGS_TO]-(metric:Metric)
         WHERE metric.created_at > datetime() - duration('P30D')
         
         // Recent documents
         OPTIONAL MATCH (c)<-[:BELONGS_TO]-(doc:Document)
         WHERE doc.created_at > datetime() - duration('P30D')
         
         // Active tasks
         OPTIONAL MATCH (c)<-[:RELATES_TO]-(task:Task)
         WHERE task.status IN ['pending', 'in_progress']
         
         RETURN c,
                COLLECT(DISTINCT founder) AS founders,
                COLLECT(DISTINCT employee) AS team,
                COLLECT(DISTINCT {investor: investor, investment: inv}) AS investments,
                COLLECT(DISTINCT industry) AS industries,
                COLLECT(DISTINCT market) AS markets,
                COLLECT(DISTINCT competitor) AS competitors,
                COLLECT(DISTINCT product) AS products,
                COLLECT(DISTINCT idea) AS ideas,
                COLLECT(DISTINCT round) AS fundingRounds,
                COLLECT(DISTINCT metric) AS recentMetrics,
                COLLECT(DISTINCT doc) AS recentDocuments,
                COLLECT(DISTINCT task) AS activeTasks`,
        { companyId }
      );

      if (result.records.length === 0) {
        throw new NotFoundError(`Company not found: ${companyId}`);
      }

      const record = result.records[0];
      return {
        company: this.nodeToEntity(record.get('c')),
        founders: record.get('founders').map(this.nodeToEntity),
        team: record.get('team').map(this.nodeToEntity),
        investments: record.get('investments'),
        industries: record.get('industries').map(this.nodeToEntity),
        markets: record.get('markets').map(this.nodeToEntity),
        competitors: record.get('competitors').map(this.nodeToEntity),
        products: record.get('products').map(this.nodeToEntity),
        ideas: record.get('ideas').map(this.nodeToEntity),
        fundingRounds: record.get('fundingRounds').map(this.nodeToEntity),
        recentMetrics: record.get('recentMetrics').map(this.nodeToEntity),
        recentDocuments: record.get('recentDocuments').map(this.nodeToEntity),
        activeTasks: record.get('activeTasks').map(this.nodeToEntity),
      };
    } finally {
      await session.close();
    }
  }

  // =========================================================================
  // SEMANTIC SEARCH
  // =========================================================================

  async semanticSearch(
    query: string,
    companyId: string,
    options: SearchOptions = {}
  ): Promise<SearchResult[]> {
    // Generate query embedding
    const embedding = await this.generateEmbedding(query);

    // Search Pinecone
    const index = this.pinecone.index(this.config.PINECONE_INDEX_NAME);
    const queryResult = await index.query({
      vector: embedding,
      topK: options.limit || 10,
      filter: {
        company_id: companyId,
        ...(options.entityTypes && { entity_type: { $in: options.entityTypes } }),
      },
      includeMetadata: true,
    });

    // Enrich with graph context
    const results = await Promise.all(
      queryResult.matches.map(async (match) => {
        const context = await this.getEntityContext(
          match.metadata?.entity_type as string,
          match.metadata?.entity_id as string
        );
        return {
          id: match.id,
          score: match.score,
          entityType: match.metadata?.entity_type,
          entityId: match.metadata?.entity_id,
          content: match.metadata?.content,
          context,
        };
      })
    );

    return results;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: this.config.OPENAI_MODEL_EMBEDDING,
      input: text,
    });
    return response.data[0].embedding;
  }

  private async createEmbedding(entity: Entity): Promise<void> {
    const text = this.entityToText(entity);
    const embedding = await this.generateEmbedding(text);

    const index = this.pinecone.index(this.config.PINECONE_INDEX_NAME);
    await index.upsert([
      {
        id: `${entity.type}:${entity.id}`,
        values: embedding,
        metadata: {
          entity_type: entity.type,
          entity_id: entity.id,
          company_id: entity.company_id,
          content: text.substring(0, 1000),
          updated_at: new Date().toISOString(),
        },
      },
    ]);
  }

  // =========================================================================
  // NETWORKING (for The Nexus)
  // =========================================================================

  async findIntroductionPath(
    fromUserId: string,
    toUserId: string,
    maxDepth = 4
  ): Promise<IntroductionPath | null> {
    const session = this.driver.session();
    try {
      const result = await session.run(
        `MATCH path = shortestPath(
           (p1:Person {user_id: $fromUserId})-[:KNOWS*..${maxDepth}]-(p2:Person {user_id: $toUserId})
         )
         RETURN path, length(path) as pathLength
         ORDER BY pathLength
         LIMIT 1`,
        { fromUserId, toUserId }
      );

      if (result.records.length === 0) {
        return null;
      }

      const path = result.records[0].get('path');
      return this.pathToIntroductionPath(path);
    } finally {
      await session.close();
    }
  }

  async findBestIntroducers(
    fromUserId: string,
    toUserId: string,
    limit = 5
  ): Promise<Introducer[]> {
    const session = this.driver.session();
    try {
      const result = await session.run(
        `MATCH (p1:Person {user_id: $fromUserId})-[:KNOWS]->(introducer:Person)-[:KNOWS]->(p2:Person {user_id: $toUserId})
         WHERE introducer.user_id IS NOT NULL
         RETURN introducer,
                introducer.trust_score AS trustScore,
                SIZE([(introducer)-[:INTRODUCED]->() | 1]) AS introductionCount
         ORDER BY trustScore DESC, introductionCount DESC
         LIMIT $limit`,
        { fromUserId, toUserId, limit }
      );

      return result.records.map((record) => ({
        person: this.nodeToEntity(record.get('introducer')),
        trustScore: record.get('trustScore'),
        introductionCount: record.get('introductionCount').toNumber(),
      }));
    } finally {
      await session.close();
    }
  }

  async findInvestorMatches(
    companyId: string,
    limit = 20
  ): Promise<InvestorMatch[]> {
    const session = this.driver.session();
    try {
      // Get company context for matching
      const company = await this.getCompanyContext(companyId);

      const result = await session.run(
        `// Find investors who have invested in similar companies
         MATCH (target:Company {id: $companyId})-[:IN_INDUSTRY]->(ind:Industry)
         MATCH (similar:Company)-[:IN_INDUSTRY]->(ind)
         MATCH (investor:Person)-[inv:INVESTED_IN]->(similar)
         WHERE target <> similar
           AND NOT (investor)-[:INVESTED_IN]->(target)
           AND investor.investor_type IS NOT NULL
         
         // Calculate match score
         WITH investor,
              COUNT(DISTINCT similar) AS portfolioOverlap,
              COLLECT(DISTINCT ind.name) AS matchingIndustries,
              AVG(inv.amount) AS avgCheckSize
         
         // Filter by active status
         WHERE investor.actively_investing = true
         
         RETURN investor,
                portfolioOverlap,
                matchingIndustries,
                avgCheckSize,
                investor.trust_score AS trustScore
         ORDER BY portfolioOverlap DESC, trustScore DESC
         LIMIT $limit`,
        { companyId, limit: neo4j.int(limit) }
      );

      return result.records.map((record) => ({
        investor: this.nodeToEntity(record.get('investor')),
        portfolioOverlap: record.get('portfolioOverlap').toNumber(),
        matchingIndustries: record.get('matchingIndustries'),
        avgCheckSize: record.get('avgCheckSize'),
        trustScore: record.get('trustScore'),
      }));
    } finally {
      await session.close();
    }
  }

  private nodeToEntity(node: any): Entity {
    return {
      type: node.labels[0],
      id: node.properties.id,
      ...node.properties,
    };
  }

  private entityToText(entity: Entity): string {
    // Convert entity to searchable text
    const parts = [entity.name || entity.title || ''];
    if (entity.description) parts.push(entity.description);
    if (entity.notes) parts.push(entity.notes);
    return parts.join(' ');
  }

  private shouldEmbed(type: string): boolean {
    return ['Company', 'Idea', 'Product', 'Document', 'Task', 'Competitor'].includes(
      type
    );
  }
}
```

---

# 6. GENESIS ENGINE CORE

## 6.1 Phase Management

Genesis Engine guides founders through 7 phases from idea to scale.

### 6.1.1 Phase Definitions

```typescript
// types/phases.ts

export const PHASES = {
  DISCOVERY: {
    id: 'discovery',
    name: 'Discovery & Validation',
    order: 1,
    description: 'Validate your idea with market research and competitor analysis',
    modules: [
      'idea_capture',
      'market_research',
      'competitor_analysis',
      'customer_discovery',
      'value_proposition',
    ],
    automationLevel: 0.8, // 80% automated
    typicalDuration: '2-4 weeks',
    prerequisites: [],
    outcomes: [
      'validated_problem',
      'target_customer_profile',
      'competitive_landscape',
      'initial_value_prop',
    ],
  },

  ARCHITECTURE: {
    id: 'architecture',
    name: 'Business Architecture',
    order: 2,
    description: 'Design your business model, pricing, and go-to-market strategy',
    modules: [
      'business_model_canvas',
      'pricing_strategy',
      'revenue_model',
      'go_to_market',
      'unit_economics',
    ],
    automationLevel: 0.7,
    typicalDuration: '2-3 weeks',
    prerequisites: ['discovery'],
    outcomes: [
      'business_model',
      'pricing_structure',
      'gtm_plan',
      'unit_economics_model',
    ],
  },

  LEGAL_FOUNDATION: {
    id: 'legal',
    name: 'Legal Foundation',
    order: 3,
    description: 'Incorporate your company and set up legal infrastructure',
    modules: [
      'company_formation',
      'articles_of_association',
      'shareholders_agreement',
      'founder_vesting',
      'ip_assignment',
      'employment_contracts',
    ],
    automationLevel: 0.6,
    typicalDuration: '1-2 weeks',
    prerequisites: ['architecture'],
    outcomes: [
      'incorporated_company',
      'legal_documents',
      'cap_table',
      'ip_protection',
    ],
    handoffTriggers: [
      'complex_shareholding',
      'international_founders',
      'regulated_industry',
    ],
  },

  FINANCIAL: {
    id: 'financial',
    name: 'Financial Infrastructure',
    order: 4,
    description: 'Set up financial systems and create projections',
    modules: [
      'banking_setup',
      'accounting_setup',
      'financial_model',
      'cash_flow_forecast',
      'kpi_dashboard',
      'tax_registration',
    ],
    automationLevel: 0.65,
    typicalDuration: '1-2 weeks',
    prerequisites: ['legal'],
    outcomes: [
      'bank_account',
      'accounting_system',
      'financial_model',
      'tax_registrations',
    ],
  },

  OPERATIONAL: {
    id: 'operational',
    name: 'Operational Setup',
    order: 5,
    description: 'Build your operational foundation and processes',
    modules: [
      'team_structure',
      'hiring_plan',
      'policies_procedures',
      'compliance_calendar',
      'tool_stack',
      'data_protection',
    ],
    automationLevel: 0.7,
    typicalDuration: '2-3 weeks',
    prerequisites: ['financial'],
    outcomes: [
      'org_structure',
      'policies',
      'compliance_system',
      'operational_tools',
    ],
  },

  LAUNCH: {
    id: 'launch',
    name: 'Launch Preparation',
    order: 6,
    description: 'Prepare brand, website, and go to market',
    modules: [
      'brand_identity',
      'website_mvp',
      'marketing_foundation',
      'sales_infrastructure',
      'customer_success',
      'launch_checklist',
    ],
    automationLevel: 0.5,
    typicalDuration: '4-6 weeks',
    prerequisites: ['operational'],
    outcomes: [
      'brand_assets',
      'website',
      'marketing_channels',
      'sales_process',
    ],
  },

  FUNDING: {
    id: 'funding',
    name: 'Funding & Growth',
    order: 7,
    description: 'Prepare for and execute fundraising',
    modules: [
      'funding_strategy',
      'investor_materials',
      'pitch_deck',
      'data_room',
      'investor_outreach',
      'due_diligence',
      'term_negotiation',
    ],
    automationLevel: 0.6,
    typicalDuration: '3-6 months',
    prerequisites: ['launch'],
    outcomes: [
      'pitch_deck',
      'data_room',
      'investor_pipeline',
      'funding_raised',
    ],
  },
} as const;

export type PhaseId = keyof typeof PHASES;
```

### 6.1.2 Module Execution Engine

```typescript
// services/module-engine.service.ts

export class ModuleEngine {
  constructor(
    private readonly kg: KnowledgeGraphService,
    private readonly ai: AIService,
    private readonly documents: DocumentService,
    private readonly queue: QueueService
  ) {}

  async executeModule(
    companyId: string,
    moduleId: string,
    params: Record<string, any> = {}
  ): Promise<ModuleResult> {
    const module = MODULES[moduleId];
    if (!module) {
      throw new NotFoundError(`Module not found: ${moduleId}`);
    }

    // Check prerequisites
    await this.checkPrerequisites(companyId, module.prerequisites);

    // Get company context
    const context = await this.kg.getCompanyContext(companyId);

    // Execute module steps
    const results: StepResult[] = [];
    for (const step of module.steps) {
      const stepResult = await this.executeStep(step, context, params, results);
      results.push(stepResult);

      // Check if handoff is needed
      if (stepResult.requiresHandoff) {
        return {
          moduleId,
          status: 'handoff_required',
          results,
          handoff: stepResult.handoff,
        };
      }
    }

    // Update progress
    await this.updateProgress(companyId, moduleId, results);

    return {
      moduleId,
      status: 'completed',
      results,
    };
  }

  private async executeStep(
    step: ModuleStep,
    context: CompanyContext,
    params: Record<string, any>,
    previousResults: StepResult[]
  ): Promise<StepResult> {
    switch (step.type) {
      case 'ai_research':
        return this.executeAIResearch(step, context, params);
      case 'ai_generate':
        return this.executeAIGenerate(step, context, params, previousResults);
      case 'document_create':
        return this.executeDocumentCreate(step, context, params);
      case 'external_api':
        return this.executeExternalAPI(step, context, params);
      case 'user_input':
        return this.requestUserInput(step, context, params);
      case 'approval':
        return this.requestApproval(step, context, params);
      case 'handoff':
        return this.createHandoff(step, context, params);
      default:
        throw new Error(`Unknown step type: ${step.type}`);
    }
  }

  private async executeAIResearch(
    step: ModuleStep,
    context: CompanyContext,
    params: Record<string, any>
  ): Promise<StepResult> {
    const prompt = this.buildPrompt(step.promptTemplate, context, params);

    const result = await this.ai.research({
      prompt,
      sources: step.sources || ['web', 'knowledge_graph'],
      maxTokens: step.maxTokens || 4000,
    });

    // Store in knowledge graph
    if (step.storeAs) {
      await this.kg.createEntity(step.storeAs, {
        company_id: context.company.id,
        content: result.content,
        sources: result.sources,
      });
    }

    return {
      stepId: step.id,
      type: 'ai_research',
      status: 'completed',
      output: result,
    };
  }

  private async executeAIGenerate(
    step: ModuleStep,
    context: CompanyContext,
    params: Record<string, any>,
    previousResults: StepResult[]
  ): Promise<StepResult> {
    // Build context from previous results
    const augmentedContext = {
      ...context,
      previousSteps: previousResults,
    };

    const prompt = this.buildPrompt(step.promptTemplate, augmentedContext, params);

    const result = await this.ai.generate({
      prompt,
      model: step.model || 'default',
      maxTokens: step.maxTokens || 2000,
      temperature: step.temperature || 0.7,
      format: step.outputFormat,
    });

    return {
      stepId: step.id,
      type: 'ai_generate',
      status: 'completed',
      output: result,
    };
  }

  private async executeDocumentCreate(
    step: ModuleStep,
    context: CompanyContext,
    params: Record<string, any>
  ): Promise<StepResult> {
    // Queue document generation
    const job = await this.queue.add('document:generate', {
      companyId: context.company.id,
      documentType: step.documentType,
      template: step.template,
      data: this.extractDocumentData(context, step.dataMapping),
    });

    // Wait for completion (with timeout)
    const result = await job.finished();

    return {
      stepId: step.id,
      type: 'document_create',
      status: 'completed',
      output: {
        documentId: result.documentId,
        documentUrl: result.url,
      },
    };
  }

  private async executeExternalAPI(
    step: ModuleStep,
    context: CompanyContext,
    params: Record<string, any>
  ): Promise<StepResult> {
    const apiConfig = EXTERNAL_APIS[step.api];
    if (!apiConfig) {
      throw new Error(`Unknown API: ${step.api}`);
    }

    try {
      const response = await this.callExternalAPI(apiConfig, step, context, params);
      return {
        stepId: step.id,
        type: 'external_api',
        status: 'completed',
        output: response,
      };
    } catch (error) {
      // Check if this requires handoff
      if (this.isHandoffError(error, step)) {
        return {
          stepId: step.id,
          type: 'external_api',
          status: 'failed',
          error: error.message,
          requiresHandoff: true,
          handoff: {
            reason: error.message,
            provider: step.handoffProvider,
            data: context,
          },
        };
      }
      throw error;
    }
  }

  private buildPrompt(
    template: string,
    context: CompanyContext,
    params: Record<string, any>
  ): string {
    // Replace placeholders with context values
    return template.replace(/\{\{(\w+(?:\.\w+)*)\}\}/g, (_, path) => {
      const value = this.getNestedValue({ ...context, ...params }, path);
      return value !== undefined ? String(value) : '';
    });
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((o, k) => o?.[k], obj);
  }
}
```

### 6.1.3 Module Definitions Example

```typescript
// modules/discovery/market-research.module.ts

export const MARKET_RESEARCH_MODULE: ModuleDefinition = {
  id: 'market_research',
  name: 'Market Research',
  phase: 'discovery',
  description: 'Comprehensive market analysis including TAM/SAM/SOM, trends, and opportunities',
  
  prerequisites: ['idea_capture'],
  
  inputs: [
    { id: 'industry', type: 'string', required: true },
    { id: 'target_geography', type: 'string', default: 'UK' },
    { id: 'specific_questions', type: 'string[]', required: false },
  ],
  
  outputs: [
    { id: 'market_size', type: 'MarketSize' },
    { id: 'market_trends', type: 'MarketTrend[]' },
    { id: 'target_segments', type: 'MarketSegment[]' },
    { id: 'market_report', type: 'Document' },
  ],
  
  steps: [
    {
      id: 'research_market_size',
      type: 'ai_research',
      name: 'Research Market Size',
      description: 'Calculate TAM, SAM, SOM for the target market',
      promptTemplate: `
        Research the market size for {{company.nature_of_business}} in {{target_geography}}.
        
        Company Context:
        - Business: {{company.nature_of_business}}
        - Industry: {{industry}}
        - Target Customer: {{company.target_customer}}
        
        Provide:
        1. Total Addressable Market (TAM) - global
        2. Serviceable Addressable Market (SAM) - target geography
        3. Serviceable Obtainable Market (SOM) - realistic 3-year target
        
        Include:
        - Market size in GBP
        - Number of potential customers
        - Growth rate (CAGR)
        - Data sources
        
        Format as structured JSON.
      `,
      sources: ['web', 'market_databases'],
      outputFormat: 'json',
      storeAs: 'MarketSize',
    },
    {
      id: 'research_trends',
      type: 'ai_research',
      name: 'Identify Market Trends',
      promptTemplate: `
        Identify key market trends for {{industry}} that will impact {{company.name}} over the next 3-5 years.
        
        Consider:
        - Technology trends
        - Regulatory changes
        - Consumer behavior shifts
        - Economic factors
        - Competitive dynamics
        
        For each trend, provide:
        - Description
        - Impact (positive/negative/neutral)
        - Timeline
        - Opportunity/threat assessment
        - Recommended actions
        
        Format as structured JSON array.
      `,
      sources: ['web', 'industry_reports'],
      outputFormat: 'json',
      storeAs: 'MarketTrend',
    },
    {
      id: 'identify_segments',
      type: 'ai_generate',
      name: 'Identify Target Segments',
      promptTemplate: `
        Based on the market research:
        {{previousSteps.research_market_size.output}}
        {{previousSteps.research_trends.output}}
        
        Identify 3-5 target market segments for {{company.name}}.
        
        For each segment, provide:
        - Segment name
        - Description
        - Size (# of customers, revenue potential)
        - Key characteristics
        - Pain points
        - Buying behavior
        - Recommended approach
        - Priority score (1-10)
        
        Format as structured JSON array.
      `,
      outputFormat: 'json',
      storeAs: 'MarketSegment',
    },
    {
      id: 'generate_report',
      type: 'document_create',
      name: 'Generate Market Research Report',
      documentType: 'market_research_report',
      template: 'market_research_v1',
      dataMapping: {
        company: 'context.company',
        marketSize: 'results.research_market_size.output',
        trends: 'results.research_trends.output',
        segments: 'results.identify_segments.output',
      },
    },
    {
      id: 'user_review',
      type: 'approval',
      name: 'Review Market Research',
      description: 'Review and approve the market research findings',
      approvalType: 'review',
      timeout: '7d',
    },
  ],
  
  automationLevel: 0.85,
  estimatedDuration: '2-4 hours',
  
  handoffTriggers: [
    {
      condition: 'market_size.tam > 100000000000', // >£100B TAM
      reason: 'Very large market - recommend professional market research',
      provider: 'market_research_firm',
    },
    {
      condition: 'target_geography.includes("US") && company.regulated_industry',
      reason: 'US regulated market - recommend legal review',
      provider: 'legal',
    },
  ],
};
```


---

# 7. THE NEXUS

## 7.1 Overview

The Nexus is Genesis Engine's AI-powered networking and funding system combining:
- AI networking agent (Boardy.ai model)
- Investor matching and introduction
- Multi-modal funding orchestration (SEIS/EIS, grants, RBF, community rounds)
- Trust graph for quality connections

## 7.2 Nexus Service

**Port:** 3004

### 7.2.1 Core Components

```typescript
// services/nexus.service.ts

import { KnowledgeGraphService } from './knowledge-graph.service';
import { AIService } from './ai.service';
import { QueueService } from './queue.service';

export class NexusService {
  constructor(
    private readonly kg: KnowledgeGraphService,
    private readonly ai: AIService,
    private readonly queue: QueueService,
    private readonly db: Database,
    private readonly config: Config
  ) {}

  // =========================================================================
  // INTRODUCTION SYSTEM
  // =========================================================================

  async requestIntroduction(
    requesterId: string,
    targetId: string,
    params: IntroductionParams
  ): Promise<IntroductionRequest> {
    // Validate requester and target exist
    const [requester, target] = await Promise.all([
      this.db.users.findById(requesterId),
      this.db.users.findById(targetId),
    ]);

    if (!requester || !target) {
      throw new NotFoundError('User not found');
    }

    // Check if direct connection exists
    const existingConnection = await this.kg.checkConnection(requesterId, targetId);
    if (existingConnection) {
      throw new ConflictError('Connection already exists');
    }

    // Check rate limits
    await this.checkIntroductionRateLimit(requesterId);

    // Find best introduction path
    const path = await this.kg.findIntroductionPath(requesterId, targetId);
    
    // Find best introducers
    const introducers = await this.kg.findBestIntroducers(requesterId, targetId);

    // Calculate AI match score
    const matchScore = await this.calculateMatchScore(requester, target, params);

    // Create introduction request
    const request = await this.db.introductionRequests.create({
      requesterId,
      targetId,
      introducerId: introducers[0]?.person.user_id,
      requesterCompanyId: params.companyId,
      introductionType: params.type,
      message: params.message,
      context: params.context,
      aiMatchScore: matchScore.score,
      aiMatchReasons: matchScore.reasons,
      status: 'pending',
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
    });

    // If AI score is high enough, auto-approve first step
    if (matchScore.score >= 0.8) {
      request.status = 'ai_approved';
      await this.db.introductionRequests.update(request.id, { status: 'ai_approved' });
      
      // Notify introducer
      await this.notifyIntroducer(request, introducers[0].person);
    }

    // Emit event
    await this.events.emit('introduction.requested', {
      requestId: request.id,
      fromUserId: requesterId,
      toUserId: targetId,
    });

    return request;
  }

  async approveIntroduction(
    requestId: string,
    approverId: string,
    role: 'introducer' | 'target'
  ): Promise<IntroductionRequest> {
    const request = await this.db.introductionRequests.findById(requestId);
    if (!request) {
      throw new NotFoundError('Introduction request not found');
    }

    // Validate approver
    if (role === 'introducer' && request.introducerId !== approverId) {
      throw new ForbiddenError('Not the introducer');
    }
    if (role === 'target' && request.targetId !== approverId) {
      throw new ForbiddenError('Not the target');
    }

    // Update status based on role
    const now = new Date();
    if (role === 'introducer') {
      request.introducerApprovedAt = now;
      request.status = 'introducer_approved';
      
      // Notify target
      await this.notifyTarget(request);
    } else {
      request.targetApprovedAt = now;
      request.status = 'accepted';
      
      // Create connection
      await this.createConnection(request);
      
      // Schedule meeting
      if (request.introductionType === 'investor') {
        await this.suggestMeeting(request);
      }
    }

    await this.db.introductionRequests.update(request.id, request);

    return request;
  }

  private async calculateMatchScore(
    requester: User,
    target: User,
    params: IntroductionParams
  ): Promise<MatchScore> {
    // Get full profiles
    const [requesterProfile, targetProfile] = await Promise.all([
      this.kg.getPersonContext(requester.id),
      this.kg.getPersonContext(target.id),
    ]);

    // Use AI to calculate match
    const prompt = `
      Evaluate the potential value of connecting these two people.
      
      Requester:
      ${JSON.stringify(requesterProfile, null, 2)}
      
      Target:
      ${JSON.stringify(targetProfile, null, 2)}
      
      Introduction Type: ${params.type}
      Context: ${params.context}
      
      Score from 0.0 to 1.0 based on:
      - Mutual value potential (both should benefit)
      - Relevance to stated introduction type
      - Overlap in interests/industry
      - Complementary expertise
      - Trust scores of both parties
      
      Return JSON: { score: number, reasons: string[] }
    `;

    const result = await this.ai.generate({
      prompt,
      model: 'fast',
      format: 'json',
    });

    return JSON.parse(result.content);
  }

  private async createConnection(request: IntroductionRequest): Promise<void> {
    // Create network connection in PostgreSQL
    await this.db.networkConnections.create({
      userAId: request.requesterId < request.targetId ? request.requesterId : request.targetId,
      userBId: request.requesterId < request.targetId ? request.targetId : request.requesterId,
      connectionType: 'introduction',
      status: 'accepted',
      introducedBy: request.introducerId,
      introductionId: request.id,
    });

    // Create relationship in Neo4j
    await this.kg.createRelationship(
      'Person', request.requesterId,
      'KNOWS',
      'Person', request.targetId,
      {
        since: new Date().toISOString(),
        source: 'nexus_introduction',
        introduction_id: request.id,
      }
    );

    // Update trust scores
    await this.updateTrustScores(request);
  }

  // =========================================================================
  // INVESTOR MATCHING
  // =========================================================================

  async findInvestorMatches(
    companyId: string,
    params: InvestorMatchParams = {}
  ): Promise<InvestorMatch[]> {
    // Get company context
    const company = await this.kg.getCompanyContext(companyId);

    // Get company's funding requirements
    const fundingRound = await this.db.fundingRounds.findActive(companyId);
    
    // Find matches from graph
    const graphMatches = await this.kg.findInvestorMatches(companyId, 50);

    // Enrich with full investor profiles
    const enrichedMatches = await Promise.all(
      graphMatches.map(async (match) => {
        const profile = await this.db.investorProfiles.findByUserId(match.investor.user_id);
        return {
          ...match,
          profile,
        };
      })
    );

    // Filter by criteria
    const filtered = enrichedMatches.filter((match) => {
      if (!match.profile) return false;
      if (!match.profile.activelyInvesting) return false;

      // Check size fit
      if (fundingRound) {
        const targetPerInvestor = fundingRound.targetAmount / 5; // Assume 5 investors
        if (
          match.profile.checkSizeMin > targetPerInvestor ||
          match.profile.checkSizeMax < targetPerInvestor * 0.5
        ) {
          return false;
        }
      }

      // Check stage fit
      const companyStage = this.determineStage(company);
      if (!match.profile.stages.includes(companyStage)) {
        return false;
      }

      // Check geography
      if (
        match.profile.geographies.length > 0 &&
        !match.profile.geographies.includes('GB') &&
        !match.profile.geographies.includes('UK')
      ) {
        return false;
      }

      return true;
    });

    // Calculate final scores using AI
    const scored = await this.scoreInvestorMatches(company, filtered, fundingRound);

    // Sort and limit
    return scored
      .sort((a, b) => b.finalScore - a.finalScore)
      .slice(0, params.limit || 20);
  }

  private async scoreInvestorMatches(
    company: CompanyContext,
    matches: EnrichedInvestorMatch[],
    fundingRound: FundingRound | null
  ): Promise<ScoredInvestorMatch[]> {
    // Batch score with AI for efficiency
    const prompt = `
      Score these potential investors for ${company.company.name}.
      
      Company Context:
      - Industry: ${company.industries.map(i => i.name).join(', ')}
      - Stage: ${this.determineStage(company)}
      - Seeking: ${fundingRound?.targetAmount ? `£${fundingRound.targetAmount}` : 'Unknown'}
      - SEIS/EIS eligible: ${company.company.seisEligible ? 'Yes' : 'No'}
      
      Investors to score:
      ${JSON.stringify(matches.map(m => ({
        id: m.investor.id,
        name: m.investor.name,
        type: m.profile?.investorType,
        checkSize: `£${m.profile?.checkSizeMin}-${m.profile?.checkSizeMax}`,
        stages: m.profile?.stages,
        sectors: m.profile?.sectors,
        trustScore: m.trustScore,
        portfolioOverlap: m.portfolioOverlap,
        seisEis: m.profile?.seisInvestor || m.profile?.eisInvestor,
      })), null, 2)}
      
      For each investor, provide a score 0-100 and brief reasoning.
      Consider: thesis fit, check size, stage match, sector expertise, SEIS/EIS alignment.
      
      Return JSON array: [{ id: string, score: number, reasoning: string }]
    `;

    const result = await this.ai.generate({
      prompt,
      model: 'fast',
      format: 'json',
    });

    const scores = JSON.parse(result.content);
    const scoreMap = new Map(scores.map((s: any) => [s.id, s]));

    return matches.map((match) => {
      const aiScore = scoreMap.get(match.investor.id);
      return {
        ...match,
        finalScore: aiScore?.score || 50,
        reasoning: aiScore?.reasoning || '',
      };
    });
  }

  // =========================================================================
  // TRUST GRAPH
  // =========================================================================

  async calculateTrustScore(userId: string): Promise<TrustScore> {
    // Get existing score or create new
    let score = await this.db.trustScores.findByUserId(userId);
    if (!score) {
      score = await this.db.trustScores.create({ userId });
    }

    // Calculate component scores
    const [
      deliveryScore,
      voucherScore,
      introductionScore,
      responsivenessScore,
      contributionScore,
    ] = await Promise.all([
      this.calculateDeliveryScore(userId),
      this.calculateVoucherScore(userId),
      this.calculateIntroductionScore(userId),
      this.calculateResponsivenessScore(userId),
      this.calculateContributionScore(userId),
    ]);

    // Weighted average
    const overall =
      deliveryScore * 0.3 +
      voucherScore * 0.25 +
      introductionScore * 0.2 +
      responsivenessScore * 0.15 +
      contributionScore * 0.1;

    // Determine tier
    const tier = this.determineTier(overall);

    // Update score
    const updated = await this.db.trustScores.update(score.id, {
      overallScore: overall,
      tier,
      deliveryScore,
      voucherScore,
      introductionScore,
      responsivenessScore,
      contributionScore,
      calculatedAt: new Date(),
      scoreHistory: [
        ...(score.scoreHistory || []),
        { date: new Date().toISOString(), score: overall },
      ].slice(-30), // Keep last 30 data points
    });

    return updated;
  }

  private async calculateDeliveryScore(userId: string): Promise<number> {
    // Based on completing commitments (meetings attended, follow-ups done)
    const stats = await this.db.query(`
      SELECT 
        COUNT(*) FILTER (WHERE outcome = 'completed') as completed,
        COUNT(*) FILTER (WHERE outcome IN ('no_show', 'cancelled')) as failed,
        COUNT(*) as total
      FROM introduction_requests ir
      JOIN network_connections nc ON ir.id = nc.introduction_id
      WHERE ir.requester_id = $1 OR ir.target_id = $1
    `, [userId]);

    if (stats.total === 0) return 50; // Neutral for new users

    const completionRate = stats.completed / stats.total;
    return Math.min(100, Math.round(completionRate * 100 + 20)); // Base 20 + performance
  }

  private async calculateVoucherScore(userId: string): Promise<number> {
    // Based on vouches received from trusted users
    const vouches = await this.db.query(`
      SELECT 
        v.voucher_id,
        ts.overall_score as voucher_trust_score
      FROM vouches v
      JOIN trust_scores ts ON v.voucher_id = ts.user_id
      WHERE v.vouchee_id = $1
      ORDER BY v.created_at DESC
      LIMIT 20
    `, [userId]);

    if (vouches.length === 0) return 30; // Low for unvouched users

    // Weighted by voucher's trust score
    const weightedSum = vouches.reduce(
      (sum: number, v: any) => sum + (v.voucher_trust_score || 50),
      0
    );
    return Math.min(100, Math.round(weightedSum / vouches.length));
  }

  private async calculateIntroductionScore(userId: string): Promise<number> {
    // Based on successful introductions made
    const stats = await this.db.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'accepted') as successful,
        COUNT(*) as total
      FROM introduction_requests
      WHERE introducer_id = $1
    `, [userId]);

    if (stats.total < 3) return 50; // Need minimum introductions

    const successRate = stats.successful / stats.total;
    return Math.min(100, Math.round(successRate * 80 + 20));
  }

  private async calculateResponsivenessScore(userId: string): Promise<number> {
    // Based on response time to introduction requests
    const stats = await this.db.query(`
      SELECT 
        AVG(EXTRACT(EPOCH FROM (
          COALESCE(introducer_approved_at, target_approved_at) - created_at
        )) / 3600) as avg_response_hours
      FROM introduction_requests
      WHERE (introducer_id = $1 OR target_id = $1)
        AND status NOT IN ('pending', 'expired')
    `, [userId]);

    if (!stats.avg_response_hours) return 50;

    // Score based on response time (24h = 100, 7 days = 20)
    const hours = stats.avg_response_hours;
    if (hours <= 24) return 100;
    if (hours >= 168) return 20;
    return Math.round(100 - (hours - 24) * (80 / 144));
  }

  private async calculateContributionScore(userId: string): Promise<number> {
    // Based on platform activity (events, content, referrals)
    const contributions = await this.db.query(`
      SELECT 
        COUNT(DISTINCT e.id) as events_attended,
        COUNT(DISTINCT r.id) as referrals,
        COUNT(DISTINCT f.id) as feedback_given
      FROM users u
      LEFT JOIN event_attendees e ON u.id = e.user_id
      LEFT JOIN referrals r ON u.id = r.referrer_id
      LEFT JOIN feedback f ON u.id = f.user_id
      WHERE u.id = $1
    `, [userId]);

    const score = Math.min(100,
      contributions.events_attended * 5 +
      contributions.referrals * 10 +
      contributions.feedback_given * 2 +
      20 // Base
    );

    return score;
  }

  private determineTier(score: number): string {
    if (score >= 90) return 'diamond';
    if (score >= 75) return 'platinum';
    if (score >= 60) return 'gold';
    if (score >= 40) return 'silver';
    return 'bronze';
  }

  // =========================================================================
  // FUNDING ORCHESTRATION
  // =========================================================================

  async createFundingRound(
    companyId: string,
    params: CreateFundingRoundParams
  ): Promise<FundingRound> {
    // Validate company
    const company = await this.db.companies.findById(companyId);
    if (!company) {
      throw new NotFoundError('Company not found');
    }

    // Check for existing active round
    const existingRound = await this.db.fundingRounds.findActive(companyId);
    if (existingRound) {
      throw new ConflictError('Active funding round already exists');
    }

    // Determine SEIS/EIS eligibility
    const seisEligible = await this.checkSeisEligibility(company);
    const eisEligible = await this.checkEisEligibility(company);

    // Create share class if needed
    let shareClassId = params.shareClassId;
    if (!shareClassId && params.roundType !== 'grant' && params.roundType !== 'rbf') {
      const shareClass = await this.db.shareClasses.create({
        companyId,
        className: params.roundName,
        classCode: this.generateShareClassCode(params.roundType),
        nominalValue: 0.0001,
        votingRights: params.roundType !== 'convertible',
        dividendRights: true,
      });
      shareClassId = shareClass.id;
    }

    // Create round
    const round = await this.db.fundingRounds.create({
      companyId,
      roundName: params.roundName,
      roundType: params.roundType,
      targetAmount: params.targetAmount,
      minimumAmount: params.minimumAmount || params.targetAmount * 0.5,
      maximumAmount: params.maximumAmount || params.targetAmount * 1.5,
      currency: params.currency || 'GBP',
      preMoneyValuation: params.preMoneyValuation,
      postMoneyValuation: params.preMoneyValuation
        ? params.preMoneyValuation + params.targetAmount
        : undefined,
      sharePrice: params.sharePrice,
      shareClassId,
      discountPercentage: params.discount,
      valuationCap: params.valuationCap,
      seisEligible,
      eisEligible,
      status: 'planning',
    });

    // Create associated tasks
    await this.createFundingTasks(round);

    // Emit event
    await this.events.emit('funding.round.created', {
      roundId: round.id,
      companyId,
      roundType: params.roundType,
    });

    return round;
  }

  async recordInvestment(
    roundId: string,
    params: RecordInvestmentParams
  ): Promise<Investment> {
    const round = await this.db.fundingRounds.findById(roundId);
    if (!round) {
      throw new NotFoundError('Funding round not found');
    }

    if (round.status !== 'open' && round.status !== 'closing') {
      throw new ValidationError('Round is not accepting investments');
    }

    // Check maximum
    if (round.amountRaised + params.amount > round.maximumAmount) {
      throw new ValidationError('Investment would exceed maximum round size');
    }

    // Create investment record
    const investment = await this.db.investments.create({
      fundingRoundId: roundId,
      investorId: params.investorId,
      companyId: round.companyId,
      amount: params.amount,
      currency: round.currency,
      sharePrice: round.sharePrice,
      sharesAllocated: round.sharePrice
        ? Math.floor(params.amount / round.sharePrice)
        : undefined,
      status: 'committed',
      seisRelief: params.claimSeis && round.seisEligible,
      eisRelief: params.claimEis && round.eisEligible,
      source: params.source || 'direct',
      introductionId: params.introductionId,
      committedAt: new Date(),
    });

    // Update round totals
    await this.db.fundingRounds.update(roundId, {
      amountCommitted: round.amountCommitted + params.amount,
      investorsCount: round.investorsCount + 1,
    });

    // Create relationship in graph
    await this.kg.createRelationship(
      'Person', params.investorId,
      'INVESTED_IN',
      'Company', round.companyId,
      {
        amount: params.amount,
        date: new Date().toISOString(),
        round: round.roundName,
        investment_id: investment.id,
      }
    );

    // Emit event
    await this.events.emit('investment.committed', {
      investmentId: investment.id,
      roundId,
      companyId: round.companyId,
      amount: params.amount,
    });

    // Check if round is now fully funded
    if (round.amountCommitted + params.amount >= round.targetAmount) {
      await this.handleRoundFullyFunded(round);
    }

    return investment;
  }

  async matchGrants(companyId: string): Promise<GrantMatch[]> {
    const company = await this.kg.getCompanyContext(companyId);

    // Search for matching grants using AI
    const prompt = `
      Find relevant UK grants for this company:
      
      Company: ${company.company.name}
      Industry: ${company.industries.map(i => i.name).join(', ')}
      Stage: ${this.determineStage(company)}
      Location: ${company.company.registeredAddressCity}
      R&D Activities: ${company.company.natureOfBusiness}
      Employee Count: ${company.team.length}
      
      Consider:
      - Innovate UK grants (Smart Grants, Innovation Loans)
      - R&D Tax Credits
      - Regional growth funds
      - Sector-specific grants
      - Export/trade grants
      
      Return JSON array of matching grants with:
      - name, provider, description
      - typical_amount (min, max)
      - eligibility_score (0-100)
      - next_deadline (if known)
      - match_reasoning
    `;

    const result = await this.ai.research({
      prompt,
      sources: ['web', 'grant_databases'],
    });

    const grants = JSON.parse(result.content);

    // Store matches
    for (const grant of grants) {
      await this.db.grantApplications.upsert({
        companyId,
        grantName: grant.name,
        grantProvider: grant.provider,
        aiEligibilityScore: grant.eligibility_score / 100,
        aiSuccessProbability: grant.success_probability / 100,
        submissionDeadline: grant.next_deadline,
        status: 'researching',
      });
    }

    return grants;
  }

  async applyForRbf(
    companyId: string,
    params: RbfApplicationParams
  ): Promise<RbfApplication> {
    const company = await this.db.companies.findById(companyId);
    if (!company) {
      throw new NotFoundError('Company not found');
    }

    // Get financial data for application
    const financials = await this.getCompanyFinancials(companyId);

    // Create application
    const application = await this.db.rbfApplications.create({
      companyId,
      provider: params.provider,
      amountRequested: params.amount,
      status: 'draft',
    });

    // Submit to provider API if configured
    if (this.config[`${params.provider.toUpperCase()}_API_KEY`]) {
      await this.queue.add('rbf:submit', {
        applicationId: application.id,
        provider: params.provider,
        companyData: {
          ...company,
          financials,
        },
      });
    }

    return application;
  }

  private async checkSeisEligibility(company: Company): Promise<boolean> {
    // SEIS criteria checks
    const checks = {
      ukTrading: company.registeredAddressCountry === 'GB',
      under3Years: company.incorporationDate
        ? new Date().getTime() - new Date(company.incorporationDate).getTime() <
          3 * 365 * 24 * 60 * 60 * 1000
        : true,
      under350kAssets: true, // Would need financial data
      under25Employees: true, // Would need HR data
      under250kPreviousSeis: (company.seisAllocationRemaining || 150000) > 0,
      notExcludedTrade: !this.isExcludedTrade(company.industry),
    };

    return Object.values(checks).every(Boolean);
  }

  private isExcludedTrade(industry?: string): boolean {
    const excluded = [
      'banking', 'insurance', 'money_lending', 'hire_purchase',
      'coal', 'steel', 'shipbuilding', 'property_development',
      'hotels', 'nursing_homes', 'farming', 'forestry', 'legal_services'
    ];
    return industry ? excluded.some(e => industry.toLowerCase().includes(e)) : false;
  }
}
```

### 7.2.2 Nexus API Endpoints

```typescript
// routes/nexus.routes.ts

import { FastifyInstance } from 'fastify';
import { NexusService } from '../services/nexus.service';

export async function nexusRoutes(app: FastifyInstance) {
  const nexus = app.diContainer.resolve<NexusService>('nexusService');

  // ==========================================================================
  // INTRODUCTIONS
  // ==========================================================================

  // Request introduction to another user
  app.post('/introductions', {
    schema: {
      body: {
        type: 'object',
        required: ['targetId', 'type'],
        properties: {
          targetId: { type: 'string', format: 'uuid' },
          type: { 
            type: 'string',
            enum: ['investor', 'advisor', 'customer', 'partner', 'talent', 'other']
          },
          companyId: { type: 'string', format: 'uuid' },
          message: { type: 'string', maxLength: 1000 },
          context: { type: 'string', maxLength: 2000 },
        },
      },
      response: {
        201: { $ref: 'IntroductionRequest#' },
        400: { $ref: 'Error#' },
        404: { $ref: 'Error#' },
        429: { $ref: 'Error#' },
      },
    },
    preHandler: [app.authenticate],
    handler: async (request, reply) => {
      const introduction = await nexus.requestIntroduction(
        request.user.id,
        request.body.targetId,
        {
          type: request.body.type,
          companyId: request.body.companyId,
          message: request.body.message,
          context: request.body.context,
        }
      );
      return reply.code(201).send(introduction);
    },
  });

  // Approve/decline introduction
  app.post('/introductions/:id/respond', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        required: ['action'],
        properties: {
          action: { type: 'string', enum: ['approve', 'decline'] },
          message: { type: 'string' },
        },
      },
    },
    preHandler: [app.authenticate],
    handler: async (request, reply) => {
      const { id } = request.params;
      const { action, message } = request.body;

      if (action === 'approve') {
        // Determine role (introducer or target)
        const intro = await nexus.getIntroduction(id);
        const role = intro.introducerId === request.user.id ? 'introducer' : 'target';
        const result = await nexus.approveIntroduction(id, request.user.id, role);
        return result;
      } else {
        const result = await nexus.declineIntroduction(id, request.user.id, message);
        return result;
      }
    },
  });

  // Get my introductions
  app.get('/introductions', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          type: { type: 'string' },
          limit: { type: 'integer', default: 20 },
          offset: { type: 'integer', default: 0 },
        },
      },
    },
    preHandler: [app.authenticate],
    handler: async (request) => {
      return nexus.getMyIntroductions(request.user.id, request.query);
    },
  });

  // ==========================================================================
  // INVESTOR MATCHING
  // ==========================================================================

  // Find matching investors for a company
  app.get('/companies/:companyId/investor-matches', {
    schema: {
      params: {
        type: 'object',
        properties: {
          companyId: { type: 'string', format: 'uuid' },
        },
      },
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', default: 20, maximum: 50 },
          minScore: { type: 'integer', default: 50 },
          investorTypes: { 
            type: 'array',
            items: { type: 'string' }
          },
        },
      },
    },
    preHandler: [app.authenticate, app.requireCompanyAccess],
    handler: async (request) => {
      return nexus.findInvestorMatches(request.params.companyId, request.query);
    },
  });

  // ==========================================================================
  // FUNDING ROUNDS
  // ==========================================================================

  // Create funding round
  app.post('/companies/:companyId/funding-rounds', {
    schema: {
      params: {
        type: 'object',
        properties: {
          companyId: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        required: ['roundName', 'roundType', 'targetAmount'],
        properties: {
          roundName: { type: 'string' },
          roundType: {
            type: 'string',
            enum: ['pre_seed', 'seed', 'series_a', 'convertible', 'seis', 'eis', 'grant', 'rbf', 'community']
          },
          targetAmount: { type: 'number', minimum: 0 },
          minimumAmount: { type: 'number' },
          maximumAmount: { type: 'number' },
          preMoneyValuation: { type: 'number' },
          sharePrice: { type: 'number' },
          discount: { type: 'number', minimum: 0, maximum: 100 },
          valuationCap: { type: 'number' },
        },
      },
    },
    preHandler: [app.authenticate, app.requireCompanyAdmin],
    handler: async (request, reply) => {
      const round = await nexus.createFundingRound(
        request.params.companyId,
        request.body
      );
      return reply.code(201).send(round);
    },
  });

  // Record investment
  app.post('/funding-rounds/:roundId/investments', {
    schema: {
      params: {
        type: 'object',
        properties: {
          roundId: { type: 'string', format: 'uuid' },
        },
      },
      body: {
        type: 'object',
        required: ['investorId', 'amount'],
        properties: {
          investorId: { type: 'string', format: 'uuid' },
          amount: { type: 'number', minimum: 1 },
          claimSeis: { type: 'boolean', default: false },
          claimEis: { type: 'boolean', default: false },
          source: { type: 'string' },
          introductionId: { type: 'string', format: 'uuid' },
        },
      },
    },
    preHandler: [app.authenticate, app.requireRoundAccess],
    handler: async (request, reply) => {
      const investment = await nexus.recordInvestment(
        request.params.roundId,
        request.body
      );
      return reply.code(201).send(investment);
    },
  });

  // ==========================================================================
  // GRANTS
  // ==========================================================================

  // Find matching grants
  app.get('/companies/:companyId/grant-matches', {
    preHandler: [app.authenticate, app.requireCompanyAccess],
    handler: async (request) => {
      return nexus.matchGrants(request.params.companyId);
    },
  });

  // ==========================================================================
  // RBF
  // ==========================================================================

  // Apply for RBF
  app.post('/companies/:companyId/rbf-applications', {
    schema: {
      body: {
        type: 'object',
        required: ['provider', 'amount'],
        properties: {
          provider: { 
            type: 'string',
            enum: ['clearco', 'wayflyer', 'uncapped', 'outfund']
          },
          amount: { type: 'number', minimum: 10000 },
        },
      },
    },
    preHandler: [app.authenticate, app.requireCompanyAdmin],
    handler: async (request, reply) => {
      const application = await nexus.applyForRbf(
        request.params.companyId,
        request.body
      );
      return reply.code(201).send(application);
    },
  });

  // ==========================================================================
  // TRUST SCORE
  // ==========================================================================

  // Get my trust score
  app.get('/trust-score', {
    preHandler: [app.authenticate],
    handler: async (request) => {
      return nexus.calculateTrustScore(request.user.id);
    },
  });

  // Get user's public trust score
  app.get('/users/:userId/trust-score', {
    handler: async (request) => {
      const score = await nexus.getPublicTrustScore(request.params.userId);
      return {
        tier: score.tier,
        overall: Math.round(score.overallScore),
        // Don't expose component scores publicly
      };
    },
  });
}
```


---

# 8. PULSE

## 8.1 Overview

Pulse is the messaging nervous system of Genesis Engine - making the entire platform accessible via SMS, WhatsApp, Telegram, and other messaging channels.

## 8.2 Pulse Service

**Port:** 3005

### 8.2.1 Core Implementation

```typescript
// services/pulse.service.ts

import Twilio from 'twilio';
import { KnowledgeGraphService } from './knowledge-graph.service';
import { AIService } from './ai.service';

export class PulseService {
  private twilio: Twilio.Twilio;
  
  constructor(
    private readonly kg: KnowledgeGraphService,
    private readonly ai: AIService,
    private readonly db: Database,
    private readonly queue: QueueService,
    private readonly config: Config
  ) {
    this.twilio = Twilio(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);
  }

  // =========================================================================
  // MESSAGE HANDLING
  // =========================================================================

  async handleIncomingMessage(
    channel: Channel,
    channelIdentifier: string,
    message: IncomingMessage
  ): Promise<void> {
    // Find or create conversation
    const conversation = await this.findOrCreateConversation(
      channel,
      channelIdentifier
    );

    // Store incoming message
    const storedMessage = await this.db.pulseMessages.create({
      conversationId: conversation.id,
      userId: conversation.userId,
      direction: 'inbound',
      messageType: message.type,
      content: message.content,
      mediaUrl: message.mediaUrl,
      mediaType: message.mediaType,
      externalId: message.externalId,
    });

    // Process message asynchronously
    await this.queue.add('pulse:process', {
      messageId: storedMessage.id,
      conversationId: conversation.id,
      userId: conversation.userId,
      companyId: conversation.companyId,
    }, {
      priority: 1, // High priority for user-facing
    });

    // Emit event
    await this.events.emit('message.received', {
      messageId: storedMessage.id,
      userId: conversation.userId,
      channel,
      content: message.content,
    });
  }

  async processMessage(messageId: string): Promise<void> {
    const message = await this.db.pulseMessages.findById(messageId);
    if (!message) return;

    const conversation = await this.db.pulseConversations.findById(message.conversationId);
    const user = await this.db.users.findById(message.userId);
    
    try {
      // Step 1: Transcribe if voice
      if (message.messageType === 'voice') {
        const transcription = await this.transcribeVoice(message.mediaUrl);
        await this.db.pulseMessages.update(messageId, {
          transcription: transcription.text,
          transcriptionConfidence: transcription.confidence,
        });
        message.transcription = transcription.text;
      }

      // Step 2: Extract text content
      const textContent = message.transcription || message.content;
      if (!textContent) return;

      // Step 3: Detect intent
      const intent = await this.detectIntent(textContent, conversation);
      await this.db.pulseMessages.update(messageId, {
        detectedIntent: intent.intent,
        intentConfidence: intent.confidence,
        extractedEntities: intent.entities,
      });

      // Step 4: Get user preferences
      const preferences = await this.getUserPreferences(user.id);

      // Step 5: Get company context
      const context = conversation.companyId
        ? await this.kg.getCompanyContext(conversation.companyId)
        : null;

      // Step 6: Generate response based on intent
      const response = await this.generateResponse(
        intent,
        textContent,
        user,
        preferences,
        context,
        conversation
      );

      // Step 7: Execute any actions
      if (response.action) {
        await this.executeAction(response.action, user, conversation.companyId);
      }

      // Step 8: Send response
      await this.sendMessage(conversation, {
        type: 'text',
        content: response.message,
        responseToId: messageId,
      });

      // Step 9: Update conversation context
      await this.updateConversationContext(conversation, intent, response);

      // Mark as processed
      await this.db.pulseMessages.update(messageId, {
        processed: true,
        processingResult: {
          intent,
          response: response.message,
          action: response.action,
        },
      });

    } catch (error) {
      console.error('Message processing error:', error);
      
      // Send error response
      await this.sendMessage(conversation, {
        type: 'text',
        content: "Sorry, I had trouble processing that. Could you try again?",
        responseToId: messageId,
      });

      await this.db.pulseMessages.update(messageId, {
        processed: true,
        processingResult: { error: error.message },
      });
    }
  }

  // =========================================================================
  // INTENT DETECTION
  // =========================================================================

  private async detectIntent(
    text: string,
    conversation: PulseConversation
  ): Promise<DetectedIntent> {
    // Check for pending action response
    if (conversation.pendingAction) {
      const actionIntent = this.checkPendingActionResponse(text, conversation.pendingAction);
      if (actionIntent) return actionIntent;
    }

    // Use AI to detect intent
    const prompt = `
      Classify the intent of this message from a startup founder using Genesis Engine.
      
      Message: "${text}"
      
      Previous context: ${JSON.stringify(conversation.currentContext)}
      
      Possible intents:
      - query_financial: Asking about financials (cash, burn, runway, revenue)
      - query_compliance: Asking about deadlines, filings, legal matters
      - query_tasks: Asking about tasks, to-dos
      - query_general: General question about their business
      - command_create_task: Wants to create a task
      - command_send_email: Wants to send an email
      - command_schedule_meeting: Wants to schedule something
      - command_generate_document: Wants a document created
      - command_log_idea: Sharing an idea to log
      - approval_yes: Approving a pending action
      - approval_no: Declining a pending action
      - approval_edit: Wants to edit before approving
      - greeting: Just saying hello
      - feedback: Giving feedback on previous response
      - other: Doesn't fit other categories
      
      Also extract any entities (names, dates, amounts, companies).
      
      Return JSON: {
        intent: string,
        confidence: number (0-1),
        entities: { [key: string]: any },
        requiresFollowUp: boolean,
        followUpQuestion?: string
      }
    `;

    const result = await this.ai.generate({
      prompt,
      model: 'fast',
      format: 'json',
    });

    return JSON.parse(result.content);
  }

  private checkPendingActionResponse(
    text: string,
    pendingAction: PendingAction
  ): DetectedIntent | null {
    const normalised = text.toLowerCase().trim();
    
    // Check for approval
    const approvalWords = ['yes', 'y', 'ok', 'okay', 'approve', 'send', 'do it', 'go', 'confirmed', '👍'];
    if (approvalWords.some(w => normalised === w || normalised.startsWith(w))) {
      return {
        intent: 'approval_yes',
        confidence: 0.95,
        entities: { actionId: pendingAction.id },
        requiresFollowUp: false,
      };
    }

    // Check for decline
    const declineWords = ['no', 'n', 'cancel', 'stop', 'don\'t', 'nope', '👎'];
    if (declineWords.some(w => normalised === w || normalised.startsWith(w))) {
      return {
        intent: 'approval_no',
        confidence: 0.95,
        entities: { actionId: pendingAction.id },
        requiresFollowUp: false,
      };
    }

    // Check for edit
    const editWords = ['edit', 'change', 'modify', 'update'];
    if (editWords.some(w => normalised.includes(w))) {
      return {
        intent: 'approval_edit',
        confidence: 0.9,
        entities: { actionId: pendingAction.id },
        requiresFollowUp: true,
      };
    }

    return null; // Not a response to pending action
  }

  // =========================================================================
  // RESPONSE GENERATION
  // =========================================================================

  private async generateResponse(
    intent: DetectedIntent,
    originalText: string,
    user: User,
    preferences: PulseUserPreferences,
    context: CompanyContext | null,
    conversation: PulseConversation
  ): Promise<GeneratedResponse> {
    switch (intent.intent) {
      case 'query_financial':
        return this.handleFinancialQuery(originalText, context, preferences);
      
      case 'query_compliance':
        return this.handleComplianceQuery(originalText, context, preferences);
      
      case 'query_tasks':
        return this.handleTaskQuery(originalText, context, preferences);
      
      case 'query_general':
        return this.handleGeneralQuery(originalText, context, preferences);
      
      case 'command_create_task':
        return this.handleCreateTask(originalText, intent.entities, user, context);
      
      case 'command_send_email':
        return this.handleSendEmail(originalText, intent.entities, user, context);
      
      case 'command_schedule_meeting':
        return this.handleScheduleMeeting(originalText, intent.entities, user);
      
      case 'command_generate_document':
        return this.handleGenerateDocument(originalText, intent.entities, context);
      
      case 'command_log_idea':
        return this.handleLogIdea(originalText, user, context);
      
      case 'approval_yes':
        return this.executeApprovedAction(conversation.pendingAction);
      
      case 'approval_no':
        return this.cancelPendingAction(conversation.pendingAction);
      
      case 'approval_edit':
        return this.requestActionEdit(conversation.pendingAction);
      
      case 'greeting':
        return this.generateGreeting(user, context, preferences);
      
      default:
        return this.handleUnknownIntent(originalText, context, preferences);
    }
  }

  private async handleFinancialQuery(
    query: string,
    context: CompanyContext | null,
    preferences: PulseUserPreferences
  ): Promise<GeneratedResponse> {
    if (!context) {
      return {
        message: "I don't have a company linked to this conversation. Which company would you like to ask about?",
        requiresFollowUp: true,
      };
    }

    // Get financial data
    const financials = await this.getCompanyFinancials(context.company.id);

    const prompt = `
      Answer this financial question for ${context.company.name}.
      
      Question: "${query}"
      
      Financial Data:
      - Cash Balance: £${financials.cashBalance?.toLocaleString() || 'Unknown'}
      - Monthly Burn: £${financials.monthlyBurn?.toLocaleString() || 'Unknown'}
      - Runway: ${financials.runwayMonths || 'Unknown'} months
      - MRR: £${financials.mrr?.toLocaleString() || 'Unknown'}
      - ARR: £${financials.arr?.toLocaleString() || 'Unknown'}
      - Revenue (YTD): £${financials.revenueYtd?.toLocaleString() || 'Unknown'}
      
      Upcoming payments:
      ${financials.upcomingPayments?.map(p => `- ${p.description}: £${p.amount} due ${p.dueDate}`).join('\n') || 'None scheduled'}
      
      Outstanding receivables:
      ${financials.outstandingReceivables?.map(r => `- ${r.customer}: £${r.amount} (${r.daysOverdue} days overdue)`).join('\n') || 'None'}
      
      User preferences:
      - Response style: ${preferences.preferredResponseLength}
      - Format: ${preferences.preferredFormat}
      
      Provide a helpful, accurate response. If suggesting actions, be specific.
      Keep it ${preferences.preferredResponseLength === 'brief' ? 'very short (1-2 sentences)' : 'concise but complete'}.
    `;

    const result = await this.ai.generate({
      prompt,
      model: 'fast',
    });

    return {
      message: result.content,
    };
  }

  private async handleCreateTask(
    text: string,
    entities: Record<string, any>,
    user: User,
    context: CompanyContext | null
  ): Promise<GeneratedResponse> {
    // Extract task details from text
    const prompt = `
      Extract task details from this message:
      "${text}"
      
      Return JSON: {
        title: string,
        description: string | null,
        dueDate: string | null (ISO date),
        priority: "low" | "medium" | "high" | "urgent",
        category: string | null
      }
    `;

    const extraction = await this.ai.generate({
      prompt,
      model: 'fast',
      format: 'json',
    });

    const taskData = JSON.parse(extraction.content);

    // Create the task
    const task = await this.db.tasks.create({
      companyId: context?.company.id,
      userId: user.id,
      createdBy: user.id,
      title: taskData.title,
      description: taskData.description,
      dueDate: taskData.dueDate ? new Date(taskData.dueDate) : null,
      priority: taskData.priority,
      category: taskData.category,
      source: 'pulse',
      status: 'pending',
    });

    const dueText = taskData.dueDate
      ? ` (due ${new Date(taskData.dueDate).toLocaleDateString('en-GB')})`
      : '';

    return {
      message: `✓ Task created: "${taskData.title}"${dueText}`,
      action: {
        type: 'task_created',
        taskId: task.id,
      },
    };
  }

  private async handleLogIdea(
    text: string,
    user: User,
    context: CompanyContext | null
  ): Promise<GeneratedResponse> {
    // Extract and structure the idea
    const prompt = `
      Extract and structure this idea from a founder:
      "${text}"
      
      Return JSON: {
        title: string (concise title, max 50 chars),
        description: string (the full idea, cleaned up),
        category: string | null (product, marketing, operations, etc.),
        relatedTo: string[] (extract any mentioned entities/topics)
      }
    `;

    const extraction = await this.ai.generate({
      prompt,
      model: 'fast',
      format: 'json',
    });

    const ideaData = JSON.parse(extraction.content);

    // Create idea in knowledge graph
    const idea = await this.kg.createEntity('Idea', {
      company_id: context?.company.id,
      user_id: user.id,
      title: ideaData.title,
      description: ideaData.description,
      category: ideaData.category,
      source: 'pulse',
      status: 'raw',
    });

    // Link to related entities if any
    for (const related of ideaData.relatedTo) {
      const matches = await this.kg.semanticSearch(
        related,
        context?.company.id,
        { limit: 1 }
      );
      if (matches.length > 0) {
        await this.kg.createRelationship(
          'Idea', idea.id,
          'RELATES_TO',
          matches[0].entityType, matches[0].entityId
        );
      }
    }

    return {
      message: `💡 Logged: "${ideaData.title}"\n\nI've added this to your ideas and linked it to relevant context.`,
      action: {
        type: 'idea_logged',
        ideaId: idea.id,
      },
    };
  }

  // =========================================================================
  // OUTBOUND MESSAGING
  // =========================================================================

  async sendMessage(
    conversation: PulseConversation,
    message: OutboundMessage
  ): Promise<PulseMessage> {
    // Store message
    const storedMessage = await this.db.pulseMessages.create({
      conversationId: conversation.id,
      userId: conversation.userId,
      direction: 'outbound',
      messageType: message.type,
      content: message.content,
      mediaUrl: message.mediaUrl,
      responseToId: message.responseToId,
    });

    // Send via appropriate channel
    try {
      const externalId = await this.sendViaChannel(
        conversation.channel,
        conversation.channelIdentifier,
        message
      );

      await this.db.pulseMessages.update(storedMessage.id, {
        externalId,
        externalStatus: 'sent',
      });

      // Update conversation
      await this.db.pulseConversations.update(conversation.id, {
        messagesCount: conversation.messagesCount + 1,
        lastMessageAt: new Date(),
        lastPulseMessageAt: new Date(),
      });

      // Emit event
      await this.events.emit('message.sent', {
        messageId: storedMessage.id,
        userId: conversation.userId,
        channel: conversation.channel,
      });

    } catch (error) {
      await this.db.pulseMessages.update(storedMessage.id, {
        externalStatus: 'failed',
        errorCode: error.code,
        errorMessage: error.message,
      });
      throw error;
    }

    return storedMessage;
  }

  private async sendViaChannel(
    channel: Channel,
    identifier: string,
    message: OutboundMessage
  ): Promise<string> {
    switch (channel) {
      case 'sms':
        return this.sendSms(identifier, message);
      case 'whatsapp':
        return this.sendWhatsApp(identifier, message);
      case 'telegram':
        return this.sendTelegram(identifier, message);
      default:
        throw new Error(`Unsupported channel: ${channel}`);
    }
  }

  private async sendSms(to: string, message: OutboundMessage): Promise<string> {
    const result = await this.twilio.messages.create({
      to,
      from: this.config.TWILIO_PHONE_NUMBER,
      body: message.content,
      ...(message.mediaUrl && { mediaUrl: [message.mediaUrl] }),
    });
    return result.sid;
  }

  private async sendWhatsApp(to: string, message: OutboundMessage): Promise<string> {
    const result = await this.twilio.messages.create({
      to: `whatsapp:${to}`,
      from: `whatsapp:${this.config.TWILIO_WHATSAPP_NUMBER}`,
      body: message.content,
      ...(message.mediaUrl && { mediaUrl: [message.mediaUrl] }),
    });
    return result.sid;
  }

  // =========================================================================
  // SCHEDULED MESSAGES
  // =========================================================================

  async sendMorningBriefing(userId: string): Promise<void> {
    const user = await this.db.users.findById(userId);
    if (!user || !user.pulseEnabled) return;

    const conversation = await this.getActiveConversation(userId);
    if (!conversation) return;

    // Get user's primary company
    const companyMember = await this.db.companyMembers.findPrimaryForUser(userId);
    if (!companyMember) return;

    const context = await this.kg.getCompanyContext(companyMember.companyId);
    const financials = await this.getCompanyFinancials(companyMember.companyId);
    const tasks = await this.db.tasks.findDueToday(companyMember.companyId, userId);
    const deadlines = await this.db.complianceDeadlines.findUpcoming(
      companyMember.companyId,
      7 // Next 7 days
    );
    const calendar = await this.getCalendarForToday(userId);

    // Generate briefing
    const prompt = `
      Generate a concise morning briefing for ${user.firstName || 'the founder'}.
      
      Company: ${context.company.name}
      
      Financial Snapshot:
      - Cash: £${financials.cashBalance?.toLocaleString() || 'N/A'}
      - Runway: ${financials.runwayMonths || 'N/A'} months
      
      Today's Calendar:
      ${calendar.map(e => `- ${e.time}: ${e.title}`).join('\n') || 'No meetings'}
      
      Tasks Due Today:
      ${tasks.map(t => `- ${t.title}`).join('\n') || 'None'}
      
      Upcoming Deadlines (7 days):
      ${deadlines.map(d => `- ${d.title} (${d.dueDate})`).join('\n') || 'None'}
      
      Keep it brief and friendly. Use bullet points sparingly.
      Start with a brief greeting appropriate to the time.
      Highlight anything urgent.
    `;

    const briefing = await this.ai.generate({
      prompt,
      model: 'fast',
    });

    await this.sendMessage(conversation, {
      type: 'text',
      content: briefing.content,
    });
  }

  async sendMeetingPrep(userId: string, meetingId: string): Promise<void> {
    const user = await this.db.users.findById(userId);
    if (!user || !user.pulseEnabled) return;

    const meeting = await this.getCalendarEvent(meetingId);
    if (!meeting) return;

    const conversation = await this.getActiveConversation(userId);
    if (!conversation) return;

    // Get context about attendees
    const attendeeContext = await Promise.all(
      meeting.attendees.map(async (email: string) => {
        const contact = await this.db.contacts.findByEmail(email);
        if (contact) {
          const kg = await this.kg.getPersonContext(contact.knowledgeGraphId);
          return { email, contact, context: kg };
        }
        return { email };
      })
    );

    // Generate prep
    const prompt = `
      Generate a quick meeting prep for ${user.firstName}.
      
      Meeting: ${meeting.title}
      Time: ${meeting.start}
      Duration: ${meeting.duration} minutes
      
      Attendees:
      ${attendeeContext.map(a => 
        a.contact 
          ? `- ${a.contact.firstName} ${a.contact.lastName} (${a.contact.jobTitle || 'Unknown role'} at ${a.contact.contactCompanyName || 'Unknown company'})`
          : `- ${a.email}`
      ).join('\n')}
      
      ${attendeeContext.some(a => a.context) ? `
      Context from previous interactions:
      ${attendeeContext.filter(a => a.context).map(a => 
        `${a.contact?.firstName}: ${JSON.stringify(a.context)}`
      ).join('\n')}
      ` : ''}
      
      Provide:
      1. Key points to remember about attendees
      2. Any follow-ups from previous interactions
      3. Suggested talking points
      
      Keep it concise - they're about to join the call.
    `;

    const prep = await this.ai.generate({
      prompt,
      model: 'fast',
    });

    await this.sendMessage(conversation, {
      type: 'text',
      content: `📅 Your meeting with ${meeting.attendees[0]} starts in 30 minutes.\n\n${prep.content}`,
    });
  }

  // =========================================================================
  // USER PREFERENCES LEARNING
  // =========================================================================

  private async updateUserPreferences(
    userId: string,
    message: PulseMessage,
    response: GeneratedResponse
  ): Promise<void> {
    const preferences = await this.getUserPreferences(userId);

    // Update terminology map from message
    const terminology = await this.extractTerminology(message.content);
    if (Object.keys(terminology).length > 0) {
      preferences.terminologyMap = {
        ...preferences.terminologyMap,
        ...terminology,
      };
    }

    // Track activity patterns
    const hour = new Date().getHours();
    if (!preferences.mostActiveHours.includes(hour)) {
      preferences.mostActiveHours = [
        ...preferences.mostActiveHours,
        hour,
      ].slice(-20); // Keep last 20
    }

    await this.db.pulseUserPreferences.update(preferences.id, preferences);
  }

  private async extractTerminology(
    text: string
  ): Promise<Record<string, string>> {
    // Look for quoted references or shorthand
    const patterns = [
      /"([^"]+)"/g, // Quoted terms
      /(?:called?|named?|the)\s+(\w+)/gi, // "called X", "named X", "the X"
    ];

    const terms: Record<string, string> = {};
    
    for (const pattern of patterns) {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        const term = match[1].toLowerCase();
        if (term.length >= 2 && term.length <= 20) {
          // Will be mapped to actual entity by AI in context
          terms[term] = 'pending_resolution';
        }
      }
    }

    return terms;
  }
}
```

### 8.2.2 Pulse Webhook Handlers

```typescript
// routes/pulse-webhooks.routes.ts

import { FastifyInstance } from 'fastify';
import { PulseService } from '../services/pulse.service';
import crypto from 'crypto';

export async function pulseWebhookRoutes(app: FastifyInstance) {
  const pulse = app.diContainer.resolve<PulseService>('pulseService');

  // Twilio SMS webhook
  app.post('/webhooks/twilio/sms', {
    config: {
      rawBody: true, // Need raw body for signature verification
    },
    preHandler: [verifyTwilioSignature],
    handler: async (request, reply) => {
      const { From, Body, MessageSid, MediaUrl0, MediaContentType0 } = request.body;

      await pulse.handleIncomingMessage('sms', From, {
        type: MediaUrl0 ? 'image' : 'text',
        content: Body,
        mediaUrl: MediaUrl0,
        mediaType: MediaContentType0,
        externalId: MessageSid,
      });

      // Twilio expects TwiML response
      reply.header('Content-Type', 'text/xml');
      return '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';
    },
  });

  // Twilio WhatsApp webhook
  app.post('/webhooks/twilio/whatsapp', {
    config: { rawBody: true },
    preHandler: [verifyTwilioSignature],
    handler: async (request, reply) => {
      const { From, Body, MessageSid, MediaUrl0, MediaContentType0 } = request.body;
      
      // Remove whatsapp: prefix
      const phoneNumber = From.replace('whatsapp:', '');

      await pulse.handleIncomingMessage('whatsapp', phoneNumber, {
        type: MediaUrl0 
          ? (MediaContentType0?.startsWith('audio') ? 'voice' : 'image')
          : 'text',
        content: Body,
        mediaUrl: MediaUrl0,
        mediaType: MediaContentType0,
        externalId: MessageSid,
      });

      reply.header('Content-Type', 'text/xml');
      return '<?xml version="1.0" encoding="UTF-8"?><Response></Response>';
    },
  });

  // Twilio status callback
  app.post('/webhooks/twilio/status', {
    config: { rawBody: true },
    preHandler: [verifyTwilioSignature],
    handler: async (request) => {
      const { MessageSid, MessageStatus, ErrorCode, ErrorMessage } = request.body;

      await pulse.updateMessageStatus(MessageSid, {
        status: MessageStatus,
        errorCode: ErrorCode,
        errorMessage: ErrorMessage,
      });

      return { success: true };
    },
  });

  // Telegram webhook
  app.post('/webhooks/telegram', {
    preHandler: [verifyTelegramSignature],
    handler: async (request) => {
      const { message } = request.body;
      if (!message) return { ok: true };

      const chatId = message.chat.id.toString();
      const text = message.text || message.caption;
      const voiceFileId = message.voice?.file_id;

      let messageType: 'text' | 'voice' | 'image' = 'text';
      let mediaUrl: string | undefined;

      if (voiceFileId) {
        messageType = 'voice';
        mediaUrl = await pulse.getTelegramFileUrl(voiceFileId);
      } else if (message.photo) {
        messageType = 'image';
        const photo = message.photo[message.photo.length - 1];
        mediaUrl = await pulse.getTelegramFileUrl(photo.file_id);
      }

      await pulse.handleIncomingMessage('telegram', chatId, {
        type: messageType,
        content: text,
        mediaUrl,
        externalId: message.message_id.toString(),
      });

      return { ok: true };
    },
  });
}

// Signature verification middleware
async function verifyTwilioSignature(request: any, reply: any) {
  const signature = request.headers['x-twilio-signature'];
  const url = `${request.protocol}://${request.hostname}${request.url}`;
  const params = request.body;

  const expectedSignature = crypto
    .createHmac('sha1', process.env.TWILIO_AUTH_TOKEN!)
    .update(url + Object.keys(params).sort().map(k => k + params[k]).join(''))
    .digest('base64');

  if (signature !== expectedSignature) {
    reply.code(401).send({ error: 'Invalid signature' });
    return;
  }
}
```

### 8.2.3 Pulse Workers

```typescript
// workers/pulse.worker.ts

import { Worker, Job } from 'bullmq';
import { PulseService } from '../services/pulse.service';

export function createPulseWorkers(pulse: PulseService, redis: Redis) {
  // Message processing worker
  const processWorker = new Worker(
    'pulse:process',
    async (job: Job) => {
      const { messageId } = job.data;
      await pulse.processMessage(messageId);
    },
    {
      connection: redis,
      concurrency: 10,
      limiter: {
        max: 50,
        duration: 1000,
      },
    }
  );

  // Scheduled message worker
  const scheduledWorker = new Worker(
    'pulse:scheduled',
    async (job: Job) => {
      const { messageId } = job.data;
      await pulse.sendScheduledMessage(messageId);
    },
    {
      connection: redis,
      concurrency: 5,
    }
  );

  // Morning briefing worker (triggered by cron)
  const briefingWorker = new Worker(
    'pulse:morning-briefing',
    async (job: Job) => {
      const { userId } = job.data;
      await pulse.sendMorningBriefing(userId);
    },
    {
      connection: redis,
      concurrency: 20,
    }
  );

  // Meeting prep worker
  const meetingPrepWorker = new Worker(
    'pulse:meeting-prep',
    async (job: Job) => {
      const { userId, meetingId } = job.data;
      await pulse.sendMeetingPrep(userId, meetingId);
    },
    {
      connection: redis,
      concurrency: 10,
    }
  );

  // Error handlers
  [processWorker, scheduledWorker, briefingWorker, meetingPrepWorker].forEach(worker => {
    worker.on('failed', (job, err) => {
      console.error(`Pulse job ${job?.id} failed:`, err);
      // Report to Sentry
    });
  });

  return {
    processWorker,
    scheduledWorker,
    briefingWorker,
    meetingPrepWorker,
  };
}
```


---

# 9. AI SERVICE

## 9.1 AI Service Implementation

```typescript
// services/ai.service.ts

import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export class AIService {
  private openai: OpenAI;
  private anthropic: Anthropic;
  
  constructor(private readonly config: Config) {
    this.openai = new OpenAI({ apiKey: config.OPENAI_API_KEY });
    this.anthropic = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });
  }

  async generate(params: GenerateParams): Promise<GenerateResult> {
    const model = this.resolveModel(params.model);
    const startTime = Date.now();

    try {
      if (model.provider === 'openai') {
        return await this.generateOpenAI(params, model);
      } else if (model.provider === 'anthropic') {
        return await this.generateAnthropic(params, model);
      }
      throw new Error(`Unknown provider: ${model.provider}`);
    } finally {
      // Track usage
      await this.trackUsage(params, model, Date.now() - startTime);
    }
  }

  async research(params: ResearchParams): Promise<ResearchResult> {
    const results: ResearchResult = {
      content: '',
      sources: [],
    };

    // Search knowledge graph first
    if (params.sources.includes('knowledge_graph') && params.companyId) {
      const kgResults = await this.kg.semanticSearch(
        params.prompt,
        params.companyId,
        { limit: 5 }
      );
      results.sources.push(...kgResults.map(r => ({
        type: 'knowledge_graph',
        id: r.entityId,
        content: r.content,
        score: r.score,
      })));
    }

    // Search web if needed
    if (params.sources.includes('web')) {
      const webResults = await this.searchWeb(params.prompt);
      results.sources.push(...webResults.map(r => ({
        type: 'web',
        url: r.url,
        title: r.title,
        content: r.snippet,
      })));
    }

    // Generate response with context
    const contextPrompt = `
      ${params.prompt}
      
      Use the following sources to inform your response:
      
      ${results.sources.map((s, i) => `
      Source ${i + 1} (${s.type}):
      ${s.content}
      `).join('\n')}
      
      Cite sources where relevant.
    `;

    const response = await this.generate({
      prompt: contextPrompt,
      model: params.model || 'default',
      maxTokens: params.maxTokens || 4000,
    });

    results.content = response.content;
    return results;
  }

  private async generateOpenAI(
    params: GenerateParams,
    model: ResolvedModel
  ): Promise<GenerateResult> {
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'user', content: params.prompt },
    ];

    if (params.systemPrompt) {
      messages.unshift({ role: 'system', content: params.systemPrompt });
    }

    const completion = await this.openai.chat.completions.create({
      model: model.name,
      messages,
      max_tokens: params.maxTokens || 2000,
      temperature: params.temperature ?? 0.7,
      ...(params.format === 'json' && {
        response_format: { type: 'json_object' },
      }),
    });

    return {
      content: completion.choices[0].message.content || '',
      usage: {
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
      },
      model: model.name,
    };
  }

  private async generateAnthropic(
    params: GenerateParams,
    model: ResolvedModel
  ): Promise<GenerateResult> {
    const message = await this.anthropic.messages.create({
      model: model.name,
      max_tokens: params.maxTokens || 2000,
      system: params.systemPrompt,
      messages: [
        { role: 'user', content: params.prompt },
      ],
    });

    const textContent = message.content.find(c => c.type === 'text');

    return {
      content: textContent?.text || '',
      usage: {
        promptTokens: message.usage.input_tokens,
        completionTokens: message.usage.output_tokens,
        totalTokens: message.usage.input_tokens + message.usage.output_tokens,
      },
      model: model.name,
    };
  }

  private resolveModel(modelKey?: string): ResolvedModel {
    const key = modelKey || 'default';
    
    const models: Record<string, ResolvedModel> = {
      default: { 
        provider: 'anthropic', 
        name: this.config.ANTHROPIC_MODEL_DEFAULT 
      },
      fast: { 
        provider: 'anthropic', 
        name: this.config.ANTHROPIC_MODEL_FAST 
      },
      'openai-default': { 
        provider: 'openai', 
        name: this.config.OPENAI_MODEL_DEFAULT 
      },
      'openai-fast': { 
        provider: 'openai', 
        name: this.config.OPENAI_MODEL_FAST 
      },
    };

    return models[key] || models.default;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: this.config.OPENAI_MODEL_EMBEDDING,
      input: text,
    });
    return response.data[0].embedding;
  }

  async transcribeAudio(audioUrl: string): Promise<TranscriptionResult> {
    // Download audio
    const response = await fetch(audioUrl);
    const audioBuffer = await response.arrayBuffer();

    const transcription = await this.openai.audio.transcriptions.create({
      file: new File([audioBuffer], 'audio.ogg', { type: 'audio/ogg' }),
      model: 'whisper-1',
      response_format: 'verbose_json',
    });

    return {
      text: transcription.text,
      confidence: 0.95, // Whisper doesn't return confidence
      language: transcription.language,
      duration: transcription.duration,
    };
  }
}
```

---

# 10. API SPECIFICATIONS

## 10.1 API Gateway

### 10.1.1 Main Application Entry

```typescript
// app.ts

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { loadConfig } from './config/loader';
import { createContainer } from './container';
import { authRoutes } from './routes/auth.routes';
import { companyRoutes } from './routes/company.routes';
import { nexusRoutes } from './routes/nexus.routes';
import { pulseWebhookRoutes } from './routes/pulse-webhooks.routes';
import { errorHandler } from './middleware/error-handler';
import { requestLogger } from './middleware/request-logger';

export async function buildApp() {
  const config = loadConfig();
  
  const app = Fastify({
    logger: {
      level: config.NODE_ENV === 'production' ? 'info' : 'debug',
      transport: config.NODE_ENV !== 'production' 
        ? { target: 'pino-pretty' }
        : undefined,
    },
    trustProxy: true,
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'requestId',
  });

  // Security
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  });

  // CORS
  await app.register(cors, {
    origin: config.CORS_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  });

  // Rate limiting
  await app.register(rateLimit, {
    global: true,
    max: config.RATE_LIMIT_MAX_REQUESTS,
    timeWindow: config.RATE_LIMIT_WINDOW_MS,
    keyGenerator: (request) => {
      return request.user?.id || request.ip;
    },
    errorResponseBuilder: (request, context) => ({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Retry after ${context.after}`,
      statusCode: 429,
      retryAfter: context.after,
    }),
  });

  // Swagger documentation
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Genesis Engine API',
        description: 'Complete API for Genesis Engine platform',
        version: config.APP_VERSION,
      },
      servers: [
        { url: config.API_URL, description: 'Production' },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: true,
    },
  });

  // Dependency injection container
  const container = await createContainer(config);
  app.decorate('diContainer', container);
  app.decorate('config', config);

  // Custom middleware
  app.addHook('onRequest', requestLogger);
  app.setErrorHandler(errorHandler);

  // Authentication decorator
  app.decorate('authenticate', async (request: any, reply: any) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader?.startsWith('Bearer ')) {
        throw new Error('Missing authorization header');
      }
      const token = authHeader.substring(7);
      const authService = container.resolve('authService');
      request.user = await authService.verifyToken(token);
    } catch (error) {
      reply.code(401).send({ error: 'Unauthorized' });
    }
  });

  // Routes
  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(companyRoutes, { prefix: '/companies' });
  await app.register(nexusRoutes, { prefix: '/nexus' });
  await app.register(pulseWebhookRoutes, { prefix: '/webhooks/pulse' });

  // Health check
  app.get('/health', async () => ({
    status: 'healthy',
    version: config.APP_VERSION,
    timestamp: new Date().toISOString(),
  }));

  // Readiness check (for Kubernetes)
  app.get('/ready', async () => {
    const checks = await container.resolve('healthService').runChecks();
    const allHealthy = Object.values(checks).every(c => c.healthy);
    
    if (!allHealthy) {
      throw { statusCode: 503, message: 'Service not ready', checks };
    }
    
    return { status: 'ready', checks };
  });

  return app;
}

// Start server
async function main() {
  const app = await buildApp();
  const port = parseInt(process.env.PORT || '3000');
  
  try {
    await app.listen({ port, host: '0.0.0.0' });
    console.log(`Server running on port ${port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

main();
```

### 10.1.2 GraphQL Schema

```typescript
// graphql/schema.ts

import { makeExecutableSchema } from '@graphql-tools/schema';

const typeDefs = `#graphql
  scalar DateTime
  scalar JSON
  scalar UUID

  type Query {
    # User
    me: User!
    user(id: UUID!): User
    
    # Company
    company(id: UUID!): Company
    myCompanies: [Company!]!
    
    # Tasks
    tasks(companyId: UUID!, status: TaskStatus, limit: Int): [Task!]!
    task(id: UUID!): Task
    
    # Documents
    documents(companyId: UUID!, type: String, limit: Int): [Document!]!
    document(id: UUID!): Document
    
    # Financial
    financialSummary(companyId: UUID!): FinancialSummary!
    transactions(companyId: UUID!, from: DateTime, to: DateTime): [Transaction!]!
    
    # Nexus
    investorMatches(companyId: UUID!, limit: Int): [InvestorMatch!]!
    introductionRequests(status: IntroductionStatus): [IntroductionRequest!]!
    trustScore: TrustScore!
    fundingRounds(companyId: UUID!): [FundingRound!]!
    
    # Search
    search(query: String!, companyId: UUID, types: [String!]): [SearchResult!]!
  }

  type Mutation {
    # Auth
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    refreshToken(refreshToken: String!): TokenPayload!
    
    # Company
    createCompany(input: CreateCompanyInput!): Company!
    updateCompany(id: UUID!, input: UpdateCompanyInput!): Company!
    
    # Tasks
    createTask(input: CreateTaskInput!): Task!
    updateTask(id: UUID!, input: UpdateTaskInput!): Task!
    completeTask(id: UUID!): Task!
    
    # Documents
    generateDocument(input: GenerateDocumentInput!): Document!
    signDocument(id: UUID!): Document!
    
    # Nexus
    requestIntroduction(input: RequestIntroductionInput!): IntroductionRequest!
    respondToIntroduction(id: UUID!, accept: Boolean!, message: String): IntroductionRequest!
    createFundingRound(input: CreateFundingRoundInput!): FundingRound!
    recordInvestment(roundId: UUID!, input: RecordInvestmentInput!): Investment!
    
    # Pulse
    sendPulseMessage(conversationId: UUID!, content: String!): PulseMessage!
  }

  type Subscription {
    # Real-time task updates
    taskUpdated(companyId: UUID!): Task!
    
    # Pulse messages
    pulseMessageReceived(conversationId: UUID!): PulseMessage!
    
    # Notifications
    notificationReceived: Notification!
  }

  # Types
  type User {
    id: UUID!
    email: String!
    firstName: String
    lastName: String
    avatarUrl: String
    companies: [CompanyMembership!]!
    trustScore: TrustScore
    pulseEnabled: Boolean!
    createdAt: DateTime!
  }

  type Company {
    id: UUID!
    name: String!
    tradingName: String
    companyNumber: String
    companyType: CompanyType!
    status: CompanyStatus!
    incorporationDate: DateTime
    industry: String
    sector: String
    members: [CompanyMembership!]!
    officers: [Officer!]!
    shareholders: [Shareholder!]!
    documents: [Document!]!
    tasks: [Task!]!
    fundingRounds: [FundingRound!]!
    financialSummary: FinancialSummary!
    complianceDeadlines: [ComplianceDeadline!]!
    createdAt: DateTime!
  }

  type CompanyMembership {
    id: UUID!
    user: User!
    company: Company!
    role: MemberRole!
    title: String
    isFounder: Boolean!
    isDirector: Boolean!
    joinedAt: DateTime!
  }

  type Task {
    id: UUID!
    company: Company!
    assignee: User
    title: String!
    description: String
    taskType: String
    category: String
    priority: Priority!
    status: TaskStatus!
    dueDate: DateTime
    completedAt: DateTime
    isAutomated: Boolean!
    relatedEntities: [JSON!]!
    createdAt: DateTime!
  }

  type Document {
    id: UUID!
    company: Company!
    name: String!
    description: String
    documentType: String!
    category: String
    status: DocumentStatus!
    fileUrl: String!
    version: Int!
    requiresSignature: Boolean!
    signedAt: DateTime
    tags: [String!]!
    createdAt: DateTime!
  }

  type FinancialSummary {
    cashBalance: Float
    monthlyBurn: Float
    runwayMonths: Float
    mrr: Float
    arr: Float
    revenueYtd: Float
    upcomingPayments: [UpcomingPayment!]!
    outstandingReceivables: [OutstandingReceivable!]!
    lastUpdated: DateTime!
  }

  type InvestorMatch {
    investor: User!
    profile: InvestorProfile!
    matchScore: Float!
    reasoning: String!
    portfolioOverlap: Int!
    matchingIndustries: [String!]!
  }

  type InvestorProfile {
    investorType: InvestorType!
    checkSizeMin: Float
    checkSizeMax: Float
    stages: [FundingStage!]!
    sectors: [String!]!
    activelyInvesting: Boolean!
    seisInvestor: Boolean!
    eisInvestor: Boolean!
  }

  type IntroductionRequest {
    id: UUID!
    requester: User!
    target: User!
    introducer: User
    type: IntroductionType!
    message: String
    status: IntroductionStatus!
    matchScore: Float
    expiresAt: DateTime!
    createdAt: DateTime!
  }

  type TrustScore {
    overall: Float!
    tier: TrustTier!
    deliveryScore: Float!
    voucherScore: Float!
    introductionScore: Float!
    responsivenessScore: Float!
    contributionScore: Float!
  }

  type FundingRound {
    id: UUID!
    company: Company!
    roundName: String!
    roundType: FundingType!
    targetAmount: Float!
    amountRaised: Float!
    amountCommitted: Float!
    investorsCount: Int!
    status: FundingStatus!
    seisEligible: Boolean!
    eisEligible: Boolean!
    investments: [Investment!]!
    createdAt: DateTime!
  }

  type Investment {
    id: UUID!
    investor: User!
    amount: Float!
    status: InvestmentStatus!
    seisRelief: Boolean!
    eisRelief: Boolean!
    committedAt: DateTime
    completedAt: DateTime
  }

  type PulseMessage {
    id: UUID!
    direction: MessageDirection!
    messageType: MessageType!
    content: String
    transcription: String
    detectedIntent: String
    actionStatus: String
    createdAt: DateTime!
  }

  # Enums
  enum CompanyType { ltd, plc, llp, partnership, sole_trader, cic, charity }
  enum CompanyStatus { pre_incorporation, active, dormant, dissolved, liquidation }
  enum MemberRole { owner, admin, member, viewer, advisor, investor }
  enum Priority { low, medium, high, urgent }
  enum TaskStatus { pending, in_progress, waiting, completed, cancelled, failed }
  enum DocumentStatus { draft, pending_review, approved, signed, filed, archived }
  enum InvestorType { angel, vc, family_office, corporate, syndicate, crowd }
  enum FundingStage { pre_seed, seed, series_a, series_b, series_c, growth }
  enum IntroductionType { investor, advisor, customer, partner, talent, other }
  enum IntroductionStatus { pending, ai_approved, introducer_approved, target_approved, accepted, declined, expired }
  enum TrustTier { bronze, silver, gold, platinum, diamond }
  enum FundingType { pre_seed, seed, series_a, convertible, seis, eis, grant, rbf, community }
  enum FundingStatus { planning, open, closing, closed, cancelled }
  enum InvestmentStatus { interested, committed, documentation, funds_received, completed, withdrawn }
  enum MessageDirection { inbound, outbound }
  enum MessageType { text, voice, image, document, location, action, system }

  # Inputs
  input RegisterInput {
    email: String!
    password: String!
    firstName: String
    lastName: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input CreateCompanyInput {
    name: String!
    tradingName: String
    companyType: CompanyType!
    industry: String
    natureOfBusiness: String
  }

  input UpdateCompanyInput {
    name: String
    tradingName: String
    industry: String
    natureOfBusiness: String
  }

  input CreateTaskInput {
    companyId: UUID!
    title: String!
    description: String
    priority: Priority
    dueDate: DateTime
    assigneeId: UUID
    category: String
  }

  input UpdateTaskInput {
    title: String
    description: String
    priority: Priority
    dueDate: DateTime
    assigneeId: UUID
    status: TaskStatus
  }

  input GenerateDocumentInput {
    companyId: UUID!
    documentType: String!
    templateId: String
    data: JSON
  }

  input RequestIntroductionInput {
    targetId: UUID!
    type: IntroductionType!
    companyId: UUID
    message: String
    context: String
  }

  input CreateFundingRoundInput {
    companyId: UUID!
    roundName: String!
    roundType: FundingType!
    targetAmount: Float!
    minimumAmount: Float
    maximumAmount: Float
    preMoneyValuation: Float
    sharePrice: Float
  }

  input RecordInvestmentInput {
    investorId: UUID!
    amount: Float!
    claimSeis: Boolean
    claimEis: Boolean
    source: String
  }

  # Response types
  type AuthPayload {
    user: User!
    accessToken: String!
    refreshToken: String!
  }

  type TokenPayload {
    accessToken: String!
    refreshToken: String!
  }

  type SearchResult {
    id: UUID!
    type: String!
    title: String!
    description: String
    score: Float!
  }
`;

export const schema = makeExecutableSchema({ typeDefs, resolvers });
```


---

# 7. THE NEXUS

The Nexus is Genesis Engine's AI-powered networking and multi-modal funding engine.

## 7.1 Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              THE NEXUS                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │   AI MATCHING   │    │   TRUST GRAPH   │    │  INTRODUCTION   │         │
│  │     ENGINE      │◄──►│                 │◄──►│     ENGINE      │         │
│  └────────┬────────┘    └────────┬────────┘    └────────┬────────┘         │
│           │                      │                      │                   │
│           ▼                      ▼                      ▼                   │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │                     RELATIONSHIP ORCHESTRATOR                    │       │
│  └─────────────────────────────────────────────────────────────────┘       │
│           │                      │                      │                   │
│           ▼                      ▼                      ▼                   │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │    INVESTOR     │    │     ADVISOR     │    │    PARTNER      │         │
│  │    MATCHING     │    │    MATCHING     │    │   DISCOVERY     │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                           FUNDING ENGINE                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │   SEIS / EIS    │    │     GRANT       │    │      RBF        │         │
│  │   AUTOMATION    │    │    MATCHING     │    │   INTEGRATION   │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│                                                                              │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │   COMMUNITY     │    │    PLATFORM     │    │   SYNDICATE     │         │
│  │    ROUNDS       │    │  INTEGRATION    │    │    MATCHING     │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 7.2 AI Matching Engine

```typescript
// services/nexus/matching.service.ts

export class MatchingService {
  constructor(
    private readonly kg: KnowledgeGraphService,
    private readonly ai: AIService,
    private readonly db: Database
  ) {}

  // =========================================================================
  // INVESTOR MATCHING
  // =========================================================================

  async findInvestorMatches(
    companyId: string,
    options: InvestorMatchOptions = {}
  ): Promise<InvestorMatch[]> {
    // Get company profile
    const company = await this.getCompanyProfile(companyId);

    // Stage 1: Graph-based filtering
    const graphMatches = await this.kg.findInvestorMatches(companyId, 100);

    // Stage 2: Profile-based scoring
    const scoredMatches = await Promise.all(
      graphMatches.map(async (match) => {
        const investor = await this.db.investorProfiles.findByUserId(match.investor.user_id);
        if (!investor) return null;

        const score = this.calculateInvestorFit(company, investor, match);
        return { ...match, score, investor };
      })
    );

    // Stage 3: AI reranking (for top candidates)
    const topCandidates = scoredMatches
      .filter((m): m is NonNullable<typeof m> => m !== null)
      .sort((a, b) => b.score.total - a.score.total)
      .slice(0, 30);

    const reranked = await this.aiRerank(company, topCandidates, options);

    // Stage 4: Path finding (how to reach them)
    const withPaths = await Promise.all(
      reranked.slice(0, options.limit || 10).map(async (match) => {
        const path = await this.kg.findIntroductionPath(
          company.founders[0]?.user_id,
          match.investor.user_id
        );
        return { ...match, introductionPath: path };
      })
    );

    return withPaths;
  }

  private calculateInvestorFit(
    company: CompanyProfile,
    investor: InvestorProfile,
    graphMatch: GraphMatch
  ): InvestorScore {
    const scores = {
      // Stage fit (30%)
      stage: this.scoreStage(company.fundingStage, investor.stages) * 0.3,
      
      // Check size fit (25%)
      checkSize: this.scoreCheckSize(
        company.targetRaise,
        investor.check_size_min,
        investor.check_size_max,
        investor.check_size_sweet_spot
      ) * 0.25,
      
      // Sector fit (20%)
      sector: this.scoreSector(company.sectors, investor.sectors, investor.sector_exclusions) * 0.2,
      
      // Geography fit (10%)
      geography: this.scoreGeography(company.geographies, investor.geographies) * 0.1,
      
      // Portfolio overlap (10%)
      portfolio: Math.min(graphMatch.portfolioOverlap / 5, 1) * 0.1,
      
      // Trust score (5%)
      trust: (investor.trustScore || 0.5) * 0.05,
    };

    return {
      ...scores,
      total: Object.values(scores).reduce((a, b) => a + b, 0),
    };
  }

  private scoreStage(companyStage: string, investorStages: string[]): number {
    if (investorStages.includes(companyStage)) return 1;
    
    const adjacentStages: Record<string, string[]> = {
      pre_seed: ['seed'],
      seed: ['pre_seed', 'series_a'],
      series_a: ['seed', 'series_b'],
      series_b: ['series_a', 'series_c'],
    };
    
    if (adjacentStages[companyStage]?.some(s => investorStages.includes(s))) {
      return 0.5;
    }
    
    return 0;
  }

  private scoreCheckSize(
    targetRaise: number,
    minCheck: number,
    maxCheck: number,
    sweetSpot: number
  ): number {
    // Calculate optimal check as % of round
    const optimalCheckPct = 0.15; // 15% of round
    const targetCheck = targetRaise * optimalCheckPct;

    if (targetCheck >= minCheck && targetCheck <= maxCheck) {
      // Perfect fit
      const distanceFromSweet = Math.abs(targetCheck - sweetSpot) / sweetSpot;
      return 1 - Math.min(distanceFromSweet * 0.5, 0.3);
    }

    // Outside range
    if (targetCheck < minCheck) {
      return Math.max(0, 1 - (minCheck - targetCheck) / minCheck);
    }
    return Math.max(0, 1 - (targetCheck - maxCheck) / maxCheck);
  }

  private async aiRerank(
    company: CompanyProfile,
    candidates: ScoredMatch[],
    options: InvestorMatchOptions
  ): Promise<ScoredMatch[]> {
    const prompt = `
      You are an expert at matching startups with investors.
      
      COMPANY PROFILE:
      ${JSON.stringify(company, null, 2)}
      
      INVESTOR CANDIDATES (already scored):
      ${JSON.stringify(candidates.map(c => ({
        id: c.investor.user_id,
        name: c.investor.name,
        type: c.investor.investor_type,
        sectors: c.investor.sectors,
        stages: c.investor.stages,
        checkSize: c.investor.check_size_sweet_spot,
        portfolioOverlap: c.portfolioOverlap,
        currentScore: c.score.total,
      })), null, 2)}
      
      ${options.preferences ? `FOUNDER PREFERENCES: ${options.preferences}` : ''}
      
      Rerank these investors based on:
      1. True fit with this specific company (not just criteria matching)
      2. Strategic value beyond capital (expertise, network, reputation)
      3. Likelihood of interest based on recent activity patterns
      4. Complementarity with likely co-investors
      
      Return a JSON array of investor IDs in order of recommended priority,
      with a brief reason for each top 5.
    `;

    const result = await this.ai.generate({
      prompt,
      model: 'claude-3-opus',
      outputFormat: 'json',
    });

    const ranking = JSON.parse(result.content);
    
    // Reorder based on AI ranking
    const rankMap = new Map(ranking.map((r: any, i: number) => [r.id, i]));
    return candidates.sort((a, b) => {
      const rankA = rankMap.get(a.investor.user_id) ?? 999;
      const rankB = rankMap.get(b.investor.user_id) ?? 999;
      return rankA - rankB;
    });
  }

  // =========================================================================
  // ADVISOR MATCHING
  // =========================================================================

  async findAdvisorMatches(
    companyId: string,
    options: AdvisorMatchOptions = {}
  ): Promise<AdvisorMatch[]> {
    const company = await this.getCompanyProfile(companyId);
    
    // Identify skills needed
    const neededSkills = await this.identifyNeededSkills(company, options);
    
    // Query graph for advisors with matching skills
    const candidates = await this.kg.findAdvisorCandidates(companyId, neededSkills);
    
    // Score and rank
    const scored = candidates.map(candidate => ({
      ...candidate,
      score: this.calculateAdvisorFit(company, candidate, neededSkills),
    }));
    
    // Find introduction paths
    const withPaths = await Promise.all(
      scored
        .sort((a, b) => b.score.total - a.score.total)
        .slice(0, options.limit || 10)
        .map(async (match) => {
          const path = await this.kg.findIntroductionPath(
            company.founders[0]?.user_id,
            match.advisor.user_id
          );
          return { ...match, introductionPath: path };
        })
    );
    
    return withPaths;
  }

  private async identifyNeededSkills(
    company: CompanyProfile,
    options: AdvisorMatchOptions
  ): Promise<SkillNeed[]> {
    // If explicitly specified
    if (options.skillsNeeded?.length) {
      return options.skillsNeeded.map(skill => ({ skill, priority: 'high' }));
    }

    // AI-powered skill gap analysis
    const prompt = `
      Analyze this company and identify what advisor skills would be most valuable.
      
      COMPANY:
      ${JSON.stringify(company, null, 2)}
      
      CURRENT TEAM:
      ${JSON.stringify(company.team, null, 2)}
      
      CURRENT PHASE: ${company.currentPhase}
      
      Identify 5-7 specific skills/expertise areas where an advisor would add most value.
      Consider the company's stage, industry, and team gaps.
      
      Return JSON array: [{ skill: string, priority: 'high'|'medium'|'low', reason: string }]
    `;

    const result = await this.ai.generate({ prompt, outputFormat: 'json' });
    return JSON.parse(result.content);
  }
}
```

## 7.3 Trust Graph

```typescript
// services/nexus/trust.service.ts

export class TrustService {
  constructor(
    private readonly kg: KnowledgeGraphService,
    private readonly db: Database
  ) {}

  // =========================================================================
  // TRUST SCORE CALCULATION
  // =========================================================================

  async calculateTrustScore(userId: string): Promise<TrustScore> {
    const [
      deliveryMetrics,
      voucherMetrics,
      introductionMetrics,
      responsivenessMetrics,
      contributionMetrics,
    ] = await Promise.all([
      this.calculateDeliveryScore(userId),
      this.calculateVoucherScore(userId),
      this.calculateIntroductionScore(userId),
      this.calculateResponsivenessScore(userId),
      this.calculateContributionScore(userId),
    ]);

    // Weighted calculation
    const weights = {
      delivery: 0.30,
      voucher: 0.25,
      introduction: 0.20,
      responsiveness: 0.15,
      contribution: 0.10,
    };

    const overallScore =
      deliveryMetrics.score * weights.delivery +
      voucherMetrics.score * weights.voucher +
      introductionMetrics.score * weights.introduction +
      responsivenessMetrics.score * weights.responsiveness +
      contributionMetrics.score * weights.contribution;

    // Determine tier
    const tier = this.determineTier(overallScore);

    // Store updated score
    const trustScore = await this.db.trustScores.upsert({
      userId,
      overallScore,
      tier,
      deliveryScore: deliveryMetrics.score,
      voucherScore: voucherMetrics.score,
      introductionScore: introductionMetrics.score,
      responsivenessScore: responsivenessMetrics.score,
      contributionScore: contributionMetrics.score,
      totalIntroductionsMade: introductionMetrics.totalMade,
      successfulIntroductions: introductionMetrics.successful,
      calculatedAt: new Date(),
    });

    // Update graph
    await this.kg.updateEntity('Person', userId, {
      trust_score: overallScore,
      trust_tier: tier,
    });

    return trustScore;
  }

  private async calculateDeliveryScore(userId: string): Promise<ScoreMetric> {
    // Based on: tasks completed, deadlines met, commitments honored
    const metrics = await this.db.query(`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'completed' AND completed_at <= due_date) as on_time,
        COUNT(*) as total
      FROM tasks
      WHERE assigned_to = $1
        AND created_at > NOW() - INTERVAL '1 year'
    `, [userId]);

    const { completed, on_time, total } = metrics[0];
    
    if (total === 0) return { score: 50, details: {} }; // Neutral for new users

    const completionRate = completed / total;
    const onTimeRate = on_time / Math.max(completed, 1);
    
    return {
      score: (completionRate * 60 + onTimeRate * 40),
      details: { completionRate, onTimeRate, total },
    };
  }

  private async calculateVoucherScore(userId: string): Promise<ScoreMetric> {
    // Based on: vouches received, voucher trust scores
    const vouches = await this.kg.query(`
      MATCH (voucher:Person)-[v:VOUCHES_FOR]->(p:Person {user_id: $userId})
      WHERE voucher.trust_score IS NOT NULL
      RETURN voucher.trust_score as voucherScore, v.context as context
    `, { userId });

    if (vouches.length === 0) return { score: 50, details: {} };

    // Weighted by voucher's own trust score
    const weightedSum = vouches.reduce(
      (sum, v) => sum + (v.voucherScore * 100),
      0
    );
    const avgWeightedScore = weightedSum / vouches.length;

    // More vouches = higher confidence (up to a point)
    const vouchCountBonus = Math.min(vouches.length * 2, 20);

    return {
      score: Math.min(avgWeightedScore + vouchCountBonus, 100),
      details: { vouchCount: vouches.length, avgVoucherScore: avgWeightedScore },
    };
  }

  private async calculateIntroductionScore(userId: string): Promise<ScoreMetric> {
    // Based on: introductions made, success rate, feedback
    const introStats = await this.db.query(`
      SELECT 
        COUNT(*) as total_made,
        COUNT(*) FILTER (WHERE status = 'accepted') as accepted,
        COUNT(*) FILTER (WHERE outcome = 'positive') as positive_outcome,
        COUNT(*) FILTER (WHERE outcome = 'negative') as negative_outcome
      FROM introduction_requests
      WHERE introducer_id = $1
        AND created_at > NOW() - INTERVAL '1 year'
    `, [userId]);

    const { total_made, accepted, positive_outcome, negative_outcome } = introStats[0];

    if (total_made === 0) return { score: 50, details: {}, totalMade: 0, successful: 0 };

    const acceptanceRate = accepted / total_made;
    const successRate = positive_outcome / Math.max(accepted, 1);
    const failureRate = negative_outcome / Math.max(accepted, 1);

    const score = Math.max(
      0,
      (acceptanceRate * 40) + (successRate * 50) - (failureRate * 30) + 20
    );

    return {
      score: Math.min(score, 100),
      details: { acceptanceRate, successRate },
      totalMade: total_made,
      successful: positive_outcome,
    };
  }

  private async calculateResponsivenessScore(userId: string): Promise<ScoreMetric> {
    // Based on: response times to messages and requests
    const responseStats = await this.db.query(`
      SELECT 
        AVG(EXTRACT(EPOCH FROM (response_at - created_at)) / 3600) as avg_response_hours
      FROM (
        SELECT ir.created_at, ir.introducer_approved_at as response_at
        FROM introduction_requests ir
        WHERE ir.introducer_id = $1 AND ir.introducer_approved_at IS NOT NULL
        
        UNION ALL
        
        SELECT pm.created_at, pm2.created_at as response_at
        FROM pulse_messages pm
        JOIN pulse_messages pm2 ON pm2.response_to_id = pm.id
        WHERE pm.user_id = $1 AND pm.direction = 'inbound'
      ) responses
    `, [userId]);

    const avgHours = responseStats[0]?.avg_response_hours;

    if (!avgHours) return { score: 50, details: {} };

    // Scoring: <4 hours = 100, <24 hours = 75, <72 hours = 50, >72 hours = 25
    let score: number;
    if (avgHours < 4) score = 100;
    else if (avgHours < 24) score = 100 - ((avgHours - 4) / 20 * 25);
    else if (avgHours < 72) score = 75 - ((avgHours - 24) / 48 * 25);
    else score = Math.max(25 - ((avgHours - 72) / 168 * 15), 10);

    return { score, details: { avgResponseHours: avgHours } };
  }

  private async calculateContributionScore(userId: string): Promise<ScoreMetric> {
    // Based on: content shared, advice given, community participation
    const contributions = await this.kg.query(`
      MATCH (p:Person {user_id: $userId})
      OPTIONAL MATCH (p)-[:CREATED]->(d:Document)
      OPTIONAL MATCH (p)-[:ADVISES]->(c:Company)
      OPTIONAL MATCH (p)-[:MENTORS]->(m:Person)
      RETURN 
        COUNT(DISTINCT d) as documents,
        COUNT(DISTINCT c) as advisorships,
        COUNT(DISTINCT m) as mentees
    `, { userId });

    const { documents, advisorships, mentees } = contributions[0];

    // Simple scoring based on contribution types
    const score = Math.min(
      (documents * 5) + (advisorships * 15) + (mentees * 10) + 20,
      100
    );

    return { score, details: { documents, advisorships, mentees } };
  }

  private determineTier(score: number): TrustTier {
    if (score >= 90) return 'diamond';
    if (score >= 75) return 'platinum';
    if (score >= 60) return 'gold';
    if (score >= 45) return 'silver';
    return 'bronze';
  }

  // =========================================================================
  // VOUCH SYSTEM
  // =========================================================================

  async createVouch(
    voucherId: string,
    voucheeId: string,
    context: string
  ): Promise<void> {
    // Validate voucher can vouch (has sufficient trust)
    const voucherScore = await this.db.trustScores.findByUserId(voucherId);
    if (!voucherScore || voucherScore.overallScore < 40) {
      throw new ForbiddenError('Insufficient trust score to vouch');
    }

    // Check not already vouched
    const existing = await this.kg.relationshipExists(
      'Person', voucherId,
      'VOUCHES_FOR',
      'Person', voucheeId
    );
    if (existing) {
      throw new ConflictError('Already vouched for this person');
    }

    // Create vouch relationship
    await this.kg.createRelationship(
      'Person', voucherId,
      'VOUCHES_FOR',
      'Person', voucheeId,
      { date: new Date().toISOString(), context }
    );

    // Recalculate vouchee's trust score
    await this.calculateTrustScore(voucheeId);
  }
}
```

## 7.4 Introduction Engine

```typescript
// services/nexus/introduction.service.ts

export class IntroductionService {
  constructor(
    private readonly kg: KnowledgeGraphService,
    private readonly db: Database,
    private readonly queue: QueueService,
    private readonly ai: AIService
  ) {}

  // =========================================================================
  // INTRODUCTION REQUEST FLOW
  // =========================================================================

  async requestIntroduction(
    requesterId: string,
    targetId: string,
    data: IntroductionRequestData
  ): Promise<IntroductionRequest> {
    // Validate not self
    if (requesterId === targetId) {
      throw new ValidationError('Cannot request introduction to yourself');
    }

    // Check if already connected
    const connected = await this.kg.relationshipExists(
      'Person', requesterId,
      'KNOWS',
      'Person', targetId
    );
    if (connected) {
      throw new ConflictError('Already connected with this person');
    }

    // Find best introducer
    const introducers = await this.kg.findBestIntroducers(requesterId, targetId);
    if (introducers.length === 0) {
      throw new NotFoundError('No introduction path found');
    }

    const introducer = introducers[0];

    // AI: Evaluate match quality
    const matchEval = await this.evaluateMatch(requesterId, targetId, data);
    
    // AI: Generate introduction message
    const introMessage = await this.generateIntroMessage(
      requesterId,
      targetId,
      introducer.person.user_id,
      data
    );

    // Create request
    const request = await this.db.introductionRequests.create({
      requesterId,
      targetId,
      introducerId: introducer.person.user_id,
      requesterCompanyId: data.companyId,
      introductionType: data.type,
      message: data.message,
      context: data.context,
      aiMatchScore: matchEval.score,
      aiMatchReasons: matchEval.reasons,
      status: 'pending',
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    });

    // Notify introducer
    await this.queue.add('email:send', {
      template: 'introduction_request_introducer',
      to: introducer.person.email,
      data: {
        request,
        introMessage,
        requesterName: await this.getPersonName(requesterId),
        targetName: await this.getPersonName(targetId),
      },
    });

    return request;
  }

  async approveAsIntroducer(
    requestId: string,
    introducerId: string,
    customMessage?: string
  ): Promise<void> {
    const request = await this.db.introductionRequests.findById(requestId);
    
    if (!request) throw new NotFoundError('Request not found');
    if (request.introducerId !== introducerId) throw new ForbiddenError('Not the introducer');
    if (request.status !== 'pending') throw new ConflictError('Request already processed');

    // Update status
    await this.db.introductionRequests.update(requestId, {
      status: 'introducer_approved',
      introducerApprovedAt: new Date(),
    });

    // Notify target
    await this.queue.add('email:send', {
      template: 'introduction_request_target',
      to: await this.getPersonEmail(request.targetId),
      data: {
        request,
        introducerName: await this.getPersonName(introducerId),
        requesterName: await this.getPersonName(request.requesterId),
        customMessage,
      },
    });
  }

  async acceptAsTarget(
    requestId: string,
    targetId: string,
    scheduleCall: boolean = true
  ): Promise<void> {
    const request = await this.db.introductionRequests.findById(requestId);
    
    if (!request) throw new NotFoundError('Request not found');
    if (request.targetId !== targetId) throw new ForbiddenError('Not the target');
    if (request.status !== 'introducer_approved') {
      throw new ConflictError('Introducer has not approved');
    }

    // Update status
    await this.db.introductionRequests.update(requestId, {
      status: 'accepted',
      targetApprovedAt: new Date(),
    });

    // Create connection in graph
    await this.kg.createRelationship(
      'Person', request.requesterId,
      'KNOWS',
      'Person', targetId,
      {
        since: new Date().toISOString(),
        source: 'introduction',
        introduction_id: requestId,
      }
    );

    // Create network connection in PostgreSQL
    await this.db.networkConnections.create({
      userAId: request.requesterId < targetId ? request.requesterId : targetId,
      userBId: request.requesterId < targetId ? targetId : request.requesterId,
      connectionType: 'introduction',
      status: 'accepted',
      introducedBy: request.introducerId,
      introductionId: requestId,
    });

    // Update introducer's trust score
    await this.queue.add('trust:calculate', { userId: request.introducerId });

    // Schedule call if requested
    if (scheduleCall) {
      await this.scheduleIntroCall(request);
    }

    // Notify all parties
    await this.notifyIntroductionComplete(request);
  }

  private async evaluateMatch(
    requesterId: string,
    targetId: string,
    data: IntroductionRequestData
  ): Promise<MatchEvaluation> {
    const [requester, target] = await Promise.all([
      this.kg.getPersonProfile(requesterId),
      this.kg.getPersonProfile(targetId),
    ]);

    const prompt = `
      Evaluate this introduction request.
      
      REQUESTER:
      ${JSON.stringify(requester, null, 2)}
      
      TARGET:
      ${JSON.stringify(target, null, 2)}
      
      INTRODUCTION TYPE: ${data.type}
      REQUESTER'S MESSAGE: ${data.message}
      CONTEXT: ${data.context}
      
      Evaluate:
      1. Mutual benefit potential (0-100)
      2. Relevance/fit (0-100)
      3. Timing appropriateness (0-100)
      4. Red flags (list any concerns)
      
      Return JSON: { score: number, reasons: string[], redFlags: string[] }
    `;

    const result = await this.ai.generate({ prompt, outputFormat: 'json' });
    return JSON.parse(result.content);
  }

  private async generateIntroMessage(
    requesterId: string,
    targetId: string,
    introducerId: string,
    data: IntroductionRequestData
  ): Promise<string> {
    const [requester, target, introducer] = await Promise.all([
      this.kg.getPersonProfile(requesterId),
      this.kg.getPersonProfile(targetId),
      this.kg.getPersonProfile(introducerId),
    ]);

    const prompt = `
      Write a warm introduction email that ${introducer.name} can send to introduce
      ${requester.name} to ${target.name}.
      
      INTRODUCER: ${introducer.name}
      - Relationship with requester: ${await this.getRelationshipContext(introducerId, requesterId)}
      - Relationship with target: ${await this.getRelationshipContext(introducerId, targetId)}
      
      REQUESTER: ${requester.name}
      - Company: ${requester.company}
      - Role: ${requester.role}
      - Looking for: ${data.type} - ${data.message}
      
      TARGET: ${target.name}
      - Company: ${target.company}
      - Role: ${target.role}
      - Known for: ${target.expertise?.join(', ')}
      
      Write a professional but warm introduction email (max 200 words).
      Focus on why this introduction makes sense for both parties.
    `;

    const result = await this.ai.generate({ prompt, maxTokens: 500 });
    return result.content;
  }
}
```

## 7.5 Funding Engine

### 7.5.1 SEIS/EIS Automation

```typescript
// services/nexus/funding/seis-eis.service.ts

export class SEISEISService {
  constructor(
    private readonly db: Database,
    private readonly documents: DocumentService,
    private readonly compliance: ComplianceService,
    private readonly queue: QueueService
  ) {}

  // =========================================================================
  // ELIGIBILITY CHECK
  // =========================================================================

  async checkEligibility(companyId: string): Promise<EligibilityResult> {
    const company = await this.db.companies.findById(companyId);
    if (!company) throw new NotFoundError('Company not found');

    const checks: EligibilityCheck[] = [];

    // SEIS Checks
    const seisChecks = await this.performSEISChecks(company);
    checks.push(...seisChecks);

    // EIS Checks
    const eisChecks = await this.performEISChecks(company);
    checks.push(...eisChecks);

    // Calculate eligibility
    const seisEligible = seisChecks.every(c => c.passed);
    const eisEligible = eisChecks.every(c => c.passed);

    // Update company record
    await this.db.companies.update(companyId, {
      seisEligible,
      eisEligible,
    });

    return {
      seis: { eligible: seisEligible, checks: seisChecks },
      eis: { eligible: eisEligible, checks: eisChecks },
      recommendations: this.generateRecommendations(checks),
    };
  }

  private async performSEISChecks(company: Company): Promise<EligibilityCheck[]> {
    const checks: EligibilityCheck[] = [];

    // Check 1: Company age (must be less than 3 years old for first SEIS)
    const ageYears = this.getCompanyAge(company.incorporationDate);
    checks.push({
      id: 'seis_age',
      name: 'Company Age',
      requirement: 'Less than 3 years since first commercial sale',
      passed: ageYears < 3,
      details: `Company age: ${ageYears.toFixed(1)} years`,
    });

    // Check 2: Employee count (must be fewer than 25 FTE)
    const employees = await this.getEmployeeCount(company.id);
    checks.push({
      id: 'seis_employees',
      name: 'Employee Count',
      requirement: 'Fewer than 25 full-time equivalent employees',
      passed: employees < 25,
      details: `Current employees: ${employees}`,
    });

    // Check 3: Gross assets (must be less than £350k before and £450k after investment)
    const assets = await this.getGrossAssets(company.id);
    checks.push({
      id: 'seis_assets',
      name: 'Gross Assets',
      requirement: 'Less than £350,000 before investment',
      passed: assets < 350000,
      details: `Current gross assets: £${assets.toLocaleString()}`,
    });

    // Check 4: Lifetime SEIS limit (£250k max total SEIS investment)
    const seisRaised = await this.getSEISAmountRaised(company.id);
    checks.push({
      id: 'seis_lifetime',
      name: 'Lifetime SEIS Limit',
      requirement: 'Maximum £250,000 lifetime SEIS investment',
      passed: seisRaised < 250000,
      details: `SEIS raised to date: £${seisRaised.toLocaleString()}`,
      remaining: 250000 - seisRaised,
    });

    // Check 5: Qualifying trade
    const tradeCheck = await this.checkQualifyingTrade(company);
    checks.push({
      id: 'seis_trade',
      name: 'Qualifying Trade',
      requirement: 'Must carry on a qualifying trade',
      passed: tradeCheck.qualifies,
      details: tradeCheck.reason,
    });

    // Check 6: UK permanent establishment
    checks.push({
      id: 'seis_uk_base',
      name: 'UK Permanent Establishment',
      requirement: 'Must have permanent establishment in UK',
      passed: company.registeredAddressCountry === 'GB',
      details: `Registered in: ${company.registeredAddressCountry}`,
    });

    return checks;
  }

  private async performEISChecks(company: Company): Promise<EligibilityCheck[]> {
    const checks: EligibilityCheck[] = [];

    // Check 1: Company age
    const ageYears = this.getCompanyAge(company.incorporationDate);
    checks.push({
      id: 'eis_age',
      name: 'Company Age',
      requirement: 'Less than 7 years since first commercial sale (or 10 for knowledge-intensive)',
      passed: ageYears < 7, // Simplified - would check knowledge-intensive status
      details: `Company age: ${ageYears.toFixed(1)} years`,
    });

    // Check 2: Employee count (must be fewer than 250 FTE)
    const employees = await this.getEmployeeCount(company.id);
    checks.push({
      id: 'eis_employees',
      name: 'Employee Count',
      requirement: 'Fewer than 250 full-time equivalent employees',
      passed: employees < 250,
      details: `Current employees: ${employees}`,
    });

    // Check 3: Gross assets (must be less than £15m before and £16m after)
    const assets = await this.getGrossAssets(company.id);
    checks.push({
      id: 'eis_assets',
      name: 'Gross Assets',
      requirement: 'Less than £15,000,000 before investment',
      passed: assets < 15000000,
      details: `Current gross assets: £${assets.toLocaleString()}`,
    });

    // Check 4: Annual investment limit (£5m per year, £12m lifetime)
    const annualRaised = await this.getAnnualInvestmentRaised(company.id);
    checks.push({
      id: 'eis_annual',
      name: 'Annual Investment Limit',
      requirement: 'Maximum £5,000,000 in any 12-month period (combined SEIS/EIS)',
      passed: annualRaised < 5000000,
      details: `Raised in last 12 months: £${annualRaised.toLocaleString()}`,
      remaining: 5000000 - annualRaised,
    });

    // Check 5: Lifetime limit (£12m total)
    const lifetimeRaised = await this.getLifetimeInvestmentRaised(company.id);
    checks.push({
      id: 'eis_lifetime',
      name: 'Lifetime Investment Limit',
      requirement: 'Maximum £12,000,000 lifetime investment',
      passed: lifetimeRaised < 12000000,
      details: `Lifetime raised: £${lifetimeRaised.toLocaleString()}`,
      remaining: 12000000 - lifetimeRaised,
    });

    // Check 6: Qualifying trade
    const tradeCheck = await this.checkQualifyingTrade(company);
    checks.push(tradeCheck);

    return checks;
  }

  private async checkQualifyingTrade(company: Company): Promise<EligibilityCheck> {
    // Excluded trades for SEIS/EIS
    const excludedTrades = [
      'dealing_in_land',
      'dealing_in_commodities',
      'dealing_in_shares',
      'financial_activities',
      'leasing',
      'legal_services',
      'accountancy',
      'property_development',
      'farming',
      'hotels',
      'nursing_homes',
      'energy_generation',
      'shipbuilding',
    ];

    // Check against SIC codes
    const isExcluded = company.sicCodes?.some(sic => {
      return this.sicCodeIsExcluded(sic, excludedTrades);
    });

    return {
      id: 'qualifying_trade',
      name: 'Qualifying Trade',
      requirement: 'Must not be an excluded trade',
      passed: !isExcluded,
      details: isExcluded 
        ? 'Business may be in an excluded trade category'
        : 'Trade appears to qualify',
    };
  }

  // =========================================================================
  // ADVANCE ASSURANCE APPLICATION
  // =========================================================================

  async prepareAdvanceAssurance(
    companyId: string,
    schemeType: 'seis' | 'eis'
  ): Promise<AdvanceAssuranceApplication> {
    // Check eligibility first
    const eligibility = await this.checkEligibility(companyId);
    const isEligible = schemeType === 'seis' 
      ? eligibility.seis.eligible 
      : eligibility.eis.eligible;

    if (!isEligible) {
      throw new ValidationError(
        `Company does not appear to be ${schemeType.toUpperCase()} eligible`,
        { eligibility }
      );
    }

    // Gather required data
    const [company, shareholders, officers, financials] = await Promise.all([
      this.db.companies.findById(companyId),
      this.db.shareholders.findByCompanyId(companyId),
      this.db.officers.findByCompanyId(companyId),
      this.getFinancialSummary(companyId),
    ]);

    // Generate application document
    const applicationDoc = await this.documents.generate({
      template: `hmrc_${schemeType}_advance_assurance`,
      data: {
        company,
        shareholders,
        officers,
        financials,
        schemeType,
      },
    });

    // Create application record
    const application = await this.db.advanceAssuranceApplications.create({
      companyId,
      schemeType,
      status: 'draft',
      applicationDocumentId: applicationDoc.id,
      eligibilityChecks: schemeType === 'seis' 
        ? eligibility.seis.checks 
        : eligibility.eis.checks,
    });

    return application;
  }

  // =========================================================================
  // COMPLIANCE CERTIFICATE GENERATION
  // =========================================================================

  async generateComplianceCertificate(
    investmentId: string
  ): Promise<Document> {
    const investment = await this.db.investments.findById(investmentId);
    if (!investment) throw new NotFoundError('Investment not found');

    const [round, investor, company] = await Promise.all([
      this.db.fundingRounds.findById(investment.fundingRoundId),
      this.db.users.findById(investment.investorId),
      this.db.companies.findById(investment.companyId),
    ]);

    // Validate investment is complete
    if (investment.status !== 'completed') {
      throw new ValidationError('Investment must be completed');
    }

    // Generate SEIS3 or EIS3 form
    const formType = investment.seisRelief ? 'seis3' : 'eis3';
    
    const certificate = await this.documents.generate({
      template: `hmrc_${formType}_certificate`,
      data: {
        investor: {
          name: `${investor.firstName} ${investor.lastName}`,
          address: investor.address,
          nationalInsurance: investor.nationalInsurance, // Would be encrypted
        },
        company: {
          name: company.name,
          companyNumber: company.companyNumber,
          address: this.formatAddress(company),
        },
        investment: {
          date: investment.completedAt,
          amount: investment.amount,
          sharesIssued: investment.sharesAllocated,
          shareClass: round.shareClassName,
        },
        uniqueInvestmentReference: this.generateUIR(investment),
      },
    });

    // Update investment with certificate
    await this.db.investments.update(investmentId, {
      reliefCertificateId: certificate.id,
    });

    return certificate;
  }
}
```


### 7.5.2 Grant Matching

```typescript
// services/nexus/funding/grants.service.ts

export class GrantsService {
  constructor(
    private readonly db: Database,
    private readonly ai: AIService,
    private readonly kg: KnowledgeGraphService,
    private readonly queue: QueueService
  ) {}

  // Grant database (constantly updated)
  private readonly GRANT_SOURCES = [
    'innovate_uk',
    'horizon_europe',
    'ukri',
    'british_business_bank',
    'regional_growth_funds',
    'sector_specific',
  ];

  async findMatchingGrants(companyId: string): Promise<GrantMatch[]> {
    const company = await this.kg.getCompanyContext(companyId);

    // Get active grants from database
    const activeGrants = await this.db.grants.findActive({
      deadlineAfter: new Date(),
      countries: ['GB'],
    });

    // AI-powered matching
    const matches = await Promise.all(
      activeGrants.map(async (grant) => {
        const matchScore = await this.calculateGrantMatch(company, grant);
        return { grant, ...matchScore };
      })
    );

    // Filter and sort
    return matches
      .filter((m) => m.eligibilityScore > 0.5)
      .sort((a, b) => b.overallScore - a.overallScore)
      .slice(0, 20);
  }

  private async calculateGrantMatch(
    company: CompanyContext,
    grant: Grant
  ): Promise<GrantMatchScore> {
    const prompt = `
      Evaluate if this company is a good match for this grant.
      
      COMPANY:
      - Name: ${company.company.name}
      - Industry: ${company.industries.map((i) => i.name).join(', ')}
      - Stage: ${company.company.fundingStage}
      - Description: ${company.company.natureOfBusiness}
      - Employees: ${company.team.length}
      - Location: ${company.company.registeredAddressCity}
      
      GRANT:
      - Name: ${grant.name}
      - Provider: ${grant.provider}
      - Amount: £${grant.amountMin?.toLocaleString()} - £${grant.amountMax?.toLocaleString()}
      - Eligibility: ${grant.eligibilityCriteria}
      - Focus Areas: ${grant.focusAreas?.join(', ')}
      - Deadline: ${grant.deadline}
      
      Evaluate:
      1. Eligibility score (0-100): Does company meet basic criteria?
      2. Fit score (0-100): How well does company align with grant objectives?
      3. Success probability (0-100): Estimated chance of winning based on competition
      4. Effort required (low/medium/high): Application complexity
      
      Provide specific reasons for each score.
      Return JSON: { eligibilityScore, fitScore, successProbability, effort, reasons }
    `;

    const result = await this.ai.generate({ prompt, outputFormat: 'json' });
    const scores = JSON.parse(result.content);

    return {
      ...scores,
      overallScore:
        scores.eligibilityScore * 0.3 +
        scores.fitScore * 0.4 +
        scores.successProbability * 0.3,
    };
  }

  async generateGrantApplication(
    companyId: string,
    grantId: string
  ): Promise<GrantApplicationDraft> {
    const [company, grant] = await Promise.all([
      this.kg.getCompanyContext(companyId),
      this.db.grants.findById(grantId),
    ]);

    if (!grant) throw new NotFoundError('Grant not found');

    // Get grant-specific requirements
    const requirements = await this.getGrantRequirements(grant);

    // Generate each section
    const sections: ApplicationSection[] = [];

    for (const section of requirements.sections) {
      const content = await this.generateSection(company, grant, section);
      sections.push({
        id: section.id,
        title: section.title,
        content,
        wordLimit: section.wordLimit,
        currentWords: this.countWords(content),
      });
    }

    // Create application record
    const application = await this.db.grantApplications.create({
      companyId,
      grantName: grant.name,
      grantProvider: grant.provider,
      amountRequested: grant.amountMax,
      status: 'drafting',
      submissionDeadline: grant.deadline,
      aiGeneratedDraft: true,
    });

    // Store draft
    await this.db.grantApplicationDrafts.create({
      applicationId: application.id,
      sections,
      version: 1,
    });

    return {
      application,
      sections,
      completionPercentage: this.calculateCompletion(sections),
    };
  }

  private async generateSection(
    company: CompanyContext,
    grant: Grant,
    section: SectionRequirement
  ): Promise<string> {
    const prompt = `
      Write the "${section.title}" section for a ${grant.name} grant application.
      
      SECTION REQUIREMENTS:
      ${section.description}
      ${section.guidance ? `Guidance: ${section.guidance}` : ''}
      Word limit: ${section.wordLimit} words
      
      COMPANY CONTEXT:
      ${JSON.stringify(company, null, 2)}
      
      GRANT OBJECTIVES:
      ${grant.objectives}
      
      Write a compelling, specific section that:
      1. Directly addresses the requirements
      2. Uses specific examples and data from the company
      3. Aligns with grant objectives
      4. Stays within word limit
      5. Uses clear, professional language (no jargon)
      
      Focus on demonstrable impact and innovation.
    `;

    const result = await this.ai.generate({
      prompt,
      maxTokens: section.wordLimit * 2,
    });

    return result.content;
  }
}
```

### 7.5.3 RBF Integration

```typescript
// services/nexus/funding/rbf.service.ts

export class RBFService {
  private readonly providers: RBFProvider[] = [
    {
      id: 'clearco',
      name: 'Clearco',
      minRevenue: 10000, // Monthly
      maxAmount: 20000000,
      feeRange: [0.06, 0.12],
      repaymentRange: [0.05, 0.20],
      requirements: ['stripe', 'shopify', 'facebook_ads'],
    },
    {
      id: 'wayflyer',
      name: 'Wayflyer',
      minRevenue: 20000,
      maxAmount: 40000000,
      feeRange: [0.02, 0.09],
      repaymentRange: [0.01, 0.25],
      requirements: ['ecommerce_platform'],
    },
    {
      id: 'uncapped',
      name: 'Uncapped',
      minRevenue: 10000,
      maxAmount: 10000000,
      feeRange: [0.06, 0.14],
      repaymentRange: [0.05, 0.25],
      requirements: ['stripe', 'bank_connection'],
    },
    {
      id: 'outfund',
      name: 'Outfund',
      minRevenue: 5000,
      maxAmount: 5000000,
      feeRange: [0.03, 0.09],
      repaymentRange: [0.02, 0.20],
      requirements: ['bank_connection'],
    },
  ];

  async checkEligibility(companyId: string): Promise<RBFEligibilityResult[]> {
    const [company, financials, integrations] = await Promise.all([
      this.db.companies.findById(companyId),
      this.getFinancialMetrics(companyId),
      this.getConnectedIntegrations(companyId),
    ]);

    const results: RBFEligibilityResult[] = [];

    for (const provider of this.providers) {
      const checks: EligibilityCheck[] = [];

      // Revenue check
      const meetsRevenue = financials.monthlyRevenue >= provider.minRevenue;
      checks.push({
        id: 'revenue',
        name: 'Monthly Revenue',
        requirement: `Minimum £${provider.minRevenue.toLocaleString()}/month`,
        passed: meetsRevenue,
        details: `Current: £${financials.monthlyRevenue.toLocaleString()}/month`,
      });

      // Integration requirements
      const hasIntegrations = provider.requirements.some((req) =>
        integrations.includes(req)
      );
      checks.push({
        id: 'integrations',
        name: 'Required Integrations',
        requirement: `Connect ${provider.requirements.join(' or ')}`,
        passed: hasIntegrations,
        details: hasIntegrations
          ? 'Required integration connected'
          : 'Missing required integration',
      });

      // Estimate offer
      let estimatedOffer: RBFOffer | null = null;
      if (meetsRevenue && hasIntegrations) {
        estimatedOffer = this.estimateOffer(provider, financials);
      }

      results.push({
        provider,
        eligible: checks.every((c) => c.passed),
        checks,
        estimatedOffer,
      });
    }

    return results.sort((a, b) => {
      if (a.eligible !== b.eligible) return a.eligible ? -1 : 1;
      return (b.estimatedOffer?.amount || 0) - (a.estimatedOffer?.amount || 0);
    });
  }

  private estimateOffer(
    provider: RBFProvider,
    financials: FinancialMetrics
  ): RBFOffer {
    // Typically 1-4x monthly revenue
    const multiplier = this.calculateMultiplier(financials);
    const amount = Math.min(
      financials.monthlyRevenue * multiplier,
      provider.maxAmount
    );

    // Fee based on risk profile
    const riskScore = this.calculateRiskScore(financials);
    const fee =
      provider.feeRange[0] +
      (provider.feeRange[1] - provider.feeRange[0]) * riskScore;

    // Repayment percentage
    const repaymentPct =
      provider.repaymentRange[0] +
      (provider.repaymentRange[1] - provider.repaymentRange[0]) * 0.5;

    return {
      amount,
      fee: fee * amount,
      feePercentage: fee,
      repaymentPercentage: repaymentPct,
      estimatedRepaymentMonths: Math.ceil(
        (amount * (1 + fee)) / (financials.monthlyRevenue * repaymentPct)
      ),
    };
  }

  async initiateApplication(
    companyId: string,
    providerId: string
  ): Promise<RBFApplication> {
    const provider = this.providers.find((p) => p.id === providerId);
    if (!provider) throw new NotFoundError('Provider not found');

    // Check eligibility
    const eligibility = await this.checkEligibility(companyId);
    const providerEligibility = eligibility.find(
      (e) => e.provider.id === providerId
    );

    if (!providerEligibility?.eligible) {
      throw new ValidationError('Company not eligible for this provider');
    }

    // Create application record
    const application = await this.db.rbfApplications.create({
      companyId,
      provider: providerId,
      amountRequested: providerEligibility.estimatedOffer?.amount,
      status: 'draft',
    });

    // Queue data gathering for application
    await this.queue.add('rbf:prepare-application', {
      applicationId: application.id,
      providerId,
      companyId,
    });

    return application;
  }
}
```

---

# 8. PULSE

Pulse is Genesis Engine's conversational interface accessible via SMS, WhatsApp, and other messaging platforms.

## 8.1 Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                 PULSE                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │                    CHANNEL ADAPTERS                              │       │
│  ├─────────────┬─────────────┬─────────────┬─────────────┬─────────┤       │
│  │    SMS      │  WhatsApp   │  Telegram   │   iMessage  │  Email  │       │
│  │  (Twilio)   │  (Twilio)   │  (Bot API)  │  (Apple)    │         │       │
│  └──────┬──────┴──────┬──────┴──────┬──────┴──────┬──────┴────┬────┘       │
│         │             │             │             │           │             │
│         ▼             ▼             ▼             ▼           ▼             │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │                    MESSAGE ROUTER                                │       │
│  └────────────────────────────┬────────────────────────────────────┘       │
│                               │                                             │
│         ┌─────────────────────┼─────────────────────┐                      │
│         ▼                     ▼                     ▼                      │
│  ┌─────────────┐       ┌─────────────┐       ┌─────────────┐              │
│  │   INTENT    │       │   VOICE     │       │   MEDIA     │              │
│  │  CLASSIFIER │       │ TRANSCRIBER │       │  PROCESSOR  │              │
│  └──────┬──────┘       └──────┬──────┘       └──────┬──────┘              │
│         │                     │                     │                      │
│         └─────────────────────┼─────────────────────┘                      │
│                               ▼                                             │
│  ┌─────────────────────────────────────────────────────────────────┐       │
│  │                    CONVERSATION ENGINE                           │       │
│  ├─────────────────────────────────────────────────────────────────┤       │
│  │  • Context Management    • Multi-turn Dialogue                  │       │
│  │  • Entity Extraction     • Confirmation Flows                   │       │
│  │  • Action Resolution     • Error Recovery                       │       │
│  └────────────────────────────┬────────────────────────────────────┘       │
│                               │                                             │
│         ┌─────────────────────┼─────────────────────┐                      │
│         ▼                     ▼                     ▼                      │
│  ┌─────────────┐       ┌─────────────┐       ┌─────────────┐              │
│  │   ACTION    │       │  KNOWLEDGE  │       │   PROACTIVE │              │
│  │  EXECUTOR   │       │   RETRIEVER │       │   OUTREACH  │              │
│  └─────────────┘       └─────────────┘       └─────────────┘              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 8.2 Message Processing Pipeline

```typescript
// services/pulse/pipeline.service.ts

export class PulsePipeline {
  constructor(
    private readonly channels: ChannelAdapterRegistry,
    private readonly intent: IntentClassifier,
    private readonly conversation: ConversationEngine,
    private readonly actions: ActionExecutor,
    private readonly kg: KnowledgeGraphService,
    private readonly ai: AIService,
    private readonly db: Database,
    private readonly queue: QueueService
  ) {}

  // =========================================================================
  // INBOUND MESSAGE PROCESSING
  // =========================================================================

  async processInbound(
    channel: Channel,
    rawMessage: RawInboundMessage
  ): Promise<void> {
    const startTime = Date.now();

    try {
      // Step 1: Parse and normalize message
      const adapter = this.channels.get(channel);
      const message = await adapter.parseInbound(rawMessage);

      // Step 2: Identify or create conversation
      const conversation = await this.getOrCreateConversation(
        message.userId,
        channel,
        message.channelIdentifier
      );

      // Step 3: Store inbound message
      const storedMessage = await this.storeMessage({
        conversationId: conversation.id,
        userId: message.userId,
        direction: 'inbound',
        messageType: message.type,
        content: message.content,
        mediaUrl: message.mediaUrl,
        externalId: message.externalId,
      });

      // Step 4: Process based on message type
      let processedContent = message.content;

      if (message.type === 'voice') {
        // Transcribe voice message
        processedContent = await this.transcribeVoice(message.mediaUrl);
        await this.db.pulseMessages.update(storedMessage.id, {
          transcription: processedContent,
        });
      } else if (message.type === 'image') {
        // Process image (OCR, description)
        const imageAnalysis = await this.processImage(message.mediaUrl);
        processedContent = `[Image: ${imageAnalysis.description}]${
          message.content ? ` ${message.content}` : ''
        }`;
      } else if (message.type === 'document') {
        // Process document
        processedContent = await this.processDocument(message.mediaUrl);
      }

      // Step 5: Classify intent
      const intentResult = await this.intent.classify(
        processedContent,
        conversation.currentContext
      );

      await this.db.pulseMessages.update(storedMessage.id, {
        detectedIntent: intentResult.intent,
        intentConfidence: intentResult.confidence,
        extractedEntities: intentResult.entities,
      });

      // Step 6: Generate response
      const response = await this.conversation.processMessage({
        message: processedContent,
        intent: intentResult,
        conversation,
        userId: message.userId,
      });

      // Step 7: Execute any actions
      if (response.actions?.length) {
        for (const action of response.actions) {
          await this.executeAction(action, conversation, storedMessage.id);
        }
      }

      // Step 8: Send response
      const responseMessage = await this.sendResponse(
        channel,
        conversation,
        response.message,
        response.quickReplies
      );

      // Step 9: Update conversation context
      await this.updateConversationContext(conversation.id, {
        lastIntent: intentResult.intent,
        lastEntities: intentResult.entities,
        pendingAction: response.pendingAction,
      });

      // Metrics
      const latency = Date.now() - startTime;
      await this.recordMetrics('message_processed', {
        channel,
        intent: intentResult.intent,
        latency,
        hasAction: response.actions?.length > 0,
      });
    } catch (error) {
      await this.handleProcessingError(error, channel, rawMessage);
    }
  }

  // =========================================================================
  // INTENT CLASSIFICATION
  // =========================================================================

  private async classifyIntent(
    content: string,
    context: ConversationContext
  ): Promise<IntentResult> {
    // Fast path: Check for explicit commands
    const commandMatch = this.matchCommand(content);
    if (commandMatch) {
      return {
        intent: commandMatch.intent,
        confidence: 1.0,
        entities: commandMatch.entities,
        isCommand: true,
      };
    }

    // Check if continuing previous conversation
    if (context.pendingAction) {
      return {
        intent: 'continue_action',
        confidence: 0.9,
        entities: { response: content },
        continuesAction: context.pendingAction,
      };
    }

    // AI classification
    const prompt = `
      Classify the intent of this message from a startup founder.
      
      MESSAGE: "${content}"
      
      PREVIOUS CONTEXT:
      - Last intent: ${context.lastIntent || 'none'}
      - Current focus: ${context.currentFocus || 'general'}
      - Pending items: ${JSON.stringify(context.pendingItems || [])}
      
      POSSIBLE INTENTS:
      ${INTENT_DEFINITIONS.map((i) => `- ${i.id}: ${i.description}`).join('\n')}
      
      Return JSON: {
        intent: string,
        confidence: number (0-1),
        entities: object (extracted entities like amounts, dates, names),
        clarificationNeeded: boolean,
        clarificationQuestion: string (if needed)
      }
    `;

    const result = await this.ai.generate({
      prompt,
      model: 'fast',
      outputFormat: 'json',
    });

    return JSON.parse(result.content);
  }

  private matchCommand(content: string): CommandMatch | null {
    const normalized = content.toLowerCase().trim();

    const commands: CommandDefinition[] = [
      {
        patterns: [/^runway\??$/i, /^what'?s? ?(my|our)? ?runway\??$/i],
        intent: 'query_runway',
        entities: {},
      },
      {
        patterns: [/^cash\??$/i, /^how much cash/i, /^bank balance/i],
        intent: 'query_cash_balance',
        entities: {},
      },
      {
        patterns: [/^tasks?\??$/i, /^what('?s| is) (on my|the) list/i, /^to ?do/i],
        intent: 'query_tasks',
        entities: {},
      },
      {
        patterns: [/^schedule (.+)/i, /^book (.+)/i],
        intent: 'schedule_meeting',
        entities: (match) => ({ subject: match[1] }),
      },
      {
        patterns: [/^send invoice (.+)/i, /^invoice (.+)/i],
        intent: 'send_invoice',
        entities: (match) => ({ recipient: match[1] }),
      },
      {
        patterns: [/^approve$/i, /^yes$/i, /^confirm$/i, /^do it$/i],
        intent: 'confirm_action',
        entities: {},
      },
      {
        patterns: [/^cancel$/i, /^no$/i, /^nevermind$/i, /^stop$/i],
        intent: 'cancel_action',
        entities: {},
      },
    ];

    for (const cmd of commands) {
      for (const pattern of cmd.patterns) {
        const match = normalized.match(pattern);
        if (match) {
          return {
            intent: cmd.intent,
            entities:
              typeof cmd.entities === 'function'
                ? cmd.entities(match)
                : cmd.entities,
          };
        }
      }
    }

    return null;
  }
}

// =========================================================================
// INTENT DEFINITIONS
// =========================================================================

const INTENT_DEFINITIONS: IntentDefinition[] = [
  // Queries
  { id: 'query_runway', description: 'Ask about cash runway', category: 'financial' },
  { id: 'query_cash_balance', description: 'Ask about current cash/bank balance', category: 'financial' },
  { id: 'query_revenue', description: 'Ask about revenue or sales', category: 'financial' },
  { id: 'query_expenses', description: 'Ask about expenses or costs', category: 'financial' },
  { id: 'query_tasks', description: 'Ask about pending tasks', category: 'tasks' },
  { id: 'query_deadlines', description: 'Ask about upcoming deadlines', category: 'compliance' },
  { id: 'query_investors', description: 'Ask about investor pipeline', category: 'funding' },
  { id: 'query_metrics', description: 'Ask about KPIs or metrics', category: 'analytics' },
  
  // Actions
  { id: 'send_invoice', description: 'Request to send an invoice', category: 'financial' },
  { id: 'record_expense', description: 'Record an expense', category: 'financial' },
  { id: 'schedule_meeting', description: 'Schedule a meeting', category: 'calendar' },
  { id: 'create_task', description: 'Create a new task', category: 'tasks' },
  { id: 'send_email', description: 'Send an email', category: 'communication' },
  { id: 'request_introduction', description: 'Request an introduction', category: 'networking' },
  { id: 'update_document', description: 'Update a document', category: 'documents' },
  
  // Confirmations
  { id: 'confirm_action', description: 'Confirm a pending action', category: 'system' },
  { id: 'cancel_action', description: 'Cancel a pending action', category: 'system' },
  
  // Other
  { id: 'general_question', description: 'General question about business', category: 'general' },
  { id: 'feedback', description: 'Providing feedback', category: 'system' },
  { id: 'greeting', description: 'Greeting or small talk', category: 'social' },
  { id: 'unknown', description: 'Could not determine intent', category: 'system' },
];
```

## 8.3 Conversation Engine

```typescript
// services/pulse/conversation.service.ts

export class ConversationEngine {
  constructor(
    private readonly ai: AIService,
    private readonly kg: KnowledgeGraphService,
    private readonly actions: ActionExecutor,
    private readonly db: Database
  ) {}

  async processMessage(input: ProcessMessageInput): Promise<ConversationResponse> {
    const { message, intent, conversation, userId } = input;

    // Get user and company context
    const [user, userPrefs, company] = await Promise.all([
      this.db.users.findById(userId),
      this.db.pulseUserPreferences.findByUserId(userId),
      this.getUserPrimaryCompany(userId),
    ]);

    // Route based on intent category
    switch (intent.intent) {
      case 'query_runway':
      case 'query_cash_balance':
      case 'query_revenue':
      case 'query_expenses':
        return this.handleFinancialQuery(intent, company, userPrefs);

      case 'query_tasks':
        return this.handleTasksQuery(intent, company, userId, userPrefs);

      case 'query_deadlines':
        return this.handleDeadlinesQuery(company, userPrefs);

      case 'query_investors':
        return this.handleInvestorQuery(company, userPrefs);

      case 'send_invoice':
        return this.handleSendInvoice(intent, company, conversation);

      case 'record_expense':
        return this.handleRecordExpense(intent, company, conversation);

      case 'schedule_meeting':
        return this.handleScheduleMeeting(intent, userId, conversation);

      case 'create_task':
        return this.handleCreateTask(intent, company, userId, conversation);

      case 'request_introduction':
        return this.handleIntroductionRequest(intent, userId, company, conversation);

      case 'confirm_action':
        return this.handleConfirmAction(conversation);

      case 'cancel_action':
        return this.handleCancelAction(conversation);

      case 'general_question':
        return this.handleGeneralQuestion(message, company, userPrefs);

      case 'greeting':
        return this.handleGreeting(user, company, userPrefs);

      default:
        return this.handleUnknown(message, company, userPrefs);
    }
  }

  // =========================================================================
  // FINANCIAL QUERIES
  // =========================================================================

  private async handleFinancialQuery(
    intent: IntentResult,
    company: Company,
    prefs: UserPreferences
  ): Promise<ConversationResponse> {
    const financials = await this.getFinancialSnapshot(company.id);

    switch (intent.intent) {
      case 'query_runway':
        const runway = financials.runwayMonths;
        const runwayDate = new Date();
        runwayDate.setMonth(runwayDate.getMonth() + Math.floor(runway));

        // Check for urgent items
        const warnings: string[] = [];
        if (financials.overdueReceivables > 0) {
          warnings.push(
            `£${financials.overdueReceivables.toLocaleString()} in overdue invoices`
          );
        }
        if (financials.upcomingBills > financials.cashBalance * 0.3) {
          warnings.push(
            `£${financials.upcomingBills.toLocaleString()} in bills due this week`
          );
        }

        let response = `£${financials.cashBalance.toLocaleString()} cash. `;
        response += `At current burn, ${runway.toFixed(1)} months runway `;
        response += `(until ${runwayDate.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}).`;

        if (warnings.length) {
          response += `\n\n⚠️ ${warnings.join('. ')}.`;
        }

        return {
          message: this.formatResponse(response, prefs),
          quickReplies: ['Show breakdown', 'Outstanding invoices', 'Reduce burn tips'],
        };

      case 'query_cash_balance':
        let cashResponse = `Current balance: £${financials.cashBalance.toLocaleString()}`;

        if (financials.pendingIn > 0) {
          cashResponse += `\n+£${financials.pendingIn.toLocaleString()} pending in`;
        }
        if (financials.pendingOut > 0) {
          cashResponse += `\n-£${financials.pendingOut.toLocaleString()} pending out`;
        }

        return {
          message: this.formatResponse(cashResponse, prefs),
          quickReplies: ['Transaction history', 'Reconcile', 'Forecast'],
        };

      case 'query_revenue':
        const revenueResponse = `
This month: £${financials.monthlyRevenue.toLocaleString()}
vs last month: ${financials.revenueGrowth >= 0 ? '+' : ''}${(financials.revenueGrowth * 100).toFixed(1)}%
MRR: £${financials.mrr?.toLocaleString() || 'N/A'}
        `.trim();

        return {
          message: this.formatResponse(revenueResponse, prefs),
          quickReplies: ['Revenue breakdown', 'Top customers', 'Forecast'],
        };

      default:
        throw new Error(`Unhandled financial query: ${intent.intent}`);
    }
  }

  // =========================================================================
  // ACTION HANDLERS
  // =========================================================================

  private async handleSendInvoice(
    intent: IntentResult,
    company: Company,
    conversation: Conversation
  ): Promise<ConversationResponse> {
    const { recipient, amount, description } = intent.entities;

    // Check if we have enough info
    if (!recipient) {
      return {
        message: 'Who should I send the invoice to?',
        pendingAction: { type: 'send_invoice', step: 'get_recipient' },
      };
    }

    // Try to match recipient to a contact
    const contacts = await this.db.contacts.search(company.id, recipient);

    if (contacts.length === 0) {
      return {
        message: `I couldn't find "${recipient}" in your contacts. What's their email?`,
        pendingAction: {
          type: 'send_invoice',
          step: 'get_email',
          data: { recipientName: recipient },
        },
      };
    }

    if (contacts.length > 1) {
      return {
        message: `I found multiple matches for "${recipient}". Which one?`,
        quickReplies: contacts.slice(0, 4).map((c) => c.companyName || c.email),
        pendingAction: {
          type: 'send_invoice',
          step: 'select_recipient',
          data: { contacts: contacts.map((c) => c.id) },
        },
      };
    }

    const contact = contacts[0];

    if (!amount) {
      return {
        message: `Got it, invoice to ${contact.companyName || contact.email}. What's the amount?`,
        pendingAction: {
          type: 'send_invoice',
          step: 'get_amount',
          data: { contactId: contact.id },
        },
      };
    }

    if (!description) {
      return {
        message: `£${amount.toLocaleString()} to ${contact.companyName}. What's it for?`,
        pendingAction: {
          type: 'send_invoice',
          step: 'get_description',
          data: { contactId: contact.id, amount },
        },
      };
    }

    // All info collected - request confirmation
    return {
      message: `Ready to send:

📄 Invoice to: ${contact.companyName || contact.email}
💷 Amount: £${amount.toLocaleString()}
📝 For: ${description}

Send it?`,
      quickReplies: ['Yes, send it', 'Edit', 'Cancel'],
      pendingAction: {
        type: 'send_invoice',
        step: 'confirm',
        data: { contactId: contact.id, amount, description },
      },
    };
  }

  private async handleConfirmAction(
    conversation: Conversation
  ): Promise<ConversationResponse> {
    const { pendingAction } = conversation.currentContext;

    if (!pendingAction) {
      return {
        message: "There's nothing pending to confirm. What would you like to do?",
      };
    }

    // Execute the pending action
    const result = await this.actions.execute(pendingAction);

    // Clear pending action
    await this.db.pulseConversations.update(conversation.id, {
      currentContext: {
        ...conversation.currentContext,
        pendingAction: null,
      },
    });

    return {
      message: result.message,
      quickReplies: result.followUpActions,
    };
  }

  // =========================================================================
  // RESPONSE FORMATTING
  // =========================================================================

  private formatResponse(content: string, prefs: UserPreferences): string {
    // Apply user preferences
    if (prefs?.preferredResponseLength === 'brief') {
      // Shorten response
      content = this.shortenResponse(content);
    }

    if (prefs?.useEmojis === false) {
      // Remove emojis
      content = content.replace(/[\u{1F600}-\u{1F64F}]/gu, '');
      content = content.replace(/[\u{1F300}-\u{1F5FF}]/gu, '');
      content = content.replace(/[\u{1F680}-\u{1F6FF}]/gu, '');
      content = content.replace(/[\u{2600}-\u{26FF}]/gu, '');
    }

    // Apply terminology mappings
    if (prefs?.terminologyMap) {
      for (const [term, replacement] of Object.entries(prefs.terminologyMap)) {
        content = content.replace(new RegExp(replacement, 'gi'), term);
      }
    }

    return content.trim();
  }

  private shortenResponse(content: string): string {
    // Remove verbose phrases
    content = content.replace(/I wanted to let you know that /gi, '');
    content = content.replace(/Just to update you, /gi, '');
    content = content.replace(/As you may know, /gi, '');

    // Truncate if too long
    if (content.length > 300) {
      const sentences = content.split(/[.!?]+/);
      content = sentences.slice(0, 2).join('. ') + '.';
    }

    return content;
  }
}
```

## 8.4 Proactive Outreach

```typescript
// services/pulse/proactive.service.ts

export class ProactiveService {
  constructor(
    private readonly db: Database,
    private readonly queue: QueueService,
    private readonly channels: ChannelAdapterRegistry,
    private readonly ai: AIService
  ) {}

  // =========================================================================
  // SCHEDULED BRIEFINGS
  // =========================================================================

  async generateMorningBriefing(userId: string): Promise<void> {
    const [user, prefs, company] = await Promise.all([
      this.db.users.findById(userId),
      this.db.pulseUserPreferences.findByUserId(userId),
      this.getUserPrimaryCompany(userId),
    ]);

    // Check if user wants briefings
    if (!prefs?.morningBriefingEnabled) return;

    // Gather data
    const [tasks, deadlines, calendar, financials, metrics] = await Promise.all([
      this.getTodaysTasks(company.id, userId),
      this.getUpcomingDeadlines(company.id, 7),
      this.getTodaysCalendar(userId),
      this.getFinancialSnapshot(company.id),
      this.getKeyMetrics(company.id),
    ]);

    // Generate briefing
    const briefing = await this.composeBriefing({
      user,
      prefs,
      tasks,
      deadlines,
      calendar,
      financials,
      metrics,
    });

    // Schedule send at user's preferred time
    const sendTime = this.calculateSendTime(prefs.morningBriefingTime, user.timezone);

    await this.queue.add(
      'pulse:send',
      {
        userId,
        channel: prefs.preferredChannel,
        message: briefing.message,
        quickReplies: briefing.quickReplies,
      },
      { delay: sendTime - Date.now() }
    );
  }

  private async composeBriefing(data: BriefingData): Promise<BriefingMessage> {
    const parts: string[] = [];
    const warnings: string[] = [];

    // Greeting
    const greeting = this.getTimeBasedGreeting(data.user.firstName);
    parts.push(greeting);

    // Today's schedule
    if (data.calendar.length > 0) {
      parts.push(`\n📅 Today: ${data.calendar.length} meeting${data.calendar.length > 1 ? 's' : ''}`);
      const nextMeeting = data.calendar[0];
      parts.push(`  Next: ${nextMeeting.title} at ${this.formatTime(nextMeeting.start)}`);
    }

    // Priority tasks
    const urgentTasks = data.tasks.filter((t) => t.priority === 'urgent');
    const highTasks = data.tasks.filter((t) => t.priority === 'high');

    if (urgentTasks.length > 0) {
      warnings.push(`${urgentTasks.length} urgent task${urgentTasks.length > 1 ? 's' : ''}`);
    }
    if (highTasks.length > 0) {
      parts.push(`\n✅ ${highTasks.length + urgentTasks.length} priority tasks today`);
    }

    // Deadlines
    const thisWeekDeadlines = data.deadlines.filter(
      (d) => new Date(d.dueDate) <= this.endOfWeek()
    );
    if (thisWeekDeadlines.length > 0) {
      parts.push(`\n⏰ ${thisWeekDeadlines.length} deadline${thisWeekDeadlines.length > 1 ? 's' : ''} this week`);

      const critical = thisWeekDeadlines.filter((d) => d.penaltyAmount > 0);
      if (critical.length > 0) {
        warnings.push(`${critical.length} with penalties`);
      }
    }

    // Financial snapshot (brief)
    if (data.financials.runwayMonths < 6) {
      warnings.push(`Runway: ${data.financials.runwayMonths.toFixed(1)} months`);
    }

    // Key metric changes
    const significantChanges = this.findSignificantMetricChanges(data.metrics);
    if (significantChanges.length > 0) {
      parts.push(`\n📊 ${significantChanges[0].name}: ${significantChanges[0].change}`);
    }

    // Compose message
    let message = parts.join('');

    if (warnings.length > 0) {
      message += `\n\n⚠️ Needs attention: ${warnings.join(', ')}`;
    }

    return {
      message,
      quickReplies: ['Show tasks', 'Today\'s schedule', 'Runway', 'Skip briefing'],
    };
  }

  // =========================================================================
  // ALERTS & NOTIFICATIONS
  // =========================================================================

  async checkAlerts(): Promise<void> {
    // This runs on a schedule (e.g., every 15 minutes)

    // Check all active companies
    const companies = await this.db.companies.findActive();

    for (const company of companies) {
      const alerts = await this.detectAlerts(company.id);

      for (const alert of alerts) {
        // Check if already notified
        if (await this.wasRecentlyNotified(company.id, alert.type)) continue;

        // Get users to notify
        const users = await this.getAlertRecipients(company.id, alert.type);

        for (const user of users) {
          await this.sendAlert(user, alert);
        }
      }
    }
  }

  private async detectAlerts(companyId: string): Promise<Alert[]> {
    const alerts: Alert[] = [];

    // Low runway alert
    const financials = await this.getFinancialSnapshot(companyId);
    if (financials.runwayMonths < 3) {
      alerts.push({
        type: 'low_runway',
        severity: financials.runwayMonths < 1 ? 'critical' : 'warning',
        title: 'Low Runway Alert',
        message: `Runway is down to ${financials.runwayMonths.toFixed(1)} months`,
        data: { runwayMonths: financials.runwayMonths },
      });
    }

    // Large expense alert
    const recentTransactions = await this.getRecentTransactions(companyId, 24);
    const largeExpenses = recentTransactions.filter(
      (t) =>
        t.transactionType === 'expense' &&
        t.amount > financials.averageMonthlyExpense * 0.2
    );
    for (const expense of largeExpenses) {
      alerts.push({
        type: 'large_expense',
        severity: 'info',
        title: 'Large Expense',
        message: `£${expense.amount.toLocaleString()} - ${expense.description}`,
        data: { transactionId: expense.id },
        requiresAcknowledgment: true,
      });
    }

    // Deadline approaching
    const deadlines = await this.getUpcomingDeadlines(companyId, 3);
    for (const deadline of deadlines) {
      if (deadline.status !== 'completed') {
        alerts.push({
          type: 'deadline_approaching',
          severity: deadline.penaltyAmount ? 'warning' : 'info',
          title: deadline.title,
          message: `Due ${this.formatRelativeDate(deadline.dueDate)}`,
          data: { deadlineId: deadline.id },
        });
      }
    }

    // Overdue invoices
    const overdueInvoices = await this.getOverdueInvoices(companyId);
    if (overdueInvoices.length > 0) {
      const totalOverdue = overdueInvoices.reduce((sum, i) => sum + i.amountDue, 0);
      alerts.push({
        type: 'overdue_invoices',
        severity: 'warning',
        title: 'Overdue Invoices',
        message: `${overdueInvoices.length} invoices overdue (£${totalOverdue.toLocaleString()})`,
        data: { invoiceIds: overdueInvoices.map((i) => i.id) },
        actions: ['Send reminders', 'View list'],
      });
    }

    return alerts;
  }

  private async sendAlert(user: User, alert: Alert): Promise<void> {
    const prefs = await this.db.pulseUserPreferences.findByUserId(user.id);

    // Check quiet hours
    if (this.isQuietHours(prefs, user.timezone) && alert.severity !== 'critical') {
      // Queue for later
      await this.queue.add(
        'pulse:alert',
        { userId: user.id, alert },
        { delay: this.msUntilActiveHours(prefs, user.timezone) }
      );
      return;
    }

    // Get preferred channel
    const channel = prefs?.preferredChannel || 'whatsapp';

    // Format message
    const message = this.formatAlertMessage(alert, prefs);

    // Send
    await this.channels.get(channel).send({
      to: user[channel === 'email' ? 'email' : 'phone'],
      message,
      quickReplies: alert.actions,
    });

    // Record notification
    await this.db.alertNotifications.create({
      companyId: alert.companyId,
      userId: user.id,
      alertType: alert.type,
      sentAt: new Date(),
    });
  }
}
```


---

# 9. API SPECIFICATIONS

## 9.1 API Standards

### 9.1.1 URL Structure

```
https://api.genesis-engine.com/v1/{resource}
https://api.genesis-engine.com/v1/{resource}/{id}
https://api.genesis-engine.com/v1/{resource}/{id}/{sub-resource}
```

### 9.1.2 Request/Response Format

```typescript
// Standard request headers
interface RequestHeaders {
  'Authorization': `Bearer ${string}`;
  'Content-Type': 'application/json';
  'X-Request-ID': string;     // UUID for tracing
  'X-Company-ID'?: string;    // For multi-company users
  'Accept-Language'?: string; // e.g., 'en-GB'
}

// Standard success response
interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    requestId: string;
    timestamp: string;
    pagination?: PaginationMeta;
  };
}

// Standard error response
interface ErrorResponse {
  success: false;
  error: {
    code: string;           // e.g., 'VALIDATION_ERROR'
    message: string;        // Human-readable message
    details?: unknown;      // Additional context
    field?: string;         // For validation errors
    requestId: string;
  };
}

// Pagination
interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

interface PaginatedResponse<T> extends SuccessResponse<T[]> {
  meta: {
    requestId: string;
    timestamp: string;
    pagination: PaginationMeta;
  };
}
```

### 9.1.3 HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (successful DELETE) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (e.g., duplicate) |
| 422 | Unprocessable Entity |
| 429 | Rate Limited |
| 500 | Internal Server Error |
| 503 | Service Unavailable |

## 9.2 Core Endpoints

### 9.2.1 Authentication

```yaml
# POST /v1/auth/register
Request:
  email: string (required, email format)
  password: string (required, min 8 chars)
  firstName: string (optional)
  lastName: string (optional)
Response (201):
  user: User
  accessToken: string
  refreshToken: string

# POST /v1/auth/login
Request:
  email: string (required)
  password: string (required)
Response (200):
  user: User
  accessToken: string
  refreshToken: string
Error (401):
  code: AUTH_INVALID_CREDENTIALS

# POST /v1/auth/refresh
Request:
  refreshToken: string (required)
Response (200):
  accessToken: string
  refreshToken: string

# POST /v1/auth/logout
Request:
  refreshToken: string (optional)
  allDevices: boolean (optional, default false)
Response (204): No content

# POST /v1/auth/forgot-password
Request:
  email: string (required)
Response (200):
  message: "Password reset email sent"

# POST /v1/auth/reset-password
Request:
  token: string (required)
  password: string (required)
Response (200):
  message: "Password updated"
```

### 9.2.2 Companies

```yaml
# GET /v1/companies
Query:
  page: number (default 1)
  perPage: number (default 20, max 100)
  status: string (optional, filter)
Response (200):
  data: Company[]
  meta.pagination: PaginationMeta

# POST /v1/companies
Request:
  name: string (required)
  companyType: 'ltd' | 'plc' | 'llp' | etc (default 'ltd')
  natureOfBusiness: string (optional)
  registeredAddress: Address (optional)
Response (201):
  data: Company

# GET /v1/companies/:id
Response (200):
  data: Company

# PATCH /v1/companies/:id
Request:
  name: string (optional)
  tradingName: string (optional)
  natureOfBusiness: string (optional)
  sicCodes: string[] (optional)
  registeredAddress: Address (optional)
  businessAddress: Address (optional)
Response (200):
  data: Company

# GET /v1/companies/:id/context
Description: Get full company context for AI
Response (200):
  data: CompanyContext (includes founders, team, financials, etc.)

# POST /v1/companies/:id/incorporate
Description: Initiate company incorporation
Request:
  articlesTemplate: string (default 'model')
  directors: Director[] (required)
  shareholders: Shareholder[] (required)
  shareCapital: ShareCapital (required)
Response (202):
  data:
    incorporationId: string
    status: 'pending'
    estimatedCompletion: datetime

# GET /v1/companies/:id/officers
Response (200):
  data: Officer[]

# GET /v1/companies/:id/shareholders
Response (200):
  data: Shareholder[]

# GET /v1/companies/:id/share-classes
Response (200):
  data: ShareClass[]

# GET /v1/companies/:id/cap-table
Response (200):
  data: CapTable
```

### 9.2.3 Financial

```yaml
# GET /v1/companies/:id/financial/snapshot
Response (200):
  data:
    cashBalance: number
    runwayMonths: number
    monthlyBurn: number
    monthlyRevenue: number
    mrr: number
    arr: number
    revenueGrowth: number
    grossMargin: number
    overdueReceivables: number
    upcomingBills: number
    lastUpdated: datetime

# GET /v1/companies/:id/transactions
Query:
  page, perPage, startDate, endDate, type, category
Response (200):
  data: Transaction[]
  meta.pagination

# POST /v1/companies/:id/transactions
Request:
  transactionDate: date (required)
  description: string (required)
  amount: number (required)
  transactionType: 'income' | 'expense' | 'transfer' (required)
  category: string (optional)
  bankAccountId: string (optional)
Response (201):
  data: Transaction

# GET /v1/companies/:id/invoices
Query:
  page, perPage, status, customerId, startDate, endDate
Response (200):
  data: Invoice[]

# POST /v1/companies/:id/invoices
Request:
  customerId: string (optional)
  customerName: string (required if no customerId)
  customerEmail: string (required)
  dueDate: date (required)
  items: InvoiceItem[] (required)
  notes: string (optional)
Response (201):
  data: Invoice

# POST /v1/companies/:id/invoices/:invoiceId/send
Request:
  emailTemplate: string (optional)
  message: string (optional)
Response (200):
  data:
    sentAt: datetime
    sentTo: string

# GET /v1/companies/:id/metrics
Query:
  metrics: string[] (e.g., ['mrr', 'churn', 'cac', 'ltv'])
  period: 'day' | 'week' | 'month' | 'quarter'
  startDate: date
  endDate: date
Response (200):
  data: MetricDataPoint[]

# POST /v1/companies/:id/financial-model
Request:
  scenarioName: string (required)
  assumptions: FinancialAssumptions (required)
Response (201):
  data: FinancialModel
```

### 9.2.4 Documents

```yaml
# GET /v1/companies/:id/documents
Query:
  page, perPage, type, category, status, search
Response (200):
  data: Document[]

# POST /v1/companies/:id/documents
Request (multipart/form-data):
  file: File (required)
  documentType: string (required)
  category: string (optional)
  description: string (optional)
Response (201):
  data: Document

# POST /v1/companies/:id/documents/generate
Request:
  documentType: string (required)
  template: string (optional)
  data: object (template-specific data)
Response (202):
  data:
    jobId: string
    status: 'processing'

# GET /v1/documents/:id
Response (200):
  data: Document (includes signed URL for download)

# DELETE /v1/documents/:id
Response (204): No content

# POST /v1/documents/:id/sign
Request:
  signers: Signer[] (required)
  signatureProvider: 'docusign' | 'pandadoc' (default 'docusign')
Response (200):
  data:
    envelopeId: string
    signingUrl: string
    status: 'sent'
```

### 9.2.5 Tasks

```yaml
# GET /v1/companies/:id/tasks
Query:
  page, perPage, status, priority, assignee, dueDate, category
Response (200):
  data: Task[]

# POST /v1/companies/:id/tasks
Request:
  title: string (required)
  description: string (optional)
  priority: 'low' | 'medium' | 'high' | 'urgent' (default 'medium')
  dueDate: date (optional)
  assigneeId: string (optional)
  category: string (optional)
Response (201):
  data: Task

# PATCH /v1/tasks/:id
Request:
  title, description, priority, dueDate, assigneeId, status
Response (200):
  data: Task

# POST /v1/tasks/:id/complete
Response (200):
  data: Task (with status: 'completed')
```

### 9.2.6 The Nexus

```yaml
# GET /v1/nexus/investor-matches
Query:
  companyId: string (required)
  limit: number (default 10)
  stages: string[] (optional filter)
  sectors: string[] (optional filter)
Response (200):
  data: InvestorMatch[]

# GET /v1/nexus/advisor-matches
Query:
  companyId: string (required)
  skillsNeeded: string[] (optional)
  limit: number (default 10)
Response (200):
  data: AdvisorMatch[]

# POST /v1/nexus/introduction-requests
Request:
  targetUserId: string (required)
  companyId: string (required)
  introductionType: 'investor' | 'advisor' | 'customer' | etc (required)
  message: string (required)
  context: string (optional)
Response (201):
  data: IntroductionRequest

# GET /v1/nexus/introduction-requests
Query:
  status, direction ('sent' | 'received' | 'introducing')
Response (200):
  data: IntroductionRequest[]

# POST /v1/nexus/introduction-requests/:id/approve
Response (200):
  data: IntroductionRequest

# POST /v1/nexus/introduction-requests/:id/accept
Request:
  scheduleCall: boolean (default true)
Response (200):
  data: IntroductionRequest

# GET /v1/nexus/trust-score
Response (200):
  data: TrustScore

# POST /v1/nexus/vouch/:userId
Request:
  context: string (required)
Response (201):
  data: { success: true }

# GET /v1/nexus/funding-rounds
Query:
  companyId: string (required)
Response (200):
  data: FundingRound[]

# POST /v1/nexus/funding-rounds
Request:
  companyId: string (required)
  roundName: string (required)
  roundType: string (required)
  targetAmount: number (required)
  preMoneyValuation: number (optional)
  shareClassId: string (optional)
  seisEligible: boolean (optional)
  eisEligible: boolean (optional)
Response (201):
  data: FundingRound

# GET /v1/nexus/seis-eis/eligibility
Query:
  companyId: string (required)
Response (200):
  data: EligibilityResult

# POST /v1/nexus/seis-eis/advance-assurance
Request:
  companyId: string (required)
  schemeType: 'seis' | 'eis' (required)
Response (201):
  data: AdvanceAssuranceApplication

# GET /v1/nexus/grants
Query:
  companyId: string (required)
  limit: number (default 20)
Response (200):
  data: GrantMatch[]

# GET /v1/nexus/rbf/eligibility
Query:
  companyId: string (required)
Response (200):
  data: RBFEligibilityResult[]
```

### 9.2.7 Pulse

```yaml
# GET /v1/pulse/conversations
Response (200):
  data: PulseConversation[]

# GET /v1/pulse/conversations/:id/messages
Query:
  page, perPage, before, after
Response (200):
  data: PulseMessage[]

# POST /v1/pulse/settings
Request:
  enabled: boolean (optional)
  preferredChannel: 'sms' | 'whatsapp' | 'telegram' | 'email' (optional)
  activeHoursStart: time (optional)
  activeHoursEnd: time (optional)
  digestTime: time (optional)
Response (200):
  data: PulseSettings

# POST /v1/pulse/send-test
Request:
  channel: 'sms' | 'whatsapp' | 'telegram'
Response (200):
  data: { sent: true }

# WebSocket: wss://api.genesis-engine.com/v1/pulse/ws
Events:
  - message.received
  - message.sent
  - action.pending
  - action.completed
```

---

# 10. ERROR HANDLING

## 10.1 Error Codes

```typescript
// errors/codes.ts

export const ERROR_CODES = {
  // Authentication (1xxx)
  AUTH_INVALID_CREDENTIALS: { code: 'AUTH_1001', status: 401, message: 'Invalid email or password' },
  AUTH_TOKEN_EXPIRED: { code: 'AUTH_1002', status: 401, message: 'Token has expired' },
  AUTH_TOKEN_INVALID: { code: 'AUTH_1003', status: 401, message: 'Invalid token' },
  AUTH_SESSION_EXPIRED: { code: 'AUTH_1004', status: 401, message: 'Session has expired' },
  AUTH_MFA_REQUIRED: { code: 'AUTH_1005', status: 401, message: 'MFA verification required' },
  AUTH_MFA_INVALID: { code: 'AUTH_1006', status: 401, message: 'Invalid MFA code' },
  AUTH_ACCOUNT_LOCKED: { code: 'AUTH_1007', status: 403, message: 'Account is locked' },
  AUTH_ACCOUNT_SUSPENDED: { code: 'AUTH_1008', status: 403, message: 'Account is suspended' },
  AUTH_EMAIL_NOT_VERIFIED: { code: 'AUTH_1009', status: 403, message: 'Email not verified' },
  AUTH_PASSWORD_TOO_WEAK: { code: 'AUTH_1010', status: 400, message: 'Password does not meet requirements' },

  // Validation (2xxx)
  VALIDATION_FAILED: { code: 'VAL_2001', status: 400, message: 'Validation failed' },
  VALIDATION_REQUIRED_FIELD: { code: 'VAL_2002', status: 400, message: 'Required field missing' },
  VALIDATION_INVALID_FORMAT: { code: 'VAL_2003', status: 400, message: 'Invalid format' },
  VALIDATION_OUT_OF_RANGE: { code: 'VAL_2004', status: 400, message: 'Value out of allowed range' },
  VALIDATION_DUPLICATE: { code: 'VAL_2005', status: 409, message: 'Duplicate entry' },
  VALIDATION_INVALID_ENUM: { code: 'VAL_2006', status: 400, message: 'Invalid enum value' },

  // Resources (3xxx)
  RESOURCE_NOT_FOUND: { code: 'RES_3001', status: 404, message: 'Resource not found' },
  RESOURCE_ALREADY_EXISTS: { code: 'RES_3002', status: 409, message: 'Resource already exists' },
  RESOURCE_DELETED: { code: 'RES_3003', status: 410, message: 'Resource has been deleted' },
  RESOURCE_LOCKED: { code: 'RES_3004', status: 423, message: 'Resource is locked' },

  // Permissions (4xxx)
  PERMISSION_DENIED: { code: 'PERM_4001', status: 403, message: 'Permission denied' },
  PERMISSION_ROLE_REQUIRED: { code: 'PERM_4002', status: 403, message: 'Insufficient role' },
  PERMISSION_COMPANY_ACCESS: { code: 'PERM_4003', status: 403, message: 'No access to this company' },
  PERMISSION_FEATURE_DISABLED: { code: 'PERM_4004', status: 403, message: 'Feature not enabled' },
  PERMISSION_SUBSCRIPTION_REQUIRED: { code: 'PERM_4005', status: 402, message: 'Subscription required' },

  // External Services (5xxx)
  EXTERNAL_SERVICE_ERROR: { code: 'EXT_5001', status: 502, message: 'External service error' },
  EXTERNAL_SERVICE_TIMEOUT: { code: 'EXT_5002', status: 504, message: 'External service timeout' },
  EXTERNAL_SERVICE_UNAVAILABLE: { code: 'EXT_5003', status: 503, message: 'External service unavailable' },
  COMPANIES_HOUSE_ERROR: { code: 'EXT_5010', status: 502, message: 'Companies House API error' },
  HMRC_ERROR: { code: 'EXT_5011', status: 502, message: 'HMRC API error' },
  STRIPE_ERROR: { code: 'EXT_5020', status: 502, message: 'Payment processing error' },
  TWILIO_ERROR: { code: 'EXT_5030', status: 502, message: 'Messaging service error' },
  AI_SERVICE_ERROR: { code: 'EXT_5040', status: 502, message: 'AI service error' },

  // Rate Limiting (6xxx)
  RATE_LIMIT_EXCEEDED: { code: 'RATE_6001', status: 429, message: 'Rate limit exceeded' },
  QUOTA_EXCEEDED: { code: 'RATE_6002', status: 429, message: 'Quota exceeded' },

  // Business Logic (7xxx)
  BUSINESS_INVALID_STATE: { code: 'BUS_7001', status: 422, message: 'Invalid state for this operation' },
  BUSINESS_PREREQUISITE_MISSING: { code: 'BUS_7002', status: 422, message: 'Prerequisite not met' },
  BUSINESS_LIMIT_REACHED: { code: 'BUS_7003', status: 422, message: 'Limit reached' },
  BUSINESS_ELIGIBILITY_FAILED: { code: 'BUS_7004', status: 422, message: 'Eligibility check failed' },
  BUSINESS_HANDOFF_REQUIRED: { code: 'BUS_7005', status: 422, message: 'Professional assistance required' },

  // System (9xxx)
  INTERNAL_ERROR: { code: 'SYS_9001', status: 500, message: 'Internal server error' },
  DATABASE_ERROR: { code: 'SYS_9002', status: 500, message: 'Database error' },
  CONFIGURATION_ERROR: { code: 'SYS_9003', status: 500, message: 'Configuration error' },
  MAINTENANCE_MODE: { code: 'SYS_9004', status: 503, message: 'System under maintenance' },
} as const;
```

## 10.2 Error Handler

```typescript
// middleware/error-handler.ts

import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';
import { ERROR_CODES } from '../errors/codes';
import { logger } from '../lib/logger';
import { metrics } from '../lib/metrics';

export async function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  const requestId = request.id;

  // Log error
  logger.error({
    requestId,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: error.code,
    },
    request: {
      method: request.method,
      url: request.url,
      userId: request.user?.id,
    },
  });

  // Track metric
  metrics.increment('api.errors', {
    code: error.code || 'UNKNOWN',
    path: request.url.split('?')[0],
  });

  // Handle known error types
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
        field: error.field,
        requestId,
      },
    });
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const details = error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
      code: e.code,
    }));

    return reply.status(400).send({
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_FAILED.code,
        message: 'Validation failed',
        details,
        requestId,
      },
    });
  }

  // Handle database errors
  if (error.code === '23505') {
    // Unique violation
    return reply.status(409).send({
      success: false,
      error: {
        code: ERROR_CODES.RESOURCE_ALREADY_EXISTS.code,
        message: 'Resource already exists',
        requestId,
      },
    });
  }

  if (error.code === '23503') {
    // Foreign key violation
    return reply.status(400).send({
      success: false,
      error: {
        code: ERROR_CODES.VALIDATION_FAILED.code,
        message: 'Referenced resource does not exist',
        requestId,
      },
    });
  }

  // Handle rate limiting
  if (error.statusCode === 429) {
    return reply.status(429).send({
      success: false,
      error: {
        code: ERROR_CODES.RATE_LIMIT_EXCEEDED.code,
        message: 'Too many requests',
        details: {
          retryAfter: error.headers?.['Retry-After'],
        },
        requestId,
      },
    });
  }

  // Default: Internal server error
  // Don't expose internal details in production
  const isProd = process.env.NODE_ENV === 'production';

  return reply.status(500).send({
    success: false,
    error: {
      code: ERROR_CODES.INTERNAL_ERROR.code,
      message: isProd ? 'An unexpected error occurred' : error.message,
      requestId,
    },
  });
}

// Custom error class
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number,
    public details?: unknown,
    public field?: string
  ) {
    super(message);
    this.name = 'AppError';
  }

  static fromCode(
    errorCode: keyof typeof ERROR_CODES,
    overrides?: { message?: string; details?: unknown; field?: string }
  ): AppError {
    const def = ERROR_CODES[errorCode];
    return new AppError(
      def.code,
      overrides?.message || def.message,
      def.status,
      overrides?.details,
      overrides?.field
    );
  }
}
```

## 10.3 Retry Logic

```typescript
// lib/retry.ts

export interface RetryOptions {
  attempts: number;
  delay: number;
  backoff: 'fixed' | 'exponential' | 'linear';
  maxDelay?: number;
  retryOn?: (error: Error) => boolean;
  onRetry?: (error: Error, attempt: number) => void;
}

const defaultOptions: RetryOptions = {
  attempts: 3,
  delay: 1000,
  backoff: 'exponential',
  maxDelay: 30000,
};

export async function retry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...defaultOptions, ...options };
  let lastError: Error;

  for (let attempt = 1; attempt <= opts.attempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if we should retry this error
      if (opts.retryOn && !opts.retryOn(lastError)) {
        throw lastError;
      }

      // Last attempt - throw
      if (attempt === opts.attempts) {
        throw lastError;
      }

      // Calculate delay
      let delay: number;
      switch (opts.backoff) {
        case 'fixed':
          delay = opts.delay;
          break;
        case 'linear':
          delay = opts.delay * attempt;
          break;
        case 'exponential':
          delay = opts.delay * Math.pow(2, attempt - 1);
          break;
      }

      // Apply max delay
      if (opts.maxDelay) {
        delay = Math.min(delay, opts.maxDelay);
      }

      // Add jitter (±10%)
      delay = delay * (0.9 + Math.random() * 0.2);

      // Callback
      if (opts.onRetry) {
        opts.onRetry(lastError, attempt);
      }

      // Wait
      await sleep(delay);
    }
  }

  throw lastError!;
}

// Specific retry configurations for different services
export const retryConfigs = {
  companiesHouse: {
    attempts: 3,
    delay: 2000,
    backoff: 'exponential' as const,
    retryOn: (error: Error) => {
      // Retry on network errors and 5xx
      return error.message.includes('ECONNREFUSED') ||
             error.message.includes('ETIMEDOUT') ||
             (error as any).statusCode >= 500;
    },
  },
  
  hmrc: {
    attempts: 3,
    delay: 5000,
    backoff: 'exponential' as const,
    maxDelay: 60000,
  },
  
  ai: {
    attempts: 2,
    delay: 1000,
    backoff: 'fixed' as const,
    retryOn: (error: Error) => {
      return error.message.includes('rate_limit') ||
             error.message.includes('overloaded');
    },
  },
  
  database: {
    attempts: 3,
    delay: 100,
    backoff: 'exponential' as const,
    retryOn: (error: Error) => {
      // Retry on deadlocks and connection errors
      return error.message.includes('deadlock') ||
             error.message.includes('connection');
    },
  },
};
```


---

# 11. SECURITY

## 11.1 Authentication & Authorization

### 11.1.1 JWT Token Structure

```typescript
// Token payload
interface AccessTokenPayload {
  sub: string;           // User ID
  email: string;
  sessionId: string;
  iat: number;           // Issued at
  exp: number;           // Expires at
}

// Token configuration
const JWT_CONFIG = {
  algorithm: 'HS256',
  accessTokenExpiry: '15m',
  refreshTokenExpiry: '7d',
  issuer: 'genesis-engine',
};
```

### 11.1.2 Permission System

```typescript
// permissions/rbac.ts

export const ROLES = {
  owner: {
    description: 'Full access to all company resources',
    inherits: ['admin'],
    permissions: ['*'],
  },
  admin: {
    description: 'Administrative access',
    inherits: ['member'],
    permissions: [
      'company.settings.write',
      'company.members.manage',
      'company.billing.manage',
      'documents.delete',
      'tasks.assign.any',
    ],
  },
  member: {
    description: 'Standard team member',
    inherits: ['viewer'],
    permissions: [
      'company.read',
      'documents.create',
      'documents.edit.own',
      'tasks.create',
      'tasks.edit.own',
      'transactions.create',
      'invoices.create',
      'contacts.manage',
      'nexus.introductions.request',
      'pulse.use',
    ],
  },
  viewer: {
    description: 'Read-only access',
    permissions: [
      'company.read',
      'documents.read',
      'tasks.read',
      'transactions.read',
      'invoices.read',
      'contacts.read',
    ],
  },
  advisor: {
    description: 'External advisor with limited access',
    permissions: [
      'company.read.limited',
      'documents.read.shared',
      'tasks.read.assigned',
      'nexus.introductions.request',
    ],
  },
  investor: {
    description: 'Investor with data room access',
    permissions: [
      'company.read.investor',
      'documents.read.dataroom',
    ],
  },
} as const;

export type Role = keyof typeof ROLES;

// Permission checker
export async function checkPermission(
  userId: string,
  companyId: string,
  permission: string
): Promise<boolean> {
  const membership = await db.companyMembers.findOne({
    userId,
    companyId,
  });

  if (!membership) return false;

  const role = ROLES[membership.role as Role];
  return hasPermission(role, permission);
}

function hasPermission(role: typeof ROLES[Role], permission: string): boolean {
  // Check wildcard
  if (role.permissions.includes('*')) return true;

  // Check direct permission
  if (role.permissions.includes(permission)) return true;

  // Check inherited permissions
  if (role.inherits) {
    for (const inheritedRole of role.inherits) {
      if (hasPermission(ROLES[inheritedRole as Role], permission)) {
        return true;
      }
    }
  }

  return false;
}
```

### 11.1.3 Authorization Middleware

```typescript
// middleware/auth.ts

export function requireAuth(
  opts: { permissions?: string[]; roles?: Role[] } = {}
): FastifyMiddleware {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    // Extract token
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw AppError.fromCode('AUTH_TOKEN_INVALID');
    }

    const token = authHeader.slice(7);

    // Verify token
    const payload = await authService.verifyToken(token);

    // Attach user to request
    request.user = await db.users.findById(payload.sub);
    if (!request.user) {
      throw AppError.fromCode('AUTH_TOKEN_INVALID');
    }

    // Check account status
    if (request.user.status === 'suspended') {
      throw AppError.fromCode('AUTH_ACCOUNT_SUSPENDED');
    }

    // Check company access if companyId in params
    const companyId = request.params.companyId || request.body?.companyId;
    if (companyId) {
      const membership = await db.companyMembers.findOne({
        userId: request.user.id,
        companyId,
      });

      if (!membership) {
        throw AppError.fromCode('PERMISSION_COMPANY_ACCESS');
      }

      request.company = await db.companies.findById(companyId);
      request.membership = membership;

      // Check role requirement
      if (opts.roles?.length && !opts.roles.includes(membership.role as Role)) {
        throw AppError.fromCode('PERMISSION_ROLE_REQUIRED');
      }

      // Check permission requirements
      if (opts.permissions?.length) {
        for (const permission of opts.permissions) {
          const hasPermission = await checkPermission(
            request.user.id,
            companyId,
            permission
          );
          if (!hasPermission) {
            throw AppError.fromCode('PERMISSION_DENIED', {
              details: { requiredPermission: permission },
            });
          }
        }
      }
    }
  };
}
```

## 11.2 Data Encryption

### 11.2.1 Encryption at Rest

```typescript
// lib/encryption.ts

import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;

export class EncryptionService {
  private masterKey: Buffer;

  constructor(encryptionKey: string) {
    this.masterKey = Buffer.from(encryptionKey, 'hex');
    if (this.masterKey.length !== KEY_LENGTH) {
      throw new Error('Invalid encryption key length');
    }
  }

  async encrypt(plaintext: string): Promise<string> {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, this.masterKey, iv);

    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    // Format: iv:authTag:encrypted (all base64)
    return [
      iv.toString('base64'),
      authTag.toString('base64'),
      encrypted.toString('base64'),
    ].join(':');
  }

  async decrypt(ciphertext: string): Promise<string> {
    const [ivB64, authTagB64, encryptedB64] = ciphertext.split(':');

    const iv = Buffer.from(ivB64, 'base64');
    const authTag = Buffer.from(authTagB64, 'base64');
    const encrypted = Buffer.from(encryptedB64, 'base64');

    const decipher = createDecipheriv(ALGORITHM, this.masterKey, iv);
    decipher.setAuthTag(authTag);

    const decrypted = Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }

  // For field-level encryption with separate key
  async encryptField(
    plaintext: string,
    fieldKey: string,
    context: string
  ): Promise<string> {
    // Derive field-specific key using context
    const salt = Buffer.from(context);
    const derivedKey = (await scryptAsync(
      Buffer.from(fieldKey, 'hex'),
      salt,
      KEY_LENGTH
    )) as Buffer;

    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ALGORITHM, derivedKey, iv);

    const encrypted = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);

    const authTag = cipher.getAuthTag();

    return [
      iv.toString('base64'),
      authTag.toString('base64'),
      encrypted.toString('base64'),
    ].join(':');
  }
}

// Encrypted fields in database
export const ENCRYPTED_FIELDS = {
  users: ['nationalInsurance', 'passportNumber'],
  shareholders: ['dateOfBirth', 'address'],
  officers: ['dateOfBirth', 'residentialAddress'],
  bankAccounts: ['accountNumber', 'sortCode'],
  apiCredentials: ['accessToken', 'refreshToken', 'secret'],
};
```

### 11.2.2 Encryption in Transit

All traffic uses TLS 1.3 minimum. Configuration:

```yaml
# nginx/ssl.conf
ssl_protocols TLSv1.3 TLSv1.2;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers on;
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:50m;
ssl_stapling on;
ssl_stapling_verify on;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

## 11.3 Input Validation

```typescript
// validation/schemas.ts

import { z } from 'zod';

// Common patterns
const emailSchema = z.string().email().toLowerCase();
const phoneSchema = z.string().regex(/^\+?[1-9]\d{9,14}$/);
const uuidSchema = z.string().uuid();
const dateSchema = z.string().datetime().or(z.date());
const currencySchema = z.number().positive().multipleOf(0.01);
const postcodeSchema = z.string().regex(/^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i);

// Sanitization
export function sanitize(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Basic XSS prevention
    .slice(0, 10000);     // Length limit
}

// Request schemas
export const schemas = {
  createCompany: z.object({
    name: z.string().min(1).max(160).transform(sanitize),
    companyType: z.enum(['ltd', 'plc', 'llp', 'partnership', 'sole_trader']).default('ltd'),
    natureOfBusiness: z.string().max(1000).optional().transform(s => s ? sanitize(s) : s),
    registeredAddress: z.object({
      line1: z.string().max(255),
      line2: z.string().max(255).optional(),
      city: z.string().max(100),
      county: z.string().max(100).optional(),
      postcode: postcodeSchema,
      country: z.string().length(2).default('GB'),
    }).optional(),
  }),

  createTransaction: z.object({
    transactionDate: dateSchema,
    description: z.string().min(1).max(500).transform(sanitize),
    amount: currencySchema,
    transactionType: z.enum(['income', 'expense', 'transfer']),
    category: z.string().max(100).optional(),
    bankAccountId: uuidSchema.optional(),
    vatAmount: currencySchema.optional(),
    vatRate: z.number().min(0).max(100).optional(),
  }),

  createInvoice: z.object({
    customerId: uuidSchema.optional(),
    customerName: z.string().min(1).max(255).transform(sanitize),
    customerEmail: emailSchema,
    customerAddress: z.string().max(500).optional(),
    dueDate: dateSchema,
    items: z.array(z.object({
      description: z.string().min(1).max(500),
      quantity: z.number().positive(),
      unitPrice: currencySchema,
      vatRate: z.number().min(0).max(100).default(20),
    })).min(1).max(100),
    notes: z.string().max(2000).optional(),
    terms: z.string().max(2000).optional(),
  }),

  introductionRequest: z.object({
    targetUserId: uuidSchema,
    companyId: uuidSchema,
    introductionType: z.enum(['investor', 'advisor', 'customer', 'partner', 'talent', 'other']),
    message: z.string().min(10).max(2000).transform(sanitize),
    context: z.string().max(5000).optional().transform(s => s ? sanitize(s) : s),
  }),
};
```

## 11.4 Rate Limiting

```typescript
// middleware/rate-limit.ts

import { FastifyRequest, FastifyReply } from 'fastify';
import { Redis } from 'ioredis';

interface RateLimitConfig {
  windowMs: number;      // Time window in ms
  max: number;           // Max requests per window
  keyGenerator?: (request: FastifyRequest) => string;
  skip?: (request: FastifyRequest) => boolean;
  handler?: (request: FastifyRequest, reply: FastifyReply) => void;
}

const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  keyGenerator: (request) => request.user?.id || request.ip,
};

// Different limits for different endpoints
export const rateLimits: Record<string, RateLimitConfig> = {
  // Auth endpoints - stricter
  'POST:/v1/auth/login': { windowMs: 15 * 60 * 1000, max: 5 },
  'POST:/v1/auth/register': { windowMs: 60 * 60 * 1000, max: 3 },
  'POST:/v1/auth/forgot-password': { windowMs: 60 * 60 * 1000, max: 3 },

  // AI endpoints - limited
  'POST:/v1/ai/*': { windowMs: 60 * 1000, max: 20 },

  // Document generation - expensive
  'POST:/v1/companies/*/documents/generate': { windowMs: 60 * 60 * 1000, max: 50 },

  // Pulse messages
  'POST:/v1/pulse/*': { windowMs: 60 * 1000, max: 60 },

  // Default
  '*': { windowMs: 15 * 60 * 1000, max: 1000 },
};

export function createRateLimiter(redis: Redis) {
  return async (
    request: FastifyRequest,
    reply: FastifyReply,
    config: RateLimitConfig = defaultConfig
  ): Promise<void> => {
    // Check if should skip
    if (config.skip?.(request)) return;

    // Generate key
    const key = `ratelimit:${config.keyGenerator?.(request) || request.ip}:${request.routerPath}`;

    // Sliding window counter
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Use Redis transaction
    const multi = redis.multi();
    multi.zremrangebyscore(key, 0, windowStart);
    multi.zadd(key, now, `${now}-${Math.random()}`);
    multi.zcard(key);
    multi.pexpire(key, config.windowMs);

    const results = await multi.exec();
    const requestCount = results?.[2]?.[1] as number;

    // Set headers
    reply.header('X-RateLimit-Limit', config.max);
    reply.header('X-RateLimit-Remaining', Math.max(0, config.max - requestCount));
    reply.header('X-RateLimit-Reset', Math.ceil((now + config.windowMs) / 1000));

    // Check limit
    if (requestCount > config.max) {
      if (config.handler) {
        return config.handler(request, reply);
      }

      reply.header('Retry-After', Math.ceil(config.windowMs / 1000));
      throw AppError.fromCode('RATE_LIMIT_EXCEEDED', {
        details: {
          retryAfter: Math.ceil(config.windowMs / 1000),
        },
      });
    }
  };
}
```

## 11.5 Security Headers

```typescript
// middleware/security-headers.ts

export const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https://api.stripe.com wss://api.genesis-engine.com",
    "frame-src https://js.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
};
```

## 11.6 Audit Logging

```typescript
// lib/audit.ts

export interface AuditEvent {
  userId?: string;
  companyId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
}

export class AuditService {
  constructor(private readonly db: Database) {}

  async log(event: AuditEvent): Promise<void> {
    await this.db.auditLogs.create({
      ...event,
      createdAt: new Date(),
    });
  }

  // Decorator for automatic auditing
  static audit(action: string, resourceType: string) {
    return function (
      target: any,
      propertyKey: string,
      descriptor: PropertyDescriptor
    ) {
      const originalMethod = descriptor.value;

      descriptor.value = async function (...args: any[]) {
        const context = args[args.length - 1]; // Assume context is last arg
        const oldValues = await getResourceValues(resourceType, args);

        const result = await originalMethod.apply(this, args);

        const newValues = await getResourceValues(resourceType, args);

        await auditService.log({
          userId: context?.userId,
          companyId: context?.companyId,
          action,
          resourceType,
          resourceId: result?.id || args[0],
          oldValues,
          newValues,
          ipAddress: context?.ipAddress,
          userAgent: context?.userAgent,
          requestId: context?.requestId,
        });

        return result;
      };

      return descriptor;
    };
  }
}

// Auditable actions
export const AUDIT_ACTIONS = {
  // Auth
  'auth.login': 'User logged in',
  'auth.logout': 'User logged out',
  'auth.password_changed': 'Password changed',
  'auth.mfa_enabled': 'MFA enabled',

  // Company
  'company.created': 'Company created',
  'company.updated': 'Company updated',
  'company.member_added': 'Member added',
  'company.member_removed': 'Member removed',
  'company.member_role_changed': 'Member role changed',

  // Documents
  'document.created': 'Document created',
  'document.updated': 'Document updated',
  'document.deleted': 'Document deleted',
  'document.signed': 'Document signed',
  'document.downloaded': 'Document downloaded',

  // Financial
  'transaction.created': 'Transaction created',
  'invoice.created': 'Invoice created',
  'invoice.sent': 'Invoice sent',
  'payment.received': 'Payment received',

  // Funding
  'funding_round.created': 'Funding round created',
  'investment.received': 'Investment received',
  'seis_application.submitted': 'SEIS application submitted',

  // Data access
  'data.exported': 'Data exported',
  'data.bulk_accessed': 'Bulk data accessed',
};
```

---

# 12. DEPLOYMENT

## 12.1 Docker Configuration

### 12.1.1 Base Dockerfile

```dockerfile
# Dockerfile

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm install --frozen-lockfile

# Copy source
COPY . .

# Build
RUN pnpm build

# Prune dev dependencies
RUN pnpm prune --prod

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Security: non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 genesis

# Copy built application
COPY --from=builder --chown=genesis:nodejs /app/dist ./dist
COPY --from=builder --chown=genesis:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=genesis:nodejs /app/package.json ./

# Environment
ENV NODE_ENV=production
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

USER genesis

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

### 12.1.2 Docker Compose (Development)

```yaml
# docker-compose.yml

version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
    env_file:
      - ./config/genesis.dev.env
    depends_on:
      - postgres
      - redis
      - neo4j
      - elasticsearch

  postgres:
    image: postgres:16-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: genesis_engine
      POSTGRES_USER: genesis
      POSTGRES_PASSWORD: dev_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql

  neo4j:
    image: neo4j:5-community
    ports:
      - "7474:7474"
      - "7687:7687"
    environment:
      NEO4J_AUTH: neo4j/dev_password
      NEO4J_PLUGINS: '["apoc"]'
    volumes:
      - neo4j_data:/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    ports:
      - "9200:9200"
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - ES_JAVA_OPTS=-Xms512m -Xmx512m
    volumes:
      - es_data:/usr/share/elasticsearch/data

volumes:
  postgres_data:
  neo4j_data:
  redis_data:
  es_data:
```

## 12.2 Kubernetes Configuration

### 12.2.1 Deployment

```yaml
# k8s/api-deployment.yaml

apiVersion: apps/v1
kind: Deployment
metadata:
  name: genesis-api
  namespace: genesis
  labels:
    app: genesis-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: genesis-api
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: genesis-api
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "3000"
        prometheus.io/path: "/metrics"
    spec:
      serviceAccountName: genesis-api
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
      containers:
        - name: api
          image: genesis-engine/api:${VERSION}
          imagePullPolicy: Always
          ports:
            - containerPort: 3000
              name: http
          envFrom:
            - secretRef:
                name: genesis-secrets
            - configMapRef:
                name: genesis-config
          resources:
            requests:
              cpu: "500m"
              memory: "512Mi"
            limits:
              cpu: "2000m"
              memory: "2Gi"
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /health/ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 3
          volumeMounts:
            - name: tmp
              mountPath: /tmp
      volumes:
        - name: tmp
          emptyDir: {}
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
            - weight: 100
              podAffinityTerm:
                labelSelector:
                  matchExpressions:
                    - key: app
                      operator: In
                      values:
                        - genesis-api
                topologyKey: kubernetes.io/hostname
```

### 12.2.2 Service & Ingress

```yaml
# k8s/api-service.yaml

apiVersion: v1
kind: Service
metadata:
  name: genesis-api
  namespace: genesis
spec:
  type: ClusterIP
  selector:
    app: genesis-api
  ports:
    - port: 80
      targetPort: 3000
      name: http

---
# k8s/api-ingress.yaml

apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: genesis-api
  namespace: genesis
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/proxy-body-size: "50m"
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
spec:
  tls:
    - hosts:
        - api.genesis-engine.com
      secretName: genesis-api-tls
  rules:
    - host: api.genesis-engine.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: genesis-api
                port:
                  number: 80
```

### 12.2.3 Horizontal Pod Autoscaler

```yaml
# k8s/api-hpa.yaml

apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: genesis-api
  namespace: genesis
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: genesis-api
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
    - type: Pods
      pods:
        metric:
          name: http_requests_per_second
        target:
          type: AverageValue
          averageValue: "1000"
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 10
          periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
        - type: Percent
          value: 100
          periodSeconds: 15
        - type: Pods
          value: 4
          periodSeconds: 15
```

## 12.3 CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml

name: Deploy

on:
  push:
    branches: [main]
  release:
    types: [published]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: genesis-engine/api

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm test:e2e

  build:
    needs: test
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.version.outputs.version }}
    steps:
      - uses: actions/checkout@v4

      - name: Set version
        id: version
        run: |
          if [ "${{ github.event_name }}" == "release" ]; then
            echo "version=${{ github.event.release.tag_name }}" >> $GITHUB_OUTPUT
          else
            echo "version=sha-${{ github.sha }}" >> $GITHUB_OUTPUT
          fi

      - name: Login to Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:${{ steps.version.outputs.version }}
            ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4

      - name: Configure kubectl
        uses: azure/k8s-set-context@v3
        with:
          kubeconfig: ${{ secrets.KUBE_CONFIG_STAGING }}

      - name: Deploy to staging
        run: |
          export VERSION=${{ needs.build.outputs.version }}
          envsubst < k8s/api-deployment.yaml | kubectl apply -f -
          kubectl rollout status deployment/genesis-api -n genesis

  deploy-production:
    needs: [build, deploy-staging]
    runs-on: ubuntu-latest
    environment: production
    if: github.event_name == 'release'
    steps:
      - uses: actions/checkout@v4

      - name: Configure kubectl
        uses: azure/k8s-set-context@v3
        with:
          kubeconfig: ${{ secrets.KUBE_CONFIG_PRODUCTION }}

      - name: Deploy to production
        run: |
          export VERSION=${{ needs.build.outputs.version }}
          envsubst < k8s/api-deployment.yaml | kubectl apply -f -
          kubectl rollout status deployment/genesis-api -n genesis
```


---

# 13. MONITORING & OBSERVABILITY

## 13.1 Metrics

```typescript
// lib/metrics.ts

import { Counter, Gauge, Histogram, Registry } from 'prom-client';

export const registry = new Registry();

// Request metrics
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status'],
  registers: [registry],
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'path'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [registry],
});

// Business metrics
export const activeUsers = new Gauge({
  name: 'genesis_active_users',
  help: 'Number of active users',
  registers: [registry],
});

export const companiesTotal = new Gauge({
  name: 'genesis_companies_total',
  help: 'Total number of companies',
  labelNames: ['status'],
  registers: [registry],
});

export const documentsGenerated = new Counter({
  name: 'genesis_documents_generated_total',
  help: 'Total documents generated',
  labelNames: ['type'],
  registers: [registry],
});

export const aiRequestDuration = new Histogram({
  name: 'genesis_ai_request_duration_seconds',
  help: 'AI request duration',
  labelNames: ['provider', 'model', 'operation'],
  buckets: [0.5, 1, 2, 5, 10, 30, 60],
  registers: [registry],
});

export const pulseMessagesProcessed = new Counter({
  name: 'genesis_pulse_messages_total',
  help: 'Total Pulse messages processed',
  labelNames: ['channel', 'direction', 'intent'],
  registers: [registry],
});

export const nexusIntroductions = new Counter({
  name: 'genesis_nexus_introductions_total',
  help: 'Total Nexus introductions',
  labelNames: ['type', 'status'],
  registers: [registry],
});

export const fundingRaised = new Gauge({
  name: 'genesis_funding_raised_total',
  help: 'Total funding raised through platform',
  labelNames: ['type'],
  registers: [registry],
});

// Queue metrics
export const queueJobsTotal = new Counter({
  name: 'genesis_queue_jobs_total',
  help: 'Total queue jobs',
  labelNames: ['queue', 'status'],
  registers: [registry],
});

export const queueJobDuration = new Histogram({
  name: 'genesis_queue_job_duration_seconds',
  help: 'Queue job duration',
  labelNames: ['queue'],
  buckets: [0.1, 0.5, 1, 5, 10, 30, 60, 300],
  registers: [registry],
});

// External service metrics
export const externalServiceRequests = new Counter({
  name: 'genesis_external_service_requests_total',
  help: 'External service requests',
  labelNames: ['service', 'operation', 'status'],
  registers: [registry],
});

export const externalServiceLatency = new Histogram({
  name: 'genesis_external_service_latency_seconds',
  help: 'External service latency',
  labelNames: ['service', 'operation'],
  buckets: [0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [registry],
});
```

## 13.2 Logging

```typescript
// lib/logger.ts

import pino from 'pino';

const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

export const logger = pino({
  level: logLevel,
  formatters: {
    level: (label) => ({ level: label }),
  },
  base: {
    service: process.env.APP_NAME || 'genesis-engine',
    version: process.env.APP_VERSION,
    env: process.env.NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'password',
      'passwordHash',
      'token',
      'accessToken',
      'refreshToken',
      'apiKey',
      'secret',
      '*.password',
      '*.token',
      '*.apiKey',
    ],
    censor: '[REDACTED]',
  },
  serializers: {
    err: pino.stdSerializers.err,
    req: (req) => ({
      method: req.method,
      url: req.url,
      path: req.path,
      parameters: req.parameters,
      headers: {
        host: req.headers.host,
        'user-agent': req.headers['user-agent'],
        'x-request-id': req.headers['x-request-id'],
      },
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
});

// Child loggers for services
export const createServiceLogger = (serviceName: string) =>
  logger.child({ service: serviceName });

// Request logging middleware
export const requestLogger = (request: FastifyRequest, reply: FastifyReply, done: () => void) => {
  request.log = logger.child({
    requestId: request.id,
    userId: request.user?.id,
    companyId: request.params?.companyId,
  });

  const startTime = Date.now();

  reply.then(() => {
    const duration = Date.now() - startTime;
    request.log.info({
      req: request,
      res: reply,
      duration,
    }, 'request completed');
  });

  done();
};
```

## 13.3 Distributed Tracing

```typescript
// lib/tracing.ts

import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

export function initTracing() {
  const sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: process.env.APP_NAME || 'genesis-engine',
      [SemanticResourceAttributes.SERVICE_VERSION]: process.env.APP_VERSION,
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV,
    }),
    traceExporter: new OTLPTraceExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    }),
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': { enabled: false },
      }),
    ],
  });

  sdk.start();

  process.on('SIGTERM', () => {
    sdk.shutdown().then(() => process.exit(0));
  });
}

// Custom spans
import { trace, SpanStatusCode } from '@opentelemetry/api';

const tracer = trace.getTracer('genesis-engine');

export function withSpan<T>(
  name: string,
  fn: () => Promise<T>,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  return tracer.startActiveSpan(name, async (span) => {
    try {
      if (attributes) {
        span.setAttributes(attributes);
      }
      const result = await fn();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (error as Error).message,
      });
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  });
}
```

## 13.4 Health Checks

```typescript
// routes/health.ts

export async function healthRoutes(fastify: FastifyInstance) {
  // Basic liveness check
  fastify.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
  }));

  // Detailed readiness check
  fastify.get('/health/ready', async (request, reply) => {
    const checks: HealthCheck[] = [
      { name: 'database', check: checkDatabase },
      { name: 'redis', check: checkRedis },
      { name: 'neo4j', check: checkNeo4j },
      { name: 'elasticsearch', check: checkElasticsearch },
    ];

    const results = await Promise.all(
      checks.map(async ({ name, check }) => {
        try {
          const start = Date.now();
          await check();
          return {
            name,
            status: 'healthy',
            latencyMs: Date.now() - start,
          };
        } catch (error) {
          return {
            name,
            status: 'unhealthy',
            error: (error as Error).message,
          };
        }
      })
    );

    const allHealthy = results.every((r) => r.status === 'healthy');

    return reply
      .status(allHealthy ? 200 : 503)
      .send({
        status: allHealthy ? 'ready' : 'not_ready',
        timestamp: new Date().toISOString(),
        checks: results,
      });
  });

  // Startup check
  fastify.get('/health/startup', async (request, reply) => {
    // Check if all required services are available
    const ready = await isSystemReady();
    return reply.status(ready ? 200 : 503).send({
      status: ready ? 'started' : 'starting',
    });
  });
}

async function checkDatabase(): Promise<void> {
  await db.query('SELECT 1');
}

async function checkRedis(): Promise<void> {
  await redis.ping();
}

async function checkNeo4j(): Promise<void> {
  const session = neo4jDriver.session();
  try {
    await session.run('RETURN 1');
  } finally {
    await session.close();
  }
}

async function checkElasticsearch(): Promise<void> {
  await elasticsearch.ping();
}
```

## 13.5 Alerting Rules

```yaml
# prometheus/alerts.yml

groups:
  - name: genesis-engine
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status=~"5.."}[5m])) 
          / sum(rate(http_requests_total[5m])) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: High error rate detected
          description: Error rate is {{ $value | humanizePercentage }}

      # High latency
      - alert: HighLatency
        expr: |
          histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High request latency
          description: 95th percentile latency is {{ $value }}s

      # Database connection issues
      - alert: DatabaseConnectionFailure
        expr: |
          up{job="genesis-postgres"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: Database connection failed

      # Queue backup
      - alert: QueueBacklog
        expr: |
          sum(genesis_queue_jobs_waiting) > 1000
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: Queue backlog growing
          description: {{ $value }} jobs waiting

      # AI service degradation
      - alert: AIServiceDegraded
        expr: |
          histogram_quantile(0.95, rate(genesis_ai_request_duration_seconds_bucket[5m])) > 30
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: AI service responding slowly

      # Low disk space
      - alert: LowDiskSpace
        expr: |
          (node_filesystem_avail_bytes / node_filesystem_size_bytes) < 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: Disk space running low
          description: Only {{ $value | humanizePercentage }} free

      # Memory pressure
      - alert: HighMemoryUsage
        expr: |
          (container_memory_usage_bytes / container_spec_memory_limit_bytes) > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High memory usage
          description: Memory usage at {{ $value | humanizePercentage }}
```

---

# 14. APPENDIX

## 14.1 API Rate Limits Summary

| Endpoint Category | Limit | Window |
|-------------------|-------|--------|
| Authentication | 5 | 15 min |
| Registration | 3 | 1 hour |
| Standard API | 1000 | 15 min |
| AI Operations | 20 | 1 min |
| Document Generation | 50 | 1 hour |
| Pulse Messages | 60 | 1 min |
| Webhooks | 100 | 1 min |

## 14.2 External API Dependencies

| Service | Purpose | Fallback |
|---------|---------|----------|
| Companies House API | Company data & filing | Cache + manual |
| HMRC API | Tax registration | Queue + manual |
| OpenAI | Primary AI | Anthropic |
| Anthropic | Secondary AI | OpenAI |
| Stripe | Payments | GoCardless |
| Twilio | SMS/WhatsApp | Vonage |
| SendGrid | Email | Postmark |
| DocuSign | E-signatures | PandaDoc |
| TrueLayer | Open Banking | Plaid |

## 14.3 Data Retention Policy

| Data Type | Retention | Notes |
|-----------|-----------|-------|
| Audit logs | 7 years | Legal requirement |
| Financial records | 7 years | Legal requirement |
| User data | Until deletion | GDPR |
| Session data | 30 days | |
| Error logs | 90 days | |
| Analytics | 2 years | Anonymized after 1 year |
| Pulse messages | 2 years | |
| Backups | 90 days | |

## 14.4 Compliance Checklist

- [ ] GDPR Data Protection Impact Assessment
- [ ] ICO Registration
- [ ] Companies House Filing Software Registration
- [ ] HMRC Software Developer Registration
- [ ] FCA Authorization (if offering regulated services)
- [ ] PCI DSS Compliance (if handling card data)
- [ ] SOC 2 Type II Audit
- [ ] ISO 27001 Certification

---

# END OF SPECIFICATION

**Document Version:** 1.0.0  
**Last Updated:** 2026-01-17  
**Status:** Complete  

To deploy:
1. Populate `config/genesis.env` with all required values
2. Run database migrations
3. Deploy infrastructure via Terraform
4. Deploy services via Kubernetes
5. Configure monitoring and alerting
6. Run smoke tests
7. Enable traffic


---

# 7. THE NEXUS

## 7.1 Overview

The Nexus is an AI-powered networking and funding engine that connects founders with investors, advisors, customers, and partners through intelligent matching and warm introductions.

## 7.2 Core Components

### 7.2.1 AI Networking Agent

```typescript
// services/nexus/networking-agent.service.ts

export class NetworkingAgentService {
  constructor(
    private readonly kg: KnowledgeGraphService,
    private readonly ai: AIService,
    private readonly trust: TrustScoreService,
    private readonly calendar: CalendarService,
    private readonly email: EmailService
  ) {}

  // =========================================================================
  // INTRODUCTION MATCHING
  // =========================================================================

  async findMatches(
    userId: string,
    companyId: string,
    criteria: MatchCriteria
  ): Promise<MatchResult[]> {
    // Get user's network context
    const userContext = await this.kg.getPersonContext(userId);
    const companyContext = await this.kg.getCompanyContext(companyId);

    // Determine match type and run appropriate algorithm
    switch (criteria.type) {
      case 'investor':
        return this.findInvestorMatches(companyContext, criteria);
      case 'advisor':
        return this.findAdvisorMatches(companyContext, criteria);
      case 'customer':
        return this.findCustomerMatches(companyContext, criteria);
      case 'partner':
        return this.findPartnerMatches(companyContext, criteria);
      case 'talent':
        return this.findTalentMatches(companyContext, criteria);
      default:
        return this.findGeneralMatches(userContext, criteria);
    }
  }

  private async findInvestorMatches(
    company: CompanyContext,
    criteria: MatchCriteria
  ): Promise<MatchResult[]> {
    // Step 1: Graph-based candidate selection
    const graphCandidates = await this.kg.findInvestorMatches(
      company.company.id,
      100 // Get top 100 from graph
    );

    // Step 2: AI scoring and ranking
    const scoredCandidates = await Promise.all(
      graphCandidates.map(async (candidate) => {
        const score = await this.scoreInvestorMatch(candidate, company, criteria);
        return { ...candidate, aiScore: score };
      })
    );

    // Step 3: Filter by criteria
    const filtered = scoredCandidates.filter((c) => {
      if (criteria.minTrustScore && c.trustScore < criteria.minTrustScore) return false;
      if (criteria.stages && !criteria.stages.some((s) => c.investor?.stages?.includes(s))) return false;
      if (criteria.minCheckSize && c.investor?.check_size_min < criteria.minCheckSize) return false;
      if (criteria.maxCheckSize && c.investor?.check_size_max > criteria.maxCheckSize) return false;
      return true;
    });

    // Step 4: Sort by composite score
    const sorted = filtered.sort((a, b) => {
      const scoreA = this.calculateCompositeScore(a);
      const scoreB = this.calculateCompositeScore(b);
      return scoreB - scoreA;
    });

    // Step 5: Find introduction paths
    const withPaths = await Promise.all(
      sorted.slice(0, 20).map(async (match) => {
        const path = await this.kg.findIntroductionPath(
          company.founders[0]?.user_id,
          match.investor.user_id
        );
        const introducers = await this.kg.findBestIntroducers(
          company.founders[0]?.user_id,
          match.investor.user_id
        );
        return {
          ...match,
          introductionPath: path,
          potentialIntroducers: introducers,
        };
      })
    );

    return withPaths;
  }

  private async scoreInvestorMatch(
    candidate: any,
    company: CompanyContext,
    criteria: MatchCriteria
  ): Promise<number> {
    const prompt = `
      Score this investor-company match on a scale of 0-100.
      
      COMPANY:
      - Name: ${company.company.name}
      - Industry: ${company.industries.map((i) => i.name).join(', ')}
      - Stage: ${company.company.funding_stage}
      - Raising: ${criteria.targetAmount}
      - Location: ${company.company.registered_address_city}
      - Description: ${company.company.nature_of_business}
      
      INVESTOR:
      - Name: ${candidate.investor.name}
      - Type: ${candidate.investor.investor_type}
      - Check Size: ${candidate.investor.check_size_min}-${candidate.investor.check_size_max}
      - Stages: ${candidate.investor.stages?.join(', ')}
      - Sectors: ${candidate.investor.sectors?.join(', ')}
      - Portfolio Overlap: ${candidate.portfolioOverlap} similar companies
      - Trust Score: ${candidate.trustScore}
      
      Consider:
      1. Stage fit (30%)
      2. Sector/industry alignment (25%)
      3. Check size fit (20%)
      4. Geographic alignment (10%)
      5. Portfolio synergies (15%)
      
      Return JSON: { "score": number, "reasoning": string, "concerns": string[] }
    `;

    const result = await this.ai.generate({
      prompt,
      model: 'fast',
      format: 'json',
    });

    return result.score;
  }

  private calculateCompositeScore(match: any): number {
    const weights = {
      aiScore: 0.35,
      trustScore: 0.25,
      portfolioOverlap: 0.2,
      pathLength: 0.2,
    };

    return (
      (match.aiScore || 0) * weights.aiScore +
      (match.trustScore || 0) * 100 * weights.trustScore +
      Math.min(match.portfolioOverlap * 10, 100) * weights.portfolioOverlap +
      (match.introductionPath ? (5 - match.introductionPath.length) * 20 : 0) * weights.pathLength
    );
  }

  // =========================================================================
  // INTRODUCTION ORCHESTRATION
  // =========================================================================

  async requestIntroduction(
    requesterId: string,
    targetId: string,
    data: IntroductionRequestData
  ): Promise<IntroductionRequest> {
    // Validate request
    const requester = await this.kg.getPerson(requesterId);
    const target = await this.kg.getPerson(targetId);

    if (!requester || !target) {
      throw new NotFoundError('User not found');
    }

    // Find best introducer
    const introducers = await this.kg.findBestIntroducers(requesterId, targetId);
    const introducer = introducers[0];

    if (!introducer && !data.allowColdOutreach) {
      throw new ValidationError('No mutual connection found and cold outreach not enabled');
    }

    // Check requester's trust score
    const requesterTrust = await this.trust.getScore(requesterId);
    if (requesterTrust.overall_score < 30) {
      throw new ValidationError('Trust score too low for introductions. Build your network first.');
    }

    // Create introduction request
    const request = await this.db.introductionRequests.create({
      requesterId,
      targetId,
      introducerId: introducer?.person.user_id,
      requesterCompanyId: data.companyId,
      introductionType: data.type,
      message: data.message,
      context: data.context,
      aiMatchScore: data.matchScore,
      aiMatchReasons: data.matchReasons,
      status: introducer ? 'pending' : 'ai_approved',
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
    });

    // If we have an introducer, request their approval
    if (introducer) {
      await this.requestIntroducerApproval(request, introducer.person);
    } else {
      // AI-facilitated introduction (cold but warm-ified)
      await this.sendAIFacilitatedIntro(request, target);
    }

    // Emit event
    await this.events.emit('introduction.requested', {
      requestId: request.id,
      fromUserId: requesterId,
      toUserId: targetId,
    });

    return request;
  }

  private async requestIntroducerApproval(
    request: IntroductionRequest,
    introducer: Person
  ): Promise<void> {
    const requester = await this.kg.getPerson(request.requesterId);
    const target = await this.kg.getPerson(request.targetId);

    await this.email.send({
      to: introducer.email,
      template: 'introduction_request',
      data: {
        introducerName: introducer.name,
        requesterName: requester.name,
        requesterCompany: request.requesterCompany?.name,
        targetName: target.name,
        message: request.message,
        approveUrl: `${this.config.APP_URL}/nexus/introductions/${request.id}/approve`,
        declineUrl: `${this.config.APP_URL}/nexus/introductions/${request.id}/decline`,
      },
    });

    // Also send via Pulse if enabled
    await this.pulse.send(introducer.user_id, {
      type: 'introduction_request',
      content: `${requester.name} would like an intro to ${target.name}. Reply YES to approve or NO to decline.`,
      actionId: request.id,
    });
  }

  async approveIntroduction(
    requestId: string,
    approverId: string,
    approverType: 'introducer' | 'target'
  ): Promise<void> {
    const request = await this.db.introductionRequests.findById(requestId);
    if (!request) {
      throw new NotFoundError('Introduction request not found');
    }

    // Update approval
    if (approverType === 'introducer') {
      await this.db.introductionRequests.update(requestId, {
        status: 'introducer_approved',
        introducerApprovedAt: new Date(),
      });

      // Now ask target
      await this.requestTargetApproval(request);
    } else {
      await this.db.introductionRequests.update(requestId, {
        status: 'accepted',
        targetApprovedAt: new Date(),
      });

      // Make the introduction!
      await this.executeIntroduction(request);
    }
  }

  private async executeIntroduction(request: IntroductionRequest): Promise<void> {
    const requester = await this.kg.getPerson(request.requesterId);
    const target = await this.kg.getPerson(request.targetId);
    const introducer = request.introducerId
      ? await this.kg.getPerson(request.introducerId)
      : null;

    // Generate introduction email
    const introEmail = await this.ai.generate({
      prompt: `
        Write a warm introduction email connecting two professionals.
        
        ${introducer ? `Introducer: ${introducer.name}` : 'AI-facilitated introduction'}
        
        Person A (seeking introduction):
        - Name: ${requester.name}
        - Company: ${request.requesterCompany?.name}
        - Role: ${requester.role}
        - Why they want to connect: ${request.message}
        
        Person B (being introduced to):
        - Name: ${target.name}
        - Company: ${target.company}
        - Role: ${target.role}
        
        Context: ${request.context}
        
        Write a professional but warm email that:
        1. Introduces both parties
        2. Explains why they should connect
        3. Suggests a next step (usually a quick call)
        
        Keep it concise - under 200 words.
      `,
      model: 'default',
    });

    // Send introduction email
    await this.email.send({
      to: [requester.email, target.email],
      cc: introducer?.email,
      subject: introducer
        ? `Introduction: ${requester.name} ↔ ${target.name}`
        : `Connection Request: ${requester.name}`,
      body: introEmail.content,
      replyTo: introducer?.email || 'introductions@genesis-engine.com',
    });

    // Create connection in graph
    await this.kg.createRelationship(
      'Person',
      request.requesterId,
      'KNOWS',
      'Person',
      request.targetId,
      {
        source: 'introduction',
        introducedBy: request.introducerId,
        introducedAt: new Date().toISOString(),
      }
    );

    // Update trust scores
    if (introducer) {
      await this.trust.recordIntroduction(request.introducerId, 'made');
    }
    await this.trust.recordIntroduction(request.requesterId, 'received');
  }
}
```

### 7.2.2 Trust Score System

```typescript
// services/nexus/trust-score.service.ts

export class TrustScoreService {
  private readonly WEIGHTS = {
    delivery: 0.30,      // Do they do what they say?
    voucher: 0.25,       // Who vouches for them?
    introduction: 0.20,  // Quality of intros they make
    responsiveness: 0.15, // How quickly do they respond?
    contribution: 0.10,  // Community contribution
  };

  private readonly TIERS = {
    diamond: { min: 90, benefits: ['priority_matching', 'unlimited_intros', 'verified_badge'] },
    platinum: { min: 75, benefits: ['priority_matching', 'extra_intros', 'verified_badge'] },
    gold: { min: 60, benefits: ['standard_matching', 'standard_intros'] },
    silver: { min: 40, benefits: ['limited_matching', 'limited_intros'] },
    bronze: { min: 0, benefits: ['basic_access'] },
  };

  async calculateScore(userId: string): Promise<TrustScore> {
    // Get all scoring inputs
    const [delivery, voucher, introduction, responsiveness, contribution] = await Promise.all([
      this.calculateDeliveryScore(userId),
      this.calculateVoucherScore(userId),
      this.calculateIntroductionScore(userId),
      this.calculateResponsivenessScore(userId),
      this.calculateContributionScore(userId),
    ]);

    // Calculate weighted overall
    const overall =
      delivery * this.WEIGHTS.delivery +
      voucher * this.WEIGHTS.voucher +
      introduction * this.WEIGHTS.introduction +
      responsiveness * this.WEIGHTS.responsiveness +
      contribution * this.WEIGHTS.contribution;

    // Determine tier
    const tier = this.determineTier(overall);

    // Update database
    const score = await this.db.trustScores.upsert({
      userId,
      overallScore: overall,
      tier,
      deliveryScore: delivery,
      voucherScore: voucher,
      introductionScore: introduction,
      responsivenessScore: responsiveness,
      contributionScore: contribution,
      calculatedAt: new Date(),
    });

    return score;
  }

  private async calculateDeliveryScore(userId: string): Promise<number> {
    // Check:
    // - Meeting attendance rate
    // - Commitment follow-through
    // - Timeline adherence
    // - Deal completion rate (for investors)

    const metrics = await this.db.query(`
      SELECT
        -- Meeting attendance
        COALESCE(
          (SELECT COUNT(*) FILTER (WHERE attended = true)::float / NULLIF(COUNT(*), 0)
           FROM meeting_attendees WHERE user_id = $1),
          1
        ) AS meeting_attendance,
        
        -- Commitment follow-through (from tasks)
        COALESCE(
          (SELECT COUNT(*) FILTER (WHERE status = 'completed')::float / NULLIF(COUNT(*), 0)
           FROM tasks WHERE user_id = $1 AND created_at > NOW() - INTERVAL '90 days'),
          1
        ) AS task_completion,
        
        -- Deal completion (for investors)
        COALESCE(
          (SELECT COUNT(*) FILTER (WHERE status = 'completed')::float / NULLIF(COUNT(*), 0)
           FROM investments WHERE investor_id = $1),
          1
        ) AS deal_completion
    `, [userId]);

    const { meeting_attendance, task_completion, deal_completion } = metrics[0];

    return (
      (meeting_attendance * 0.4 + task_completion * 0.3 + deal_completion * 0.3) * 100
    );
  }

  private async calculateVoucherScore(userId: string): Promise<number> {
    // Get vouches received, weighted by voucher's trust score
    const vouches = await this.db.query(`
      SELECT 
        v.vouch_type,
        v.context,
        ts.overall_score AS voucher_trust
      FROM vouches v
      JOIN trust_scores ts ON ts.user_id = v.voucher_id
      WHERE v.vouchee_id = $1
        AND v.created_at > NOW() - INTERVAL '1 year'
    `, [userId]);

    if (vouches.length === 0) return 30; // Base score for new users

    // Weight vouches by voucher's trust
    const weightedSum = vouches.reduce((sum, v) => {
      const weight = v.voucher_trust / 100;
      const typeWeight = v.vouch_type === 'strong' ? 1.5 : 1;
      return sum + weight * typeWeight;
    }, 0);

    return Math.min(weightedSum * 10, 100);
  }

  private async calculateIntroductionScore(userId: string): Promise<number> {
    const stats = await this.db.query(`
      SELECT
        COUNT(*) AS total_intros,
        COUNT(*) FILTER (WHERE outcome = 'meeting_scheduled') AS successful,
        COUNT(*) FILTER (WHERE outcome IN ('meeting_scheduled', 'deal_closed')) AS high_value,
        AVG(CASE 
          WHEN feedback_score IS NOT NULL THEN feedback_score 
          ELSE NULL 
        END) AS avg_feedback
      FROM introduction_requests
      WHERE introducer_id = $1
        AND created_at > NOW() - INTERVAL '1 year'
    `, [userId]);

    const { total_intros, successful, high_value, avg_feedback } = stats[0];

    if (total_intros === 0) return 50; // Neutral for no intros

    const successRate = successful / total_intros;
    const highValueRate = high_value / total_intros;
    const feedbackScore = avg_feedback ? avg_feedback / 5 : 0.5;

    return (successRate * 40 + highValueRate * 30 + feedbackScore * 30) * 100;
  }

  private async calculateResponsivenessScore(userId: string): Promise<number> {
    const stats = await this.db.query(`
      SELECT
        AVG(response_time_hours) AS avg_response_time,
        COUNT(*) FILTER (WHERE response_time_hours < 24) AS within_24h,
        COUNT(*) AS total_messages
      FROM (
        SELECT
          EXTRACT(EPOCH FROM (
            MIN(m2.created_at) - m1.created_at
          )) / 3600 AS response_time_hours
        FROM pulse_messages m1
        JOIN pulse_messages m2 ON m2.conversation_id = m1.conversation_id
          AND m2.direction = 'outbound'
          AND m2.created_at > m1.created_at
        WHERE m1.user_id = $1
          AND m1.direction = 'inbound'
          AND m1.created_at > NOW() - INTERVAL '30 days'
        GROUP BY m1.id
      ) response_times
    `, [userId]);

    const { avg_response_time, within_24h, total_messages } = stats[0];

    if (!total_messages) return 50;

    // Score based on response time
    // < 1 hour = 100, < 4 hours = 80, < 24 hours = 60, > 24 hours = 40
    let timeScore;
    if (avg_response_time < 1) timeScore = 100;
    else if (avg_response_time < 4) timeScore = 80;
    else if (avg_response_time < 24) timeScore = 60;
    else timeScore = 40;

    const consistencyScore = (within_24h / total_messages) * 100;

    return timeScore * 0.6 + consistencyScore * 0.4;
  }

  private async calculateContributionScore(userId: string): Promise<number> {
    // Track:
    // - Event attendance
    // - Community participation
    // - Content sharing
    // - Mentorship

    const stats = await this.db.query(`
      SELECT
        (SELECT COUNT(*) FROM event_attendees WHERE user_id = $1 AND attended = true) AS events,
        (SELECT COUNT(*) FROM community_posts WHERE user_id = $1) AS posts,
        (SELECT COUNT(*) FROM mentorship_sessions WHERE mentor_id = $1) AS mentoring
    `, [userId]);

    const { events, posts, mentoring } = stats[0];

    return Math.min(
      (events * 5 + posts * 2 + mentoring * 10),
      100
    );
  }

  private determineTier(score: number): TrustTier {
    for (const [tier, config] of Object.entries(this.TIERS)) {
      if (score >= config.min) {
        return tier as TrustTier;
      }
    }
    return 'bronze';
  }
}
```

### 7.2.3 Funding Engine

```typescript
// services/nexus/funding-engine.service.ts

export class FundingEngineService {
  constructor(
    private readonly db: Database,
    private readonly kg: KnowledgeGraphService,
    private readonly documents: DocumentService,
    private readonly compliance: ComplianceService
  ) {}

  // =========================================================================
  // FUNDING ROUND MANAGEMENT
  // =========================================================================

  async createFundingRound(
    companyId: string,
    data: CreateFundingRoundData
  ): Promise<FundingRound> {
    // Validate company eligibility
    await this.validateFundingEligibility(companyId, data.roundType);

    // Calculate share price if equity round
    let sharePrice;
    if (this.isEquityRound(data.roundType)) {
      sharePrice = await this.calculateSharePrice(companyId, data.preMoneyValuation);
    }

    // Create round
    const round = await this.db.fundingRounds.create({
      companyId,
      roundName: data.name,
      roundType: data.roundType,
      targetAmount: data.targetAmount,
      minimumAmount: data.minimumAmount,
      maximumAmount: data.maximumAmount,
      preMoneyValuation: data.preMoneyValuation,
      sharePrice,
      seisEligible: data.seisEligible ?? false,
      eisEligible: data.eisEligible ?? false,
      status: 'planning',
    });

    // Create in knowledge graph
    await this.kg.createEntity('FundingRound', {
      id: round.id,
      name: round.roundName,
      round_type: round.roundType,
      target_amount: round.targetAmount,
      status: round.status,
      postgres_id: round.id,
    });

    await this.kg.createRelationship(
      'FundingRound', round.id,
      'FOR',
      'Company', companyId
    );

    return round;
  }

  async openFundingRound(roundId: string): Promise<FundingRound> {
    const round = await this.db.fundingRounds.findById(roundId);
    if (!round) throw new NotFoundError('Funding round not found');

    // Validate all requirements
    await this.validateRoundReadiness(round);

    // Update status
    const updated = await this.db.fundingRounds.update(roundId, {
      status: 'open',
      openedAt: new Date(),
    });

    // Emit event for matching
    await this.events.emit('funding.round.opened', {
      roundId,
      companyId: round.companyId,
      roundType: round.roundType,
      targetAmount: round.targetAmount,
    });

    return updated;
  }

  // =========================================================================
  // SEIS/EIS MANAGEMENT
  // =========================================================================

  async prepareSEISApplication(companyId: string): Promise<SEISApplication> {
    const company = await this.db.companies.findById(companyId);
    if (!company) throw new NotFoundError('Company not found');

    // Check basic eligibility
    const eligibility = await this.checkSEISEligibility(company);
    if (!eligibility.eligible) {
      throw new ValidationError(`Not SEIS eligible: ${eligibility.reasons.join(', ')}`);
    }

    // Gather required information
    const context = await this.kg.getCompanyContext(companyId);

    // Generate advance assurance application
    const application = await this.ai.generate({
      prompt: `
        Prepare a SEIS Advance Assurance application for HMRC.
        
        Company Details:
        ${JSON.stringify(context.company, null, 2)}
        
        Directors/Shareholders:
        ${JSON.stringify(context.founders, null, 2)}
        
        Business Activity:
        ${context.company.nature_of_business}
        
        Generate:
        1. Covering letter
        2. Completed SEIS1 form data
        3. Business plan summary (for HMRC)
        4. Articles compliance confirmation
        
        Ensure all SEIS requirements are addressed:
        - UK permanent establishment
        - Fewer than 25 employees
        - Assets under £200K
        - Less than 2 years since first commercial sale
        - Not trading in excluded activity
        - Not a subsidiary/controlled by another company
      `,
      model: 'default',
      format: 'json',
    });

    // Create document
    const doc = await this.documents.generate({
      companyId,
      type: 'seis_advance_assurance',
      template: 'seis_application_v1',
      data: application,
    });

    return {
      companyId,
      status: 'draft',
      eligibility,
      applicationDocument: doc,
      checklist: this.getSEISChecklist(company),
    };
  }

  private async checkSEISEligibility(company: any): Promise<EligibilityResult> {
    const issues: string[] = [];

    // Must be UK company
    if (company.registered_address_country !== 'GB') {
      issues.push('Company must be UK registered');
    }

    // Less than 25 employees
    const employeeCount = await this.getEmployeeCount(company.id);
    if (employeeCount >= 25) {
      issues.push('Must have fewer than 25 full-time employees');
    }

    // Assets under £200K (gross)
    if (company.total_assets > 200000) {
      issues.push('Gross assets must be under £200,000');
    }

    // Not more than 2 years since first commercial sale
    if (company.first_sale_date) {
      const monthsSinceFirstSale = this.monthsBetween(company.first_sale_date, new Date());
      if (monthsSinceFirstSale > 24) {
        issues.push('More than 2 years since first commercial sale');
      }
    }

    // Allocation remaining
    if (company.seis_allocation_remaining <= 0) {
      issues.push('SEIS allocation exhausted (£150K lifetime limit)');
    }

    // Excluded activities check
    const excludedActivities = [
      'dealing in land',
      'dealing in commodities',
      'financial services',
      'leasing',
      'legal services',
      'accountancy',
      'property development',
    ];

    const businessDesc = company.nature_of_business?.toLowerCase() || '';
    for (const excluded of excludedActivities) {
      if (businessDesc.includes(excluded)) {
        issues.push(`Potentially excluded activity: ${excluded}`);
      }
    }

    return {
      eligible: issues.length === 0,
      reasons: issues,
      warnings: [], // Add warnings for edge cases
    };
  }

  // =========================================================================
  // RBF (Revenue-Based Financing)
  // =========================================================================

  async checkRBFEligibility(companyId: string): Promise<RBFEligibilityResult> {
    const company = await this.db.companies.findById(companyId);
    const financials = await this.getCompanyFinancials(companyId);

    // RBF typically requires:
    // - 6+ months of revenue
    // - £10K+ monthly revenue
    // - Positive unit economics

    const requirements = {
      minMonthlyRevenue: 10000,
      minMonthsOfRevenue: 6,
      minGrossMargin: 0.3,
    };

    const issues: string[] = [];
    const providers: RBFProviderMatch[] = [];

    if (financials.monthlyRevenue < requirements.minMonthlyRevenue) {
      issues.push(`Monthly revenue (£${financials.monthlyRevenue}) below minimum £10K`);
    }

    if (financials.monthsWithRevenue < requirements.minMonthsOfRevenue) {
      issues.push(`Only ${financials.monthsWithRevenue} months of revenue history (need 6+)`);
    }

    if (financials.grossMargin < requirements.minGrossMargin) {
      issues.push(`Gross margin (${financials.grossMargin * 100}%) below 30%`);
    }

    // If eligible, match with providers
    if (issues.length === 0) {
      providers.push(
        ...(await this.matchRBFProviders(financials))
      );
    }

    return {
      eligible: issues.length === 0,
      reasons: issues,
      matchedProviders: providers,
      estimatedOffer: this.estimateRBFOffer(financials),
    };
  }

  private async matchRBFProviders(financials: any): Promise<RBFProviderMatch[]> {
    const providers = [
      {
        name: 'Clearco',
        minRevenue: 10000,
        maxOffer: 10000000,
        feeRange: [0.06, 0.12],
        repaymentRange: [0.01, 0.20],
        speed: '24-48 hours',
      },
      {
        name: 'Wayflyer',
        minRevenue: 20000,
        maxOffer: 20000000,
        feeRange: [0.02, 0.09],
        repaymentRange: [0.02, 0.25],
        speed: '24 hours',
      },
      {
        name: 'Uncapped',
        minRevenue: 15000,
        maxOffer: 5000000,
        feeRange: [0.06, 0.12],
        repaymentRange: [0.05, 0.25],
        speed: '48 hours',
      },
      {
        name: 'Outfund',
        minRevenue: 10000,
        maxOffer: 2000000,
        feeRange: [0.05, 0.10],
        repaymentRange: [0.05, 0.20],
        speed: '24 hours',
      },
    ];

    return providers
      .filter((p) => financials.monthlyRevenue >= p.minRevenue)
      .map((p) => ({
        provider: p.name,
        estimatedOffer: Math.min(
          financials.monthlyRevenue * 12 * 0.5, // ~6 months revenue
          p.maxOffer
        ),
        feeRange: p.feeRange,
        repaymentRange: p.repaymentRange,
        approvalSpeed: p.speed,
      }));
  }

  // =========================================================================
  // GRANT MATCHING
  // =========================================================================

  async findMatchingGrants(companyId: string): Promise<GrantMatch[]> {
    const context = await this.kg.getCompanyContext(companyId);

    // Search grant database
    const grants = await this.ai.research({
      prompt: `
        Find relevant grants for this UK company:
        
        Industry: ${context.industries.map((i) => i.name).join(', ')}
        Stage: ${context.company.funding_stage}
        Location: ${context.company.registered_address_city}
        Business: ${context.company.nature_of_business}
        Employee Count: ${context.team.length}
        
        Search for:
        1. Innovate UK grants
        2. Regional development grants
        3. Sector-specific grants
        4. R&D grants
        5. Export grants
        6. EU/Horizon Europe (if applicable)
        
        For each grant return:
        - Name
        - Provider
        - Amount range
        - Deadline
        - Eligibility criteria
        - Match score (0-100)
        - Application complexity
      `,
      sources: ['web', 'grant_databases'],
      format: 'json',
    });

    // Score and rank
    const scored = await Promise.all(
      grants.results.map(async (grant) => {
        const score = await this.scoreGrantMatch(grant, context);
        return { ...grant, matchScore: score };
      })
    );

    return scored
      .filter((g) => g.matchScore > 50)
      .sort((a, b) => b.matchScore - a.matchScore);
  }
}
```


---

# 7. THE NEXUS

The Nexus is Genesis Engine's AI-powered networking and funding platform.

## 7.1 Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            THE NEXUS                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   AI Agent   │  │   Matching   │  │   Funding    │  │    Trust     │    │
│  │  Networking  │  │    Engine    │  │    Engine    │  │    Graph     │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                 │                 │                 │            │
│         └─────────────────┴─────────────────┴─────────────────┘            │
│                                    │                                        │
│                           ┌────────┴────────┐                              │
│                           │  Neo4j Graph    │                              │
│                           │  (Relationships)│                              │
│                           └─────────────────┘                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 7.2 AI Networking Agent

```typescript
// services/nexus/networking-agent.service.ts

export class NetworkingAgentService {
  constructor(
    private readonly kg: KnowledgeGraphService,
    private readonly ai: AIService,
    private readonly calendar: CalendarService,
    private readonly email: EmailService,
    private readonly queue: QueueService
  ) {}

  // =========================================================================
  // INTRODUCTION FLOW
  // =========================================================================

  async requestIntroduction(
    requesterId: string,
    targetId: string,
    context: IntroductionContext
  ): Promise<IntroductionRequest> {
    // 1. Find best introduction path
    const paths = await this.kg.findIntroductionPaths(requesterId, targetId);
    if (!paths.length) {
      throw new NoPathError('No introduction path found');
    }

    // 2. Score paths by introducer quality
    const scoredPaths = await this.scorePaths(paths);
    const bestPath = scoredPaths[0];

    // 3. AI evaluates match quality
    const matchScore = await this.evaluateMatch(requesterId, targetId, context);

    // 4. Create introduction request
    const request = await this.db.introductionRequests.create({
      requesterId,
      targetId,
      introducerId: bestPath.introducerId,
      introductionType: context.type,
      message: context.message,
      aiMatchScore: matchScore.score,
      aiMatchReasons: matchScore.reasons,
      status: 'pending',
    });

    // 5. AI crafts outreach to introducer
    const outreachMessage = await this.craftIntroducerOutreach(
      request,
      bestPath,
      matchScore
    );

    // 6. Send to introducer for approval (double opt-in step 1)
    await this.notifyIntroducer(request, outreachMessage);

    return request;
  }

  private async evaluateMatch(
    requesterId: string,
    targetId: string,
    context: IntroductionContext
  ): Promise<MatchScore> {
    // Get full profiles
    const [requester, target] = await Promise.all([
      this.kg.getPersonContext(requesterId),
      this.kg.getPersonContext(targetId),
    ]);

    const prompt = `
      Evaluate the match quality for a ${context.type} introduction.
      
      REQUESTER:
      ${JSON.stringify(requester, null, 2)}
      
      TARGET:
      ${JSON.stringify(target, null, 2)}
      
      INTRODUCTION CONTEXT:
      ${context.message}
      
      Evaluate:
      1. Relevance (0-1): How relevant is this connection?
      2. Timing (0-1): Is this the right time for both parties?
      3. Value Exchange (0-1): Is there mutual benefit?
      4. Success Probability (0-1): Likelihood of positive outcome?
      
      Provide:
      - Overall score (0-1)
      - Top 3 reasons this is a good match
      - Any concerns or red flags
      - Suggested talking points
      
      Format as JSON.
    `;

    const result = await this.ai.generate({
      prompt,
      model: 'default',
      format: 'json',
    });

    return JSON.parse(result.content);
  }

  private async craftIntroducerOutreach(
    request: IntroductionRequest,
    path: IntroductionPath,
    matchScore: MatchScore
  ): Promise<string> {
    const prompt = `
      Craft a warm, personalized message asking for an introduction.
      
      FROM: ${request.requester.name} (${request.requester.company})
      TO (INTRODUCER): ${path.introducer.name}
      ABOUT: ${request.target.name} (${request.target.company})
      
      INTRODUCTION TYPE: ${request.introductionType}
      
      REQUESTER'S MESSAGE:
      ${request.message}
      
      MATCH REASONS:
      ${matchScore.reasons.join('\n')}
      
      Write a message that:
      1. Is warm and respectful of the introducer's time
      2. Clearly explains why this introduction makes sense
      3. Makes it easy for the introducer to say yes or no
      4. Includes specific context about mutual benefit
      
      Keep it under 200 words. Be genuine, not salesy.
    `;

    const result = await this.ai.generate({ prompt, temperature: 0.8 });
    return result.content;
  }

  // =========================================================================
  // DOUBLE OPT-IN FLOW
  // =========================================================================

  async handleIntroducerResponse(
    requestId: string,
    approved: boolean,
    message?: string
  ): Promise<void> {
    const request = await this.db.introductionRequests.findById(requestId);
    
    if (!approved) {
      await this.db.introductionRequests.update(requestId, {
        status: 'declined',
        introducerApprovedAt: null,
      });
      await this.notifyRequester(request, 'declined', message);
      return;
    }

    // Step 1 complete: Introducer approved
    await this.db.introductionRequests.update(requestId, {
      status: 'introducer_approved',
      introducerApprovedAt: new Date(),
    });

    // Craft message to target (double opt-in step 2)
    const targetOutreach = await this.craftTargetOutreach(request, message);
    await this.notifyTarget(request, targetOutreach);
  }

  async handleTargetResponse(
    requestId: string,
    approved: boolean,
    message?: string
  ): Promise<void> {
    const request = await this.db.introductionRequests.findById(requestId);

    if (!approved) {
      await this.db.introductionRequests.update(requestId, {
        status: 'declined',
      });
      await this.notifyRequesterAndIntroducer(request, 'target_declined', message);
      return;
    }

    // Both parties approved - make the introduction
    await this.db.introductionRequests.update(requestId, {
      status: 'accepted',
      targetApprovedAt: new Date(),
    });

    // Create the connection in graph
    await this.kg.createRelationship(
      'Person', request.requesterId,
      'KNOWS',
      'Person', request.targetId,
      {
        source: 'introduction',
        introducedBy: request.introducerId,
        date: new Date().toISOString(),
      }
    );

    // Send introduction email connecting both parties
    await this.sendIntroductionEmail(request);

    // Offer to schedule a call
    await this.offerScheduling(request);

    // Update trust scores
    await this.updateTrustScores(request);
  }

  // =========================================================================
  // AI-DRIVEN OUTREACH (like Boardy.ai)
  // =========================================================================

  async conductNetworkingCall(
    userId: string,
    conversationType: 'discovery' | 'investment' | 'partnership'
  ): Promise<NetworkingCallResult> {
    // Get user context
    const userContext = await this.kg.getPersonContext(userId);
    const companyContext = await this.kg.getCompanyContext(userContext.primaryCompanyId);

    // Create AI conversation agent
    const agent = new NetworkingConversationAgent({
      userContext,
      companyContext,
      conversationType,
      goals: this.getConversationGoals(conversationType),
    });

    // This is the AI "call" - could be voice (Twilio) or chat
    const session = await agent.startSession();

    return {
      sessionId: session.id,
      agentEndpoint: session.endpoint,
      estimatedDuration: '15-20 minutes',
    };
  }

  async processNetworkingCallResult(
    sessionId: string,
    transcript: string,
    outcome: any
  ): Promise<void> {
    // AI extracts key information
    const extraction = await this.ai.extract({
      content: transcript,
      schema: {
        interests: 'string[]',
        goals: 'string[]',
        challenges: 'string[]',
        lookingFor: 'string[]',
        expertise: 'string[]',
        investmentCriteria: 'object?',
        preferredIntroductions: 'string[]',
      },
    });

    // Update knowledge graph
    const userId = outcome.userId;
    await this.kg.updateEntity('Person', userId, extraction);

    // Find and suggest matches
    const matches = await this.findMatches(userId, extraction);
    
    // Queue introduction suggestions
    for (const match of matches.slice(0, 5)) {
      await this.queue.add('nexus:suggest-introduction', {
        userId,
        matchedUserId: match.userId,
        matchScore: match.score,
        reasons: match.reasons,
      });
    }
  }
}
```

## 7.3 Matching Engine

```typescript
// services/nexus/matching-engine.service.ts

export class MatchingEngineService {
  constructor(
    private readonly kg: KnowledgeGraphService,
    private readonly ai: AIService,
    private readonly pinecone: PineconeService
  ) {}

  // =========================================================================
  // INVESTOR MATCHING
  // =========================================================================

  async findInvestorMatches(
    companyId: string,
    criteria: InvestorMatchCriteria = {}
  ): Promise<InvestorMatch[]> {
    // Get company context
    const company = await this.kg.getCompanyContext(companyId);

    // 1. Graph-based matching (portfolio overlap)
    const graphMatches = await this.kg.findInvestorMatches(companyId);

    // 2. Vector-based matching (semantic similarity)
    const companyEmbedding = await this.getCompanyEmbedding(company);
    const vectorMatches = await this.findSimilarInvestors(companyEmbedding, criteria);

    // 3. Criteria-based filtering
    const filteredMatches = await this.filterByCriteria(
      [...graphMatches, ...vectorMatches],
      company,
      criteria
    );

    // 4. AI ranking
    const rankedMatches = await this.aiRankMatches(filteredMatches, company);

    // 5. Add warm introduction paths
    const enrichedMatches = await this.addIntroductionPaths(rankedMatches, company);

    return enrichedMatches.slice(0, criteria.limit || 50);
  }

  private async filterByCriteria(
    matches: InvestorMatch[],
    company: CompanyContext,
    criteria: InvestorMatchCriteria
  ): Promise<InvestorMatch[]> {
    return matches.filter((match) => {
      const investor = match.investor;

      // Check size
      if (criteria.checkSizeMin && investor.check_size_max < criteria.checkSizeMin) {
        return false;
      }
      if (criteria.checkSizeMax && investor.check_size_min > criteria.checkSizeMax) {
        return false;
      }

      // Check stage
      if (criteria.stages?.length && investor.stages?.length) {
        const stageMatch = criteria.stages.some((s) => investor.stages.includes(s));
        if (!stageMatch) return false;
      }

      // Check sectors
      if (criteria.sectors?.length && investor.sectors?.length) {
        const sectorMatch = criteria.sectors.some((s) => investor.sectors.includes(s));
        if (!sectorMatch) return false;
      }

      // Check exclusions
      if (investor.sector_exclusions?.length) {
        const companyIndustries = company.industries.map((i) => i.name);
        const excluded = investor.sector_exclusions.some((s) =>
          companyIndustries.includes(s)
        );
        if (excluded) return false;
      }

      // Check active status
      if (!investor.actively_investing) return false;

      // Check SEIS/EIS preference
      if (criteria.seisEligible && !investor.seis_investor) return false;
      if (criteria.eisEligible && !investor.eis_investor) return false;

      return true;
    });
  }

  private async aiRankMatches(
    matches: InvestorMatch[],
    company: CompanyContext
  ): Promise<InvestorMatch[]> {
    // Batch process for efficiency
    const batchSize = 10;
    const rankedMatches: InvestorMatch[] = [];

    for (let i = 0; i < matches.length; i += batchSize) {
      const batch = matches.slice(i, i + batchSize);

      const prompt = `
        Rank these investors for ${company.company.name} (${company.company.nature_of_business}).
        
        Company Context:
        - Stage: ${company.company.funding_stage}
        - Industry: ${company.industries.map((i) => i.name).join(', ')}
        - Seeking: ${company.company.seeking_amount || 'Not specified'}
        - Location: ${company.company.registered_address_city}
        
        Investors to rank:
        ${batch.map((m, idx) => `
        ${idx + 1}. ${m.investor.name}
           - Type: ${m.investor.investor_type}
           - Check size: ${m.investor.check_size_min}-${m.investor.check_size_max}
           - Stages: ${m.investor.stages?.join(', ')}
           - Sectors: ${m.investor.sectors?.join(', ')}
           - Portfolio overlap: ${m.portfolioOverlap || 0} companies
        `).join('\n')}
        
        For each investor, provide:
        - Rank (1-${batch.length})
        - Match score (0-100)
        - Top reason for match
        - Any concerns
        
        Format as JSON array.
      `;

      const result = await this.ai.generate({ prompt, format: 'json' });
      const rankings = JSON.parse(result.content);

      batch.forEach((match, idx) => {
        const ranking = rankings.find((r: any) => r.rank === idx + 1) || rankings[idx];
        rankedMatches.push({
          ...match,
          aiScore: ranking.matchScore,
          aiReason: ranking.topReason,
          aiConcerns: ranking.concerns,
        });
      });
    }

    return rankedMatches.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
  }

  // =========================================================================
  // ADVISOR MATCHING
  // =========================================================================

  async findAdvisorMatches(
    companyId: string,
    needs: AdvisorNeeds
  ): Promise<AdvisorMatch[]> {
    const company = await this.kg.getCompanyContext(companyId);

    // Find by expertise
    const byExpertise = await this.kg.query(`
      MATCH (p:Person)-[:HAS_SKILL]->(s:Skill)
      WHERE s.name IN $skills
      AND p.available_for_advising = true
      OPTIONAL MATCH (p)-[:ADVISES]->(c:Company)-[:IN_INDUSTRY]->(ind:Industry)
      WHERE ind.name IN $industries
      RETURN p, 
             COLLECT(DISTINCT s.name) AS matchingSkills,
             COUNT(DISTINCT c) AS advisingExperience,
             p.trust_score AS trustScore
      ORDER BY advisingExperience DESC, trustScore DESC
      LIMIT 50
    `, {
      skills: needs.skills,
      industries: company.industries.map((i) => i.name),
    });

    // AI filter and rank
    const ranked = await this.aiRankAdvisors(byExpertise, company, needs);

    return ranked;
  }

  // =========================================================================
  // PARTNER/CUSTOMER MATCHING
  // =========================================================================

  async findPartnerMatches(
    companyId: string,
    partnershipType: 'integration' | 'distribution' | 'strategic'
  ): Promise<PartnerMatch[]> {
    const company = await this.kg.getCompanyContext(companyId);

    // Graph traversal for complementary companies
    const candidates = await this.kg.query(`
      MATCH (c:Company {id: $companyId})-[:IN_INDUSTRY]->(ind:Industry)
      MATCH (partner:Company)-[:IN_INDUSTRY]->(ind2:Industry)
      WHERE partner.id <> $companyId
        AND NOT (c)-[:COMPETES_WITH]->(partner)
        AND partner.status = 'active'
      
      // Find complementary relationships
      OPTIONAL MATCH (c)-[:OWNS]->(p1:Product)
      OPTIONAL MATCH (partner)-[:OWNS]->(p2:Product)
      
      WITH partner, ind, ind2, COLLECT(p1) AS ourProducts, COLLECT(p2) AS theirProducts
      
      RETURN partner,
             COLLECT(DISTINCT ind2.name) AS industries,
             SIZE(theirProducts) AS productCount
      LIMIT 100
    `, { companyId });

    // Score by partnership potential
    const scored = await this.scorePartnershipPotential(
      candidates,
      company,
      partnershipType
    );

    return scored;
  }
}
```

## 7.4 Funding Engine

```typescript
// services/nexus/funding-engine.service.ts

export class FundingEngineService {
  constructor(
    private readonly db: Database,
    private readonly kg: KnowledgeGraphService,
    private readonly ai: AIService,
    private readonly documents: DocumentService,
    private readonly integrations: IntegrationsService
  ) {}

  // =========================================================================
  // SEIS/EIS AUTOMATION
  // =========================================================================

  async prepareSEISApplication(companyId: string): Promise<SEISApplication> {
    const company = await this.kg.getCompanyContext(companyId);

    // 1. Check eligibility
    const eligibility = await this.checkSEISEligibility(company);
    if (!eligibility.eligible) {
      throw new IneligibleError('Company not SEIS eligible', eligibility.reasons);
    }

    // 2. Gather required information
    const requiredInfo = await this.gatherSEISInfo(company);

    // 3. Generate SEIS1 form data
    const formData = await this.generateSEIS1FormData(company, requiredInfo);

    // 4. Create application document
    const document = await this.documents.generate({
      type: 'seis_advance_assurance',
      template: 'seis1_form',
      data: formData,
      companyId,
    });

    // 5. Create cover letter
    const coverLetter = await this.generateSEISCoverLetter(company, formData);

    // 6. Create application record
    const application = await this.db.seisApplications.create({
      companyId,
      type: 'advance_assurance',
      status: 'draft',
      formData,
      eligibilityCheck: eligibility,
      documentIds: [document.id, coverLetter.id],
    });

    return application;
  }

  private async checkSEISEligibility(company: CompanyContext): Promise<EligibilityResult> {
    const checks: EligibilityCheck[] = [
      {
        name: 'uk_permanent_establishment',
        check: () => company.company.registered_address_country === 'GB',
        failReason: 'Company must have UK permanent establishment',
      },
      {
        name: 'qualifying_trade',
        check: async () => {
          const excludedSICs = ['64', '65', '66', '68', '70']; // Financial, property, holding
          const sics = company.company.sic_codes || [];
          return !sics.some(sic => excludedSICs.some(ex => sic.startsWith(ex)));
        },
        failReason: 'Company must carry on a qualifying trade',
      },
      {
        name: 'gross_assets',
        check: () => (company.company.gross_assets || 0) <= 200000,
        failReason: 'Gross assets must be ≤£200,000 before share issue',
      },
      {
        name: 'employee_count',
        check: () => (company.company.employee_count || 0) < 25,
        failReason: 'Must have fewer than 25 full-time equivalent employees',
      },
      {
        name: 'company_age',
        check: () => {
          if (!company.company.incorporation_date) return true;
          const age = Date.now() - new Date(company.company.incorporation_date).getTime();
          const years = age / (365 * 24 * 60 * 60 * 1000);
          return years <= 2;
        },
        failReason: 'Company must be less than 2 years old',
      },
      {
        name: 'not_listed',
        check: () => company.company.company_type !== 'plc' || !company.company.listed,
        failReason: 'Company must not be listed on a stock exchange',
      },
      {
        name: 'no_control_arrangements',
        check: async () => {
          // Check for existing arrangements
          const arrangements = await this.checkControlArrangements(company.company.id);
          return !arrangements.hasControlArrangements;
        },
        failReason: 'No arrangements to become controlled by another company',
      },
    ];

    const results = await Promise.all(
      checks.map(async (check) => ({
        name: check.name,
        passed: await check.check(),
        failReason: check.failReason,
      }))
    );

    const failed = results.filter((r) => !r.passed);

    return {
      eligible: failed.length === 0,
      checks: results,
      reasons: failed.map((r) => r.failReason),
    };
  }

  // =========================================================================
  // GRANT MATCHING
  // =========================================================================

  async findMatchingGrants(companyId: string): Promise<GrantMatch[]> {
    const company = await this.kg.getCompanyContext(companyId);

    // 1. Get available grants from our database and external sources
    const grants = await this.getAvailableGrants();

    // 2. AI-powered matching
    const matches = await this.matchGrantsToCompany(grants, company);

    // 3. Calculate success probability
    const withProbability = await Promise.all(
      matches.map(async (match) => ({
        ...match,
        successProbability: await this.calculateGrantSuccessProbability(match, company),
      }))
    );

    // 4. Sort by score * probability
    return withProbability.sort(
      (a, b) => b.matchScore * b.successProbability - a.matchScore * a.successProbability
    );
  }

  async generateGrantApplication(
    companyId: string,
    grantId: string
  ): Promise<GrantApplication> {
    const company = await this.kg.getCompanyContext(companyId);
    const grant = await this.db.grants.findById(grantId);

    // 1. Get grant application requirements
    const requirements = await this.getGrantRequirements(grant);

    // 2. Map company data to requirements
    const dataMap = await this.mapCompanyToRequirements(company, requirements);

    // 3. Identify gaps
    const gaps = requirements.filter((r) => !dataMap[r.id]?.complete);

    if (gaps.length > 0) {
      // Request missing information
      return {
        status: 'incomplete',
        gaps,
        dataMap,
      };
    }

    // 4. AI generate application content
    const applicationContent = await this.generateApplicationContent(
      company,
      grant,
      requirements,
      dataMap
    );

    // 5. Create draft application
    const application = await this.db.grantApplications.create({
      companyId,
      grantId,
      grantName: grant.name,
      grantProvider: grant.provider,
      status: 'drafting',
      content: applicationContent,
      amountRequested: this.calculateRequestAmount(company, grant),
    });

    // 6. Generate application document
    const document = await this.documents.generate({
      type: 'grant_application',
      template: grant.applicationTemplate || 'generic_grant',
      data: applicationContent,
      companyId,
    });

    return {
      ...application,
      documentId: document.id,
      status: 'draft',
    };
  }

  // =========================================================================
  // RBF (Revenue-Based Financing)
  // =========================================================================

  async assessRBFEligibility(companyId: string): Promise<RBFAssessment> {
    const company = await this.kg.getCompanyContext(companyId);

    // Get financial data
    const financials = await this.getFinancialMetrics(companyId);

    // Assess against RBF provider criteria
    const providers = ['clearco', 'wayflyer', 'uncapped', 'outfund'];
    const assessments = await Promise.all(
      providers.map((provider) => this.assessProviderEligibility(provider, company, financials))
    );

    return {
      eligible: assessments.some((a) => a.eligible),
      providers: assessments,
      recommendedProvider: assessments.find((a) => a.eligible && a.bestFit),
      estimatedOffer: this.estimateRBFOffer(assessments, financials),
    };
  }

  private async assessProviderEligibility(
    provider: string,
    company: CompanyContext,
    financials: FinancialMetrics
  ): Promise<ProviderAssessment> {
    const criteria = RBF_PROVIDER_CRITERIA[provider];

    const checks = [
      {
        name: 'minimum_revenue',
        passed: financials.monthlyRevenue >= criteria.minMonthlyRevenue,
        value: financials.monthlyRevenue,
        required: criteria.minMonthlyRevenue,
      },
      {
        name: 'revenue_history',
        passed: financials.monthsOfHistory >= criteria.minMonthsHistory,
        value: financials.monthsOfHistory,
        required: criteria.minMonthsHistory,
      },
      {
        name: 'growth_rate',
        passed: !criteria.minGrowthRate || financials.growthRate >= criteria.minGrowthRate,
        value: financials.growthRate,
        required: criteria.minGrowthRate,
      },
      {
        name: 'business_model',
        passed: criteria.allowedModels.includes(company.company.business_model),
        value: company.company.business_model,
        required: criteria.allowedModels,
      },
    ];

    const passedAll = checks.every((c) => c.passed);

    return {
      provider,
      eligible: passedAll,
      checks,
      estimatedAmount: passedAll ? this.estimateProviderAmount(provider, financials) : null,
      estimatedFee: passedAll ? criteria.typicalFee : null,
      bestFit: passedAll && this.calculateFit(criteria, company, financials) > 0.8,
    };
  }

  // =========================================================================
  // COMMUNITY ROUNDS
  // =========================================================================

  async createCommunityRound(
    companyId: string,
    params: CommunityRoundParams
  ): Promise<CommunityRound> {
    // Validate FCA compliance
    await this.validateCommunityRoundCompliance(companyId, params);

    // Create round
    const round = await this.db.fundingRounds.create({
      companyId,
      roundType: 'community',
      roundName: params.name || 'Community Round',
      targetAmount: params.targetAmount,
      minimumAmount: params.minimumAmount,
      maximumAmount: params.maximumAmount,
      minimumInvestment: params.minimumInvestment || 100,
      maximumInvestment: params.maximumInvestment,
      sharePrice: params.sharePrice,
      preMoneyValuation: params.valuation,
      seisEligible: params.seisEligible,
      eisEligible: params.eisEligible,
      status: 'planning',
    });

    // Generate required documents
    const documents = await this.generateCommunityRoundDocuments(round, companyId);

    // Set up payment processing
    const stripeProduct = await this.setupStripeForRound(round);

    return {
      ...round,
      documents,
      paymentSetup: stripeProduct,
    };
  }

  private async validateCommunityRoundCompliance(
    companyId: string,
    params: CommunityRoundParams
  ): Promise<void> {
    // Check FCA exemptions
    if (params.targetAmount > 5000000) {
      throw new ComplianceError('Amounts over £5M require FCA approval');
    }

    if (params.minimumInvestment && params.minimumInvestment < 100) {
      throw new ComplianceError('Minimum investment must be at least £100');
    }

    // Check company eligibility
    const company = await this.db.companies.findById(companyId);
    if (!company.company_number) {
      throw new ComplianceError('Company must be incorporated to raise funds');
    }

    // Verify SEIS/EIS claims
    if (params.seisEligible) {
      const seisCheck = await this.checkSEISEligibility(await this.kg.getCompanyContext(companyId));
      if (!seisCheck.eligible) {
        throw new ComplianceError('Company is not SEIS eligible');
      }
    }
  }
}

// Provider criteria configuration
const RBF_PROVIDER_CRITERIA = {
  clearco: {
    minMonthlyRevenue: 10000,
    minMonthsHistory: 6,
    minGrowthRate: null,
    allowedModels: ['ecommerce', 'saas', 'subscription'],
    typicalFee: 0.06,
    maxAdvance: 10000000,
  },
  wayflyer: {
    minMonthlyRevenue: 20000,
    minMonthsHistory: 6,
    minGrowthRate: 0.1,
    allowedModels: ['ecommerce', 'marketplace'],
    typicalFee: 0.05,
    maxAdvance: 20000000,
  },
  uncapped: {
    minMonthlyRevenue: 15000,
    minMonthsHistory: 12,
    minGrowthRate: 0.15,
    allowedModels: ['saas', 'subscription'],
    typicalFee: 0.08,
    maxAdvance: 5000000,
  },
  outfund: {
    minMonthlyRevenue: 5000,
    minMonthsHistory: 3,
    minGrowthRate: null,
    allowedModels: ['ecommerce', 'saas', 'subscription', 'marketplace'],
    typicalFee: 0.07,
    maxAdvance: 2000000,
  },
};
```

## 7.5 Trust Graph System

```typescript
// services/nexus/trust-graph.service.ts

export class TrustGraphService {
  constructor(
    private readonly db: Database,
    private readonly kg: KnowledgeGraphService
  ) {}

  // Calculate trust score for a user
  async calculateTrustScore(userId: string): Promise<TrustScore> {
    // Component weights
    const weights = {
      delivery: 0.30,
      voucher: 0.25,
      introduction: 0.20,
      responsiveness: 0.15,
      contribution: 0.10,
    };

    // Calculate each component
    const [delivery, voucher, introduction, responsiveness, contribution] = await Promise.all([
      this.calculateDeliveryScore(userId),
      this.calculateVoucherScore(userId),
      this.calculateIntroductionScore(userId),
      this.calculateResponsivenessScore(userId),
      this.calculateContributionScore(userId),
    ]);

    // Weighted average
    const overall =
      delivery * weights.delivery +
      voucher * weights.voucher +
      introduction * weights.introduction +
      responsiveness * weights.responsiveness +
      contribution * weights.contribution;

    // Determine tier
    const tier = this.determineTier(overall);

    // Update database
    const trustScore = await this.db.trustScores.upsert({
      userId,
      overallScore: overall,
      tier,
      deliveryScore: delivery,
      voucherScore: voucher,
      introductionScore: introduction,
      responsivenessScore: responsiveness,
      contributionScore: contribution,
      calculatedAt: new Date(),
    });

    return trustScore;
  }

  private async calculateDeliveryScore(userId: string): Promise<number> {
    // Based on commitments made and kept
    const commitments = await this.db.commitments.findByUser(userId);
    
    if (commitments.length === 0) return 50; // Neutral starting score

    const kept = commitments.filter((c) => c.status === 'completed');
    const ratio = kept.length / commitments.length;
    
    // Recency weighting
    const recentWeight = this.calculateRecencyWeight(commitments);
    
    return Math.min(100, (ratio * 80 + 20) * recentWeight);
  }

  private async calculateVoucherScore(userId: string): Promise<number> {
    // Based on vouches received from trusted users
    const vouches = await this.kg.query(`
      MATCH (p:Person {user_id: $userId})<-[v:VOUCHES_FOR]-(voucher:Person)
      RETURN voucher.trust_score AS voucherTrust,
             v.date AS vouchDate,
             v.context AS context
    `, { userId });

    if (vouches.length === 0) return 50;

    // Weight vouches by voucher's trust score
    const weightedVouches = vouches.reduce((sum, v) => {
      const recency = this.recencyMultiplier(v.vouchDate);
      return sum + (v.voucherTrust || 50) * recency;
    }, 0);

    const maxPossible = vouches.length * 100;
    return Math.min(100, (weightedVouches / maxPossible) * 100);
  }

  private async calculateIntroductionScore(userId: string): Promise<number> {
    // Based on successful introductions made
    const intros = await this.db.introductionRequests.findByIntroducer(userId);
    
    if (intros.length === 0) return 50;

    const successful = intros.filter((i) => 
      i.status === 'accepted' || i.outcome === 'successful'
    );
    
    const successRate = successful.length / intros.length;
    const volumeBonus = Math.min(20, intros.length * 2);
    
    return Math.min(100, successRate * 80 + volumeBonus);
  }

  private async calculateResponsivenessScore(userId: string): Promise<number> {
    // Based on response times to introduction requests
    const requests = await this.db.introductionRequests.findByTarget(userId);
    
    if (requests.length === 0) return 50;

    const responseTimes = requests
      .filter((r) => r.targetApprovedAt)
      .map((r) => {
        const sent = new Date(r.createdAt);
        const responded = new Date(r.targetApprovedAt);
        return (responded.getTime() - sent.getTime()) / (1000 * 60 * 60); // Hours
      });

    if (responseTimes.length === 0) return 30;

    const avgHours = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

    // Score based on response time (faster = better)
    if (avgHours < 4) return 100;
    if (avgHours < 24) return 80;
    if (avgHours < 48) return 60;
    if (avgHours < 168) return 40;
    return 20;
  }

  private async calculateContributionScore(userId: string): Promise<number> {
    // Based on platform contributions (content, help, etc.)
    const contributions = await this.db.contributions.findByUser(userId);
    
    const score = contributions.reduce((sum, c) => {
      const typeScore = {
        article: 10,
        answer: 5,
        comment: 2,
        resource: 15,
        event: 20,
        mentoring: 25,
      }[c.type] || 1;
      
      return sum + typeScore * (c.quality || 1);
    }, 0);

    return Math.min(100, 50 + score);
  }

  private determineTier(score: number): TrustTier {
    if (score >= 90) return 'diamond';
    if (score >= 80) return 'platinum';
    if (score >= 65) return 'gold';
    if (score >= 50) return 'silver';
    return 'bronze';
  }

  private recencyMultiplier(date: string): number {
    const days = (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24);
    if (days < 30) return 1.0;
    if (days < 90) return 0.9;
    if (days < 180) return 0.7;
    if (days < 365) return 0.5;
    return 0.3;
  }
}
```


---

# 15. IMPLEMENTATION GUIDE

## 15.1 Quick Start Checklist

### Prerequisites
- [ ] Node.js 20.x installed
- [ ] pnpm 8.x installed
- [ ] Docker and Docker Compose installed
- [ ] PostgreSQL 16.x, Redis 7.x, Neo4j 5.x, Elasticsearch 8.x
- [ ] AWS/GCP account for production deployment

### Configuration (Day 1)
1. [ ] Copy `config/genesis.example.env` to `config/genesis.env`
2. [ ] Generate encryption keys: `openssl rand -hex 32`
3. [ ] Configure database connections
4. [ ] Set up API keys (Companies House, HMRC, Stripe, AI providers)
5. [ ] Configure OAuth (Google, Apple, LinkedIn)

### Database Setup (Day 1-2)
```bash
# Start databases
docker-compose up -d postgres redis neo4j elasticsearch

# Run migrations
pnpm db:migrate

# Seed initial data
pnpm db:seed
```

### Core Services (Week 1)
1. [ ] Auth Service (Port 3010)
2. [ ] User Service (Port 3011)
3. [ ] Company Service (Port 3012)
4. [ ] API Gateway (Port 3000)

### Knowledge Graph (Week 1-2)
1. [ ] Neo4j schema setup
2. [ ] Pinecone index creation
3. [ ] Initial entity ingestion

### Genesis Core (Week 2-3)
1. [ ] Phase system
2. [ ] Module execution engine
3. [ ] AI integration layer

### The Nexus (Week 3-4)
1. [ ] Trust graph
2. [ ] Matching engine
3. [ ] Introduction flow
4. [ ] Funding engine

### Pulse (Week 4-5)
1. [ ] Twilio integration
2. [ ] WhatsApp Business API
3. [ ] Conversation engine
4. [ ] Proactive outreach

### External Integrations (Week 5-6)
1. [ ] Companies House API
2. [ ] HMRC OAuth
3. [ ] Open Banking (TrueLayer)
4. [ ] Document signing (DocuSign)

## 15.2 Environment Configuration Summary

| Variable Category | Count | Critical |
|-------------------|-------|----------|
| Core Application | 12 | Yes |
| Database Connections | 15 | Yes |
| Authentication | 18 | Yes |
| External APIs | 25 | Partial |
| AI Providers | 8 | Yes |
| Feature Flags | 15 | No |
| **Total** | **93** | **~45** |

## 15.3 Service Port Allocation

| Service | Port | Type |
|---------|------|------|
| API Gateway | 3000 | HTTP |
| Knowledge Graph | 3001 | gRPC |
| Financial Engine | 3002 | gRPC |
| Document Engine | 3003 | gRPC |
| Nexus Service | 3004 | gRPC |
| Pulse Service | 3005 | gRPC |
| Compliance Engine | 3006 | gRPC |
| Task Engine | 3007 | gRPC |
| CRM Service | 3008 | gRPC |
| Calendar Service | 3009 | gRPC |
| Auth Service | 3010 | HTTP |
| User Service | 3011 | HTTP |
| Company Service | 3012 | HTTP |
| Billing Service | 3013 | HTTP |
| PostgreSQL | 5432 | TCP |
| Redis | 6379 | TCP |
| Neo4j HTTP | 7474 | HTTP |
| Neo4j Bolt | 7687 | TCP |
| Elasticsearch | 9200 | HTTP |
| Prometheus | 9090 | HTTP |
| Grafana | 3100 | HTTP |

## 15.4 Monitoring Checklist

### Health Endpoints
- [ ] `/health` - Basic liveness
- [ ] `/health/ready` - Full readiness
- [ ] `/health/startup` - Startup probe

### Metrics (Prometheus)
- [ ] HTTP request latency
- [ ] HTTP error rates
- [ ] Queue depths
- [ ] AI response times
- [ ] Database connection pool
- [ ] External API latencies

### Alerts
- [ ] Error rate > 5%
- [ ] P95 latency > 2s
- [ ] Queue backup > 1000
- [ ] AI service degradation
- [ ] Database connection failure
- [ ] Low disk space
- [ ] High memory usage

## 15.5 Security Checklist

### Authentication
- [ ] JWT with 15-minute expiry
- [ ] Refresh token rotation
- [ ] MFA support
- [ ] Account lockout after failed attempts
- [ ] Session management

### Authorization
- [ ] RBAC implementation
- [ ] Permission checking middleware
- [ ] Company-level isolation

### Data Protection
- [ ] AES-256-GCM encryption at rest
- [ ] TLS 1.3 minimum in transit
- [ ] Field-level encryption for PII
- [ ] Audit logging for all sensitive operations

### API Security
- [ ] Rate limiting
- [ ] Input validation (Zod)
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention
- [ ] CORS configuration
- [ ] Security headers

## 15.6 Deployment Checklist

### Infrastructure
- [ ] Kubernetes cluster provisioned
- [ ] Ingress controller configured
- [ ] TLS certificates (cert-manager)
- [ ] Load balancer
- [ ] Database instances (managed)
- [ ] Redis cluster
- [ ] Elasticsearch cluster
- [ ] S3/GCS for file storage

### CI/CD
- [ ] GitHub Actions workflow
- [ ] Docker image builds
- [ ] Automated testing
- [ ] Staging environment
- [ ] Production deployment approval

### Monitoring
- [ ] Prometheus deployed
- [ ] Grafana dashboards
- [ ] AlertManager configured
- [ ] Log aggregation (ELK/Loki)
- [ ] Distributed tracing (Jaeger)

---

# 16. DOCUMENT INDEX

| Section | Description | Lines |
|---------|-------------|-------|
| 1. Configuration | Environment variables and validation | ~300 |
| 2. Technology Stack | All dependencies with versions | ~100 |
| 3. System Architecture | Microservices and data flow | ~150 |
| 4. Database Schemas | PostgreSQL, Neo4j, Redis | ~2000 |
| 5. Knowledge Graph | Neo4j implementation | ~400 |
| 6. Genesis Core | Phase system and modules | ~1500 |
| 7. The Nexus | Networking and funding | ~1200 |
| 8. Pulse | Conversational interface | ~800 |
| 9. API Specifications | REST/GraphQL endpoints | ~600 |
| 10. Error Handling | Codes and retry logic | ~300 |
| 11. Security | Auth, encryption, RBAC | ~500 |
| 12. Deployment | Docker, K8s, CI/CD | ~400 |
| 13. Monitoring | Metrics, logging, tracing | ~300 |
| 14. Appendix | Limits, retention, compliance | ~200 |
| 15. Implementation | Quick start guide | ~200 |

---

**END OF GENESIS ENGINE TECHNICAL SPECIFICATION**

**Document Statistics:**
- Total Lines: ~13,500+
- Total Sections: 16
- Services Defined: 13
- Database Tables: 25+
- API Endpoints: 100+
- Error Codes: 50+

**Next Steps:**
1. Populate `genesis.env` with your values
2. Run `docker-compose up -d`
3. Run migrations
4. Start development

**Questions?** This document should answer most technical questions. For implementation support, refer to the code examples in each section.

