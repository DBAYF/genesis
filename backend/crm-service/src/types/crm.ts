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
  source: string
  lifecycleStage: 'lead' | 'prospect' | 'customer' | 'champion' | 'lost'
  leadScore: number
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
  products: DealProduct[]
  activities: DealActivity[]
  createdBy: string
  assignedTo?: string
  createdAt: string
  updatedAt: string
}

export interface DealProduct {
  id: string
  name: string
  quantity: number
  unitPrice: number
  discount?: number
  total: number
}

export interface DealActivity {
  id: string
  type: 'call' | 'email' | 'meeting' | 'note' | 'task'
  title: string
  description?: string
  date: string
  duration?: number
  outcome?: string
  createdBy: string
  createdAt: string
}

export interface Address {
  line1: string
  line2?: string
  city: string
  county?: string
  postcode: string
  country: string
}

export interface Campaign {
  id: string
  companyId: string
  name: string
  type: 'email' | 'social' | 'event' | 'webinar' | 'advertising' | 'other'
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled'
  budget: number
  currency: string
  startDate?: string
  endDate?: string
  targetAudience: string[]
  goals: CampaignGoal[]
  metrics: CampaignMetrics
  content?: string
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface CampaignGoal {
  id: string
  type: 'leads' | 'conversions' | 'revenue' | 'engagement' | 'awareness'
  target: number
  current: number
}

export interface CampaignMetrics {
  sent: number
  opened: number
  clicked: number
  converted: number
  revenue: number
  roi: number
}

export interface EmailTemplate {
  id: string
  companyId: string
  name: string
  subject: string
  content: string
  type: 'welcome' | 'follow_up' | 'newsletter' | 'promotion' | 'reminder' | 'custom'
  variables: string[]
  isActive: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface Communication {
  id: string
  companyId: string
  contactId: string
  type: 'email' | 'call' | 'meeting' | 'sms' | 'social' | 'other'
  direction: 'inbound' | 'outbound'
  subject?: string
  content: string
  status: 'sent' | 'delivered' | 'read' | 'responded' | 'failed'
  sentAt: string
  deliveredAt?: string
  readAt?: string
  respondedAt?: string
  metadata: Record<string, any>
  createdBy: string
  createdAt: string
}

export interface CrmSettings {
  id: string
  companyId: string
  defaultCurrency: string
  dealStages: DealStage[]
  leadScoring: LeadScoringConfig
  emailSettings: EmailSettings
  notificationSettings: NotificationSettings
  automationRules: AutomationRule[]
  createdAt: string
  updatedAt: string
}

export interface DealStage {
  id: string
  name: string
  probability: number
  order: number
  color: string
}

export interface LeadScoringConfig {
  email: number
  phone: number
  website: number
  social: number
  meeting: number
  timeDecay: number
  sourceMultiplier: Record<string, number>
}

export interface EmailSettings {
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpPass: string
  fromEmail: string
  fromName: string
  trackingEnabled: boolean
}

export interface NotificationSettings {
  dealUpdates: boolean
  newLeads: boolean
  campaignResults: boolean
  overdueTasks: boolean
  emailDigest: boolean
}

export interface AutomationRule {
  id: string
  name: string
  trigger: AutomationTrigger
  conditions: AutomationCondition[]
  actions: AutomationAction[]
  isActive: boolean
}

export interface AutomationTrigger {
  type: 'contact_created' | 'deal_stage_changed' | 'email_opened' | 'form_submitted' | 'time_based'
  config: Record<string, any>
}

export interface AutomationCondition {
  field: string
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty'
  value: any
}

export interface AutomationAction {
  type: 'send_email' | 'create_task' | 'update_contact' | 'add_tag' | 'move_deal_stage'
  config: Record<string, any>
}

export interface CrmDashboardData {
  summary: {
    totalContacts: number
    totalDeals: number
    totalRevenue: number
    activeCampaigns: number
    newLeadsThisMonth: number
    conversionRate: number
  }
  recentContacts: Contact[]
  dealsByStage: Record<string, number>
  revenueByMonth: Record<string, number>
  topPerformingCampaigns: Campaign[]
  upcomingActivities: DealActivity[]
  alerts: CrmAlert[]
}

export interface CrmAlert {
  id: string
  type: 'deal_overdue' | 'lead_followup' | 'campaign_ending' | 'goal_missed'
  title: string
  message: string
  severity: 'low' | 'medium' | 'high'
  actionRequired: boolean
  relatedId?: string
  createdAt: string
}

// Request/Response Types
export interface CreateContactRequest {
  type: Contact['type']
  firstName: string
  lastName: string
  email?: string
  phone?: string
  company?: string
  position?: string
  address?: Address
  tags?: string[]
  notes?: string
  source?: string
}

export interface UpdateContactRequest {
  type?: Contact['type']
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  company?: string
  position?: string
  address?: Address
  tags?: string[]
  notes?: string
  lifecycleStage?: Contact['lifecycleStage']
  leadScore?: number
}

export interface CreateDealRequest {
  contactId: string
  title: string
  value: number
  currency?: string
  expectedCloseDate?: string
  description?: string
  products?: DealProduct[]
  assignedTo?: string
}

export interface UpdateDealRequest {
  title?: string
  value?: number
  currency?: string
  stage?: Deal['stage']
  probability?: number
  expectedCloseDate?: string
  actualCloseDate?: string
  description?: string
  assignedTo?: string
}

export interface CreateCampaignRequest {
  name: string
  type: Campaign['type']
  budget: number
  currency?: string
  startDate?: string
  endDate?: string
  targetAudience?: string[]
  goals?: CampaignGoal[]
  content?: string
}

export interface CreateCommunicationRequest {
  contactId: string
  type: Communication['type']
  direction: Communication['direction']
  subject?: string
  content: string
  metadata?: Record<string, any>
}

export interface CrmService {
  // Contact Management
  createContact(companyId: string, data: CreateContactRequest): Promise<Contact>
  getContacts(companyId: string, filters?: ContactFilters): Promise<Contact[]>
  updateContact(id: string, updates: UpdateContactRequest): Promise<Contact>
  deleteContact(id: string): Promise<void>
  getContact(id: string): Promise<Contact | null>
  searchContacts(companyId: string, query: string): Promise<Contact[]>
  updateLeadScore(id: string, score: number): Promise<Contact>

  // Deal Management
  createDeal(companyId: string, data: CreateDealRequest): Promise<Deal>
  getDeals(companyId: string, filters?: DealFilters): Promise<Deal[]>
  updateDeal(id: string, updates: UpdateDealRequest): Promise<Deal>
  deleteDeal(id: string): Promise<void>
  getDeal(id: string): Promise<Deal | null>
  addDealActivity(dealId: string, activity: Omit<DealActivity, 'id' | 'createdAt'>): Promise<DealActivity>

  // Campaign Management
  createCampaign(companyId: string, data: CreateCampaignRequest): Promise<Campaign>
  getCampaigns(companyId: string): Promise<Campaign[]>
  updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign>
  deleteCampaign(id: string): Promise<void>
  updateCampaignMetrics(id: string, metrics: Partial<CampaignMetrics>): Promise<Campaign>

  // Communication
  createCommunication(companyId: string, data: CreateCommunicationRequest): Promise<Communication>
  getCommunications(companyId: string, contactId?: string): Promise<Communication[]>
  updateCommunicationStatus(id: string, status: Communication['status']): Promise<Communication>

  // Templates
  createEmailTemplate(companyId: string, template: Omit<EmailTemplate, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>): Promise<EmailTemplate>
  getEmailTemplates(companyId: string): Promise<EmailTemplate[]>
  updateEmailTemplate(id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate>

  // Settings
  getCrmSettings(companyId: string): Promise<CrmSettings | null>
  updateCrmSettings(companyId: string, updates: Partial<CrmSettings>): Promise<CrmSettings>

  // Dashboard & Analytics
  getCrmDashboardData(companyId: string): Promise<CrmDashboardData>
  generateCrmReport(companyId: string, period: { start: string; end: string }): Promise<any>

  // Automation
  executeAutomationRules(companyId: string, trigger: AutomationTrigger, data: any): Promise<void>
  getAutomationRules(companyId: string): Promise<AutomationRule[]>

  // Alerts
  getCrmAlerts(companyId: string): Promise<CrmAlert[]>
  createCrmAlert(companyId: string, alert: Omit<CrmAlert, 'id' | 'createdAt'>): Promise<CrmAlert>

  // Import/Export
  importContacts(companyId: string, contacts: CreateContactRequest[]): Promise<Contact[]>
  exportContacts(companyId: string, filters?: ContactFilters): Promise<string>
}

export interface ContactFilters {
  type?: Contact['type'][]
  lifecycleStage?: Contact['lifecycleStage'][]
  tags?: string[]
  leadScoreMin?: number
  leadScoreMax?: number
  lastContactedBefore?: string
  lastContactedAfter?: string
}

export interface DealFilters {
  stage?: Deal['stage'][]
  assignedTo?: string
  valueMin?: number
  valueMax?: number
  expectedCloseDateBefore?: string
  expectedCloseDateAfter?: string
}