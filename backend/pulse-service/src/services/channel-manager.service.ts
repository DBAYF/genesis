import Twilio from 'twilio'
import { Telegraf } from 'telegraf'
import nodemailer from 'nodemailer'
import { loadConfig } from '../config/loader'
import { Channel, MessageStatus } from '../types/pulse'

// ============================================================================
// CHANNEL MANAGER SERVICE
// ============================================================================

export class ChannelManager {
  private config = loadConfig()
  private twilio?: Twilio
  private telegramBot?: Telegraf
  private emailTransporter?: nodemailer.Transporter

  constructor() {
    this.initializeChannels()
  }

  private initializeChannels(): void {
    // Initialize Twilio for SMS and WhatsApp
    if (this.config.TWILIO_ACCOUNT_SID && this.config.TWILIO_AUTH_TOKEN) {
      this.twilio = Twilio(this.config.TWILIO_ACCOUNT_SID, this.config.TWILIO_AUTH_TOKEN)
    }

    // Initialize Telegram bot
    if (this.config.TELEGRAM_BOT_TOKEN) {
      this.telegramBot = new Telegraf(this.config.TELEGRAM_BOT_TOKEN)
    }

    // Initialize email transporter
    this.emailTransporter = nodemailer.createTransporter({
      service: 'gmail', // or your email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  }

  // ============================================================================
  // SEND MESSAGE
  // ============================================================================

  async sendMessage(
    channel: Channel,
    to: string,
    content: string,
    options?: any
  ): Promise<string> {
    switch (channel) {
      case Channel.SMS:
        return this.sendSMS(to, content, options)
      case Channel.WHATSAPP:
        return this.sendWhatsApp(to, content, options)
      case Channel.TELEGRAM:
        return this.sendTelegram(to, content, options)
      case Channel.EMAIL:
        return this.sendEmail(to, content, options)
      default:
        throw new Error(`Unsupported channel: ${channel}`)
    }
  }

  private async sendSMS(to: string, content: string, options?: any): Promise<string> {
    if (!this.twilio || !this.config.TWILIO_PHONE_NUMBER) {
      throw new Error('Twilio not configured')
    }

    const message = await this.twilio.messages.create({
      body: content,
      from: this.config.TWILIO_PHONE_NUMBER,
      to: to,
    })

    return message.sid
  }

  private async sendWhatsApp(to: string, content: string, options?: any): Promise<string> {
    if (!this.twilio || !this.config.TWILIO_PHONE_NUMBER) {
      throw new Error('Twilio not configured')
    }

    const message = await this.twilio.messages.create({
      body: content,
      from: `whatsapp:${this.config.TWILIO_PHONE_NUMBER}`,
      to: `whatsapp:${to}`,
    })

    return message.sid
  }

  private async sendTelegram(to: string, content: string, options?: any): Promise<string> {
    if (!this.telegramBot) {
      throw new Error('Telegram bot not configured')
    }

    const result = await this.telegramBot.telegram.sendMessage(to, content)
    return result.message_id.toString()
  }

  private async sendEmail(to: string, content: string, options?: any): Promise<string> {
    if (!this.emailTransporter) {
      throw new Error('Email transporter not configured')
    }

    const mailOptions = {
      from: this.config.FROM_EMAIL,
      to: to,
      subject: options?.subject || 'Message from Genesis Engine',
      text: content,
      html: options?.html || content.replace(/\n/g, '<br>'),
    }

    const result = await this.emailTransporter.sendMail(mailOptions)
    return result.messageId
  }

  // ============================================================================
  // GET MESSAGE STATUS
  // ============================================================================

  async getMessageStatus(channel: Channel, messageId: string): Promise<MessageStatus> {
    switch (channel) {
      case Channel.SMS:
      case Channel.WHATSAPP:
        return this.getTwilioStatus(messageId)
      case Channel.TELEGRAM:
        return MessageStatus.SENT // Telegram doesn't provide detailed status
      case Channel.EMAIL:
        return MessageStatus.SENT // Email status would need additional tracking
      default:
        return MessageStatus.SENT
    }
  }

  private async getTwilioStatus(messageId: string): Promise<MessageStatus> {
    if (!this.twilio) {
      return MessageStatus.SENT
    }

    try {
      const message = await this.twilio.messages(messageId).fetch()

      switch (message.status) {
        case 'sent':
          return MessageStatus.SENT
        case 'delivered':
          return MessageStatus.DELIVERED
        case 'read':
          return MessageStatus.READ
        case 'failed':
          return MessageStatus.FAILED
        default:
          return MessageStatus.SENDING
      }
    } catch (error) {
      return MessageStatus.FAILED
    }
  }

  // ============================================================================
  // WEBHOOK HANDLERS
  // ============================================================================

  async handleTwilioWebhook(body: any): Promise<void> {
    // Process Twilio webhook
    const { From, To, Body, MessageSid, NumMedia } = body

    const channel = From.includes('whatsapp:') ? Channel.WHATSAPP : Channel.SMS
    const from = From.replace('whatsapp:', '')

    // This would return message data to be processed by PulseService
    return {
      channel,
      channelIdentifier: from,
      content: Body,
      messageType: NumMedia > 0 ? 'image' : 'text',
      externalId: MessageSid,
      receivedAt: new Date(),
    }
  }

  async handleTelegramWebhook(update: any): Promise<void> {
    // Process Telegram webhook
    if (update.message) {
      const { chat, text, message_id } = update.message

      return {
        channel: Channel.TELEGRAM,
        channelIdentifier: chat.id.toString(),
        content: text,
        messageType: 'text',
        externalId: message_id.toString(),
        receivedAt: new Date(),
      }
    }
  }

  async handleSendGridWebhook(events: any[]): Promise<void> {
    // Process SendGrid webhook events
    // This would handle email delivery status updates
    for (const event of events) {
      // Update message status based on email events
      console.log('SendGrid event:', event)
    }
  }

  // ============================================================================
  // CHANNEL VALIDATION
  // ============================================================================

  validateChannelIdentifier(channel: Channel, identifier: string): boolean {
    switch (channel) {
      case Channel.SMS:
        // Basic phone number validation
        return /^\+?[1-9]\d{1,14}$/.test(identifier)
      case Channel.WHATSAPP:
        // WhatsApp phone number validation
        return /^\+?[1-9]\d{1,14}$/.test(identifier)
      case Channel.TELEGRAM:
        // Telegram chat ID validation
        return /^\d+$/.test(identifier)
      case Channel.EMAIL:
        // Email validation
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)
      default:
        return false
    }
  }
}