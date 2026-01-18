import { FastifyInstance } from 'fastify'
import { loadConfig } from '../config/loader'
import { z } from 'zod'

const config = loadConfig()

// Service registry for load balancing and health checks
const serviceRegistry = {
  'auth-service': {
    name: 'auth-service',
    url: config.AUTH_SERVICE_URL,
    health: '/health',
    weight: 1,
    active: true
  },
  'user-service': {
    name: 'user-service',
    url: config.USER_SERVICE_URL,
    health: '/health',
    weight: 1,
    active: true
  },
  'company-service': {
    name: 'company-service',
    url: config.COMPANY_SERVICE_URL,
    health: '/health',
    weight: 1,
    active: true
  },
  'financial-service': {
    name: 'financial-service',
    url: config.FINANCIAL_SERVICE_URL,
    health: '/health',
    weight: 1,
    active: true
  },
  'compliance-service': {
    name: 'compliance-service',
    url: config.COMPLIANCE_SERVICE_URL,
    health: '/health',
    weight: 1,
    active: true
  },
  'crm-service': {
    name: 'crm-service',
    url: config.CRM_SERVICE_URL,
    health: '/health',
    weight: 1,
    active: true
  },
  'calendar-service': {
    name: 'calendar-service',
    url: config.CALENDAR_SERVICE_URL,
    health: '/health',
    weight: 1,
    active: true
  },
  'billing-service': {
    name: 'billing-service',
    url: config.BILLING_SERVICE_URL,
    health: '/health',
    weight: 1,
    active: true
  },
  'queue-service': {
    name: 'queue-service',
    url: config.QUEUE_SERVICE_URL || 'http://queue-service:3014',
    health: '/health',
    weight: 1,
    active: true
  }
}

// Circuit breaker state
const circuitBreakers: Record<string, { failures: number; lastFailure: number; state: 'closed' | 'open' | 'half-open' }> = {}

// Service health monitoring
async function checkServiceHealth(serviceName: string): Promise<boolean> {
  const service = serviceRegistry[serviceName]
  if (!service || !service.active) return false

  try {
    const response = await fetch(`${service.url}${service.health}`, {
      signal: AbortSignal.timeout(5000),
      headers: { 'User-Agent': 'API-Gateway-Health-Check' }
    })
    return response.ok
  } catch (error) {
    console.warn(`Health check failed for ${serviceName}:`, error.message)
    return false
  }
}

// Load balancing - simple round-robin for now
let serviceCallCounters: Record<string, number> = {}

function getServiceUrl(serviceName: string): string | null {
  const service = serviceRegistry[serviceName]
  if (!service || !service.active) return null

  // Check circuit breaker
  const breaker = circuitBreakers[serviceName] || { failures: 0, lastFailure: 0, state: 'closed' }
  if (breaker.state === 'open') {
    const now = Date.now()
    const timeoutMs = 60000 // 1 minute timeout
    if (now - breaker.lastFailure < timeoutMs) {
      return null // Circuit is open
    }
    // Half-open state - allow one request
    breaker.state = 'half-open'
  }

  return service.url
}

// Forward request to service with error handling and circuit breaker
async function forwardRequest(serviceName: string, method: string, path: string, request: any, reply: any) {
  const serviceUrl = getServiceUrl(serviceName)
  if (!serviceUrl) {
    return reply.status(503).send({
      success: false,
      error: 'Service temporarily unavailable',
      service: serviceName
    })
  }

  const breaker = circuitBreakers[serviceName] || { failures: 0, lastFailure: 0, state: 'closed' }

  try {
    // Forward the request using fetch for better control
    const url = `${serviceUrl}${path}`
    const headers = new Headers()

    // Copy headers from request
    Object.entries(request.headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        headers.set(key, value)
      }
    })

    // Add gateway headers
    headers.set('x-forwarded-for', request.ip)
    headers.set('x-api-gateway', 'true')
    headers.set('x-request-id', request.id)

    const response = await fetch(url, {
      method,
      headers,
      body: method !== 'GET' && method !== 'HEAD' ? JSON.stringify(request.body) : undefined,
      signal: AbortSignal.timeout(30000) // 30 second timeout
    })

    const responseData = await response.text()

    // Reset circuit breaker on success
    if (breaker.state === 'half-open') {
      breaker.failures = 0
      breaker.state = 'closed'
    }

    // Add gateway response headers
    reply.header('x-service', serviceName)
    reply.header('x-gateway-processed', 'true')

    return reply.status(response.status).send(responseData)

  } catch (error) {
    console.error(`Request failed for ${serviceName}:`, error.message)

    // Update circuit breaker
    breaker.failures++
    breaker.lastFailure = Date.now()

    if (breaker.failures >= 5) { // Open circuit after 5 failures
      breaker.state = 'open'
      console.warn(`Circuit breaker opened for ${serviceName}`)
    }

    circuitBreakers[serviceName] = breaker

    return reply.status(502).send({
      success: false,
      error: 'Service request failed',
      service: serviceName
    })
  }
}

export async function authRoutes(app: FastifyInstance) {
  // ============================================================================
  // AUTHENTICATION ROUTES
  // ============================================================================

  // Login
  app.post('/login', {
    schema: {
      body: z.object({
        email: z.string().email(),
        password: z.string().min(6)
      })
    }
  }, async (request, reply) => {
    return forwardRequest('auth-service', 'POST', '/api/v1/auth/login', request, reply)
  })

  // Register
  app.post('/register', {
    schema: {
      body: z.object({
        email: z.string().email(),
        password: z.string().min(6),
        firstName: z.string(),
        lastName: z.string()
      })
    }
  }, async (request, reply) => {
    return forwardRequest('auth-service', 'POST', '/api/v1/auth/register', request, reply)
  })

  // Logout
  app.post('/logout', async (request, reply) => {
    return forwardRequest('auth-service', 'POST', '/api/v1/auth/logout', request, reply)
  })

  // Refresh token
  app.post('/refresh-token', async (request, reply) => {
    return forwardRequest('auth-service', 'POST', '/api/v1/auth/refresh-token', request, reply)
  })

  // Forgot password
  app.post('/forgot-password', {
    schema: {
      body: z.object({
        email: z.string().email()
      })
    }
  }, async (request, reply) => {
    return forwardRequest('auth-service', 'POST', '/api/v1/auth/forgot-password', request, reply)
  })

  // Reset password
  app.post('/reset-password', {
    schema: {
      body: z.object({
        token: z.string(),
        password: z.string().min(6)
      })
    }
  }, async (request, reply) => {
    return forwardRequest('auth-service', 'POST', '/api/v1/auth/reset-password', request, reply)
  })

  // Verify email
  app.post('/verify-email', {
    schema: {
      body: z.object({
        token: z.string()
      })
    }
  }, async (request, reply) => {
    return forwardRequest('auth-service', 'POST', '/api/v1/auth/verify-email', request, reply)
  })
}