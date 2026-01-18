import { FastifyInstance } from 'fastify'
import { CrmServiceImpl } from '../services/crm.service'
import { prisma } from '../utils/prisma'
import { z } from 'zod'

const crmService = new CrmServiceImpl(prisma)

export async function crmRoutes(app: FastifyInstance) {
  // ============================================================================
  // CONTACT ROUTES
  // ============================================================================

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
        position: z.string().optional(),
        address: z.object({
          line1: z.string(),
          line2: z.string().optional(),
          city: z.string(),
          county: z.string().optional(),
          postcode: z.string(),
          country: z.string()
        }).optional(),
        tags: z.array(z.string()).optional(),
        notes: z.string().optional(),
        source: z.string().default('manual')
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const data = request.body as any

    try {
      const contact = await crmService.createContact(companyId, data)
      return reply.status(201).send({
        success: true,
        data: contact
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to create contact'
      })
    }
  })

  // Get contacts
  app.get('/companies/:companyId/contacts', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      querystring: z.object({
        type: z.string().optional(),
        lifecycleStage: z.enum(['lead', 'prospect', 'customer', 'champion', 'lost']).optional(),
        tags: z.string().optional(),
        leadScoreMin: z.string().transform(Number).optional(),
        leadScoreMax: z.string().transform(Number).optional(),
        limit: z.string().transform(Number).default(50),
        offset: z.string().transform(Number).default(0)
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const query = request.query as any

    const filters = {
      type: query.type?.split(','),
      lifecycleStage: query.lifecycleStage,
      tags: query.tags?.split(','),
      leadScoreMin: query.leadScoreMin,
      leadScoreMax: query.leadScoreMax
    }

    const contacts = await crmService.getContacts(companyId, filters)
    return {
      success: true,
      data: contacts
    }
  })

  // Search contacts
  app.get('/companies/:companyId/contacts/search', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      querystring: z.object({
        q: z.string()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const { q } = request.query as { q: string }

    const contacts = await crmService.searchContacts(companyId, q)
    return {
      success: true,
      data: contacts
    }
  })

  // Get contact
  app.get('/contacts/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const contact = await crmService.getContact(id)

    if (!contact) {
      return reply.status(404).send({
        success: false,
        error: 'Contact not found'
      })
    }

    return {
      success: true,
      data: contact
    }
  })

  // Update contact
  app.put('/contacts/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: z.object({
        type: z.enum(['customer', 'supplier', 'investor', 'advisor', 'partner', 'other']).optional(),
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        company: z.string().optional(),
        position: z.string().optional(),
        address: z.object({
          line1: z.string(),
          line2: z.string().optional(),
          city: z.string(),
          county: z.string().optional(),
          postcode: z.string(),
          country: z.string()
        }).optional(),
        tags: z.array(z.string()).optional(),
        notes: z.string().optional(),
        lifecycleStage: z.enum(['lead', 'prospect', 'customer', 'champion', 'lost']).optional(),
        leadScore: z.number().optional()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const updates = request.body as any

    try {
      const contact = await crmService.updateContact(id, updates)
      return {
        success: true,
        data: contact
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Contact not found'
      })
    }
  })

  // Update lead score
  app.put('/contacts/:id/lead-score', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: z.object({
        score: z.number().min(0).max(100)
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { score } = request.body as any

    try {
      const contact = await crmService.updateLeadScore(id, score)
      return {
        success: true,
        data: contact
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Contact not found'
      })
    }
  })

  // ============================================================================
  // DEAL ROUTES
  // ============================================================================

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
        expectedCloseDate: z.string().optional(),
        description: z.string().optional(),
        products: z.array(z.object({
          name: z.string(),
          quantity: z.number(),
          unitPrice: z.number(),
          discount: z.number().optional()
        })).optional(),
        assignedTo: z.string().uuid().optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const data = request.body as any

    try {
      const deal = await crmService.createDeal(companyId, data)
      return reply.status(201).send({
        success: true,
        data: deal
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to create deal'
      })
    }
  })

  // Get deals
  app.get('/companies/:companyId/deals', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      querystring: z.object({
        stage: z.string().optional(),
        assignedTo: z.string().uuid().optional(),
        valueMin: z.string().transform(Number).optional(),
        valueMax: z.string().transform(Number).optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const query = request.query as any

    const filters = {
      stage: query.stage?.split(','),
      assignedTo: query.assignedTo,
      valueMin: query.valueMin,
      valueMax: query.valueMax
    }

    const deals = await crmService.getDeals(companyId, filters)
    return {
      success: true,
      data: deals
    }
  })

  // Get deal
  app.get('/deals/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const deal = await crmService.getDeal(id)

    if (!deal) {
      return reply.status(404).send({
        success: false,
        error: 'Deal not found'
      })
    }

    return {
      success: true,
      data: deal
    }
  })

  // Update deal
  app.put('/deals/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: z.object({
        title: z.string().optional(),
        value: z.number().optional(),
        currency: z.string().optional(),
        stage: z.enum(['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).optional(),
        probability: z.number().min(0).max(100).optional(),
        expectedCloseDate: z.string().optional(),
        actualCloseDate: z.string().optional(),
        description: z.string().optional(),
        assignedTo: z.string().uuid().optional()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const updates = request.body as any

    try {
      const deal = await crmService.updateDeal(id, updates)
      return {
        success: true,
        data: deal
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Deal not found'
      })
    }
  })

  // Add deal activity
  app.post('/deals/:dealId/activities', {
    schema: {
      params: z.object({
        dealId: z.string().uuid()
      }),
      body: z.object({
        type: z.enum(['call', 'email', 'meeting', 'note', 'task']),
        title: z.string(),
        description: z.string().optional(),
        date: z.string(),
        duration: z.number().optional(),
        outcome: z.string().optional()
      })
    }
  }, async (request, reply) => {
    const { dealId } = request.params as { dealId: string }
    const activityData = request.body as any

    try {
      const activity = await crmService.addDealActivity(dealId, {
        ...activityData,
        createdBy: 'system' // Would come from auth context
      })
      return reply.status(201).send({
        success: true,
        data: activity
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to add activity'
      })
    }
  })

  // ============================================================================
  // CAMPAIGN ROUTES
  // ============================================================================

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
        currency: z.string().default('GBP'),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        targetAudience: z.array(z.string()).optional(),
        goals: z.array(z.object({
          type: z.enum(['leads', 'conversions', 'revenue', 'engagement', 'awareness']),
          target: z.number()
        })).optional(),
        content: z.string().optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const data = request.body as any

    try {
      const campaign = await crmService.createCampaign(companyId, data)
      return reply.status(201).send({
        success: true,
        data: campaign
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to create campaign'
      })
    }
  })

  // Get campaigns
  app.get('/companies/:companyId/campaigns', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const campaigns = await crmService.getCampaigns(companyId)

    return {
      success: true,
      data: campaigns
    }
  })

  // Update campaign metrics
  app.put('/campaigns/:id/metrics', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: z.object({
        sent: z.number().optional(),
        opened: z.number().optional(),
        clicked: z.number().optional(),
        converted: z.number().optional(),
        revenue: z.number().optional()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const metrics = request.body as any

    try {
      const campaign = await crmService.updateCampaignMetrics(id, metrics)
      return {
        success: true,
        data: campaign
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Campaign not found'
      })
    }
  })

  // ============================================================================
  // COMMUNICATION ROUTES
  // ============================================================================

  // Create communication
  app.post('/companies/:companyId/communications', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.object({
        contactId: z.string().uuid(),
        type: z.enum(['email', 'call', 'meeting', 'sms', 'social', 'other']),
        direction: z.enum(['inbound', 'outbound']),
        subject: z.string().optional(),
        content: z.string(),
        metadata: z.record(z.any()).optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const data = request.body as any

    try {
      const communication = await crmService.createCommunication(companyId, data)
      return reply.status(201).send({
        success: true,
        data: communication
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to create communication'
      })
    }
  })

  // Get communications
  app.get('/companies/:companyId/communications', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      querystring: z.object({
        contactId: z.string().uuid().optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const { contactId } = request.query as { contactId?: string }

    const communications = await crmService.getCommunications(companyId, contactId)
    return {
      success: true,
      data: communications
    }
  })

  // ============================================================================
  // EMAIL TEMPLATE ROUTES
  // ============================================================================

  // Create email template
  app.post('/companies/:companyId/email-templates', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.object({
        name: z.string(),
        subject: z.string(),
        content: z.string(),
        type: z.enum(['welcome', 'follow_up', 'newsletter', 'promotion', 'reminder', 'custom']),
        variables: z.array(z.string()).optional(),
        isActive: z.boolean().default(true)
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const templateData = request.body as any

    try {
      const template = await crmService.createEmailTemplate(companyId, templateData)
      return reply.status(201).send({
        success: true,
        data: template
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to create email template'
      })
    }
  })

  // Get email templates
  app.get('/companies/:companyId/email-templates', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const templates = await crmService.getEmailTemplates(companyId)

    return {
      success: true,
      data: templates
    }
  })

  // ============================================================================
  // DASHBOARD ROUTES
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
    const dashboard = await crmService.getCrmDashboardData(companyId)

    return {
      success: true,
      data: dashboard
    }
  })

  // Get CRM alerts
  app.get('/companies/:companyId/alerts', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const alerts = await crmService.getCrmAlerts(companyId)

    return {
      success: true,
      data: alerts
    }
  })

  // ============================================================================
  // IMPORT/EXPORT ROUTES
  // ============================================================================

  // Import contacts
  app.post('/companies/:companyId/contacts/import', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.array(z.object({
        type: z.enum(['customer', 'supplier', 'investor', 'advisor', 'partner', 'other']),
        firstName: z.string(),
        lastName: z.string(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        company: z.string().optional(),
        position: z.string().optional(),
        address: z.object({
          line1: z.string(),
          line2: z.string().optional(),
          city: z.string(),
          county: z.string().optional(),
          postcode: z.string(),
          country: z.string()
        }).optional(),
        tags: z.array(z.string()).optional(),
        notes: z.string().optional(),
        source: z.string().optional()
      }))
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const contacts = request.body as any[]

    try {
      const importedContacts = await crmService.importContacts(companyId, contacts)
      return reply.status(201).send({
        success: true,
        data: importedContacts,
        imported: importedContacts.length
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Import failed'
      })
    }
  })

  // Export contacts
  app.get('/companies/:companyId/contacts/export', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      querystring: z.object({
        format: z.enum(['csv', 'xlsx']).default('csv'),
        type: z.string().optional(),
        lifecycleStage: z.enum(['lead', 'prospect', 'customer', 'champion', 'lost']).optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const query = request.query as any

    const filters = {
      type: query.type?.split(','),
      lifecycleStage: query.lifecycleStage
    }

    try {
      const csvData = await crmService.exportContacts(companyId, filters)
      reply.header('Content-Type', 'text/csv')
      reply.header('Content-Disposition', `attachment; filename=contacts-${companyId}.csv`)
      return csvData
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Export failed'
      })
    }
  })
}