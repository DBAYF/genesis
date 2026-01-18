export interface Subscription {
  id: string
  companyId: string
  planId: string
  planName: string
  status: 'active' | 'canceled' | 'past_due' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'unpaid'
  currentPeriodStart: string
  currentPeriodEnd: string
  trialStart?: string
  trialEnd?: string
  cancelAt?: string
  cancelAtPeriodEnd: boolean
  canceledAt?: string
  endedAt?: string
  quantity: number
  unitAmount: number
  currency: string
  interval: 'day' | 'week' | 'month' | 'year'
  intervalCount: number
  metadata: Record<string, any>
  externalId?: string // Stripe subscription ID
  createdAt: string
  updatedAt: string
}

export interface BillingPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: 'month' | 'year'
  intervalCount: number
  trialDays: number
  features: PlanFeature[]
  limits: PlanLimit[]
  isActive: boolean
  isPopular: boolean
  sortOrder: number
  externalId?: string // Stripe price ID
  createdAt: string
  updatedAt: string
}

export interface PlanFeature {
  id: string
  name: string
  description?: string
  included: boolean
  limit?: number
  unit?: string
}

export interface PlanLimit {
  id: string
  resource: string
  limit: number
  unit: string
  currentUsage?: number
}

export interface Invoice {
  id: string
  companyId: string
  subscriptionId?: string
  number: string
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
  currency: string
  subtotal: number
  tax: number
  total: number
  amountDue: number
  amountPaid: number
  amountRemaining: number
  billingReason: 'subscription_cycle' | 'subscription_create' | 'subscription_update' | 'manual' | 'upcoming'
  periodStart?: string
  periodEnd?: string
  dueDate?: string
  paidAt?: string
  attempted: boolean
  attemptedAt?: string
  collectionMethod: 'charge_automatically' | 'send_invoice'
  description?: string
  lines: InvoiceLine[]
  paymentIntentId?: string
  externalId?: string // Stripe invoice ID
  hostedInvoiceUrl?: string
  invoicePdf?: string
  createdAt: string
  updatedAt: string
}

export interface InvoiceLine {
  id: string
  amount: number
  currency: string
  description: string
  periodStart?: string
  periodEnd?: string
  proration: boolean
  quantity: number
  unitAmount: number
  metadata: Record<string, any>
}

export interface PaymentMethod {
  id: string
  companyId: string
  type: 'card' | 'bank_account' | 'paypal'
  isDefault: boolean
  card?: CardDetails
  bankAccount?: BankAccountDetails
  paypal?: PaypalDetails
  billingDetails: BillingDetails
  externalId?: string // Stripe payment method ID
  createdAt: string
  updatedAt: string
}

export interface CardDetails {
  brand: string
  last4: string
  expMonth: number
  expYear: number
  fingerprint?: string
}

export interface BankAccountDetails {
  bankName: string
  last4: string
  routingNumber?: string
  accountHolderType: 'individual' | 'company'
  currency: string
}

export interface PaypalDetails {
  email: string
}

export interface BillingDetails {
  name?: string
  email?: string
  phone?: string
  address?: Address
}

export interface Address {
  line1: string
  line2?: string
  city: string
  state?: string
  postalCode: string
  country: string
}

export interface Payment {
  id: string
  companyId: string
  invoiceId?: string
  amount: number
  currency: string
  status: 'pending' | 'succeeded' | 'failed' | 'canceled'
  paymentMethodId: string
  paymentMethodType: string
  description?: string
  receiptUrl?: string
  failureCode?: string
  failureMessage?: string
  refunded: boolean
  refundAmount: number
  disputeId?: string
  externalId?: string // Stripe payment intent ID
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface Refund {
  id: string
  paymentId: string
  amount: number
  currency: string
  reason: 'duplicate' | 'fraudulent' | 'requested_by_customer' | 'other'
  status: 'pending' | 'succeeded' | 'failed' | 'canceled'
  description?: string
  externalId?: string // Stripe refund ID
  createdAt: string
  updatedAt: string
}

export interface Coupon {
  id: string
  code: string
  name: string
  description?: string
  percentOff?: number
  amountOff?: number
  currency?: string
  duration: 'once' | 'repeating' | 'forever'
  durationInMonths?: number
  maxRedemptions?: number
  timesRedeemed: number
  validFrom?: string
  validUntil?: string
  applicablePlans: string[]
  isActive: boolean
  externalId?: string // Stripe coupon ID
  createdAt: string
  updatedAt: string
}

export interface BillingSettings {
  id: string
  companyId: string
  defaultCurrency: string
  taxRate: number
  taxId?: string
  invoiceFooter?: string
  paymentMethods: {
    stripe: boolean
    paypal: boolean
    bankTransfer: boolean
  }
  billingAddress: Address
  notifications: {
    invoiceCreated: boolean
    paymentFailed: boolean
    paymentSucceeded: boolean
    subscriptionCanceled: boolean
    trialEnding: boolean
  }
  autoAdvanceInvoices: boolean
  daysUntilDue: number
  createdAt: string
  updatedAt: string
}

export interface BillingAnalytics {
  totalRevenue: number
  monthlyRecurringRevenue: number
  annualRecurringRevenue: number
  averageRevenuePerUser: number
  churnRate: number
  lifetimeValue: number
  paymentSuccessRate: number
  outstandingInvoices: number
  overdueInvoices: number
  recentPayments: Payment[]
  revenueByPlan: Record<string, number>
  revenueByMonth: Record<string, number>
  subscriptionMetrics: {
    totalSubscriptions: number
    activeSubscriptions: number
    canceledSubscriptions: number
    trialSubscriptions: number
    conversionRate: number
  }
  period: {
    start: string
    end: string
  }
}

// Request/Response Types
export interface CreateSubscriptionRequest {
  planId: string
  paymentMethodId?: string
  quantity?: number
  trialDays?: number
  couponCode?: string
  metadata?: Record<string, any>
}

export interface UpdateSubscriptionRequest {
  planId?: string
  quantity?: number
  paymentMethodId?: string
  prorationBehavior?: 'create_prorations' | 'none'
  cancelAtPeriodEnd?: boolean
  metadata?: Record<string, any>
}

export interface CreatePaymentMethodRequest {
  type: 'card' | 'bank_account'
  card?: {
    number: string
    expMonth: number
    expYear: number
    cvc: string
  }
  bankAccount?: {
    country: string
    currency: string
    accountHolderType: 'individual' | 'company'
    routingNumber?: string
    accountNumber: string
  }
  billingDetails: BillingDetails
}

export interface CreateInvoiceRequest {
  subscriptionId?: string
  customerId: string
  amount?: number
  currency?: string
  description?: string
  dueDate?: string
  lines?: {
    amount: number
    currency: string
    description: string
    quantity?: number
  }[]
  metadata?: Record<string, any>
}

export interface ProcessPaymentRequest {
  paymentMethodId: string
  amount: number
  currency: string
  invoiceId?: string
  description?: string
  metadata?: Record<string, any>
}

export interface CreateCouponRequest {
  code: string
  name: string
  percentOff?: number
  amountOff?: number
  currency?: string
  duration: 'once' | 'repeating' | 'forever'
  durationInMonths?: number
  maxRedemptions?: number
  validUntil?: string
  applicablePlans?: string[]
}

export interface UpdateBillingSettingsRequest {
  defaultCurrency?: string
  taxRate?: number
  taxId?: string
  invoiceFooter?: string
  paymentMethods?: {
    stripe?: boolean
    paypal?: boolean
    bankTransfer?: boolean
  }
  billingAddress?: Address
  notifications?: {
    invoiceCreated?: boolean
    paymentFailed?: boolean
    paymentSucceeded?: boolean
    subscriptionCanceled?: boolean
    trialEnding?: boolean
  }
  autoAdvanceInvoices?: boolean
  daysUntilDue?: number
}

export interface BillingWebhookEvent {
  id: string
  type: string
  data: any
  created: number
  livemode: boolean
}

// Service Interface
export interface BillingService {
  // Subscription Management
  createSubscription(companyId: string, data: CreateSubscriptionRequest): Promise<Subscription>
  getSubscriptions(companyId: string): Promise<Subscription[]>
  getSubscription(id: string): Promise<Subscription | null>
  updateSubscription(id: string, updates: UpdateSubscriptionRequest): Promise<Subscription>
  cancelSubscription(id: string, cancelAtPeriodEnd?: boolean): Promise<Subscription>
  reactivateSubscription(id: string): Promise<Subscription>

  // Plan Management
  createPlan(plan: Omit<BillingPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<BillingPlan>
  getPlans(): Promise<BillingPlan[]>
  updatePlan(id: string, updates: Partial<BillingPlan>): Promise<BillingPlan>
  deletePlan(id: string): Promise<void>

  // Payment Method Management
  createPaymentMethod(companyId: string, data: CreatePaymentMethodRequest): Promise<PaymentMethod>
  getPaymentMethods(companyId: string): Promise<PaymentMethod[]>
  updatePaymentMethod(id: string, updates: Partial<PaymentMethod>): Promise<PaymentMethod>
  deletePaymentMethod(id: string): Promise<void>
  setDefaultPaymentMethod(companyId: string, paymentMethodId: string): Promise<void>

  // Invoice Management
  createInvoice(companyId: string, data: CreateInvoiceRequest): Promise<Invoice>
  getInvoices(companyId: string): Promise<Invoice[]>
  getInvoice(id: string): Promise<Invoice | null>
  updateInvoice(id: string, updates: Partial<Invoice>): Promise<Invoice>
  finalizeInvoice(id: string): Promise<Invoice>
  payInvoice(id: string, paymentMethodId?: string): Promise<Invoice>
  voidInvoice(id: string): Promise<Invoice>

  // Payment Processing
  processPayment(companyId: string, data: ProcessPaymentRequest): Promise<Payment>
  getPayments(companyId: string): Promise<Payment[]>
  getPayment(id: string): Promise<Payment | null>
  refundPayment(paymentId: string, amount: number, reason: string): Promise<Refund>

  // Coupon Management
  createCoupon(data: CreateCouponRequest): Promise<Coupon>
  getCoupons(): Promise<Coupon[]>
  updateCoupon(id: string, updates: Partial<Coupon>): Promise<Coupon>
  deleteCoupon(id: string): Promise<void>
  validateCoupon(code: string, planId?: string): Promise<Coupon | null>

  // Settings
  getBillingSettings(companyId: string): Promise<BillingSettings | null>
  updateBillingSettings(companyId: string, updates: UpdateBillingSettingsRequest): Promise<BillingSettings>

  // Analytics & Reporting
  getBillingAnalytics(companyId: string, period: { start: string; end: string }): Promise<BillingAnalytics>
  generateInvoiceReport(companyId: string, period: { start: string; end: string }): Promise<any>
  getSubscriptionMetrics(companyId: string): Promise<any>

  // Webhooks & Integrations
  handleWebhookEvent(event: BillingWebhookEvent): Promise<void>
  syncWithStripe(companyId: string): Promise<void>
  getUpcomingInvoice(companyId: string): Promise<Invoice | null>

  // Usage & Limits
  checkPlanLimits(companyId: string, resource: string): Promise<{ allowed: boolean; current: number; limit: number }>
  recordUsage(companyId: string, resource: string, quantity: number): Promise<void>
  getUsage(companyId: string, period: { start: string; end: string }): Promise<Record<string, number>>

  // Notifications
  sendInvoiceNotification(invoiceId: string): Promise<void>
  sendPaymentNotification(paymentId: string): Promise<void>
  sendSubscriptionNotification(subscriptionId: string, type: 'created' | 'updated' | 'canceled' | 'trial_ending'): Promise<void>
}