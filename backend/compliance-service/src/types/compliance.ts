export interface ComplianceTask {
  id: string
  companyId: string
  type: 'hmrc_filing' | 'companies_house_filing' | 'vat_return' | 'paye_return' | 'confirmation_statement' | 'accounts_filing' | 'tax_payment' | 'seis_eis_filing' | 'insurance_renewal' | 'contract_review' | 'data_protection' | 'health_safety'
  title: string
  description: string
  dueDate: string
  status: 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignedTo?: string
  completedAt?: string
  completedBy?: string
  reminders: ComplianceReminder[]
  attachments: string[]
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface ComplianceReminder {
  id: string
  daysBefore: number
  sentAt?: string
  status: 'pending' | 'sent' | 'failed'
}

export interface ComplianceRecord {
  id: string
  companyId: string
  type: string
  reference: string
  filingDate: string
  period: {
    start: string
    end: string
  }
  status: 'draft' | 'submitted' | 'accepted' | 'rejected' | 'amended'
  submittedBy: string
  reviewedBy?: string
  approvedBy?: string
  rejectionReason?: string
  documents: ComplianceDocument[]
  notes?: string
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface ComplianceDocument {
  id: string
  name: string
  type: 'accounts' | 'confirmation_statement' | 'tax_return' | 'confirmation_receipt' | 'other'
  fileUrl: string
  fileSize: number
  mimeType: string
  uploadedAt: string
  verified: boolean
}

export interface ComplianceDeadline {
  id: string
  companyId: string
  taskType: ComplianceTask['type']
  description: string
  deadline: string
  gracePeriodDays: number
  automaticReminders: boolean
  createdAt: string
}

export interface ComplianceTemplate {
  id: string
  name: string
  type: ComplianceTask['type']
  jurisdiction: string
  category: 'hmrc' | 'companies_house' | 'insurance' | 'legal' | 'other'
  frequency: 'annual' | 'quarterly' | 'monthly' | 'weekly' | 'one_time'
  defaultPriority: ComplianceTask['priority']
  description: string
  requirements: string[]
  estimatedDuration: number // hours
  costRange: {
    min: number
    max: number
  }
  dependencies: string[]
  template: Record<string, any>
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface ComplianceChecklist {
  id: string
  companyId: string
  name: string
  description?: string
  tasks: ComplianceChecklistItem[]
  status: 'draft' | 'active' | 'completed' | 'archived'
  progress: number
  assignedTo?: string
  dueDate?: string
  completedAt?: string
  createdAt: string
  updatedAt: string
}

export interface ComplianceChecklistItem {
  id: string
  taskType: ComplianceTask['type']
  title: string
  description: string
  completed: boolean
  completedAt?: string
  notes?: string
  order: number
}

export interface ComplianceAlert {
  id: string
  companyId: string
  type: 'deadline_approaching' | 'deadline_overdue' | 'filing_rejected' | 'document_missing' | 'regulatory_change'
  title: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  read: boolean
  actionRequired: boolean
  actionUrl?: string
  metadata: Record<string, any>
  createdAt: string
}

export interface ComplianceReport {
  id: string
  companyId: string
  period: {
    start: string
    end: string
  }
  summary: {
    totalTasks: number
    completedTasks: number
    overdueTasks: number
    upcomingDeadlines: number
    complianceScore: number
  }
  tasks: ComplianceTask[]
  filings: ComplianceRecord[]
  alerts: ComplianceAlert[]
  recommendations: string[]
  generatedAt: string
  createdAt: string
}

export interface ComplianceSettings {
  id: string
  companyId: string
  autoReminders: boolean
  reminderDays: number[]
  emailNotifications: boolean
  smsNotifications: boolean
  assignedAccountant?: string
  defaultJurisdiction: string
  taxYearEnd: string
  filingPreferences: Record<string, any>
  createdAt: string
  updatedAt: string
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

export interface CreateComplianceTaskRequest {
  type: ComplianceTask['type']
  title: string
  description: string
  dueDate: string
  priority?: ComplianceTask['priority']
  assignedTo?: string
  reminders?: { daysBefore: number }[]
  metadata?: Record<string, any>
}

export interface UpdateComplianceTaskRequest {
  title?: string
  description?: string
  dueDate?: string
  status?: ComplianceTask['status']
  priority?: ComplianceTask['priority']
  assignedTo?: string
  metadata?: Record<string, any>
}

export interface CreateComplianceRecordRequest {
  type: string
  reference: string
  filingDate: string
  period: {
    start: string
    end: string
  }
  documents?: {
    name: string
    type: ComplianceDocument['type']
    fileUrl: string
    fileSize: number
    mimeType: string
  }[]
  notes?: string
  metadata?: Record<string, any>
}

export interface CreateComplianceChecklistRequest {
  name: string
  description?: string
  tasks: {
    taskType: ComplianceTask['type']
    title: string
    description: string
    order: number
  }[]
  assignedTo?: string
  dueDate?: string
}

export interface UpdateComplianceSettingsRequest {
  autoReminders?: boolean
  reminderDays?: number[]
  emailNotifications?: boolean
  smsNotifications?: boolean
  assignedAccountant?: string
  defaultJurisdiction?: string
  taxYearEnd?: string
  filingPreferences?: Record<string, any>
}

export interface ComplianceDashboardData {
  upcomingDeadlines: ComplianceTask[]
  overdueTasks: ComplianceTask[]
  recentFilings: ComplianceRecord[]
  activeAlerts: ComplianceAlert[]
  complianceScore: number
  tasksByStatus: Record<string, number>
  tasksByPriority: Record<string, number>
}

// ============================================================================
// SERVICE INTERFACE
// ============================================================================

export interface ComplianceService {
  // Task Management
  createComplianceTask(companyId: string, data: CreateComplianceTaskRequest): Promise<ComplianceTask>
  getComplianceTasks(companyId: string, filters?: TaskFilters): Promise<ComplianceTask[]>
  updateComplianceTask(id: string, updates: UpdateComplianceTaskRequest): Promise<ComplianceTask>
  deleteComplianceTask(id: string): Promise<void>
  completeComplianceTask(id: string, completedBy: string): Promise<ComplianceTask>
  getUpcomingDeadlines(companyId: string, days?: number): Promise<ComplianceTask[]>
  getOverdueTasks(companyId: string): Promise<ComplianceTask[]>

  // Record Management
  createComplianceRecord(companyId: string, data: CreateComplianceRecordRequest, submittedBy: string): Promise<ComplianceRecord>
  getComplianceRecords(companyId: string, type?: string): Promise<ComplianceRecord[]>
  updateComplianceRecord(id: string, updates: Partial<ComplianceRecord>): Promise<ComplianceRecord>
  getComplianceRecord(id: string): Promise<ComplianceRecord | null>

  // Checklist Management
  createComplianceChecklist(companyId: string, data: CreateComplianceChecklistRequest): Promise<ComplianceChecklist>
  getComplianceChecklists(companyId: string): Promise<ComplianceChecklist[]>
  updateComplianceChecklist(id: string, updates: Partial<ComplianceChecklist>): Promise<ComplianceChecklist>
  completeChecklistItem(checklistId: string, itemId: string, notes?: string): Promise<ComplianceChecklist>

  // Templates
  getComplianceTemplates(category?: string, jurisdiction?: string): Promise<ComplianceTemplate[]>
  createComplianceTaskFromTemplate(companyId: string, templateId: string, dueDate: string): Promise<ComplianceTask>

  // Settings
  getComplianceSettings(companyId: string): Promise<ComplianceSettings | null>
  updateComplianceSettings(companyId: string, updates: UpdateComplianceSettingsRequest): Promise<ComplianceSettings>

  // Alerts & Notifications
  getComplianceAlerts(companyId: string, unreadOnly?: boolean): Promise<ComplianceAlert[]>
  markAlertRead(id: string): Promise<void>
  createComplianceAlert(companyId: string, alert: Omit<ComplianceAlert, 'id' | 'createdAt' | 'read'>): Promise<ComplianceAlert>

  // Reports & Analytics
  generateComplianceReport(companyId: string, period: { start: string; end: string }): Promise<ComplianceReport>
  getComplianceDashboardData(companyId: string): Promise<ComplianceDashboardData>
  calculateComplianceScore(companyId: string): Promise<number>

  // External Integrations
  syncWithHMRC(companyId: string): Promise<void>
  syncWithCompaniesHouse(companyId: string): Promise<void>
  checkFilingStatus(reference: string, type: string): Promise<string>

  // Automated Tasks
  generateAnnualComplianceTasks(companyId: string, year: number): Promise<ComplianceTask[]>
  sendDeadlineReminders(): Promise<void>
  checkForOverdueTasks(): Promise<ComplianceTask[]>
}

export interface TaskFilters {
  status?: ComplianceTask['status'][]
  priority?: ComplianceTask['priority'][]
  type?: ComplianceTask['type'][]
  assignedTo?: string
  startDate?: string
  endDate?: string
}