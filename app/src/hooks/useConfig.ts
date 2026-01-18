'use client'

import { useMemo } from 'react'
import { config, isFeatureEnabled, getApiEndpoint, getServiceEndpoint, API_ENDPOINTS } from '@/config'

// ============================================================================
// CONFIGURATION HOOK
// ============================================================================

export function useConfig() {
  return useMemo(() => ({
    // Core config
    app: {
      name: config.NEXT_PUBLIC_APP_NAME,
      version: config.NEXT_PUBLIC_APP_VERSION,
      url: config.NEXT_PUBLIC_APP_URL,
    },
    api: {
      url: config.NEXT_PUBLIC_API_URL,
    },

    // Feature flags
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

    // Service URLs
    services: {
      auth: config.NEXT_PUBLIC_AUTH_SERVICE_URL,
      user: config.NEXT_PUBLIC_USER_SERVICE_URL,
      company: config.NEXT_PUBLIC_COMPANY_SERVICE_URL,
      knowledgeGraph: config.NEXT_PUBLIC_KNOWLEDGE_GRAPH_URL,
      financial: config.NEXT_PUBLIC_FINANCIAL_ENGINE_URL,
      documents: config.NEXT_PUBLIC_DOCUMENT_ENGINE_URL,
      nexus: config.NEXT_PUBLIC_NEXUS_URL,
      pulse: config.NEXT_PUBLIC_PULSE_URL,
      compliance: config.NEXT_PUBLIC_COMPLIANCE_URL,
      crm: config.NEXT_PUBLIC_CRM_URL,
      calendar: config.NEXT_PUBLIC_CALENDAR_URL,
      billing: config.NEXT_PUBLIC_BILLING_URL,
    },

    // UI settings
    ui: {
      timezone: config.NEXT_PUBLIC_DEFAULT_TIMEZONE,
      locale: config.NEXT_PUBLIC_DEFAULT_LOCALE,
      currency: config.NEXT_PUBLIC_DEFAULT_CURRENCY,
      supportedCountries: config.NEXT_PUBLIC_SUPPORTED_COUNTRIES.split(','),
    },

    // External integrations
    integrations: {
      stripe: {
        publishableKey: config.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      },
      googleMaps: {
        apiKey: config.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
      sentry: {
        dsn: config.NEXT_PUBLIC_SENTRY_DSN,
      },
    },

    // Utility functions
    isFeatureEnabled,
    getApiEndpoint,
    getServiceEndpoint,

    // Pre-built endpoints
    endpoints: API_ENDPOINTS,
  }), [])
}

// ============================================================================
// FEATURE FLAG HOOKS
// ============================================================================

export function useFeatureFlag(feature: string): boolean {
  return isFeatureEnabled(feature)
}

export function useNexusEnabled(): boolean {
  return config.NEXT_PUBLIC_FEATURE_NEXUS_ENABLED
}

export function usePulseEnabled(): boolean {
  return config.NEXT_PUBLIC_FEATURE_PULSE_ENABLED
}

export function useCommunityRoundsEnabled(): boolean {
  return config.NEXT_PUBLIC_FEATURE_COMMUNITY_ROUNDS_ENABLED
}

export function useRBFEnabled(): boolean {
  return config.NEXT_PUBLIC_FEATURE_RBF_ENABLED
}

// ============================================================================
// DATABASE AVAILABILITY HOOKS
// ============================================================================

export function useDatabaseEnabled(database: string): boolean {
  const databases = {
    'postgresql': config.NEXT_PUBLIC_DB_POSTGRESQL_ENABLED,
    'neo4j': config.NEXT_PUBLIC_DB_NEO4J_ENABLED,
    'redis': config.NEXT_PUBLIC_DB_REDIS_ENABLED,
    'elasticsearch': config.NEXT_PUBLIC_DB_ELASTICSEARCH_ENABLED,
    'pinecone': config.NEXT_PUBLIC_DB_PINECONE_ENABLED,
  }

  return databases[database as keyof typeof databases] || false
}

export function usePostgreSQLEnabled(): boolean {
  return config.NEXT_PUBLIC_DB_POSTGRESQL_ENABLED
}

export function useNeo4jEnabled(): boolean {
  return config.NEXT_PUBLIC_DB_NEO4J_ENABLED
}

export function useRedisEnabled(): boolean {
  return config.NEXT_PUBLIC_DB_REDIS_ENABLED
}

export function useElasticsearchEnabled(): boolean {
  return config.NEXT_PUBLIC_DB_ELASTICSEARCH_ENABLED
}

export function usePineconeEnabled(): boolean {
  return config.NEXT_PUBLIC_DB_PINECONE_ENABLED
}

// ============================================================================
// AI SERVICE AVAILABILITY HOOKS
// ============================================================================

export function useAIServiceEnabled(service: string): boolean {
  const services = {
    'openai': config.NEXT_PUBLIC_AI_OPENAI_ENABLED,
    'anthropic': config.NEXT_PUBLIC_AI_ANTHROPIC_ENABLED,
    'google': config.NEXT_PUBLIC_AI_GOOGLE_ENABLED,
    'cohere': config.NEXT_PUBLIC_AI_COHERE_ENABLED,
  }

  return services[service as keyof typeof services] || false
}

export function useOpenAIEnabled(): boolean {
  return config.NEXT_PUBLIC_AI_OPENAI_ENABLED
}

export function useAnthropicEnabled(): boolean {
  return config.NEXT_PUBLIC_AI_ANTHROPIC_ENABLED
}

export function useGoogleAIEnabled(): boolean {
  return config.NEXT_PUBLIC_AI_GOOGLE_ENABLED
}

export function useCohereEnabled(): boolean {
  return config.NEXT_PUBLIC_AI_COHERE_ENABLED
}

// ============================================================================
// EXTERNAL API AVAILABILITY HOOKS
// ============================================================================

export function useExternalAPIEnabled(api: string): boolean {
  const apis = {
    'companies-house': config.NEXT_PUBLIC_API_COMPANIES_HOUSE_ENABLED,
    'hmrc': config.NEXT_PUBLIC_API_HMRC_ENABLED,
    'ico': config.NEXT_PUBLIC_API_ICO_ENABLED,
    'stripe': config.NEXT_PUBLIC_API_STRIPE_ENABLED,
    'twilio': config.NEXT_PUBLIC_API_TWILIO_ENABLED,
    'sendgrid': config.NEXT_PUBLIC_API_SENDGRID_ENABLED,
  }

  return apis[api as keyof typeof apis] || false
}

export function useCompaniesHouseEnabled(): boolean {
  return config.NEXT_PUBLIC_API_COMPANIES_HOUSE_ENABLED
}

export function useHMRCEnabled(): boolean {
  return config.NEXT_PUBLIC_API_HMRC_ENABLED
}

export function useICOEnabled(): boolean {
  return config.NEXT_PUBLIC_API_ICO_ENABLED
}

export function useStripeEnabled(): boolean {
  return config.NEXT_PUBLIC_API_STRIPE_ENABLED
}

export function useTwilioEnabled(): boolean {
  return config.NEXT_PUBLIC_API_TWILIO_ENABLED
}

export function useSendGridEnabled(): boolean {
  return config.NEXT_PUBLIC_API_SENDGRID_ENABLED
}

export function useGoCardlessEnabled(): boolean {
  return config.NEXT_PUBLIC_API_GOCARDLESS_ENABLED
}

export function useTelegramEnabled(): boolean {
  return config.NEXT_PUBLIC_API_TELEGRAM_ENABLED
}

export function useFirebaseEnabled(): boolean {
  return config.NEXT_PUBLIC_API_FIREBASE_ENABLED
}

export function useGoogleCalendarEnabled(): boolean {
  return config.NEXT_PUBLIC_API_GOOGLE_CALENDAR_ENABLED
}

export function useCalendlyEnabled(): boolean {
  return config.NEXT_PUBLIC_API_CALENDLY_ENABLED
}

export function useTrueLayerEnabled(): boolean {
  return config.NEXT_PUBLIC_API_TRUELAYER_ENABLED
}

export function usePlaidEnabled(): boolean {
  return config.NEXT_PUBLIC_API_PLAID_ENABLED
}

// ============================================================================
// MONITORING & OBSERVABILITY HOOKS
// ============================================================================

export function useSentryEnabled(): boolean {
  return config.NEXT_PUBLIC_SENTRY_ENABLED
}

export function useDatadogEnabled(): boolean {
  return config.NEXT_PUBLIC_DATADOG_ENABLED
}

export function useLogtailEnabled(): boolean {
  return config.NEXT_PUBLIC_LOGTAIL_ENABLED
}

export function useBetterUptimeEnabled(): boolean {
  return config.NEXT_PUBLIC_BETTER_UPTIME_ENABLED
}

// ============================================================================
// SYSTEM SERVICES HOOKS
// ============================================================================

export function useQueueEnabled(): boolean {
  return config.NEXT_PUBLIC_QUEUE_ENABLED
}

export function useQueueRedisEnabled(): boolean {
  return config.NEXT_PUBLIC_QUEUE_REDIS_ENABLED
}

export function useWorkersEnabled(): boolean {
  return config.NEXT_PUBLIC_WORKERS_ENABLED
}

export function useEncryptionEnabled(): boolean {
  return config.NEXT_PUBLIC_ENCRYPTION_ENABLED
}

export function useSessionEnabled(): boolean {
  return config.NEXT_PUBLIC_SESSION_ENABLED
}

// ============================================================================
// DEVELOPMENT HOOKS
// ============================================================================

export function useMSWEnabled(): boolean {
  return config.NEXT_PUBLIC_ENABLE_MSW
}

export function useDebugLoggingEnabled(): boolean {
  return config.NEXT_PUBLIC_ENABLE_DEBUG_LOGGING
}

export function usePerformanceMonitoringEnabled(): boolean {
  return config.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITORING
}

// ============================================================================
// API ENDPOINT HOOKS
// ============================================================================

export function useApiEndpoints() {
  return useMemo(() => API_ENDPOINTS, [])
}

export function useServiceUrl(service: string): string {
  const serviceUrlKey = `NEXT_PUBLIC_${service.toUpperCase()}_URL` as keyof typeof config
  const serviceUrl = config[serviceUrlKey]
  return typeof serviceUrl === 'string' ? serviceUrl : config.NEXT_PUBLIC_API_URL
}

// ============================================================================
// VALIDATION HOOK
// ============================================================================

export function useConfigValidation() {
  return useMemo(() => {
    const errors: string[] = []
    const warnings: string[] = []

    // Check required configurations
    if (!config.NEXT_PUBLIC_API_URL) {
      errors.push('NEXT_PUBLIC_API_URL is required')
    }

    // Check service URLs
    const requiredServices = [
      'NEXT_PUBLIC_AUTH_SERVICE_URL',
      'NEXT_PUBLIC_USER_SERVICE_URL',
      'NEXT_PUBLIC_COMPANY_SERVICE_URL',
    ]

    requiredServices.forEach(service => {
      if (!config[service as keyof typeof config]) {
        warnings.push(`${service} not configured, using default API URL`)
      }
    })

    // Check external integrations
    if (config.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
        !config.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.startsWith('pk_')) {
      warnings.push('Stripe publishable key format may be invalid')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      hasWarnings: warnings.length > 0,
    }
  }, [])
}