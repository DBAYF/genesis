import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { forwardRequest } from '../utils/service-router'

// ============================================================================
// CRM ROUTES
// ============================================================================

export async function crmRoutes(app: FastifyInstance) {
  // ============================================================================
  // CONTACTS
  // ============================================================================

  // Get contacts
  app.get('/companies/:companyId/contacts', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    return forwardRequest('crm-service', 'GET', `/api/v1/companies/${companyId}/contacts`, request, reply)
  })

  // Create contact
  app.post('/companies/:companyId/contacts', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.object({
        type: z.enum(['customer', 'supplier', 'investor', 'advisor', 'partner', 'other']),
        firstName: z.string(),
        lastName: z.string(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        company: z.string().optional(),
        position: z.string().optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    return forwardRequest('crm-service', 'POST', `/api/v1/companies/${companyId}/contacts`, request, reply)
  })

  // ============================================================================
  // DEALS
  // ============================================================================

  // Get deals
  app.get('/companies/:companyId/deals', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    return forwardRequest('crm-service', 'GET', `/api/v1/companies/${companyId}/deals`, request, reply)
  })

  // Create deal
  app.post('/companies/:companyId/deals', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.object({
        contactId: z.string().uuid(),
        title: z.string(),
        value: z.number(),
        currency: z.string().default('GBP'),
        expectedCloseDate: z.string().optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    return forwardRequest('crm-service', 'POST', `/api/v1/companies/${companyId}/deals`, request, reply)
  })

  // ============================================================================
  // CAMPAIGNS
  // ============================================================================

  // Get campaigns
  app.get('/companies/:companyId/campaigns', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    return forwardRequest('crm-service', 'GET', `/api/v1/companies/${companyId}/campaigns`, request, reply)
  })

  // Create campaign
  app.post('/companies/:companyId/campaigns', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.object({
        name: z.string(),
        type: z.enum(['email', 'social', 'event', 'webinar', 'advertising', 'other']),
        budget: z.number(),
        currency: z.string().default('GBP')
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    return forwardRequest('crm-service', 'POST', `/api/v1/companies/${companyId}/campaigns`, request, reply)
  })

  // ============================================================================
  // CRM DASHBOARD
  // ============================================================================

  // Get CRM dashboard
  app.get('/companies/:companyId/dashboard', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    return forwardRequest('crm-service', 'GET', `/api/v1/companies/${companyId}/dashboard`, request, reply)
  })
}