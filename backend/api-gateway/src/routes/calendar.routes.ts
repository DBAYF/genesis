import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { forwardRequest } from '../utils/service-router'

// ============================================================================
// CALENDAR ROUTES
// ============================================================================

export async function calendarRoutes(app: FastifyInstance) {
  // ============================================================================
  // CALENDAR EVENTS
  // ============================================================================

  // Get calendar events
  app.get('/companies/:companyId/events', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      querystring: z.object({
        startDate: z.string(),
        endDate: z.string(),
        calendarId: z.string().uuid().optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    return forwardRequest('calendar-service', 'GET', `/api/v1/companies/${companyId}/events`, request, reply)
  })

  // Create calendar event
  app.post('/companies/:companyId/events', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.object({
        title: z.string(),
        startTime: z.string(),
        endTime: z.string(),
        location: z.string().optional(),
        attendees: z.array(z.object({
          name: z.string(),
          email: z.string(),
          role: z.enum(['required', 'optional', 'resource']).default('required')
        })).optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    return forwardRequest('calendar-service', 'POST', `/api/v1/companies/${companyId}/events`, request, reply)
  })

  // ============================================================================
  // CALENDARS
  // ============================================================================

  // Get calendars
  app.get('/companies/:companyId/calendars', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    return forwardRequest('calendar-service', 'GET', `/api/v1/companies/${companyId}/calendars`, request, reply)
  })

  // Create calendar
  app.post('/companies/:companyId/calendars', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.object({
        name: z.string(),
        description: z.string().optional(),
        color: z.string().default('#3174ad')
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    return forwardRequest('calendar-service', 'POST', `/api/v1/companies/${companyId}/calendars`, request, reply)
  })

  // ============================================================================
  // AVAILABILITY
  // ============================================================================

  // Get user availability
  app.get('/users/:userId/availability', {
    schema: {
      params: z.object({
        userId: z.string().uuid()
      }),
      querystring: z.object({
        date: z.string()
      })
    }
  }, async (request, reply) => {
    const { userId } = request.params as { userId: string }
    return forwardRequest('calendar-service', 'GET', `/api/v1/users/${userId}/availability`, request, reply)
  })

  // ============================================================================
  // MEETING ROOMS
  // ============================================================================

  // Get meeting rooms
  app.get('/companies/:companyId/meeting-rooms', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    return forwardRequest('calendar-service', 'GET', `/api/v1/companies/${companyId}/meeting-rooms`, request, reply)
  })

  // Book meeting room
  app.post('/meeting-rooms/:roomId/book', {
    schema: {
      params: z.object({
        roomId: z.string().uuid()
      }),
      body: z.object({
        startTime: z.string(),
        endTime: z.string(),
        bookedBy: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { roomId } = request.params as { roomId: string }
    return forwardRequest('calendar-service', 'POST', `/api/v1/meeting-rooms/${roomId}/book`, request, reply)
  })
}