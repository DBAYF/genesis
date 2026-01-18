import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { loadConfig } from './config/loader'
import { authRoutes } from './routes/auth.routes'
import { companyRoutes } from './routes/company.routes'
import { financialRoutes } from './routes/financial.routes'
import { complianceRoutes } from './routes/compliance.routes'
import { crmRoutes } from './routes/crm.routes'
import { calendarRoutes } from './routes/calendar.routes'
import { billingRoutes } from './routes/billing.routes'
import { nexusRoutes } from './routes/nexus.routes'
import { pulseWebhookRoutes } from './routes/pulse-webhooks.routes'
import { monitoringRoutes } from './routes/monitoring.routes'
import { errorHandler } from './middleware/error-handler'
import { requestLogger } from './middleware/request-logger'
import { metricsMiddleware } from './middleware/metrics'
import { cacheMiddleware } from './middleware/cache'
import { initSentry, captureException } from './utils/sentry'

// ============================================================================
// MAIN APPLICATION
// ============================================================================

export async function buildApp() {
  const config = loadConfig()

  // Initialize Sentry (if DSN is provided)
  if (config.SENTRY_DSN) {
    initSentry(config.SENTRY_DSN, config.NODE_ENV)
  }

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
  })

  // ============================================================================
  // SECURITY MIDDLEWARE
  // ============================================================================

  // Helmet for security headers
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  })

  // Rate limiting
  await app.register(rateLimit, {
    max: config.RATE_LIMIT_MAX,
    timeWindow: config.RATE_LIMIT_WINDOW_MS,
    errorResponseBuilder: (request, context) => ({
      code: 429,
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again in ${context.after} seconds.`,
      date: Date.now(),
      expiresIn: context.after,
    }),
  })

  // CORS
  await app.register(cors, {
    origin: config.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
    credentials: true,
  })

  // ============================================================================
  // API DOCUMENTATION
  // ============================================================================

  await app.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Genesis Engine API',
        description: 'Comprehensive API for startup journey automation',
        version: '1.0.0',
        contact: {
          name: 'Genesis Engine Support',
          email: 'support@genesis-engine.com',
        },
      },
      servers: [
        {
          url: `http://localhost:${config.PORT}`,
          description: 'Development server',
        },
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
      security: [
        {
          bearerAuth: [],
        },
      ],
    },
  })

  await app.register(swaggerUi, {
    routePrefix: '/documentation',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  })

  // ============================================================================
  // MIDDLEWARE
  // ============================================================================

  // Request logging
  app.addHook('onRequest', requestLogger)

  // Metrics collection
  await metricsMiddleware(app)

  // Caching middleware
  await cacheMiddleware(app)

  // ============================================================================
  // HEALTH CHECK
  // ============================================================================

  app.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.NODE_ENV,
      version: '1.0.0',
    }
  })

  app.get('/', async () => {
    return {
      message: 'Welcome to Genesis Engine API Gateway',
      documentation: '/documentation',
      health: '/health',
      version: '1.0.0',
    }
  })

  // ============================================================================
  // ROUTES
  // ============================================================================

  // Authentication routes
  app.register(authRoutes, { prefix: '/api/auth' })

  // Company routes
  app.register(companyRoutes, { prefix: '/api/companies' })

  // Financial routes
  app.register(financialRoutes, { prefix: '/api/financial' })

  // Compliance routes
  app.register(complianceRoutes, { prefix: '/api/compliance' })

  // CRM routes
  app.register(crmRoutes, { prefix: '/api/crm' })

  // Calendar routes
  app.register(calendarRoutes, { prefix: '/api/calendar' })

  // Billing routes
  app.register(billingRoutes, { prefix: '/api/billing' })

  // Nexus routes
  app.register(nexusRoutes, { prefix: '/api/nexus' })

  // Pulse webhook routes
  app.register(pulseWebhookRoutes, { prefix: '/api/pulse' })

  // Monitoring routes
  app.register(monitoringRoutes, { prefix: '/api/monitoring' })

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  app.setErrorHandler(errorHandler)

  // ============================================================================
  // GRACEFUL SHUTDOWN
  // ============================================================================

  const signals = ['SIGINT', 'SIGTERM']
  signals.forEach(signal => {
    process.on(signal, async () => {
      console.log(`Received ${signal}, shutting down gracefully...`)

      await app.close()

      process.exit(0)
    })
  })

  return app
}

// ============================================================================
// START SERVER
// ============================================================================

async function start() {
  try {
    const config = loadConfig()
    const app = await buildApp()

    await app.listen({
      port: config.PORT,
      host: config.HOST,
    })

    console.log(`🚀 Genesis API Gateway listening on port ${config.PORT}`)
    console.log(`📚 API Documentation: http://localhost:${config.PORT}/documentation`)
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  start()
}