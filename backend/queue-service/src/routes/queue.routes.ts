import { FastifyInstance } from 'fastify'
import { BullMQService } from '../services/queue.service'
import { JobType, JobPriority, JobStatus } from '../types/queue'
import { z } from 'zod'

const queueService = new BullMQService(process.env.REDIS_URL || 'redis://localhost:6379')

export async function queueRoutes(app: FastifyInstance) {
  // ============================================================================
  // JOB MANAGEMENT
  // ============================================================================

  // Add a job to the queue
  app.post('/jobs', {
    schema: {
      body: z.object({
        type: z.enum([
          'send_email', 'send_bulk_email', 'send_newsletter',
          'send_sms', 'send_push_notification', 'send_webhook',
          'process_compliance_task', 'send_compliance_reminder', 'check_overdue_tasks',
          'process_crm_automation', 'send_campaign_email', 'update_lead_scores',
          'send_calendar_invite', 'sync_external_calendar', 'send_event_reminder',
          'process_subscription', 'send_invoice', 'process_payment', 'handle_webhook',
          'process_ai_request', 'generate_report', 'analyze_data',
          'cleanup_data', 'backup_database', 'health_check', 'custom_job'
        ]),
        payload: z.record(z.any()),
        priority: z.enum(['low', 'normal', 'high', 'critical']).default('normal').optional(),
        delay: z.number().optional(),
        attempts: z.number().default(3).optional(),
        removeOnComplete: z.number().default(100).optional(),
        removeOnFail: z.number().default(50).optional(),
      })
    }
  }, async (request, reply) => {
    const data = request.body as any

    try {
      const jobId = await queueService.addJob({
        id: undefined,
        type: data.type,
        payload: data.payload,
        priority: data.priority === 'low' ? JobPriority.LOW :
                 data.priority === 'high' ? JobPriority.HIGH :
                 data.priority === 'critical' ? JobPriority.CRITICAL :
                 JobPriority.NORMAL,
        delay: data.delay,
        attempts: data.attempts,
        removeOnComplete: data.removeOnComplete,
        removeOnFail: data.removeOnFail,
      })

      return reply.status(201).send({
        success: true,
        data: { jobId }
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to add job to queue'
      })
    }
  })

  // Add multiple jobs to the queue
  app.post('/jobs/bulk', {
    schema: {
      body: z.array(z.object({
        type: z.string(),
        payload: z.record(z.any()),
        priority: z.enum(['low', 'normal', 'high', 'critical']).default('normal').optional(),
        delay: z.number().optional(),
        attempts: z.number().default(3).optional(),
      }))
    }
  }, async (request, reply) => {
    const jobs = request.body as any[]

    try {
      const jobIds = await queueService.addBulkJobs(jobs.map(job => ({
        id: undefined,
        type: job.type,
        payload: job.payload,
        priority: job.priority === 'low' ? JobPriority.LOW :
                 job.priority === 'high' ? JobPriority.HIGH :
                 job.priority === 'critical' ? JobPriority.CRITICAL :
                 JobPriority.NORMAL,
        delay: job.delay,
        attempts: job.attempts,
      })))

      return reply.status(201).send({
        success: true,
        data: { jobIds, count: jobIds.length }
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to add jobs to queue'
      })
    }
  })

  // Get job by ID
  app.get('/jobs/:id', {
    schema: {
      params: z.object({
        id: z.string()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    const job = await queueService.getJob(id)
    if (!job) {
      return reply.status(404).send({
        success: false,
        error: 'Job not found'
      })
    }

    return {
      success: true,
      data: job
    }
  })

  // Get jobs with optional filtering
  app.get('/jobs', {
    schema: {
      querystring: z.object({
        status: z.enum(['waiting', 'active', 'completed', 'failed', 'delayed', 'paused']).optional(),
        limit: z.string().transform(Number).default(50),
        offset: z.string().transform(Number).default(0)
      })
    }
  }, async (request, reply) => {
    const { status, limit } = request.query as any

    const jobs = await queueService.getJobs(status, limit)
    return {
      success: true,
      data: jobs,
      pagination: {
        limit,
        count: jobs.length
      }
    }
  })

  // Retry a failed job
  app.post('/jobs/:id/retry', {
    schema: {
      params: z.object({
        id: z.string()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    try {
      await queueService.retryJob(id)
      return {
        success: true,
        message: 'Job retry initiated'
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to retry job'
      })
    }
  })

  // Remove a job
  app.delete('/jobs/:id', {
    schema: {
      params: z.object({
        id: z.string()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    try {
      await queueService.removeJob(id)
      return {
        success: true,
        message: 'Job removed successfully'
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to remove job'
      })
    }
  })

  // ============================================================================
  // QUEUE MANAGEMENT
  // ============================================================================

  // Pause the queue
  app.post('/queue/pause', async (request, reply) => {
    try {
      await queueService.pauseQueue()
      return {
        success: true,
        message: 'Queue paused successfully'
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to pause queue'
      })
    }
  })

  // Resume the queue
  app.post('/queue/resume', async (request, reply) => {
    try {
      await queueService.resumeQueue()
      return {
        success: true,
        message: 'Queue resumed successfully'
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to resume queue'
      })
    }
  })

  // Clean the queue
  app.post('/queue/clean', {
    schema: {
      body: z.object({
        grace: z.number().default(24 * 60 * 60 * 1000) // 24 hours
      })
    }
  }, async (request, reply) => {
    const { grace } = request.body as any

    try {
      await queueService.cleanQueue(grace)
      return {
        success: true,
        message: 'Queue cleaned successfully'
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to clean queue'
      })
    }
  })

  // ============================================================================
  // SCHEDULED JOBS
  // ============================================================================

  // Schedule a recurring job
  app.post('/scheduled-jobs', {
    schema: {
      body: z.object({
        name: z.string(),
        cron: z.string(),
        type: z.string(),
        payload: z.record(z.any()),
        priority: z.enum(['low', 'normal', 'high', 'critical']).default('normal').optional(),
      })
    }
  }, async (request, reply) => {
    const data = request.body as any

    try {
      const jobId = await queueService.scheduleJob(
        data.name,
        data.cron,
        {
          type: data.type,
          payload: data.payload,
          priority: data.priority === 'low' ? JobPriority.LOW :
                   data.priority === 'high' ? JobPriority.HIGH :
                   data.priority === 'critical' ? JobPriority.CRITICAL :
                   JobPriority.NORMAL,
        }
      )

      return reply.status(201).send({
        success: true,
        data: { jobId }
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to schedule job'
      })
    }
  })

  // Get scheduled jobs
  app.get('/scheduled-jobs', async (request, reply) => {
    const jobs = await queueService.getScheduledJobs()
    return {
      success: true,
      data: jobs
    }
  })

  // Remove scheduled job
  app.delete('/scheduled-jobs/:id', {
    schema: {
      params: z.object({
        id: z.string()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    try {
      await queueService.unscheduleJob(id)
      return {
        success: true,
        message: 'Scheduled job removed successfully'
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to remove scheduled job'
      })
    }
  })

  // ============================================================================
  // METRICS & MONITORING
  // ============================================================================

  // Get queue metrics
  app.get('/metrics', async (request, reply) => {
    const metrics = await queueService.getMetrics()
    return {
      success: true,
      data: metrics
    }
  })

  // Get job statistics
  app.get('/stats/jobs', {
    schema: {
      querystring: z.object({
        type: z.string().optional()
      })
    }
  }, async (request, reply) => {
    const { type } = request.query as { type?: string }

    const stats = await queueService.getJobStats(type as JobType)
    return {
      success: true,
      data: stats
    }
  })

  // Health check
  app.get('/health', async (request, reply) => {
    const health = await queueService.healthCheck()
    const statusCode = health.status === 'healthy' ? 200 : 503

    return reply.status(statusCode).send({
      success: health.status === 'healthy',
      data: health.details
    })
  })

  // ============================================================================
  // CONVENIENCE ENDPOINTS FOR COMMON JOBS
  // ============================================================================

  // Send email
  app.post('/jobs/send-email', {
    schema: {
      body: z.object({
        to: z.union([z.string(), z.array(z.string())]),
        subject: z.string(),
        html: z.string(),
        text: z.string().optional(),
        from: z.string().optional(),
        replyTo: z.string().optional(),
        attachments: z.array(z.object({
          filename: z.string(),
          content: z.string(),
          contentType: z.string().optional(),
          encoding: z.string().optional()
        })).optional(),
        priority: z.enum(['low', 'normal', 'high', 'critical']).default('normal').optional(),
        delay: z.number().optional()
      })
    }
  }, async (request, reply) => {
    const data = request.body as any

    try {
      const jobId = await queueService.addJob({
        type: JobType.SEND_EMAIL,
        payload: data,
        priority: data.priority === 'low' ? JobPriority.LOW :
                 data.priority === 'high' ? JobPriority.HIGH :
                 data.priority === 'critical' ? JobPriority.CRITICAL :
                 JobPriority.NORMAL,
        delay: data.delay,
      })

      return reply.status(201).send({
        success: true,
        data: { jobId }
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to queue email'
      })
    }
  })

  // Send SMS
  app.post('/jobs/send-sms', {
    schema: {
      body: z.object({
        to: z.string(),
        message: z.string(),
        from: z.string().optional(),
        priority: z.enum(['low', 'normal', 'high', 'critical']).default('normal').optional(),
        delay: z.number().optional()
      })
    }
  }, async (request, reply) => {
    const data = request.body as any

    try {
      const jobId = await queueService.addJob({
        type: JobType.SEND_SMS,
        payload: data,
        priority: data.priority === 'low' ? JobPriority.LOW :
                 data.priority === 'high' ? JobPriority.HIGH :
                 data.priority === 'critical' ? JobPriority.CRITICAL :
                 JobPriority.NORMAL,
        delay: data.delay,
      })

      return reply.status(201).send({
        success: true,
        data: { jobId }
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to queue SMS'
      })
    }
  })

  // Send webhook
  app.post('/jobs/send-webhook', {
    schema: {
      body: z.object({
        url: z.string().url(),
        method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).default('POST'),
        headers: z.record(z.string()).optional(),
        body: z.any().optional(),
        timeout: z.number().default(30000),
        retries: z.number().default(3),
        priority: z.enum(['low', 'normal', 'high', 'critical']).default('normal').optional(),
        delay: z.number().optional()
      })
    }
  }, async (request, reply) => {
    const data = request.body as any

    try {
      const jobId = await queueService.addJob({
        type: JobType.SEND_WEBHOOK,
        payload: data,
        priority: data.priority === 'low' ? JobPriority.LOW :
                 data.priority === 'high' ? JobPriority.HIGH :
                 data.priority === 'critical' ? JobPriority.CRITICAL :
                 JobPriority.NORMAL,
        delay: data.delay,
      })

      return reply.status(201).send({
        success: true,
        data: { jobId }
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to queue webhook'
      })
    }
  })
}