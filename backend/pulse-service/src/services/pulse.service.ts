import axios from 'axios'
import natural from 'natural'
import compromise from 'compromise'
import { v4 as uuidv4 } from 'uuid'
import { loadConfig } from '../config/loader'
import { prisma } from '../utils/prisma'
import {
  Conversation,
  Message,
  IncomingMessage,
  OutgoingMessage,
  Channel,
  MessageStatus,
  MessageDirection,
  MessageType,
  IntentAnalysis,
  AIResponse,
  ScheduledMessage,
} from '../types/pulse'
import { ChannelManager } from './channel-manager.service'
import { IntentAnalyzer } from './intent-analyzer.service'
import { AIProcessor } from './ai-processor.service'
import { QueueService } from './queue.service'

// ============================================================================
// PULSE SERVICE
// ============================================================================

export class PulseService {
  private config = loadConfig()
  private channelManager = new ChannelManager()
  private intentAnalyzer = new IntentAnalyzer()
  private aiProcessor = new AIProcessor()
  private queueService = new QueueService()

  // ============================================================================
  // CONVERSATION MANAGEMENT
  // ============================================================================

  async findOrCreateConversation(
    channel: Channel,
    channelIdentifier: string,
    userId?: string
  ): Promise<Conversation> {
    // Try to find existing conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        channel,
        channelIdentifier,
        status: 'active',
      },
    })

    if (conversation) {
      return conversation as Conversation
    }

    // Find user by channel identifier if not provided
    if (!userId) {
      // This would need to be implemented based on how users are linked to channels
      // For now, we'll create conversations without user association
    }

    // Create new conversation
    conversation = await prisma.conversation.create({
      data: {
        userId,
        channel,
        channelIdentifier,
        status: 'active',
        isMuted: false,
        isPinned: false,
        aiEnabled: true,
      },
    })

    return conversation as Conversation
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    const conversations = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { lastMessageAt: 'desc' },
    })

    return conversations as Conversation[]
  }

  async getConversation(conversationId: string): Promise<Conversation | null> {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    })

    return conversation as Conversation | null
  }

  // ============================================================================
  // MESSAGE HANDLING
  // ============================================================================

  async handleIncomingMessage(message: IncomingMessage): Promise<void> {
    // Find or create conversation
    const conversation = await this.findOrCreateConversation(
      message.channel,
      message.channelIdentifier
    )

    // Store incoming message
    const storedMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        userId: conversation.userId,
        content: message.content,
        messageType: message.messageType,
        direction: MessageDirection.INBOUND,
        attachments: message.attachments || [],
        status: MessageStatus.DELIVERED,
        sentAt: message.receivedAt,
        deliveredAt: new Date(),
        externalId: message.externalId,
        externalMetadata: message.metadata || {},
      },
    })

    // Update conversation
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(),
        lastMessagePreview: message.content.substring(0, 100),
      },
    })

    // Process message asynchronously
    await this.queueService.addJob('process-message', {
      messageId: storedMessage.id,
      conversationId: conversation.id,
    })

    // Send auto-response if AI is enabled
    if (conversation.aiEnabled) {
      await this.generateAIResponse(conversation.id, storedMessage)
    }
  }

  async sendMessage(outgoing: OutgoingMessage): Promise<string> {
    const conversation = await prisma.conversation.findUnique({
      where: { id: outgoing.conversationId },
    })

    if (!conversation) {
      throw new Error('Conversation not found')
    }

    // Store outgoing message
    const message = await prisma.message.create({
      data: {
        conversationId: outgoing.conversationId,
        userId: conversation.userId,
        content: outgoing.content,
        messageType: outgoing.messageType || MessageType.TEXT,
        direction: MessageDirection.OUTBOUND,
        attachments: outgoing.attachments || [],
        status: MessageStatus.SENDING,
        sentAt: new Date(),
      },
    })

    // Send via channel provider
    try {
      const externalId = await this.channelManager.sendMessage(
        conversation.channel,
        conversation.channelIdentifier,
        outgoing.content,
        outgoing.metadata
      )

      // Update message status
      await prisma.message.update({
        where: { id: message.id },
        data: {
          status: MessageStatus.SENT,
          externalId,
        },
      })

      // Update conversation
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageAt: new Date(),
          lastMessagePreview: outgoing.content.substring(0, 100),
        },
      })

      return message.id
    } catch (error) {
      await prisma.message.update({
        where: { id: message.id },
        data: {
          status: MessageStatus.FAILED,
        },
      })
      throw error
    }
  }

  // ============================================================================
  // AI PROCESSING
  // ============================================================================

  async processMessage(messageId: string): Promise<void> {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: { conversation: true },
    })

    if (!message || message.direction !== MessageDirection.INBOUND) {
      return
    }

    // Analyze intent
    const intentAnalysis = await this.intentAnalyzer.analyze(message.content)

    // Update message with AI analysis
    await prisma.message.update({
      where: { id: messageId },
      data: {
        aiProcessed: true,
        aiIntent: intentAnalysis.intent,
        aiConfidence: intentAnalysis.confidence,
      },
    })

    // Store intent analysis for learning
    await this.storeIntentAnalysis(messageId, intentAnalysis)

    // Trigger automated actions based on intent
    await this.triggerAutomatedActions(message, intentAnalysis)
  }

  async generateAIResponse(conversationId: string, triggerMessage: Message): Promise<void> {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!conversation) return

    // Get conversation context
    const context = conversation.messages
      .reverse()
      .map(msg => `${msg.direction === MessageDirection.INBOUND ? 'User' : 'AI'}: ${msg.content}`)
      .join('\n')

    // Generate AI response
    const aiResponse = await this.aiProcessor.generateResponse(
      triggerMessage.content,
      context,
      conversation.aiPersonality
    )

    // Send AI response
    await this.sendMessage({
      conversationId,
      content: aiResponse.content,
      metadata: {
        aiGenerated: true,
        confidence: aiResponse.confidence,
      },
    })

    // Store AI response in message
    await prisma.message.update({
      where: { id: triggerMessage.id },
      data: {
        aiResponse: aiResponse.content,
      },
    })
  }

  // ============================================================================
  // SCHEDULED MESSAGES
  // ============================================================================

  async scheduleMessage(scheduledMessage: Omit<ScheduledMessage, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const message = await prisma.scheduledMessage.create({
      data: {
        id: uuidv4(),
        conversationId: scheduledMessage.conversationId,
        userId: scheduledMessage.userId,
        scheduledFor: scheduledMessage.scheduledFor,
        timezone: scheduledMessage.timezone,
        content: scheduledMessage.content,
        template: scheduledMessage.template,
        templateParams: scheduledMessage.templateParams || {},
        isRecurring: scheduledMessage.isRecurring,
        recurrenceRule: scheduledMessage.recurrenceRule,
        status: 'scheduled',
      },
    })

    // Add to queue
    await this.queueService.addJob('send-scheduled-message', {
      scheduledMessageId: message.id,
    }, {
      delay: scheduledMessage.scheduledFor.getTime() - Date.now(),
    })

    return message.id
  }

  async processScheduledMessages(): Promise<void> {
    const now = new Date()

    const scheduledMessages = await prisma.scheduledMessage.findMany({
      where: {
        status: 'scheduled',
        scheduledFor: {
          lte: now,
        },
      },
    })

    for (const scheduled of scheduledMessages) {
      try {
        // Send the message
        await this.sendMessage({
          conversationId: scheduled.conversationId,
          content: scheduled.content,
        })

        // Update status
        await prisma.scheduledMessage.update({
          where: { id: scheduled.id },
          data: {
            status: 'sent',
            sentAt: new Date(),
          },
        })

        // Handle recurring messages
        if (scheduled.isRecurring && scheduled.recurrenceRule) {
          // Calculate next occurrence (simplified - would need proper RRULE parsing)
          const nextOccurrence = new Date(scheduled.scheduledFor)
          nextOccurrence.setDate(nextOccurrence.getDate() + 7) // Weekly default

          await this.scheduleMessage({
            ...scheduled,
            scheduledFor: nextOccurrence,
          })
        }
      } catch (error) {
        await prisma.scheduledMessage.update({
          where: { id: scheduled.id },
          data: {
            status: 'failed',
          },
        })
      }
    }
  }

  // ============================================================================
  // ANALYTICS & INSIGHTS
  // ============================================================================

  async getConversationAnalytics(conversationId: string, period: 'day' | 'week' | 'month' = 'week'): Promise<any> {
    const now = new Date()
    const periodStart = new Date()

    switch (period) {
      case 'day':
        periodStart.setDate(now.getDate() - 1)
        break
      case 'week':
        periodStart.setDate(now.getDate() - 7)
        break
      case 'month':
        periodStart.setMonth(now.getMonth() - 1)
        break
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        createdAt: {
          gte: periodStart,
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Calculate analytics
    const messageCount = messages.length
    const inboundCount = messages.filter(m => m.direction === MessageDirection.INBOUND).length
    const outboundCount = messages.filter(m => m.direction === MessageDirection.OUTBOUND).length

    // Calculate average response time
    let totalResponseTime = 0
    let responseCount = 0

    for (let i = 0; i < messages.length - 1; i++) {
      const current = messages[i]
      const next = messages[i + 1]

      if (current.direction === MessageDirection.INBOUND && next.direction === MessageDirection.OUTBOUND) {
        totalResponseTime += next.sentAt.getTime() - current.sentAt.getTime()
        responseCount++
      }
    }

    const averageResponseTime = responseCount > 0 ? totalResponseTime / responseCount : 0

    // Analyze intents
    const intentCounts: Record<string, number> = {}
    messages.forEach(msg => {
      if (msg.aiIntent) {
        intentCounts[msg.aiIntent] = (intentCounts[msg.aiIntent] || 0) + 1
      }
    })

    const topIntents = Object.entries(intentCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([intent, count]) => ({ intent, count }))

    return {
      period,
      messageCount,
      inboundCount,
      outboundCount,
      averageResponseTime,
      aiUsageRate: messages.filter(m => m.aiProcessed).length / messageCount,
      topIntents,
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private async storeIntentAnalysis(messageId: string, analysis: IntentAnalysis): Promise<void> {
    // Store for learning and analytics
    // This could be enhanced with machine learning model training
    await prisma.message.update({
      where: { id: messageId },
      data: {
        aiIntent: analysis.intent,
        aiConfidence: analysis.confidence,
      },
    })
  }

  private async triggerAutomatedActions(message: Message, intent: IntentAnalysis): Promise<void> {
    // Implement automated actions based on intent
    switch (intent.intent) {
      case 'schedule_meeting':
        await this.handleMeetingRequest(message)
        break
      case 'update_profile':
        await this.handleProfileUpdate(message)
        break
      case 'get_help':
        await this.handleHelpRequest(message)
        break
      // Add more automated actions
    }
  }

  private async handleMeetingRequest(message: Message): Promise<void> {
    // Extract meeting details from message and create calendar event
    // This would integrate with the Calendar service
    const meetingDetails = this.extractMeetingDetails(message.content)

    if (meetingDetails) {
      // Send confirmation and create event
      await this.sendMessage({
        conversationId: message.conversationId,
        content: `I've scheduled a meeting for ${meetingDetails.date} at ${meetingDetails.time}. Would you like me to send calendar invites?`,
      })
    }
  }

  private async handleProfileUpdate(message: Message): Promise<void> {
    // Extract profile information and update user profile
    // This would integrate with the User service
    await this.sendMessage({
      conversationId: message.conversationId,
      content: 'I can help you update your profile. What information would you like to change?',
    })
  }

  private async handleHelpRequest(message: Message): Promise<void> {
    // Provide help and context-aware suggestions
    await this.sendMessage({
      conversationId: message.conversationId,
      content: 'I\'m here to help! You can ask me about your startup progress, schedule meetings, update information, or get insights. What can I help you with?',
    })
  }

  private extractMeetingDetails(content: string): any {
    // Simple NLP to extract meeting details
    // This could be enhanced with more sophisticated NLP
    const doc = compromise(content)

    const dates = doc.dates().out('array')
    const times = doc.times().out('array')

    if (dates.length > 0 && times.length > 0) {
      return {
        date: dates[0],
        time: times[0],
      }
    }

    return null
  }
}