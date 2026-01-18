import { FastifyInstance } from 'fastify'
import { ComplianceServiceImpl } from '../services/compliance.service'
import { prisma } from '../utils/prisma'
import { z } from 'zod'

const complianceService = new ComplianceServiceImpl(prisma)

export async function complianceRoutes(app: FastifyInstance) {
  // ============================================================================
  // COMPLIANCE TASK ROUTES
  // ============================================================================

  // Create compliance task
  app.post('/companies/:companyId/tasks', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.object({
        type: z.enum(['hmrc_filing', 'companies_house_filing', 'vat_return', 'paye_return', 'confirmation_statement', 'accounts_filing', 'tax_payment', 'seis_eis_filing', 'insurance_renewal', 'contract_review', 'data_protection', 'health_safety']),
        title: z.string(),
        description: z.string(),
        dueDate: z.string(),
        priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
        assignedTo: z.string().uuid().optional(),
        reminders: z.array(z.object({
          daysBefore: z.number()
        })).optional(),
        metadata: z.record(z.any()).optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const data = request.body as any

    try {
      const task = await complianceService.createComplianceTask(companyId, data)
      return reply.status(201).send({
        success: true,
        data: task
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to create compliance task'
      })
    }
  })

  // Get compliance tasks
  app.get('/companies/:companyId/tasks', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      querystring: z.object({
        status: z.string().optional(),
        priority: z.string().optional(),
        type: z.string().optional(),
        assignedTo: z.string().uuid().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const query = request.query as any

    const filters = {
      status: query.status?.split(','),
      priority: query.priority?.split(','),
      type: query.type?.split(','),
      assignedTo: query.assignedTo,
      startDate: query.startDate,
      endDate: query.endDate
    }

    const tasks = await complianceService.getComplianceTasks(companyId, filters)
    return {
      success: true,
      data: tasks
    }
  })

  // Update compliance task
  app.put('/tasks/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        dueDate: z.string().optional(),
        status: z.enum(['pending', 'in_progress', 'completed', 'overdue', 'cancelled']).optional(),
        priority: z.enum(['low', 'medium', 'high', 'critical']).optional(),
        assignedTo: z.string().uuid().optional(),
        metadata: z.record(z.any()).optional()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const updates = request.body as any

    try {
      const task = await complianceService.updateComplianceTask(id, updates)
      return {
        success: true,
        data: task
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Compliance task not found'
      })
    }
  })

  // Complete compliance task
  app.post('/tasks/:id/complete', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: z.object({
        completedBy: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { completedBy } = request.body as any

    try {
      const task = await complianceService.completeComplianceTask(id, completedBy)
      return {
        success: true,
        data: task
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Compliance task not found'
      })
    }
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
    const { days } = request.query as { days: number }

    const deadlines = await complianceService.getUpcomingDeadlines(companyId, days)
    return {
      success: true,
      data: deadlines
    }
  })

  // Get overdue tasks
  app.get('/companies/:companyId/overdue', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const overdueTasks = await complianceService.getOverdueTasks(companyId)

    return {
      success: true,
      data: overdueTasks
    }
  })

  // ============================================================================
  // COMPLIANCE RECORD ROUTES
  // ============================================================================

  // Create compliance record
  app.post('/companies/:companyId/records', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.object({
        type: z.string(),
        reference: z.string(),
        filingDate: z.string(),
        period: z.object({
          start: z.string(),
          end: z.string()
        }),
        documents: z.array(z.object({
          name: z.string(),
          type: z.enum(['accounts', 'confirmation_statement', 'tax_return', 'confirmation_receipt', 'other']),
          fileUrl: z.string(),
          fileSize: z.number(),
          mimeType: z.string()
        })).optional(),
        notes: z.string().optional(),
        metadata: z.record(z.any()).optional(),
        submittedBy: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const data = request.body as any

    try {
      const record = await complianceService.createComplianceRecord(companyId, data, data.submittedBy)
      return reply.status(201).send({
        success: true,
        data: record
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to create compliance record'
      })
    }
  })

  // Get compliance records
  app.get('/companies/:companyId/records', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      querystring: z.object({
        type: z.string().optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const { type } = request.query as { type?: string }

    const records = await complianceService.getComplianceRecords(companyId, type)
    return {
      success: true,
      data: records
    }
  })

  // Get compliance record
  app.get('/records/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const record = await complianceService.getComplianceRecord(id)

    if (!record) {
      return reply.status(404).send({
        success: false,
        error: 'Compliance record not found'
      })
    }

    return {
      success: true,
      data: record
    }
  })

  // ============================================================================
  // COMPLIANCE CHECKLIST ROUTES
  // ============================================================================

  // Create compliance checklist
  app.post('/companies/:companyId/checklists', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.object({
        name: z.string(),
        description: z.string().optional(),
        tasks: z.array(z.object({
          taskType: z.enum(['hmrc_filing', 'companies_house_filing', 'vat_return', 'paye_return', 'confirmation_statement', 'accounts_filing', 'tax_payment', 'seis_eis_filing', 'insurance_renewal', 'contract_review', 'data_protection', 'health_safety']),
          title: z.string(),
          description: z.string(),
          order: z.number()
        })),
        assignedTo: z.string().uuid().optional(),
        dueDate: z.string().optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const data = request.body as any

    try {
      const checklist = await complianceService.createComplianceChecklist(companyId, data)
      return reply.status(201).send({
        success: true,
        data: checklist
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to create compliance checklist'
      })
    }
  })

  // Get compliance checklists
  app.get('/companies/:companyId/checklists', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const checklists = await complianceService.getComplianceChecklists(companyId)

    return {
      success: true,
      data: checklists
    }
  })

  // Complete checklist item
  app.post('/checklists/:checklistId/items/:itemId/complete', {
    schema: {
      params: z.object({
        checklistId: z.string().uuid(),
        itemId: z.string()
      }),
      body: z.object({
        notes: z.string().optional()
      })
    }
  }, async (request, reply) => {
    const { checklistId, itemId } = request.params as any
    const { notes } = request.body as any

    try {
      const checklist = await complianceService.completeChecklistItem(checklistId, itemId, notes)
      return {
        success: true,
        data: checklist
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Checklist or item not found'
      })
    }
  })

  // ============================================================================
  // SETTINGS ROUTES
  // ============================================================================

  // Get compliance settings
  app.get('/companies/:companyId/settings', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const settings = await complianceService.getComplianceSettings(companyId)

    if (!settings) {
      return reply.status(404).send({
        success: false,
        error: 'Compliance settings not found'
      })
    }

    return {
      success: true,
      data: settings
    }
  })

  // Update compliance settings
  app.put('/companies/:companyId/settings', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.object({
        autoReminders: z.boolean().optional(),
        reminderDays: z.array(z.number()).optional(),
        emailNotifications: z.boolean().optional(),
        smsNotifications: z.boolean().optional(),
        assignedAccountant: z.string().optional(),
        defaultJurisdiction: z.string().optional(),
        taxYearEnd: z.string().optional(),
        filingPreferences: z.record(z.any()).optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const updates = request.body as any

    try {
      const settings = await complianceService.updateComplianceSettings(companyId, updates)
      return {
        success: true,
        data: settings
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to update compliance settings'
      })
    }
  })

  // ============================================================================
  // ALERTS ROUTES
  // ============================================================================

  // Get compliance alerts
  app.get('/companies/:companyId/alerts', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      querystring: z.object({
        unreadOnly: z.string().transform(val => val === 'true').default(false)
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const { unreadOnly } = request.query as { unreadOnly: boolean }

    const alerts = await complianceService.getComplianceAlerts(companyId, unreadOnly)
    return {
      success: true,
      data: alerts
    }
  })

  // Mark alert as read
  app.put('/alerts/:id/read', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    try {
      await complianceService.markAlertRead(id)
      return {
        success: true,
        message: 'Alert marked as read'
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Alert not found'
      })
    }
  })

  // ============================================================================
  // DASHBOARD & REPORTS
  // ============================================================================

  // Get compliance dashboard data
  app.get('/companies/:companyId/dashboard', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const dashboard = await complianceService.getComplianceDashboardData(companyId)

    return {
      success: true,
      data: dashboard
    }
  })

  // Generate compliance report
  app.post('/companies/:companyId/reports', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.object({
        startDate: z.string(),
        endDate: z.string()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const { startDate, endDate } = request.body as any

    try {
      const report = await complianceService.generateComplianceReport(companyId, {
        start: startDate,
        end: endDate
      })
      return {
        success: true,
        data: report
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to generate compliance report'
      })
    }
  })

  // Get compliance score
  app.get('/companies/:companyId/score', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const score = await complianceService.calculateComplianceScore(companyId)

    return {
      success: true,
      data: { complianceScore: score }
    }
  })

  // ============================================================================
  // TEMPLATES ROUTES
  // ============================================================================

  // Get compliance templates
  app.get('/templates', {
    schema: {
      querystring: z.object({
        category: z.string().optional(),
        jurisdiction: z.string().optional()
      })
    }
  }, async (request, reply) => {
    const { category, jurisdiction } = request.query as any
    const templates = await complianceService.getComplianceTemplates(category, jurisdiction)

    return {
      success: true,
      data: templates
    }
  })

  // Create task from template
  app.post('/companies/:companyId/templates/:templateId/tasks', {
    schema: {
      params: z.object({
        companyId: z.string().uuid(),
        templateId: z.string()
      }),
      body: z.object({
        dueDate: z.string()
      })
    }
  }, async (request, reply) => {
    const { companyId, templateId } = request.params as any
    const { dueDate } = request.body as any

    try {
      const task = await complianceService.createComplianceTaskFromTemplate(companyId, templateId, dueDate)
      return reply.status(201).send({
        success: true,
        data: task
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to create task from template'
      })
    }
  })

  // ============================================================================
  // EXTERNAL INTEGRATION ROUTES
  // ============================================================================

  // Sync with HMRC
  app.post('/companies/:companyId/sync/hmrc', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }

    try {
      await complianceService.syncWithHMRC(companyId)
      return {
        success: true,
        message: 'HMRC sync completed'
      }
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: 'HMRC sync failed'
      })
    }
  })

  // Sync with Companies House
  app.post('/companies/:companyId/sync/companies-house', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }

    try {
      await complianceService.syncWithCompaniesHouse(companyId)
      return {
        success: true,
        message: 'Companies House sync completed'
      }
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: 'Companies House sync failed'
      })
    }
  })

  // Check filing status
  app.get('/filings/:reference/status', {
    schema: {
      params: z.object({
        reference: z.string()
      }),
      querystring: z.object({
        type: z.string()
      })
    }
  }, async (request, reply) => {
    const { reference } = request.params as { reference: string }
    const { type } = request.query as { type: string }

    try {
      const status = await complianceService.checkFilingStatus(reference, type)
      return {
        success: true,
        data: { status }
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to check filing status'
      })
    }
  })

  // ============================================================================
  // AUTOMATED TASKS
  // ============================================================================

  // Generate annual compliance tasks
  app.post('/companies/:companyId/tasks/generate-annual', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.object({
        year: z.number()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const { year } = request.body as any

    try {
      const tasks = await complianceService.generateAnnualComplianceTasks(companyId, year)
      return reply.status(201).send({
        success: true,
        data: tasks
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to generate annual compliance tasks'
      })
    }
  })
}