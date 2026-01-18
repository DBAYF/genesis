import { PrismaClient } from '@prisma/client'
import {
  Contact,
  Deal,
  Campaign,
  Communication,
  EmailTemplate,
  CrmSettings,
  CrmDashboardData,
  CreateContactRequest,
  UpdateContactRequest,
  CreateDealRequest,
  UpdateDealRequest,
  CreateCampaignRequest,
  CreateCommunicationRequest,
  CrmService,
  ContactFilters,
  DealFilters
} from '../types/crm'

export class CrmServiceImpl implements CrmService {
  constructor(private prisma: PrismaClient) {}

  // ============================================================================
  // CONTACT MANAGEMENT
  // ============================================================================

  async createContact(companyId: string, data: CreateContactRequest): Promise<Contact> {
    const contact = await this.prisma.contact.create({
      data: {
        companyId,
        ...data,
        tags: data.tags || [],
        lifecycleStage: 'lead',
        leadScore: 0,
        lastContactedAt: new Date()
      }
    })

    return {
      id: contact.id,
      companyId: contact.companyId,
      type: contact.type,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email || undefined,
      phone: contact.phone || undefined,
      company: contact.company || undefined,
      position: contact.position || undefined,
      address: contact.address ? contact.address as any : undefined,
      tags: contact.tags,
      notes: contact.notes || undefined,
      lastContactedAt: contact.lastContactedAt?.toISOString(),
      source: contact.source,
      lifecycleStage: contact.lifecycleStage,
      leadScore: contact.leadScore,
      createdAt: contact.createdAt.toISOString(),
      updatedAt: contact.updatedAt.toISOString()
    }
  }

  async getContacts(companyId: string, filters?: ContactFilters): Promise<Contact[]> {
    const where: any = { companyId }

    if (filters) {
      if (filters.type?.length) where.type = { in: filters.type }
      if (filters.lifecycleStage) where.lifecycleStage = filters.lifecycleStage
      if (filters.tags?.length) where.tags = { hasSome: filters.tags }
      if (filters.leadScoreMin !== undefined || filters.leadScoreMax !== undefined) {
        where.leadScore = {}
        if (filters.leadScoreMin !== undefined) where.leadScore.gte = filters.leadScoreMin
        if (filters.leadScoreMax !== undefined) where.leadScore.lte = filters.leadScoreMax
      }
      if (filters.lastContactedBefore || filters.lastContactedAfter) {
        where.lastContactedAt = {}
        if (filters.lastContactedBefore) where.lastContactedAt.lte = new Date(filters.lastContactedBefore)
        if (filters.lastContactedAfter) where.lastContactedAt.gte = new Date(filters.lastContactedAfter)
      }
    }

    const contacts = await this.prisma.contact.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return contacts.map(contact => ({
      id: contact.id,
      companyId: contact.companyId,
      type: contact.type,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email || undefined,
      phone: contact.phone || undefined,
      company: contact.company || undefined,
      position: contact.position || undefined,
      address: contact.address ? contact.address as any : undefined,
      tags: contact.tags,
      notes: contact.notes || undefined,
      lastContactedAt: contact.lastContactedAt?.toISOString(),
      source: contact.source,
      lifecycleStage: contact.lifecycleStage,
      leadScore: contact.leadScore,
      createdAt: contact.createdAt.toISOString(),
      updatedAt: contact.updatedAt.toISOString()
    }))
  }

  async updateContact(id: string, updates: UpdateContactRequest): Promise<Contact> {
    const updateData: any = { ...updates }
    if (updates.lastContactedAt) updateData.lastContactedAt = new Date()

    const contact = await this.prisma.contact.update({
      where: { id },
      data: updateData
    })

    return {
      id: contact.id,
      companyId: contact.companyId,
      type: contact.type,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email || undefined,
      phone: contact.phone || undefined,
      company: contact.company || undefined,
      position: contact.position || undefined,
      address: contact.address ? contact.address as any : undefined,
      tags: contact.tags,
      notes: contact.notes || undefined,
      lastContactedAt: contact.lastContactedAt?.toISOString(),
      source: contact.source,
      lifecycleStage: contact.lifecycleStage,
      leadScore: contact.leadScore,
      createdAt: contact.createdAt.toISOString(),
      updatedAt: contact.updatedAt.toISOString()
    }
  }

  async deleteContact(id: string): Promise<void> {
    await this.prisma.contact.delete({ where: { id } })
  }

  async getContact(id: string): Promise<Contact | null> {
    const contact = await this.prisma.contact.findUnique({ where: { id } })

    if (!contact) return null

    return {
      id: contact.id,
      companyId: contact.companyId,
      type: contact.type,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email || undefined,
      phone: contact.phone || undefined,
      company: contact.company || undefined,
      position: contact.position || undefined,
      address: contact.address ? contact.address as any : undefined,
      tags: contact.tags,
      notes: contact.notes || undefined,
      lastContactedAt: contact.lastContactedAt?.toISOString(),
      source: contact.source,
      lifecycleStage: contact.lifecycleStage,
      leadScore: contact.leadScore,
      createdAt: contact.createdAt.toISOString(),
      updatedAt: contact.updatedAt.toISOString()
    }
  }

  async searchContacts(companyId: string, query: string): Promise<Contact[]> {
    const contacts = await this.prisma.contact.findMany({
      where: {
        companyId,
        OR: [
          { firstName: { contains: query, mode: 'insensitive' } },
          { lastName: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { company: { contains: query, mode: 'insensitive' } }
        ]
      },
      orderBy: { lastContactedAt: 'desc' },
      take: 50
    })

    return contacts.map(contact => ({
      id: contact.id,
      companyId: contact.companyId,
      type: contact.type,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email || undefined,
      phone: contact.phone || undefined,
      company: contact.company || undefined,
      position: contact.position || undefined,
      address: contact.address ? contact.address as any : undefined,
      tags: contact.tags,
      notes: contact.notes || undefined,
      lastContactedAt: contact.lastContactedAt?.toISOString(),
      source: contact.source,
      lifecycleStage: contact.lifecycleStage,
      leadScore: contact.leadScore,
      createdAt: contact.createdAt.toISOString(),
      updatedAt: contact.updatedAt.toISOString()
    }))
  }

  async updateLeadScore(id: string, score: number): Promise<Contact> {
    const contact = await this.prisma.contact.update({
      where: { id },
      data: { leadScore: score }
    })

    return {
      id: contact.id,
      companyId: contact.companyId,
      type: contact.type,
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email || undefined,
      phone: contact.phone || undefined,
      company: contact.company || undefined,
      position: contact.position || undefined,
      address: contact.address ? contact.address as any : undefined,
      tags: contact.tags,
      notes: contact.notes || undefined,
      lastContactedAt: contact.lastContactedAt?.toISOString(),
      source: contact.source,
      lifecycleStage: contact.lifecycleStage,
      leadScore: contact.leadScore,
      createdAt: contact.createdAt.toISOString(),
      updatedAt: contact.updatedAt.toISOString()
    }
  }

  // ============================================================================
  // DEAL MANAGEMENT
  // ============================================================================

  async createDeal(companyId: string, data: CreateDealRequest): Promise<Deal> {
    const deal = await this.prisma.deal.create({
      data: {
        companyId,
        ...data,
        currency: data.currency || 'GBP',
        probability: 0,
        products: data.products || [],
        activities: [],
        createdBy: 'system' // Would come from auth context
      }
    })

    return {
      id: deal.id,
      companyId: deal.companyId,
      contactId: deal.contactId,
      title: deal.title,
      value: deal.value,
      currency: deal.currency,
      stage: deal.stage,
      probability: deal.probability,
      expectedCloseDate: deal.expectedCloseDate?.toISOString(),
      actualCloseDate: deal.actualCloseDate?.toISOString(),
      description: deal.description || undefined,
      products: deal.products as any,
      activities: deal.activities as any,
      createdBy: deal.createdBy,
      assignedTo: deal.assignedTo || undefined,
      createdAt: deal.createdAt.toISOString(),
      updatedAt: deal.updatedAt.toISOString()
    }
  }

  async getDeals(companyId: string, filters?: DealFilters): Promise<Deal[]> {
    const where: any = { companyId }

    if (filters) {
      if (filters.stage?.length) where.stage = { in: filters.stage }
      if (filters.assignedTo) where.assignedTo = filters.assignedTo
      if (filters.valueMin !== undefined || filters.valueMax !== undefined) {
        where.value = {}
        if (filters.valueMin !== undefined) where.value.gte = filters.valueMin
        if (filters.valueMax !== undefined) where.value.lte = filters.valueMax
      }
      if (filters.expectedCloseDateBefore || filters.expectedCloseDateAfter) {
        where.expectedCloseDate = {}
        if (filters.expectedCloseDateBefore) where.expectedCloseDate.lte = new Date(filters.expectedCloseDateBefore)
        if (filters.expectedCloseDateAfter) where.expectedCloseDate.gte = new Date(filters.expectedCloseDateAfter)
      }
    }

    const deals = await this.prisma.deal.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return deals.map(deal => ({
      id: deal.id,
      companyId: deal.companyId,
      contactId: deal.contactId,
      title: deal.title,
      value: deal.value,
      currency: deal.currency,
      stage: deal.stage,
      probability: deal.probability,
      expectedCloseDate: deal.expectedCloseDate?.toISOString(),
      actualCloseDate: deal.actualCloseDate?.toISOString(),
      description: deal.description || undefined,
      products: deal.products as any,
      activities: deal.activities as any,
      createdBy: deal.createdBy,
      assignedTo: deal.assignedTo || undefined,
      createdAt: deal.createdAt.toISOString(),
      updatedAt: deal.updatedAt.toISOString()
    }))
  }

  async updateDeal(id: string, updates: UpdateDealRequest): Promise<Deal> {
    const updateData: any = { ...updates }
    if (updates.expectedCloseDate) updateData.expectedCloseDate = new Date(updates.expectedCloseDate)
    if (updates.actualCloseDate) updateData.actualCloseDate = new Date(updates.actualCloseDate)

    const deal = await this.prisma.deal.update({
      where: { id },
      data: updateData
    })

    return {
      id: deal.id,
      companyId: deal.companyId,
      contactId: deal.contactId,
      title: deal.title,
      value: deal.value,
      currency: deal.currency,
      stage: deal.stage,
      probability: deal.probability,
      expectedCloseDate: deal.expectedCloseDate?.toISOString(),
      actualCloseDate: deal.actualCloseDate?.toISOString(),
      description: deal.description || undefined,
      products: deal.products as any,
      activities: deal.activities as any,
      createdBy: deal.createdBy,
      assignedTo: deal.assignedTo || undefined,
      createdAt: deal.createdAt.toISOString(),
      updatedAt: deal.updatedAt.toISOString()
    }
  }

  async deleteDeal(id: string): Promise<void> {
    await this.prisma.deal.delete({ where: { id } })
  }

  async getDeal(id: string): Promise<Deal | null> {
    const deal = await this.prisma.deal.findUnique({ where: { id } })

    if (!deal) return null

    return {
      id: deal.id,
      companyId: deal.companyId,
      contactId: deal.contactId,
      title: deal.title,
      value: deal.value,
      currency: deal.currency,
      stage: deal.stage,
      probability: deal.probability,
      expectedCloseDate: deal.expectedCloseDate?.toISOString(),
      actualCloseDate: deal.actualCloseDate?.toISOString(),
      description: deal.description || undefined,
      products: deal.products as any,
      activities: deal.activities as any,
      createdBy: deal.createdBy,
      assignedTo: deal.assignedTo || undefined,
      createdAt: deal.createdAt.toISOString(),
      updatedAt: deal.updatedAt.toISOString()
    }
  }

  async addDealActivity(dealId: string, activity: Omit<any, 'id' | 'createdAt'>): Promise<any> {
    const deal = await this.prisma.deal.findUnique({ where: { id: dealId } })
    if (!deal) throw new Error('Deal not found')

    const newActivity = {
      id: `activity-${Date.now()}`,
      ...activity,
      createdAt: new Date().toISOString()
    }

    const updatedActivities = [...(deal.activities as any[]), newActivity]

    await this.prisma.deal.update({
      where: { id: dealId },
      data: { activities: updatedActivities }
    })

    return newActivity
  }

  // ============================================================================
  // CAMPAIGN MANAGEMENT
  // ============================================================================

  async createCampaign(companyId: string, data: CreateCampaignRequest): Promise<Campaign> {
    const campaign = await this.prisma.campaign.create({
      data: {
        companyId,
        ...data,
        currency: data.currency || 'GBP',
        status: 'draft',
        targetAudience: data.targetAudience || [],
        goals: data.goals || [],
        metrics: {
          sent: 0,
          opened: 0,
          clicked: 0,
          converted: 0,
          revenue: 0,
          roi: 0
        },
        createdBy: 'system'
      }
    })

    return {
      id: campaign.id,
      companyId: campaign.companyId,
      name: campaign.name,
      type: campaign.type,
      status: campaign.status,
      budget: campaign.budget,
      currency: campaign.currency,
      startDate: campaign.startDate?.toISOString(),
      endDate: campaign.endDate?.toISOString(),
      targetAudience: campaign.targetAudience,
      goals: campaign.goals as any,
      metrics: campaign.metrics as any,
      content: campaign.content || undefined,
      createdBy: campaign.createdBy,
      createdAt: campaign.createdAt.toISOString(),
      updatedAt: campaign.updatedAt.toISOString()
    }
  }

  async getCampaigns(companyId: string): Promise<Campaign[]> {
    const campaigns = await this.prisma.campaign.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' }
    })

    return campaigns.map(campaign => ({
      id: campaign.id,
      companyId: campaign.companyId,
      name: campaign.name,
      type: campaign.type,
      status: campaign.status,
      budget: campaign.budget,
      currency: campaign.currency,
      startDate: campaign.startDate?.toISOString(),
      endDate: campaign.endDate?.toISOString(),
      targetAudience: campaign.targetAudience,
      goals: campaign.goals as any,
      metrics: campaign.metrics as any,
      content: campaign.content || undefined,
      createdBy: campaign.createdBy,
      createdAt: campaign.createdAt.toISOString(),
      updatedAt: campaign.updatedAt.toISOString()
    }))
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    const updateData: any = { ...updates }
    if (updates.startDate) updateData.startDate = new Date(updates.startDate)
    if (updates.endDate) updateData.endDate = new Date(updates.endDate)

    const campaign = await this.prisma.campaign.update({
      where: { id },
      data: updateData
    })

    return {
      id: campaign.id,
      companyId: campaign.companyId,
      name: campaign.name,
      type: campaign.type,
      status: campaign.status,
      budget: campaign.budget,
      currency: campaign.currency,
      startDate: campaign.startDate?.toISOString(),
      endDate: campaign.endDate?.toISOString(),
      targetAudience: campaign.targetAudience,
      goals: campaign.goals as any,
      metrics: campaign.metrics as any,
      content: campaign.content || undefined,
      createdBy: campaign.createdBy,
      createdAt: campaign.createdAt.toISOString(),
      updatedAt: campaign.updatedAt.toISOString()
    }
  }

  async deleteCampaign(id: string): Promise<void> {
    await this.prisma.campaign.delete({ where: { id } })
  }

  async updateCampaignMetrics(id: string, metrics: Partial<any>): Promise<Campaign> {
    const campaign = await this.prisma.campaign.findUnique({ where: { id } })
    if (!campaign) throw new Error('Campaign not found')

    const updatedMetrics = { ...campaign.metrics, ...metrics }
    // Calculate ROI
    updatedMetrics.roi = campaign.budget > 0 ? (updatedMetrics.revenue - campaign.budget) / campaign.budget : 0

    return this.updateCampaign(id, { metrics: updatedMetrics })
  }

  // ============================================================================
  // COMMUNICATION MANAGEMENT
  // ============================================================================

  async createCommunication(companyId: string, data: CreateCommunicationRequest): Promise<Communication> {
    const communication = await this.prisma.communication.create({
      data: {
        companyId,
        ...data,
        status: 'sent',
        sentAt: new Date(),
        metadata: data.metadata || {},
        createdBy: 'system'
      }
    })

    return {
      id: communication.id,
      companyId: communication.companyId,
      contactId: communication.contactId,
      type: communication.type,
      direction: communication.direction,
      subject: communication.subject || undefined,
      content: communication.content,
      status: communication.status,
      sentAt: communication.sentAt.toISOString(),
      deliveredAt: communication.deliveredAt?.toISOString(),
      readAt: communication.readAt?.toISOString(),
      respondedAt: communication.respondedAt?.toISOString(),
      metadata: communication.metadata as any,
      createdBy: communication.createdBy,
      createdAt: communication.createdAt.toISOString()
    }
  }

  async getCommunications(companyId: string, contactId?: string): Promise<Communication[]> {
    const where: any = { companyId }
    if (contactId) where.contactId = contactId

    const communications = await this.prisma.communication.findMany({
      where,
      orderBy: { sentAt: 'desc' }
    })

    return communications.map(comm => ({
      id: comm.id,
      companyId: comm.companyId,
      contactId: comm.contactId,
      type: comm.type,
      direction: comm.direction,
      subject: comm.subject || undefined,
      content: comm.content,
      status: comm.status,
      sentAt: comm.sentAt.toISOString(),
      deliveredAt: comm.deliveredAt?.toISOString(),
      readAt: comm.readAt?.toISOString(),
      respondedAt: comm.respondedAt?.toISOString(),
      metadata: comm.metadata as any,
      createdBy: comm.createdBy,
      createdAt: comm.createdAt.toISOString()
    }))
  }

  async updateCommunicationStatus(id: string, status: Communication['status']): Promise<Communication> {
    const updateData: any = { status }

    // Set timestamps based on status
    if (status === 'delivered') updateData.deliveredAt = new Date()
    if (status === 'read') updateData.readAt = new Date()
    if (status === 'responded') updateData.respondedAt = new Date()

    const communication = await this.prisma.communication.update({
      where: { id },
      data: updateData
    })

    return {
      id: communication.id,
      companyId: communication.companyId,
      contactId: communication.contactId,
      type: communication.type,
      direction: communication.direction,
      subject: communication.subject || undefined,
      content: communication.content,
      status: communication.status,
      sentAt: communication.sentAt.toISOString(),
      deliveredAt: communication.deliveredAt?.toISOString(),
      readAt: communication.readAt?.toISOString(),
      respondedAt: communication.respondedAt?.toISOString(),
      metadata: communication.metadata as any,
      createdBy: communication.createdBy,
      createdAt: communication.createdAt.toISOString()
    }
  }

  // ============================================================================
  // EMAIL TEMPLATES
  // ============================================================================

  async createEmailTemplate(companyId: string, template: Omit<EmailTemplate, 'id' | 'companyId' | 'createdAt' | 'updatedAt'>): Promise<EmailTemplate> {
    const emailTemplate = await this.prisma.emailTemplate.create({
      data: {
        companyId,
        ...template,
        createdBy: 'system'
      }
    })

    return {
      id: emailTemplate.id,
      companyId: emailTemplate.companyId,
      name: emailTemplate.name,
      subject: emailTemplate.subject,
      content: emailTemplate.content,
      type: emailTemplate.type,
      variables: emailTemplate.variables,
      isActive: emailTemplate.isActive,
      createdBy: emailTemplate.createdBy,
      createdAt: emailTemplate.createdAt.toISOString(),
      updatedAt: emailTemplate.updatedAt.toISOString()
    }
  }

  async getEmailTemplates(companyId: string): Promise<EmailTemplate[]> {
    const templates = await this.prisma.emailTemplate.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' }
    })

    return templates.map(template => ({
      id: template.id,
      companyId: template.companyId,
      name: template.name,
      subject: template.subject,
      content: template.content,
      type: template.type,
      variables: template.variables,
      isActive: template.isActive,
      createdBy: template.createdBy,
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString()
    }))
  }

  async updateEmailTemplate(id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const template = await this.prisma.emailTemplate.update({
      where: { id },
      data: updates
    })

    return {
      id: template.id,
      companyId: template.companyId,
      name: template.name,
      subject: template.subject,
      content: template.content,
      type: template.type,
      variables: template.variables,
      isActive: template.isActive,
      createdBy: template.createdBy,
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString()
    }
  }

  // ============================================================================
  // CRM SETTINGS
  // ============================================================================

  async getCrmSettings(companyId: string): Promise<CrmSettings | null> {
    const settings = await this.prisma.crmSettings.findUnique({
      where: { companyId }
    })

    if (!settings) return null

    return {
      id: settings.id,
      companyId: settings.companyId,
      defaultCurrency: settings.defaultCurrency,
      dealStages: settings.dealStages as any,
      leadScoring: settings.leadScoring as any,
      emailSettings: settings.emailSettings as any,
      notificationSettings: settings.notificationSettings as any,
      automationRules: settings.automationRules as any,
      createdAt: settings.createdAt.toISOString(),
      updatedAt: settings.updatedAt.toISOString()
    }
  }

  async updateCrmSettings(companyId: string, updates: Partial<CrmSettings>): Promise<CrmSettings> {
    const settings = await this.prisma.crmSettings.upsert({
      where: { companyId },
      update: updates,
      create: {
        companyId,
        defaultCurrency: 'GBP',
        dealStages: [
          { name: 'Prospecting', probability: 10, order: 1, color: '#ef4444' },
          { name: 'Qualification', probability: 25, order: 2, color: '#f97316' },
          { name: 'Proposal', probability: 50, order: 3, color: '#eab308' },
          { name: 'Negotiation', probability: 75, order: 4, color: '#22c55e' },
          { name: 'Closed Won', probability: 100, order: 5, color: '#16a34a' },
          { name: 'Closed Lost', probability: 0, order: 6, color: '#dc2626' }
        ],
        leadScoring: {
          email: 10,
          phone: 20,
          website: 15,
          social: 5,
          meeting: 30,
          timeDecay: 0.9,
          sourceMultiplier: { 'website': 1.2, 'referral': 1.5, 'cold': 0.8 }
        },
        emailSettings: {
          smtpHost: 'smtp.gmail.com',
          smtpPort: 587,
          smtpUser: '',
          smtpPass: '',
          fromEmail: '',
          fromName: '',
          trackingEnabled: true
        },
        notificationSettings: {
          dealUpdates: true,
          newLeads: true,
          campaignResults: true,
          overdueTasks: true,
          emailDigest: true
        },
        automationRules: []
      }
    })

    return {
      id: settings.id,
      companyId: settings.companyId,
      defaultCurrency: settings.defaultCurrency,
      dealStages: settings.dealStages as any,
      leadScoring: settings.leadScoring as any,
      emailSettings: settings.emailSettings as any,
      notificationSettings: settings.notificationSettings as any,
      automationRules: settings.automationRules as any,
      createdAt: settings.createdAt.toISOString(),
      updatedAt: settings.updatedAt.toISOString()
    }
  }

  // ============================================================================
  // DASHBOARD & ANALYTICS
  // ============================================================================

  async getCrmDashboardData(companyId: string): Promise<CrmDashboardData> {
    const [
      contacts,
      deals,
      campaigns,
      recentContacts,
      dealsByStage,
      upcomingActivities,
      alerts
    ] = await Promise.all([
      this.prisma.contact.count({ where: { companyId } }),
      this.prisma.deal.findMany({ where: { companyId } }),
      this.prisma.campaign.findMany({ where: { companyId } }),
      this.prisma.contact.findMany({
        where: { companyId },
        orderBy: { lastContactedAt: 'desc' },
        take: 5
      }),
      this.prisma.deal.groupBy({
        by: ['stage'],
        where: { companyId },
        _count: true
      }),
      [], // Mock upcoming activities
      this.prisma.crmAlert.findMany({
        where: { companyId, read: false },
        orderBy: { createdAt: 'desc' }
      })
    ])

    const totalDeals = deals.length
    const totalRevenue = deals
      .filter(d => d.stage === 'closed_won')
      .reduce((sum, d) => sum + d.value, 0)
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length
    const newLeadsThisMonth = recentContacts.filter(c =>
      c.createdAt >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    ).length
    const conversionRate = totalDeals > 0 ? (deals.filter(d => d.stage === 'closed_won').length / totalDeals) * 100 : 0

    return {
      summary: {
        totalContacts: contacts,
        totalDeals,
        totalRevenue,
        activeCampaigns,
        newLeadsThisMonth,
        conversionRate
      },
      recentContacts: recentContacts.map(c => ({
        id: c.id,
        companyId: c.companyId,
        type: c.type,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email || undefined,
        phone: c.phone || undefined,
        company: c.company || undefined,
        position: c.position || undefined,
        address: c.address ? c.address as any : undefined,
        tags: c.tags,
        notes: c.notes || undefined,
        lastContactedAt: c.lastContactedAt?.toISOString(),
        source: c.source,
        lifecycleStage: c.lifecycleStage,
        leadScore: c.leadScore,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString()
      })),
      dealsByStage: dealsByStage.reduce((acc, item) => {
        acc[item.stage] = item._count
        return acc
      }, {} as Record<string, number>),
      revenueByMonth: {}, // Would calculate from actual data
      topPerformingCampaigns: campaigns
        .filter(c => c.metrics && (c.metrics as any).roi > 0)
        .sort((a, b) => ((b.metrics as any).roi || 0) - ((a.metrics as any).roi || 0))
        .slice(0, 3)
        .map(c => ({
          id: c.id,
          companyId: c.companyId,
          name: c.name,
          type: c.type,
          status: c.status,
          budget: c.budget,
          currency: c.currency,
          startDate: c.startDate?.toISOString(),
          endDate: c.endDate?.toISOString(),
          targetAudience: c.targetAudience,
          goals: c.goals as any,
          metrics: c.metrics as any,
          content: c.content || undefined,
          createdBy: c.createdBy,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString()
        })),
      upcomingActivities,
      alerts: alerts.map(a => ({
        id: a.id,
        type: a.type,
        title: a.title,
        message: a.message,
        severity: a.severity,
        read: a.read,
        actionRequired: a.actionRequired,
        relatedId: a.relatedId || undefined,
        createdAt: a.createdAt.toISOString()
      }))
    }
  }

  // ============================================================================
  // AUTOMATION
  // ============================================================================

  async executeAutomationRules(companyId: string, trigger: any, data: any): Promise<void> {
    // Mock automation execution
    console.log(`Executing automation rules for ${companyId} with trigger ${trigger.type}`)
  }

  async getAutomationRules(companyId: string): Promise<any[]> {
    const settings = await this.getCrmSettings(companyId)
    return settings?.automationRules || []
  }

  // ============================================================================
  // ALERTS
  // ============================================================================

  async getCrmAlerts(companyId: string): Promise<any[]> {
    const alerts = await this.prisma.crmAlert.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' }
    })

    return alerts.map(a => ({
      id: a.id,
      companyId: a.companyId,
      type: a.type,
      title: a.title,
      message: a.message,
      severity: a.severity,
      read: a.read,
      actionRequired: a.actionRequired,
      relatedId: a.relatedId || undefined,
      createdAt: a.createdAt.toISOString()
    }))
  }

  async createCrmAlert(companyId: string, alert: Omit<any, 'id' | 'createdAt' | 'read'>): Promise<any> {
    const newAlert = await this.prisma.crmAlert.create({
      data: {
        companyId,
        ...alert,
        read: false
      }
    })

    return {
      id: newAlert.id,
      companyId: newAlert.companyId,
      type: newAlert.type,
      title: newAlert.title,
      message: newAlert.message,
      severity: newAlert.severity,
      read: newAlert.read,
      actionRequired: newAlert.actionRequired,
      relatedId: newAlert.relatedId || undefined,
      createdAt: newAlert.createdAt.toISOString()
    }
  }

  // ============================================================================
  // IMPORT/EXPORT
  // ============================================================================

  async importContacts(companyId: string, contacts: CreateContactRequest[]): Promise<Contact[]> {
    const importedContacts = await Promise.all(
      contacts.map(contact => this.createContact(companyId, contact))
    )
    return importedContacts
  }

  async exportContacts(companyId: string, filters?: ContactFilters): Promise<string> {
    const contacts = await this.getContacts(companyId, filters)
    // Mock CSV export
    return `First Name,Last Name,Email,Company\n${contacts.map(c => `${c.firstName},${c.lastName},${c.email || ''},${c.company || ''}`).join('\n')}`
  }
}