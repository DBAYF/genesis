// Firebase Realtime Database Service for WebSocket-like functionality
import {
  ref,
  onValue,
  onChildAdded,
  onChildChanged,
  onChildRemoved,
  push,
  set,
  update,
  remove,
  serverTimestamp,
  query,
  orderByChild,
  limitToLast
} from 'firebase/database'
import { realtimeDb, REALTIME_PATHS } from '../firebase/firebase-config'

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  content: string
  type: 'text' | 'image' | 'file' | 'system'
  timestamp: number
  edited?: boolean
  editedAt?: number
  reactions?: { [emoji: string]: string[] } // emoji -> userIds
  replyTo?: string // message ID being replied to
}

export interface Conversation {
  id: string
  type: 'direct' | 'group' | 'company'
  name?: string
  description?: string
  avatar?: string
  participants: string[]
  lastMessage?: Message
  lastActivity: number
  createdBy: string
  createdAt: number
  settings: {
    isPrivate: boolean
    allowInvites: boolean
    allowFiles: boolean
  }
}

export interface TypingIndicator {
  userId: string
  userName: string
  conversationId: string
  timestamp: number
}

export interface PresenceData {
  userId: string
  status: 'online' | 'away' | 'offline'
  lastSeen: number
  currentActivity?: string
  deviceInfo?: {
    platform: string
    version: string
  }
}

export interface NotificationData {
  id: string
  userId: string
  type: 'message' | 'mention' | 'invitation' | 'system' | 'task' | 'compliance'
  title: string
  body: string
  data?: any
  read: boolean
  createdAt: number
  expiresAt?: number
}

export class FirebaseRealtimeService {
  private listeners: Map<string, () => void> = new Map()

  // ============================================================================
  // PRESENCE MANAGEMENT
  // ============================================================================

  // Set user presence
  async setPresence(userId: string, presence: Omit<PresenceData, 'userId'>): Promise<void> {
    try {
      const presenceRef = ref(realtimeDb, `${REALTIME_PATHS.PRESENCE}/${userId}`)
      await set(presenceRef, {
        ...presence,
        lastSeen: serverTimestamp()
      })
    } catch (error: any) {
      throw new Error(`Failed to set presence: ${error.message}`)
    }
  }

  // Get user presence
  async getPresence(userId: string): Promise<PresenceData | null> {
    try {
      const presenceRef = ref(realtimeDb, `${REALTIME_PATHS.PRESENCE}/${userId}`)
      return new Promise((resolve) => {
        onValue(presenceRef, (snapshot) => {
          const data = snapshot.val()
          resolve(data ? { ...data, userId } : null)
        }, { onlyOnce: true })
      })
    } catch (error: any) {
      throw new Error(`Failed to get presence: ${error.message}`)
    }
  }

  // Listen to presence changes for multiple users
  onPresenceChange(userIds: string[], callback: (presences: PresenceData[]) => void): () => void {
    const presencePromises = userIds.map(userId => {
      const presenceRef = ref(realtimeDb, `${REALTIME_PATHS.PRESENCE}/${userId}`)
      return new Promise<PresenceData>((resolve) => {
        onValue(presenceRef, (snapshot) => {
          const data = snapshot.val()
          resolve(data ? { ...data, userId } : { userId, status: 'offline' as const, lastSeen: Date.now() })
        })
      })
    })

    const updateCallback = async () => {
      const presences = await Promise.all(presencePromises)
      callback(presences)
    }

    // Initial call
    updateCallback()

    // Set up listeners
    const unsubscribers = userIds.map(userId => {
      const presenceRef = ref(realtimeDb, `${REALTIME_PATHS.PRESENCE}/${userId}`)
      const unsubscribe = onValue(presenceRef, updateCallback)
      return unsubscribe
    })

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe())
    }
  }

  // ============================================================================
  // REAL-TIME MESSAGING
  // ============================================================================

  // Send message
  async sendMessage(message: Omit<Message, 'id' | 'timestamp'>): Promise<string> {
    try {
      const messagesRef = ref(realtimeDb, `${REALTIME_PATHS.MESSAGES}/${message.conversationId}`)
      const newMessageRef = push(messagesRef)

      const messageData: Message = {
        ...message,
        id: newMessageRef.key!,
        timestamp: serverTimestamp() as any
      }

      await set(newMessageRef, messageData)

      // Update conversation last activity
      await this.updateConversationLastActivity(message.conversationId, messageData)

      return newMessageRef.key!
    } catch (error: any) {
      throw new Error(`Failed to send message: ${error.message}`)
    }
  }

  // Listen to messages in a conversation
  onMessages(conversationId: string, callback: (messages: Message[]) => void, limit: number = 50): () => void {
    const messagesRef = ref(realtimeDb, `${REALTIME_PATHS.MESSAGES}/${conversationId}`)
    const messagesQuery = query(messagesRef, orderByChild('timestamp'), limitToLast(limit))

    const unsubscribe = onValue(messagesQuery, (snapshot) => {
      const messages: Message[] = []
      snapshot.forEach((childSnapshot) => {
        const message = childSnapshot.val()
        messages.push({
          ...message,
          id: childSnapshot.key!
        })
      })

      // Sort by timestamp
      messages.sort((a, b) => a.timestamp - b.timestamp)
      callback(messages)
    })

    return unsubscribe
  }

  // Listen to new messages (for notifications)
  onNewMessages(conversationId: string, callback: (message: Message) => void): () => void {
    const messagesRef = ref(realtimeDb, `${REALTIME_PATHS.MESSAGES}/${conversationId}`)

    const unsubscribe = onChildAdded(messagesRef, (snapshot) => {
      const message: Message = {
        ...snapshot.val(),
        id: snapshot.key!
      }
      callback(message)
    })

    return unsubscribe
  }

  // Update message (for editing)
  async updateMessage(conversationId: string, messageId: string, updates: Partial<Message>): Promise<void> {
    try {
      const messageRef = ref(realtimeDb, `${REALTIME_PATHS.MESSAGES}/${conversationId}/${messageId}`)
      await update(messageRef, {
        ...updates,
        edited: true,
        editedAt: serverTimestamp()
      })
    } catch (error: any) {
      throw new Error(`Failed to update message: ${error.message}`)
    }
  }

  // Delete message
  async deleteMessage(conversationId: string, messageId: string): Promise<void> {
    try {
      const messageRef = ref(realtimeDb, `${REALTIME_PATHS.MESSAGES}/${conversationId}/${messageId}`)
      await remove(messageRef)
    } catch (error: any) {
      throw new Error(`Failed to delete message: ${error.message}`)
    }
  }

  // ============================================================================
  // TYPING INDICATORS
  // ============================================================================

  // Set typing indicator
  async setTyping(conversationId: string, userId: string, userName: string): Promise<void> {
    try {
      const typingRef = ref(realtimeDb, `${REALTIME_PATHS.TYPING}/${conversationId}/${userId}`)
      await set(typingRef, {
        userName,
        timestamp: serverTimestamp()
      })

      // Auto-remove typing indicator after 3 seconds
      setTimeout(async () => {
        try {
          await remove(typingRef)
        } catch (error) {
          // Ignore cleanup errors
        }
      }, 3000)
    } catch (error: any) {
      throw new Error(`Failed to set typing indicator: ${error.message}`)
    }
  }

  // Listen to typing indicators
  onTypingIndicators(conversationId: string, callback: (indicators: TypingIndicator[]) => void): () => void {
    const typingRef = ref(realtimeDb, `${REALTIME_PATHS.TYPING}/${conversationId}`)

    const unsubscribe = onValue(typingRef, (snapshot) => {
      const indicators: TypingIndicator[] = []
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val()
        indicators.push({
          userId: childSnapshot.key!,
          conversationId,
          ...data
        })
      })
      callback(indicators)
    })

    return unsubscribe
  }

  // ============================================================================
  // NOTIFICATIONS
  // ============================================================================

  // Send notification
  async sendNotification(notification: Omit<NotificationData, 'id' | 'createdAt'>): Promise<string> {
    try {
      const notificationsRef = ref(realtimeDb, `${REALTIME_PATHS.NOTIFICATIONS}/${notification.userId}`)
      const newNotificationRef = push(notificationsRef)

      const notificationData: NotificationData = {
        ...notification,
        id: newNotificationRef.key!,
        createdAt: serverTimestamp() as any,
        read: false
      }

      await set(newNotificationRef, notificationData)
      return newNotificationRef.key!
    } catch (error: any) {
      throw new Error(`Failed to send notification: ${error.message}`)
    }
  }

  // Listen to notifications
  onNotifications(userId: string, callback: (notifications: NotificationData[]) => void): () => void {
    const notificationsRef = ref(realtimeDb, `${REALTIME_PATHS.NOTIFICATIONS}/${userId}`)

    const unsubscribe = onValue(notificationsRef, (snapshot) => {
      const notifications: NotificationData[] = []
      snapshot.forEach((childSnapshot) => {
        const notification = childSnapshot.val()
        notifications.push({
          ...notification,
          id: childSnapshot.key!
        })
      })

      // Sort by creation time (newest first)
      notifications.sort((a, b) => b.createdAt - a.createdAt)
      callback(notifications)
    })

    return unsubscribe
  }

  // Mark notification as read
  async markNotificationRead(userId: string, notificationId: string): Promise<void> {
    try {
      const notificationRef = ref(realtimeDb, `${REALTIME_PATHS.NOTIFICATIONS}/${userId}/${notificationId}`)
      await update(notificationRef, { read: true })
    } catch (error: any) {
      throw new Error(`Failed to mark notification as read: ${error.message}`)
    }
  }

  // Delete notification
  async deleteNotification(userId: string, notificationId: string): Promise<void> {
    try {
      const notificationRef = ref(realtimeDb, `${REALTIME_PATHS.NOTIFICATIONS}/${userId}/${notificationId}`)
      await remove(notificationRef)
    } catch (error: any) {
      throw new Error(`Failed to delete notification: ${error.message}`)
    }
  }

  // ============================================================================
  // CONVERSATION MANAGEMENT
  // ============================================================================

  private async updateConversationLastActivity(conversationId: string, lastMessage: Message): Promise<void> {
    try {
      // This would typically be handled by a Cloud Function
      // For now, we'll update a conversations reference in Firestore
      // The actual implementation would depend on your data structure
      console.log(`Updating conversation ${conversationId} last activity`)
    } catch (error) {
      console.warn('Failed to update conversation last activity:', error)
    }
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  // Remove all listeners
  cleanup(): void {
    this.listeners.forEach(unsubscribe => unsubscribe())
    this.listeners.clear()
  }

  // Add listener for cleanup tracking
  private trackListener(key: string, unsubscribe: () => void): void {
    this.listeners.set(key, unsubscribe)
  }

  // Remove specific listener
  removeListener(key: string): void {
    const unsubscribe = this.listeners.get(key)
    if (unsubscribe) {
      unsubscribe()
      this.listeners.delete(key)
    }
  }
}

// Export singleton instance
export const firebaseRealtimeService = new FirebaseRealtimeService()