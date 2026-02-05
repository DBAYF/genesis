// ============================================================================
// GENESIS ENGINE - FIREBASE API CLIENT
// ============================================================================

// Conditionally import services based on mock mode
const useMockAPI = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'

let firebaseAuthService, firebaseCompanyService, firebaseRealtimeService, lovableAPIService

if (useMockAPI) {
  // Mock implementations for prototyping
  firebaseAuthService = {
    signIn: async (email: string, password: string) => {
      await new Promise(resolve => setTimeout(resolve, 500))
      return {
        token: 'mock-token',
        profile: {
          uid: 'mock-user-id',
          email,
          firstName: 'Mock',
          lastName: 'User',
          emailVerified: true
        }
      }
    },
    signUp: async (email: string, password: string, firstName: string, lastName: string) => {
      await new Promise(resolve => setTimeout(resolve, 500))
      return {
        token: 'mock-token',
        profile: {
          uid: 'mock-user-id',
          email,
          firstName,
          lastName,
          emailVerified: false
        }
      }
    },
    signOut: async () => {},
    resetPassword: async (email: string) => console.log('Mock: Password reset for', email),
    verifyEmail: async () => {},
    getCurrentUserProfile: async () => null,
    updateProfile: async (data: any) => data,
    signInWithGoogle: async () => ({
      token: 'mock-google-token',
      profile: { uid: 'mock-google-user', email: 'mock@google.com', firstName: 'Google', lastName: 'User' }
    }),
    signInWithLinkedIn: async () => ({
      token: 'mock-linkedin-token',
      profile: { uid: 'mock-linkedin-user', email: 'mock@linkedin.com', firstName: 'LinkedIn', lastName: 'User' }
    })
  }

  firebaseCompanyService = {
    createCompany: async (data: any) => ({ id: 'mock-company-id', ...data }),
    getCompany: async (id: string) => ({ id, name: 'Mock Company', ...mockData.companies[0] }),
    updateCompany: async (id: string, data: any) => ({ id, ...data }),
    deleteCompany: async (id: string) => {},
    getUserCompanies: async (userId: string) => [mockData.companies[0]],
    searchCompanies: async (query: string) => mockData.companies.filter(c => c.name.includes(query))
  }

  firebaseRealtimeService = {
    sendMessage: async (data: any) => 'mock-message-id',
    onMessages: (conversationId: string, callback: (messages: Message[]) => void, limit: number = 50) => {
      // Mock: immediately call callback with empty array
      callback([])
      return () => console.log('Mock: Unsubscribed from messages')
    },
    onNewMessages: (conversationId: string, callback: (messages: Message[]) => void) => {
      callback([])
      return () => console.log('Mock: Unsubscribed from new messages')
    },
    setTyping: (conversationId: string, userId: string, userName: string) => {
      console.log(`Mock: ${userName} is typing in ${conversationId}`)
    },
    onTypingIndicators: (conversationId: string, callback: (indicators: any[]) => void) => {
      callback([])
      return () => console.log('Mock: Unsubscribed from typing indicators')
    },
    setPresence: async (userId: string, presence: any) => {},
    onPresenceChange: (userIds: string[], callback: (presences: any[]) => void) => {
      callback([])
      return () => console.log('Mock: Unsubscribed from presence')
    },
    sendNotification: async (notification: any) => 'mock-notification-id'
  }

  lovableAPIService = {
    executeRequest: async (request: any) => {
      await new Promise(resolve => setTimeout(resolve, 300))
      // Mock responses based on endpoint
      if (request.path?.includes('financial')) {
        return { projections: [], summary: { totalIncome: 0, totalExpenses: 0, netIncome: 0 } }
      }
      if (request.path?.includes('entities')) {
        return mockData.entities
      }
      if (request.path?.includes('nexus')) {
        return mockData.introductionRequests
      }
      if (request.path?.includes('pulse')) {
        return mockData.conversations
      }
      return { success: true }
    }
  }
} else {
  // Real implementations
  firebaseAuthService = require('../../../firebase/services/auth.service').firebaseAuthService
  firebaseCompanyService = require('../../../firebase/services/company.service').firebaseCompanyService
  firebaseRealtimeService = require('../../../realtime/realtime.service').firebaseRealtimeService
  lovableAPIService = require('../../../lovable/lovable-api').lovableAPIService
}

// Import mock data and types for mock implementations
import { mockData } from '@/data/mockData'
import { Message } from '@/types'

// ============================================================================
// FIREBASE API CLIENT
// ============================================================================

export class FirebaseAPIClient {
  private static instance: FirebaseAPIClient

  public static getInstance(): FirebaseAPIClient {
    if (!FirebaseAPIClient.instance) {
      FirebaseAPIClient.instance = new FirebaseAPIClient()
    }
    return FirebaseAPIClient.instance
  }

  // ============================================================================
  // AUTHENTICATION API
  // ============================================================================

  auth = {
    login: async (credentials: { email: string; password: string }) => {
      const result = await firebaseAuthService.signIn(credentials.email, credentials.password)
      // Store token in localStorage for backward compatibility
      localStorage.setItem('auth_token', result.token)
      return { token: result.token, user: result.profile }
    },

    register: async (userData: any) => {
      const result = await firebaseAuthService.signUp(
        userData.email,
        userData.password,
        userData.firstName,
        userData.lastName
      )
      localStorage.setItem('auth_token', result.token)
      return { token: result.token, user: result.profile }
    },

    logout: async () => {
      await firebaseAuthService.signOut()
      localStorage.removeItem('auth_token')
    },

    refreshToken: async () => {
      const token = await firebaseAuthService.refreshToken()
      if (token) {
        localStorage.setItem('auth_token', token)
      }
      return { token }
    },

    forgotPassword: (email: string) =>
      firebaseAuthService.resetPassword(email),

    resetPassword: async (data: { token: string; password: string }) => {
      // This would need to be handled differently with Firebase
      throw new Error('Password reset via token not supported with Firebase. Use forgotPassword instead.')
    },

    verifyEmail: () =>
      firebaseAuthService.verifyEmail(),

    signInWithGoogle: async () => {
      const result = await firebaseAuthService.signInWithGoogle()
      localStorage.setItem('auth_token', result.token)
      return { token: result.token, user: result.profile }
    },

    signInWithLinkedIn: async () => {
      const result = await firebaseAuthService.signInWithLinkedIn()
      localStorage.setItem('auth_token', result.token)
      return { token: result.token, user: result.profile }
    }
  }

  // ============================================================================
  // USER MANAGEMENT API
  // ============================================================================

  user = {
    getProfile: () =>
      firebaseAuthService.getCurrentUserProfile(),

    updateProfile: (data: any) =>
      firebaseAuthService.updateProfile(data),

    updatePreferences: async (preferences: any) => {
      // This would need to be stored in Firestore
      const user = await firebaseAuthService.getCurrentUserProfile()
      if (user) {
        await firebaseAuthService.updateProfile({
          ...user,
          preferences
        })
      }
    },

    getSettings: async () => {
      // This would need to be stored in Firestore
      const user = await firebaseAuthService.getCurrentUserProfile()
      return user?.settings || {}
    },

    updateSettings: async (settings: any) => {
      const user = await firebaseAuthService.getCurrentUserProfile()
      if (user) {
        await firebaseAuthService.updateProfile({
          ...user,
          settings
        })
      }
    }
  }

  // ============================================================================
  // COMPANY MANAGEMENT API
  // ============================================================================

  company = {
    getCompanies: async () => {
      const user = await firebaseAuthService.getCurrentUserProfile()
      if (!user) return []
      return firebaseCompanyService.getUserCompanies(user.uid)
    },

    getCompany: (id: string) =>
      firebaseCompanyService.getCompany(id),

    createCompany: (data: any) => {
      const user = firebaseAuthService.auth.currentUser
      if (!user) throw new Error('Not authenticated')
      return firebaseCompanyService.createCompany({
        ...data,
        ownerId: user.uid
      })
    },

    updateCompany: (id: string, data: any) =>
      firebaseCompanyService.updateCompany(id, data),

    deleteCompany: (id: string) =>
      firebaseCompanyService.deleteCompany(id),

    incorporateCompany: async (data: any) => {
      // This would integrate with Lovable API for external services
      return lovableAPIService.executeRequest({
        endpointId: 'incorporation-service',
        method: 'POST',
        path: '/incorporate',
        body: data
      })
    },

    searchCompanies: (query: string) =>
      firebaseCompanyService.searchCompanies(query)
  }

  // ============================================================================
  // FINANCIAL API
  // ============================================================================

  financial = {
    getProjections: async (companyId: string, scenario?: string) => {
      // This would be stored in Firestore
      return lovableAPIService.executeRequest({
        endpointId: 'financial-service',
        method: 'GET',
        path: `/companies/${companyId}/projections`,
        query: scenario ? { scenario } : {}
      })
    },

    createProjection: (companyId: string, data: any) =>
      lovableAPIService.executeRequest({
        endpointId: 'financial-service',
        method: 'POST',
        path: `/companies/${companyId}/projections`,
        body: data
      }),

    updateProjection: (companyId: string, projectionId: string, data: any) =>
      lovableAPIService.executeRequest({
        endpointId: 'financial-service',
        method: 'PUT',
        path: `/companies/${companyId}/projections/${projectionId}`,
        body: data
      }),

    getTransactions: (companyId: string, params?: any) =>
      lovableAPIService.executeRequest({
        endpointId: 'financial-service',
        method: 'GET',
        path: `/companies/${companyId}/transactions`,
        query: params
      }),

    createTransaction: (companyId: string, data: any) =>
      lovableAPIService.executeRequest({
        endpointId: 'financial-service',
        method: 'POST',
        path: `/companies/${companyId}/transactions`,
        body: data
      }),

    updateTransaction: (companyId: string, transactionId: string, data: any) =>
      lovableAPIService.executeRequest({
        endpointId: 'financial-service',
        method: 'PUT',
        path: `/companies/${companyId}/transactions/${transactionId}`,
        body: data
      }),

    getSummary: (companyId: string, period?: string) =>
      lovableAPIService.executeRequest({
        endpointId: 'financial-service',
        method: 'GET',
        path: `/companies/${companyId}/summary`,
        query: period ? { period } : {}
      }),

    generateReport: (companyId: string, type: string, params?: any) =>
      lovableAPIService.executeRequest({
        endpointId: 'financial-service',
        method: 'POST',
        path: `/companies/${companyId}/reports/${type}`,
        body: params
      })
  }

  // ============================================================================
  // KNOWLEDGE GRAPH API
  // ============================================================================

  knowledgeGraph = {
    getEntities: (params?: any) =>
      lovableAPIService.executeRequest({
        endpointId: 'knowledge-graph-service',
        method: 'GET',
        path: '/entities',
        query: params
      }),

    getEntity: (id: string) =>
      lovableAPIService.executeRequest({
        endpointId: 'knowledge-graph-service',
        method: 'GET',
        path: `/entities/${id}`
      }),

    createEntity: (data: any) =>
      lovableAPIService.executeRequest({
        endpointId: 'knowledge-graph-service',
        method: 'POST',
        path: '/entities',
        body: data
      }),

    updateEntity: (id: string, data: any) =>
      lovableAPIService.executeRequest({
        endpointId: 'knowledge-graph-service',
        method: 'PUT',
        path: `/entities/${id}`,
        body: data
      }),

    deleteEntity: (id: string) =>
      lovableAPIService.executeRequest({
        endpointId: 'knowledge-graph-service',
        method: 'DELETE',
        path: `/entities/${id}`
      }),

    getRelationships: (entityId?: string) =>
      lovableAPIService.executeRequest({
        endpointId: 'knowledge-graph-service',
        method: 'GET',
        path: '/relationships',
        query: entityId ? { entityId } : {}
      }),

    createRelationship: (data: any) =>
      lovableAPIService.executeRequest({
        endpointId: 'knowledge-graph-service',
        method: 'POST',
        path: '/relationships',
        body: data
      }),

    searchEntities: (query: string, type?: string) =>
      lovableAPIService.executeRequest({
        endpointId: 'knowledge-graph-service',
        method: 'GET',
        path: '/search',
        query: { q: query, type }
      })
  }

  // ============================================================================
  // NEXUS API (Networking & Funding)
  // ============================================================================

  nexus = {
    getNetwork: (userId: string) =>
      lovableAPIService.executeRequest({
        endpointId: 'nexus-service',
        method: 'GET',
        path: `/users/${userId}/network`
      }),

    getIntroductions: (userId: string, status?: string) =>
      lovableAPIService.executeRequest({
        endpointId: 'nexus-service',
        method: 'GET',
        path: `/users/${userId}/introductions`,
        query: status ? { status } : {}
      }),

    requestIntroduction: (data: any) =>
      lovableAPIService.executeRequest({
        endpointId: 'nexus-service',
        method: 'POST',
        path: '/introductions',
        body: data
      }),

    respondToIntroduction: (introductionId: string, response: 'accept' | 'decline') =>
      lovableAPIService.executeRequest({
        endpointId: 'nexus-service',
        method: 'POST',
        path: `/introductions/${introductionId}/respond`,
        body: { response }
      }),

    getFundingApplications: (companyId: string) =>
      lovableAPIService.executeRequest({
        endpointId: 'nexus-service',
        method: 'GET',
        path: `/companies/${companyId}/funding/applications`
      }),

    createFundingApplication: (companyId: string, data: any) =>
      lovableAPIService.executeRequest({
        endpointId: 'nexus-service',
        method: 'POST',
        path: `/companies/${companyId}/funding/applications`,
        body: data
      }),

    updateFundingApplication: (companyId: string, applicationId: string, data: any) =>
      lovableAPIService.executeRequest({
        endpointId: 'nexus-service',
        method: 'PUT',
        path: `/companies/${companyId}/funding/applications/${applicationId}`,
        body: data
      }),

    getInvestorProfiles: (params?: any) =>
      lovableAPIService.executeRequest({
        endpointId: 'nexus-service',
        method: 'GET',
        path: '/investors',
        query: params
      }),

    getMatches: (companyId: string, type: 'investors' | 'partners' | 'advisors') =>
      lovableAPIService.executeRequest({
        endpointId: 'nexus-service',
        method: 'GET',
        path: `/companies/${companyId}/matches/${type}`
      })
  }

  // ============================================================================
  // PULSE API (Real-time Messaging)
  // ============================================================================

  pulse = {
    getConversations: async (userId: string) => {
      // This would be handled through Firestore for conversation metadata
      return lovableAPIService.executeRequest({
        endpointId: 'pulse-service',
        method: 'GET',
        path: `/users/${userId}/conversations`
      })
    },

    getConversation: (conversationId: string) =>
      lovableAPIService.executeRequest({
        endpointId: 'pulse-service',
        method: 'GET',
        path: `/conversations/${conversationId}`
      }),

    getMessages: async (conversationId: string, params?: any) => {
      // Real-time messages are handled by firebaseRealtimeService
      // This is just for historical messages
      return lovableAPIService.executeRequest({
        endpointId: 'pulse-service',
        method: 'GET',
        path: `/conversations/${conversationId}/messages`,
        query: params
      })
    },

    sendMessage: (data: any) => {
      // Use real-time service for immediate sending
      return firebaseRealtimeService.sendMessage(data)
    },

    createConversation: (data: any) =>
      lovableAPIService.executeRequest({
        endpointId: 'pulse-service',
        method: 'POST',
        path: '/conversations',
        body: data
      }),

    archiveConversation: (conversationId: string) =>
      lovableAPIService.executeRequest({
        endpointId: 'pulse-service',
        method: 'PUT',
        path: `/conversations/${conversationId}/archive`
      }),

    markAsRead: (conversationId: string) =>
      lovableAPIService.executeRequest({
        endpointId: 'pulse-service',
        method: 'PUT',
        path: `/conversations/${conversationId}/read`
      }),

    // Real-time features
    onMessages: firebaseRealtimeService.onMessages.bind(firebaseRealtimeService),
    onNewMessages: firebaseRealtimeService.onNewMessages.bind(firebaseRealtimeService),
    setTyping: firebaseRealtimeService.setTyping.bind(firebaseRealtimeService),
    onTypingIndicators: firebaseRealtimeService.onTypingIndicators.bind(firebaseRealtimeService)
  }

  // ============================================================================
  // COMPLIANCE API
  // ============================================================================

  compliance = {
    getTasks: (companyId: string, status?: string) =>
      lovableAPIService.executeRequest({
        endpointId: 'compliance-service',
        method: 'GET',
        path: `/companies/${companyId}/tasks`,
        query: status ? { status } : {}
      }),

    getTask: (companyId: string, taskId: string) =>
      lovableAPIService.executeRequest({
        endpointId: 'compliance-service',
        method: 'GET',
        path: `/companies/${companyId}/tasks/${taskId}`
      }),

    updateTask: (companyId: string, taskId: string, data: any) =>
      lovableAPIService.executeRequest({
        endpointId: 'compliance-service',
        method: 'PUT',
        path: `/companies/${companyId}/tasks/${taskId}`,
        body: data
      }),

    getRecords: (companyId: string, type?: string) =>
      lovableAPIService.executeRequest({
        endpointId: 'compliance-service',
        method: 'GET',
        path: `/companies/${companyId}/records`,
        query: type ? { type } : {}
      }),

    submitFiling: (companyId: string, type: string, data: any) =>
      lovableAPIService.executeRequest({
        endpointId: 'compliance-service',
        method: 'POST',
        path: `/companies/${companyId}/filings/${type}`,
        body: data
      }),

    checkCompliance: (companyId: string) =>
      lovableAPIService.executeRequest({
        endpointId: 'compliance-service',
        method: 'GET',
        path: `/companies/${companyId}/check`
      })
  }

  // ============================================================================
  // CRM API
  // ============================================================================

  crm = {
    getContacts: (companyId: string, params?: any) =>
      lovableAPIService.executeRequest({
        endpointId: 'crm-service',
        method: 'GET',
        path: `/companies/${companyId}/contacts`,
        query: params
      }),

    getContact: (companyId: string, contactId: string) =>
      lovableAPIService.executeRequest({
        endpointId: 'crm-service',
        method: 'GET',
        path: `/companies/${companyId}/contacts/${contactId}`
      }),

    createContact: (companyId: string, data: any) =>
      lovableAPIService.executeRequest({
        endpointId: 'crm-service',
        method: 'POST',
        path: `/companies/${companyId}/contacts`,
        body: data
      }),

    updateContact: (companyId: string, contactId: string, data: any) =>
      lovableAPIService.executeRequest({
        endpointId: 'crm-service',
        method: 'PUT',
        path: `/companies/${companyId}/contacts/${contactId}`,
        body: data
      }),

    deleteContact: (companyId: string, contactId: string) =>
      lovableAPIService.executeRequest({
        endpointId: 'crm-service',
        method: 'DELETE',
        path: `/companies/${companyId}/contacts/${contactId}`
      }),

    getDeals: (companyId: string, params?: any) =>
      lovableAPIService.executeRequest({
        endpointId: 'crm-service',
        method: 'GET',
        path: `/companies/${companyId}/deals`,
        query: params
      }),

    getDeal: (companyId: string, dealId: string) =>
      lovableAPIService.executeRequest({
        endpointId: 'crm-service',
        method: 'GET',
        path: `/companies/${companyId}/deals/${dealId}`
      }),

    createDeal: (companyId: string, data: any) =>
      lovableAPIService.executeRequest({
        endpointId: 'crm-service',
        method: 'POST',
        path: `/companies/${companyId}/deals`,
        body: data
      }),

    updateDeal: (companyId: string, dealId: string, data: any) =>
      lovableAPIService.executeRequest({
        endpointId: 'crm-service',
        method: 'PUT',
        path: `/companies/${companyId}/deals/${dealId}`,
        body: data
      }),

    updateDealStage: (companyId: string, dealId: string, stage: string) =>
      lovableAPIService.executeRequest({
        endpointId: 'crm-service',
        method: 'PUT',
        path: `/companies/${companyId}/deals/${dealId}/stage`,
        body: { stage }
      })
  }

  // ============================================================================
  // CALENDAR API
  // ============================================================================

  calendar = {
    getEvents: (params?: any) =>
      lovableAPIService.executeRequest({
        endpointId: 'calendar-service',
        method: 'GET',
        path: '/events',
        query: params
      }),

    getEvent: (eventId: string) =>
      lovableAPIService.executeRequest({
        endpointId: 'calendar-service',
        method: 'GET',
        path: `/events/${eventId}`
      }),

    createEvent: (data: any) =>
      lovableAPIService.executeRequest({
        endpointId: 'calendar-service',
        method: 'POST',
        path: '/events',
        body: data
      }),

    updateEvent: (eventId: string, data: any) =>
      lovableAPIService.executeRequest({
        endpointId: 'calendar-service',
        method: 'PUT',
        path: `/events/${eventId}`,
        body: data
      }),

    deleteEvent: (eventId: string) =>
      lovableAPIService.executeRequest({
        endpointId: 'calendar-service',
        method: 'DELETE',
        path: `/events/${eventId}`
      }),

    getAvailability: (userId: string, startDate: string, endDate: string) =>
      lovableAPIService.executeRequest({
        endpointId: 'calendar-service',
        method: 'GET',
        path: `/users/${userId}/availability`,
        query: { startDate, endDate }
      })
  }

  // ============================================================================
  // BILLING API
  // ============================================================================

  billing = {
    getSubscription: () =>
      lovableAPIService.executeRequest({
        endpointId: 'billing-service',
        method: 'GET',
        path: '/subscription'
      }),

    updateSubscription: (data: any) =>
      lovableAPIService.executeRequest({
        endpointId: 'billing-service',
        method: 'PUT',
        path: '/subscription',
        body: data
      }),

    cancelSubscription: () =>
      lovableAPIService.executeRequest({
        endpointId: 'billing-service',
        method: 'DELETE',
        path: '/subscription'
      }),

    getInvoices: (params?: any) =>
      lovableAPIService.executeRequest({
        endpointId: 'billing-service',
        method: 'GET',
        path: '/invoices',
        query: params
      }),

    getInvoice: (invoiceId: string) =>
      lovableAPIService.executeRequest({
        endpointId: 'billing-service',
        method: 'GET',
        path: `/invoices/${invoiceId}`
      }),

    downloadInvoice: (invoiceId: string) =>
      lovableAPIService.executeRequest({
        endpointId: 'billing-service',
        method: 'GET',
        path: `/invoices/${invoiceId}/download`
      }),

    getPaymentMethods: () =>
      lovableAPIService.executeRequest({
        endpointId: 'billing-service',
        method: 'GET',
        path: '/payment-methods'
      }),

    addPaymentMethod: (data: any) =>
      lovableAPIService.executeRequest({
        endpointId: 'billing-service',
        method: 'POST',
        path: '/payment-methods',
        body: data
      }),

    updatePaymentMethod: (paymentMethodId: string, data: any) =>
      lovableAPIService.executeRequest({
        endpointId: 'billing-service',
        method: 'PUT',
        path: `/payment-methods/${paymentMethodId}`,
        body: data
      }),

    deletePaymentMethod: (paymentMethodId: string) =>
      lovableAPIService.executeRequest({
        endpointId: 'billing-service',
        method: 'DELETE',
        path: `/payment-methods/${paymentMethodId}`
      })
  }

  // ============================================================================
  // EXTERNAL INTEGRATIONS API
  // ============================================================================

  integrations = {
    // Companies House
    searchCompanies: (query: string) =>
      lovableAPIService.executeRequest({
        endpointId: 'companies-house-integration',
        method: 'GET',
        path: '/search',
        query: { q: query }
      }),

    getCompanyDetails: (companyNumber: string) =>
      lovableAPIService.executeRequest({
        endpointId: 'companies-house-integration',
        method: 'GET',
        path: `/companies/${companyNumber}`
      }),

    fileConfirmationStatement: (companyNumber: string, data: any) =>
      lovableAPIService.executeRequest({
        endpointId: 'companies-house-integration',
        method: 'POST',
        path: `/companies/${companyNumber}/confirmation-statement`,
        body: data
      }),

    // HMRC
    submitVatReturn: (data: any) =>
      lovableAPIService.executeRequest({
        endpointId: 'hmrc-integration',
        method: 'POST',
        path: '/vat/submit',
        body: data
      }),

    getVatObligations: () =>
      lovableAPIService.executeRequest({
        endpointId: 'hmrc-integration',
        method: 'GET',
        path: '/vat/obligations'
      }),

    submitSelfAssessment: (data: any) =>
      lovableAPIService.executeRequest({
        endpointId: 'hmrc-integration',
        method: 'POST',
        path: '/self-assessment/submit',
        body: data
      }),

    getTaxLiabilities: () =>
      lovableAPIService.executeRequest({
        endpointId: 'hmrc-integration',
        method: 'GET',
        path: '/tax/liabilities'
      }),

    // ICO
    submitDataProtectionNotification: (data: any) =>
      lovableAPIService.executeRequest({
        endpointId: 'ico-integration',
        method: 'POST',
        path: '/notification',
        body: data
      }),

    // Communication services (Twilio, SendGrid, Telegram, Firebase)
    sendSMS: (data: any) =>
      firebaseRealtimeService.sendNotification({
        userId: data.to,
        type: 'system',
        title: 'SMS',
        body: data.message
      }),

    sendEmail: (data: any) =>
      lovableAPIService.executeRequest({
        endpointId: 'email-service',
        method: 'POST',
        path: '/send',
        body: data
      }),

    sendPushNotification: (data: any) =>
      firebaseRealtimeService.sendNotification(data)
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const firebaseAPI = FirebaseAPIClient.getInstance()

// For backward compatibility
export default firebaseAPI