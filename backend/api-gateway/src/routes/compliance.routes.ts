import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { forwardRequest } from '../utils/service-router'

// ============================================================================
// COMPLIANCE ROUTES
// ============================================================================

export async function complianceRoutes(app: FastifyInstance) {
  // ============================================================================
  // COMPLIANCE TASKS
  // ============================================================================

  // Get compliance tasks
  app.get('/companies/:companyId/tasks', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    return forwardRequest('compliance-service', 'GET', `/api/v1/companies/${companyId}/tasks`, request, reply)
  })

  // Create compliance task
  app.post('/companies/:companyId/tasks', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.object({
        type: z.string(),
        title: z.string(),
        description: z.string(),
        dueDate: z.string(),
        priority: z.enum(['low', 'medium', 'high', 'critical']).optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    return forwardRequest('compliance-service', 'POST', `/api/v1/companies/${companyId}/tasks`, request, reply)
  })

  // Get compliance dashboard
  app.get('/companies/:companyId/dashboard', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    return forwardRequest('compliance-service', 'GET', `/api/v1/companies/${companyId}/dashboard`, request, reply)
  })

  // Get upcoming deadlines
  app.get('/companies/:companyId/deadlines', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      querystring: z.object({
        days: z.string().transform(Number).default(30)
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    return forwardRequest('compliance-service', 'GET', `/api/v1/companies/${companyId}/deadlines`, request, reply)
  })
}