import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { forwardRequest } from '../utils/service-router'

// ============================================================================
// BILLING ROUTES
// ============================================================================

export async function billingRoutes(app: FastifyInstance) {
  // ============================================================================
  // SUBSCRIPTIONS
  // ============================================================================

  // Get subscriptions
  app.get('/companies/:companyId/subscriptions', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    return forwardRequest('billing-service', 'GET', `/api/v1/companies/${companyId}/subscriptions`, request, reply)
  })

  // Create subscription
  app.post('/companies/:companyId/subscriptions', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.object({
        planId: z.string().uuid(),
        paymentMethodId: z.string().uuid().optional(),
        quantity: z.number().default(1),
        trialDays: z.number().optional(),
        couponCode: z.string().optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    return forwardRequest('billing-service', 'POST', `/api/v1/companies/${companyId}/subscriptions`, request, reply)
  })

  // ============================================================================
  // PLANS
  // ============================================================================

  // Get plans
  app.get('/plans', async (request, reply) => {
    return forwardRequest('billing-service', 'GET', '/api/v1/plans', request, reply)
  })

  // ============================================================================
  // PAYMENT METHODS
  // ============================================================================

  // Get payment methods
  app.get('/companies/:companyId/payment-methods', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    return forwardRequest('billing-service', 'GET', `/api/v1/companies/${companyId}/payment-methods`, request, reply)
  })

  // Create payment method
  app.post('/companies/:companyId/payment-methods', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.object({
        type: z.enum(['card', 'bank_account']),
        card: z.object({
          number: z.string(),
          expMonth: z.number(),
          expYear: z.number(),
          cvc: z.string()
        }).optional(),
        billingDetails: z.object({
          name: z.string().optional(),
          email: z.string().email().optional(),
          phone: z.string().optional()
        })
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    return forwardRequest('billing-service', 'POST', `/api/v1/companies/${companyId}/payment-methods`, request, reply)
  })

  // ============================================================================
  // INVOICES
  // ============================================================================

  // Get invoices
  app.get('/companies/:companyId/invoices', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    return forwardRequest('billing-service', 'GET', `/api/v1/companies/${companyId}/invoices`, request, reply)
  })

  // Create invoice
  app.post('/companies/:companyId/invoices', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.object({
        subscriptionId: z.string().uuid().optional(),
        customerId: z.string().uuid(),
        amount: z.number().optional(),
        currency: z.string().default('GBP'),
        description: z.string().optional(),
        dueDate: z.string().optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    return forwardRequest('billing-service', 'POST', `/api/v1/companies/${companyId}/invoices`, request, reply)
  })

  // Pay invoice
  app.post('/invoices/:id/pay', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: z.object({
        paymentMethodId: z.string().uuid().optional()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    return forwardRequest('billing-service', 'POST', `/api/v1/invoices/${id}/pay`, request, reply)
  })

  // ============================================================================
  // BILLING DASHBOARD
  // ============================================================================

  // Get billing analytics
  app.get('/companies/:companyId/analytics', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      querystring: z.object({
        startDate: z.string(),
        endDate: z.string()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    return forwardRequest('billing-service', 'GET', `/api/v1/companies/${companyId}/analytics`, request, reply)
  })

  // Get upcoming invoice
  app.get('/companies/:companyId/upcoming-invoice', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    return forwardRequest('billing-service', 'GET', `/api/v1/companies/${companyId}/upcoming-invoice`, request, reply)
  })
}