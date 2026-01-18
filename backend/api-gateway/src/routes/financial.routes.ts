import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { forwardRequest } from '../utils/service-router'

// ============================================================================
// FINANCIAL ROUTES
// ============================================================================

export async function financialRoutes(app: FastifyInstance) {
  // ============================================================================
  // FINANCIAL PROJECTIONS
  // ============================================================================

  // Get financial projections
  app.get('/projections', {
    schema: {
      querystring: z.object({
        companyId: z.string().uuid(),
        page: z.string().transform(Number).default(1),
        limit: z.string().transform(Number).default(10)
      })
    }
  }, async (request, reply) => {
    return forwardRequest('financial-service', 'GET', '/api/v1/projections', request, reply)
  })

  // Create financial projection
  app.post('/projections', {
    schema: {
      body: z.object({
        companyId: z.string().uuid(),
        name: z.string(),
        type: z.enum(['revenue', 'cost', 'profit', 'cashflow', 'balance']),
        period: z.object({
          start: z.string(),
          end: z.string()
        }),
        projections: z.array(z.object({
          month: z.string(),
          amount: z.number(),
          description: z.string().optional()
        })),
        assumptions: z.record(z.any()).optional()
      })
    }
  }, async (request, reply) => {
    return forwardRequest('financial-service', 'POST', '/api/v1/projections', request, reply)
  })

  // Get financial overview
  app.get('/companies/:companyId/overview', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    return forwardRequest('financial-service', 'GET', `/api/v1/companies/${companyId}/overview`, request, reply)
  })

  // ============================================================================
  // TRANSACTIONS
  // ============================================================================

  // Get transactions
  app.get('/companies/:companyId/transactions', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      querystring: z.object({
        page: z.string().transform(Number).default(1),
        limit: z.string().transform(Number).default(50),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        category: z.string().optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    return forwardRequest('financial-service', 'GET', `/api/v1/companies/${companyId}/transactions`, request, reply)
  })

  // Create transaction
  app.post('/companies/:companyId/transactions', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.object({
        type: z.enum(['income', 'expense', 'transfer']),
        amount: z.number(),
        currency: z.string().default('GBP'),
        category: z.string(),
        description: z.string(),
        date: z.string(),
        reference: z.string().optional(),
        metadata: z.record(z.any()).optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    return forwardRequest('financial-service', 'POST', `/api/v1/companies/${companyId}/transactions`, request, reply)
  })
}