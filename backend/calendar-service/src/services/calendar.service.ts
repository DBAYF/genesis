import { PrismaClient } from '@prisma/client'
import {
  CalendarEvent,
  Calendar,
  Availability,
  TimeSlot,
  MeetingRoom,
  CalendarIntegration,
  CalendarSettings,
  SchedulingSuggestion,
  CalendarAnalytics,
  CreateCalendarEventRequest,
  UpdateCalendarEventRequest,
  CreateCalendarRequest,
  SetAvailabilityRequest,
  CreateMeetingRoomRequest,
  UpdateCalendarSettingsRequest,
  CalendarEventFilters,
  CalendarService
} from '../types/calendar'

export class CalendarServiceImpl implements CalendarService {
  constructor(private prisma: PrismaClient) {}

  // ============================================================================
  // CALENDAR EVENT MANAGEMENT
  // ============================================================================

  async createEvent(companyId: string, data: CreateCalendarEventRequest, createdBy: string): Promise<CalendarEvent> {
    // Use default calendar if none specified
    const calendarId = data.calendarId || await this.getDefaultCalendarId(companyId)

    const event = await this.prisma.calendarEvent.create({
      data: {
        companyId,
        calendarId,
        title: data.title,
        description: data.description,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        allDay: data.allDay || false,
        location: data.location,
        attendees: data.attendees || [],
        reminders: data.reminders || [],
        recurrence: data.recurrence,
        status: 'confirmed',
        visibility: data.visibility || 'public',
        priority: data.priority || 'normal',
        category: data.category || 'meeting',
        tags: data.tags || [],
        metadata: data.metadata || {},
        createdBy
      }
    })

    return {
      id: event.id,
      companyId: event.companyId,
      title: event.title,
      description: event.description || undefined,
      startTime: event.startTime.toISOString(),
      endTime: event.endTime.toISOString(),
      allDay: event.allDay,
      location: event.location || undefined,
      attendees: event.attendees as any,
      reminders: event.reminders as any,
      recurrence: event.recurrence as any,
      status: event.status,
      visibility: event.visibility,
      priority: event.priority,
      category: event.category,
      tags: event.tags,
      metadata: event.metadata as any,
      externalId: event.externalId || undefined,
      externalSource: event.externalSource as any,
      createdBy: event.createdBy,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString()
    }
  }

  async getEvents(companyId: string, filters?: CalendarEventFilters): Promise<CalendarEvent[]> {
    const where: any = { companyId }

    if (filters) {
      if (filters.calendarId) where.calendarId = filters.calendarId
      if (filters.startDate) where.startTime = { ...where.startTime, gte: new Date(filters.startDate) }
      if (filters.endDate) where.endTime = { ...where.endTime, lte: new Date(filters.endDate) }
      if (filters.status?.length) where.status = { in: filters.status }
      if (filters.category) where.category = filters.category
      if (filters.tags?.length) where.tags = { hasSome: filters.tags }
      if (filters.attendeeEmail) {
        where.attendees = {
          some: { email: filters.attendeeEmail }
        }
      }
    }

    const events = await this.prisma.calendarEvent.findMany({
      where,
      orderBy: { startTime: 'asc' }
    })

    return events.map(event => ({
      id: event.id,
      companyId: event.companyId,
      title: event.title,
      description: event.description || undefined,
      startTime: event.startTime.toISOString(),
      endTime: event.endTime.toISOString(),
      allDay: event.allDay,
      location: event.location || undefined,
      attendees: event.attendees as any,
      reminders: event.reminders as any,
      recurrence: event.recurrence as any,
      status: event.status,
      visibility: event.visibility,
      priority: event.priority,
      category: event.category,
      tags: event.tags,
      metadata: event.metadata as any,
      externalId: event.externalId || undefined,
      externalSource: event.externalSource as any,
      createdBy: event.createdBy,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString()
    }))
  }

  async getEvent(id: string): Promise<CalendarEvent | null> {
    const event = await this.prisma.calendarEvent.findUnique({ where: { id } })

    if (!event) return null

    return {
      id: event.id,
      companyId: event.companyId,
      title: event.title,
      description: event.description || undefined,
      startTime: event.startTime.toISOString(),
      endTime: event.endTime.toISOString(),
      allDay: event.allDay,
      location: event.location || undefined,
      attendees: event.attendees as any,
      reminders: event.reminders as any,
      recurrence: event.recurrence as any,
      status: event.status,
      visibility: event.visibility,
      priority: event.priority,
      category: event.category,
      tags: event.tags,
      metadata: event.metadata as any,
      externalId: event.externalId || undefined,
      externalSource: event.externalSource as any,
      createdBy: event.createdBy,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString()
    }
  }

  async updateEvent(id: string, updates: UpdateCalendarEventRequest): Promise<CalendarEvent> {
    const updateData: any = { ...updates }
    if (updates.startTime) updateData.startTime = new Date(updates.startTime)
    if (updates.endTime) updateData.endTime = new Date(updates.endTime)

    const event = await this.prisma.calendarEvent.update({
      where: { id },
      data: updateData
    })

    return {
      id: event.id,
      companyId: event.companyId,
      title: event.title,
      description: event.description || undefined,
      startTime: event.startTime.toISOString(),
      endTime: event.endTime.toISOString(),
      allDay: event.allDay,
      location: event.location || undefined,
      attendees: event.attendees as any,
      reminders: event.reminders as any,
      recurrence: event.recurrence as any,
      status: event.status,
      visibility: event.visibility,
      priority: event.priority,
      category: event.category,
      tags: event.tags,
      metadata: event.metadata as any,
      externalId: event.externalId || undefined,
      externalSource: event.externalSource as any,
      createdBy: event.createdBy,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString()
    }
  }

  async deleteEvent(id: string): Promise<void> {
    await this.prisma.calendarEvent.delete({ where: { id } })
  }

  async duplicateEvent(id: string, newStartTime: string): Promise<CalendarEvent> {
    const originalEvent = await this.prisma.calendarEvent.findUnique({ where: { id } })
    if (!originalEvent) throw new Error('Event not found')

    const startTime = new Date(newStartTime)
    const duration = originalEvent.endTime.getTime() - originalEvent.startTime.getTime()
    const endTime = new Date(startTime.getTime() + duration)

    const duplicatedEvent = await this.prisma.calendarEvent.create({
      data: {
        ...originalEvent,
        id: undefined,
        startTime,
        endTime,
        title: `${originalEvent.title} (Copy)`,
        status: 'confirmed',
        attendees: originalEvent.attendees.map(attendee => ({
          ...attendee,
          status: 'pending'
        })),
        reminders: originalEvent.reminders.map(reminder => ({
          ...reminder,
          sentAt: undefined,
          status: 'pending'
        })),
        createdAt: undefined,
        updatedAt: undefined
      }
    })

    return {
      id: duplicatedEvent.id,
      companyId: duplicatedEvent.companyId,
      title: duplicatedEvent.title,
      description: duplicatedEvent.description || undefined,
      startTime: duplicatedEvent.startTime.toISOString(),
      endTime: duplicatedEvent.endTime.toISOString(),
      allDay: duplicatedEvent.allDay,
      location: duplicatedEvent.location || undefined,
      attendees: duplicatedEvent.attendees as any,
      reminders: duplicatedEvent.reminders as any,
      recurrence: duplicatedEvent.recurrence as any,
      status: duplicatedEvent.status,
      visibility: duplicatedEvent.visibility,
      priority: duplicatedEvent.priority,
      category: duplicatedEvent.category,
      tags: duplicatedEvent.tags,
      metadata: duplicatedEvent.metadata as any,
      externalId: duplicatedEvent.externalId || undefined,
      externalSource: duplicatedEvent.externalSource as any,
      createdBy: duplicatedEvent.createdBy,
      createdAt: duplicatedEvent.createdAt.toISOString(),
      updatedAt: duplicatedEvent.updatedAt.toISOString()
    }
  }

  // ============================================================================
  // CALENDAR MANAGEMENT
  // ============================================================================

  async createCalendar(companyId: string, data: CreateCalendarRequest): Promise<Calendar> {
    const calendar = await this.prisma.calendar.create({
      data: {
        companyId,
        name: data.name,
        description: data.description,
        color: data.color || '#3174ad',
        isPrimary: false,
        isVisible: true,
        timezone: data.timezone || 'Europe/London'
      }
    })

    return {
      id: calendar.id,
      companyId: calendar.companyId,
      name: calendar.name,
      description: calendar.description || undefined,
      color: calendar.color,
      isPrimary: calendar.isPrimary,
      isVisible: calendar.isVisible,
      timezone: calendar.timezone,
      externalId: calendar.externalId || undefined,
      externalSource: calendar.externalSource as any,
      syncEnabled: calendar.syncEnabled,
      lastSyncAt: calendar.lastSyncAt?.toISOString(),
      createdAt: calendar.createdAt.toISOString(),
      updatedAt: calendar.updatedAt.toISOString()
    }
  }

  async getCalendars(companyId: string): Promise<Calendar[]> {
    const calendars = await this.prisma.calendar.findMany({
      where: { companyId },
      orderBy: { isPrimary: 'desc' }
    })

    return calendars.map(calendar => ({
      id: calendar.id,
      companyId: calendar.companyId,
      name: calendar.name,
      description: calendar.description || undefined,
      color: calendar.color,
      isPrimary: calendar.isPrimary,
      isVisible: calendar.isVisible,
      timezone: calendar.timezone,
      externalId: calendar.externalId || undefined,
      externalSource: calendar.externalSource as any,
      syncEnabled: calendar.syncEnabled,
      lastSyncAt: calendar.lastSyncAt?.toISOString(),
      createdAt: calendar.createdAt.toISOString(),
      updatedAt: calendar.updatedAt.toISOString()
    }))
  }

  async updateCalendar(id: string, updates: Partial<Calendar>): Promise<Calendar> {
    const calendar = await this.prisma.calendar.update({
      where: { id },
      data: updates
    })

    return {
      id: calendar.id,
      companyId: calendar.companyId,
      name: calendar.name,
      description: calendar.description || undefined,
      color: calendar.color,
      isPrimary: calendar.isPrimary,
      isVisible: calendar.isVisible,
      timezone: calendar.timezone,
      externalId: calendar.externalId || undefined,
      externalSource: calendar.externalSource as any,
      syncEnabled: calendar.syncEnabled,
      lastSyncAt: calendar.lastSyncAt?.toISOString(),
      createdAt: calendar.createdAt.toISOString(),
      updatedAt: calendar.updatedAt.toISOString()
    }
  }

  async deleteCalendar(id: string): Promise<void> {
    await this.prisma.calendar.delete({ where: { id } })
  }

  // ============================================================================
  // AVAILABILITY MANAGEMENT
  // ============================================================================

  async setAvailability(userId: string, companyId: string | undefined, data: SetAvailabilityRequest): Promise<Availability> {
    const availability = await this.prisma.availability.upsert({
      where: {
        userId_dayOfWeek: {
          userId,
          dayOfWeek: data.dayOfWeek
        }
      },
      update: {
        startTime: data.startTime,
        endTime: data.endTime,
        isAvailable: data.isAvailable
      },
      create: {
        userId,
        companyId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        isAvailable: data.isAvailable
      }
    })

    return {
      id: availability.id,
      userId: availability.userId,
      companyId: availability.companyId || undefined,
      dayOfWeek: availability.dayOfWeek,
      startTime: availability.startTime,
      endTime: availability.endTime,
      isAvailable: availability.isAvailable,
      createdAt: availability.createdAt.toISOString(),
      updatedAt: availability.updatedAt.toISOString()
    }
  }

  async getAvailability(userId: string, startDate: string, endDate: string): Promise<Availability[]> {
    const availabilities = await this.prisma.availability.findMany({
      where: { userId }
    })

    return availabilities.map(availability => ({
      id: availability.id,
      userId: availability.userId,
      companyId: availability.companyId || undefined,
      dayOfWeek: availability.dayOfWeek,
      startTime: availability.startTime,
      endTime: availability.endTime,
      isAvailable: availability.isAvailable,
      createdAt: availability.createdAt.toISOString(),
      updatedAt: availability.updatedAt.toISOString()
    }))
  }

  async getUserAvailability(userId: string, date: string): Promise<TimeSlot[]> {
    const targetDate = new Date(date)
    const dayOfWeek = targetDate.getDay()

    const availability = await this.prisma.availability.findFirst({
      where: { userId, dayOfWeek }
    })

    if (!availability || !availability.isAvailable) {
      return []
    }

    // Get existing events for this user on this date
    const startOfDay = new Date(targetDate)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    const events = await this.prisma.calendarEvent.findMany({
      where: {
        OR: [
          { createdBy: userId },
          { attendees: { some: { email: userId } } } // Assuming email is used as user identifier
        ],
        startTime: { gte: startOfDay },
        endTime: { lte: endOfDay },
        status: { in: ['confirmed', 'tentative'] }
      }
    })

    const timeSlots: TimeSlot[] = []
    const [startHour, startMinute] = availability.startTime.split(':').map(Number)
    const [endHour, endMinute] = availability.endTime.split(':').map(Number)

    const startTime = startHour * 60 + startMinute
    const endTime = endHour * 60 + endMinute

    for (let minutes = startTime; minutes < endTime; minutes += 30) {
      const slotStart = new Date(targetDate)
      slotStart.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0)

      const slotEnd = new Date(slotStart)
      slotEnd.setMinutes(slotEnd.getMinutes() + 30)

      const conflictingEvent = events.find(event =>
        (event.startTime <= slotStart && event.endTime > slotStart) ||
        (event.startTime < slotEnd && event.endTime >= slotEnd) ||
        (event.startTime >= slotStart && event.endTime <= slotEnd)
      )

      timeSlots.push({
        startTime: slotStart.toISOString(),
        endTime: slotEnd.toISOString(),
        available: !conflictingEvent,
        eventTitle: conflictingEvent?.title,
        attendeeCount: conflictingEvent?.attendees?.length || 0
      })
    }

    return timeSlots
  }

  async findAvailableSlots(attendees: string[], duration: number, startDate: string, endDate: string): Promise<SchedulingSuggestion[]> {
    const suggestions: SchedulingSuggestion[] = []
    const start = new Date(startDate)
    const end = new Date(endDate)

    // Check each day in the range
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      // Skip weekends (assuming Monday-Friday work week)
      if (date.getDay() === 0 || date.getDay() === 6) continue

      // Get availability for all attendees
      const attendeeSlots = await Promise.all(
        attendees.map(attendee => this.getUserAvailability(attendee, date.toISOString().split('T')[0]))
      )

      // Find overlapping available slots
      const daySlots = attendeeSlots[0] || []
      const availableSlots = daySlots.filter(slot =>
        attendeeSlots.every(attendeeSlot =>
          attendeeSlot.some(attendeeSlotItem =>
            attendeeSlotItem.startTime === slot.startTime && attendeeSlotItem.available
          )
        )
      )

      // Group consecutive slots that can fit the meeting duration
      let consecutiveSlots: TimeSlot[] = []
      for (const slot of availableSlots) {
        if (consecutiveSlots.length === 0) {
          consecutiveSlots.push(slot)
        } else {
          const lastSlot = consecutiveSlots[consecutiveSlots.length - 1]
          const slotStart = new Date(slot.startTime)
          const lastEnd = new Date(lastSlot.endTime)

          if (slotStart.getTime() === lastEnd.getTime()) {
            consecutiveSlots.push(slot)
          } else {
            // Check if we have enough consecutive time
            if (consecutiveSlots.length >= Math.ceil(duration / 30)) {
              const suggestion: SchedulingSuggestion = {
                startTime: consecutiveSlots[0].startTime,
                endTime: consecutiveSlots[Math.ceil(duration / 30) - 1].endTime,
                score: this.calculateSlotScore(consecutiveSlots.slice(0, Math.ceil(duration / 30)), attendees.length),
                conflicts: [],
                availableAttendees: attendees.length,
                totalAttendees: attendees.length
              }
              suggestions.push(suggestion)
            }
            consecutiveSlots = [slot]
          }
        }
      }

      // Check remaining consecutive slots
      if (consecutiveSlots.length >= Math.ceil(duration / 30)) {
        const suggestion: SchedulingSuggestion = {
          startTime: consecutiveSlots[0].startTime,
          endTime: consecutiveSlots[Math.ceil(duration / 30) - 1].endTime,
          score: this.calculateSlotScore(consecutiveSlots.slice(0, Math.ceil(duration / 30)), attendees.length),
          conflicts: [],
          availableAttendees: attendees.length,
          totalAttendees: attendees.length
        }
        suggestions.push(suggestion)
      }
    }

    // Sort by score and return top suggestions
    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
  }

  // ============================================================================
  // MEETING ROOM MANAGEMENT
  // ============================================================================

  async createMeetingRoom(companyId: string, data: CreateMeetingRoomRequest): Promise<MeetingRoom> {
    const room = await this.prisma.meetingRoom.create({
      data: {
        companyId,
        name: data.name,
        location: data.location,
        capacity: data.capacity,
        amenities: data.amenities || [],
        isAvailable: true,
        bookingRules: data.bookingRules ? {
          maxDurationHours: data.bookingRules.maxDurationHours || 8,
          minAdvanceBookingHours: data.bookingRules.minAdvanceBookingHours || 1,
          maxAdvanceBookingDays: data.bookingRules.maxAdvanceBookingDays || 30,
          requiresApproval: data.bookingRules.requiresApproval || false,
          allowedUserRoles: data.bookingRules.allowedUserRoles || ['user']
        } : {
          maxDurationHours: 8,
          minAdvanceBookingHours: 1,
          maxAdvanceBookingDays: 30,
          requiresApproval: false,
          allowedUserRoles: ['user']
        }
      }
    })

    return {
      id: room.id,
      companyId: room.companyId,
      name: room.name,
      location: room.location,
      capacity: room.capacity,
      amenities: room.amenities,
      isAvailable: room.isAvailable,
      bookingRules: room.bookingRules as any,
      createdAt: room.createdAt.toISOString(),
      updatedAt: room.updatedAt.toISOString()
    }
  }

  async getMeetingRooms(companyId: string): Promise<MeetingRoom[]> {
    const rooms = await this.prisma.meetingRoom.findMany({
      where: { companyId, isAvailable: true }
    })

    return rooms.map(room => ({
      id: room.id,
      companyId: room.companyId,
      name: room.name,
      location: room.location,
      capacity: room.capacity,
      amenities: room.amenities,
      isAvailable: room.isAvailable,
      bookingRules: room.bookingRules as any,
      createdAt: room.createdAt.toISOString(),
      updatedAt: room.updatedAt.toISOString()
    }))
  }

  async bookMeetingRoom(roomId: string, startTime: string, endTime: string, bookedBy: string): Promise<boolean> {
    // Check if room is available during the requested time
    const conflictingEvent = await this.prisma.calendarEvent.findFirst({
      where: {
        location: roomId, // Assuming location field stores room ID for room bookings
        OR: [
          {
            AND: [
              { startTime: { lte: new Date(startTime) } },
              { endTime: { gt: new Date(startTime) } }
            ]
          },
          {
            AND: [
              { startTime: { lt: new Date(endTime) } },
              { endTime: { gte: new Date(endTime) } }
            ]
          }
        ],
        status: { in: ['confirmed', 'tentative'] }
      }
    })

    if (conflictingEvent) {
      return false
    }

    // Create booking event
    await this.prisma.calendarEvent.create({
      data: {
        companyId: 'system', // Would need to get from room
        calendarId: 'system',
        title: 'Meeting Room Booking',
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        location: roomId,
        attendees: [],
        reminders: [],
        status: 'confirmed',
        visibility: 'private',
        category: 'meeting',
        createdBy: bookedBy
      }
    })

    return true
  }

  async getRoomAvailability(roomId: string, date: string): Promise<TimeSlot[]> {
    const targetDate = new Date(date)
    const startOfDay = new Date(targetDate)
    startOfDay.setHours(9, 0, 0, 0) // Assume 9 AM start

    const endOfDay = new Date(targetDate)
    endOfDay.setHours(17, 0, 0, 0) // Assume 5 PM end

    // Get room bookings for the day
    const bookings = await this.prisma.calendarEvent.findMany({
      where: {
        location: roomId,
        startTime: { gte: startOfDay },
        endTime: { lte: endOfDay },
        status: { in: ['confirmed', 'tentative'] }
      }
    })

    const timeSlots: TimeSlot[] = []
    let currentTime = new Date(startOfDay)

    while (currentTime < endOfDay) {
      const slotEnd = new Date(currentTime)
      slotEnd.setMinutes(currentTime.getMinutes() + 30)

      const conflictingBooking = bookings.find(booking =>
        (booking.startTime <= currentTime && booking.endTime > currentTime) ||
        (booking.startTime < slotEnd && booking.endTime >= slotEnd)
      )

      timeSlots.push({
        startTime: currentTime.toISOString(),
        endTime: slotEnd.toISOString(),
        available: !conflictingBooking,
        eventTitle: conflictingBooking?.title
      })

      currentTime = slotEnd
    }

    return timeSlots
  }

  // ============================================================================
  // CALENDAR INTEGRATIONS
  // ============================================================================

  async connectCalendarIntegration(companyId: string, userId: string, provider: string, credentials: Record<string, any>): Promise<CalendarIntegration> {
    const integration = await this.prisma.calendarIntegration.create({
      data: {
        companyId,
        userId,
        provider: provider as any,
        accountEmail: credentials.email,
        accessToken: credentials.accessToken,
        refreshToken: credentials.refreshToken,
        tokenExpiresAt: credentials.tokenExpiresAt ? new Date(credentials.tokenExpiresAt) : undefined,
        calendarIds: credentials.calendarIds || [],
        syncEnabled: true,
        syncFrequency: 'daily'
      }
    })

    return {
      id: integration.id,
      companyId: integration.companyId,
      userId: integration.userId,
      provider: integration.provider,
      accountEmail: integration.accountEmail,
      accessToken: integration.accessToken,
      refreshToken: integration.refreshToken || undefined,
      tokenExpiresAt: integration.tokenExpiresAt?.toISOString(),
      calendarIds: integration.calendarIds,
      syncEnabled: integration.syncEnabled,
      syncFrequency: integration.syncFrequency,
      lastSyncAt: integration.lastSyncAt?.toISOString(),
      syncStatus: integration.syncStatus,
      errorMessage: integration.errorMessage || undefined,
      createdAt: integration.createdAt.toISOString(),
      updatedAt: integration.updatedAt.toISOString()
    }
  }

  async syncExternalCalendar(integrationId: string): Promise<void> {
    // Mock sync implementation
    await this.prisma.calendarIntegration.update({
      where: { id: integrationId },
      data: {
        lastSyncAt: new Date(),
        syncStatus: 'active'
      }
    })
  }

  async getCalendarIntegrations(companyId: string, userId?: string): Promise<CalendarIntegration[]> {
    const where: any = { companyId }
    if (userId) where.userId = userId

    const integrations = await this.prisma.calendarIntegration.findMany({
      where
    })

    return integrations.map(integration => ({
      id: integration.id,
      companyId: integration.companyId,
      userId: integration.userId,
      provider: integration.provider,
      accountEmail: integration.accountEmail,
      accessToken: integration.accessToken,
      refreshToken: integration.refreshToken || undefined,
      tokenExpiresAt: integration.tokenExpiresAt?.toISOString(),
      calendarIds: integration.calendarIds,
      syncEnabled: integration.syncEnabled,
      syncFrequency: integration.syncFrequency,
      lastSyncAt: integration.lastSyncAt?.toISOString(),
      syncStatus: integration.syncStatus,
      errorMessage: integration.errorMessage || undefined,
      createdAt: integration.createdAt.toISOString(),
      updatedAt: integration.updatedAt.toISOString()
    }))
  }

  // ============================================================================
  // SCHEDULING & SMART FEATURES
  // ============================================================================

  async scheduleMeeting(request: any, organizerId: string): Promise<SchedulingSuggestion[]> {
    return this.findAvailableSlots(
      request.attendees,
      request.duration,
      request.preferredTimeSlots[0]?.start || new Date().toISOString(),
      request.preferredTimeSlots[0]?.end || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    )
  }

  async rescheduleEvent(eventId: string, newStartTime: string, newEndTime?: string): Promise<CalendarEvent> {
    const event = await this.prisma.calendarEvent.findUnique({ where: { id: eventId } })
    if (!event) throw new Error('Event not found')

    const startTime = new Date(newStartTime)
    const duration = event.endTime.getTime() - event.startTime.getTime()
    const endTime = newEndTime ? new Date(newEndTime) : new Date(startTime.getTime() + duration)

    return this.updateEvent(eventId, {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    })
  }

  // ============================================================================
  // SETTINGS
  // ============================================================================

  async getCalendarSettings(companyId: string): Promise<any | null> {
    const settings = await this.prisma.calendarSettings.findUnique({
      where: { companyId }
    })

    if (!settings) return null

    return {
      id: settings.id,
      companyId: settings.companyId,
      defaultTimezone: settings.defaultTimezone,
      workingHours: settings.workingHours as any,
      defaultEventDuration: settings.defaultEventDuration,
      defaultReminderMinutes: settings.defaultReminderMinutes,
      autoDeclineOutsideWorkingHours: settings.autoDeclineOutsideWorkingHours,
      allowDoubleBooking: settings.allowDoubleBooking,
      requireLocation: settings.requireLocation,
      defaultVisibility: settings.defaultVisibility,
      meetingRoomBookingEnabled: settings.meetingRoomBookingEnabled,
      createdAt: settings.createdAt.toISOString(),
      updatedAt: settings.updatedAt.toISOString()
    }
  }

  async updateCalendarSettings(companyId: string, updates: UpdateCalendarSettingsRequest): Promise<any> {
    const settings = await this.prisma.calendarSettings.upsert({
      where: { companyId },
      update: updates,
      create: {
        companyId,
        defaultTimezone: 'Europe/London',
        workingHours: {
          start: '09:00',
          end: '17:00',
          daysOfWeek: [1, 2, 3, 4, 5] // Monday to Friday
        },
        defaultEventDuration: 60,
        defaultReminderMinutes: 15,
        autoDeclineOutsideWorkingHours: false,
        allowDoubleBooking: false,
        requireLocation: false,
        defaultVisibility: 'public',
        meetingRoomBookingEnabled: true
      }
    })

    return {
      id: settings.id,
      companyId: settings.companyId,
      defaultTimezone: settings.defaultTimezone,
      workingHours: settings.workingHours as any,
      defaultEventDuration: settings.defaultEventDuration,
      defaultReminderMinutes: settings.defaultReminderMinutes,
      autoDeclineOutsideWorkingHours: settings.autoDeclineOutsideWorkingHours,
      allowDoubleBooking: settings.allowDoubleBooking,
      requireLocation: settings.requireLocation,
      defaultVisibility: settings.defaultVisibility,
      meetingRoomBookingEnabled: settings.meetingRoomBookingEnabled,
      createdAt: settings.createdAt.toISOString(),
      updatedAt: settings.updatedAt.toISOString()
    }
  }

  // ============================================================================
  // ANALYTICS & REPORTING
  // ============================================================================

  async getCalendarAnalytics(companyId: string, period: { start: string; end: string }): Promise<CalendarAnalytics> {
    const startDate = new Date(period.start)
    const endDate = new Date(period.end)

    const events = await this.prisma.calendarEvent.findMany({
      where: {
        companyId,
        startTime: { gte: startDate },
        endTime: { lte: endDate }
      }
    })

    const totalEvents = events.length
    const totalMeetingHours = events.reduce((total, event) => {
      const duration = (event.endTime.getTime() - event.startTime.getTime()) / (1000 * 60 * 60)
      return total + duration
    }, 0)

    const averageMeetingDuration = totalEvents > 0 ? totalMeetingHours / totalEvents : 0

    // Calculate most active day
    const dayCount: Record<number, number> = {}
    events.forEach(event => {
      const day = event.startTime.getDay()
      dayCount[day] = (dayCount[day] || 0) + 1
    })
    const mostActiveDay = Object.entries(dayCount).reduce((a, b) => dayCount[a[0]] > dayCount[b[0]] ? a : b, ['0', '0'])[0]

    // Calculate most active hour
    const hourCount: Record<number, number> = {}
    events.forEach(event => {
      const hour = event.startTime.getHours()
      hourCount[hour] = (hourCount[hour] || 0) + 1
    })
    const mostActiveHour = Object.entries(hourCount).reduce((a, b) => hourCount[a[0]] > hourCount[b[0]] ? a : b, ['0', '0'])[0]

    return {
      totalEvents,
      totalMeetingHours,
      averageMeetingDuration,
      mostActiveDay: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][parseInt(mostActiveDay)],
      mostActiveHour: parseInt(mostActiveHour),
      topAttendees: [], // Would need to calculate from attendee data
      meetingRoomUtilization: [], // Would need to calculate from room booking data
      period
    }
  }

  async exportCalendarEvents(companyId: string, format: 'ics' | 'csv', filters?: CalendarEventFilters): Promise<string> {
    const events = await this.getEvents(companyId, filters)

    if (format === 'csv') {
      const csvHeader = 'Title,Start Time,End Time,Location,Status,Attendees\n'
      const csvRows = events.map(event =>
        `"${event.title}","${event.startTime}","${event.endTime}","${event.location || ''}","${event.status}","${event.attendees?.length || 0}"`
      ).join('\n')
      return csvHeader + csvRows
    }

    // ICS format would be more complex - returning simple placeholder
    return `BEGIN:VCALENDAR\n${events.map(event =>
      `BEGIN:VEVENT\nSUMMARY:${event.title}\nDTSTART:${event.startTime.replace(/[-:]/g, '')}\nDTEND:${event.endTime.replace(/[-:]/g, '')}\nEND:VEVENT`
    ).join('\n')}\nEND:VCALENDAR`
  }

  // ============================================================================
  // NOTIFICATIONS & REMINDERS
  // ============================================================================

  async sendEventReminders(): Promise<void> {
    // Find events with upcoming reminders
    const now = new Date()
    const reminderWindow = new Date(now.getTime() + 60 * 60 * 1000) // Next hour

    const events = await this.prisma.calendarEvent.findMany({
      where: {
        startTime: { gte: now, lte: reminderWindow },
        reminders: { some: { sentAt: null } }
      }
    })

    // Mock reminder sending
    for (const event of events) {
      console.log(`Sending reminder for event: ${event.title}`)
      // Update reminder status
      await this.prisma.calendarEvent.update({
        where: { id: event.id },
        data: {
          reminders: event.reminders.map(reminder => ({
            ...reminder,
            sentAt: new Date(),
            status: 'sent'
          }))
        }
      })
    }
  }

  async sendEventInvitations(eventId: string): Promise<void> {
    const event = await this.getEvent(eventId)
    if (!event || !event.attendees?.length) return

    // Mock invitation sending
    console.log(`Sending invitations for event: ${event.title} to ${event.attendees.length} attendees`)
  }

  async sendEventUpdates(eventId: string): Promise<void> {
    const event = await this.getEvent(eventId)
    if (!event || !event.attendees?.length) return

    // Mock update sending
    console.log(`Sending updates for event: ${event.title}`)
  }

  // ============================================================================
  // RECURRING EVENTS
  // ============================================================================

  async createRecurringEvent(companyId: string, data: CreateCalendarEventRequest, recurrence: any, createdBy: string): Promise<CalendarEvent[]> {
    const events: CalendarEvent[] = []
    const startDate = new Date(data.startTime)
    const endDate = startDate // Will be calculated for each instance

    // Generate recurring instances (simplified - only handles basic recurrence)
    for (let i = 0; i < (recurrence.count || 10); i++) {
      const instanceStart = new Date(startDate)
      const instanceEnd = new Date(data.endTime)

      if (recurrence.frequency === 'weekly') {
        instanceStart.setDate(startDate.getDate() + (i * 7 * (recurrence.interval || 1)))
        instanceEnd.setDate(instanceEnd.getDate() + (i * 7 * (recurrence.interval || 1)))
      } else if (recurrence.frequency === 'monthly') {
        instanceStart.setMonth(startDate.getMonth() + (i * (recurrence.interval || 1)))
        instanceEnd.setMonth(instanceEnd.getMonth() + (i * (recurrence.interval || 1)))
      }

      const instanceData = {
        ...data,
        startTime: instanceStart.toISOString(),
        endTime: instanceEnd.toISOString()
      }

      const event = await this.createEvent(companyId, instanceData, createdBy)
      events.push(event)

      // Break if we've reached the recurrence end date
      if (recurrence.endDate && instanceStart > new Date(recurrence.endDate)) break
    }

    return events
  }

  async updateRecurringEvent(seriesId: string, updates: UpdateCalendarEventRequest, applyTo: 'single' | 'future' | 'all'): Promise<CalendarEvent[]> {
    // Simplified implementation - would need to handle series identification
    const event = await this.getEvent(seriesId)
    if (!event) throw new Error('Event not found')

    const updatedEvent = await this.updateEvent(seriesId, updates)
    return [updatedEvent]
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private async getDefaultCalendarId(companyId: string): Promise<string> {
    const calendar = await this.prisma.calendar.findFirst({
      where: { companyId, isPrimary: true }
    })

    if (calendar) return calendar.id

    // Create default calendar if none exists
    const defaultCalendar = await this.createCalendar(companyId, {
      name: 'Primary Calendar',
      description: 'Default company calendar'
    })

    return defaultCalendar.id
  }

  private calculateSlotScore(slots: TimeSlot[], totalAttendees: number): number {
    // Simple scoring based on time preference and availability
    const now = new Date()
    const slotStart = new Date(slots[0].startTime)
    const hoursFromNow = (slotStart.getTime() - now.getTime()) / (1000 * 60 * 60)

    // Prefer slots 1-4 hours from now, then 4-24 hours, etc.
    let timeScore = 0
    if (hoursFromNow >= 1 && hoursFromNow <= 4) timeScore = 100
    else if (hoursFromNow >= 4 && hoursFromNow <= 24) timeScore = 80
    else if (hoursFromNow >= 24 && hoursFromNow <= 72) timeScore = 60
    else timeScore = 40

    return timeScore
  }
}