import { PrismaClient } from '@prisma/client'
import {
  FinancialProjection,
  Transaction,
  Budget,
  FinancialStatement,
  FinancialMetric,
  FinancialAnalysis,
  CashFlowProjection,
  Invoice,
  Expense,
  FinancialGoal,
  FinancialIntegration,
  CreateFinancialProjectionRequest,
  UpdateFinancialProjectionRequest,
  CreateTransactionRequest,
  CreateBudgetRequest,
  CreateInvoiceRequest,
  CreateExpenseRequest,
  CreateFinancialGoalRequest,
  FinancialDashboardData,
  FinancialService,
  TransactionFilters,
  ExpenseFilters
} from '../types/financial'

export class FinancialServiceImpl implements FinancialService {
  constructor(private prisma: PrismaClient) {}

  // ============================================================================
  // FINANCIAL PROJECTIONS
  // ============================================================================

  async createFinancialProjection(companyId: string, data: CreateFinancialProjectionRequest): Promise<FinancialProjection> {
    const projection = await this.prisma.financialProjection.create({
      data: {
        companyId,
        ...data,
        grossProfit: data.revenue - data.costs,
        netProfit: data.revenue - data.costs, // Simplified calculation
        cashFlow: data.revenue - data.costs,
        headcount: 1
      }
    })

    return {
      id: projection.id,
      companyId: projection.companyId,
      scenario: projection.scenario,
      period: projection.period,
      revenue: projection.revenue,
      costs: projection.costs,
      grossProfit: projection.grossProfit,
      netProfit: projection.netProfit,
      cashFlow: projection.cashFlow,
      headcount: projection.headcount,
      assumptions: projection.assumptions as any,
      createdAt: projection.createdAt.toISOString(),
      updatedAt: projection.updatedAt.toISOString()
    }
  }

  async getFinancialProjections(companyId: string, scenario?: string): Promise<FinancialProjection[]> {
    const where: any = { companyId }
    if (scenario) where.scenario = scenario

    const projections = await this.prisma.financialProjection.findMany({
      where,
      orderBy: { period: 'asc' }
    })

    return projections.map(p => ({
      id: p.id,
      companyId: p.companyId,
      scenario: p.scenario,
      period: p.period,
      revenue: p.revenue,
      costs: p.costs,
      grossProfit: p.grossProfit,
      netProfit: p.netProfit,
      cashFlow: p.cashFlow,
      headcount: p.headcount,
      assumptions: p.assumptions as any,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString()
    }))
  }

  async updateFinancialProjection(id: string, updates: UpdateFinancialProjectionRequest): Promise<FinancialProjection> {
    const updateData: any = { ...updates }
    if (updates.revenue !== undefined || updates.costs !== undefined) {
      const projection = await this.prisma.financialProjection.findUnique({ where: { id } })
      if (projection) {
        const revenue = updates.revenue ?? projection.revenue
        const costs = updates.costs ?? projection.costs
        updateData.grossProfit = revenue - costs
        updateData.netProfit = revenue - costs
        updateData.cashFlow = revenue - costs
      }
    }

    const projection = await this.prisma.financialProjection.update({
      where: { id },
      data: updateData
    })

    return {
      id: projection.id,
      companyId: projection.companyId,
      scenario: projection.scenario,
      period: projection.period,
      revenue: projection.revenue,
      costs: projection.costs,
      grossProfit: projection.grossProfit,
      netProfit: projection.netProfit,
      cashFlow: projection.cashFlow,
      headcount: projection.headcount,
      assumptions: projection.assumptions as any,
      createdAt: projection.createdAt.toISOString(),
      updatedAt: projection.updatedAt.toISOString()
    }
  }

  async deleteFinancialProjection(id: string): Promise<void> {
    await this.prisma.financialProjection.delete({ where: { id } })
  }

  async generateFinancialProjection(companyId: string, scenario: string, periods: number): Promise<FinancialProjection[]> {
    const projections: FinancialProjection[] = []
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() + 1) // Start from next month

    for (let i = 0; i < periods; i++) {
      const periodDate = new Date(startDate)
      periodDate.setMonth(startDate.getMonth() + i)
      const period = periodDate.toISOString().slice(0, 7) // YYYY-MM

      // Generate realistic growth projections
      const growthRate = scenario === 'conservative' ? 0.05 : scenario === 'optimistic' ? 0.15 : 0.10
      const baseRevenue = 100000 * Math.pow(1 + growthRate, i)
      const baseCosts = baseRevenue * 0.7

      const projection = await this.createFinancialProjection(companyId, {
        scenario: scenario as any,
        period,
        revenue: Math.round(baseRevenue),
        costs: Math.round(baseCosts)
      })

      projections.push(projection)
    }

    return projections
  }

  // ============================================================================
  // TRANSACTIONS
  // ============================================================================

  async createTransaction(companyId: string, data: CreateTransactionRequest): Promise<Transaction> {
    const transaction = await this.prisma.transaction.create({
      data: {
        companyId,
        ...data,
        date: new Date(data.date),
        tags: data.tags || [],
        attachments: [],
        metadata: data.metadata || {}
      }
    })

    return {
      id: transaction.id,
      companyId: transaction.companyId,
      date: transaction.date.toISOString(),
      description: transaction.description,
      amount: transaction.amount,
      currency: transaction.currency,
      category: transaction.category,
      type: transaction.type,
      paymentMethod: transaction.paymentMethod || undefined,
      reconciled: transaction.reconciled,
      tags: transaction.tags,
      attachments: transaction.attachments,
      metadata: transaction.metadata as any,
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString()
    }
  }

  async getTransactions(companyId: string, filters?: TransactionFilters): Promise<Transaction[]> {
    const where: any = { companyId }

    if (filters) {
      if (filters.startDate) where.date = { ...where.date, gte: new Date(filters.startDate) }
      if (filters.endDate) where.date = { ...where.date, lte: new Date(filters.endDate) }
      if (filters.category) where.category = filters.category
      if (filters.type) where.type = filters.type
      if (filters.reconciled !== undefined) where.reconciled = filters.reconciled
      if (filters.tags?.length) where.tags = { hasSome: filters.tags }
    }

    const transactions = await this.prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' }
    })

    return transactions.map(t => ({
      id: t.id,
      companyId: t.companyId,
      date: t.date.toISOString(),
      description: t.description,
      amount: t.amount,
      currency: t.currency,
      category: t.category,
      type: t.type,
      paymentMethod: t.paymentMethod || undefined,
      reconciled: t.reconciled,
      tags: t.tags,
      attachments: t.attachments,
      metadata: t.metadata as any,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString()
    }))
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction> {
    const updateData: any = { ...updates }
    if (updates.date) updateData.date = new Date(updates.date)

    const transaction = await this.prisma.transaction.update({
      where: { id },
      data: updateData
    })

    return {
      id: transaction.id,
      companyId: transaction.companyId,
      date: transaction.date.toISOString(),
      description: transaction.description,
      amount: transaction.amount,
      currency: transaction.currency,
      category: transaction.category,
      type: transaction.type,
      paymentMethod: transaction.paymentMethod || undefined,
      reconciled: transaction.reconciled,
      tags: transaction.tags,
      attachments: transaction.attachments,
      metadata: transaction.metadata as any,
      createdAt: transaction.createdAt.toISOString(),
      updatedAt: transaction.updatedAt.toISOString()
    }
  }

  async deleteTransaction(id: string): Promise<void> {
    await this.prisma.transaction.delete({ where: { id } })
  }

  async categorizeTransaction(id: string, category: string): Promise<Transaction> {
    return this.updateTransaction(id, { category })
  }

  async reconcileTransaction(id: string): Promise<Transaction> {
    return this.updateTransaction(id, { reconciled: true })
  }

  // ============================================================================
  // BUDGETS
  // ============================================================================

  async createBudget(companyId: string, data: CreateBudgetRequest): Promise<Budget> {
    const totalBudgeted = data.categories.reduce((sum, cat) => sum + cat.budgetedAmount, 0)

    const budget = await this.prisma.budget.create({
      data: {
        companyId,
        name: data.name,
        period: data.period,
        categories: data.categories.map(cat => ({
          category: cat.category,
          budgetedAmount: cat.budgetedAmount,
          actualAmount: 0,
          variance: -cat.budgetedAmount,
          variancePercentage: -100,
          subcategories: cat.subcategories || []
        })),
        totalBudgeted,
        totalActual: 0,
        variance: -totalBudgeted,
        status: 'draft',
        createdBy: 'system' // Would come from auth context
      }
    })

    return {
      id: budget.id,
      companyId: budget.companyId,
      name: budget.name,
      period: budget.period,
      categories: budget.categories as any,
      totalBudgeted: budget.totalBudgeted,
      totalActual: budget.totalActual,
      variance: budget.variance,
      status: budget.status,
      createdBy: budget.createdBy,
      approvedBy: budget.approvedBy || undefined,
      createdAt: budget.createdAt.toISOString(),
      updatedAt: budget.updatedAt.toISOString()
    }
  }

  async getBudgets(companyId: string): Promise<Budget[]> {
    const budgets = await this.prisma.budget.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' }
    })

    return budgets.map(b => ({
      id: b.id,
      companyId: b.companyId,
      name: b.name,
      period: b.period,
      categories: b.categories as any,
      totalBudgeted: b.totalBudgeted,
      totalActual: b.totalActual,
      variance: b.variance,
      status: b.status,
      createdBy: b.createdBy,
      approvedBy: b.approvedBy || undefined,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString()
    }))
  }

  async updateBudget(id: string, updates: Partial<Budget>): Promise<Budget> {
    const budget = await this.prisma.budget.update({
      where: { id },
      data: updates
    })

    return {
      id: budget.id,
      companyId: budget.companyId,
      name: budget.name,
      period: budget.period,
      categories: budget.categories as any,
      totalBudgeted: budget.totalBudgeted,
      totalActual: budget.totalActual,
      variance: budget.variance,
      status: budget.status,
      createdBy: budget.createdBy,
      approvedBy: budget.approvedBy || undefined,
      createdAt: budget.createdAt.toISOString(),
      updatedAt: budget.updatedAt.toISOString()
    }
  }

  async deleteBudget(id: string): Promise<void> {
    await this.prisma.budget.delete({ where: { id } })
  }

  async getBudgetVariance(companyId: string, budgetId: string): Promise<Budget> {
    // Calculate actual spending from transactions
    const budget = await this.prisma.budget.findUnique({ where: { id: budgetId } })
    if (!budget) throw new Error('Budget not found')

    const periodStart = new Date(budget.period + '-01')
    const periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0)

    const transactions = await this.prisma.transaction.findMany({
      where: {
        companyId,
        date: { gte: periodStart, lte: periodEnd },
        type: 'expense'
      }
    })

    // Update budget with actuals (simplified implementation)
    const updatedCategories = budget.categories.map((cat: any) => {
      const actualAmount = transactions
        .filter(t => t.category === cat.category)
        .reduce((sum, t) => sum + t.amount, 0)

      return {
        ...cat,
        actualAmount,
        variance: cat.budgetedAmount - actualAmount,
        variancePercentage: cat.budgetedAmount > 0 ? ((actualAmount - cat.budgetedAmount) / cat.budgetedAmount) * 100 : 0
      }
    })

    const totalActual = updatedCategories.reduce((sum, cat) => sum + cat.actualAmount, 0)
    const totalVariance = budget.totalBudgeted - totalActual

    return this.updateBudget(budgetId, {
      categories: updatedCategories,
      totalActual,
      variance: totalVariance
    })
  }

  // ============================================================================
  // FINANCIAL STATEMENTS
  // ============================================================================

  async generateFinancialStatement(companyId: string, type: string, period: string): Promise<FinancialStatement> {
    // Generate mock financial statement
    const statement = await this.prisma.financialStatement.create({
      data: {
        companyId,
        type: type as any,
        period,
        currency: 'GBP',
        data: {
          assets: 100000,
          liabilities: 50000,
          equity: 50000,
          revenue: 150000,
          expenses: 120000,
          netIncome: 30000
        },
        status: 'draft'
      }
    })

    return {
      id: statement.id,
      companyId: statement.companyId,
      type: statement.type,
      period: statement.period,
      currency: statement.currency,
      data: statement.data as any,
      status: statement.status,
      filedAt: statement.filedAt?.toISOString(),
      createdAt: statement.createdAt.toISOString(),
      updatedAt: statement.updatedAt.toISOString()
    }
  }

  async getFinancialStatements(companyId: string, type?: string): Promise<FinancialStatement[]> {
    const where: any = { companyId }
    if (type) where.type = type

    const statements = await this.prisma.financialStatement.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return statements.map(s => ({
      id: s.id,
      companyId: s.companyId,
      type: s.type,
      period: s.period,
      currency: s.currency,
      data: s.data as any,
      status: s.status,
      filedAt: s.filedAt?.toISOString(),
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString()
    }))
  }

  // ============================================================================
  // ANALYSIS & METRICS
  // ============================================================================

  async generateFinancialAnalysis(companyId: string, type: string, period: string): Promise<FinancialAnalysis> {
    // Generate mock analysis
    const analysis = await this.prisma.financialAnalysis.create({
      data: {
        companyId,
        type: type as any,
        period,
        metrics: {
          profitability: 0.20,
          liquidity: 2.0,
          efficiency: 1.5,
          leverage: 0.5,
          growth: 0.15
        },
        insights: [
          'Strong profitability ratio indicates good operational efficiency',
          'Healthy liquidity position provides good financial stability',
          'Growth rate is above industry average'
        ],
        recommendations: [
          'Consider increasing marketing spend to accelerate growth',
          'Optimize inventory management to improve efficiency ratio',
          'Explore additional funding options to support expansion'
        ],
        riskLevel: 'low'
      }
    })

    return {
      id: analysis.id,
      companyId: analysis.companyId,
      type: analysis.type,
      period: analysis.period,
      metrics: analysis.metrics as any,
      insights: analysis.insights,
      recommendations: analysis.recommendations,
      riskLevel: analysis.riskLevel,
      createdAt: analysis.createdAt.toISOString(),
      updatedAt: analysis.updatedAt.toISOString()
    }
  }

  async getFinancialMetrics(companyId: string, period?: string): Promise<FinancialMetric[]> {
    const where: any = { companyId }
    if (period) where.period = period

    const metrics = await this.prisma.financialMetric.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return metrics.map(m => ({
      id: m.id,
      companyId: m.companyId,
      metric: m.metric,
      value: m.value,
      unit: m.unit,
      period: m.period,
      benchmark: m.benchmark || undefined,
      trend: m.trend,
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString()
    }))
  }

  async calculateFinancialRatios(companyId: string, period: string): Promise<Record<string, number>> {
    // Mock ratio calculations
    return {
      'gross_margin': 0.25,
      'net_margin': 0.15,
      'return_on_assets': 0.12,
      'return_on_equity': 0.18,
      'current_ratio': 2.1,
      'quick_ratio': 1.5,
      'debt_to_equity': 0.3,
      'asset_turnover': 1.8
    }
  }

  // ============================================================================
  // CASH FLOW PROJECTIONS
  // ============================================================================

  async createCashFlowProjection(companyId: string, scenario: string, startDate: string, endDate: string): Promise<CashFlowProjection> {
    // Generate monthly cash flow projections
    const start = new Date(startDate)
    const end = new Date(endDate)
    const months = []

    let balance = 100000 // Starting balance
    for (let d = new Date(start); d <= end; d.setMonth(d.getMonth() + 1)) {
      const inflows = Math.random() * 50000 + 20000
      const outflows = Math.random() * 40000 + 15000
      const netFlow = inflows - outflows
      balance += netFlow

      months.push({
        date: d.toISOString().slice(0, 10),
        inflows,
        outflows,
        netFlow,
        balance,
        breakdown: {
          operating: inflows * 0.8,
          investing: inflows * 0.1,
          financing: inflows * 0.1
        }
      })
    }

    const projection = await this.prisma.cashFlowProjection.create({
      data: {
        companyId,
        scenario: scenario as any,
        startDate,
        endDate,
        projections: months,
        assumptions: { scenario },
        totalInflow: months.reduce((sum, m) => sum + m.inflows, 0),
        totalOutflow: months.reduce((sum, m) => sum + m.outflows, 0),
        netCashFlow: months.reduce((sum, m) => sum + m.netFlow, 0),
        endingBalance: balance
      }
    })

    return {
      id: projection.id,
      companyId: projection.companyId,
      scenario: projection.scenario,
      startDate: projection.startDate,
      endDate: projection.endDate,
      projections: projection.projections as any,
      assumptions: projection.assumptions as any,
      totalInflow: projection.totalInflow,
      totalOutflow: projection.totalOutflow,
      netCashFlow: projection.netCashFlow,
      endingBalance: projection.endingBalance,
      createdAt: projection.createdAt.toISOString(),
      updatedAt: projection.updatedAt.toISOString()
    }
  }

  async getCashFlowProjections(companyId: string): Promise<CashFlowProjection[]> {
    const projections = await this.prisma.cashFlowProjection.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' }
    })

    return projections.map(p => ({
      id: p.id,
      companyId: p.companyId,
      scenario: p.scenario,
      startDate: p.startDate,
      endDate: p.endDate,
      projections: p.projections as any,
      assumptions: p.assumptions as any,
      totalInflow: p.totalInflow,
      totalOutflow: p.totalOutflow,
      netCashFlow: p.netCashFlow,
      endingBalance: p.endingBalance,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString()
    }))
  }

  // ============================================================================
  // INVOICES
  // ============================================================================

  async createInvoice(companyId: string, data: CreateInvoiceRequest): Promise<Invoice> {
    const subtotal = data.items.reduce((sum, item) => sum + item.amount, 0)
    const taxAmount = subtotal * (data.taxRate / 100)
    const total = subtotal + taxAmount

    const invoiceNumber = `INV-${Date.now()}`

    const invoice = await this.prisma.invoice.create({
      data: {
        companyId,
        invoiceNumber,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        issueDate: new Date(data.issueDate),
        dueDate: new Date(data.dueDate),
        items: data.items,
        subtotal,
        taxRate: data.taxRate,
        taxAmount,
        total,
        currency: data.currency,
        status: 'draft',
        paymentTerms: data.paymentTerms,
        notes: data.notes
      }
    })

    return {
      id: invoice.id,
      companyId: invoice.companyId,
      invoiceNumber: invoice.invoiceNumber,
      clientId: invoice.clientId || undefined,
      clientName: invoice.clientName,
      clientEmail: invoice.clientEmail || undefined,
      issueDate: invoice.issueDate.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
      items: invoice.items as any,
      subtotal: invoice.subtotal,
      taxRate: invoice.taxRate,
      taxAmount: invoice.taxAmount,
      total: invoice.total,
      currency: invoice.currency,
      status: invoice.status,
      paymentTerms: invoice.paymentTerms,
      notes: invoice.notes || undefined,
      sentAt: invoice.sentAt?.toISOString(),
      paidAt: invoice.paidAt?.toISOString(),
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString()
    }
  }

  async getInvoices(companyId: string, status?: string): Promise<Invoice[]> {
    const where: any = { companyId }
    if (status) where.status = status

    const invoices = await this.prisma.invoice.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return invoices.map(i => ({
      id: i.id,
      companyId: i.companyId,
      invoiceNumber: i.invoiceNumber,
      clientId: i.clientId || undefined,
      clientName: i.clientName,
      clientEmail: i.clientEmail || undefined,
      issueDate: i.issueDate.toISOString(),
      dueDate: i.dueDate.toISOString(),
      items: i.items as any,
      subtotal: i.subtotal,
      taxRate: i.taxRate,
      taxAmount: i.taxAmount,
      total: i.total,
      currency: i.currency,
      status: i.status,
      paymentTerms: i.paymentTerms,
      notes: i.notes || undefined,
      sentAt: i.sentAt?.toISOString(),
      paidAt: i.paidAt?.toISOString(),
      createdAt: i.createdAt.toISOString(),
      updatedAt: i.updatedAt.toISOString()
    }))
  }

  async updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice> {
    const updateData: any = { ...updates }
    if (updates.issueDate) updateData.issueDate = new Date(updates.issueDate)
    if (updates.dueDate) updateData.dueDate = new Date(updates.dueDate)
    if (updates.sentAt) updateData.sentAt = new Date(updates.sentAt)
    if (updates.paidAt) updateData.paidAt = new Date(updates.paidAt)

    const invoice = await this.prisma.invoice.update({
      where: { id },
      data: updateData
    })

    return {
      id: invoice.id,
      companyId: invoice.companyId,
      invoiceNumber: invoice.invoiceNumber,
      clientId: invoice.clientId || undefined,
      clientName: invoice.clientName,
      clientEmail: invoice.clientEmail || undefined,
      issueDate: invoice.issueDate.toISOString(),
      dueDate: invoice.dueDate.toISOString(),
      items: invoice.items as any,
      subtotal: invoice.subtotal,
      taxRate: invoice.taxRate,
      taxAmount: invoice.taxAmount,
      total: invoice.total,
      currency: invoice.currency,
      status: invoice.status,
      paymentTerms: invoice.paymentTerms,
      notes: invoice.notes || undefined,
      sentAt: invoice.sentAt?.toISOString(),
      paidAt: invoice.paidAt?.toISOString(),
      createdAt: invoice.createdAt.toISOString(),
      updatedAt: invoice.updatedAt.toISOString()
    }
  }

  async sendInvoice(id: string): Promise<Invoice> {
    return this.updateInvoice(id, {
      status: 'sent',
      sentAt: new Date().toISOString()
    })
  }

  async markInvoicePaid(id: string, paymentDate?: string): Promise<Invoice> {
    return this.updateInvoice(id, {
      status: 'paid',
      paidAt: paymentDate || new Date().toISOString()
    })
  }

  // ============================================================================
  // EXPENSES
  // ============================================================================

  async createExpense(companyId: string, data: CreateExpenseRequest): Promise<Expense> {
    const expense = await this.prisma.expense.create({
      data: {
        companyId,
        ...data,
        date: new Date(data.date),
        tags: data.tags || [],
        taxDeductible: data.taxDeductible ?? true
      }
    })

    return {
      id: expense.id,
      companyId: expense.companyId,
      category: expense.category,
      subcategory: expense.subcategory || undefined,
      amount: expense.amount,
      currency: expense.currency,
      date: expense.date.toISOString(),
      description: expense.description,
      vendor: expense.vendor || undefined,
      paymentMethod: expense.paymentMethod,
      receipt: expense.receipt || undefined,
      tags: expense.tags,
      taxDeductible: expense.taxDeductible,
      approvedBy: expense.approvedBy || undefined,
      approvedAt: expense.approvedAt?.toISOString(),
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString()
    }
  }

  async getExpenses(companyId: string, filters?: ExpenseFilters): Promise<Expense[]> {
    const where: any = { companyId }

    if (filters) {
      if (filters.startDate) where.date = { ...where.date, gte: new Date(filters.startDate) }
      if (filters.endDate) where.date = { ...where.date, lte: new Date(filters.endDate) }
      if (filters.category) where.category = filters.category
      if (filters.paymentMethod) where.paymentMethod = filters.paymentMethod
      // Status filtering would need additional logic for approval status
    }

    const expenses = await this.prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' }
    })

    return expenses.map(e => ({
      id: e.id,
      companyId: e.companyId,
      category: e.category,
      subcategory: e.subcategory || undefined,
      amount: e.amount,
      currency: e.currency,
      date: e.date.toISOString(),
      description: e.description,
      vendor: e.vendor || undefined,
      paymentMethod: e.paymentMethod,
      receipt: e.receipt || undefined,
      tags: e.tags,
      taxDeductible: e.taxDeductible,
      approvedBy: e.approvedBy || undefined,
      approvedAt: e.approvedAt?.toISOString(),
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString()
    }))
  }

  async updateExpense(id: string, updates: Partial<Expense>): Promise<Expense> {
    const updateData: any = { ...updates }
    if (updates.date) updateData.date = new Date(updates.date)
    if (updates.approvedAt) updateData.approvedAt = new Date(updates.approvedAt)

    const expense = await this.prisma.expense.update({
      where: { id },
      data: updateData
    })

    return {
      id: expense.id,
      companyId: expense.companyId,
      category: expense.category,
      subcategory: expense.subcategory || undefined,
      amount: expense.amount,
      currency: expense.currency,
      date: expense.date.toISOString(),
      description: expense.description,
      vendor: expense.vendor || undefined,
      paymentMethod: expense.paymentMethod,
      receipt: expense.receipt || undefined,
      tags: expense.tags,
      taxDeductible: expense.taxDeductible,
      approvedBy: expense.approvedBy || undefined,
      approvedAt: expense.approvedAt?.toISOString(),
      createdAt: expense.createdAt.toISOString(),
      updatedAt: expense.updatedAt.toISOString()
    }
  }

  async approveExpense(id: string, approverId: string): Promise<Expense> {
    return this.updateExpense(id, {
      approvedBy: approverId,
      approvedAt: new Date().toISOString()
    })
  }

  // ============================================================================
  // FINANCIAL GOALS
  // ============================================================================

  async createFinancialGoal(companyId: string, data: CreateFinancialGoalRequest): Promise<FinancialGoal> {
    const goal = await this.prisma.financialGoal.create({
      data: {
        companyId,
        ...data,
        currentValue: 0,
        progress: 0,
        status: 'active',
        deadline: new Date(data.deadline),
        milestones: data.milestones?.map(m => ({
          title: m.title,
          targetValue: m.targetValue,
          deadline: new Date(m.deadline),
          status: 'pending'
        })) || []
      }
    })

    return {
      id: goal.id,
      companyId: goal.companyId,
      title: goal.title,
      description: goal.description || undefined,
      type: goal.type,
      targetValue: goal.targetValue,
      currentValue: goal.currentValue,
      unit: goal.unit,
      deadline: goal.deadline.toISOString(),
      status: goal.status,
      progress: goal.progress,
      milestones: goal.milestones as any,
      createdAt: goal.createdAt.toISOString(),
      updatedAt: goal.updatedAt.toISOString()
    }
  }

  async getFinancialGoals(companyId: string): Promise<FinancialGoal[]> {
    const goals = await this.prisma.financialGoal.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' }
    })

    return goals.map(g => ({
      id: g.id,
      companyId: g.companyId,
      title: g.title,
      description: g.description || undefined,
      type: g.type,
      targetValue: g.targetValue,
      currentValue: g.currentValue,
      unit: g.unit,
      deadline: g.deadline.toISOString(),
      status: g.status,
      progress: g.progress,
      milestones: g.milestones as any,
      createdAt: g.createdAt.toISOString(),
      updatedAt: g.updatedAt.toISOString()
    }))
  }

  async updateFinancialGoal(id: string, updates: Partial<FinancialGoal>): Promise<FinancialGoal> {
    const updateData: any = { ...updates }
    if (updates.deadline) updateData.deadline = new Date(updates.deadline)

    const goal = await this.prisma.financialGoal.update({
      where: { id },
      data: updateData
    })

    return {
      id: goal.id,
      companyId: goal.companyId,
      title: goal.title,
      description: goal.description || undefined,
      type: goal.type,
      targetValue: goal.targetValue,
      currentValue: goal.currentValue,
      unit: goal.unit,
      deadline: goal.deadline.toISOString(),
      status: goal.status,
      progress: goal.progress,
      milestones: goal.milestones as any,
      createdAt: goal.createdAt.toISOString(),
      updatedAt: goal.updatedAt.toISOString()
    }
  }

  async updateGoalProgress(id: string, progress: number): Promise<FinancialGoal> {
    const goal = await this.prisma.financialGoal.findUnique({ where: { id } })
    if (!goal) throw new Error('Goal not found')

    return this.updateFinancialGoal(id, {
      progress,
      currentValue: (goal.targetValue * progress) / 100
    })
  }

  // ============================================================================
  // DASHBOARD & REPORTS
  // ============================================================================

  async generateFinancialReport(companyId: string, type: string, period: { start: string; end: string }): Promise<any> {
    // Generate mock financial report
    const start = new Date(period.start)
    const end = new Date(period.end)

    return {
      id: `report-${Date.now()}`,
      companyId,
      type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
      period,
      summary: {
        totalRevenue: 150000,
        totalExpenses: 120000,
        netProfit: 30000,
        cashFlow: 25000,
        assets: 200000,
        liabilities: 80000,
        equity: 120000
      },
      charts: [],
      insights: [
        'Revenue increased by 15% compared to previous period',
        'Expense ratio improved by 3%',
        'Cash flow remains healthy'
      ],
      generatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  async getFinancialDashboardData(companyId: string): Promise<FinancialDashboardData> {
    // Mock dashboard data
    return {
      summary: {
        totalRevenue: 150000,
        totalExpenses: 120000,
        netProfit: 30000,
        cashBalance: 75000,
        monthlyBurnRate: 25000,
        runwayMonths: 18
      },
      recentTransactions: [],
      upcomingExpenses: [],
      budgetVariance: [],
      projections: [],
      goals: [],
      alerts: []
    }
  }

  // ============================================================================
  // INTEGRATIONS
  // ============================================================================

  async connectFinancialIntegration(companyId: string, provider: string, credentials: Record<string, any>): Promise<FinancialIntegration> {
    const integration = await this.prisma.financialIntegration.create({
      data: {
        companyId,
        provider: provider as any,
        accountId: credentials.accountId,
        accessToken: credentials.accessToken,
        refreshToken: credentials.refreshToken,
        tokenExpiresAt: credentials.tokenExpiresAt ? new Date(credentials.tokenExpiresAt) : undefined,
        settings: credentials.settings || {}
      }
    })

    return {
      id: integration.id,
      companyId: integration.companyId,
      provider: integration.provider,
      accountId: integration.accountId,
      accessToken: integration.accessToken,
      refreshToken: integration.refreshToken || undefined,
      tokenExpiresAt: integration.tokenExpiresAt?.toISOString(),
      lastSyncAt: integration.lastSyncAt?.toISOString(),
      syncStatus: integration.syncStatus,
      settings: integration.settings as any,
      createdAt: integration.createdAt.toISOString(),
      updatedAt: integration.updatedAt.toISOString()
    }
  }

  async syncFinancialData(companyId: string, integrationId: string): Promise<void> {
    // Mock sync implementation
    await this.prisma.financialIntegration.update({
      where: { id: integrationId },
      data: {
        lastSyncAt: new Date(),
        syncStatus: 'active'
      }
    })
  }

  async getFinancialIntegrations(companyId: string): Promise<FinancialIntegration[]> {
    const integrations = await this.prisma.financialIntegration.findMany({
      where: { companyId }
    })

    return integrations.map(i => ({
      id: i.id,
      companyId: i.companyId,
      provider: i.provider,
      accountId: i.accountId,
      accessToken: i.accessToken,
      refreshToken: i.refreshToken || undefined,
      tokenExpiresAt: i.tokenExpiresAt?.toISOString(),
      lastSyncAt: i.lastSyncAt?.toISOString(),
      syncStatus: i.syncStatus,
      settings: i.settings as any,
      createdAt: i.createdAt.toISOString(),
      updatedAt: i.updatedAt.toISOString()
    }))
  }

  // ============================================================================
  // EXPORT & IMPORT
  // ============================================================================

  async exportFinancialData(companyId: string, request: any): Promise<string> {
    // Mock export implementation
    return `export-${companyId}-${Date.now()}.${request.format}`
  }

  async importTransactions(companyId: string, data: any[], format: string): Promise<Transaction[]> {
    // Mock import implementation
    return []
  }

  // ============================================================================
  // ALERTS
  // ============================================================================

  async getFinancialAlerts(companyId: string): Promise<any[]> {
    // Mock alerts
    return [
      {
        id: 'alert-1',
        type: 'warning',
        title: 'Budget Overrun',
        message: 'Marketing budget is 15% over allocated amount',
        actionRequired: true,
        createdAt: new Date().toISOString()
      }
    ]
  }

  async createFinancialAlert(companyId: string, alert: Omit<any, 'id' | 'createdAt'>): Promise<any> {
    // Mock alert creation
    return {
      id: `alert-${Date.now()}`,
      ...alert,
      createdAt: new Date().toISOString()
    }
  }
}