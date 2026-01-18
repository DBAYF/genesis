#!/usr/bin/env node

import 'dotenv/config'
import { Worker } from 'bullmq'
import { loadConfig } from './config/loader'
import { JobProcessor } from './services/job-processor'
import nodemailer from 'nodemailer'

async function startWorker() {
  const config = loadConfig()

  // Setup email transporter
  const emailTransporter = nodemailer.createTransporter({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: config.SMTP_PORT === 465,
    auth: {
      user: config.SMTP_USER,
      pass: config.SMTP_PASS,
    },
  })

  // Create job processor
  const processor = new JobProcessor(emailTransporter)

  // Create worker
  const worker = new Worker(
    config.QUEUE_NAME,
    async (job) => {
      console.log(`Processing job ${job.id} of type ${job.name}`)
      return await processor.process(job)
    },
    {
      connection: config.REDIS_URL,
      concurrency: config.MAX_CONCURRENT_JOBS,
      limiter: {
        max: 1000,
        duration: 60000, // 1 minute
      },
    }
  )

  // Worker event handlers
  worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully`)
  })

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err.message)
  })

  worker.on('stalled', (jobId) => {
    console.warn(`Job ${jobId} stalled`)
  })

  console.log(`🚀 Queue worker started with concurrency ${config.MAX_CONCURRENT_JOBS}`)

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('Shutting down worker gracefully...')
    await worker.close()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    console.log('Shutting down worker gracefully...')
    await worker.close()
    process.exit(0)
  })
}

startWorker().catch((error) => {
  console.error('Failed to start worker:', error)
  process.exit(1)
})