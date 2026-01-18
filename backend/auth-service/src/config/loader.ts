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
  PORT: z.string().transform(Number).default('3001'),
  HOST: z.string().default('0.0.0.0'),

  // Database
  DATABASE_URL: z.string().url(),

  // JWT Configuration
  JWT_SECRET: z.string(),
  JWT_REFRESH_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Email Configuration
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.string().transform(Number).default('587'),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  FROM_EMAIL: z.string().default('noreply@genesis-engine.com'),

  // Redis for sessions/tokens
  REDIS_URL: z.string().url().default('redis://localhost:6379'),

  // Password Policy
  PASSWORD_MIN_LENGTH: z.string().transform(Number).default('8'),
  PASSWORD_REQUIRE_UPPERCASE: z.string().transform(val => val === 'true').default('true'),
  PASSWORD_REQUIRE_LOWERCASE: z.string().transform(val => val === 'true').default('true'),
  PASSWORD_REQUIRE_NUMBERS: z.string().transform(val => val === 'true').default('true'),
  PASSWORD_REQUIRE_SYMBOLS: z.string().transform(val => val === 'true').default('false'),

  // Rate Limiting
  RATE_LIMIT_MAX: z.string().transform(Number).default('10'),
  RATE_LIMIT_TIME_WINDOW: z.string().transform(Number).default('900000'), // 15 minutes

  // CORS
  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  // Frontend URL for email links
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
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