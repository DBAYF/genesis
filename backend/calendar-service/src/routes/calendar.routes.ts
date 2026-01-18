import { FastifyInstance } from 'fastify'
import { CalendarServiceImpl } from '../services/calendar.service'
import { prisma } from '../utils/prisma'
import { z } from 'zod'

const calendarService = new CalendarServiceImpl(prisma)

export async function calendarRoutes(app: FastifyInstance) {
  // ============================================================================
  // CALENDAR EVENT ROUTES
  // ============================================================================

  // Create calendar event
  app.post('/companies/:companyId/events', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.object({
        calendarId: z.string().uuid().optional(),
        title: z.string(),
        description: z.string().optional(),
        startTime: z.string(),
        endTime: z.string(),
        allDay: z.boolean().default(false),
        location: z.string().optional(),
        attendees: z.array(z.object({
          name: z.string(),
          email: z.string(),
          role: z.enum(['required', 'optional', 'resource']).default('required')
        })).optional(),
        reminders: z.array(z.object({
          method: z.enum(['email', 'popup', 'sms']),
          minutes: z.number()
        })).optional(),
        recurrence: z.object({
          frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
          interval: z.number().default(1),
          endDate: z.string().optional(),
          count: z.number().optional(),
          daysOfWeek: z.array(z.number()).optional(),
          daysOfMonth: z.array(z.number()).optional(),
          monthsOfYear: z.array(z.number()).optional()
        }).optional(),
        visibility: z.enum(['public', 'private', 'confidential']).default('public'),
        priority: z.enum(['low', 'normal', 'high']).default('normal'),
        category: z.string().default('meeting'),
        tags: z.array(z.string()).optional(),
        metadata: z.record(z.any()).optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const data = request.body as any

    try {
      const event = await calendarService.createEvent(companyId, data, 'system')
      return reply.status(201).send({
        success: true,
        data: event
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to create calendar event'
      })
    }
  })

  // Get calendar events
  app.get('/companies/:companyId/events', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      querystring: z.object({
        calendarId: z.string().uuid().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        status: z.string().optional(),
        category: z.string().optional(),
        tags: z.string().optional(),
        attendeeEmail: z.string().optional(),
        limit: z.string().transform(Number).default(100)
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const query = request.query as any

    const filters = {
      calendarId: query.calendarId,
      startDate: query.startDate,
      endDate: query.endDate,
      status: query.status?.split(','),
      category: query.category,
      tags: query.tags?.split(','),
      attendeeEmail: query.attendeeEmail
    }

    const events = await calendarService.getEvents(companyId, filters)
    return {
      success: true,
      data: events.slice(0, query.limit)
    }
  })

  // Get calendar event
  app.get('/events/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const event = await calendarService.getEvent(id)

    if (!event) {
      return reply.status(404).send({
        success: false,
        error: 'Calendar event not found'
      })
    }

    return {
      success: true,
      data: event
    }
  })

  // Update calendar event
  app.put('/events/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        allDay: z.boolean().optional(),
        location: z.string().optional(),
        attendees: z.array(z.any()).optional(),
        reminders: z.array(z.any()).optional(),
        recurrence: z.any().optional(),
        status: z.enum(['confirmed', 'tentative', 'cancelled']).optional(),
        visibility: z.enum(['public', 'private', 'confidential']).optional(),
        priority: z.enum(['low', 'normal', 'high']).optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        metadata: z.record(z.any()).optional()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const updates = request.body as any

    try {
      const event = await calendarService.updateEvent(id, updates)
      return {
        success: true,
        data: event
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Calendar event not found'
      })
    }
  })

  // Delete calendar event
  app.delete('/events/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    try {
      await calendarService.deleteEvent(id)
      return {
        success: true,
        message: 'Event deleted successfully'
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Calendar event not found'
      })
    }
  })

  // Duplicate calendar event
  app.post('/events/:id/duplicate', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: z.object({
        newStartTime: z.string()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { newStartTime } = request.body as any

    try {
      const event = await calendarService.duplicateEvent(id, newStartTime)
      return reply.status(201).send({
        success: true,
        data: event
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to duplicate event'
      })
    }
  })

  // ============================================================================
  // CALENDAR MANAGEMENT ROUTES
  // ============================================================================

  // Create calendar
  app.post('/companies/:companyId/calendars', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.object({
        name: z.string(),
        description: z.string().optional(),
        color: z.string().default('#3174ad'),
        timezone: z.string().default('Europe/London')
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const data = request.body as any

    try {
      const calendar = await calendarService.createCalendar(companyId, data)
      return reply.status(201).send({
        success: true,
        data: calendar
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to create calendar'
      })
    }
  })

  // Get calendars
  app.get('/companies/:companyId/calendars', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const calendars = await calendarService.getCalendars(companyId)

    return {
      success: true,
      data: calendars
    }
  })

  // Update calendar
  app.put('/calendars/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        color: z.string().optional(),
        isVisible: z.boolean().optional(),
        timezone: z.string().optional(),
        syncEnabled: z.boolean().optional()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const updates = request.body as any

    try {
      const calendar = await calendarService.updateCalendar(id, updates)
      return {
        success: true,
        data: calendar
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Calendar not found'
      })
    }
  })

  // ============================================================================
  // AVAILABILITY ROUTES
  // ============================================================================

  // Set availability
  app.put('/users/:userId/availability', {
    schema: {
      params: z.object({
        userId: z.string().uuid()
      }),
      body: z.object({
        dayOfWeek: z.number().min(0).max(6),
        startTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
        isAvailable: z.boolean()
      })
    }
  }, async (request, reply) => {
    const { userId } = request.params as { userId: string }
    const data = request.body as any

    try {
      const availability = await calendarService.setAvailability(userId, undefined, data)
      return {
        success: true,
        data: availability
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to set availability'
      })
    }
  })

  // Get user availability
  app.get('/users/:userId/availability', {
    schema: {
      params: z.object({
        userId: z.string().uuid()
      }),
      querystring: z.object({
        date: z.string().optional()
      })
    }
  }, async (request, reply) => {
    const { userId } = request.params as { userId: string }
    const { date } = request.query as { date?: string }

    if (date) {
      const slots = await calendarService.getUserAvailability(userId, date)
      return {
        success: true,
        data: slots
      }
    } else {
      const availability = await calendarService.getAvailability(userId, '', '')
      return {
        success: true,
        data: availability
      }
    }
  })

  // Find available slots
  app.post('/availability/find-slots', {
    schema: {
      body: z.object({
        attendees: z.array(z.string()),
        duration: z.number(),
        startDate: z.string(),
        endDate: z.string()
      })
    }
  }, async (request, reply) => {
    const { attendees, duration, startDate, endDate } = request.body as any

    try {
      const slots = await calendarService.findAvailableSlots(attendees, duration, startDate, endDate)
      return {
        success: true,
        data: slots
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to find available slots'
      })
    }
  })

  // ============================================================================
  // MEETING ROOM ROUTES
  // ============================================================================

  // Create meeting room
  app.post('/companies/:companyId/meeting-rooms', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.object({
        name: z.string(),
        location: z.string(),
        capacity: z.number(),
        amenities: z.array(z.string()).optional(),
        bookingRules: z.object({
          maxDurationHours: z.number().optional(),
          minAdvanceBookingHours: z.number().optional(),
          maxAdvanceBookingDays: z.number().optional(),
          requiresApproval: z.boolean().optional(),
          allowedUserRoles: z.array(z.string()).optional()
        }).optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const data = request.body as any

    try {
      const room = await calendarService.createMeetingRoom(companyId, data)
      return reply.status(201).send({
        success: true,
        data: room
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to create meeting room'
      })
    }
  })

  // Get meeting rooms
  app.get('/companies/:companyId/meeting-rooms', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const rooms = await calendarService.getMeetingRooms(companyId)

    return {
      success: true,
      data: rooms
    }
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
    const { startTime, endTime, bookedBy } = request.body as any

    const success = await calendarService.bookMeetingRoom(roomId, startTime, endTime, bookedBy)
    if (!success) {
      return reply.status(409).send({
        success: false,
        error: 'Meeting room not available for the requested time'
      })
    }

    return {
      success: true,
      message: 'Meeting room booked successfully'
    }
  })

  // Get room availability
  app.get('/meeting-rooms/:roomId/availability', {
    schema: {
      params: z.object({
        roomId: z.string().uuid()
      }),
      querystring: z.object({
        date: z.string()
      })
    }
  }, async (request, reply) => {
    const { roomId } = request.params as { roomId: string }
    const { date } = request.query as { date: string }

    const slots = await calendarService.getRoomAvailability(roomId, date)
    return {
      success: true,
      data: slots
    }
  })

  // ============================================================================
  // SCHEDULING ROUTES
  // ============================================================================

  // Schedule meeting
  app.post('/companies/:companyId/schedule-meeting', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.object({
        title: z.string(),
        duration: z.number(),
        attendees: z.array(z.string()),
        preferredTimeSlots: z.array(z.object({
          start: z.string(),
          end: z.string()
        })),
        location: z.string().optional(),
        description: z.string().optional(),
        priority: z.enum(['low', 'normal', 'high']).optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const requestData = request.body as any

    try {
      const suggestions = await calendarService.scheduleMeeting(requestData, 'system')
      return {
        success: true,
        data: suggestions
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to schedule meeting'
      })
    }
  })

  // Reschedule event
  app.put('/events/:id/reschedule', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: z.object({
        newStartTime: z.string(),
        newEndTime: z.string().optional()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const { newStartTime, newEndTime } = request.body as any

    try {
      const event = await calendarService.rescheduleEvent(id, newStartTime, newEndTime)
      return {
        success: true,
        data: event
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to reschedule event'
      })
    }
  })

  // ============================================================================
  // SETTINGS ROUTES
  // ============================================================================

  // Get calendar settings
  app.get('/companies/:companyId/settings', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const settings = await calendarService.getCalendarSettings(companyId)

    if (!settings) {
      return reply.status(404).send({
        success: false,
        error: 'Calendar settings not found'
      })
    }

    return {
      success: true,
      data: settings
    }
  })

  // Update calendar settings
  app.put('/companies/:companyId/settings', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.object({
        defaultTimezone: z.string().optional(),
        workingHours: z.object({
          start: z.string(),
          end: z.string(),
          daysOfWeek: z.array(z.number())
        }).optional(),
        defaultEventDuration: z.number().optional(),
        defaultReminderMinutes: z.number().optional(),
        autoDeclineOutsideWorkingHours: z.boolean().optional(),
        allowDoubleBooking: z.boolean().optional(),
        requireLocation: z.boolean().optional(),
        defaultVisibility: z.enum(['public', 'private']).optional(),
        meetingRoomBookingEnabled: z.boolean().optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const updates = request.body as any

    try {
      const settings = await calendarService.updateCalendarSettings(companyId, updates)
      return {
        success: true,
        data: settings
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to update calendar settings'
      })
    }
  })

  // ============================================================================
  // ANALYTICS ROUTES
  // ============================================================================

  // Get calendar analytics
  app.get('/companies/:companyId/analytics', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      querystring: z.object({
        startDate: z.string(),
        endDate: z.string()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const { startDate, endDate } = request.query as { startDate: string; endDate: string }

    try {
      const analytics = await calendarService.getCalendarAnalytics(companyId, { start: startDate, end: endDate })
      return {
        success: true,
        data: analytics
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to generate analytics'
      })
    }
  })

  // Export calendar events
  app.get('/companies/:companyId/export', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      querystring: z.object({
        format: z.enum(['ics', 'csv']).default('ics'),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        status: z.string().optional(),
        category: z.string().optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const query = request.query as any

    const filters = {
      startDate: query.startDate,
      endDate: query.endDate,
      status: query.status?.split(','),
      category: query.category
    }

    try {
      const data = await calendarService.exportCalendarEvents(companyId, query.format, filters)
      const contentType = query.format === 'csv' ? 'text/csv' : 'text/calendar'
      const filename = `calendar-export-${companyId}.${query.format}`

      reply.header('Content-Type', contentType)
      reply.header('Content-Disposition', `attachment; filename=${filename}`)
      return data
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Export failed'
      })
    }
  })

  // ============================================================================
  // INTEGRATION ROUTES
  // ============================================================================

  // Connect calendar integration
  app.post('/companies/:companyId/integrations', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.object({
        userId: z.string().uuid(),
        provider: z.enum(['google', 'outlook', 'apple']),
        credentials: z.record(z.any())
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const { userId, provider, credentials } = request.body as any

    try {
      const integration = await calendarService.connectCalendarIntegration(companyId, userId, provider, credentials)
      return reply.status(201).send({
        success: true,
        data: integration
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to connect calendar integration'
      })
    }
  })

  // Sync external calendar
  app.post('/integrations/:id/sync', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    try {
      await calendarService.syncExternalCalendar(id)
      return {
        success: true,
        message: 'Calendar sync completed'
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Calendar sync failed'
      })
    }
  })

  // Get calendar integrations
  app.get('/companies/:companyId/integrations', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      querystring: z.object({
        userId: z.string().uuid().optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const { userId } = request.query as { userId?: string }

    const integrations = await calendarService.getCalendarIntegrations(companyId, userId)
    return {
      success: true,
      data: integrations
    }
  })
}