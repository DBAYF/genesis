export interface FinancialProjection {
  id: string
  companyId: string
  scenario: 'conservative' | 'base' | 'optimistic'
  period: string // YYYY-MM
  revenue: number
  costs: number
  grossProfit: number
  netProfit: number
  cashFlow: number
  headcount: number
  assumptions: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface Transaction {
  id: string
  companyId: string
  date: string
  description: string
  amount: number
  currency: string
  category: string
  type: 'income' | 'expense'
  paymentMethod?: string
  reconciled: boolean
  tags: string[]
  attachments: string[]
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface Budget {
  id: string
  companyId: string
  name: string
  period: string // YYYY-MM
  categories: BudgetCategory[]
  totalBudgeted: number
  totalActual: number
  variance: number
  status: 'draft' | 'approved' | 'active' | 'completed'
  createdBy: string
  approvedBy?: string
  createdAt: string
  updatedAt: string
}

export interface BudgetCategory {
  id: string
  category: string
  budgetedAmount: number
  actualAmount: number
  variance: number
  variancePercentage: number
  subcategories: BudgetSubcategory[]
}

export interface BudgetSubcategory {
  id: string
  subcategory: string
  budgetedAmount: number
  actualAmount: number
  variance: number
}

export interface FinancialStatement {
  id: string
  companyId: string
  type: 'income_statement' | 'balance_sheet' | 'cash_flow'
  period: string // YYYY-MM
  currency: string
  data: Record<string, any>
  status: 'draft' | 'final' | 'audited'
  filedAt?: string
  createdAt: string
  updatedAt: string
}

export interface FinancialMetric {
  id: string
  companyId: string
  metric: string
  value: number
  unit: string
  period: string // YYYY-MM
  benchmark?: number
  trend: 'up' | 'down' | 'stable'
  createdAt: string
  updatedAt: string
}

export interface FinancialAnalysis {
  id: string
  companyId: string
  type: 'profitability' | 'liquidity' | 'efficiency' | 'leverage' | 'growth'
  period: string // YYYY-MM
  metrics: Record<string, number>
  insights: string[]
  recommendations: string[]
  riskLevel: 'low' | 'medium' | 'high'
  createdAt: string
  updatedAt: string
}

export interface CashFlowProjection {
  id: string
  companyId: string
  scenario: 'conservative' | 'base' | 'optimistic'
  startDate: string
  endDate: string
  projections: CashFlowEntry[]
  assumptions: Record<string, any>
  totalInflow: number
  totalOutflow: number
  netCashFlow: number
  endingBalance: number
  createdAt: string
  updatedAt: string
}

export interface CashFlowEntry {
  date: string
  inflows: number
  outflows: number
  netFlow: number
  balance: number
  breakdown: {
    operating: number
    investing: number
    financing: number
  }
}

export interface Invoice {
  id: string
  companyId: string
  invoiceNumber: string
  clientId?: string
  clientName: string
  clientEmail?: string
  issueDate: string
  dueDate: string
  items: InvoiceItem[]
  subtotal: number
  taxRate: number
  taxAmount: number
  total: number
  currency: string
  status: 'draft' | 'sent' | 'viewed' | 'overdue' | 'paid' | 'cancelled'
  paymentTerms: string
  notes?: string
  sentAt?: string
  paidAt?: string
  createdAt: string
  updatedAt: string
}

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
  taxRate?: number
}

export interface Expense {
  id: string
  companyId: string
  category: string
  subcategory?: string
  amount: number
  currency: string
  date: string
  description: string
  vendor?: string
  paymentMethod: string
  receipt?: string
  tags: string[]
  taxDeductible: boolean
  approvedBy?: string
  approvedAt?: string
  createdAt: string
  updatedAt: string
}

export interface FinancialReport {
  id: string
  companyId: string
  type: 'monthly' | 'quarterly' | 'annual' | 'custom'
  title: string
  period: {
    start: string
    end: string
  }
  summary: {
    totalRevenue: number
    totalExpenses: number
    netProfit: number
    cashFlow: number
    assets: number
    liabilities: number
    equity: number
  }
  charts: FinancialChart[]
  insights: string[]
  generatedAt: string
  createdAt: string
  updatedAt: string
}

export interface FinancialChart {
  id: string
  type: 'line' | 'bar' | 'pie' | 'area'
  title: string
  data: Record<string, any>
  config: Record<string, any>
}

export interface FinancialGoal {
  id: string
  companyId: string
  title: string
  description?: string
  type: 'revenue' | 'profit' | 'cash_flow' | 'valuation' | 'headcount' | 'custom'
  targetValue: number
  currentValue: number
  unit: string
  deadline: string
  status: 'active' | 'achieved' | 'overdue' | 'cancelled'
  progress: number
  milestones: FinancialMilestone[]
  createdAt: string
  updatedAt: string
}

export interface FinancialMilestone {
  id: string
  title: string
  targetValue: number
  achievedValue?: number
  deadline: string
  achievedAt?: string
  status: 'pending' | 'achieved' | 'overdue'
}

export interface FinancialIntegration {
  id: string
  companyId: string
  provider: 'xero' | 'quickbooks' | 'stripe' | 'bank' | 'paypal'
  accountId: string
  accessToken: string
  refreshToken?: string
  tokenExpiresAt?: string
  lastSyncAt?: string
  syncStatus: 'active' | 'error' | 'disabled'
  settings: Record<string, any>
  createdAt: string
  updatedAt: string
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateFinancialProjectionRequest {
  scenario: 'conservative' | 'base' | 'optimistic'
  period: string
  revenue: number
  costs: number
  assumptions?: Record<string, any>
}

export interface UpdateFinancialProjectionRequest {
  revenue?: number
  costs?: number
  assumptions?: Record<string, any>
}

export interface CreateTransactionRequest {
  date: string
  description: string
  amount: number
  currency: string
  category: string
  type: 'income' | 'expense'
  paymentMethod?: string
  tags?: string[]
  metadata?: Record<string, any>
}

export interface CreateBudgetRequest {
  name: string
  period: string
  categories: {
    category: string
    budgetedAmount: number
    subcategories?: {
      subcategory: string
      budgetedAmount: number
    }[]
  }[]
}

export interface CreateInvoiceRequest {
  clientName: string
  clientEmail?: string
  issueDate: string
  dueDate: string
  items: {
    description: string
    quantity: number
    unitPrice: number
    taxRate?: number
  }[]
  taxRate: number
  currency: string
  paymentTerms: string
  notes?: string
}

export interface CreateExpenseRequest {
  category: string
  subcategory?: string
  amount: number
  currency: string
  date: string
  description: string
  vendor?: string
  paymentMethod: string
  tags?: string[]
  taxDeductible?: boolean
}

export interface CreateFinancialGoalRequest {
  title: string
  description?: string
  type: 'revenue' | 'profit' | 'cash_flow' | 'valuation' | 'headcount' | 'custom'
  targetValue: number
  unit: string
  deadline: string
  milestones?: {
    title: string
    targetValue: number
    deadline: string
  }[]
}

export interface FinancialDashboardData {
  summary: {
    totalRevenue: number
    totalExpenses: number
    netProfit: number
    cashBalance: number
    monthlyBurnRate: number
    runwayMonths: number
  }
  recentTransactions: Transaction[]
  upcomingExpenses: Expense[]
  budgetVariance: {
    category: string
    budgeted: number
    actual: number
    variance: number
  }[]
  projections: FinancialProjection[]
  goals: FinancialGoal[]
  alerts: FinancialAlert[]
}

export interface FinancialAlert {
  id: string
  type: 'warning' | 'error' | 'info'
  title: string
  message: string
  actionRequired?: boolean
  createdAt: string
}

export interface FinancialExportRequest {
  type: 'transactions' | 'budget' | 'projections' | 'report'
  format: 'csv' | 'xlsx' | 'pdf'
  dateRange?: {
    start: string
    end: string
  }
  filters?: Record<string, any>
}

// ============================================================================
// SERVICE INTERFACE
// ============================================================================

export interface FinancialService {
  // Financial Projections
  createFinancialProjection(companyId: string, data: CreateFinancialProjectionRequest): Promise<FinancialProjection>
  getFinancialProjections(companyId: string, scenario?: string): Promise<FinancialProjection[]>
  updateFinancialProjection(id: string, updates: UpdateFinancialProjectionRequest): Promise<FinancialProjection>
  deleteFinancialProjection(id: string): Promise<void>
  generateFinancialProjection(companyId: string, scenario: string, periods: number): Promise<FinancialProjection[]>

  // Transactions
  createTransaction(companyId: string, data: CreateTransactionRequest): Promise<Transaction>
  getTransactions(companyId: string, filters?: TransactionFilters): Promise<Transaction[]>
  updateTransaction(id: string, updates: Partial<Transaction>): Promise<Transaction>
  deleteTransaction(id: string): Promise<void>
  categorizeTransaction(id: string, category: string): Promise<Transaction>
  reconcileTransaction(id: string): Promise<Transaction>

  // Budgets
  createBudget(companyId: string, data: CreateBudgetRequest): Promise<Budget>
  getBudgets(companyId: string): Promise<Budget[]>
  updateBudget(id: string, updates: Partial<Budget>): Promise<Budget>
  deleteBudget(id: string): Promise<void>
  getBudgetVariance(companyId: string, budgetId: string): Promise<Budget>

  // Financial Statements
  generateFinancialStatement(companyId: string, type: string, period: string): Promise<FinancialStatement>
  getFinancialStatements(companyId: string, type?: string): Promise<FinancialStatement[]>

  // Analysis & Metrics
  generateFinancialAnalysis(companyId: string, type: string, period: string): Promise<FinancialAnalysis>
  getFinancialMetrics(companyId: string, period?: string): Promise<FinancialMetric[]>
  calculateFinancialRatios(companyId: string, period: string): Promise<Record<string, number>>

  // Cash Flow
  createCashFlowProjection(companyId: string, scenario: string, startDate: string, endDate: string): Promise<CashFlowProjection>
  getCashFlowProjections(companyId: string): Promise<CashFlowProjection[]>

  // Invoices
  createInvoice(companyId: string, data: CreateInvoiceRequest): Promise<Invoice>
  getInvoices(companyId: string, status?: string): Promise<Invoice[]>
  updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice>
  sendInvoice(id: string): Promise<Invoice>
  markInvoicePaid(id: string, paymentDate?: string): Promise<Invoice>

  // Expenses
  createExpense(companyId: string, data: CreateExpenseRequest): Promise<Expense>
  getExpenses(companyId: string, filters?: ExpenseFilters): Promise<Expense[]>
  updateExpense(id: string, updates: Partial<Expense>): Promise<Expense>
  approveExpense(id: string, approverId: string): Promise<Expense>

  // Goals & Planning
  createFinancialGoal(companyId: string, data: CreateFinancialGoalRequest): Promise<FinancialGoal>
  getFinancialGoals(companyId: string): Promise<FinancialGoal[]>
  updateFinancialGoal(id: string, updates: Partial<FinancialGoal>): Promise<FinancialGoal>
  updateGoalProgress(id: string, progress: number): Promise<FinancialGoal>

  // Reports & Dashboard
  generateFinancialReport(companyId: string, type: string, period: { start: string; end: string }): Promise<FinancialReport>
  getFinancialDashboardData(companyId: string): Promise<FinancialDashboardData>

  // Integrations
  connectFinancialIntegration(companyId: string, provider: string, credentials: Record<string, any>): Promise<FinancialIntegration>
  syncFinancialData(companyId: string, integrationId: string): Promise<void>
  getFinancialIntegrations(companyId: string): Promise<FinancialIntegration[]>

  // Export & Import
  exportFinancialData(companyId: string, request: FinancialExportRequest): Promise<string>
  importTransactions(companyId: string, data: any[], format: string): Promise<Transaction[]>

  // Alerts & Notifications
  getFinancialAlerts(companyId: string): Promise<FinancialAlert[]>
  createFinancialAlert(companyId: string, alert: Omit<FinancialAlert, 'id' | 'createdAt'>): Promise<FinancialAlert>
}

export interface TransactionFilters {
  startDate?: string
  endDate?: string
  category?: string
  type?: 'income' | 'expense'
  reconciled?: boolean
  tags?: string[]
}

export interface ExpenseFilters {
  startDate?: string
  endDate?: string
  category?: string
  status?: 'pending' | 'approved' | 'rejected'
  paymentMethod?: string
}