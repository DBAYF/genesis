import { FastifyInstance } from 'fastify'
import axios from 'axios'
import { loadConfig } from '../config/loader'
import { Errors } from '../middleware/error-handler'

// ============================================================================
// PULSE WEBHOOK ROUTES
// ============================================================================

export async function pulseWebhookRoutes(app: FastifyInstance) {
  const config = loadConfig()
  const pulseServiceUrl = config.PULSE_URL

  // ============================================================================
  // TWILIO WEBHOOKS
  // ============================================================================

  app.post('/webhooks/twilio', async (request, reply) => {
    try {
      // Forward webhook to Pulse service
      const response = await axios.post(`${pulseServiceUrl}/api/pulse/webhooks/twilio`, request.body, {
        headers: {
          'x-request-id': request.id as string,
          'content-type': request.headers['content-type'],
          'x-twilio-signature': request.headers['x-twilio-signature'],
        },
      })

      reply.send(response.data)
    } catch (error: any) {
      if (error.response) {
        reply.status(error.response.status).send(error.response.data)
      } else {
        throw Errors.ServiceUnavailable('Pulse Service')
      }
    }
  })

  // ============================================================================
  // WHATSAPP WEBHOOKS
  // ============================================================================

  app.post('/webhooks/whatsapp', async (request, reply) => {
    try {
      // Forward webhook to Pulse service
      const response = await axios.post(`${pulseServiceUrl}/api/pulse/webhooks/whatsapp`, request.body, {
        headers: {
          'x-request-id': request.id as string,
          'content-type': request.headers['content-type'],
        },
      })

      reply.send(response.data)
    } catch (error: any) {
      if (error.response) {
        reply.status(error.response.status).send(error.response.data)
      } else {
        throw Errors.ServiceUnavailable('Pulse Service')
      }
    }
  })

  // ============================================================================
  // TELEGRAM WEBHOOKS
  // ============================================================================

  app.post('/webhooks/telegram', async (request, reply) => {
    try {
      // Forward webhook to Pulse service
      const response = await axios.post(`${pulseServiceUrl}/api/pulse/webhooks/telegram`, request.body, {
        headers: {
          'x-request-id': request.id as string,
          'content-type': request.headers['content-type'],
        },
      })

      reply.send(response.data)
    } catch (error: any) {
      if (error.response) {
        reply.status(error.response.status).send(error.response.data)
      } else {
        throw Errors.ServiceUnavailable('Pulse Service')
      }
    }
  })

  // ============================================================================
  // EMAIL WEBHOOKS (SendGrid)
  // ============================================================================

  app.post('/webhooks/sendgrid', async (request, reply) => {
    try {
      // Forward webhook to Pulse service
      const response = await axios.post(`${pulseServiceUrl}/api/pulse/webhooks/sendgrid`, request.body, {
        headers: {
          'x-request-id': request.id as string,
          'content-type': request.headers['content-type'],
        },
      })

      reply.send(response.data)
    } catch (error: any) {
      if (error.response) {
        reply.status(error.response.status).send(error.response.data)
      } else {
        throw Errors.ServiceUnavailable('Pulse Service')
      }
    }
  })
}