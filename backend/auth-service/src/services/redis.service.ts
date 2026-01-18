import { createClient, RedisClientType } from 'redis'
import { loadConfig } from '../config/loader'

// ============================================================================
// REDIS SERVICE
// ============================================================================

export class RedisService {
  private client: RedisClientType
  private config = loadConfig()

  constructor() {
    this.client = createClient({
      url: this.config.REDIS_URL,
    })

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err)
    })

    this.client.on('connect', () => {
      console.log('Connected to Redis')
    })

    this.client.on('ready', () => {
      console.log('Redis client ready')
    })

    this.client.on('end', () => {
      console.log('Redis connection ended')
    })
  }

  // ============================================================================
  // CONNECTION MANAGEMENT
  // ============================================================================

  async connect(): Promise<void> {
    if (!this.client.isOpen) {
      await this.client.connect()
    }
  }

  async disconnect(): Promise<void> {
    if (this.client.isOpen) {
      await this.client.disconnect()
    }
  }

  // ============================================================================
  // BASIC OPERATIONS
  // ============================================================================

  async get(key: string): Promise<string | null> {
    await this.connect()
    return this.client.get(key)
  }

  async set(key: string, value: string): Promise<void> {
    await this.connect()
    await this.client.set(key, value)
  }

  async setex(key: string, seconds: number, value: string): Promise<void> {
    await this.connect()
    await this.client.setEx(key, seconds, value)
  }

  async del(key: string): Promise<number> {
    await this.connect()
    return this.client.del(key)
  }

  async exists(key: string): Promise<number> {
    await this.connect()
    return this.client.exists(key)
  }

  async expire(key: string, seconds: number): Promise<number> {
    await this.connect()
    return this.client.expire(key, seconds)
  }

  async ttl(key: string): Promise<number> {
    await this.connect()
    return this.client.ttl(key)
  }

  // ============================================================================
  // PATTERN OPERATIONS
  // ============================================================================

  async keys(pattern: string): Promise<string[]> {
    await this.connect()
    return this.client.keys(pattern)
  }

  // ============================================================================
  // HASH OPERATIONS
  // ============================================================================

  async hget(key: string, field: string): Promise<string | null> {
    await this.connect()
    return this.client.hGet(key, field)
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    await this.connect()
    return this.client.hSet(key, field, value)
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    await this.connect()
    return this.client.hGetAll(key)
  }

  async hdel(key: string, field: string): Promise<number> {
    await this.connect()
    return this.client.hDel(key, field)
  }

  // ============================================================================
  // LIST OPERATIONS
  // ============================================================================

  async lpush(key: string, ...values: string[]): Promise<number> {
    await this.connect()
    return this.client.lPush(key, values)
  }

  async rpush(key: string, ...values: string[]): Promise<number> {
    await this.connect()
    return this.client.rPush(key, values)
  }

  async lpop(key: string): Promise<string | null> {
    await this.connect()
    return this.client.lPop(key)
  }

  async rpop(key: string): Promise<string | null> {
    await this.connect()
    return this.client.rPop(key)
  }

  async lrange(key: string, start: number, end: number): Promise<string[]> {
    await this.connect()
    return this.client.lRange(key, start, end)
  }

  async llen(key: string): Promise<number> {
    await this.connect()
    return this.client.lLen(key)
  }

  // ============================================================================
  // SET OPERATIONS
  // ============================================================================

  async sadd(key: string, ...members: string[]): Promise<number> {
    await this.connect()
    return this.client.sAdd(key, members)
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    await this.connect()
    return this.client.sRem(key, members)
  }

  async smembers(key: string): Promise<string[]> {
    await this.connect()
    return this.client.sMembers(key)
  }

  async sismember(key: string, member: string): Promise<number> {
    await this.connect()
    return this.client.sIsMember(key, member)
  }

  async scard(key: string): Promise<number> {
    await this.connect()
    return this.client.sCard(key)
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  async ping(): Promise<string> {
    await this.connect()
    return this.client.ping()
  }

  async flushall(): Promise<string> {
    await this.connect()
    return this.client.flushAll()
  }

  // Clean up expired tokens (can be called periodically)
  async cleanupExpiredTokens(): Promise<void> {
    // This is a basic implementation - in production you might want more sophisticated cleanup
    const patterns = ['refresh:', 'reset:', 'verify:']

    for (const pattern of patterns) {
      const keys = await this.keys(`${pattern}*`)
      for (const key of keys) {
        const ttl = await this.ttl(key)
        if (ttl === -2) { // Key doesn't exist
          continue
        }
        if (ttl === -1) { // Key has no expiration
          await this.del(key)
        }
        // Keys with TTL > 0 are still valid
      }
    }
  }
}