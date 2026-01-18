import { Queue, Worker, QueueScheduler, Job, MetricsTime } from 'bullmq'
import IORedis from 'ioredis'
import { v4 as uuidv4 } from 'uuid'
import {
  JobData,
  JobType,
  JobPriority,
  JobStatus,
  JobResult,
  QueueMetrics,
  ScheduledJob,
  QueueService
} from '../types/queue'

export class BullMQService implements QueueService {
  private queue: Queue
  private scheduler: QueueScheduler
  private redis: IORedis
  private scheduledJobs: Map<string, ScheduledJob> = new Map()

  constructor(
    private redisUrl: string,
    private queueName: string = 'genesis-jobs',
    private maxConcurrentJobs: number = 10
  ) {
    this.redis = new IORedis(redisUrl)

    this.queue = new Queue(queueName, {
      connection: this.redis,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    })

    this.scheduler = new QueueScheduler(queueName, {
      connection: this.redis,
    })
  }

  async addJob(jobData: JobData): Promise<string> {
    const jobId = jobData.id || uuidv4()

    const jobOptions: any = {
      jobId,
      priority: jobData.priority || JobPriority.NORMAL,
      delay: jobData.delay || 0,
      attempts: jobData.attempts || 3,
      removeOnComplete: jobData.removeOnComplete || 100,
      removeOnFail: jobData.removeOnFail || 50,
    }

    if (jobData.backoff) {
      jobOptions.backoff = jobData.backoff
    }

    const job = await this.queue.add(
      jobData.type,
      {
        ...jobData.payload,
        jobId,
        jobType: jobData.type,
      },
      jobOptions
    )

    return job.id
  }

  async addBulkJobs(jobs: JobData[]): Promise<string[]> {
    const bullJobs = jobs.map(jobData => {
      const jobId = jobData.id || uuidv4()
      return {
        name: jobData.type,
        data: {
          ...jobData.payload,
          jobId,
          jobType: jobData.type,
        },
        opts: {
          jobId,
          priority: jobData.priority || JobPriority.NORMAL,
          delay: jobData.delay || 0,
          attempts: jobData.attempts || 3,
          removeOnComplete: jobData.removeOnComplete || 100,
          removeOnFail: jobData.removeOnFail || 50,
        },
      }
    })

    const addedJobs = await this.queue.addBulk(bullJobs)
    return addedJobs.map(job => job.id)
  }

  async getJob(jobId: string): Promise<any> {
    const job = await this.queue.getJob(jobId)
    return job ? this.formatJob(job) : null
  }

  async getJobs(status?: JobStatus, limit: number = 50): Promise<any[]> {
    let jobs: Job[]

    switch (status) {
      case JobStatus.WAITING:
        jobs = await this.queue.getWaiting(0, limit)
        break
      case JobStatus.ACTIVE:
        jobs = await this.queue.getActive(0, limit)
        break
      case JobStatus.COMPLETED:
        jobs = await this.queue.getCompleted(0, limit)
        break
      case JobStatus.FAILED:
        jobs = await this.queue.getFailed(0, limit)
        break
      case JobStatus.DELAYED:
        jobs = await this.queue.getDelayed(0, limit)
        break
      default:
        jobs = await this.queue.getJobs([], 0, limit)
    }

    return jobs.map(job => this.formatJob(job))
  }

  async removeJob(jobId: string): Promise<void> {
    const job = await this.queue.getJob(jobId)
    if (job) {
      await job.remove()
    }
  }

  async retryJob(jobId: string): Promise<void> {
    const job = await this.queue.getJob(jobId)
    if (job) {
      await job.retry()
    }
  }

  async pauseQueue(): Promise<void> {
    await this.queue.pause()
  }

  async resumeQueue(): Promise<void> {
    await this.queue.resume()
  }

  async cleanQueue(grace: number): Promise<void> {
    await this.queue.clean(grace, 100, 'completed')
    await this.queue.clean(grace, 50, 'failed')
  }

  async scheduleJob(name: string, cron: string, jobData: Omit<JobData, 'id'>): Promise<string> {
    const jobId = uuidv4()
    const scheduledJob: ScheduledJob = {
      id: jobId,
      name,
      cron,
      jobType: jobData.type,
      payload: jobData.payload,
      enabled: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    this.scheduledJobs.set(jobId, scheduledJob)
    return jobId
  }

  async unscheduleJob(jobId: string): Promise<void> {
    this.scheduledJobs.delete(jobId)
  }

  getScheduledJobs(): Promise<ScheduledJob[]> {
    return Promise.resolve(Array.from(this.scheduledJobs.values()))
  }

  async getMetrics(): Promise<QueueMetrics> {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.queue.getWaiting(),
      this.queue.getActive(),
      this.queue.getCompleted(),
      this.queue.getFailed(),
      this.queue.getDelayed(),
    ])

    // Get throughput metrics (simplified - in production you'd use Redis time series)
    const throughput = {
      lastHour: 0, // Would calculate from completed jobs in last hour
      lastDay: 0,  // Would calculate from completed jobs in last day
      lastWeek: 0, // Would calculate from completed jobs in last week
    }

    const latency = {
      average: 0, // Would calculate from job processing times
      p95: 0,
      p99: 0,
    }

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
      paused: 0, // Would need to check queue state
      throughput,
      latency,
    }
  }

  async getJobStats(jobType?: JobType): Promise<Record<string, any>> {
    // Get job statistics by type
    const jobs = jobType
      ? await this.queue.getJobs([jobType], 0, 1000)
      : await this.queue.getJobs([], 0, 1000)

    const stats: Record<string, any> = {}

    jobs.forEach(job => {
      const type = job.name as JobType
      if (!stats[type]) {
        stats[type] = {
          total: 0,
          completed: 0,
          failed: 0,
          active: 0,
          waiting: 0,
          averageDuration: 0,
        }
      }

      stats[type].total++

      switch (job.opts.jobId) {
        case 'completed':
          stats[type].completed++
          break
        case 'failed':
          stats[type].failed++
          break
        case 'active':
          stats[type].active++
          break
        case 'waiting':
          stats[type].waiting++
          break
      }
    })

    return stats
  }

  async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details: any }> {
    try {
      // Check Redis connection
      await this.redis.ping()

      // Check queue status
      const metrics = await this.getMetrics()

      const isHealthy = metrics.failed < 100 // Less than 100 failed jobs

      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        details: {
          redis: 'connected',
          metrics,
          timestamp: new Date().toISOString(),
        },
      }
    } catch (error) {
      return {
        status: 'unhealthy',
        details: {
          error: error.message,
          timestamp: new Date().toISOString(),
        },
      }
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private formatJob(job: Job): any {
    return {
      id: job.id,
      name: job.name,
      data: job.data,
      progress: job.progress,
      attemptsMade: job.attemptsMade,
      attemptsRemaining: job.opts.attempts - job.attemptsMade,
      finishedOn: job.finishedOn,
      processedOn: job.processedOn,
      failedReason: job.failedReason,
      returnvalue: job.returnvalue,
      state: job.opts.jobId, // This is a simplification
      createdAt: new Date(job.timestamp).toISOString(),
      updatedAt: new Date(job.finishedOn || job.processedOn || job.timestamp).toISOString(),
    }
  }

  async close(): Promise<void> {
    await this.queue.close()
    await this.scheduler.close()
    await this.redis.disconnect()
  }
}