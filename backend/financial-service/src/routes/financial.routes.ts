import { FastifyInstance } from 'fastify'
import { FinancialServiceImpl } from '../services/financial.service'
import { prisma } from '../utils/prisma'
import { z } from 'zod'

const financialService = new FinancialServiceImpl(prisma)

export async function financialRoutes(app: FastifyInstance) {
  // ============================================================================
  // FINANCIAL PROJECTIONS
  // ============================================================================

  // Create financial projection
  app.post('/companies/:companyId/projections', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.object({
        scenario: z.enum(['conservative', 'base', 'optimistic']),
        period: z.string(),
        revenue: z.number(),
        costs: z.number(),
        assumptions: z.record(z.any()).optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const data = request.body as any

    try {
      const projection = await financialService.createFinancialProjection(companyId, data)
      return reply.status(201).send({
        success: true,
        data: projection
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to create projection'
      })
    }
  })

  // Get financial projections
  app.get('/companies/:companyId/projections', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      querystring: z.object({
        scenario: z.string().optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const { scenario } = request.query as { scenario?: string }

    const projections = await financialService.getFinancialProjections(companyId, scenario)
    return {
      success: true,
      data: projections
    }
  })

  // Generate financial projections
  app.post('/companies/:companyId/projections/generate', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.object({
        scenario: z.string(),
        periods: z.number().min(1).max(24)
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const { scenario, periods } = request.body as any

    try {
      const projections = await financialService.generateFinancialProjection(companyId, scenario, periods)
      return reply.status(201).send({
        success: true,
        data: projections
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to generate projections'
      })
    }
  })

  // ============================================================================
  // TRANSACTIONS
  // ============================================================================

  // Create transaction
  app.post('/companies/:companyId/transactions', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.object({
        date: z.string(),
        description: z.string(),
        amount: z.number(),
        currency: z.string().default('GBP'),
        category: z.string(),
        type: z.enum(['income', 'expense']),
        paymentMethod: z.string().optional(),
        tags: z.array(z.string()).optional(),
        metadata: z.record(z.any()).optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const data = request.body as any

    try {
      const transaction = await financialService.createTransaction(companyId, data)
      return reply.status(201).send({
        success: true,
        data: transaction
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to create transaction'
      })
    }
  })

  // Get transactions
  app.get('/companies/:companyId/transactions', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      querystring: z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        category: z.string().optional(),
        type: z.enum(['income', 'expense']).optional(),
        reconciled: z.string().transform(val => val === 'true').optional(),
        tags: z.string().optional(),
        limit: z.string().transform(Number).default(50),
        offset: z.string().transform(Number).default(0)
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const query = request.query as any

    const filters = {
      startDate: query.startDate,
      endDate: query.endDate,
      category: query.category,
      type: query.type,
      reconciled: query.reconciled,
      tags: query.tags?.split(',')
    }

    const transactions = await financialService.getTransactions(companyId, filters)
    return {
      success: true,
      data: transactions
    }
  })

  // Update transaction
  app.put('/transactions/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: z.object({
        description: z.string().optional(),
        amount: z.number().optional(),
        category: z.string().optional(),
        paymentMethod: z.string().optional(),
        reconciled: z.boolean().optional(),
        tags: z.array(z.string()).optional()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const updates = request.body as any

    try {
      const transaction = await financialService.updateTransaction(id, updates)
      return {
        success: true,
        data: transaction
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Transaction not found'
      })
    }
  })

  // Delete transaction
  app.delete('/transactions/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    try {
      await financialService.deleteTransaction(id)
      return {
        success: true,
        message: 'Transaction deleted successfully'
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Transaction not found'
      })
    }
  })

  // Categorize transaction
  app.put('/transactions/:id/categorize', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: z.object({
        category: z.string()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { category } = request.body as any

    try {
      const transaction = await financialService.categorizeTransaction(id, category)
      return {
        success: true,
        data: transaction
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Transaction not found'
      })
    }
  })

  // Reconcile transaction
  app.put('/transactions/:id/reconcile', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    try {
      const transaction = await financialService.reconcileTransaction(id)
      return {
        success: true,
        data: transaction
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Transaction not found'
      })
    }
  })

  // ============================================================================
  // BUDGETS
  // ============================================================================

  // Create budget
  app.post('/companies/:companyId/budgets', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.object({
        name: z.string(),
        period: z.string(),
        categories: z.array(z.object({
          category: z.string(),
          budgetedAmount: z.number(),
          subcategories: z.array(z.object({
            subcategory: z.string(),
            budgetedAmount: z.number()
          })).optional()
        }))
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const data = request.body as any

    try {
      const budget = await financialService.createBudget(companyId, data)
      return reply.status(201).send({
        success: true,
        data: budget
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to create budget'
      })
    }
  })

  // Get budgets
  app.get('/companies/:companyId/budgets', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const budgets = await financialService.getBudgets(companyId)

    return {
      success: true,
      data: budgets
    }
  })

  // Get budget variance
  app.get('/companies/:companyId/budgets/:budgetId/variance', {
    schema: {
      params: z.object({
        companyId: z.string().uuid(),
        budgetId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId, budgetId } = request.params as any

    try {
      const budget = await financialService.getBudgetVariance(companyId, budgetId)
      return {
        success: true,
        data: budget
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Budget not found'
      })
    }
  })

  // ============================================================================
  // INVOICES
  // ============================================================================

  // Create invoice
  app.post('/companies/:companyId/invoices', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.object({
        clientName: z.string(),
        clientEmail: z.string().email().optional(),
        issueDate: z.string(),
        dueDate: z.string(),
        items: z.array(z.object({
          description: z.string(),
          quantity: z.number(),
          unitPrice: z.number(),
          taxRate: z.number().optional()
        })),
        taxRate: z.number(),
        currency: z.string().default('GBP'),
        paymentTerms: z.string(),
        notes: z.string().optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const data = request.body as any

    try {
      const invoice = await financialService.createInvoice(companyId, data)
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
      }),
      querystring: z.object({
        status: z.string().optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const { status } = request.query as { status?: string }

    const invoices = await financialService.getInvoices(companyId, status)
    return {
      success: true,
      data: invoices
    }
  })

  // Send invoice
  app.post('/invoices/:id/send', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    try {
      const invoice = await financialService.sendInvoice(id)
      return {
        success: true,
        data: invoice
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Invoice not found'
      })
    }
  })

  // Mark invoice as paid
  app.post('/invoices/:id/pay', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: z.object({
        paymentDate: z.string().optional()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { paymentDate } = request.body as any

    try {
      const invoice = await financialService.markInvoicePaid(id, paymentDate)
      return {
        success: true,
        data: invoice
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Invoice not found'
      })
    }
  })

  // ============================================================================
  // EXPENSES
  // ============================================================================

  // Create expense
  app.post('/companies/:companyId/expenses', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.object({
        category: z.string(),
        subcategory: z.string().optional(),
        amount: z.number(),
        currency: z.string().default('GBP'),
        date: z.string(),
        description: z.string(),
        vendor: z.string().optional(),
        paymentMethod: z.string(),
        tags: z.array(z.string()).optional(),
        taxDeductible: z.boolean().optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const data = request.body as any

    try {
      const expense = await financialService.createExpense(companyId, data)
      return reply.status(201).send({
        success: true,
        data: expense
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to create expense'
      })
    }
  })

  // Get expenses
  app.get('/companies/:companyId/expenses', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      querystring: z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        category: z.string().optional(),
        paymentMethod: z.string().optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const query = request.query as any

    const filters = {
      startDate: query.startDate,
      endDate: query.endDate,
      category: query.category,
      paymentMethod: query.paymentMethod
    }

    const expenses = await financialService.getExpenses(companyId, filters)
    return {
      success: true,
      data: expenses
    }
  })

  // Approve expense
  app.post('/expenses/:id/approve', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: z.object({
        approverId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { approverId } = request.body as any

    try {
      const expense = await financialService.approveExpense(id, approverId)
      return {
        success: true,
        data: expense
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Expense not found'
      })
    }
  })

  // ============================================================================
  // FINANCIAL GOALS
  // ============================================================================

  // Create financial goal
  app.post('/companies/:companyId/goals', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.object({
        title: z.string(),
        description: z.string().optional(),
        type: z.enum(['revenue', 'profit', 'cash_flow', 'valuation', 'headcount', 'custom']),
        targetValue: z.number(),
        unit: z.string(),
        deadline: z.string(),
        milestones: z.array(z.object({
          title: z.string(),
          targetValue: z.number(),
          deadline: z.string()
        })).optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const data = request.body as any

    try {
      const goal = await financialService.createFinancialGoal(companyId, data)
      return reply.status(201).send({
        success: true,
        data: goal
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to create goal'
      })
    }
  })

  // Get financial goals
  app.get('/companies/:companyId/goals', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const goals = await financialService.getFinancialGoals(companyId)

    return {
      success: true,
      data: goals
    }
  })

  // Update goal progress
  app.put('/goals/:id/progress', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: z.object({
        progress: z.number().min(0).max(100)
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { progress } = request.body as any

    try {
      const goal = await financialService.updateGoalProgress(id, progress)
      return {
        success: true,
        data: goal
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Goal not found'
      })
    }
  })

  // ============================================================================
  // DASHBOARD & ANALYTICS
  // ============================================================================

  // Get financial dashboard data
  app.get('/companies/:companyId/dashboard', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const dashboard = await financialService.getFinancialDashboardData(companyId)

    return {
      success: true,
      data: dashboard
    }
  })

  // Generate financial report
  app.post('/companies/:companyId/reports', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.object({
        type: z.string(),
        startDate: z.string(),
        endDate: z.string()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const { type, startDate, endDate } = request.body as any

    try {
      const report = await financialService.generateFinancialReport(companyId, type, {
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
        error: 'Failed to generate report'
      })
    }
  })

  // Get financial alerts
  app.get('/companies/:companyId/alerts', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const alerts = await financialService.getFinancialAlerts(companyId)

    return {
      success: true,
      data: alerts
    }
  })

  // ============================================================================
  // EXPORT & INTEGRATIONS
  // ============================================================================

  // Export financial data
  app.post('/companies/:companyId/export', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.object({
        type: z.enum(['transactions', 'budget', 'projections', 'report']),
        format: z.enum(['csv', 'xlsx', 'pdf']),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        filters: z.record(z.any()).optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const exportRequest = request.body as any

    try {
      const fileUrl = await financialService.exportFinancialData(companyId, exportRequest)
      return {
        success: true,
        data: { fileUrl }
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Export failed'
      })
    }
  })

  // Connect financial integration
  app.post('/companies/:companyId/integrations', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.object({
        provider: z.enum(['xero', 'quickbooks', 'stripe', 'bank', 'paypal']),
        credentials: z.record(z.any())
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const { provider, credentials } = request.body as any

    try {
      const integration = await financialService.connectFinancialIntegration(companyId, provider, credentials)
      return reply.status(201).send({
        success: true,
        data: integration
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Integration failed'
      })
    }
  })

  // Sync financial data
  app.post('/companies/:companyId/integrations/:integrationId/sync', {
    schema: {
      params: z.object({
        companyId: z.string().uuid(),
        integrationId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId, integrationId } = request.params as any

    try {
      await financialService.syncFinancialData(companyId, integrationId)
      return {
        success: true,
        message: 'Sync completed successfully'
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Sync failed'
      })
    }
  })
}