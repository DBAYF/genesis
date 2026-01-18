import { SecretsManager } from '@aws-sdk/client-secrets-manager'
import { GetSecretValueCommand } from '@aws-sdk/client-secrets-manager'

interface SecretConfig {
  region: string
  secrets: {
    [key: string]: string // Maps environment variable name to secret ARN
  }
}

class SecretsManagerService {
  private client: SecretsManager
  private cache: Map<string, any> = new Map()
  private cacheExpiry: Map<string, number> = new Map()

  constructor(config: SecretConfig) {
    this.client = new SecretsManager({
      region: config.region
    })
    this.config = config
  }

  private config: SecretConfig

  // Get secret value with caching
  async getSecret(secretName: string): Promise<any> {
    const cacheKey = secretName
    const now = Date.now()
    const cacheExpiry = this.cacheExpiry.get(cacheKey)

    // Return cached value if not expired (5 minutes cache)
    if (this.cache.has(cacheKey) && cacheExpiry && now < cacheExpiry) {
      return this.cache.get(cacheKey)
    }

    try {
      const command = new GetSecretValueCommand({
        SecretId: this.config.secrets[secretName],
        VersionStage: 'AWSCURRENT'
      })

      const response = await this.client.send(command)

      let secretValue: any

      if (response.SecretString) {
        secretValue = JSON.parse(response.SecretString)
      } else if (response.SecretBinary) {
        secretValue = response.SecretBinary
      }

      // Cache the value
      this.cache.set(cacheKey, secretValue)
      this.cacheExpiry.set(cacheKey, now + 5 * 60 * 1000) // 5 minutes

      return secretValue
    } catch (error) {
      console.error(`Failed to retrieve secret ${secretName}:`, error)
      throw error
    }
  }

  // Get all secrets for environment variables
  async loadSecrets(): Promise<Record<string, string>> {
    const secrets: Record<string, string> = {}

    for (const [envVar, secretArn] of Object.entries(this.config.secrets)) {
      try {
        const secretValue = await this.getSecret(envVar)

        // Handle different secret formats
        if (typeof secretValue === 'string') {
          secrets[envVar] = secretValue
        } else if (typeof secretValue === 'object' && secretValue.value) {
          secrets[envVar] = secretValue.value
        } else if (typeof secretValue === 'object' && secretValue.password) {
          secrets[envVar] = secretValue.password
        } else {
          // Convert object to JSON string for complex secrets
          secrets[envVar] = JSON.stringify(secretValue)
        }
      } catch (error) {
        console.warn(`Failed to load secret for ${envVar}, using environment variable if available`)
        // Don't fail if secret is not available, use environment variable instead
      }
    }

    return secrets
  }

  // Refresh cache for specific secret
  async refreshSecret(secretName: string): Promise<void> {
    this.cache.delete(secretName)
    this.cacheExpiry.delete(secretName)
  }

  // Refresh all cached secrets
  async refreshAll(): Promise<void> {
    this.cache.clear()
    this.cacheExpiry.clear()
  }

  // Get secret metadata
  async getSecretMetadata(secretName: string): Promise<any> {
    try {
      const command = new GetSecretValueCommand({
        SecretId: this.config.secrets[secretName],
        IncludePlannedDeletion: true
      })

      const response = await this.client.send(command)
      return {
        arn: response.ARN,
        name: response.Name,
        version: response.VersionId,
        createdDate: response.CreatedDate,
        lastChangedDate: response.LastChangedDate
      }
    } catch (error) {
      console.error(`Failed to get metadata for secret ${secretName}:`, error)
      return null
    }
  }
}

// Production secrets configuration
const productionSecrets: SecretConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  secrets: {
    // Database
    DB_PASSWORD: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:genesis/db-password-AbCdEf',
    DB_HOST: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:genesis/db-host-AbCdEf',
    DB_PORT: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:genesis/db-port-AbCdEf',

    // Neo4j
    NEO4J_USER: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:genesis/neo4j-user-AbCdEf',
    NEO4J_PASSWORD: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:genesis/neo4j-password-AbCdEf',
    NEO4J_HOST: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:genesis/neo4j-host-AbCdEf',
    NEO4J_PORT: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:genesis/neo4j-port-AbCdEf',

    // Redis
    REDIS_PASSWORD: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:genesis/redis-password-AbCdEf',
    REDIS_HOST: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:genesis/redis-host-AbCdEf',
    REDIS_PORT: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:genesis/redis-port-AbCdEf',

    // JWT
    JWT_SECRET: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:genesis/jwt-secret-AbCdEf',
    JWT_REFRESH_SECRET: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:genesis/jwt-refresh-secret-AbCdEf',

    // AI Services
    OPENAI_API_KEY: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:genesis/openai-key-AbCdEf',
    ANTHROPIC_API_KEY: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:genesis/anthropic-key-AbCdEf',
    GOOGLE_AI_API_KEY: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:genesis/google-ai-key-AbCdEf',
    COHERE_API_KEY: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:genesis/cohere-key-AbCdEf',

    // Payment
    STRIPE_SECRET_KEY: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:genesis/stripe-secret-AbCdEf',
    STRIPE_WEBHOOK_SECRET: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:genesis/stripe-webhook-AbCdEf',
    STRIPE_PUBLISHABLE_KEY: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:genesis/stripe-publishable-AbCdEf',

    // Email
    SMTP_HOST: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:genesis/smtp-host-AbCdEf',
    SMTP_USER: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:genesis/smtp-user-AbCdEf',
    SMTP_PASS: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:genesis/smtp-pass-AbCdEf',

    // External APIs
    HMRC_API_KEY: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:genesis/hmrc-key-AbCdEf',
    COMPANIES_HOUSE_API_KEY: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:genesis/companies-house-key-AbCdEf',

    // Monitoring
    SENTRY_DSN: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:genesis/sentry-dsn-AbCdEf',

    // CDN & Assets
    CDN_URL: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:genesis/cdn-url-AbCdEf',
    STATIC_ASSETS_URL: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:genesis/static-assets-url-AbCdEf',

    // Backup
    BACKUP_S3_BUCKET: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:genesis/backup-bucket-AbCdEf',

    // CORS
    CORS_ORIGIN: 'arn:aws:secretsmanager:us-east-1:123456789012:secret:genesis/cors-origin-AbCdEf'
  }
}

// Create and export the secrets manager instance
export const secretsManager = new SecretsManagerService(productionSecrets)

// Helper function to load secrets into environment variables
export async function loadSecretsIntoEnv(): Promise<void> {
  try {
    const secrets = await secretsManager.loadSecrets()

    // Load secrets into process.env
    Object.entries(secrets).forEach(([key, value]) => {
      process.env[key] = value
    })

    console.log(`✅ Loaded ${Object.keys(secrets).length} secrets from AWS Secrets Manager`)
  } catch (error) {
    console.warn('⚠️ Failed to load secrets from AWS Secrets Manager, falling back to environment variables')
    console.warn('Error:', error.message)
  }
}

// Export for testing
export { SecretsManagerService, productionSecrets }