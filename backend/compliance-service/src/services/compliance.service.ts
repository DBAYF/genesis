import { PrismaClient } from '@prisma/client'
import {
  ComplianceTask,
  ComplianceRecord,
  ComplianceChecklist,
  ComplianceAlert,
  ComplianceReport,
  ComplianceSettings,
  CreateComplianceTaskRequest,
  UpdateComplianceTaskRequest,
  CreateComplianceRecordRequest,
  CreateComplianceChecklistRequest,
  UpdateComplianceSettingsRequest,
  ComplianceDashboardData,
  ComplianceService,
  TaskFilters
} from '../types/compliance'

export class ComplianceServiceImpl implements ComplianceService {
  constructor(private prisma: PrismaClient) {}

  // ============================================================================
  // COMPLIANCE TASK MANAGEMENT
  // ============================================================================

  async createComplianceTask(companyId: string, data: CreateComplianceTaskRequest): Promise<ComplianceTask> {
    const task = await this.prisma.complianceTask.create({
      data: {
        companyId,
        ...data,
        status: 'pending',
        reminders: data.reminders || [],
        attachments: [],
        metadata: data.metadata || {}
      }
    })

    return {
      id: task.id,
      companyId: task.companyId,
      type: task.type,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate.toISOString(),
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo || undefined,
      completedAt: task.completedAt?.toISOString(),
      completedBy: task.completedBy || undefined,
      reminders: task.reminders as any,
      attachments: task.attachments,
      metadata: task.metadata as any,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString()
    }
  }

  async getComplianceTasks(companyId: string, filters?: TaskFilters): Promise<ComplianceTask[]> {
    const where: any = { companyId }

    if (filters) {
      if (filters.status?.length) where.status = { in: filters.status }
      if (filters.priority?.length) where.priority = { in: filters.priority }
      if (filters.type?.length) where.type = { in: filters.type }
      if (filters.assignedTo) where.assignedTo = filters.assignedTo
      if (filters.startDate || filters.endDate) {
        where.dueDate = {}
        if (filters.startDate) where.dueDate.gte = new Date(filters.startDate)
        if (filters.endDate) where.dueDate.lte = new Date(filters.endDate)
      }
    }

    const tasks = await this.prisma.complianceTask.findMany({
      where,
      orderBy: { dueDate: 'asc' }
    })

    return tasks.map(task => ({
      id: task.id,
      companyId: task.companyId,
      type: task.type,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate.toISOString(),
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo || undefined,
      completedAt: task.completedAt?.toISOString(),
      completedBy: task.completedBy || undefined,
      reminders: task.reminders as any,
      attachments: task.attachments,
      metadata: task.metadata as any,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString()
    }))
  }

  async updateComplianceTask(id: string, updates: UpdateComplianceTaskRequest): Promise<ComplianceTask> {
    const updateData: any = { ...updates }
    if (updates.dueDate) updateData.dueDate = new Date(updates.dueDate)

    const task = await this.prisma.complianceTask.update({
      where: { id },
      data: updateData
    })

    return {
      id: task.id,
      companyId: task.companyId,
      type: task.type,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate.toISOString(),
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo || undefined,
      completedAt: task.completedAt?.toISOString(),
      completedBy: task.completedBy || undefined,
      reminders: task.reminders as any,
      attachments: task.attachments,
      metadata: task.metadata as any,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString()
    }
  }

  async deleteComplianceTask(id: string): Promise<void> {
    await this.prisma.complianceTask.delete({ where: { id } })
  }

  async completeComplianceTask(id: string, completedBy: string): Promise<ComplianceTask> {
    return this.updateComplianceTask(id, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      completedBy
    })
  }

  async getUpcomingDeadlines(companyId: string, days: number = 30): Promise<ComplianceTask[]> {
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + days)

    const tasks = await this.prisma.complianceTask.findMany({
      where: {
        companyId,
        dueDate: {
          lte: futureDate,
          gte: new Date()
        },
        status: { in: ['pending', 'in_progress'] }
      },
      orderBy: { dueDate: 'asc' }
    })

    return tasks.map(task => ({
      id: task.id,
      companyId: task.companyId,
      type: task.type,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate.toISOString(),
      status: task.status,
      priority: task.priority,
      assignedTo: task.assignedTo || undefined,
      completedAt: task.completedAt?.toISOString(),
      completedBy: task.completedBy || undefined,
      reminders: task.reminders as any,
      attachments: task.attachments,
      metadata: task.metadata as any,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString()
    }))
  }

  async getOverdueTasks(companyId: string): Promise<ComplianceTask[]> {
    const tasks = await this.prisma.complianceTask.findMany({
      where: {
        companyId,
        dueDate: { lt: new Date() },
        status: { in: ['pending', 'in_progress'] }
      },
      orderBy: { dueDate: 'asc' }
    })

    // Update status to overdue
    await Promise.all(
      tasks.map(task =>
        this.prisma.complianceTask.update({
          where: { id: task.id },
          data: { status: 'overdue' }
        })
      )
    )

    return tasks.map(task => ({
      id: task.id,
      companyId: task.companyId,
      type: task.type,
      title: task.title,
      description: task.description,
      dueDate: task.dueDate.toISOString(),
      status: 'overdue',
      priority: task.priority,
      assignedTo: task.assignedTo || undefined,
      completedAt: task.completedAt?.toISOString(),
      completedBy: task.completedBy || undefined,
      reminders: task.reminders as any,
      attachments: task.attachments,
      metadata: task.metadata as any,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString()
    }))
  }

  // ============================================================================
  // COMPLIANCE RECORD MANAGEMENT
  // ============================================================================

  async createComplianceRecord(companyId: string, data: CreateComplianceRecordRequest, submittedBy: string): Promise<ComplianceRecord> {
    const record = await this.prisma.complianceRecord.create({
      data: {
        companyId,
        ...data,
        status: 'submitted',
        submittedBy,
        documents: data.documents || [],
        notes: data.notes,
        metadata: data.metadata || {}
      }
    })

    return {
      id: record.id,
      companyId: record.companyId,
      type: record.type,
      reference: record.reference,
      filingDate: record.filingDate.toISOString(),
      period: record.period as any,
      status: record.status,
      submittedBy: record.submittedBy,
      reviewedBy: record.reviewedBy || undefined,
      approvedBy: record.approvedBy || undefined,
      rejectionReason: record.rejectionReason || undefined,
      documents: record.documents as any,
      notes: record.notes || undefined,
      metadata: record.metadata as any,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString()
    }
  }

  async getComplianceRecords(companyId: string, type?: string): Promise<ComplianceRecord[]> {
    const where: any = { companyId }
    if (type) where.type = type

    const records = await this.prisma.complianceRecord.findMany({
      where,
      orderBy: { filingDate: 'desc' }
    })

    return records.map(record => ({
      id: record.id,
      companyId: record.companyId,
      type: record.type,
      reference: record.reference,
      filingDate: record.filingDate.toISOString(),
      period: record.period as any,
      status: record.status,
      submittedBy: record.submittedBy,
      reviewedBy: record.reviewedBy || undefined,
      approvedBy: record.approvedBy || undefined,
      rejectionReason: record.rejectionReason || undefined,
      documents: record.documents as any,
      notes: record.notes || undefined,
      metadata: record.metadata as any,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString()
    }))
  }

  async updateComplianceRecord(id: string, updates: Partial<ComplianceRecord>): Promise<ComplianceRecord> {
    const record = await this.prisma.complianceRecord.update({
      where: { id },
      data: updates
    })

    return {
      id: record.id,
      companyId: record.companyId,
      type: record.type,
      reference: record.reference,
      filingDate: record.filingDate.toISOString(),
      period: record.period as any,
      status: record.status,
      submittedBy: record.submittedBy,
      reviewedBy: record.reviewedBy || undefined,
      approvedBy: record.approvedBy || undefined,
      rejectionReason: record.rejectionReason || undefined,
      documents: record.documents as any,
      notes: record.notes || undefined,
      metadata: record.metadata as any,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString()
    }
  }

  async getComplianceRecord(id: string): Promise<ComplianceRecord | null> {
    const record = await this.prisma.complianceRecord.findUnique({
      where: { id }
    })

    if (!record) return null

    return {
      id: record.id,
      companyId: record.companyId,
      type: record.type,
      reference: record.reference,
      filingDate: record.filingDate.toISOString(),
      period: record.period as any,
      status: record.status,
      submittedBy: record.submittedBy,
      reviewedBy: record.reviewedBy || undefined,
      approvedBy: record.approvedBy || undefined,
      rejectionReason: record.rejectionReason || undefined,
      documents: record.documents as any,
      notes: record.notes || undefined,
      metadata: record.metadata as any,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString()
    }
  }

  // ============================================================================
  // COMPLIANCE CHECKLIST MANAGEMENT
  // ============================================================================

  async createComplianceChecklist(companyId: string, data: CreateComplianceChecklistRequest): Promise<ComplianceChecklist> {
    const checklist = await this.prisma.complianceChecklist.create({
      data: {
        companyId,
        ...data,
        status: 'active',
        progress: 0
      }
    })

    return {
      id: checklist.id,
      companyId: checklist.companyId,
      name: checklist.name,
      description: checklist.description || undefined,
      tasks: checklist.tasks as any,
      status: checklist.status,
      progress: checklist.progress,
      assignedTo: checklist.assignedTo || undefined,
      dueDate: checklist.dueDate?.toISOString(),
      completedAt: checklist.completedAt?.toISOString(),
      createdAt: checklist.createdAt.toISOString(),
      updatedAt: checklist.updatedAt.toISOString()
    }
  }

  async getComplianceChecklists(companyId: string): Promise<ComplianceChecklist[]> {
    const checklists = await this.prisma.complianceChecklist.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' }
    })

    return checklists.map(checklist => ({
      id: checklist.id,
      companyId: checklist.companyId,
      name: checklist.name,
      description: checklist.description || undefined,
      tasks: checklist.tasks as any,
      status: checklist.status,
      progress: checklist.progress,
      assignedTo: checklist.assignedTo || undefined,
      dueDate: checklist.dueDate?.toISOString(),
      completedAt: checklist.completedAt?.toISOString(),
      createdAt: checklist.createdAt.toISOString(),
      updatedAt: checklist.updatedAt.toISOString()
    }))
  }

  async updateComplianceChecklist(id: string, updates: Partial<ComplianceChecklist>): Promise<ComplianceChecklist> {
    const updateData: any = { ...updates }
    if (updates.dueDate) updateData.dueDate = new Date(updates.dueDate)
    if (updates.completedAt) updateData.completedAt = new Date(updates.completedAt)

    const checklist = await this.prisma.complianceChecklist.update({
      where: { id },
      data: updateData
    })

    return {
      id: checklist.id,
      companyId: checklist.companyId,
      name: checklist.name,
      description: checklist.description || undefined,
      tasks: checklist.tasks as any,
      status: checklist.status,
      progress: checklist.progress,
      assignedTo: checklist.assignedTo || undefined,
      dueDate: checklist.dueDate?.toISOString(),
      completedAt: checklist.completedAt?.toISOString(),
      createdAt: checklist.createdAt.toISOString(),
      updatedAt: checklist.updatedAt.toISOString()
    }
  }

  async completeChecklistItem(checklistId: string, itemId: string, notes?: string): Promise<ComplianceChecklist> {
    const checklist = await this.prisma.complianceChecklist.findUnique({
      where: { id: checklistId }
    })

    if (!checklist) throw new Error('Checklist not found')

    const updatedTasks = checklist.tasks.map((task: any) =>
      task.id === itemId
        ? { ...task, completed: true, completedAt: new Date().toISOString(), notes }
        : task
    )

    const completedTasks = updatedTasks.filter((task: any) => task.completed).length
    const progress = (completedTasks / updatedTasks.length) * 100

    return this.updateComplianceChecklist(checklistId, {
      tasks: updatedTasks,
      progress,
      status: progress === 100 ? 'completed' : 'active',
      completedAt: progress === 100 ? new Date().toISOString() : undefined
    })
  }

  // ============================================================================
  // TEMPLATES
  // ============================================================================

  async getComplianceTemplates(category?: string, jurisdiction?: string): Promise<any[]> {
    // Mock templates - in production, these would be stored in database
    const templates = [
      {
        id: 'confirmation-statement',
        name: 'Annual Confirmation Statement',
        type: 'confirmation_statement',
        jurisdiction: 'uk',
        category: 'companies_house',
        frequency: 'annual',
        defaultPriority: 'high',
        description: 'Annual confirmation that company information is up to date',
        requirements: ['Director information', 'Registered office address', 'Share capital'],
        estimatedDuration: 2,
        costRange: { min: 50, max: 200 },
        dependencies: [],
        template: {},
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'accounts-filing',
        name: 'Annual Accounts Filing',
        type: 'accounts_filing',
        jurisdiction: 'uk',
        category: 'companies_house',
        frequency: 'annual',
        defaultPriority: 'critical',
        description: 'File annual accounts with Companies House',
        requirements: ['Profit & Loss account', 'Balance sheet', 'Director\'s report'],
        estimatedDuration: 8,
        costRange: { min: 200, max: 1000 },
        dependencies: ['financial-statements'],
        template: {},
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]

    let filtered = templates
    if (category) filtered = filtered.filter(t => t.category === category)
    if (jurisdiction) filtered = filtered.filter(t => t.jurisdiction === jurisdiction)

    return filtered
  }

  async createComplianceTaskFromTemplate(companyId: string, templateId: string, dueDate: string): Promise<ComplianceTask> {
    const templates = await this.getComplianceTemplates()
    const template = templates.find(t => t.id === templateId)

    if (!template) throw new Error('Template not found')

    return this.createComplianceTask(companyId, {
      type: template.type,
      title: template.name,
      description: template.description,
      dueDate,
      priority: template.defaultPriority
    })
  }

  // ============================================================================
  // SETTINGS
  // ============================================================================

  async getComplianceSettings(companyId: string): Promise<ComplianceSettings | null> {
    const settings = await this.prisma.complianceSettings.findUnique({
      where: { companyId }
    })

    if (!settings) return null

    return {
      id: settings.id,
      companyId: settings.companyId,
      autoReminders: settings.autoReminders,
      reminderDays: settings.reminderDays,
      emailNotifications: settings.emailNotifications,
      smsNotifications: settings.smsNotifications,
      assignedAccountant: settings.assignedAccountant || undefined,
      defaultJurisdiction: settings.defaultJurisdiction,
      taxYearEnd: settings.taxYearEnd,
      filingPreferences: settings.filingPreferences as any,
      createdAt: settings.createdAt.toISOString(),
      updatedAt: settings.updatedAt.toISOString()
    }
  }

  async updateComplianceSettings(companyId: string, updates: UpdateComplianceSettingsRequest): Promise<ComplianceSettings> {
    const settings = await this.prisma.complianceSettings.upsert({
      where: { companyId },
      update: updates,
      create: {
        companyId,
        autoReminders: updates.autoReminders ?? true,
        reminderDays: updates.reminderDays ?? [30, 14, 7, 3, 1],
        emailNotifications: updates.emailNotifications ?? true,
        smsNotifications: updates.smsNotifications ?? false,
        defaultJurisdiction: updates.defaultJurisdiction ?? 'uk',
        taxYearEnd: updates.taxYearEnd ?? '31-03',
        filingPreferences: updates.filingPreferences ?? {}
      }
    })

    return {
      id: settings.id,
      companyId: settings.companyId,
      autoReminders: settings.autoReminders,
      reminderDays: settings.reminderDays,
      emailNotifications: settings.emailNotifications,
      smsNotifications: settings.smsNotifications,
      assignedAccountant: settings.assignedAccountant || undefined,
      defaultJurisdiction: settings.defaultJurisdiction,
      taxYearEnd: settings.taxYearEnd,
      filingPreferences: settings.filingPreferences as any,
      createdAt: settings.createdAt.toISOString(),
      updatedAt: settings.updatedAt.toISOString()
    }
  }

  // ============================================================================
  // ALERTS & NOTIFICATIONS
  // ============================================================================

  async getComplianceAlerts(companyId: string, unreadOnly?: boolean): Promise<ComplianceAlert[]> {
    const where: any = { companyId }
    if (unreadOnly) where.read = false

    const alerts = await this.prisma.complianceAlert.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return alerts.map(alert => ({
      id: alert.id,
      companyId: alert.companyId,
      type: alert.type,
      title: alert.title,
      message: alert.message,
      severity: alert.severity,
      read: alert.read,
      actionRequired: alert.actionRequired,
      actionUrl: alert.actionUrl || undefined,
      metadata: alert.metadata as any,
      createdAt: alert.createdAt.toISOString()
    }))
  }

  async markAlertRead(id: string): Promise<void> {
    await this.prisma.complianceAlert.update({
      where: { id },
      data: { read: true }
    })
  }

  async createComplianceAlert(companyId: string, alert: Omit<ComplianceAlert, 'id' | 'createdAt' | 'read'>): Promise<ComplianceAlert> {
    const newAlert = await this.prisma.complianceAlert.create({
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
      actionUrl: newAlert.actionUrl || undefined,
      metadata: newAlert.metadata as any,
      createdAt: newAlert.createdAt.toISOString()
    }
  }

  // ============================================================================
  // REPORTS & DASHBOARD
  // ============================================================================

  async generateComplianceReport(companyId: string, period: { start: string; end: string }): Promise<ComplianceReport> {
    const startDate = new Date(period.start)
    const endDate = new Date(period.end)

    const [tasks, records, alerts] = await Promise.all([
      this.prisma.complianceTask.findMany({
        where: {
          companyId,
          createdAt: { gte: startDate, lte: endDate }
        }
      }),
      this.prisma.complianceRecord.findMany({
        where: {
          companyId,
          filingDate: { gte: startDate, lte: endDate }
        }
      }),
      this.prisma.complianceAlert.findMany({
        where: {
          companyId,
          createdAt: { gte: startDate, lte: endDate }
        }
      })
    ])

    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.status === 'completed').length
    const overdueTasks = tasks.filter(t => t.status === 'overdue').length

    const upcomingDeadlines = await this.getUpcomingDeadlines(companyId, 30)
    const complianceScore = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 100

    return {
      id: `report-${Date.now()}`,
      companyId,
      period,
      summary: {
        totalTasks,
        completedTasks,
        overdueTasks,
        upcomingDeadlines: upcomingDeadlines.length,
        complianceScore
      },
      tasks: tasks.map(task => ({
        id: task.id,
        companyId: task.companyId,
        type: task.type,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate.toISOString(),
        status: task.status,
        priority: task.priority,
        assignedTo: task.assignedTo || undefined,
        completedAt: task.completedAt?.toISOString(),
        completedBy: task.completedBy || undefined,
        reminders: task.reminders as any,
        attachments: task.attachments,
        metadata: task.metadata as any,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString()
      })),
      filings: records.map(record => ({
        id: record.id,
        companyId: record.companyId,
        type: record.type,
        reference: record.reference,
        filingDate: record.filingDate.toISOString(),
        period: record.period as any,
        status: record.status,
        submittedBy: record.submittedBy,
        reviewedBy: record.reviewedBy || undefined,
        approvedBy: record.approvedBy || undefined,
        rejectionReason: record.rejectionReason || undefined,
        documents: record.documents as any,
        notes: record.notes || undefined,
        metadata: record.metadata as any,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString()
      })),
      alerts: alerts.map(alert => ({
        id: alert.id,
        companyId: alert.companyId,
        type: alert.type,
        title: alert.title,
        message: alert.message,
        severity: alert.severity,
        read: alert.read,
        actionRequired: alert.actionRequired,
        actionUrl: alert.actionUrl || undefined,
        metadata: alert.metadata as any,
        createdAt: alert.createdAt.toISOString()
      })),
      recommendations: [
        overdueTasks > 0 ? 'Address overdue compliance tasks immediately' : 'Great job staying on top of compliance!',
        complianceScore < 80 ? 'Consider setting up automated reminders for better compliance tracking' : 'Strong compliance performance'
      ],
      generatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  async getComplianceDashboardData(companyId: string): Promise<ComplianceDashboardData> {
    const [upcomingDeadlines, overdueTasks, recentFilings, activeAlerts, tasks] = await Promise.all([
      this.getUpcomingDeadlines(companyId, 30),
      this.getOverdueTasks(companyId),
      this.prisma.complianceRecord.findMany({
        where: { companyId },
        orderBy: { filingDate: 'desc' },
        take: 5
      }),
      this.prisma.complianceAlert.findMany({
        where: { companyId, read: false },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.complianceTask.findMany({
        where: { companyId }
      })
    ])

    const complianceScore = tasks.length > 0
      ? (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100
      : 100

    const tasksByStatus = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const tasksByPriority = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      upcomingDeadlines,
      overdueTasks,
      recentFilings: recentFilings.map(record => ({
        id: record.id,
        companyId: record.companyId,
        type: record.type,
        reference: record.reference,
        filingDate: record.filingDate.toISOString(),
        period: record.period as any,
        status: record.status,
        submittedBy: record.submittedBy,
        reviewedBy: record.reviewedBy || undefined,
        approvedBy: record.approvedBy || undefined,
        rejectionReason: record.rejectionReason || undefined,
        documents: record.documents as any,
        notes: record.notes || undefined,
        metadata: record.metadata as any,
        createdAt: record.createdAt.toISOString(),
        updatedAt: record.updatedAt.toISOString()
      })),
      activeAlerts: activeAlerts.map(alert => ({
        id: alert.id,
        companyId: alert.companyId,
        type: alert.type,
        title: alert.title,
        message: alert.message,
        severity: alert.severity,
        read: alert.read,
        actionRequired: alert.actionRequired,
        actionUrl: alert.actionUrl || undefined,
        metadata: alert.metadata as any,
        createdAt: alert.createdAt.toISOString()
      })),
      complianceScore,
      tasksByStatus,
      tasksByPriority
    }
  }

  async calculateComplianceScore(companyId: string): Promise<number> {
    const tasks = await this.prisma.complianceTask.findMany({
      where: { companyId }
    })

    if (tasks.length === 0) return 100

    const completedTasks = tasks.filter(t => t.status === 'completed').length
    const overdueTasks = tasks.filter(t => t.status === 'overdue').length

    // Penalize overdue tasks more heavily
    const baseScore = (completedTasks / tasks.length) * 100
    const penalty = (overdueTasks / tasks.length) * 20

    return Math.max(0, baseScore - penalty)
  }

  // ============================================================================
  // EXTERNAL INTEGRATIONS
  // ============================================================================

  async syncWithHMRC(companyId: string): Promise<void> {
    // Mock HMRC integration
    console.log(`Syncing company ${companyId} with HMRC`)
  }

  async syncWithCompaniesHouse(companyId: string): Promise<void> {
    // Mock Companies House integration
    console.log(`Syncing company ${companyId} with Companies House`)
  }

  async checkFilingStatus(reference: string, type: string): Promise<string> {
    // Mock status check
    return 'accepted'
  }

  // ============================================================================
  // AUTOMATED TASKS
  // ============================================================================

  async generateAnnualComplianceTasks(companyId: string, year: number): Promise<ComplianceTask[]> {
    const templates = await this.getComplianceTemplates()
    const annualTemplates = templates.filter(t => t.frequency === 'annual')

    const tasks = await Promise.all(
      annualTemplates.map(template =>
        this.createComplianceTaskFromTemplate(
          companyId,
          template.id,
          `${year + 1}-03-31` // Default to March 31st next year
        )
      )
    )

    return tasks
  }

  async sendDeadlineReminders(): Promise<void> {
    // This would be called by a scheduled job
    const upcomingTasks = await this.prisma.complianceTask.findMany({
      where: {
        dueDate: {
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next 7 days
          gte: new Date()
        },
        status: { in: ['pending', 'in_progress'] }
      },
      include: { company: true }
    })

    // Mock reminder sending - in production would send emails/SMS
    console.log(`Sending reminders for ${upcomingTasks.length} upcoming deadlines`)
  }

  async checkForOverdueTasks(): Promise<ComplianceTask[]> {
    const overdueTasks = await this.getOverdueTasks('') // Would need to check all companies

    // Create alerts for overdue tasks
    for (const task of overdueTasks) {
      await this.createComplianceAlert(task.companyId, {
        type: 'deadline_overdue',
        title: `Overdue: ${task.title}`,
        message: `The compliance task "${task.title}" is now overdue.`,
        severity: 'high',
        actionRequired: true,
        actionUrl: `/compliance/tasks/${task.id}`,
        metadata: { taskId: task.id }
      })
    }

    return overdueTasks
  }
}