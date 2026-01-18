// ============================================================================
// GENESIS ENGINE - TYPE DEFINITIONS
// ============================================================================

// User Types
export interface User {
  id: string
  email: string
  emailVerified: boolean
  phone?: string
  phoneVerified: boolean
  firstName?: string
  lastName?: string
  avatarUrl?: string
  timezone: string
  locale: string
  onboardingCompleted: boolean
  onboardingStep?: string
  pulseEnabled: boolean
  pulsePreferredChannel: 'sms' | 'whatsapp' | 'telegram' | 'email'
  pulseActiveHoursStart: string
  pulseActiveHoursEnd: string
  pulseDigestTime: string
  status: 'active' | 'suspended' | 'deleted'
  lastActiveAt?: string
  createdAt: string
  updatedAt: string
}

// Company Types
export interface Company {
  id: string
  name: string
  tradingName?: string
  companyNumber?: string
  companyType: 'ltd' | 'plc' | 'llp' | 'partnership' | 'sole_trader' | 'cic' | 'charity'
  companyStatus: 'pre_incorporation' | 'active' | 'dormant' | 'dissolved' | 'liquidation'
  incorporationDate?: string
  accountingReferenceDate?: string
  firstAccountsDue?: string
  nextAccountsDue?: string
  nextConfirmationStatementDue?: string
  registeredAddress: Address
  businessAddress?: Address
  sicCodes: string[]
  natureOfBusiness?: string
  industry?: string
  sector?: string
  corporationTaxReference?: string
  vatNumber?: string
  vatRegistered: boolean
  payeReference?: string
  payeRegistered: boolean
  seisEligible?: boolean
  seisAdvanceAssuranceStatus?: string
  seisAdvanceAssuranceDate?: string
  seisAllocationRemaining: number
  eisEligible?: boolean
  eisAdvanceAssuranceStatus?: string
  eisAdvanceAssuranceDate?: string
  currentCashBalance?: number
  monthlyBurnRate?: number
  runwayMonths?: number
  totalFundingRaised: number
  lastValuation?: number
  lastValuationDate?: string
  defaultCurrency: string
  financialYearEndMonth: number
  createdAt: string
  updatedAt: string
}

export interface Address {
  line1: string
  line2?: string
  city: string
  county?: string
  postcode: string
  country: string
}

// Financial Types
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
  createdAt: string
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
  createdAt: string
}

// Knowledge Graph Types
export interface Entity {
  id: string
  type: 'person' | 'company' | 'investor' | 'advisor' | 'partner'
  name: string
  description?: string
  properties: Record<string, any>
  relationships: Relationship[]
  createdAt: string
  updatedAt: string
}

export interface Relationship {
  id: string
  fromEntityId: string
  toEntityId: string
  type: string
  properties: Record<string, any>
  strength: number
  createdAt: string
}

// Document Types
export interface Document {
  id: string
  companyId: string
  name: string
  type: 'pitch_deck' | 'business_plan' | 'financial_model' | 'cap_table' | 'term_sheet' | 'sha' | 'articles' | 'confirmation_statement' | 'accounts' | 'tax_return' | 'contract' | 'invoice' | 'receipt'
  status: 'draft' | 'pending_review' | 'approved' | 'signed' | 'filed' | 'archived'
  version: number
  fileUrl?: string
  fileSize?: number
  mimeType?: string
  metadata: Record<string, any>
  createdBy: string
  reviewedBy?: string
  approvedBy?: string
  signedAt?: string
  filedAt?: string
  createdAt: string
  updatedAt: string
}

// Nexus Types (Networking/Funding)
export interface IntroductionRequest {
  id: string
  fromUserId: string
  toUserId: string
  companyId: string
  message: string
  status: 'pending' | 'accepted' | 'declined' | 'completed'
  introductionType: 'networking' | 'funding' | 'partnership' | 'advisory'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  respondedAt?: string
}

export interface FundingApplication {
  id: string
  companyId: string
  fundingType: 'seis' | 'eis' | 'grant' | 'rbf' | 'community'
  amount: number
  useOfFunds: string
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'funded'
  submittedAt?: string
  approvedAt?: string
  fundedAt?: string
  createdAt: string
}

export interface InvestorMatch {
  name: string
  firm: string
  score: number
  investmentFocus: string[]
  investmentCriteria: {
    ticketSize: {
      min: number
      max: number
    }
  }
}

export interface InvestorProfile {
  id: string
  userId: string
  investmentFocus: string[]
  typicalInvestmentSize: {
    min: number
    max: number
  }
  investmentStage: ('pre_seed' | 'seed' | 'series_a' | 'series_b' | 'growth')[]
  geography: string[]
  sectors: string[]
  portfolioCompanies: string[]
  createdAt: string
}

// Pulse Types (Messaging)
export interface Message {
  id: string
  userId: string
  channel: 'sms' | 'whatsapp' | 'telegram' | 'email'
  direction: 'inbound' | 'outbound'
  content: string
  status: 'sent' | 'delivered' | 'read' | 'failed'
  sentAt: string
  deliveredAt?: string
  readAt?: string
  metadata: Record<string, any>
}

export interface Conversation {
  id: string
  userId: string
  lastMessageAt: string
  unreadCount: number
  status: 'active' | 'archived'
  createdAt: string
}

// Compliance Types
export interface ComplianceTask {
  id: string
  companyId: string
  type: 'hmrc_filing' | 'companies_house_filing' | 'vat_return' | 'paye_return' | 'confirmation_statement' | 'accounts_filing' | 'tax_payment'
  title: string
  description: string
  dueDate: string
  status: 'pending' | 'in_progress' | 'completed' | 'overdue'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignedTo?: string
  completedAt?: string
  createdAt: string
}

export interface ComplianceRecord {
  id: string
  companyId: string
  type: string
  reference: string
  status: 'compliant' | 'non_compliant' | 'pending_review'
  dueDate?: string
  submittedDate?: string
  approvedDate?: string
  notes?: string
  createdAt: string
}

// CRM Types
export interface Contact {
  id: string
  companyId: string
  type: 'customer' | 'supplier' | 'investor' | 'advisor' | 'partner' | 'other'
  firstName: string
  lastName: string
  email?: string
  phone?: string
  company?: string
  position?: string
  address?: Address
  tags: string[]
  notes?: string
  lastContactedAt?: string
  createdAt: string
  updatedAt: string
}

export interface Deal {
  id: string
  companyId: string
  contactId: string
  title: string
  value: number
  currency: string
  stage: 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost'
  probability: number
  expectedCloseDate?: string
  actualCloseDate?: string
  description?: string
  createdAt: string
  updatedAt: string
}

// Task Types
export interface Task {
  id: string
  companyId: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assigneeId?: string
  dueDate?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

// Billing Types
export interface Subscription {
  id: string
  companyId: string
  planId: string
  status: 'active' | 'past_due' | 'canceled' | 'unpaid'
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  createdAt: string
}

export interface Invoice {
  id: string
  companyId: string
  subscriptionId?: string
  amount: number
  currency: string
  status: 'draft' | 'sent' | 'viewed' | 'partial' | 'paid' | 'overdue' | 'void' | 'written_off'
  dueDate: string
  paidAt?: string
  createdAt: string
}

// Calendar Types
export interface CalendarEvent {
  id: string
  companyId: string
  title: string
  description?: string
  startTime: string
  endTime: string
  allDay: boolean
  location?: string
  attendees: Attendee[]
  reminders: Reminder[]
  recurrence?: RecurrenceRule
  createdAt: string
  updatedAt: string
}

export interface Attendee {
  id: string
  name: string
  email: string
  status: 'pending' | 'accepted' | 'declined' | 'tentative'
}

export interface Reminder {
  id: string
  minutes: number
  method: 'email' | 'popup' | 'sms'
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number
  endDate?: string
  count?: number
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: string[]
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form Types
export interface LoginForm {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  companyName?: string
  acceptTerms: boolean
}

export interface CompanyForm {
  name: string
  tradingName?: string
  companyType: Company['companyType']
  registeredAddress: Address
  businessAddress?: Address
  sicCodes: string[]
  natureOfBusiness?: string
  industry?: string
  sector?: string
}

export interface DocumentForm {
  name: string
  type: Document['type']
  file?: File
}

// UI Types
export interface SidebarItem {
  id: string
  label: string
  icon: string
  href: string
  children?: SidebarItem[]
}

export interface DashboardWidget {
  id: string
  title: string
  type: 'metric' | 'chart' | 'list' | 'progress'
  size: 'small' | 'medium' | 'large'
  data: any
}

export interface NotificationItem {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  read: boolean
  createdAt: string
  actionUrl?: string
}