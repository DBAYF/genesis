// ============================================================================
// PULSE MESSAGING TYPES
// ============================================================================

export interface Conversation {
  id: string
  userId: string
  title?: string
  channel: Channel
  channelIdentifier: string
  status: ConversationStatus
  participants: string[] // For group conversations
  lastMessageAt?: Date
  lastMessagePreview?: string
  isMuted: boolean
  isPinned: boolean
  aiEnabled: boolean
  aiPersonality?: string
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id: string
  conversationId: string
  userId?: string
  content: string
  messageType: MessageType
  direction: MessageDirection
  attachments: Attachment[]
  status: MessageStatus
  sentAt: Date
  deliveredAt?: Date
  readAt?: Date
  aiProcessed: boolean
  aiIntent?: string
  aiConfidence?: number
  aiResponse?: string
  externalId?: string
  externalMetadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface Attachment {
  type: 'image' | 'document' | 'audio' | 'video'
  url: string
  filename?: string
  size?: number
  mimeType?: string
}

export enum Channel {
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  TELEGRAM = 'telegram',
  EMAIL = 'email',
}

export enum ConversationStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  CLOSED = 'closed',
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system',
}

export enum MessageDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound',
}

export enum MessageStatus {
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

// ============================================================================
// WEBHOOK TYPES
// ============================================================================

export interface IncomingMessage {
  channel: Channel
  channelIdentifier: string
  content: string
  messageType: MessageType
  attachments?: Attachment[]
  externalId?: string
  metadata?: Record<string, any>
  receivedAt: Date
}

export interface OutgoingMessage {
  conversationId: string
  content: string
  messageType?: MessageType
  attachments?: Attachment[]
  metadata?: Record<string, any>
}

// ============================================================================
// AI PROCESSING TYPES
// ============================================================================

export interface IntentAnalysis {
  intent: string
  confidence: number
  entities: Record<string, any>
  sentiment?: 'positive' | 'negative' | 'neutral'
}

export interface AIResponse {
  content: string
  confidence: number
  suggestedActions?: string[]
  contextUsed?: string[]
}

// ============================================================================
// CHANNEL PROVIDER TYPES
// ============================================================================

export interface ChannelProvider {
  sendMessage(to: string, content: string, options?: any): Promise<string>
  getStatus(messageId: string): Promise<MessageStatus>
}

// ============================================================================
// SCHEDULED MESSAGES
// ============================================================================

export interface ScheduledMessage {
  id: string
  conversationId: string
  userId: string
  scheduledFor: Date
  timezone: string
  content: string
  template?: string
  templateParams?: Record<string, any>
  isRecurring: boolean
  recurrenceRule?: string
  status: 'scheduled' | 'sent' | 'failed' | 'cancelled'
  sentAt?: Date
  messageId?: string
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// USER PREFERENCES
// ============================================================================

export interface UserPreferences {
  id: string
  userId: string
  preferredResponseLength: 'brief' | 'medium' | 'detailed'
  preferredFormat: 'prose' | 'bullets' | 'structured'
  useEmojis: boolean
  formalityLevel: 'casual' | 'professional' | 'formal'
  terminologyMap: Record<string, string>
  activityPatterns: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

export interface MessageAnalytics {
  conversationId: string
  period: 'day' | 'week' | 'month'
  messageCount: number
  averageResponseTime: number
  userSatisfaction: number
  aiUsageRate: number
  topIntents: Array<{ intent: string; count: number }>
}