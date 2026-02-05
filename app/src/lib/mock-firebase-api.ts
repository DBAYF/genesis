// ============================================================================
// GENESIS ENGINE - MOCK FIREBASE API CLIENT (FOR DEVELOPMENT)
// ============================================================================

import { mockData } from '@/data/mockData'

// Mock delay for realistic API simulation
const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms))

// Mock user session
let mockCurrentUser: any = null
let mockToken: string = 'mock-jwt-token'

// ============================================================================
// MOCK FIREBASE API CLIENT
// ============================================================================

export class MockFirebaseAPIClient {
  private static instance: MockFirebaseAPIClient

  public static getInstance(): MockFirebaseAPIClient {
    if (!MockFirebaseAPIClient.instance) {
      MockFirebaseAPIClient.instance = new MockFirebaseAPIClient()
    }
    return MockFirebaseAPIClient.instance
  }

  // ============================================================================
  // AUTHENTICATION API
  // ============================================================================

  auth = {
    login: async (credentials: { email: string; password: string }) => {
      await mockDelay()
      const user = mockData.users.find(u => u.email === credentials.email)
      if (user && credentials.password === 'password') {
        mockCurrentUser = user
        mockToken = 'mock-jwt-token-' + user.id
        localStorage.setItem('auth_token', mockToken)
        return { token: mockToken, user }
      }
      throw new Error('Invalid credentials')
    },

    register: async (userData: any) => {
      await mockDelay()
      const newUser = {
        id: `user-${Date.now()}`,
        ...userData,
        emailVerified: false,
        phoneVerified: false,
        onboardingCompleted: false,
        pulseEnabled: true,
        pulsePreferredChannel: 'email',
        pulseActiveHoursStart: '09:00',
        pulseActiveHoursEnd: '17:00',
        pulseDigestTime: '08:00',
        status: 'active',
        lastActiveAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      mockData.users.push(newUser)
      mockCurrentUser = newUser
      mockToken = 'mock-jwt-token-' + newUser.id
      localStorage.setItem('auth_token', mockToken)
      return { token: mockToken, user: newUser }
    },

    logout: async () => {
      await mockDelay()
      mockCurrentUser = null
      mockToken = ''
      localStorage.removeItem('auth_token')
    },

    refreshToken: async () => {
      await mockDelay()
      if (mockCurrentUser) {
        mockToken = 'mock-jwt-token-refreshed-' + mockCurrentUser.id
        return { token: mockToken }
      }
      return { token: '' }
    },

    forgotPassword: async (email: string) => {
      await mockDelay()
      console.log(`Mock: Password reset email sent to ${email}`)
    },

    resetPassword: async (data: { token: string; password: string }) => {
      await mockDelay()
      console.log('Mock: Password reset with token')
    },

    verifyEmail: async () => {
      await mockDelay()
      if (mockCurrentUser) {
        mockCurrentUser.emailVerified = true
      }
    },

    signInWithGoogle: async () => {
      await mockDelay()
      const user = mockData.users[0] // Use first user as mock Google user
      mockCurrentUser = user
      mockToken = 'mock-google-jwt-token-' + user.id
      localStorage.setItem('auth_token', mockToken)
      return { token: mockToken, user }
    },

    signInWithLinkedIn: async () => {
      await mockDelay()
      const user = mockData.users[1] // Use second user as mock LinkedIn user
      mockCurrentUser = user
      mockToken = 'mock-linkedin-jwt-token-' + user.id
      localStorage.setItem('auth_token', mockToken)
      return { token: mockToken, user }
    }
  }

  // ============================================================================
  // USER MANAGEMENT API
  // ============================================================================

  user = {
    getProfile: async () => {
      await mockDelay()
      return mockCurrentUser
    },

    updateProfile: async (data: any) => {
      await mockDelay()
      if (mockCurrentUser) {
        mockCurrentUser = { ...mockCurrentUser, ...data, updatedAt: new Date().toISOString() }
      }
      return mockCurrentUser
    },

    updatePreferences: async (preferences: any) => {
      await mockDelay()
      if (mockCurrentUser) {
        mockCurrentUser.preferences = { ...mockCurrentUser.preferences, ...preferences }
        mockCurrentUser.updatedAt = new Date().toISOString()
      }
      return mockCurrentUser
    },

    getSettings: async () => {
      await mockDelay()
      return mockCurrentUser?.settings || {}
    },

    updateSettings: async (settings: any) => {
      await mockDelay()
      if (mockCurrentUser) {
        mockCurrentUser.settings = { ...mockCurrentUser.settings, ...settings }
        mockCurrentUser.updatedAt = new Date().toISOString()
      }
      return mockCurrentUser
    }
  }

  // ============================================================================
  // COMPANY MANAGEMENT API
  // ============================================================================

  company = {
    getCompanies: async () => {
      await mockDelay()
      return mockData.companies
    },

    getCompany: async (id: string) => {
      await mockDelay()
      return mockData.companies.find(c => c.id === id) || null
    },

    createCompany: async (data: any) => {
      await mockDelay()
      const newCompany = {
        id: `company-${Date.now()}`,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      mockData.companies.push(newCompany)
      return newCompany
    },

    updateCompany: async (id: string, data: any) => {
      await mockDelay()
      const company = mockData.companies.find(c => c.id === id)
      if (company) {
        Object.assign(company, data, { updatedAt: new Date().toISOString() })
      }
      return company
    },

    deleteCompany: async (id: string) => {
      await mockDelay()
      const index = mockData.companies.findIndex(c => c.id === id)
      if (index > -1) {
        mockData.companies.splice(index, 1)
      }
    },

    incorporateCompany: async (data: any) => {
      await mockDelay()
      console.log('Mock: Company incorporation initiated', data)
      return { status: 'initiated', id: `incorporation-${Date.now()}` }
    },

    searchCompanies: async (query: string) => {
      await mockDelay()
      return mockData.companies.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.tradingName?.toLowerCase().includes(query.toLowerCase())
      )
    }
  }

  // ============================================================================
  // FINANCIAL API
  // ============================================================================

  financial = {
    getProjections: async (companyId: string, scenario?: string) => {
      await mockDelay()
      return mockData.financialProjections.filter(p =>
        p.companyId === companyId &&
        (!scenario || p.scenario === scenario)
      )
    },

    createProjection: async (companyId: string, data: any) => {
      await mockDelay()
      const newProjection = {
        id: `projection-${Date.now()}`,
        companyId,
        ...data,
        createdAt: new Date().toISOString(),
      }
      mockData.financialProjections.push(newProjection)
      return newProjection
    },

    updateProjection: async (companyId: string, projectionId: string, data: any) => {
      await mockDelay()
      const projection = mockData.financialProjections.find(p => p.id === projectionId)
      if (projection) {
        Object.assign(projection, data)
      }
      return projection
    },

    getTransactions: async (companyId: string, params?: any) => {
      await mockDelay()
      let transactions = mockData.transactions.filter(t => t.companyId === companyId)
      if (params?.category) {
        transactions = transactions.filter(t => t.category === params.category)
      }
      if (params?.type) {
        transactions = transactions.filter(t => t.type === params.type)
      }
      return transactions
    },

    createTransaction: async (companyId: string, data: any) => {
      await mockDelay()
      const newTransaction = {
        id: `transaction-${Date.now()}`,
        companyId,
        ...data,
        reconciled: false,
        createdAt: new Date().toISOString(),
      }
      mockData.transactions.push(newTransaction)
      return newTransaction
    },

    updateTransaction: async (companyId: string, transactionId: string, data: any) => {
      await mockDelay()
      const transaction = mockData.transactions.find(t => t.id === transactionId)
      if (transaction) {
        Object.assign(transaction, data)
      }
      return transaction
    },

    getSummary: async (companyId: string, period?: string) => {
      await mockDelay()
      const transactions = mockData.transactions.filter(t => t.companyId === companyId)
      const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0)

      return {
        period: period || 'current',
        totalIncome,
        totalExpenses,
        netIncome: totalIncome - totalExpenses,
        transactionCount: transactions.length
      }
    },

    generateReport: async (companyId: string, type: string, params?: any) => {
      await mockDelay()
      return {
        id: `report-${Date.now()}`,
        type,
        companyId,
        status: 'generated',
        url: `/reports/${type}-${companyId}.pdf`,
        createdAt: new Date().toISOString()
      }
    }
  }

  // ============================================================================
  // KNOWLEDGE GRAPH API
  // ============================================================================

  knowledgeGraph = {
    getEntities: async (params?: any) => {
      await mockDelay()
      let entities = [...mockData.entities]
      if (params?.type) {
        entities = entities.filter(e => e.type === params.type)
      }
      if (params?.search) {
        entities = entities.filter(e =>
          e.name.toLowerCase().includes(params.search.toLowerCase()) ||
          e.description.toLowerCase().includes(params.search.toLowerCase())
        )
      }
      return entities
    },

    getEntity: async (id: string) => {
      await mockDelay()
      return mockData.entities.find(e => e.id === id) || null
    },

    createEntity: async (data: any) => {
      await mockDelay()
      const newEntity = {
        id: `entity-${Date.now()}`,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      mockData.entities.push(newEntity)
      return newEntity
    },

    updateEntity: async (id: string, data: any) => {
      await mockDelay()
      const entity = mockData.entities.find(e => e.id === id)
      if (entity) {
        Object.assign(entity, data, { updatedAt: new Date().toISOString() })
      }
      return entity
    },

    deleteEntity: async (id: string) => {
      await mockDelay()
      const index = mockData.entities.findIndex(e => e.id === id)
      if (index > -1) {
        mockData.entities.splice(index, 1)
      }
    },

    getRelationships: async (entityId?: string) => {
      await mockDelay()
      return mockData.relationships.filter(r =>
        !entityId || r.fromEntityId === entityId || r.toEntityId === entityId
      )
    },

    createRelationship: async (data: any) => {
      await mockDelay()
      const newRelationship = {
        id: `relationship-${Date.now()}`,
        ...data,
        strength: 0.5,
        createdAt: new Date().toISOString(),
      }
      mockData.relationships.push(newRelationship)
      return newRelationship
    },

    searchEntities: async (query: string, type?: string) => {
      await mockDelay()
      let entities = mockData.entities.filter(e =>
        e.name.toLowerCase().includes(query.toLowerCase()) ||
        e.description.toLowerCase().includes(query.toLowerCase())
      )
      if (type) {
        entities = entities.filter(e => e.type === type)
      }
      return entities
    }
  }

  // ============================================================================
  // NEXUS API (Networking & Funding)
  // ============================================================================

  nexus = {
    getNetwork: async (userId: string) => {
      await mockDelay()
      return mockData.entities.filter(e => e.type === 'company' || e.type === 'investor')
    },

    getIntroductions: async (userId: string, status?: string) => {
      await mockDelay()
      let introductions = mockData.introductionRequests.filter(i =>
        i.fromUserId === userId || i.toUserId === userId
      )
      if (status) {
        introductions = introductions.filter(i => i.status === status)
      }
      return introductions
    },

    requestIntroduction: async (data: any) => {
      await mockDelay()
      const newRequest = {
        id: `intro-${Date.now()}`,
        ...data,
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
      mockData.introductionRequests.push(newRequest)
      return newRequest
    },

    respondToIntroduction: async (introductionId: string, response: 'accept' | 'decline') => {
      await mockDelay()
      const intro = mockData.introductionRequests.find(i => i.id === introductionId)
      if (intro) {
        intro.status = response === 'accept' ? 'accepted' : 'declined'
      }
      return { success: true }
    },

    getFundingApplications: async (companyId: string) => {
      await mockDelay()
      return mockData.fundingApplications.filter(f => f.companyId === companyId)
    },

    createFundingApplication: async (companyId: string, data: any) => {
      await mockDelay()
      const newApplication = {
        id: `funding-${Date.now()}`,
        companyId,
        ...data,
        status: 'draft',
        submittedAt: null,
        createdAt: new Date().toISOString(),
      }
      mockData.fundingApplications.push(newApplication)
      return newApplication
    },

    updateFundingApplication: async (companyId: string, applicationId: string, data: any) => {
      await mockDelay()
      const application = mockData.fundingApplications.find(f => f.id === applicationId)
      if (application) {
        Object.assign(application, data)
      }
      return application
    },

    getInvestorProfiles: async (params?: any) => {
      await mockDelay()
      return mockData.investorProfiles
    },

    getMatches: async (companyId: string, type: 'investors' | 'partners' | 'advisors') => {
      await mockDelay()
      return mockData.entities.filter(e => e.type === type.slice(0, -1)) // Remove 's' from type
    }
  }

  // ============================================================================
  // PULSE API (Real-time Messaging)
  // ============================================================================

  pulse = {
    getConversations: async (userId: string) => {
      await mockDelay()
      return mockData.conversations.filter(c => c.userId === userId)
    },

    getConversation: async (conversationId: string) => {
      await mockDelay()
      return mockData.conversations.find(c => c.id === conversationId) || null
    },

    getMessages: async (conversationId: string, params?: any) => {
      await mockDelay()
      return mockData.messages.filter(m => m.userId === conversationId.split('-')[1]) // Mock filtering
    },

    sendMessage: async (data: any) => {
      await mockDelay()
      const newMessage = {
        id: `message-${Date.now()}`,
        ...data,
        status: 'sent',
        sentAt: new Date().toISOString(),
        deliveredAt: new Date().toISOString(),
        metadata: {},
      }
      mockData.messages.push(newMessage)
      return newMessage
    },

    createConversation: async (data: any) => {
      await mockDelay()
      const newConversation = {
        id: `conversation-${Date.now()}`,
        ...data,
        unreadCount: 0,
        status: 'active',
        createdAt: new Date().toISOString(),
      }
      mockData.conversations.push(newConversation)
      return newConversation
    },

    archiveConversation: async (conversationId: string) => {
      await mockDelay()
      const conversation = mockData.conversations.find(c => c.id === conversationId)
      if (conversation) {
        conversation.status = 'archived'
      }
    },

    markAsRead: async (conversationId: string) => {
      await mockDelay()
      const conversation = mockData.conversations.find(c => c.id === conversationId)
      if (conversation) {
        conversation.unreadCount = 0
      }
    },

    onMessages: (conversationId: string, callback: Function) => {
      // Mock real-time subscription - just return unsubscribe function
      return () => console.log('Mock: Unsubscribed from messages')
    },

    onNewMessages: (conversationId: string, callback: Function) => {
      return () => console.log('Mock: Unsubscribed from new messages')
    },

    setTyping: (conversationId: string, userId: string, userName: string) => {
      console.log(`Mock: ${userName} is typing in ${conversationId}`)
    },

    onTypingIndicators: (conversationId: string, callback: Function) => {
      return () => console.log('Mock: Unsubscribed from typing indicators')
    }
  }

  // ============================================================================
  // COMPLIANCE API
  // ============================================================================

  compliance = {
    getTasks: async (companyId: string, status?: string) => {
      await mockDelay()
      let tasks = mockData.complianceTasks.filter(t => t.companyId === companyId)
      if (status) {
        tasks = tasks.filter(t => t.status === status)
      }
      return tasks
    },

    getTask: async (companyId: string, taskId: string) => {
      await mockDelay()
      return mockData.complianceTasks.find(t => t.id === taskId && t.companyId === companyId) || null
    },

    updateTask: async (companyId: string, taskId: string, data: any) => {
      await mockDelay()
      const task = mockData.complianceTasks.find(t => t.id === taskId && t.companyId === companyId)
      if (task) {
        Object.assign(task, data)
      }
      return task
    },

    getRecords: async (companyId: string, type?: string) => {
      await mockDelay()
      let records = mockData.complianceRecords.filter(r => r.companyId === companyId)
      if (type) {
        records = records.filter(r => r.type === type)
      }
      return records
    },

    submitFiling: async (companyId: string, type: string, data: any) => {
      await mockDelay()
      const newRecord = {
        id: `record-${Date.now()}`,
        companyId,
        type,
        reference: `${type.toUpperCase()}-${Date.now()}`,
        status: 'submitted',
        dueDate: data.dueDate,
        submittedDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      }
      mockData.complianceRecords.push(newRecord)
      return newRecord
    },

    checkCompliance: async (companyId: string) => {
      await mockDelay()
      const tasks = mockData.complianceTasks.filter(t => t.companyId === companyId)
      const overdueTasks = tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'completed')
      return {
        status: overdueTasks.length === 0 ? 'compliant' : 'non_compliant',
        totalTasks: tasks.length,
        completedTasks: tasks.filter(t => t.status === 'completed').length,
        overdueTasks: overdueTasks.length,
        nextDueDate: tasks
          .filter(t => t.status !== 'completed')
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]?.dueDate
      }
    }
  }

  // ============================================================================
  // CRM API
  // ============================================================================

  crm = {
    getContacts: async (companyId: string, params?: any) => {
      await mockDelay()
      let contacts = mockData.contacts.filter(c => c.companyId === companyId)
      if (params?.type) {
        contacts = contacts.filter(c => c.type === params.type)
      }
      if (params?.search) {
        contacts = contacts.filter(c =>
          c.firstName.toLowerCase().includes(params.search.toLowerCase()) ||
          c.lastName.toLowerCase().includes(params.search.toLowerCase()) ||
          c.email.toLowerCase().includes(params.search.toLowerCase())
        )
      }
      return contacts
    },

    getContact: async (companyId: string, contactId: string) => {
      await mockDelay()
      return mockData.contacts.find(c => c.id === contactId && c.companyId === companyId) || null
    },

    createContact: async (companyId: string, data: any) => {
      await mockDelay()
      const newContact = {
        id: `contact-${Date.now()}`,
        companyId,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      mockData.contacts.push(newContact)
      return newContact
    },

    updateContact: async (companyId: string, contactId: string, data: any) => {
      await mockDelay()
      const contact = mockData.contacts.find(c => c.id === contactId && c.companyId === companyId)
      if (contact) {
        Object.assign(contact, data, { updatedAt: new Date().toISOString() })
      }
      return contact
    },

    deleteContact: async (companyId: string, contactId: string) => {
      await mockDelay()
      const index = mockData.contacts.findIndex(c => c.id === contactId && c.companyId === companyId)
      if (index > -1) {
        mockData.contacts.splice(index, 1)
      }
    },

    getDeals: async (companyId: string, params?: any) => {
      await mockDelay()
      let deals = mockData.deals.filter(d => d.companyId === companyId)
      if (params?.stage) {
        deals = deals.filter(d => d.stage === params.stage)
      }
      return deals
    },

    getDeal: async (companyId: string, dealId: string) => {
      await mockDelay()
      return mockData.deals.find(d => d.id === dealId && d.companyId === companyId) || null
    },

    createDeal: async (companyId: string, data: any) => {
      await mockDelay()
      const newDeal = {
        id: `deal-${Date.now()}`,
        companyId,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      mockData.deals.push(newDeal)
      return newDeal
    },

    updateDeal: async (companyId: string, dealId: string, data: any) => {
      await mockDelay()
      const deal = mockData.deals.find(d => d.id === dealId && d.companyId === companyId)
      if (deal) {
        Object.assign(deal, data, { updatedAt: new Date().toISOString() })
      }
      return deal
    },

    updateDealStage: async (companyId: string, dealId: string, stage: string) => {
      await mockDelay()
      const deal = mockData.deals.find(d => d.id === dealId && d.companyId === companyId)
      if (deal) {
        deal.stage = stage
        deal.updatedAt = new Date().toISOString()
      }
      return deal
    }
  }

  // ============================================================================
  // CALENDAR API
  // ============================================================================

  calendar = {
    getEvents: async (params?: any) => {
      await mockDelay()
      let events = [...mockData.calendarEvents]
      if (params?.startDate) {
        events = events.filter(e => new Date(e.startTime) >= new Date(params.startDate))
      }
      if (params?.endDate) {
        events = events.filter(e => new Date(e.endTime) <= new Date(params.endDate))
      }
      return events
    },

    getEvent: async (eventId: string) => {
      await mockDelay()
      return mockData.calendarEvents.find(e => e.id === eventId) || null
    },

    createEvent: async (data: any) => {
      await mockDelay()
      const newEvent = {
        id: `event-${Date.now()}`,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      mockData.calendarEvents.push(newEvent)
      return newEvent
    },

    updateEvent: async (eventId: string, data: any) => {
      await mockDelay()
      const event = mockData.calendarEvents.find(e => e.id === eventId)
      if (event) {
        Object.assign(event, data, { updatedAt: new Date().toISOString() })
      }
      return event
    },

    deleteEvent: async (eventId: string) => {
      await mockDelay()
      const index = mockData.calendarEvents.findIndex(e => e.id === eventId)
      if (index > -1) {
        mockData.calendarEvents.splice(index, 1)
      }
    },

    getAvailability: async (userId: string, startDate: string, endDate: string) => {
      await mockDelay()
      // Mock availability - return some free/busy slots
      return {
        userId,
        startDate,
        endDate,
        availability: [
          { start: '09:00', end: '12:00', available: true },
          { start: '12:00', end: '13:00', available: false },
          { start: '13:00', end: '17:00', available: true },
        ]
      }
    }
  }

  // ============================================================================
  // BILLING API
  // ============================================================================

  billing = {
    getSubscription: async () => {
      await mockDelay()
      return mockData.subscriptions[0] || null
    },

    updateSubscription: async (data: any) => {
      await mockDelay()
      if (mockData.subscriptions[0]) {
        Object.assign(mockData.subscriptions[0], data)
      }
      return mockData.subscriptions[0]
    },

    cancelSubscription: async () => {
      await mockDelay()
      if (mockData.subscriptions[0]) {
        mockData.subscriptions[0].cancelAtPeriodEnd = true
      }
    },

    getInvoices: async (params?: any) => {
      await mockDelay()
      return mockData.invoices
    },

    getInvoice: async (invoiceId: string) => {
      await mockDelay()
      return mockData.invoices.find(i => i.id === invoiceId) || null
    },

    downloadInvoice: async (invoiceId: string) => {
      await mockDelay()
      return { url: `/invoices/${invoiceId}.pdf` }
    },

    getPaymentMethods: async () => {
      await mockDelay()
      return [
        {
          id: 'pm-1',
          type: 'card',
          last4: '4242',
          brand: 'visa',
          expiryMonth: 12,
          expiryYear: 2025,
          isDefault: true,
        }
      ]
    },

    addPaymentMethod: async (data: any) => {
      await mockDelay()
      return {
        id: `pm-${Date.now()}`,
        ...data,
        isDefault: false,
      }
    },

    updatePaymentMethod: async (paymentMethodId: string, data: any) => {
      await mockDelay()
      return { id: paymentMethodId, ...data }
    },

    deletePaymentMethod: async (paymentMethodId: string) => {
      await mockDelay()
      console.log(`Mock: Deleted payment method ${paymentMethodId}`)
    }
  }

  // ============================================================================
  // EXTERNAL INTEGRATIONS API
  // ============================================================================

  integrations = {
    searchCompanies: async (query: string) => {
      await mockDelay()
      return mockData.companies.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase())
      ).map(c => ({
        company_number: c.companyNumber,
        company_name: c.name,
        company_status: c.companyStatus,
        company_type: c.companyType,
        incorporation_date: c.incorporationDate,
      }))
    },

    getCompanyDetails: async (companyNumber: string) => {
      await mockDelay()
      const company = mockData.companies.find(c => c.companyNumber === companyNumber)
      if (company) {
        return {
          company_number: company.companyNumber,
          company_name: company.name,
          registered_office_address: company.registeredAddress,
          company_status: company.companyStatus,
          company_type: company.companyType,
          incorporation_date: company.incorporationDate,
          sic_codes: company.sicCodes,
        }
      }
      return null
    },

    fileConfirmationStatement: async (companyNumber: string, data: any) => {
      await mockDelay()
      console.log(`Mock: Filed confirmation statement for ${companyNumber}`, data)
      return { status: 'submitted', transaction_id: `txn-${Date.now()}` }
    },

    submitVatReturn: async (data: any) => {
      await mockDelay()
      return { status: 'submitted', receipt_id: `receipt-${Date.now()}` }
    },

    getVatObligations: async () => {
      await mockDelay()
      return [
        {
          start: '2024-01-01',
          end: '2024-03-31',
          due: '2024-05-07',
          status: 'open',
        }
      ]
    },

    submitSelfAssessment: async (data: any) => {
      await mockDelay()
      return { status: 'submitted', receipt_id: `sa-${Date.now()}` }
    },

    getTaxLiabilities: async () => {
      await mockDelay()
      return [
        {
          tax_year: '2023-24',
          type: 'income_tax',
          amount: 15000,
          due_date: '2024-01-31',
        }
      ]
    },

    submitDataProtectionNotification: async (data: any) => {
      await mockDelay()
      return { status: 'submitted', reference: `ico-${Date.now()}` }
    },

    sendSMS: async (data: any) => {
      await mockDelay()
      console.log(`Mock: SMS sent to ${data.to}: ${data.message}`)
    },

    sendEmail: async (data: any) => {
      await mockDelay()
      console.log(`Mock: Email sent to ${data.to}: ${data.subject}`)
    },

    sendPushNotification: async (data: any) => {
      await mockDelay()
      console.log(`Mock: Push notification sent: ${data.title}`)
    }
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const mockFirebaseAPI = MockFirebaseAPIClient.getInstance()

// For backward compatibility
export default mockFirebaseAPI