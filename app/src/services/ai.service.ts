// ============================================================================
// GENESIS ENGINE - AI SERVICE
// ============================================================================

import { config } from '@/config'

export interface GenerateParams {
  prompt: string
  systemPrompt?: string
  model?: string
  maxTokens?: number
  temperature?: number
  companyId?: string
}

export interface GenerateResult {
  content: string
  model: string
  tokensUsed: number
  duration: number
  cost?: number
}

export interface ResearchParams {
  prompt: string
  sources?: string[]
  model?: string
  maxTokens?: number
  companyId?: string
}

export interface ResearchResult {
  content: string
  sources: ResearchSource[]
  model: string
  tokensUsed: number
  duration: number
}

export interface ResearchSource {
  type: 'knowledge_graph' | 'web' | 'database'
  id?: string
  url?: string
  title?: string
  content: string
  score?: number
}

export interface ResolvedModel {
  provider: 'openai' | 'anthropic' | 'google'
  model: string
  maxTokens: number
  costPerToken: number
}

export class AIService {
  private openaiApiKey?: string
  private anthropicApiKey?: string
  private googleApiKey?: string

  constructor() {
    this.openaiApiKey = config.NEXT_PUBLIC_AI_OPENAI_ENABLED ? config.NEXT_PUBLIC_OPENAI_API_KEY : undefined
    this.anthropicApiKey = config.NEXT_PUBLIC_AI_ANTHROPIC_ENABLED ? config.NEXT_PUBLIC_ANTHROPIC_API_KEY : undefined
    this.googleApiKey = config.NEXT_PUBLIC_AI_GOOGLE_ENABLED ? config.NEXT_PUBLIC_GOOGLE_AI_API_KEY : undefined
  }

  async generate(params: GenerateParams): Promise<GenerateResult> {
    const model = this.resolveModel(params.model || 'default')
    const startTime = Date.now()

    try {
      if (model.provider === 'openai' && this.openaiApiKey) {
        return await this.generateOpenAI(params, model, startTime)
      } else if (model.provider === 'anthropic' && this.anthropicApiKey) {
        return await this.generateAnthropic(params, model, startTime)
      } else if (model.provider === 'google' && this.googleApiKey) {
        return await this.generateGoogle(params, model, startTime)
      }
      throw new Error(`No API key configured for provider: ${model.provider}`)
    } catch (error) {
      console.error('AI generation failed:', error)
      throw new Error(`AI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async research(params: ResearchParams): Promise<ResearchResult> {
    const startTime = Date.now()
    const sources: ResearchSource[] = []

    // Search knowledge graph first
    if (params.sources?.includes('knowledge_graph') && params.companyId) {
      try {
        const kgResults = await this.searchKnowledgeGraph(params.prompt, params.companyId)
        sources.push(...kgResults)
      } catch (error) {
        console.warn('Knowledge graph search failed:', error)
      }
    }

    // Search web if requested
    if (params.sources?.includes('web')) {
      try {
        const webResults = await this.searchWeb(params.prompt)
        sources.push(...webResults)
      } catch (error) {
        console.warn('Web search failed:', error)
      }
    }

    // Generate response with context
    const contextPrompt = this.buildContextPrompt(params.prompt, sources)
    const generateResult = await this.generate({
      prompt: contextPrompt,
      model: params.model,
      maxTokens: params.maxTokens,
      companyId: params.companyId,
    })

    return {
      content: generateResult.content,
      sources,
      model: generateResult.model,
      tokensUsed: generateResult.tokensUsed,
      duration: Date.now() - startTime,
    }
  }

  private resolveModel(modelName: string): ResolvedModel {
    switch (modelName) {
      case 'gpt-4':
        return {
          provider: 'openai',
          model: 'gpt-4',
          maxTokens: 8192,
          costPerToken: 0.03,
        }
      case 'gpt-3.5-turbo':
        return {
          provider: 'openai',
          model: 'gpt-3.5-turbo',
          maxTokens: 4096,
          costPerToken: 0.002,
        }
      case 'claude-3-opus':
        return {
          provider: 'anthropic',
          model: 'claude-3-opus-20240229',
          maxTokens: 4096,
          costPerToken: 0.015,
        }
      case 'claude-3-sonnet':
        return {
          provider: 'anthropic',
          model: 'claude-3-sonnet-20240229',
          maxTokens: 4096,
          costPerToken: 0.008,
        }
      case 'gemini-pro':
        return {
          provider: 'google',
          model: 'gemini-pro',
          maxTokens: 4096,
          costPerToken: 0.001,
        }
      default:
        // Fallback to cheapest available model
        if (this.openaiApiKey) {
          return {
            provider: 'openai',
            model: 'gpt-3.5-turbo',
            maxTokens: 4096,
            costPerToken: 0.002,
          }
        } else if (this.anthropicApiKey) {
          return {
            provider: 'anthropic',
            model: 'claude-3-sonnet-20240229',
            maxTokens: 4096,
            costPerToken: 0.008,
          }
        } else {
          throw new Error('No AI providers configured')
        }
    }
  }

  private async generateOpenAI(
    params: GenerateParams,
    model: ResolvedModel,
    startTime: number
  ): Promise<GenerateResult> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: model.model,
        messages: [
          ...(params.systemPrompt ? [{ role: 'system', content: params.systemPrompt }] : []),
          { role: 'user', content: params.prompt },
        ],
        max_tokens: params.maxTokens || model.maxTokens,
        temperature: params.temperature || 0.7,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`OpenAI API error: ${error.error?.message || response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content || ''
    const tokensUsed = data.usage?.total_tokens || 0

    return {
      content,
      model: model.model,
      tokensUsed,
      duration: Date.now() - startTime,
      cost: tokensUsed * model.costPerToken,
    }
  }

  private async generateAnthropic(
    params: GenerateParams,
    model: ResolvedModel,
    startTime: number
  ): Promise<GenerateResult> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.anthropicApiKey!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: model.model,
        max_tokens: params.maxTokens || model.maxTokens,
        temperature: params.temperature || 0.7,
        system: params.systemPrompt,
        messages: [{ role: 'user', content: params.prompt }],
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`Anthropic API error: ${error.error?.message || response.statusText}`)
    }

    const data = await response.json()
    const content = data.content[0]?.text || ''
    const tokensUsed = data.usage?.input_tokens + data.usage?.output_tokens || 0

    return {
      content,
      model: model.model,
      tokensUsed,
      duration: Date.now() - startTime,
      cost: tokensUsed * model.costPerToken,
    }
  }

  private async generateGoogle(
    params: GenerateParams,
    model: ResolvedModel,
    startTime: number
  ): Promise<GenerateResult> {
    // Google AI implementation would go here
    // For now, throw not implemented
    throw new Error('Google AI not yet implemented')
  }

  private async searchKnowledgeGraph(query: string, companyId: string): Promise<ResearchSource[]> {
    // This would integrate with the Knowledge Graph service
    // For now, return mock results
    return [
      {
        type: 'knowledge_graph',
        id: 'kg-1',
        content: `Knowledge graph result for: ${query}`,
        score: 0.95,
      },
    ]
  }

  private async searchWeb(query: string): Promise<ResearchSource[]> {
    // This would integrate with web search APIs
    // For now, return mock results
    return [
      {
        type: 'web',
        url: `https://example.com/search?q=${encodeURIComponent(query)}`,
        title: `Web results for: ${query}`,
        content: `Web search result summary for: ${query}`,
      },
    ]
  }

  private buildContextPrompt(prompt: string, sources: ResearchSource[]): string {
    if (sources.length === 0) {
      return prompt
    }

    const context = sources
      .map((source, i) => {
        const prefix = source.type === 'knowledge_graph' ? 'Internal Knowledge:' :
                      source.type === 'web' ? 'Web Source:' : 'Database:'
        return `${prefix} ${source.title || `Source ${i + 1}`}
${source.content}`
      })
      .join('\n\n')

    return `${prompt}

Use the following sources to inform your response:

${context}

Cite sources where relevant and provide evidence-based reasoning.`
  }

  async trackUsage(params: GenerateParams, model: ResolvedModel, duration: number): Promise<void> {
    // Track usage for billing/analytics
    // This would integrate with monitoring service
    console.log(`AI Usage: ${model.provider}/${model.model}, tokens: ${params.maxTokens}, duration: ${duration}ms`)
  }
}

// Export singleton instance
export const aiService = new AIService()