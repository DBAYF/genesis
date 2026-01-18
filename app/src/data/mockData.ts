// ============================================================================
// GENESIS ENGINE - MOCK DATA
// ============================================================================

import {
  User,
  Company,
  Address,
  FinancialProjection,
  Transaction,
  Entity,
  Relationship,
  Document,
  IntroductionRequest,
  FundingApplication,
  InvestorProfile,
  Message,
  Conversation,
  ComplianceTask,
  ComplianceRecord,
  Contact,
  Deal,
  Task,
  Subscription,
  Invoice,
  CalendarEvent,
  Attendee,
  Reminder,
} from '@/types'

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'john.doe@genesis.com',
    emailVerified: true,
    phone: '+447700900001',
    phoneVerified: true,
    firstName: 'John',
    lastName: 'Doe',
    avatarUrl: '/avatars/john.jpg',
    timezone: 'Europe/London',
    locale: 'en-GB',
    onboardingCompleted: true,
    pulseEnabled: true,
    pulsePreferredChannel: 'whatsapp',
    pulseActiveHoursStart: '08:00',
    pulseActiveHoursEnd: '22:00',
    pulseDigestTime: '07:00',
    status: 'active',
    lastActiveAt: '2024-01-16T10:30:00Z',
    createdAt: '2023-06-01T09:00:00Z',
    updatedAt: '2024-01-16T10:30:00Z',
  },
  {
    id: 'user-2',
    email: 'sarah.smith@techstartup.com',
    emailVerified: true,
    phone: '+447700900002',
    phoneVerified: true,
    firstName: 'Sarah',
    lastName: 'Smith',
    timezone: 'Europe/London',
    locale: 'en-GB',
    onboardingCompleted: true,
    pulseEnabled: true,
    pulsePreferredChannel: 'sms',
    pulseActiveHoursStart: '09:00',
    pulseActiveHoursEnd: '18:00',
    pulseDigestTime: '08:00',
    status: 'active',
    lastActiveAt: '2024-01-16T09:15:00Z',
    createdAt: '2023-08-15T14:30:00Z',
    updatedAt: '2024-01-16T09:15:00Z',
  },
]

// Mock Addresses
export const mockAddresses: Address[] = [
  {
    line1: '123 Business Street',
    line2: 'Tech District',
    city: 'London',
    county: 'Greater London',
    postcode: 'EC2A 1PQ',
    country: 'GB',
  },
  {
    line1: '456 Innovation Way',
    city: 'Manchester',
    county: 'Greater Manchester',
    postcode: 'M1 2AB',
    country: 'GB',
  },
]

// Mock Companies
export const mockCompanies: Company[] = [
  {
    id: 'company-1',
    name: 'TechFlow Solutions Ltd',
    tradingName: 'TechFlow',
    companyNumber: '12345678',
    companyType: 'ltd',
    companyStatus: 'active',
    incorporationDate: '2023-01-15',
    accountingReferenceDate: '2023-12-31',
    firstAccountsDue: '2024-09-30',
    nextAccountsDue: '2024-12-31',
    nextConfirmationStatementDue: '2024-06-30',
    registeredAddress: mockAddresses[0],
    businessAddress: mockAddresses[0],
    sicCodes: ['62012', '63110'],
    natureOfBusiness: 'Software development and digital solutions',
    industry: 'Technology',
    sector: 'Software',
    corporationTaxReference: 'CT123456',
    vatNumber: 'GB123456789',
    vatRegistered: true,
    payeReference: '123/AB12345',
    payeRegistered: true,
    seisEligible: true,
    seisAdvanceAssuranceStatus: 'approved',
    seisAdvanceAssuranceDate: '2023-02-01',
    seisAllocationRemaining: 125000,
    eisEligible: true,
    eisAdvanceAssuranceStatus: 'approved',
    eisAdvanceAssuranceDate: '2023-02-01',
    currentCashBalance: 75000,
    monthlyBurnRate: 15000,
    runwayMonths: 5,
    totalFundingRaised: 250000,
    lastValuation: 2000000,
    lastValuationDate: '2023-12-01',
    defaultCurrency: 'GBP',
    financialYearEndMonth: 3,
    createdAt: '2023-01-01T10:00:00Z',
    updatedAt: '2024-01-16T08:00:00Z',
  },
  {
    id: 'company-2',
    name: 'GreenEnergy Innovations Ltd',
    tradingName: 'GreenEnergy',
    companyNumber: '87654321',
    companyType: 'ltd',
    companyStatus: 'active',
    incorporationDate: '2023-03-20',
    accountingReferenceDate: '2023-12-31',
    firstAccountsDue: '2024-11-30',
    nextAccountsDue: '2024-12-31',
    nextConfirmationStatementDue: '2024-08-30',
    registeredAddress: mockAddresses[1],
    businessAddress: mockAddresses[1],
    sicCodes: ['35110', '72190'],
    natureOfBusiness: 'Renewable energy research and development',
    industry: 'Energy',
    sector: 'Renewables',
    corporationTaxReference: 'CT876543',
    vatNumber: 'GB987654321',
    vatRegistered: true,
    payeReference: '876/DC87654',
    payeRegistered: false,
    seisEligible: true,
    seisAdvanceAssuranceStatus: 'pending',
    seisAllocationRemaining: 150000,
    eisEligible: true,
    eisAdvanceAssuranceStatus: 'approved',
    eisAdvanceAssuranceDate: '2023-04-01',
    currentCashBalance: 120000,
    monthlyBurnRate: 25000,
    runwayMonths: 4.8,
    totalFundingRaised: 400000,
    lastValuation: 3200000,
    lastValuationDate: '2023-11-01',
    defaultCurrency: 'GBP',
    financialYearEndMonth: 3,
    createdAt: '2023-03-15T11:30:00Z',
    updatedAt: '2024-01-16T07:45:00Z',
  },
]

// Mock Financial Projections
export const mockFinancialProjections: FinancialProjection[] = [
  {
    id: 'projection-1',
    companyId: 'company-1',
    scenario: 'base',
    period: '2024-01',
    revenue: 45000,
    costs: 35000,
    grossProfit: 10000,
    netProfit: 2500,
    cashFlow: 8000,
    headcount: 8,
    createdAt: '2024-01-01T09:00:00Z',
  },
  {
    id: 'projection-2',
    companyId: 'company-1',
    scenario: 'base',
    period: '2024-02',
    revenue: 52000,
    costs: 38000,
    grossProfit: 14000,
    netProfit: 4000,
    cashFlow: 10000,
    headcount: 9,
    createdAt: '2024-01-01T09:00:00Z',
  },
]

// Mock Transactions
export const mockTransactions: Transaction[] = [
  {
    id: 'transaction-1',
    companyId: 'company-1',
    date: '2024-01-15',
    description: 'Office rent payment',
    amount: -2500,
    currency: 'GBP',
    category: 'Rent',
    type: 'expense',
    paymentMethod: 'Bank Transfer',
    reconciled: true,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'transaction-2',
    companyId: 'company-1',
    date: '2024-01-14',
    description: 'Client payment - Project Alpha',
    amount: 15000,
    currency: 'GBP',
    category: 'Revenue',
    type: 'income',
    paymentMethod: 'Bank Transfer',
    reconciled: true,
    createdAt: '2024-01-14T14:30:00Z',
  },
]

// Mock Knowledge Graph Entities
export const mockEntities: Entity[] = [
  {
    id: 'entity-1',
    type: 'company',
    name: 'TechFlow Solutions Ltd',
    description: 'Software development company specializing in fintech solutions',
    properties: {
      industry: 'Technology',
      sector: 'Fintech',
      founded: '2023',
      employees: 8,
      funding: 250000,
    },
    relationships: [],
    createdAt: '2023-01-01T10:00:00Z',
    updatedAt: '2024-01-16T08:00:00Z',
  },
  {
    id: 'entity-2',
    type: 'investor',
    name: 'Sarah Chen',
    description: 'Angel investor focused on early-stage tech startups',
    properties: {
      investmentRange: '50000-200000',
      sectors: ['Technology', 'Healthcare', 'Fintech'],
      portfolioSize: 12,
      location: 'London',
    },
    relationships: [],
    createdAt: '2023-06-01T09:00:00Z',
    updatedAt: '2024-01-16T09:00:00Z',
  },
]

// Mock Relationships
export const mockRelationships: Relationship[] = [
  {
    id: 'relationship-1',
    fromEntityId: 'entity-1',
    toEntityId: 'entity-2',
    type: 'investor',
    properties: {
      investmentAmount: 50000,
      investmentDate: '2023-07-01',
      equityPercentage: 5,
    },
    strength: 0.9,
    createdAt: '2023-07-01T10:00:00Z',
  },
]

// Mock Documents
export const mockDocuments: Document[] = [
  {
    id: 'document-1',
    companyId: 'company-1',
    name: 'Business Plan v2.1',
    type: 'business_plan',
    status: 'approved',
    version: 3,
    fileUrl: '/documents/business-plan-v2.1.pdf',
    fileSize: 2457600,
    mimeType: 'application/pdf',
    metadata: {
      pages: 25,
      lastModified: '2024-01-10',
    },
    createdBy: 'user-1',
    reviewedBy: 'user-2',
    approvedBy: 'user-1',
    createdAt: '2023-12-01T09:00:00Z',
    updatedAt: '2024-01-10T14:30:00Z',
  },
  {
    id: 'document-2',
    companyId: 'company-1',
    name: 'Pitch Deck Q1 2024',
    type: 'pitch_deck',
    status: 'draft',
    version: 1,
    fileUrl: '/documents/pitch-deck-q1-2024.pdf',
    fileSize: 5120000,
    mimeType: 'application/pdf',
    metadata: {
      pages: 15,
      slides: 15,
    },
    createdBy: 'user-1',
    createdAt: '2024-01-05T11:00:00Z',
    updatedAt: '2024-01-05T11:00:00Z',
  },
]

// Mock Introduction Requests
export const mockIntroductionRequests: IntroductionRequest[] = [
  {
    id: 'intro-1',
    fromUserId: 'user-1',
    toUserId: 'user-2',
    companyId: 'company-1',
    message: 'Hi Sarah, I noticed your interest in fintech. Would love to connect about potential collaboration opportunities.',
    status: 'pending',
    introductionType: 'networking',
    priority: 'medium',
    createdAt: '2024-01-15T10:00:00Z',
  },
]

// Mock Funding Applications
export const mockFundingApplications: FundingApplication[] = [
  {
    id: 'funding-1',
    companyId: 'company-1',
    fundingType: 'seis',
    amount: 150000,
    useOfFunds: 'Product development, marketing, and team expansion',
    status: 'under_review',
    submittedAt: '2024-01-10T09:00:00Z',
    createdAt: '2024-01-08T14:30:00Z',
  },
]

// Mock Investor Profiles
export const mockInvestorProfiles: InvestorProfile[] = [
  {
    id: 'investor-1',
    userId: 'user-2',
    investmentFocus: ['Early-stage technology companies'],
    typicalInvestmentSize: {
      min: 25000,
      max: 150000,
    },
    investmentStage: ['pre_seed', 'seed'],
    geography: ['London', 'Manchester', 'Birmingham'],
    sectors: ['Technology', 'Fintech', 'Healthcare'],
    portfolioCompanies: ['TechFlow Solutions', 'HealthTech Ltd', 'DataCorp'],
    createdAt: '2023-06-01T09:00:00Z',
  },
]

// Mock Messages
export const mockMessages: Message[] = [
  {
    id: 'message-1',
    userId: 'user-1',
    channel: 'whatsapp',
    direction: 'inbound',
    content: 'Hi! How is the business plan coming along?',
    status: 'read',
    sentAt: '2024-01-16T09:30:00Z',
    deliveredAt: '2024-01-16T09:30:05Z',
    readAt: '2024-01-16T09:35:00Z',
    metadata: {},
  },
  {
    id: 'message-2',
    userId: 'user-1',
    channel: 'whatsapp',
    direction: 'outbound',
    content: 'Great progress! We\'ve finalized the financial projections and should have the updated plan ready by end of week.',
    status: 'delivered',
    sentAt: '2024-01-16T09:40:00Z',
    deliveredAt: '2024-01-16T09:40:02Z',
    metadata: {},
  },
]

// Mock Conversations
export const mockConversations: Conversation[] = [
  {
    id: 'conversation-1',
    userId: 'user-1',
    lastMessageAt: '2024-01-16T09:40:00Z',
    unreadCount: 0,
    status: 'active',
    createdAt: '2024-01-10T08:00:00Z',
  },
]

// Mock Compliance Tasks
export const mockComplianceTasks: ComplianceTask[] = [
  {
    id: 'compliance-1',
    companyId: 'company-1',
    type: 'confirmation_statement',
    title: 'File Confirmation Statement',
    description: 'Annual confirmation statement due for Companies House',
    dueDate: '2024-06-30',
    status: 'pending',
    priority: 'high',
    createdAt: '2024-01-01T09:00:00Z',
  },
  {
    id: 'compliance-2',
    companyId: 'company-1',
    type: 'vat_return',
    title: 'VAT Return Q4 2023',
    description: 'Quarterly VAT return submission',
    dueDate: '2024-02-07',
    status: 'pending',
    priority: 'medium',
    createdAt: '2024-01-01T09:00:00Z',
  },
  {
    id: 'compliance-3',
    companyId: 'company-1',
    type: 'accounts_filing',
    title: 'File Annual Accounts',
    description: 'Annual accounts filing with Companies House',
    dueDate: '2024-12-31',
    status: 'pending',
    priority: 'high',
    createdAt: '2024-01-01T09:00:00Z',
  },
]

// Mock Compliance Records
export const mockComplianceRecords: ComplianceRecord[] = [
  {
    id: 'record-1',
    companyId: 'company-1',
    type: 'vat_return',
    reference: 'VAT-Q3-2023',
    status: 'compliant',
    dueDate: '2023-11-07',
    submittedDate: '2023-11-05',
    approvedDate: '2023-11-08',
    createdAt: '2023-11-05T10:00:00Z',
  },
]

// Mock Contacts
export const mockContacts: Contact[] = [
  {
    id: 'contact-1',
    companyId: 'company-1',
    type: 'customer',
    firstName: 'Michael',
    lastName: 'Johnson',
    email: 'michael@clientcorp.com',
    phone: '+447700900003',
    company: 'ClientCorp Ltd',
    position: 'CTO',
    address: mockAddresses[0],
    tags: ['enterprise', 'tech'],
    lastContactedAt: '2024-01-10T14:30:00Z',
    createdAt: '2023-08-01T09:00:00Z',
    updatedAt: '2024-01-10T14:30:00Z',
  },
  {
    id: 'contact-2',
    companyId: 'company-1',
    type: 'investor',
    firstName: 'Emma',
    lastName: 'Williams',
    email: 'emma@investcorp.com',
    phone: '+447700900004',
    company: 'InvestCorp',
    position: 'Investment Director',
    tags: ['angel_investor', 'fintech'],
    lastContactedAt: '2024-01-05T11:00:00Z',
    createdAt: '2023-09-15T13:30:00Z',
    updatedAt: '2024-01-05T11:00:00Z',
  },
]

// Mock Deals
export const mockDeals: Deal[] = [
  {
    id: 'deal-1',
    companyId: 'company-1',
    contactId: 'contact-1',
    title: 'Enterprise Software License',
    value: 75000,
    currency: 'GBP',
    stage: 'proposal',
    probability: 70,
    expectedCloseDate: '2024-03-15',
    description: '12-month enterprise license for our flagship product',
    createdAt: '2024-01-08T10:00:00Z',
    updatedAt: '2024-01-15T09:30:00Z',
  },
]

// Mock Tasks
export const mockTasks: Task[] = [
  {
    id: 'task-1',
    companyId: 'company-1',
    title: 'Update business plan with Q1 projections',
    description: 'Incorporate the latest financial projections into the business plan document',
    status: 'in_progress',
    priority: 'high',
    assigneeId: 'user-1',
    dueDate: '2024-01-20',
    createdAt: '2024-01-10T09:00:00Z',
    updatedAt: '2024-01-15T14:00:00Z',
  },
  {
    id: 'task-2',
    companyId: 'company-1',
    title: 'Prepare pitch deck for investor meeting',
    description: 'Update pitch deck with latest metrics and prepare for meeting with potential investors',
    status: 'todo',
    priority: 'medium',
    assigneeId: 'user-1',
    dueDate: '2024-01-25',
    createdAt: '2024-01-12T11:30:00Z',
    updatedAt: '2024-01-12T11:30:00Z',
  },
]

// Mock Subscriptions
export const mockSubscriptions: Subscription[] = [
  {
    id: 'subscription-1',
    companyId: 'company-1',
    planId: 'plan-professional',
    status: 'active',
    currentPeriodStart: '2024-01-01',
    currentPeriodEnd: '2024-01-31',
    cancelAtPeriodEnd: false,
    createdAt: '2023-12-01T10:00:00Z',
  },
]

// Mock Invoices
export const mockInvoices: Invoice[] = [
  {
    id: 'invoice-1',
    companyId: 'company-1',
    subscriptionId: 'subscription-1',
    amount: 299,
    currency: 'GBP',
    status: 'paid',
    dueDate: '2024-01-31',
    paidAt: '2024-01-15T09:00:00Z',
    createdAt: '2024-01-01T10:00:00Z',
  },
]

// Mock Calendar Events
export const mockCalendarEvents: CalendarEvent[] = [
  {
    id: 'event-1',
    companyId: 'company-1',
    title: 'Investor Meeting - TechFlow Pitch',
    description: 'Present TechFlow pitch deck to potential investors',
    startTime: '2024-01-20T14:00:00Z',
    endTime: '2024-01-20T15:30:00Z',
    allDay: false,
    location: 'Virtual Meeting',
    attendees: [
      {
        id: 'attendee-1',
        name: 'John Doe',
        email: 'john.doe@genesis.com',
        status: 'accepted',
      },
      {
        id: 'attendee-2',
        name: 'Sarah Smith',
        email: 'sarah.smith@investcorp.com',
        status: 'pending',
      },
    ],
    reminders: [
      {
        id: 'reminder-1',
        minutes: 15,
        method: 'email',
      },
    ],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'event-2',
    companyId: 'company-1',
    title: 'Team Standup',
    description: 'Daily team standup meeting',
    startTime: '2024-01-17T09:00:00Z',
    endTime: '2024-01-17T09:30:00Z',
    allDay: false,
    location: 'Office Conference Room',
    attendees: [
      {
        id: 'attendee-3',
        name: 'John Doe',
        email: 'john.doe@genesis.com',
        status: 'accepted',
      },
    ],
    reminders: [],
    createdAt: '2024-01-16T08:00:00Z',
    updatedAt: '2024-01-16T08:00:00Z',
  },
]

// Export all mock data
export const mockData = {
  users: mockUsers,
  companies: mockCompanies,
  addresses: mockAddresses,
  financialProjections: mockFinancialProjections,
  transactions: mockTransactions,
  entities: mockEntities,
  relationships: mockRelationships,
  documents: mockDocuments,
  introductionRequests: mockIntroductionRequests,
  fundingApplications: mockFundingApplications,
  investorProfiles: mockInvestorProfiles,
  messages: mockMessages,
  conversations: mockConversations,
  complianceTasks: mockComplianceTasks,
  complianceRecords: mockComplianceRecords,
  contacts: mockContacts,
  deals: mockDeals,
  tasks: mockTasks,
  subscriptions: mockSubscriptions,
  invoices: mockInvoices,
  calendarEvents: mockCalendarEvents,
}