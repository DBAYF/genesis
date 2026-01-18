import { z } from 'zod'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// ============================================================================
// CONFIGURATION SCHEMA
// ============================================================================

const configSchema = z.object({
  // Server Configuration
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  HOST: z.string().default('0.0.0.0'),

  // Database URLs
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),

  // Service URLs
  AUTH_SERVICE_URL: z.string().url().default('http://localhost:3001'),
  USER_SERVICE_URL: z.string().url().default('http://localhost:3004'),
  COMPANY_SERVICE_URL: z.string().url().default('http://localhost:3012'),
  KNOWLEDGE_GRAPH_URL: z.string().url().default('http://localhost:3002'),
  FINANCIAL_ENGINE_URL: z.string().url().default('http://localhost:3007'),
  DOCUMENT_ENGINE_URL: z.string().url().default('http://localhost:3006'),
  NEXUS_URL: z.string().url().default('http://localhost:3003'),
  PULSE_URL: z.string().url().default('http://localhost:3005'),
  COMPLIANCE_URL: z.string().url().default('http://localhost:3008'),
  CRM_URL: z.string().url().default('http://localhost:3009'),
  CALENDAR_URL: z.string().url().default('http://localhost:3010'),
  BILLING_URL: z.string().url().default('http://localhost:3011'),

  // JWT Configuration
  JWT_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Rate Limiting
  RATE_LIMIT_MAX: z.string().transform(Number).default('100'),
  RATE_LIMIT_TIME_WINDOW: z.string().transform(Number).default('900000'), // 15 minutes

  // CORS
  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  // External APIs
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_AI_API_KEY: z.string().optional(),
  COHERE_API_KEY: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  COMPANIES_HOUSE_API_KEY: z.string().optional(),
  HMRC_CLIENT_ID: z.string().optional(),
  HMRC_CLIENT_SECRET: z.string().optional(),

  // Monitoring
  SENTRY_DSN: z.string().optional(),
  DATADOG_API_KEY: z.string().optional(),
  LOGTAIL_TOKEN: z.string().optional(),

  // Feature Flags
  FEATURE_ADVANCED_AI: z.string().transform(val => val === 'true').default('false'),
  FEATURE_PULSE_MESSAGING: z.string().transform(val => val === 'true').default('false'),
  FEATURE_NEXUS_NETWORKING: z.string().transform(val => val === 'true').default('false'),
  FEATURE_COMPLIANCE_AUTOMATION: z.string().transform(val => val === 'true').default('false'),
  FEATURE_DOCUMENT_GENERATION: z.string().transform(val => val === 'true').default('false'),
})

// ============================================================================
// CONFIG LOADER
// ============================================================================

export type Config = z.infer<typeof configSchema>

let config: Config | null = null

export function loadConfig(): Config {
  if (config) {
    return config
  }

  try {
    config = configSchema.parse(process.env)
    return config
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err =>
        `${err.path.join('.')}: ${err.message}`
      ).join('\n')

      throw new Error(`Configuration validation failed:\n${errorMessages}`)
    }

    throw error
  }
}

export function getServiceUrl(serviceName: string): string {
  const config = loadConfig()

  const serviceUrlMap: Record<string, string> = {
    auth: config.AUTH_SERVICE_URL,
    user: config.USER_SERVICE_URL,
    company: config.COMPANY_SERVICE_URL,
    knowledgeGraph: config.KNOWLEDGE_GRAPH_URL,
    financial: config.FINANCIAL_ENGINE_URL,
    document: config.DOCUMENT_ENGINE_URL,
    nexus: config.NEXUS_URL,
    pulse: config.PULSE_URL,
    compliance: config.COMPLIANCE_URL,
    crm: config.CRM_URL,
    calendar: config.CALENDAR_URL,
    billing: config.BILLING_URL,
  }

  return serviceUrlMap[serviceName] || config.AUTH_SERVICE_URL
}