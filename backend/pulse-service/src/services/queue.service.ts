import { createClient, RedisClientType } from 'redis'
import { loadConfig } from '../config/loader'

// ============================================================================
// QUEUE SERVICE
// ============================================================================

interface QueueJob {
  id: string
  type: string
  data: any
  options?: {
    delay?: number
    priority?: number
    attempts?: number
  }
}

export class QueueService {
  private config = loadConfig()
  private client: RedisClientType
  private isConnected = false

  constructor() {
    this.client = createClient({
      url: this.config.REDIS_URL,
    })

    this.client.on('error', (err) => {
      console.error('Queue Redis Client Error:', err)
    })

    this.client.on('connect', () => {
      console.log('Queue connected to Redis')
      this.isConnected = true
    })

    this.client.on('ready', () => {
      console.log('Queue Redis client ready')
    })

    this.client.on('end', () => {
      console.log('Queue Redis connection ended')
      this.isConnected = false
    })
  }

  // ============================================================================
  // CONNECTION MANAGEMENT
  // ============================================================================

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect()
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.disconnect()
    }
  }

  // ============================================================================
  // JOB MANAGEMENT
  // ============================================================================

  async addJob(type: string, data: any, options?: QueueJob['options']): Promise<string> {
    await this.connect()

    const jobId = `job:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`

    const job: QueueJob = {
      id: jobId,
      type,
      data,
      options: options || {},
    }

    const queueKey = `queue:${type}`
    const jobKey = `job:${jobId}`

    // Store job data
    await this.client.setEx(jobKey, 24 * 60 * 60, JSON.stringify(job)) // 24 hours

    // Add to queue
    const delay = options?.delay || 0
    if (delay > 0) {
      await this.client.zAdd(queueKey, {
        score: Date.now() + delay,
        value: jobId,
      })
    } else {
      await this.client.lPush(queueKey, jobId)
    }

    return jobId
  }

  async getNextJob(type: string): Promise<QueueJob | null> {
    await this.connect()

    const queueKey = `queue:${type}`

    // Check for delayed jobs first
    const delayedJobs = await this.client.zRangeByScore(
      queueKey,
      0,
      Date.now(),
      { LIMIT: { offset: 0, count: 1 } }
    )

    let jobId: string | null = null

    if (delayedJobs.length > 0) {
      jobId = delayedJobs[0]
      await this.client.zRem(queueKey, jobId)
    } else {
      jobId = await this.client.rPop(queueKey)
    }

    if (!jobId) {
      return null
    }

    const jobData = await this.client.get(`job:${jobId}`)
    if (!jobData) {
      return null
    }

    const job: QueueJob = JSON.parse(jobData)

    // Move to processing queue
    await this.client.setEx(`processing:${jobId}`, 300, '1') // 5 minutes

    return job
  }

  async completeJob(jobId: string): Promise<void> {
    await this.connect()

    await this.client.del(`job:${jobId}`)
    await this.client.del(`processing:${jobId}`)
  }

  async failJob(jobId: string, error?: string): Promise<void> {
    await this.connect()

    const jobData = await this.client.get(`job:${jobId}`)
    if (jobData) {
      const job: QueueJob = JSON.parse(jobData)
      const attempts = (job.options?.attempts || 0) + 1

      if (attempts < 3) { // Max 3 attempts
        // Retry with exponential backoff
        const delay = Math.pow(2, attempts) * 1000 // 1s, 2s, 4s
        job.options = { ...job.options, attempts, delay }

        await this.client.setEx(`job:${jobId}`, 24 * 60 * 60, JSON.stringify(job))
        await this.client.zAdd(`queue:${job.type}`, {
          score: Date.now() + delay,
          value: jobId,
        })
      } else {
        // Move to dead letter queue
        await this.client.lPush('dead-letter-queue', jobId)
        console.error(`Job ${jobId} failed permanently:`, error)
      }
    }

    await this.client.del(`processing:${jobId}`)
  }

  // ============================================================================
  // MONITORING
  // ============================================================================

  async getQueueStats(type: string): Promise<{
    pending: number
    processing: number
    delayed: number
  }> {
    await this.connect()

    const queueKey = `queue:${type}`

    const [pending, delayed] = await Promise.all([
      this.client.lLen(queueKey),
      this.client.zCount(queueKey, 0, Date.now()),
    ])

    // Count processing jobs
    const processingKeys = await this.client.keys('processing:*')
    const processing = processingKeys.length

    return {
      pending,
      processing,
      delayed,
    }
  }

  async getAllQueueStats(): Promise<Record<string, { pending: number; processing: number; delayed: number }>> {
    await this.connect()

    const queueKeys = await this.client.keys('queue:*')
    const stats: Record<string, any> = {}

    for (const key of queueKeys) {
      const type = key.replace('queue:', '')
      stats[type] = await this.getQueueStats(type)
    }

    return stats
  }

  // ============================================================================
  // CLEANUP
  // ============================================================================

  async cleanupExpiredJobs(): Promise<void> {
    await this.connect()

    // Clean up expired processing jobs (jobs that have been processing for too long)
    const processingKeys = await this.client.keys('processing:*')

    for (const key of processingKeys) {
      const ttl = await this.client.ttl(key)
      if (ttl === -1) { // No TTL set, job might be stuck
        const jobId = key.replace('processing:', '')
        await this.failJob(jobId, 'Processing timeout')
      }
    }

    // Clean up old completed jobs (older than 24 hours)
    // This is handled by the TTL on job keys
  }
}