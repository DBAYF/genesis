import { FastifyInstance } from 'fastify'
import { register, collectDefaultMetrics, Gauge, Counter, Histogram, Summary } from 'prom-client'

// Enable default metrics collection
collectDefaultMetrics()

// Custom metrics
const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code', 'service']
})

const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code', 'service'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
})

const activeConnections = new Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
})

const serviceHealthStatus = new Gauge({
  name: 'service_health_status',
  help: 'Health status of downstream services',
  labelNames: ['service']
})

const circuitBreakerState = new Gauge({
  name: 'circuit_breaker_state',
  help: 'Circuit breaker state (0=closed, 1=open, 2=half-open)',
  labelNames: ['service']
})

const queueMetrics = {
  jobsWaiting: new Gauge({
    name: 'bullmq_jobs_waiting',
    help: 'Number of jobs waiting in queue',
    labelNames: ['queue']
  }),
  jobsActive: new Gauge({
    name: 'bullmq_jobs_active',
    help: 'Number of active jobs',
    labelNames: ['queue']
  }),
  jobsCompleted: new Gauge({
    name: 'bullmq_jobs_completed',
    help: 'Number of completed jobs',
    labelNames: ['queue']
  }),
  jobsFailed: new Gauge({
    name: 'bullmq_jobs_failed',
    help: 'Number of failed jobs',
    labelNames: ['queue']
  })
}

// Business metrics
const userRegistrations = new Counter({
  name: 'user_registration_total',
  help: 'Total number of user registrations'
})

const companyIncorporations = new Counter({
  name: 'company_incorporation_total',
  help: 'Total number of company incorporations'
})

const subscriptionActivations = new Counter({
  name: 'subscription_activation_total',
  help: 'Total number of subscription activations'
})

const paymentSuccesses = new Counter({
  name: 'payment_success_total',
  help: 'Total number of successful payments'
})

const paymentFailures = new Counter({
  name: 'payment_failed_total',
  help: 'Total number of failed payments'
})

const complianceTasksCompleted = new Counter({
  name: 'compliance_tasks_completed_total',
  help: 'Total number of completed compliance tasks'
})

// Middleware to collect metrics
export async function metricsMiddleware(app: FastifyInstance) {
  // Track active connections
  app.addHook('onRequest', (request, reply) => {
    activeConnections.inc()
  })

  app.addHook('onResponse', (request, reply) => {
    activeConnections.dec()

    // Record HTTP metrics
    const method = request.method
    const route = request.routeOptions.url || request.url
    const statusCode = reply.statusCode.toString()
    const service = request.headers['x-service'] as string || 'unknown'

    httpRequestsTotal.inc({ method, route, status_code: statusCode, service })
  })

  // Add metrics endpoint
  app.get('/metrics', async (request, reply) => {
    reply.header('Content-Type', register.contentType)
    return register.metrics()
  })

  // Add readiness probe
  app.get('/ready', async (request, reply) => {
    // Check critical dependencies
    const criticalServices = ['auth-service', 'user-service', 'company-service']

    for (const service of criticalServices) {
      try {
        const response = await fetch(`http://${service}:3000/health`, {
          signal: AbortSignal.timeout(5000)
        })
        const isHealthy = response.ok
        serviceHealthStatus.set({ service }, isHealthy ? 1 : 0)
      } catch (error) {
        serviceHealthStatus.set({ service }, 0)
      }
    }

    return { status: 'ready' }
  })

  // Background health checking
  setInterval(async () => {
    // Check all services periodically
    const services = [
      'auth-service', 'user-service', 'company-service',
      'financial-service', 'compliance-service', 'crm-service',
      'calendar-service', 'billing-service', 'queue-service'
    ]

    for (const service of services) {
      try {
        const response = await fetch(`http://${service}:3000/health`, {
          signal: AbortSignal.timeout(3000)
        })
        serviceHealthStatus.set({ service }, response.ok ? 1 : 0)
      } catch (error) {
        serviceHealthStatus.set({ service }, 0)
      }
    }
  }, 30000) // Check every 30 seconds
}

// Helper functions to update business metrics
export const metrics = {
  incrementUserRegistrations: () => userRegistrations.inc(),
  incrementCompanyIncorporations: () => companyIncorporations.inc(),
  incrementSubscriptionActivations: () => subscriptionActivations.inc(),
  incrementPaymentSuccesses: () => paymentSuccesses.inc(),
  incrementPaymentFailures: () => paymentFailures.inc(),
  incrementComplianceTasksCompleted: () => complianceTasksCompleted.inc(),

  updateQueueMetrics: (queueName: string, waiting: number, active: number, completed: number, failed: number) => {
    queueMetrics.jobsWaiting.set({ queue: queueName }, waiting)
    queueMetrics.jobsActive.set({ queue: queueName }, active)
    queueMetrics.jobsCompleted.set({ queue: queueName }, completed)
    queueMetrics.jobsFailed.set({ queue: queueName }, failed)
  },

  updateCircuitBreakerState: (service: string, state: 'closed' | 'open' | 'half-open') => {
    const stateValue = state === 'closed' ? 0 : state === 'open' ? 1 : 2
    circuitBreakerState.set({ service }, stateValue)
  }
}