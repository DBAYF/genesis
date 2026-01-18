import { FastifyInstance } from 'fastify'
import { healthCheckAllServices, getServiceRegistry, getCircuitBreakers } from '../utils/service-router'

// ============================================================================
// MONITORING & HEALTH CHECK ROUTES
// ============================================================================

export async function monitoringRoutes(app: FastifyInstance) {
  // ============================================================================
  // HEALTH CHECKS
  // ============================================================================

  // Overall gateway health
  app.get('/health', async (request, reply) => {
    const serviceHealth = await healthCheckAllServices()
    const circuitBreakers = getCircuitBreakers()

    const allHealthy = Object.values(serviceHealth).every(healthy => healthy)
    const unhealthyServices = Object.entries(serviceHealth)
      .filter(([, healthy]) => !healthy)
      .map(([service]) => service)

    const status = allHealthy ? 'healthy' : 'degraded'

    return reply.status(allHealthy ? 200 : 503).send({
      status,
      timestamp: new Date().toISOString(),
      service: 'api-gateway',
      version: '1.0.0',
      uptime: process.uptime(),
      services: serviceHealth,
      unhealthyServices: unhealthyServices.length > 0 ? unhealthyServices : undefined,
      circuitBreakers: Object.keys(circuitBreakers).length > 0 ? circuitBreakers : undefined,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        memory: process.memoryUsage(),
      }
    })
  })

  // Detailed service health
  app.get('/health/services', async (request, reply) => {
    const serviceHealth = await healthCheckAllServices()
    const serviceRegistry = getServiceRegistry()
    const circuitBreakers = getCircuitBreakers()

    const detailedHealth = Object.entries(serviceRegistry).map(([serviceName, service]) => ({
      name: serviceName,
      url: service.url,
      healthy: serviceHealth[serviceName],
      active: service.active,
      weight: service.weight,
      circuitBreaker: circuitBreakers[serviceName] || { state: 'closed', failures: 0 },
      lastChecked: new Date().toISOString()
    }))

    return {
      services: detailedHealth,
      summary: {
        total: detailedHealth.length,
        healthy: detailedHealth.filter(s => s.healthy).length,
        unhealthy: detailedHealth.filter(s => !s.healthy).length,
        timestamp: new Date().toISOString()
      }
    }
  })

  // Individual service health
  app.get('/health/services/:serviceName', async (request, reply) => {
    const { serviceName } = request.params as { serviceName: string }
    const serviceRegistry = getServiceRegistry()
    const circuitBreakers = getCircuitBreakers()

    const service = serviceRegistry[serviceName]
    if (!service) {
      return reply.status(404).send({
        error: 'Service not found',
        service: serviceName
      })
    }

    const isHealthy = await healthCheckAllServices().then(health => health[serviceName])

    return {
      service: serviceName,
      url: service.url,
      healthy: isHealthy,
      active: service.active,
      weight: service.weight,
      circuitBreaker: circuitBreakers[serviceName] || { state: 'closed', failures: 0 },
      lastChecked: new Date().toISOString()
    }
  })

  // ============================================================================
  // METRICS & MONITORING
  // ============================================================================

  // Gateway metrics
  app.get('/metrics', async (request, reply) => {
    const circuitBreakers = getCircuitBreakers()
    const serviceHealth = await healthCheckAllServices()

    const metrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      services: {
        total: Object.keys(serviceRegistry).length,
        healthy: Object.values(serviceHealth).filter(Boolean).length,
        unhealthy: Object.values(serviceHealth).filter(healthy => !healthy).length,
        circuitBreakers: {
          total: Object.keys(circuitBreakers).length,
          open: Object.values(circuitBreakers).filter(cb => cb.state === 'open').length,
          halfOpen: Object.values(circuitBreakers).filter(cb => cb.state === 'half-open').length,
        }
      },
      process: {
        pid: process.pid,
        platform: process.platform,
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || 'development'
      }
    }

    return metrics
  })

  // Request logging/stats (simplified)
  app.get('/stats/requests', async (request, reply) => {
    // In a real implementation, you'd collect metrics from a monitoring system
    return {
      totalRequests: 0, // Would be populated from actual metrics
      requestsPerSecond: 0,
      averageResponseTime: 0,
      errorRate: 0,
      topEndpoints: [],
      timestamp: new Date().toISOString()
    }
  })

  // ============================================================================
  // SERVICE DISCOVERY
  // ============================================================================

  // Service registry
  app.get('/services', async (request, reply) => {
    const serviceRegistry = getServiceRegistry()
    const serviceHealth = await healthCheckAllServices()

    return {
      services: Object.entries(serviceRegistry).map(([name, service]) => ({
        name,
        url: service.url,
        healthy: serviceHealth[name],
        active: service.active,
        weight: service.weight
      })),
      total: Object.keys(serviceRegistry).length,
      timestamp: new Date().toISOString()
    }
  })

  // ============================================================================
  // DIAGNOSTICS
  // ============================================================================

  // Configuration check
  app.get('/diagnostics/config', async (request, reply) => {
    // Return sanitized configuration for debugging
    const config = {
      port: process.env.PORT,
      nodeEnv: process.env.NODE_ENV,
      services: {
        auth: !!process.env.AUTH_SERVICE_URL,
        user: !!process.env.USER_SERVICE_URL,
        company: !!process.env.COMPANY_SERVICE_URL,
        financial: !!process.env.FINANCIAL_SERVICE_URL,
        compliance: !!process.env.COMPLIANCE_SERVICE_URL,
        crm: !!process.env.CRM_SERVICE_URL,
        calendar: !!process.env.CALENDAR_SERVICE_URL,
        billing: !!process.env.BILLING_SERVICE_URL,
        queue: !!process.env.QUEUE_SERVICE_URL
      },
      database: !!process.env.DATABASE_URL,
      redis: !!process.env.REDIS_URL,
      timestamp: new Date().toISOString()
    }

    return config
  })

  // Load test endpoint (for testing rate limiting)
  app.get('/test/load', async (request, reply) => {
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 10))
    return { message: 'Load test endpoint', timestamp: new Date().toISOString() }
  })

  // Echo endpoint for testing
  app.post('/test/echo', async (request, reply) => {
    return {
      received: request.body,
      headers: request.headers,
      method: request.method,
      url: request.url,
      timestamp: new Date().toISOString()
    }
  })
}