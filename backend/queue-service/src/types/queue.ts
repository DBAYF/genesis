export interface JobData {
  id: string
  type: JobType
  payload: Record<string, any>
  priority?: JobPriority
  delay?: number
  attempts?: number
  backoff?: {
    type: 'fixed' | 'exponential'
    delay: number
  }
  removeOnComplete?: number
  removeOnFail?: number
}

export enum JobType {
  // Email Jobs
  SEND_EMAIL = 'send_email',
  SEND_BULK_EMAIL = 'send_bulk_email',
  SEND_NEWSLETTER = 'send_newsletter',

  // Notification Jobs
  SEND_SMS = 'send_sms',
  SEND_PUSH_NOTIFICATION = 'send_push_notification',
  SEND_WEBHOOK = 'send_webhook',

  // Compliance Jobs
  PROCESS_COMPLIANCE_TASK = 'process_compliance_task',
  SEND_COMPLIANCE_REMINDER = 'send_compliance_reminder',
  CHECK_OVERDUE_TASKS = 'check_overdue_tasks',

  // CRM Jobs
  PROCESS_CRM_AUTOMATION = 'process_crm_automation',
  SEND_CAMPAIGN_EMAIL = 'send_campaign_email',
  UPDATE_LEAD_SCORES = 'update_lead_scores',

  // Calendar Jobs
  SEND_CALENDAR_INVITE = 'send_calendar_invite',
  SYNC_EXTERNAL_CALENDAR = 'sync_external_calendar',
  SEND_EVENT_REMINDER = 'send_event_reminder',

  // Billing Jobs
  PROCESS_SUBSCRIPTION = 'process_subscription',
  SEND_INVOICE = 'send_invoice',
  PROCESS_PAYMENT = 'process_payment',
  HANDLE_WEBHOOK = 'handle_webhook',

  // AI/ML Jobs
  PROCESS_AI_REQUEST = 'process_ai_request',
  GENERATE_REPORT = 'generate_report',
  ANALYZE_DATA = 'analyze_data',

  // System Jobs
  CLEANUP_DATA = 'cleanup_data',
  BACKUP_DATABASE = 'backup_database',
  HEALTH_CHECK = 'health_check',

  // Custom Jobs
  CUSTOM_JOB = 'custom_job'
}

export enum JobPriority {
  LOW = 1,
  NORMAL = 5,
  HIGH = 10,
  CRITICAL = 20
}

export enum JobStatus {
  WAITING = 'waiting',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed',
  DELAYED = 'delayed',
  PAUSED = 'paused'
}

export interface JobResult {
  success: boolean
  data?: any
  error?: string
  metadata?: Record<string, any>
  duration?: number
}

export interface QueueMetrics {
  waiting: number
  active: number
  completed: number
  failed: number
  delayed: number
  paused: number
  throughput: {
    lastHour: number
    lastDay: number
    lastWeek: number
  }
  latency: {
    average: number
    p95: number
    p99: number
  }
}

export interface ScheduledJob {
  id: string
  name: string
  cron: string
  jobType: JobType
  payload: Record<string, any>
  enabled: boolean
  lastRun?: string
  nextRun?: string
  createdAt: string
  updatedAt: string
}

// ============================================================================
// EMAIL JOB TYPES
// ============================================================================

export interface EmailJobData {
  to: string | string[]
  subject: string
  html: string
  text?: string
  from?: string
  replyTo?: string
  attachments?: EmailAttachment[]
  templateId?: string
  templateData?: Record<string, any>
  tracking?: {
    enabled: boolean
    campaignId?: string
    userId?: string
  }
}

export interface EmailAttachment {
  filename: string
  content: Buffer | string
  contentType?: string
  encoding?: string
}

// ============================================================================
// SMS JOB TYPES
// ============================================================================

export interface SmsJobData {
  to: string
  message: string
  from?: string
  tracking?: {
    enabled: boolean
    campaignId?: string
    userId?: string
  }
}

// ============================================================================
// WEBHOOK JOB TYPES
// ============================================================================

export interface WebhookJobData {
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  body?: any
  timeout?: number
  retries?: number
  secret?: string // For webhook signature verification
}

// ============================================================================
// COMPLIANCE JOB TYPES
// ============================================================================

export interface ComplianceTaskJobData {
  taskId: string
  companyId: string
  taskType: string
  dueDate: string
  assigneeId?: string
}

export interface ComplianceReminderJobData {
  taskId: string
  companyId: string
  userId: string
  taskTitle: string
  dueDate: string
  reminderType: 'email' | 'sms' | 'push'
}

// ============================================================================
// CRM JOB TYPES
// ============================================================================

export interface CrmAutomationJobData {
  automationId: string
  companyId: string
  trigger: string
  data: Record<string, any>
}

export interface CampaignEmailJobData {
  campaignId: string
  contactId: string
  emailData: EmailJobData
}

// ============================================================================
// CALENDAR JOB TYPES
// ============================================================================

export interface CalendarInviteJobData {
  eventId: string
  attendeeId: string
  action: 'invite' | 'update' | 'cancel'
}

export interface CalendarSyncJobData {
  integrationId: string
  calendarId: string
  syncFrom?: string
  syncTo?: string
  fullSync?: boolean
}

// ============================================================================
// BILLING JOB TYPES
// ============================================================================

export interface SubscriptionJobData {
  subscriptionId: string
  action: 'create' | 'update' | 'cancel' | 'renew'
  data?: Record<string, any>
}

export interface InvoiceJobData {
  invoiceId: string
  action: 'create' | 'send' | 'remind' | 'overdue'
}

export interface PaymentJobData {
  paymentId: string
  action: 'process' | 'refund' | 'retry'
  data?: Record<string, any>
}

// ============================================================================
// AI/ML JOB TYPES
// ============================================================================

export interface AiRequestJobData {
  requestId: string
  type: 'text' | 'image' | 'analysis' | 'generation'
  prompt: string
  model?: string
  parameters?: Record<string, any>
  callbackUrl?: string
}

export interface ReportJobData {
  reportId: string
  type: 'financial' | 'compliance' | 'crm' | 'calendar' | 'billing'
  parameters: Record<string, any>
  format: 'pdf' | 'csv' | 'xlsx'
  recipients?: string[]
}

// ============================================================================
// SYSTEM JOB TYPES
// ============================================================================

export interface CleanupJobData {
  type: 'logs' | 'temp_files' | 'old_data' | 'cache'
  olderThan?: string
  dryRun?: boolean
}

export interface BackupJobData {
  type: 'database' | 'files' | 'full'
  destination: string
  compression?: boolean
  retention?: number
}

// ============================================================================
// SERVICE INTERFACES
// ============================================================================

export interface QueueService {
  // Job Management
  addJob(jobData: JobData): Promise<string>
  getJob(jobId: string): Promise<any>
  removeJob(jobId: string): Promise<void>
  retryJob(jobId: string): Promise<void>

  // Bulk Operations
  addBulkJobs(jobs: JobData[]): Promise<string[]>
  getJobs(status?: JobStatus, limit?: number): Promise<any[]>

  // Queue Management
  pauseQueue(): Promise<void>
  resumeQueue(): Promise<void>
  cleanQueue(grace: number): Promise<void>

  // Scheduled Jobs
  scheduleJob(name: string, cron: string, jobData: Omit<JobData, 'id'>): Promise<string>
  unscheduleJob(jobId: string): Promise<void>
  getScheduledJobs(): Promise<ScheduledJob[]>

  // Metrics & Monitoring
  getMetrics(): Promise<QueueMetrics>
  getJobStats(jobType?: JobType): Promise<Record<string, any>>

  // Health Checks
  healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: any }>
}

export interface JobProcessor {
  process(job: any): Promise<JobResult>
}

export interface EmailService {
  sendEmail(data: EmailJobData): Promise<JobResult>
  sendBulkEmail(data: { emails: EmailJobData[] }): Promise<JobResult>
}

export interface SmsService {
  sendSms(data: SmsJobData): Promise<JobResult>
}

export interface WebhookService {
  sendWebhook(data: WebhookJobData): Promise<JobResult>
}