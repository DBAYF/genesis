import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import rateLimit from '@fastify/rate-limit'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { loadConfig } from './config/loader'
import { errorHandler } from './middleware/error-handler'
import { requestLogger } from './middleware/request-logger'
import { userRoutes } from './routes/user.routes'

async function buildApp() {
  const config = loadConfig()

  const app = Fastify({
    logger: {
      level: config.LOG_LEVEL,
      transport: {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname'
        }
      }
    }
  })

  // Register plugins
  await app.register(helmet)
  await app.register(cors, {
    origin: config.CORS_ORIGIN,
    credentials: true
  })
  await app.register(rateLimit, {
    max: config.RATE_LIMIT_MAX,
    timeWindow: config.RATE_LIMIT_WINDOW_MS
  })

  // Swagger documentation
  await app.register(swagger, {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'User Service API',
        description: 'User management and profile services for Genesis Engine',
        version: '1.0.0'
      },
      servers: [
        {
          url: `http://localhost:${config.PORT}`,
          description: 'Development server'
        }
      ]
    }
  })

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false
    }
  })

  // Register middleware
  await requestLogger(app)

  // Register routes
  await app.register(userRoutes, { prefix: '/api/v1' })

  // Health check
  app.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'user-service'
    }
  })

  // Error handler
  app.setErrorHandler(errorHandler)

  return app
}

// Start server
async function start() {
  try {
    const app = await buildApp()
    const config = loadConfig()

    await app.listen({
      port: parseInt(config.PORT),
      host: '0.0.0.0'
    })

    console.log(`🚀 User Service running on port ${config.PORT}`)
    console.log(`📚 API docs available at http://localhost:${config.PORT}/docs`)
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...')
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...')
  process.exit(0)
})

// Run the server
if (require.main === module) {
  start()
}

export { buildApp }