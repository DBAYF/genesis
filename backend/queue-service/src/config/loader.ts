import { z } from 'zod'
import dotenv from 'dotenv'

dotenv.config()

const configSchema = z.object({
  PORT: z.string().default('3014'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Redis Configuration
  REDIS_URL: z.string().default('redis://localhost:6379'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().transform(Number).default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.string().transform(Number).default(0),

  // Queue Configuration
  QUEUE_NAME: z.string().default('genesis-jobs'),
  MAX_CONCURRENT_JOBS: z.string().transform(Number).default(10),
  MAX_JOB_ATTEMPTS: z.string().transform(Number).default(3),
  JOB_REMOVE_ON_COMPLETE: z.string().transform(Number).default(100),
  JOB_REMOVE_ON_FAIL: z.string().transform(Number).default(50),

  // Email Configuration
  SMTP_HOST: z.string(),
  SMTP_PORT: z.string().transform(Number),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  EMAIL_FROM: z.string(),

  // SMS Configuration (Optional)
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),

  // Database
  DATABASE_URL: z.string().default('postgresql://genesis_user:genesis_password@localhost:5432/genesis_db'),

  // Service URLs
  AUTH_SERVICE_URL: z.string().default('http://localhost:3002'),
  USER_SERVICE_URL: z.string().default('http://localhost:3004'),
  COMPANY_SERVICE_URL: z.string().default('http://localhost:3005'),
  FINANCIAL_SERVICE_URL: z.string().default('http://localhost:3006'),
  COMPLIANCE_SERVICE_URL: z.string().default('http://localhost:3007'),
  CRM_SERVICE_URL: z.string().default('http://localhost:3008'),
  CALENDAR_SERVICE_URL: z.string().default('http://localhost:3009'),
  BILLING_SERVICE_URL: z.string().default('http://localhost:3010'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // Monitoring
  SENTRY_DSN: z.string().optional(),
  ENABLE_METRICS: z.string().transform(val => val === 'true').default(true),

  // Job Processing
  JOB_TIMEOUT: z.string().transform(Number).default(300000), // 5 minutes
  HEALTH_CHECK_INTERVAL: z.string().transform(Number).default(30000), // 30 seconds

  // Scheduled Jobs
  ENABLE_SCHEDULED_JOBS: z.string().transform(val => val === 'true').default(true),
  CLEANUP_INTERVAL: z.string().default('0 2 * * *'), // Daily at 2 AM
  REMINDER_INTERVAL: z.string().default('0 */6 * * *'), // Every 6 hours
  BACKUP_INTERVAL: z.string().default('0 3 * * 0'), // Weekly on Sunday at 3 AM
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