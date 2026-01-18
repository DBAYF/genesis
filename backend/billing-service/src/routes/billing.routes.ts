import { FastifyInstance } from 'fastify'
import { BillingServiceImpl } from '../services/billing.service'
import { prisma } from '../utils/prisma'
import { z } from 'zod'

const billingService = new BillingServiceImpl(prisma)

export async function billingRoutes(app: FastifyInstance) {
  // ============================================================================
  // SUBSCRIPTION ROUTES
  // ============================================================================

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
        couponCode: z.string().optional(),
        metadata: z.record(z.any()).optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const data = request.body as any

    try {
      const subscription = await billingService.createSubscription(companyId, data)
      return reply.status(201).send({
        success: true,
        data: subscription
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to create subscription'
      })
    }
  })

  // Get subscriptions
  app.get('/companies/:companyId/subscriptions', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const subscriptions = await billingService.getSubscriptions(companyId)

    return {
      success: true,
      data: subscriptions
    }
  })

  // Get subscription
  app.get('/subscriptions/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const subscription = await billingService.getSubscription(id)

    if (!subscription) {
      return reply.status(404).send({
        success: false,
        error: 'Subscription not found'
      })
    }

    return {
      success: true,
      data: subscription
    }
  })

  // Update subscription
  app.put('/subscriptions/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: z.object({
        planId: z.string().uuid().optional(),
        quantity: z.number().optional(),
        paymentMethodId: z.string().uuid().optional(),
        prorationBehavior: z.enum(['create_prorations', 'none']).default('create_prorations'),
        cancelAtPeriodEnd: z.boolean().optional(),
        metadata: z.record(z.any()).optional()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const updates = request.body as any

    try {
      const subscription = await billingService.updateSubscription(id, updates)
      return {
        success: true,
        data: subscription
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Subscription not found'
      })
    }
  })

  // Cancel subscription
  app.post('/subscriptions/:id/cancel', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: z.object({
        cancelAtPeriodEnd: z.boolean().default(true)
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { cancelAtPeriodEnd } = request.body as any

    try {
      const subscription = await billingService.cancelSubscription(id, cancelAtPeriodEnd)
      return {
        success: true,
        data: subscription
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Subscription not found'
      })
    }
  })

  // Reactivate subscription
  app.post('/subscriptions/:id/reactivate', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    try {
      const subscription = await billingService.reactivateSubscription(id)
      return {
        success: true,
        data: subscription
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Subscription not found'
      })
    }
  })

  // ============================================================================
  // PLAN ROUTES
  // ============================================================================

  // Create plan
  app.post('/plans', {
    schema: {
      body: z.object({
        name: z.string(),
        description: z.string(),
        price: z.number(),
        currency: z.string().default('GBP'),
        interval: z.enum(['month', 'year']),
        intervalCount: z.number().default(1),
        trialDays: z.number().default(0),
        features: z.array(z.object({
          name: z.string(),
          description: z.string().optional(),
          included: z.boolean().default(true),
          limit: z.number().optional(),
          unit: z.string().optional()
        })).optional(),
        limits: z.array(z.object({
          resource: z.string(),
          limit: z.number(),
          unit: z.string()
        })).optional(),
        isPopular: z.boolean().default(false),
        sortOrder: z.number().default(0)
      })
    }
  }, async (request, reply) => {
    const data = request.body as any

    try {
      const plan = await billingService.createPlan(data)
      return reply.status(201).send({
        success: true,
        data: plan
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to create plan'
      })
    }
  })

  // Get plans
  app.get('/plans', async (request, reply) => {
    const plans = await billingService.getPlans()
    return {
      success: true,
      data: plans
    }
  })

  // ============================================================================
  // PAYMENT METHOD ROUTES
  // ============================================================================

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
        bankAccount: z.object({
          country: z.string(),
          currency: z.string(),
          accountHolderType: z.enum(['individual', 'company']),
          routingNumber: z.string().optional(),
          accountNumber: z.string()
        }).optional(),
        billingDetails: z.object({
          name: z.string().optional(),
          email: z.string().optional(),
          phone: z.string().optional(),
          address: z.object({
            line1: z.string(),
            line2: z.string().optional(),
            city: z.string(),
            state: z.string().optional(),
            postalCode: z.string(),
            country: z.string()
          }).optional()
        })
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const data = request.body as any

    try {
      const paymentMethod = await billingService.createPaymentMethod(companyId, data)
      return reply.status(201).send({
        success: true,
        data: paymentMethod
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to create payment method'
      })
    }
  })

  // Get payment methods
  app.get('/companies/:companyId/payment-methods', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const paymentMethods = await billingService.getPaymentMethods(companyId)

    return {
      success: true,
      data: paymentMethods
    }
  })

  // Set default payment method
  app.put('/companies/:companyId/payment-methods/:paymentMethodId/default', {
    schema: {
      params: z.object({
        companyId: z.string().uuid(),
        paymentMethodId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId, paymentMethodId } = request.params as any

    try {
      await billingService.setDefaultPaymentMethod(companyId, paymentMethodId)
      return {
        success: true,
        message: 'Default payment method updated'
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to update default payment method'
      })
    }
  })

  // ============================================================================
  // INVOICE ROUTES
  // ============================================================================

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
        dueDate: z.string().optional(),
        lines: z.array(z.object({
          amount: z.number(),
          currency: z.string(),
          description: z.string(),
          quantity: z.number().optional()
        })).optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const data = request.body as any

    try {
      const invoice = await billingService.createInvoice(companyId, data)
      return reply.status(201).send({
        success: true,
        data: invoice
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to create invoice'
      })
    }
  })

  // Get invoices
  app.get('/companies/:companyId/invoices', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const invoices = await billingService.getInvoices(companyId)

    return {
      success: true,
      data: invoices
    }
  })

  // Get invoice
  app.get('/invoices/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const invoice = await billingService.getInvoice(id)

    if (!invoice) {
      return reply.status(404).send({
        success: false,
        error: 'Invoice not found'
      })
    }

    return {
      success: true,
      data: invoice
    }
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
    const { paymentMethodId } = request.body as any

    try {
      const invoice = await billingService.payInvoice(id, paymentMethodId)
      return {
        success: true,
        data: invoice
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to pay invoice'
      })
    }
  })

  // ============================================================================
  // PAYMENT ROUTES
  // ============================================================================

  // Process payment
  app.post('/companies/:companyId/payments', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.object({
        paymentMethodId: z.string(),
        amount: z.number(),
        currency: z.string().default('GBP'),
        invoiceId: z.string().uuid().optional(),
        description: z.string().optional(),
        metadata: z.record(z.any()).optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const data = request.body as any

    try {
      const payment = await billingService.processPayment(companyId, data)
      return reply.status(201).send({
        success: true,
        data: payment
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to process payment'
      })
    }
  })

  // Get payments
  app.get('/companies/:companyId/payments', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const payments = await billingService.getPayments(companyId)

    return {
      success: true,
      data: payments
    }
  })

  // Refund payment
  app.post('/payments/:id/refund', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: z.object({
        amount: z.number(),
        reason: z.enum(['duplicate', 'fraudulent', 'requested_by_customer', 'other'])
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { amount, reason } = request.body as any

    try {
      const refund = await billingService.refundPayment(id, amount, reason)
      return reply.status(201).send({
        success: true,
        data: refund
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to process refund'
      })
    }
  })

  // ============================================================================
  // COUPON ROUTES
  // ============================================================================

  // Create coupon
  app.post('/coupons', {
    schema: {
      body: z.object({
        code: z.string(),
        name: z.string(),
        percentOff: z.number().optional(),
        amountOff: z.number().optional(),
        currency: z.string().optional(),
        duration: z.enum(['once', 'repeating', 'forever']),
        durationInMonths: z.number().optional(),
        maxRedemptions: z.number().optional(),
        validUntil: z.string().optional(),
        applicablePlans: z.array(z.string()).optional()
      })
    }
  }, async (request, reply) => {
    const data = request.body as any

    try {
      const coupon = await billingService.createCoupon(data)
      return reply.status(201).send({
        success: true,
        data: coupon
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to create coupon'
      })
    }
  })

  // Get coupons
  app.get('/coupons', async (request, reply) => {
    const coupons = await billingService.getCoupons()
    return {
      success: true,
      data: coupons
    }
  })

  // Validate coupon
  app.post('/coupons/validate', {
    schema: {
      body: z.object({
        code: z.string(),
        planId: z.string().uuid().optional()
      })
    }
  }, async (request, reply) => {
    const { code, planId } = request.body as any

    const coupon = await billingService.validateCoupon(code, planId)
    if (!coupon) {
      return reply.status(404).send({
        success: false,
        error: 'Invalid or expired coupon'
      })
    }

    return {
      success: true,
      data: coupon
    }
  })

  // ============================================================================
  // SETTINGS ROUTES
  // ============================================================================

  // Get billing settings
  app.get('/companies/:companyId/settings', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const settings = await billingService.getBillingSettings(companyId)

    if (!settings) {
      return reply.status(404).send({
        success: false,
        error: 'Billing settings not found'
      })
    }

    return {
      success: true,
      data: settings
    }
  })

  // Update billing settings
  app.put('/companies/:companyId/settings', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.object({
        defaultCurrency: z.string().optional(),
        taxRate: z.number().optional(),
        taxId: z.string().optional(),
        invoiceFooter: z.string().optional(),
        paymentMethods: z.object({
          stripe: z.boolean().optional(),
          paypal: z.boolean().optional(),
          bankTransfer: z.boolean().optional()
        }).optional(),
        billingAddress: z.object({
          line1: z.string(),
          line2: z.string().optional(),
          city: z.string(),
          state: z.string().optional(),
          postalCode: z.string(),
          country: z.string()
        }).optional(),
        notifications: z.object({
          invoiceCreated: z.boolean().optional(),
          paymentFailed: z.boolean().optional(),
          paymentSucceeded: z.boolean().optional(),
          subscriptionCanceled: z.boolean().optional(),
          trialEnding: z.boolean().optional()
        }).optional(),
        autoAdvanceInvoices: z.boolean().optional(),
        daysUntilDue: z.number().optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const updates = request.body as any

    try {
      const settings = await billingService.updateBillingSettings(companyId, updates)
      return {
        success: true,
        data: settings
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to update billing settings'
      })
    }
  })

  // ============================================================================
  // ANALYTICS ROUTES
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
    const { startDate, endDate } = request.query as { startDate: string; endDate: string }

    try {
      const analytics = await billingService.getBillingAnalytics(companyId, { start: startDate, end: endDate })
      return {
        success: true,
        data: analytics
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to generate analytics'
      })
    }
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
    const invoice = await billingService.getUpcomingInvoice(companyId)

    if (!invoice) {
      return reply.status(404).send({
        success: false,
        error: 'No upcoming invoice'
      })
    }

    return {
      success: true,
      data: invoice
    }
  })

  // ============================================================================
  // USAGE & LIMITS ROUTES
  // ============================================================================

  // Check plan limits
  app.get('/companies/:companyId/limits/:resource', {
    schema: {
      params: z.object({
        companyId: z.string().uuid(),
        resource: z.string()
      })
    }
  }, async (request, reply) => {
    const { companyId, resource } = request.params as any

    const limits = await billingService.checkPlanLimits(companyId, resource)
    return {
      success: true,
      data: limits
    }
  })

  // Record usage
  app.post('/companies/:companyId/usage', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.object({
        resource: z.string(),
        quantity: z.number()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const { resource, quantity } = request.body as any

    await billingService.recordUsage(companyId, resource, quantity)
    return {
      success: true,
      message: 'Usage recorded'
    }
  })

  // ============================================================================
  // WEBHOOK ROUTES
  // ============================================================================

  // Stripe webhook
  app.post('/webhooks/stripe', async (request, reply) => {
    const event = request.body as any

    try {
      await billingService.handleWebhookEvent(event)
      return { received: true }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Webhook processing failed'
      })
    }
  })
}