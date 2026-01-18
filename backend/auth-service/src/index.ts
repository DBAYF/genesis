import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import jwt from '@fastify/jwt'
import { loadConfig } from './config/loader'
import { authRoutes } from './routes/auth.routes'
import { errorHandler } from './middleware/error-handler'
import { requestLogger } from './middleware/request-logger'
import { prisma } from './utils/prisma'
import { RedisService } from './services/redis.service'

// ============================================================================
// MAIN APPLICATION
// ============================================================================

export async function buildApp() {
  const config = loadConfig()
  const redisService = new RedisService()

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
  // DATABASE CONNECTION
  // ============================================================================

  await prisma.$connect()
  app.log.info('Connected to database')

  // ============================================================================
  // REDIS CONNECTION
  // ============================================================================

  await redisService.connect()
  app.log.info('Connected to Redis')

  // Store services in app instance
  app.decorate('prisma', prisma)
  app.decorate('redis', redisService)

  // ============================================================================
  // SECURITY MIDDLEWARE
  // ============================================================================

  // Helmet for security headers
  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
      },
    },
  })

  // Rate limiting
  await app.register(rateLimit, {
    max: config.RATE_LIMIT_MAX,
    timeWindow: config.RATE_LIMIT_TIME_WINDOW,
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
    origin: config.CORS_ORIGINS.split(','),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-request-id'],
    credentials: true,
  })

  // JWT
  await app.register(jwt, {
    secret: config.JWT_SECRET,
  })

  // ============================================================================
  // MIDDLEWARE
  // ============================================================================

  // Request logging
  app.addHook('onRequest', requestLogger)

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
      services: {
        database: 'connected',
        redis: 'connected',
      },
    }
  })

  app.get('/', async () => {
    return {
      message: 'Genesis Auth Service',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        login: '/api/auth/login',
        register: '/api/auth/register',
        logout: '/api/auth/logout',
        refresh: '/api/auth/refresh',
        'forgot-password': '/api/auth/forgot-password',
        'reset-password': '/api/auth/reset-password',
        'verify-email': '/api/auth/verify-email',
      },
    }
  })

  // ============================================================================
  // ROUTES
  // ============================================================================

  // Auth routes
  app.register(authRoutes, { prefix: '/api/auth' })

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

      await redisService.disconnect()
      await prisma.$disconnect()

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

    console.log(`🚀 Genesis Auth Service listening on port ${config.PORT}`)
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  start()
}