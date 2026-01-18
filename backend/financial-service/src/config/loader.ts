import { z } from 'zod'
import dotenv from 'dotenv'

dotenv.config()

const configSchema = z.object({
  // Server
  PORT: z.string().default('3006'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database
  DATABASE_URL: z.string(),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // JWT
  JWT_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Email
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string().transform(Number),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  EMAIL_FROM: z.string(),

  // External Services
  AUTH_SERVICE_URL: z.string().default('http://localhost:3001'),
  USER_SERVICE_URL: z.string().default('http://localhost:3004'),
  COMPANY_SERVICE_URL: z.string().default('http://localhost:3005'),
  COMPLIANCE_SERVICE_URL: z.string().default('http://localhost:3007'),
  CRM_SERVICE_URL: z.string().default('http://localhost:3008'),
  CALENDAR_SERVICE_URL: z.string().default('http://localhost:3009'),
  BILLING_SERVICE_URL: z.string().default('http://localhost:3010'),
  NEXUS_SERVICE_URL: z.string().default('http://localhost:3011'),
  PULSE_SERVICE_URL: z.string().default('http://localhost:3012'),
  KNOWLEDGE_GRAPH_SERVICE_URL: z.string().default('http://localhost:3013'),

  // Security
  CORS_ORIGIN: z.string().default('*'),
  RATE_LIMIT_MAX: z.string().transform(Number).default(100),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default(900000),

  // File Upload
  MAX_FILE_SIZE: z.string().transform(Number).default(10485760), // 10MB
  UPLOAD_DIR: z.string().default('./uploads'),

  // Financial APIs
  XERO_CLIENT_ID: z.string().optional(),
  XERO_CLIENT_SECRET: z.string().optional(),
  QUICKBOOKS_CLIENT_ID: z.string().optional(),
  QUICKBOOKS_CLIENT_SECRET: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),

  // Monitoring
  SENTRY_DSN: z.string().optional(),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info')
})

export type Config = z.infer<typeof configSchema>

export function loadConfig(): Config {
  const parsed = configSchema.safeParse(process.env)

  if (!parsed.success) {
    console.error('Configuration validation failed:', parsed.error.errors)
    throw new Error('Invalid configuration')
  }

  return parsed.data
}