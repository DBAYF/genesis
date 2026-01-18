// ============================================================================
// GENESIS ENGINE - API CLIENT
// ============================================================================

import { config, API_ENDPOINTS } from '@/config'

// ============================================================================
// BASE API CLIENT
// ============================================================================

class ApiClient {
  private baseUrl: string
  private defaultHeaders: Record<string, string>

  constructor(baseUrl: string = config.NEXT_PUBLIC_API_URL) {
    this.baseUrl = baseUrl
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    // In a real implementation, this would get the auth token from storage
    const token = localStorage.getItem('auth_token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/api/${endpoint.replace(/^\/+/, '')}`
    const authHeaders = await this.getAuthHeaders()

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...authHeaders,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = params ? `${endpoint}?${new URLSearchParams(params)}` : endpoint
    return this.request<T>(url)
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    })
  }
}

// ============================================================================
// SERVICE-SPECIFIC CLIENTS
// ============================================================================

export const authClient = new ApiClient(config.NEXT_PUBLIC_AUTH_SERVICE_URL)
export const userClient = new ApiClient(config.NEXT_PUBLIC_USER_SERVICE_URL)
export const companyClient = new ApiClient(config.NEXT_PUBLIC_COMPANY_SERVICE_URL)
export const knowledgeGraphClient = new ApiClient(config.NEXT_PUBLIC_KNOWLEDGE_GRAPH_URL)
export const financialClient = new ApiClient(config.NEXT_PUBLIC_FINANCIAL_ENGINE_URL)
export const documentClient = new ApiClient(config.NEXT_PUBLIC_DOCUMENT_ENGINE_URL)
export const nexusClient = new ApiClient(config.NEXT_PUBLIC_NEXUS_URL)
export const pulseClient = new ApiClient(config.NEXT_PUBLIC_PULSE_URL)
export const complianceClient = new ApiClient(config.NEXT_PUBLIC_COMPLIANCE_URL)
export const crmClient = new ApiClient(config.NEXT_PUBLIC_CRM_URL)
export const calendarClient = new ApiClient(config.NEXT_PUBLIC_CALENDAR_URL)
export const billingClient = new ApiClient(config.NEXT_PUBLIC_BILLING_URL)

// Main API client for general endpoints
export const apiClient = new ApiClient()

// ============================================================================
// AUTHENTICATION API
// ============================================================================

export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    authClient.post<{ token: string; user: any }>('/login', credentials),

  register: (userData: any) =>
    authClient.post<{ token: string; user: any }>('/register', userData),

  logout: () =>
    authClient.post('/logout'),

  refreshToken: () =>
    authClient.post<{ token: string }>('/refresh'),

  forgotPassword: (email: string) =>
    authClient.post('/forgot-password', { email }),

  resetPassword: (data: { token: string; password: string }) =>
    authClient.post('/reset-password', data),

  verifyEmail: (token: string) =>
    authClient.post('/verify-email', { token }),
}

// ============================================================================
// USER MANAGEMENT API
// ============================================================================

export const userApi = {
  getProfile: () =>
    userClient.get('/profile'),

  updateProfile: (data: any) =>
    userClient.put('/profile', data),

  updatePreferences: (preferences: any) =>
    userClient.put('/preferences', preferences),

  getSettings: () =>
    userClient.get('/settings'),

  updateSettings: (settings: any) =>
    userClient.put('/settings', settings),
}

// ============================================================================
// COMPANY MANAGEMENT API
// ============================================================================

export const companyApi = {
  getCompanies: () =>
    companyClient.get('/'),

  getCompany: (id: string) =>
    companyClient.get(`/${id}`),

  createCompany: (data: any) =>
    companyClient.post('/', data),

  updateCompany: (id: string, data: any) =>
    companyClient.put(`/${id}`, data),

  deleteCompany: (id: string) =>
    companyClient.delete(`/${id}`),

  incorporateCompany: (data: any) =>
    companyClient.post('/incorporate', data),

  searchCompanies: (query: string) =>
    companyClient.get('/search', { q: query }),
}

// ============================================================================
// FINANCIAL API
// ============================================================================

export const financialApi = {
  getProjections: (companyId: string, scenario?: string) =>
    financialClient.get(`/companies/${companyId}/projections`, scenario ? { scenario } : undefined),

  createProjection: (companyId: string, data: any) =>
    financialClient.post(`/companies/${companyId}/projections`, data),

  updateProjection: (companyId: string, projectionId: string, data: any) =>
    financialClient.put(`/companies/${companyId}/projections/${projectionId}`, data),

  getTransactions: (companyId: string, params?: any) =>
    financialClient.get(`/companies/${companyId}/transactions`, params),

  createTransaction: (companyId: string, data: any) =>
    financialClient.post(`/companies/${companyId}/transactions`, data),

  updateTransaction: (companyId: string, transactionId: string, data: any) =>
    financialClient.put(`/companies/${companyId}/transactions/${transactionId}`, data),

  getSummary: (companyId: string, period?: string) =>
    financialClient.get(`/companies/${companyId}/summary`, period ? { period } : undefined),

  generateReport: (companyId: string, type: string, params?: any) =>
    financialClient.post(`/companies/${companyId}/reports/${type}`, params),
}

// ============================================================================
// KNOWLEDGE GRAPH API
// ============================================================================

export const knowledgeGraphApi = {
  getEntities: (params?: any) =>
    knowledgeGraphClient.get('/entities', params),

  getEntity: (id: string) =>
    knowledgeGraphClient.get(`/entities/${id}`),

  createEntity: (data: any) =>
    knowledgeGraphClient.post('/entities', data),

  updateEntity: (id: string, data: any) =>
    knowledgeGraphClient.put(`/entities/${id}`, data),

  deleteEntity: (id: string) =>
    knowledgeGraphClient.delete(`/entities/${id}`),

  getRelationships: (entityId?: string) =>
    knowledgeGraphClient.get('/relationships', entityId ? { entityId } : undefined),

  createRelationship: (data: any) =>
    knowledgeGraphClient.post('/relationships', data),

  searchEntities: (query: string, type?: string) =>
    knowledgeGraphClient.get('/search', { q: query, type }),
}

// ============================================================================
// NEXUS API (Networking & Funding)
// ============================================================================

export const nexusApi = {
  getNetwork: (userId: string) =>
    nexusClient.get(`/users/${userId}/network`),

  getIntroductions: (userId: string, status?: string) =>
    nexusClient.get(`/users/${userId}/introductions`, status ? { status } : undefined),

  requestIntroduction: (data: any) =>
    nexusClient.post('/introductions', data),

  respondToIntroduction: (introductionId: string, response: 'accept' | 'decline') =>
    nexusClient.post(`/introductions/${introductionId}/respond`, { response }),

  getFundingApplications: (companyId: string) =>
    nexusClient.get(`/companies/${companyId}/funding/applications`),

  createFundingApplication: (companyId: string, data: any) =>
    nexusClient.post(`/companies/${companyId}/funding/applications`, data),

  updateFundingApplication: (companyId: string, applicationId: string, data: any) =>
    nexusClient.put(`/companies/${companyId}/funding/applications/${applicationId}`, data),

  getInvestorProfiles: (params?: any) =>
    nexusClient.get('/investors', params),

  getMatches: (companyId: string, type: 'investors' | 'partners' | 'advisors') =>
    nexusClient.get(`/companies/${companyId}/matches/${type}`),
}

// ============================================================================
// PULSE API (Messaging)
// ============================================================================

export const pulseApi = {
  getConversations: (userId: string) =>
    pulseClient.get(`/users/${userId}/conversations`),

  getConversation: (conversationId: string) =>
    pulseClient.get(`/conversations/${conversationId}`),

  getMessages: (conversationId: string, params?: any) =>
    pulseClient.get(`/conversations/${conversationId}/messages`, params),

  sendMessage: (data: any) =>
    pulseClient.post('/messages', data),

  createConversation: (data: any) =>
    pulseClient.post('/conversations', data),

  archiveConversation: (conversationId: string) =>
    pulseClient.put(`/conversations/${conversationId}/archive`),

  markAsRead: (conversationId: string) =>
    pulseClient.put(`/conversations/${conversationId}/read`),
}

// ============================================================================
// COMPLIANCE API
// ============================================================================

export const complianceApi = {
  getTasks: (companyId: string, status?: string) =>
    complianceClient.get(`/companies/${companyId}/tasks`, status ? { status } : undefined),

  getTask: (companyId: string, taskId: string) =>
    complianceClient.get(`/companies/${companyId}/tasks/${taskId}`),

  updateTask: (companyId: string, taskId: string, data: any) =>
    complianceClient.put(`/companies/${companyId}/tasks/${taskId}`, data),

  getRecords: (companyId: string, type?: string) =>
    complianceClient.get(`/companies/${companyId}/records`, type ? { type } : undefined),

  submitFiling: (companyId: string, type: string, data: any) =>
    complianceClient.post(`/companies/${companyId}/filings/${type}`, data),

  checkCompliance: (companyId: string) =>
    complianceClient.get(`/companies/${companyId}/check`),
}

// ============================================================================
// CRM API
// ============================================================================

export const crmApi = {
  getContacts: (companyId: string, params?: any) =>
    crmClient.get(`/companies/${companyId}/contacts`, params),

  getContact: (companyId: string, contactId: string) =>
    crmClient.get(`/companies/${companyId}/contacts/${contactId}`),

  createContact: (companyId: string, data: any) =>
    crmClient.post(`/companies/${companyId}/contacts`, data),

  updateContact: (companyId: string, contactId: string, data: any) =>
    crmClient.put(`/companies/${companyId}/contacts/${contactId}`, data),

  deleteContact: (companyId: string, contactId: string) =>
    crmClient.delete(`/companies/${companyId}/contacts/${contactId}`),

  getDeals: (companyId: string, params?: any) =>
    crmClient.get(`/companies/${companyId}/deals`, params),

  getDeal: (companyId: string, dealId: string) =>
    crmClient.get(`/companies/${companyId}/deals/${dealId}`),

  createDeal: (companyId: string, data: any) =>
    crmClient.post(`/companies/${companyId}/deals`, data),

  updateDeal: (companyId: string, dealId: string, data: any) =>
    crmClient.put(`/companies/${companyId}/deals/${dealId}`, data),

  updateDealStage: (companyId: string, dealId: string, stage: string) =>
    crmClient.put(`/companies/${companyId}/deals/${dealId}/stage`, { stage }),
}

// ============================================================================
// CALENDAR API
// ============================================================================

export const calendarApi = {
  getEvents: (params?: any) =>
    calendarClient.get('/events', params),

  getEvent: (eventId: string) =>
    calendarClient.get(`/events/${eventId}`),

  createEvent: (data: any) =>
    calendarClient.post('/events', data),

  updateEvent: (eventId: string, data: any) =>
    calendarClient.put(`/events/${eventId}`, data),

  deleteEvent: (eventId: string) =>
    calendarClient.delete(`/events/${eventId}`),

  getAvailability: (userId: string, startDate: string, endDate: string) =>
    calendarClient.get(`/users/${userId}/availability`, { startDate, endDate }),
}

// ============================================================================
// BILLING API
// ============================================================================

export const billingApi = {
  getSubscription: () =>
    billingClient.get('/subscription'),

  updateSubscription: (data: any) =>
    billingClient.put('/subscription', data),

  cancelSubscription: () =>
    billingClient.delete('/subscription'),

  getInvoices: (params?: any) =>
    billingClient.get('/invoices', params),

  getInvoice: (invoiceId: string) =>
    billingClient.get(`/invoices/${invoiceId}`),

  downloadInvoice: (invoiceId: string) =>
    billingClient.get(`/invoices/${invoiceId}/download`),

  getPaymentMethods: () =>
    billingClient.get('/payment-methods'),

  addPaymentMethod: (data: any) =>
    billingClient.post('/payment-methods', data),

  updatePaymentMethod: (paymentMethodId: string, data: any) =>
    billingClient.put(`/payment-methods/${paymentMethodId}`, data),

  deletePaymentMethod: (paymentMethodId: string) =>
    billingClient.delete(`/payment-methods/${paymentMethodId}`),
}

// ============================================================================
// EXTERNAL INTEGRATIONS API
// ============================================================================

export const integrationsApi = {
  // Companies House
  searchCompanies: (query: string) =>
    apiClient.get('/integrations/companies-house/search', { q: query }),

  getCompanyDetails: (companyNumber: string) =>
    apiClient.get(`/integrations/companies-house/companies/${companyNumber}`),

  fileConfirmationStatement: (companyNumber: string, data: any) =>
    apiClient.post(`/integrations/companies-house/companies/${companyNumber}/confirmation-statement`, data),

  // HMRC
  submitVatReturn: (data: any) =>
    apiClient.post('/integrations/hmrc/vat/submit', data),

  getVatObligations: () =>
    apiClient.get('/integrations/hmrc/vat/obligations'),

  submitSelfAssessment: (data: any) =>
    apiClient.post('/integrations/hmrc/self-assessment/submit', data),

  getTaxLiabilities: () =>
    apiClient.get('/integrations/hmrc/tax/liabilities'),

  // ICO
  submitDataProtectionNotification: (data: any) =>
    apiClient.post('/integrations/ico/notification', data),

  // Stripe
  createPaymentIntent: (data: any) =>
    apiClient.post('/integrations/stripe/payment-intents', data),

  confirmPayment: (paymentIntentId: string, data: any) =>
    apiClient.post(`/integrations/stripe/payment-intents/${paymentIntentId}/confirm`, data),

  createSubscription: (data: any) =>
    apiClient.post('/integrations/stripe/subscriptions', data),

  updateSubscription: (subscriptionId: string, data: any) =>
    apiClient.put(`/integrations/stripe/subscriptions/${subscriptionId}`, data),

  // GoCardless
  createMandate: (data: any) =>
    apiClient.post('/integrations/gocardless/mandates', data),

  createPayment: (data: any) =>
    apiClient.post('/integrations/gocardless/payments', data),

  // Twilio
  sendSMS: (data: any) =>
    apiClient.post('/integrations/twilio/sms', data),

  sendWhatsApp: (data: any) =>
    apiClient.post('/integrations/twilio/whatsapp', data),

  makeCall: (data: any) =>
    apiClient.post('/integrations/twilio/call', data),

  // SendGrid
  sendEmail: (data: any) =>
    apiClient.post('/integrations/sendgrid/email', data),

  createContact: (data: any) =>
    apiClient.post('/integrations/sendgrid/contacts', data),

  // Telegram
  sendTelegramMessage: (data: any) =>
    apiClient.post('/integrations/telegram/message', data),

  // Firebase (Push Notifications)
  sendPushNotification: (data: any) =>
    apiClient.post('/integrations/firebase/notification', data),

  // Google Calendar
  createCalendarEvent: (data: any) =>
    apiClient.post('/integrations/google-calendar/events', data),

  getCalendarEvents: (params?: any) =>
    apiClient.get('/integrations/google-calendar/events', params),

  updateCalendarEvent: (eventId: string, data: any) =>
    apiClient.put(`/integrations/google-calendar/events/${eventId}`, data),

  // Calendly
  createCalendlyEvent: (data: any) =>
    apiClient.post('/integrations/calendly/events', data),

  getCalendlyAvailability: (userId: string) =>
    apiClient.get(`/integrations/calendly/users/${userId}/availability`),

  // Banking APIs
  connectBankAccount: (provider: string, data: any) =>
    apiClient.post(`/integrations/banking/${provider}/connect`, data),

  getBankAccounts: () =>
    apiClient.get('/integrations/banking/accounts'),

  getAccountBalance: (accountId: string) =>
    apiClient.get(`/integrations/banking/accounts/${accountId}/balance`),

  getTransactions: (accountId: string, params?: any) =>
    apiClient.get(`/integrations/banking/accounts/${accountId}/transactions`, params),

  initiateBankTransfer: (data: any) =>
    apiClient.post('/integrations/banking/transfers', data),

  // TrueLayer specific
  getTrueLayerAuthUrl: (data: any) =>
    apiClient.post('/integrations/truelayer/auth-url', data),

  refreshTrueLayerToken: (accountId: string) =>
    apiClient.post(`/integrations/truelayer/accounts/${accountId}/refresh`),

  // Plaid specific
  getPlaidLinkToken: (data: any) =>
    apiClient.post('/integrations/plaid/link-token', data),

  exchangePlaidToken: (data: any) =>
    apiClient.post('/integrations/plaid/exchange-token', data),
}

// ============================================================================
// REACT QUERY HOOKS INTEGRATION
// ============================================================================

// These would be used with React Query for caching and state management
export const apiHooks = {
  // Example of how these would be used with React Query
  useCompanies: () => ({ data: [], isLoading: false }), // Placeholder
  useCompany: (id: string) => ({ data: null, isLoading: false }), // Placeholder
  useFinancialData: (companyId: string) => ({ data: null, isLoading: false }), // Placeholder
  // ... more hooks would be defined here
}

export default apiClient