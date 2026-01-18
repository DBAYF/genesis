export interface CalendarEvent {
  id: string
  companyId: string
  title: string
  description?: string
  startTime: string
  endTime: string
  allDay: boolean
  location?: string
  attendees: Attendee[]
  reminders: Reminder[]
  recurrence?: RecurrenceRule
  status: 'confirmed' | 'tentative' | 'cancelled'
  visibility: 'public' | 'private' | 'confidential'
  priority: 'low' | 'normal' | 'high'
  category: string
  tags: string[]
  metadata: Record<string, any>
  externalId?: string // For synced external calendar events
  externalSource?: 'google' | 'outlook' | 'apple' | 'other'
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface Attendee {
  id: string
  name: string
  email: string
  status: 'pending' | 'accepted' | 'declined' | 'tentative'
  role: 'required' | 'optional' | 'resource'
  responseTime?: string
}

export interface Reminder {
  id: string
  method: 'email' | 'popup' | 'sms'
  minutes: number
  sentAt?: string
  status: 'pending' | 'sent' | 'failed'
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number
  endDate?: string
  count?: number
  daysOfWeek?: number[] // 0 = Sunday, 1 = Monday, etc.
  daysOfMonth?: number[]
  monthsOfYear?: number[]
}

export interface Calendar {
  id: string
  companyId: string
  name: string
  description?: string
  color: string
  isPrimary: boolean
  isVisible: boolean
  timezone: string
  externalId?: string
  externalSource?: 'google' | 'outlook' | 'apple'
  syncEnabled: boolean
  lastSyncAt?: string
  createdAt: string
  updatedAt: string
}

export interface Availability {
  id: string
  userId: string
  companyId?: string
  dayOfWeek: number // 0 = Sunday, 1 = Monday, etc.
  startTime: string // HH:MM format
  endTime: string // HH:MM format
  isAvailable: boolean
  createdAt: string
  updatedAt: string
}

export interface TimeSlot {
  startTime: string
  endTime: string
  available: boolean
  eventTitle?: string
  attendeeCount?: number
}

export interface MeetingRoom {
  id: string
  companyId: string
  name: string
  location: string
  capacity: number
  amenities: string[]
  isAvailable: boolean
  bookingRules: BookingRule[]
  createdAt: string
  updatedAt: string
}

export interface BookingRule {
  id: string
  maxDurationHours: number
  minAdvanceBookingHours: number
  maxAdvanceBookingDays: number
  requiresApproval: boolean
  allowedUserRoles: string[]
}

export interface CalendarIntegration {
  id: string
  companyId: string
  userId: string
  provider: 'google' | 'outlook' | 'apple'
  accountEmail: string
  accessToken: string
  refreshToken?: string
  tokenExpiresAt?: string
  calendarIds: string[]
  syncEnabled: boolean
  syncFrequency: 'manual' | 'hourly' | 'daily'
  lastSyncAt?: string
  syncStatus: 'active' | 'error' | 'disabled'
  errorMessage?: string
  createdAt: string
  updatedAt: string
}

export interface CalendarSettings {
  id: string
  companyId: string
  defaultTimezone: string
  workingHours: {
    start: string
    end: string
    daysOfWeek: number[]
  }
  defaultEventDuration: number // minutes
  defaultReminderMinutes: number
  autoDeclineOutsideWorkingHours: boolean
  allowDoubleBooking: boolean
  requireLocation: boolean
  defaultVisibility: 'public' | 'private'
  meetingRoomBookingEnabled: boolean
  createdAt: string
  updatedAt: string
}

export interface SchedulingRequest {
  title: string
  duration: number // minutes
  attendees: string[] // email addresses
  preferredTimeSlots: {
    start: string
    end: string
  }[]
  location?: string
  description?: string
  priority?: 'low' | 'normal' | 'high'
}

export interface SchedulingSuggestion {
  startTime: string
  endTime: string
  score: number // 0-100, higher is better
  conflicts: string[]
  availableAttendees: number
  totalAttendees: number
}

export interface CalendarAnalytics {
  totalEvents: number
  totalMeetingHours: number
  averageMeetingDuration: number
  mostActiveDay: string
  mostActiveHour: number
  topAttendees: { email: string; meetings: number }[]
  meetingRoomUtilization: { roomId: string; utilization: number }[]
  period: {
    start: string
    end: string
  }
}

// Request/Response Types
export interface CreateCalendarEventRequest {
  calendarId?: string
  title: string
  description?: string
  startTime: string
  endTime: string
  allDay?: boolean
  location?: string
  attendees?: {
    name: string
    email: string
    role?: 'required' | 'optional' | 'resource'
  }[]
  reminders?: { method: 'email' | 'popup' | 'sms'; minutes: number }[]
  recurrence?: RecurrenceRule
  visibility?: 'public' | 'private' | 'confidential'
  priority?: 'low' | 'normal' | 'high'
  category?: string
  tags?: string[]
  metadata?: Record<string, any>
}

export interface UpdateCalendarEventRequest {
  title?: string
  description?: string
  startTime?: string
  endTime?: string
  allDay?: boolean
  location?: string
  attendees?: Attendee[]
  reminders?: Reminder[]
  recurrence?: RecurrenceRule
  status?: 'confirmed' | 'tentative' | 'cancelled'
  visibility?: 'public' | 'private' | 'confidential'
  priority?: 'low' | 'normal' | 'high'
  category?: string
  tags?: string[]
  metadata?: Record<string, any>
}

export interface CreateCalendarRequest {
  name: string
  description?: string
  color?: string
  timezone?: string
}

export interface SetAvailabilityRequest {
  dayOfWeek: number
  startTime: string
  endTime: string
  isAvailable: boolean
}

export interface CreateMeetingRoomRequest {
  name: string
  location: string
  capacity: number
  amenities?: string[]
  bookingRules?: {
    maxDurationHours?: number
    minAdvanceBookingHours?: number
    maxAdvanceBookingDays?: number
    requiresApproval?: boolean
    allowedUserRoles?: string[]
  }
}

export interface UpdateCalendarSettingsRequest {
  defaultTimezone?: string
  workingHours?: {
    start: string
    end: string
    daysOfWeek: number[]
  }
  defaultEventDuration?: number
  defaultReminderMinutes?: number
  autoDeclineOutsideWorkingHours?: boolean
  allowDoubleBooking?: boolean
  requireLocation?: boolean
  defaultVisibility?: 'public' | 'private'
  meetingRoomBookingEnabled?: boolean
}

export interface CalendarEventFilters {
  calendarId?: string
  startDate?: string
  endDate?: string
  status?: CalendarEvent['status'][]
  category?: string
  tags?: string[]
  attendeeEmail?: string
}

// Service Interface
export interface CalendarService {
  // Event Management
  createEvent(companyId: string, data: CreateCalendarEventRequest, createdBy: string): Promise<CalendarEvent>
  getEvents(companyId: string, filters?: CalendarEventFilters): Promise<CalendarEvent[]>
  getEvent(id: string): Promise<CalendarEvent | null>
  updateEvent(id: string, updates: UpdateCalendarEventRequest): Promise<CalendarEvent>
  deleteEvent(id: string): Promise<void>
  duplicateEvent(id: string, newStartTime: string): Promise<CalendarEvent>

  // Calendar Management
  createCalendar(companyId: string, data: CreateCalendarRequest): Promise<Calendar>
  getCalendars(companyId: string): Promise<Calendar[]>
  updateCalendar(id: string, updates: Partial<Calendar>): Promise<Calendar>
  deleteCalendar(id: string): Promise<void>

  // Availability Management
  setAvailability(userId: string, companyId: string | undefined, data: SetAvailabilityRequest): Promise<Availability>
  getAvailability(userId: string, startDate: string, endDate: string): Promise<Availability[]>
  getUserAvailability(userId: string, date: string): Promise<TimeSlot[]>
  findAvailableSlots(attendees: string[], duration: number, startDate: string, endDate: string): Promise<SchedulingSuggestion[]>

  // Meeting Rooms
  createMeetingRoom(companyId: string, data: CreateMeetingRoomRequest): Promise<MeetingRoom>
  getMeetingRooms(companyId: string): Promise<MeetingRoom[]>
  bookMeetingRoom(roomId: string, startTime: string, endTime: string, bookedBy: string): Promise<boolean>
  getRoomAvailability(roomId: string, date: string): Promise<TimeSlot[]>

  // Integrations
  connectCalendarIntegration(companyId: string, userId: string, provider: string, credentials: Record<string, any>): Promise<CalendarIntegration>
  syncExternalCalendar(integrationId: string): Promise<void>
  getCalendarIntegrations(companyId: string, userId?: string): Promise<CalendarIntegration[]>

  // Scheduling
  scheduleMeeting(request: SchedulingRequest, organizerId: string): Promise<SchedulingSuggestion[]>
  rescheduleEvent(eventId: string, newStartTime: string, newEndTime?: string): Promise<CalendarEvent>

  // Settings
  getCalendarSettings(companyId: string): Promise<CalendarSettings | null>
  updateCalendarSettings(companyId: string, updates: UpdateCalendarSettingsRequest): Promise<CalendarSettings>

  // Analytics & Reporting
  getCalendarAnalytics(companyId: string, period: { start: string; end: string }): Promise<CalendarAnalytics>
  exportCalendarEvents(companyId: string, format: 'ics' | 'csv', filters?: CalendarEventFilters): Promise<string>

  // Notifications & Reminders
  sendEventReminders(): Promise<void>
  sendEventInvitations(eventId: string): Promise<void>
  sendEventUpdates(eventId: string): Promise<void>

  // Recurring Events
  createRecurringEvent(companyId: string, data: CreateCalendarEventRequest, recurrence: RecurrenceRule, createdBy: string): Promise<CalendarEvent[]>
  updateRecurringEvent(seriesId: string, updates: UpdateCalendarEventRequest, applyTo: 'single' | 'future' | 'all'): Promise<CalendarEvent[]>
}