import * as Sentry from '@sentry/node'
import { nodeProfilingIntegration } from '@sentry/profiling-node'

export function initSentry(dsn: string, environment: string = 'development') {
  Sentry.init({
    dsn,
    environment,
    integrations: [
      // Add profiling integration
      nodeProfilingIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
    // Release Health
    enableTracing: true,
    // Set profiling sample rate
    profilesSampleRate: 1.0,
    // Error tracking
    beforeSend(event, hint) {
      // Filter out sensitive information
      if (event.request) {
        if (event.request.data) {
          // Remove sensitive fields from request data
          const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization']
          if (typeof event.request.data === 'object') {
            Object.keys(event.request.data).forEach(key => {
              if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
                event.request.data[key] = '[FILTERED]'
              }
            })
          }
        }
      }
      return event
    }
  })

  console.log(`Sentry initialized for environment: ${environment}`)
}

export function captureException(error: Error, context?: Record<string, any>) {
  Sentry.withScope(scope => {
    if (context) {
      Object.keys(context).forEach(key => {
        scope.setTag(key, context[key])
      })
    }
    Sentry.captureException(error)
  })
}

export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>) {
  Sentry.withScope(scope => {
    scope.setLevel(level)
    if (context) {
      Object.keys(context).forEach(key => {
        scope.setTag(key, context[key])
      })
    }
    Sentry.captureMessage(message)
  })
}

export function setUser(user: { id: string; email?: string; username?: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username
  })
}

export function setTags(tags: Record<string, string>) {
  Object.keys(tags).forEach(key => {
    Sentry.setTag(key, tags[key])
  })
}

export function addBreadcrumb(breadcrumb: {
  message: string
  level?: Sentry.SeverityLevel
  category?: string
  data?: Record<string, any>
}) {
  Sentry.addBreadcrumb({
    message: breadcrumb.message,
    level: breadcrumb.level || 'info',
    category: breadcrumb.category || 'custom',
    data: breadcrumb.data
  })
}

// Graceful shutdown
export function closeSentry(timeout: number = 2000) {
  return Sentry.close(timeout)
}