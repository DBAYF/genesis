// Lovable API Integration Service
// This service integrates with Lovable API platform for external API management

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

export interface LovableConfig {
  baseURL: string
  apiKey: string
  projectId?: string
  environment: 'development' | 'staging' | 'production'
  timeout: number
  retries: number
}

export interface APIEndpoint {
  id: string
  name: string
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  description?: string
  parameters?: APIParameter[]
  responses?: APIResponse[]
  authentication?: boolean
  rateLimit?: {
    requests: number
    period: number // in seconds
  }
}

export interface APIParameter {
  name: string
  type: string
  required: boolean
  description?: string
  defaultValue?: any
}

export interface APIResponse {
  statusCode: number
  description?: string
  schema?: any
}

export interface APIRequest {
  endpointId: string
  method: string
  path: string
  headers?: Record<string, string>
  query?: Record<string, any>
  body?: any
  userId?: string
  apiKey?: string
}

export interface APIResponseData {
  requestId: string
  statusCode: number
  headers: Record<string, string>
  body: any
  duration: number
  timestamp: Date
  cached?: boolean
}

export class LovableAPIService {
  private client: AxiosInstance
  private config: LovableConfig

  constructor(config: LovableConfig) {
    this.config = config

    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
        'X-Project-ID': config.projectId || '',
        'X-Environment': config.environment
      }
    })

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`Lovable API Request: ${config.method?.toUpperCase()} ${config.url}`)
        return config
      },
      (error) => {
        console.error('Lovable API Request Error:', error)
        return Promise.reject(error)
      }
    )

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        console.log(`Lovable API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`)
        return response
      },
      (error) => {
        console.error('Lovable API Response Error:', error.response?.status, error.response?.data || error.message)
        return Promise.reject(error)
      }
    )
  }

  // ============================================================================
  // API MANAGEMENT
  // ============================================================================

  // Register an API endpoint
  async registerEndpoint(endpoint: Omit<APIEndpoint, 'id'>): Promise<APIEndpoint> {
    try {
      const response: AxiosResponse = await this.client.post('/endpoints', endpoint)

      return {
        ...endpoint,
        id: response.data.id
      }
    } catch (error: any) {
      throw new Error(`Failed to register endpoint: ${error.message}`)
    }
  }

  // Update an API endpoint
  async updateEndpoint(endpointId: string, updates: Partial<APIEndpoint>): Promise<void> {
    try {
      await this.client.put(`/endpoints/${endpointId}`, updates)
    } catch (error: any) {
      throw new Error(`Failed to update endpoint: ${error.message}`)
    }
  }

  // Delete an API endpoint
  async deleteEndpoint(endpointId: string): Promise<void> {
    try {
      await this.client.delete(`/endpoints/${endpointId}`)
    } catch (error: any) {
      throw new Error(`Failed to delete endpoint: ${error.message}`)
    }
  }

  // Get all endpoints
  async getEndpoints(): Promise<APIEndpoint[]> {
    try {
      const response: AxiosResponse = await this.client.get('/endpoints')
      return response.data.endpoints || []
    } catch (error: any) {
      throw new Error(`Failed to get endpoints: ${error.message}`)
    }
  }

  // Get endpoint by ID
  async getEndpoint(endpointId: string): Promise<APIEndpoint | null> {
    try {
      const response: AxiosResponse = await this.client.get(`/endpoints/${endpointId}`)
      return response.data.endpoint
    } catch (error: any) {
      if (error.response?.status === 404) return null
      throw new Error(`Failed to get endpoint: ${error.message}`)
    }
  }

  // ============================================================================
  // API EXECUTION
  // ============================================================================

  // Execute an API request through Lovable
  async executeRequest(request: APIRequest): Promise<APIResponseData> {
    try {
      const requestData = {
        endpointId: request.endpointId,
        method: request.method,
        path: request.path,
        headers: request.headers || {},
        query: request.query || {},
        body: request.body,
        userId: request.userId,
        apiKey: request.apiKey,
        timestamp: new Date().toISOString()
      }

      const response: AxiosResponse = await this.client.post('/execute', requestData)

      return {
        requestId: response.data.requestId,
        statusCode: response.data.statusCode,
        headers: response.data.headers || {},
        body: response.data.body,
        duration: response.data.duration,
        timestamp: new Date(response.data.timestamp),
        cached: response.data.cached || false
      }
    } catch (error: any) {
      throw new Error(`Failed to execute request: ${error.message}`)
    }
  }

  // Execute with retry logic
  async executeRequestWithRetry(request: APIRequest, maxRetries: number = 3): Promise<APIResponseData> {
    let lastError: any

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.executeRequest(request)
      } catch (error) {
        lastError = error

        if (attempt === maxRetries) break

        // Exponential backoff
        const delay = Math.pow(2, attempt) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }

    throw lastError
  }

  // ============================================================================
  // API ANALYTICS
  // ============================================================================

  // Get API usage statistics
  async getUsageStats(timeframe: 'hour' | 'day' | 'week' | 'month' = 'day'): Promise<any> {
    try {
      const response: AxiosResponse = await this.client.get(`/analytics/usage?timeframe=${timeframe}`)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to get usage stats: ${error.message}`)
    }
  }

  // Get API performance metrics
  async getPerformanceMetrics(timeframe: 'hour' | 'day' | 'week' | 'month' = 'day'): Promise<any> {
    try {
      const response: AxiosResponse = await this.client.get(`/analytics/performance?timeframe=${timeframe}`)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to get performance metrics: ${error.message}`)
    }
  }

  // Get error rates
  async getErrorRates(timeframe: 'hour' | 'day' | 'week' | 'month' = 'day'): Promise<any> {
    try {
      const response: AxiosResponse = await this.client.get(`/analytics/errors?timeframe=${timeframe}`)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to get error rates: ${error.message}`)
    }
  }

  // ============================================================================
  // API KEYS MANAGEMENT
  // ============================================================================

  // Generate API key for a user
  async generateAPIKey(userId: string, name: string, permissions: string[] = []): Promise<any> {
    try {
      const response: AxiosResponse = await this.client.post('/keys', {
        userId,
        name,
        permissions,
        expiresAt: null // No expiration
      })

      return response.data
    } catch (error: any) {
      throw new Error(`Failed to generate API key: ${error.message}`)
    }
  }

  // Revoke API key
  async revokeAPIKey(keyId: string): Promise<void> {
    try {
      await this.client.delete(`/keys/${keyId}`)
    } catch (error: any) {
      throw new Error(`Failed to revoke API key: ${error.message}`)
    }
  }

  // Get user's API keys
  async getUserAPIKeys(userId: string): Promise<any[]> {
    try {
      const response: AxiosResponse = await this.client.get(`/users/${userId}/keys`)
      return response.data.keys || []
    } catch (error: any) {
      throw new Error(`Failed to get user API keys: ${error.message}`)
    }
  }

  // Validate API key
  async validateAPIKey(apiKey: string): Promise<any> {
    try {
      const response: AxiosResponse = await this.client.post('/keys/validate', { apiKey })
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to validate API key: ${error.message}`)
    }
  }

  // ============================================================================
  // RATE LIMITING
  // ============================================================================

  // Get rate limit status for a key
  async getRateLimitStatus(apiKey: string): Promise<any> {
    try {
      const response: AxiosResponse = await this.client.get(`/ratelimits/status?key=${apiKey}`)
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to get rate limit status: ${error.message}`)
    }
  }

  // Update rate limits for an endpoint
  async updateRateLimits(endpointId: string, limits: { requests: number; period: number }): Promise<void> {
    try {
      await this.client.put(`/endpoints/${endpointId}/ratelimits`, limits)
    } catch (error: any) {
      throw new Error(`Failed to update rate limits: ${error.message}`)
    }
  }

  // ============================================================================
  // WEBHOOKS
  // ============================================================================

  // Register webhook endpoint
  async registerWebhook(url: string, events: string[], secret?: string): Promise<any> {
    try {
      const response: AxiosResponse = await this.client.post('/webhooks', {
        url,
        events,
        secret,
        active: true
      })

      return response.data
    } catch (error: any) {
      throw new Error(`Failed to register webhook: ${error.message}`)
    }
  }

  // Get webhook deliveries
  async getWebhookDeliveries(webhookId: string, limit: number = 50): Promise<any[]> {
    try {
      const response: AxiosResponse = await this.client.get(`/webhooks/${webhookId}/deliveries?limit=${limit}`)
      return response.data.deliveries || []
    } catch (error: any) {
      throw new Error(`Failed to get webhook deliveries: ${error.message}`)
    }
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  // Health check
  async healthCheck(): Promise<any> {
    try {
      const response: AxiosResponse = await this.client.get('/health')
      return response.data
    } catch (error: any) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      }
    }
  }

  // Get service information
  async getServiceInfo(): Promise<any> {
    try {
      const response: AxiosResponse = await this.client.get('/info')
      return response.data
    } catch (error: any) {
      throw new Error(`Failed to get service info: ${error.message}`)
    }
  }
}

// Export singleton instance (would be configured from environment)
export const lovableAPIService = new LovableAPIService({
  baseURL: process.env.LOVABLE_API_URL || 'https://api.lovable.dev',
  apiKey: process.env.LOVABLE_API_KEY || '',
  projectId: process.env.LOVABLE_PROJECT_ID,
  environment: (process.env.NODE_ENV as any) || 'development',
  timeout: 30000,
  retries: 3
})