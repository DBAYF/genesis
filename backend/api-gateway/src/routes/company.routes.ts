import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { forwardRequest } from '../utils/service-router'

// ============================================================================
// COMPANY ROUTES
// ============================================================================

export async function companyRoutes(app: FastifyInstance) {
  // ============================================================================
  // COMPANY MANAGEMENT ROUTES
  // ============================================================================

  // List companies
  app.get('/', {
    schema: {
      querystring: z.object({
        page: z.string().transform(Number).default(1),
        limit: z.string().transform(Number).default(10),
        search: z.string().optional(),
        type: z.string().optional()
      })
    }
  }, async (request, reply) => {
    return forwardRequest('company-service', 'GET', '/api/v1/companies', request, reply)
  })

  // Get company
  app.get('/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    return forwardRequest('company-service', 'GET', `/api/v1/companies/${id}`, request, reply)
  })

  // Create company
  app.post('/', {
    schema: {
      body: z.object({
        name: z.string(),
        type: z.enum(['llc', 'plc', 'ltd', 'lp', 'other']),
        jurisdiction: z.string().default('uk'),
        registeredAddress: z.object({
          line1: z.string(),
          city: z.string(),
          postcode: z.string(),
          country: z.string().default('GB')
        }),
        businessAddress: z.object({
          line1: z.string(),
          city: z.string(),
          postcode: z.string(),
          country: z.string().default('GB')
        }).optional(),
        sicCode: z.string().optional(),
        incorporationDate: z.string().optional()
      })
    }
  }, async (request, reply) => {
    return forwardRequest('company-service', 'POST', '/api/v1/companies', request, reply)
  })

  // Update company
  app.put('/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: z.object({
        name: z.string().optional(),
        type: z.enum(['llc', 'plc', 'ltd', 'lp', 'other']).optional(),
        jurisdiction: z.string().optional(),
        registeredAddress: z.any().optional(),
        businessAddress: z.any().optional(),
        sicCode: z.string().optional(),
        incorporationDate: z.string().optional()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    return forwardRequest('company-service', 'PUT', `/api/v1/companies/${id}`, request, reply)
  })

  // Delete company
  app.delete('/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    return forwardRequest('company-service', 'DELETE', `/api/v1/companies/${id}`, request, reply)
  })

  // Incorporate company
  app.post('/incorporate', {
    schema: {
      body: z.object({
        name: z.string(),
        type: z.enum(['llc', 'plc', 'ltd', 'lp', 'other']),
        jurisdiction: z.string().default('uk'),
        registeredAddress: z.object({
          line1: z.string(),
          city: z.string(),
          postcode: z.string(),
          country: z.string().default('GB')
        }),
        directors: z.array(z.object({
          firstName: z.string(),
          lastName: z.string(),
          email: z.string().email(),
          address: z.any()
        })),
        shareholders: z.array(z.object({
          firstName: z.string(),
          lastName: z.string(),
          email: z.string().email(),
          shares: z.number(),
          shareClass: z.string()
        }))
      })
    }
  }, async (request, reply) => {
    return forwardRequest('company-service', 'POST', '/api/v1/companies/incorporate', request, reply)
  })

  // Search companies
  app.get('/search', {
    schema: {
      querystring: z.object({
        q: z.string(),
        jurisdiction: z.string().optional(),
        type: z.string().optional()
      })
    }
  }, async (request, reply) => {
    return forwardRequest('company-service', 'GET', '/api/v1/companies/search', request, reply)
  })
}