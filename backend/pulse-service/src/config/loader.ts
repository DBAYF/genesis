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
  PORT: z.string().transform(Number).default('3005'),
  HOST: z.string().default('0.0.0.0'),

  // Database
  DATABASE_URL: z.string().url(),

  // JWT Configuration
  JWT_SECRET: z.string(),

  // External APIs
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_PHONE_NUMBER: z.string().optional(),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  SENDGRID_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().default('noreply@genesis-engine.com'),

  // AI Service
  AI_SERVICE_URL: z.string().url().default('http://localhost:3002'),

  // Knowledge Graph Service
  KNOWLEDGE_GRAPH_URL: z.string().url().default('http://localhost:3002'),

  // Redis for queues and caching
  REDIS_URL: z.string().url().default('redis://localhost:6379'),

  // Rate Limiting
  RATE_LIMIT_MAX: z.string().transform(Number).default('100'),
  RATE_LIMIT_TIME_WINDOW: z.string().transform(Number).default('900000'), // 15 minutes

  // Message Processing
  MAX_MESSAGE_LENGTH: z.string().transform(Number).default('4096'),
  MESSAGE_RETENTION_DAYS: z.string().transform(Number).default('365'),

  // AI Configuration
  AI_INTENT_CONFIDENCE_THRESHOLD: z.string().transform(Number).default('0.7'),
  AI_RESPONSE_MAX_TOKENS: z.string().transform(Number).default('500'),

  // Webhook Security
  WEBHOOK_SECRET: z.string().default('your-webhook-secret'),

  // CORS
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
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