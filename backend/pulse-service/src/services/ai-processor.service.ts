import axios from 'axios'
import { loadConfig } from '../config/loader'
import { AIResponse } from '../types/pulse'

// ============================================================================
// AI PROCESSOR SERVICE
// ============================================================================

export class AIProcessor {
  private config = loadConfig()
  private aiServiceUrl = this.config.AI_SERVICE_URL

  // ============================================================================
  // RESPONSE GENERATION
  // ============================================================================

  async generateResponse(
    userMessage: string,
    conversationContext: string,
    personality?: string
  ): Promise<AIResponse> {
    try {
      const systemPrompt = this.buildSystemPrompt(personality)

      const response = await axios.post(`${this.aiServiceUrl}/api/ai/generate`, {
        prompt: userMessage,
        systemPrompt,
        context: conversationContext,
        maxTokens: this.config.AI_RESPONSE_MAX_TOKENS,
        temperature: 0.7,
      })

      return {
        content: response.data.content,
        confidence: response.data.confidence || 0.8,
        suggestedActions: response.data.suggestedActions,
        contextUsed: response.data.contextUsed,
      }
    } catch (error) {
      // Fallback response if AI service is unavailable
      return {
        content: this.getFallbackResponse(userMessage),
        confidence: 0.5,
      }
    }
  }

  // ============================================================================
  // SYSTEM PROMPTS
  // ============================================================================

  private buildSystemPrompt(personality?: string): string {
    const basePrompt = `You are an AI assistant for Genesis Engine, a comprehensive platform for startup founders.

Your role is to help users with their startup journey by providing:
- Answers to questions about their business
- Guidance on next steps
- Information about available features
- Proactive suggestions based on their progress
- Help with scheduling and organization

Always be helpful, professional, and concise. If you don't know something specific about their business, ask for clarification rather than making assumptions.

Available features you can help with:
- Financial planning and projections
- Document generation (pitch decks, business plans, etc.)
- Compliance tracking and filings
- Investor networking and introductions
- Task and deadline management
- Knowledge graph queries
- Meeting scheduling

If the user asks about something you can't help with directly, guide them to the appropriate feature or suggest next steps.`

    const personalityPrompts: Record<string, string> = {
      professional: 'Maintain a professional, business-like tone. Be thorough and detail-oriented.',
      casual: 'Be friendly and conversational, like chatting with a colleague. Use contractions and a relaxed tone.',
      expert: 'Provide expert-level insights and recommendations. Use industry terminology appropriately.',
    }

    const personalityPrompt = personality ? personalityPrompts[personality] || '' : ''

    return `${basePrompt}\n\n${personalityPrompt}`
  }

  // ============================================================================
  // CONTEXT ENHANCEMENT
  // ============================================================================

  async enhanceContext(userId: string, companyId?: string): Promise<string> {
    try {
      // Get user context from User service
      const userContext = await this.getUserContext(userId)

      // Get company context if available
      const companyContext = companyId ? await this.getCompanyContext(companyId) : ''

      // Get knowledge graph context
      const kgContext = await this.getKnowledgeGraphContext(userId, companyId)

      return `${userContext}\n${companyContext}\n${kgContext}`.trim()
    } catch (error) {
      return 'Context unavailable'
    }
  }

  private async getUserContext(userId: string): Promise<string> {
    try {
      const response = await axios.get(`${this.config.AI_SERVICE_URL}/api/users/${userId}/context`)
      return `User Context: ${response.data.context || 'No specific context available'}`
    } catch {
      return 'User Context: General startup founder'
    }
  }

  private async getCompanyContext(companyId: string): Promise<string> {
    try {
      const response = await axios.get(`${this.config.KNOWLEDGE_GRAPH_URL}/api/companies/${companyId}/context`)
      return `Company Context: ${response.data.context || 'No company context available'}`
    } catch {
      return 'Company Context: Early-stage startup'
    }
  }

  private async getKnowledgeGraphContext(userId: string, companyId?: string): Promise<string> {
    try {
      const query = companyId ? `company:${companyId}` : `user:${userId}`
      const response = await axios.get(`${this.config.KNOWLEDGE_GRAPH_URL}/api/search`, {
        params: { q: query, limit: 3 }
      })

      const results = response.data.results || []
      const context = results.map((r: any) => r.content).join('; ')

      return `Knowledge Graph: ${context || 'No relevant knowledge available'}`
    } catch {
      return 'Knowledge Graph: No additional context available'
    }
  }

  // ============================================================================
  // ACTION SUGGESTIONS
  // ============================================================================

  async suggestActions(userMessage: string, userContext: string): Promise<string[]> {
    try {
      const response = await axios.post(`${this.aiServiceUrl}/api/ai/suggest-actions`, {
        message: userMessage,
        context: userContext,
      })

      return response.data.suggestions || []
    } catch {
      return this.getDefaultSuggestions(userMessage)
    }
  }

  private getDefaultSuggestions(message: string): string[] {
    const suggestions: string[] = []

    // Simple keyword-based suggestions
    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes('meeting') || lowerMessage.includes('call')) {
      suggestions.push('Schedule a meeting', 'Check calendar availability')
    }

    if (lowerMessage.includes('document') || lowerMessage.includes('pitch')) {
      suggestions.push('Generate pitch deck', 'Create business plan')
    }

    if (lowerMessage.includes('financial') || lowerMessage.includes('money')) {
      suggestions.push('View financial projections', 'Update burn rate')
    }

    if (lowerMessage.includes('investor') || lowerMessage.includes('funding')) {
      suggestions.push('Find investors', 'Update funding application')
    }

    if (lowerMessage.includes('task') || lowerMessage.includes('todo')) {
      suggestions.push('Add new task', 'View pending tasks')
    }

    if (lowerMessage.includes('compliance') || lowerMessage.includes('filing')) {
      suggestions.push('Check compliance deadlines', 'File documents')
    }

    return suggestions.slice(0, 3) // Limit to 3 suggestions
  }

  // ============================================================================
  // FALLBACK RESPONSES
  // ============================================================================

  private getFallbackResponse(userMessage: string): string {
    const lowerMessage = userMessage.toLowerCase()

    // Simple pattern matching for fallback responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return "Hello! I'm here to help you with your startup journey. How can I assist you today?"
    }

    if (lowerMessage.includes('help')) {
      return "I can help you with various aspects of your startup. You can ask me about scheduling meetings, updating your profile, financial information, document generation, compliance tracking, or finding investors. What would you like to know?"
    }

    if (lowerMessage.includes('thank')) {
      return "You're welcome! If you need anything else, just let me know."
    }

    // Generic fallback
    return "I'm here to help with your startup needs. Could you please provide more details about what you're looking for?"
  }

  // ============================================================================
  // LEARNING & IMPROVEMENT
  // ============================================================================

  async learnFromInteraction(
    userMessage: string,
    aiResponse: string,
    userFeedback?: 'positive' | 'negative' | 'neutral'
  ): Promise<void> {
    try {
      await axios.post(`${this.aiServiceUrl}/api/ai/learn`, {
        userMessage,
        aiResponse,
        feedback: userFeedback,
      })
    } catch (error) {
      // Learning failed, but don't throw error
      console.warn('Failed to send learning data to AI service:', error)
    }
  }
}