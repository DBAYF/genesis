import Redis from 'ioredis'
import { FastifyInstance } from 'fastify'

// Cache configuration
interface CacheConfig {
  ttl: number // Time to live in seconds
  keyPrefix: string
  enabled: boolean
}

// Default cache configurations for different types of data
const CACHE_CONFIGS = {
  // Static data - long cache
  STATIC: { ttl: 3600, keyPrefix: 'static:', enabled: true }, // 1 hour

  // User data - medium cache
  USER: { ttl: 300, keyPrefix: 'user:', enabled: true }, // 5 minutes

  // Company data - short cache
  COMPANY: { ttl: 180, keyPrefix: 'company:', enabled: true }, // 3 minutes

  // Financial data - very short cache (sensitive data)
  FINANCIAL: { ttl: 60, keyPrefix: 'financial:', enabled: true }, // 1 minute

  // API responses - configurable per endpoint
  API_RESPONSE: { ttl: 300, keyPrefix: 'api:', enabled: true }, // 5 minutes

  // Database query results - medium cache
  QUERY: { ttl: 600, keyPrefix: 'query:', enabled: true }, // 10 minutes

  // External API responses - long cache
  EXTERNAL_API: { ttl: 1800, keyPrefix: 'external:', enabled: true }, // 30 minutes
}

class CacheManager {
  private redis: Redis
  private config: CacheConfig

  constructor(redisUrl: string, config: CacheConfig = CACHE_CONFIGS.API_RESPONSE) {
    this.redis = new Redis(redisUrl)
    this.config = config

    this.redis.on('error', (err) => {
      console.warn('Redis cache connection error:', err.message)
    })
  }

  // Generate cache key
  private generateKey(key: string): string {
    return `${this.config.keyPrefix}${key}`
  }

  // Get cached value
  async get<T = any>(key: string): Promise<T | null> {
    if (!this.config.enabled) return null

    try {
      const cached = await this.redis.get(this.generateKey(key))
      if (!cached) return null

      const parsed = JSON.parse(cached)
      return parsed.data
    } catch (error) {
      console.warn('Cache get error:', error.message)
      return null
    }
  }

  // Set cached value
  async set(key: string, value: any, ttl?: number): Promise<void> {
    if (!this.config.enabled) return

    try {
      const cacheData = {
        data: value,
        timestamp: Date.now(),
        ttl: ttl || this.config.ttl
      }

      await this.redis.setex(
        this.generateKey(key),
        ttl || this.config.ttl,
        JSON.stringify(cacheData)
      )
    } catch (error) {
      console.warn('Cache set error:', error.message)
    }
  }

  // Delete cached value
  async del(key: string): Promise<void> {
    if (!this.config.enabled) return

    try {
      await this.redis.del(this.generateKey(key))
    } catch (error) {
      console.warn('Cache delete error:', error.message)
    }
  }

  // Delete by pattern
  async delPattern(pattern: string): Promise<void> {
    if (!this.config.enabled) return

    try {
      const keys = await this.redis.keys(`${this.config.keyPrefix}${pattern}`)
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
    } catch (error) {
      console.warn('Cache delete pattern error:', error.message)
    }
  }

  // Clear all cache
  async clear(): Promise<void> {
    if (!this.config.enabled) return

    try {
      const keys = await this.redis.keys(`${this.config.keyPrefix}*`)
      if (keys.length > 0) {
        await this.redis.del(...keys)
      }
    } catch (error) {
      console.warn('Cache clear error:', error.message)
    }
  }

  // Get cache stats
  async getStats(): Promise<any> {
    try {
      const info = await this.redis.info()
      const keys = await this.redis.keys(`${this.config.keyPrefix}*`)

      return {
        enabled: this.config.enabled,
        keyCount: keys.length,
        keyPrefix: this.config.keyPrefix,
        ttl: this.config.ttl,
        redis: {
          connected: this.redis.status === 'ready',
          ping: await this.redis.ping()
        }
      }
    } catch (error) {
      return {
        enabled: this.config.enabled,
        error: error.message
      }
    }
  }

  // Close connection
  async close(): Promise<void> {
    await this.redis.disconnect()
  }
}

// Global cache instances
const userCache = new CacheManager(process.env.REDIS_URL || 'redis://localhost:6379', CACHE_CONFIGS.USER)
const companyCache = new CacheManager(process.env.REDIS_URL || 'redis://localhost:6379', CACHE_CONFIGS.COMPANY)
const financialCache = new CacheManager(process.env.REDIS_URL || 'redis://localhost:6379', CACHE_CONFIGS.FINANCIAL)
const apiCache = new CacheManager(process.env.REDIS_URL || 'redis://localhost:6379', CACHE_CONFIGS.API_RESPONSE)
const queryCache = new CacheManager(process.env.REDIS_URL || 'redis://localhost:6379', CACHE_CONFIGS.QUERY)

// Cache middleware for Fastify
export async function cacheMiddleware(app: FastifyInstance) {
  // Add cache utilities to the app instance
  app.decorate('cache', {
    user: userCache,
    company: companyCache,
    financial: financialCache,
    api: apiCache,
    query: queryCache,

    // Helper methods
    async getCacheKey(request: any): Promise<string> {
      const { method, url, params, query, headers } = request

      // Create a deterministic cache key
      const keyData = {
        method,
        url,
        params,
        query,
        // Include user ID if authenticated (exclude sensitive headers)
        userId: headers['x-user-id'] || 'anonymous'
      }

      // Simple hash function for cache key
      const crypto = await import('crypto')
      return crypto.createHash('md5').update(JSON.stringify(keyData)).digest('hex')
    },

    async getCachedResponse(cacheKey: string): Promise<any> {
      return await apiCache.get(cacheKey)
    },

    async setCachedResponse(cacheKey: string, response: any, ttl?: number): Promise<void> {
      await apiCache.set(cacheKey, response, ttl)
    },

    async invalidateUserCache(userId: string): Promise<void> {
      await userCache.delPattern(`*${userId}*`)
    },

    async invalidateCompanyCache(companyId: string): Promise<void> {
      await companyCache.delPattern(`*${companyId}*`)
    },

    async invalidateFinancialCache(companyId: string): Promise<void> {
      await financialCache.delPattern(`*${companyId}*`)
    },

    async getCacheStats(): Promise<any> {
      return {
        user: await userCache.getStats(),
        company: await companyCache.getStats(),
        financial: await financialCache.getStats(),
        api: await apiCache.getStats(),
        query: await queryCache.getStats()
      }
    }
  })

  // Add hook for automatic response caching
  app.addHook('onSend', async (request, reply) => {
    // Only cache GET requests with successful responses
    if (request.method !== 'GET' || reply.statusCode >= 400) {
      return
    }

    // Skip caching for certain routes
    const skipCacheRoutes = ['/health', '/metrics', '/ready']
    if (skipCacheRoutes.some(route => request.url.includes(route))) {
      return
    }

    try {
      const cacheKey = await app.cache.getCacheKey(request)
      const responseBody = reply.payload

      // Cache for 5 minutes by default
      await app.cache.setCachedResponse(cacheKey, {
        statusCode: reply.statusCode,
        headers: reply.getHeaders(),
        body: responseBody
      }, 300)
    } catch (error) {
      // Don't fail the request if caching fails
      console.warn('Response caching error:', error.message)
    }
  })

  // Graceful shutdown
  app.addHook('onClose', async () => {
    await Promise.all([
      userCache.close(),
      companyCache.close(),
      financialCache.close(),
      apiCache.close(),
      queryCache.close()
    ])
  })
}

// Export cache instances for use in other modules
export { userCache, companyCache, financialCache, apiCache, queryCache, CACHE_CONFIGS }
export default CacheManager