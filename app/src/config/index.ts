// ============================================================================
// GENESIS ENGINE - FRONTEND CONFIGURATION
// ============================================================================

import { z } from 'zod'

// Environment schema validation
const envSchema = z.object({
  // App Configuration
  NEXT_PUBLIC_APP_NAME: z.string().default('Genesis Engine'),
  NEXT_PUBLIC_APP_VERSION: z.string().default('1.0.0'),
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_API_URL: z.string().url().default('http://localhost:8000'),

  // Feature Flags
  NEXT_PUBLIC_FEATURE_NEXUS_ENABLED: z.string().transform(val => val === 'true').default(true),
  NEXT_PUBLIC_FEATURE_PULSE_ENABLED: z.string().transform(val => val === 'true').default(true),
  NEXT_PUBLIC_FEATURE_COMMUNITY_ROUNDS_ENABLED: z.string().transform(val => val === 'true').default(false),
  NEXT_PUBLIC_FEATURE_RBF_ENABLED: z.string().transform(val => val === 'true').default(true),

  // Database Feature Availability (for frontend feature toggling)
  NEXT_PUBLIC_DB_POSTGRESQL_ENABLED: z.string().transform(val => val === 'true').default(true),
  NEXT_PUBLIC_DB_NEO4J_ENABLED: z.string().transform(val => val === 'true').default(true),
  NEXT_PUBLIC_DB_REDIS_ENABLED: z.string().transform(val => val === 'true').default(true),
  NEXT_PUBLIC_DB_ELASTICSEARCH_ENABLED: z.string().transform(val => val === 'true').default(true),
  NEXT_PUBLIC_DB_PINECONE_ENABLED: z.string().transform(val => val === 'true').default(true),

  // Database Connection URLs
  NEXT_PUBLIC_NEO4J_URL: z.string().optional(),
  NEXT_PUBLIC_NEO4J_USER: z.string().optional(),
  NEXT_PUBLIC_NEO4J_PASSWORD: z.string().optional(),

  // AI Service Availability
  NEXT_PUBLIC_AI_OPENAI_ENABLED: z.string().transform(val => val === 'true').default(true),
  NEXT_PUBLIC_AI_ANTHROPIC_ENABLED: z.string().transform(val => val === 'true').default(true),
  NEXT_PUBLIC_AI_GOOGLE_ENABLED: z.string().transform(val => val === 'true').default(false),
  NEXT_PUBLIC_AI_COHERE_ENABLED: z.string().transform(val => val === 'true').default(false),

  // AI API Keys (should be in environment, not NEXT_PUBLIC for security)
  NEXT_PUBLIC_OPENAI_API_KEY: z.string().optional(),
  NEXT_PUBLIC_ANTHROPIC_API_KEY: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_AI_API_KEY: z.string().optional(),
  NEXT_PUBLIC_COHERE_API_KEY: z.string().optional(),

  // External API Availability
  NEXT_PUBLIC_API_COMPANIES_HOUSE_ENABLED: z.string().transform(val => val === 'true').default(true),
  NEXT_PUBLIC_API_HMRC_ENABLED: z.string().transform(val => val === 'true').default(true),
  NEXT_PUBLIC_API_ICO_ENABLED: z.string().transform(val => val === 'true').default(false),
  NEXT_PUBLIC_API_STRIPE_ENABLED: z.string().transform(val => val === 'true').default(true),
  NEXT_PUBLIC_API_GOCARDLESS_ENABLED: z.string().transform(val => val === 'true').default(false),
  NEXT_PUBLIC_API_TWILIO_ENABLED: z.string().transform(val => val === 'true').default(true),
  NEXT_PUBLIC_API_SENDGRID_ENABLED: z.string().transform(val => val === 'true').default(true),
  NEXT_PUBLIC_API_TELEGRAM_ENABLED: z.string().transform(val => val === 'true').default(false),
  NEXT_PUBLIC_API_FIREBASE_ENABLED: z.string().transform(val => val === 'true').default(false),
  NEXT_PUBLIC_API_GOOGLE_CALENDAR_ENABLED: z.string().transform(val => val === 'true').default(false),
  NEXT_PUBLIC_API_CALENDLY_ENABLED: z.string().transform(val => val === 'true').default(false),
  NEXT_PUBLIC_API_TRUELAYER_ENABLED: z.string().transform(val => val === 'true').default(false),
  NEXT_PUBLIC_API_PLAID_ENABLED: z.string().transform(val => val === 'true').default(false),

  // External API URLs (for frontend integration)
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),

  // Firebase Configuration (External Services) - Optional when using mock API
  NEXT_PUBLIC_USE_MOCK_API: z.string().transform(val => val === 'true').default(false),
  NEXT_PUBLIC_FIREBASE_API_KEY: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_APP_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_FIREBASE_DATABASE_URL: z.string().url().optional(),

  // Lovable API Configuration (External API Platform)
  NEXT_PUBLIC_LOVABLE_API_URL: z.string().url().default('https://api.lovable.dev'),
  NEXT_PUBLIC_LOVABLE_PROJECT_ID: z.string().optional(),
  LOVABLE_API_KEY: z.string().optional(),

  // Legacy Service URLs (for backward compatibility - now using Firebase/Lovable)
  NEXT_PUBLIC_AUTH_SERVICE_URL: z.string().url().default('http://localhost:3010'),
  NEXT_PUBLIC_USER_SERVICE_URL: z.string().url().default('http://localhost:3011'),
  NEXT_PUBLIC_COMPANY_SERVICE_URL: z.string().url().default('http://localhost:3012'),
  NEXT_PUBLIC_KNOWLEDGE_GRAPH_URL: z.string().url().default('http://localhost:3001'),
  NEXT_PUBLIC_FINANCIAL_ENGINE_URL: z.string().url().default('http://localhost:3002'),
  NEXT_PUBLIC_DOCUMENT_ENGINE_URL: z.string().url().default('http://localhost:3003'),
  NEXT_PUBLIC_NEXUS_URL: z.string().url().default('http://localhost:3004'),
  NEXT_PUBLIC_PULSE_URL: z.string().url().default('http://localhost:3005'),
  NEXT_PUBLIC_COMPLIANCE_URL: z.string().url().default('http://localhost:3006'),
  NEXT_PUBLIC_CRM_URL: z.string().url().default('http://localhost:3008'),
  NEXT_PUBLIC_CALENDAR_URL: z.string().url().default('http://localhost:3009'),
  NEXT_PUBLIC_BILLING_URL: z.string().url().default('http://localhost:3013'),

  // Rate Limiting (client-side)
  NEXT_PUBLIC_RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default(900000),
  NEXT_PUBLIC_RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default(100),

  // UI Configuration
  NEXT_PUBLIC_DEFAULT_TIMEZONE: z.string().default('Europe/London'),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.string().default('en-GB'),
  NEXT_PUBLIC_DEFAULT_CURRENCY: z.string().default('GBP'),
  NEXT_PUBLIC_SUPPORTED_COUNTRIES: z.string().default('GB,IE'),

  // Monitoring & Observability
  NEXT_PUBLIC_SENTRY_ENABLED: z.string().transform(val => val === 'true').default(false),
  NEXT_PUBLIC_SENTRY_ENVIRONMENT: z.string().default('development'),
  NEXT_PUBLIC_DATADOG_ENABLED: z.string().transform(val => val === 'true').default(false),
  NEXT_PUBLIC_LOGTAIL_ENABLED: z.string().transform(val => val === 'true').default(false),
  NEXT_PUBLIC_BETTER_UPTIME_ENABLED: z.string().transform(val => val === 'true').default(false),

  // Rate Limiting (already added)
  // Queue System
  NEXT_PUBLIC_QUEUE_ENABLED: z.string().transform(val => val === 'true').default(true),
  NEXT_PUBLIC_QUEUE_REDIS_ENABLED: z.string().transform(val => val === 'true').default(true),

  // Worker Configuration
  NEXT_PUBLIC_WORKERS_ENABLED: z.string().transform(val => val === 'true').default(true),
  NEXT_PUBLIC_WORKER_CONCURRENCY: z.string().transform(Number).default(5),

  // Encryption
  NEXT_PUBLIC_ENCRYPTION_ENABLED: z.string().transform(val => val === 'true').default(true),

  // Session Management
  NEXT_PUBLIC_SESSION_ENABLED: z.string().transform(val => val === 'true').default(true),
  NEXT_PUBLIC_SESSION_MAX_AGE: z.string().transform(Number).default(604800000),

  // Development flags
  NEXT_PUBLIC_ENABLE_MSW: z.string().transform(val => val === 'true').default(false),
  NEXT_PUBLIC_ENABLE_DEBUG_LOGGING: z.string().transform(val => val === 'true').default(false),
  NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING: z.string().transform(val => val === 'true').default(false),
})

// Parse and validate environment variables
const parsedEnv = envSchema.safeParse(process.env)

if (!parsedEnv.success) {
  console.error('❌ Configuration validation failed:')
  parsedEnv.error.issues.forEach(error => {
    console.error(`  - ${error.path.join('.')}: ${error.message}`)
  })
  throw new Error('Invalid environment configuration')
}

export const config = parsedEnv.data

// ============================================================================
// CONFIGURATION HELPERS
// ============================================================================

export const getServiceUrl = (service: string): string => {
  const serviceUrlMap: Record<string, string> = {
    NEXT_PUBLIC_AUTH_SERVICE_URL: config.NEXT_PUBLIC_AUTH_SERVICE_URL,
    NEXT_PUBLIC_USER_SERVICE_URL: config.NEXT_PUBLIC_USER_SERVICE_URL,
    NEXT_PUBLIC_COMPANY_SERVICE_URL: config.NEXT_PUBLIC_COMPANY_SERVICE_URL,
    NEXT_PUBLIC_KNOWLEDGE_GRAPH_URL: config.NEXT_PUBLIC_KNOWLEDGE_GRAPH_URL,
    NEXT_PUBLIC_FINANCIAL_ENGINE_URL: config.NEXT_PUBLIC_FINANCIAL_ENGINE_URL,
    NEXT_PUBLIC_DOCUMENT_ENGINE_URL: config.NEXT_PUBLIC_DOCUMENT_ENGINE_URL,
    NEXT_PUBLIC_NEXUS_URL: config.NEXT_PUBLIC_NEXUS_URL,
    NEXT_PUBLIC_PULSE_URL: config.NEXT_PUBLIC_PULSE_URL,
    NEXT_PUBLIC_COMPLIANCE_URL: config.NEXT_PUBLIC_COMPLIANCE_URL,
    NEXT_PUBLIC_CRM_URL: config.NEXT_PUBLIC_CRM_URL,
    NEXT_PUBLIC_CALENDAR_URL: config.NEXT_PUBLIC_CALENDAR_URL,
    NEXT_PUBLIC_BILLING_URL: config.NEXT_PUBLIC_BILLING_URL,
  }

  return serviceUrlMap[service] || config.NEXT_PUBLIC_API_URL
}

export const isFeatureEnabled = (feature: string): boolean => {
  const featureFlags = {
    'nexus': config.NEXT_PUBLIC_FEATURE_NEXUS_ENABLED,
    'pulse': config.NEXT_PUBLIC_FEATURE_PULSE_ENABLED,
    'community-rounds': config.NEXT_PUBLIC_FEATURE_COMMUNITY_ROUNDS_ENABLED,
    'rbf': config.NEXT_PUBLIC_FEATURE_RBF_ENABLED,
  }

  return featureFlags[feature as keyof typeof featureFlags] || false
}

export const getApiEndpoint = (endpoint: string): string => {
  return `${config.NEXT_PUBLIC_API_URL}/api/${endpoint}`
}

export const getServiceEndpoint = (service: string, endpoint: string): string => {
  const serviceUrl = getServiceUrl(`NEXT_PUBLIC_${service.toUpperCase()}_URL` as keyof typeof config)
  return `${serviceUrl}/api/${endpoint}`
}

// ============================================================================
// ENVIRONMENT CONSTANTS
// ============================================================================

export const ENVIRONMENT = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
} as const

export const API_ENDPOINTS = {
  // Authentication
  LOGIN: getApiEndpoint('auth/login'),
  REGISTER: getApiEndpoint('auth/register'),
  LOGOUT: getApiEndpoint('auth/logout'),
  REFRESH_TOKEN: getApiEndpoint('auth/refresh'),
  FORGOT_PASSWORD: getApiEndpoint('auth/forgot-password'),
  RESET_PASSWORD: getApiEndpoint('auth/reset-password'),

  // User Management
  USER_PROFILE: getApiEndpoint('user/profile'),
  USER_UPDATE: getApiEndpoint('user/update'),
  USER_PREFERENCES: getApiEndpoint('user/preferences'),

  // Company Management
  COMPANIES: getApiEndpoint('companies'),
  COMPANY_DETAIL: (id: string) => getApiEndpoint(`companies/${id}`),
  COMPANY_INCORPORATE: getApiEndpoint('companies/incorporate'),
  COMPANY_UPDATE: (id: string) => getApiEndpoint(`companies/${id}`),

  // Financial
  FINANCIAL_PROJECTIONS: (companyId: string) => getApiEndpoint(`companies/${companyId}/financial/projections`),
  TRANSACTIONS: (companyId: string) => getApiEndpoint(`companies/${companyId}/transactions`),
  FINANCIAL_SUMMARY: (companyId: string) => getApiEndpoint(`companies/${companyId}/financial/summary`),

  // Knowledge Graph
  ENTITIES: getApiEndpoint('knowledge/entities'),
  ENTITY_DETAIL: (id: string) => getApiEndpoint(`knowledge/entities/${id}`),
  RELATIONSHIPS: getApiEndpoint('knowledge/relationships'),
  ENTITY_SEARCH: getApiEndpoint('knowledge/search'),

  // The Nexus
  INTRODUCTIONS: getApiEndpoint('nexus/introductions'),
  FUNDING_APPLICATIONS: getApiEndpoint('nexus/funding/applications'),
  NETWORK_CONNECTIONS: getApiEndpoint('nexus/network/connections'),
  INVESTOR_PROFILES: getApiEndpoint('nexus/investors'),

  // Pulse
  MESSAGES: getApiEndpoint('pulse/messages'),
  CONVERSATIONS: getApiEndpoint('pulse/conversations'),
  MESSAGE_SEND: getApiEndpoint('pulse/send'),

  // Compliance
  COMPLIANCE_TASKS: (companyId: string) => getApiEndpoint(`companies/${companyId}/compliance/tasks`),
  COMPLIANCE_RECORDS: (companyId: string) => getApiEndpoint(`companies/${companyId}/compliance/records`),
  COMPLIANCE_CHECK: (companyId: string) => getApiEndpoint(`companies/${companyId}/compliance/check`),

  // CRM
  CONTACTS: (companyId: string) => getApiEndpoint(`companies/${companyId}/crm/contacts`),
  DEALS: (companyId: string) => getApiEndpoint(`companies/${companyId}/crm/deals`),
  DEAL_DETAIL: (companyId: string, dealId: string) => getApiEndpoint(`companies/${companyId}/crm/deals/${dealId}`),

  // Calendar
  CALENDAR_EVENTS: getApiEndpoint('calendar/events'),
  CALENDAR_AVAILABILITY: getApiEndpoint('calendar/availability'),

  // Billing
  SUBSCRIPTIONS: getApiEndpoint('billing/subscriptions'),
  INVOICES: getApiEndpoint('billing/invoices'),
  PAYMENT_METHODS: getApiEndpoint('billing/payment-methods'),

  // Tasks
  TASKS: (companyId: string) => getApiEndpoint(`companies/${companyId}/tasks`),
  TASK_DETAIL: (companyId: string, taskId: string) => getApiEndpoint(`companies/${companyId}/tasks/${taskId}`),

  // Documents
  DOCUMENTS: (companyId: string) => getApiEndpoint(`companies/${companyId}/documents`),
  DOCUMENT_UPLOAD: (companyId: string) => getApiEndpoint(`companies/${companyId}/documents/upload`),
  DOCUMENT_GENERATE: (companyId: string) => getApiEndpoint(`companies/${companyId}/documents/generate`),

  // External Integrations
  COMPANIES_HOUSE_SEARCH: getApiEndpoint('integrations/companies-house/search'),
  HMRC_FILING: getApiEndpoint('integrations/hmrc/filing'),
  STRIPE_PAYMENT: getApiEndpoint('integrations/stripe/payment'),
} as const

// ============================================================================
// VALIDATION LOGGING
// ============================================================================

if (ENVIRONMENT.isDevelopment) {
  console.log('✅ Configuration loaded successfully:', {
    app: {
      name: config.NEXT_PUBLIC_APP_NAME,
      version: config.NEXT_PUBLIC_APP_VERSION,
      url: config.NEXT_PUBLIC_APP_URL,
    },
    api: {
      url: config.NEXT_PUBLIC_API_URL,
    },
    features: {
      nexus: config.NEXT_PUBLIC_FEATURE_NEXUS_ENABLED,
      pulse: config.NEXT_PUBLIC_FEATURE_PULSE_ENABLED,
      communityRounds: config.NEXT_PUBLIC_FEATURE_COMMUNITY_ROUNDS_ENABLED,
      rbf: config.NEXT_PUBLIC_FEATURE_RBF_ENABLED,
    },

    // Database availability
    databases: {
      postgresql: config.NEXT_PUBLIC_DB_POSTGRESQL_ENABLED,
      neo4j: config.NEXT_PUBLIC_DB_NEO4J_ENABLED,
      redis: config.NEXT_PUBLIC_DB_REDIS_ENABLED,
      elasticsearch: config.NEXT_PUBLIC_DB_ELASTICSEARCH_ENABLED,
      pinecone: config.NEXT_PUBLIC_DB_PINECONE_ENABLED,
    },

    // AI services availability
    ai: {
      openai: config.NEXT_PUBLIC_AI_OPENAI_ENABLED,
      anthropic: config.NEXT_PUBLIC_AI_ANTHROPIC_ENABLED,
      google: config.NEXT_PUBLIC_AI_GOOGLE_ENABLED,
      cohere: config.NEXT_PUBLIC_AI_COHERE_ENABLED,
    },

    // External APIs availability
    externalAPIs: {
      companiesHouse: config.NEXT_PUBLIC_API_COMPANIES_HOUSE_ENABLED,
      hmrc: config.NEXT_PUBLIC_API_HMRC_ENABLED,
      ico: config.NEXT_PUBLIC_API_ICO_ENABLED,
      stripe: config.NEXT_PUBLIC_API_STRIPE_ENABLED,
      gocardless: config.NEXT_PUBLIC_API_GOCARDLESS_ENABLED,
      twilio: config.NEXT_PUBLIC_API_TWILIO_ENABLED,
      sendgrid: config.NEXT_PUBLIC_API_SENDGRID_ENABLED,
      telegram: config.NEXT_PUBLIC_API_TELEGRAM_ENABLED,
      firebase: config.NEXT_PUBLIC_API_FIREBASE_ENABLED,
      googleCalendar: config.NEXT_PUBLIC_API_GOOGLE_CALENDAR_ENABLED,
      calendly: config.NEXT_PUBLIC_API_CALENDLY_ENABLED,
      truelayer: config.NEXT_PUBLIC_API_TRUELAYER_ENABLED,
      plaid: config.NEXT_PUBLIC_API_PLAID_ENABLED,
    },

    // Monitoring & Observability
    monitoring: {
      sentry: config.NEXT_PUBLIC_SENTRY_ENABLED,
      datadog: config.NEXT_PUBLIC_DATADOG_ENABLED,
      logtail: config.NEXT_PUBLIC_LOGTAIL_ENABLED,
      betterUptime: config.NEXT_PUBLIC_BETTER_UPTIME_ENABLED,
    },

    // System Services
    system: {
      queue: config.NEXT_PUBLIC_QUEUE_ENABLED,
      queueRedis: config.NEXT_PUBLIC_QUEUE_REDIS_ENABLED,
      workers: config.NEXT_PUBLIC_WORKERS_ENABLED,
      workerConcurrency: config.NEXT_PUBLIC_WORKER_CONCURRENCY,
      encryption: config.NEXT_PUBLIC_ENCRYPTION_ENABLED,
      session: config.NEXT_PUBLIC_SESSION_ENABLED,
      sessionMaxAge: config.NEXT_PUBLIC_SESSION_MAX_AGE,
    },

    // Development & Debugging
    development: {
      msw: config.NEXT_PUBLIC_ENABLE_MSW,
      debugLogging: config.NEXT_PUBLIC_ENABLE_DEBUG_LOGGING,
      performanceMonitoring: config.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING,
    },
    services: {
      auth: config.NEXT_PUBLIC_AUTH_SERVICE_URL,
      knowledgeGraph: config.NEXT_PUBLIC_KNOWLEDGE_GRAPH_URL,
      financial: config.NEXT_PUBLIC_FINANCIAL_ENGINE_URL,
      nexus: config.NEXT_PUBLIC_NEXUS_URL,
      pulse: config.NEXT_PUBLIC_PULSE_URL,
    },
  })
}

export type Config = typeof config