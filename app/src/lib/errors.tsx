// ============================================================================
// GENESIS ENGINE - ERROR HANDLING SYSTEM
// ============================================================================

import React from 'react'

// ============================================================================
// ERROR CODES (Frontend Version)
// ============================================================================

export const ERROR_CODES = {
  // Authentication (1xxx)
  AUTH_INVALID_CREDENTIALS: { code: 'AUTH_1001', status: 401, message: 'Invalid email or password' },
  AUTH_TOKEN_EXPIRED: { code: 'AUTH_1002', status: 401, message: 'Token has expired' },
  AUTH_TOKEN_INVALID: { code: 'AUTH_1003', status: 401, message: 'Invalid token' },
  AUTH_SESSION_EXPIRED: { code: 'AUTH_1004', status: 401, message: 'Session has expired' },
  AUTH_MFA_REQUIRED: { code: 'AUTH_1005', status: 401, message: 'MFA verification required' },
  AUTH_MFA_INVALID: { code: 'AUTH_1006', status: 401, message: 'Invalid MFA code' },
  AUTH_ACCOUNT_LOCKED: { code: 'AUTH_1007', status: 403, message: 'Account is locked' },
  AUTH_ACCOUNT_SUSPENDED: { code: 'AUTH_1008', status: 403, message: 'Account is suspended' },
  AUTH_EMAIL_NOT_VERIFIED: { code: 'AUTH_1009', status: 403, message: 'Email not verified' },
  AUTH_PASSWORD_TOO_WEAK: { code: 'AUTH_1010', status: 400, message: 'Password does not meet requirements' },

  // Validation (2xxx)
  VALIDATION_FAILED: { code: 'VAL_2001', status: 400, message: 'Validation failed' },
  VALIDATION_REQUIRED_FIELD: { code: 'VAL_2002', status: 400, message: 'Required field missing' },
  VALIDATION_INVALID_FORMAT: { code: 'VAL_2003', status: 400, message: 'Invalid format' },
  VALIDATION_OUT_OF_RANGE: { code: 'VAL_2004', status: 400, message: 'Value out of allowed range' },
  VALIDATION_DUPLICATE: { code: 'VAL_2005', status: 409, message: 'Duplicate entry' },
  VALIDATION_INVALID_ENUM: { code: 'VAL_2006', status: 400, message: 'Invalid enum value' },

  // Resources (3xxx)
  RESOURCE_NOT_FOUND: { code: 'RES_3001', status: 404, message: 'Resource not found' },
  RESOURCE_ALREADY_EXISTS: { code: 'RES_3002', status: 409, message: 'Resource already exists' },
  RESOURCE_DELETED: { code: 'RES_3003', status: 410, message: 'Resource has been deleted' },
  RESOURCE_LOCKED: { code: 'RES_3004', status: 423, message: 'Resource is locked' },

  // Permissions (4xxx)
  PERMISSION_DENIED: { code: 'PERM_4001', status: 403, message: 'Permission denied' },
  PERMISSION_ROLE_REQUIRED: { code: 'PERM_4002', status: 403, message: 'Insufficient role' },
  PERMISSION_COMPANY_ACCESS: { code: 'PERM_4003', status: 403, message: 'No access to this company' },
  PERMISSION_FEATURE_DISABLED: { code: 'PERM_4004', status: 403, message: 'Feature not enabled' },
  PERMISSION_SUBSCRIPTION_REQUIRED: { code: 'PERM_4005', status: 402, message: 'Subscription required' },

  // External Services (5xxx)
  EXTERNAL_SERVICE_ERROR: { code: 'EXT_5001', status: 502, message: 'External service error' },
  EXTERNAL_SERVICE_TIMEOUT: { code: 'EXT_5002', status: 504, message: 'External service timeout' },
  EXTERNAL_SERVICE_UNAVAILABLE: { code: 'EXT_5003', status: 503, message: 'External service unavailable' },
  COMPANIES_HOUSE_ERROR: { code: 'EXT_5010', status: 502, message: 'Companies House API error' },
  HMRC_ERROR: { code: 'EXT_5011', status: 502, message: 'HMRC API error' },
  STRIPE_ERROR: { code: 'EXT_5020', status: 502, message: 'Payment processing error' },
  TWILIO_ERROR: { code: 'EXT_5030', status: 502, message: 'Messaging service error' },
  AI_SERVICE_ERROR: { code: 'EXT_5040', status: 502, message: 'AI service error' },

  // Rate Limiting (6xxx)
  RATE_LIMIT_EXCEEDED: { code: 'RATE_6001', status: 429, message: 'Rate limit exceeded' },
  QUOTA_EXCEEDED: { code: 'RATE_6002', status: 429, message: 'Quota exceeded' },

  // Business Logic (7xxx)
  BUSINESS_INVALID_STATE: { code: 'BUS_7001', status: 422, message: 'Invalid state for this operation' },
  BUSINESS_PREREQUISITE_MISSING: { code: 'BUS_7002', status: 422, message: 'Prerequisite not met' },
  BUSINESS_LIMIT_REACHED: { code: 'BUS_7003', status: 422, message: 'Limit reached' },
  BUSINESS_ELIGIBILITY_FAILED: { code: 'BUS_7004', status: 422, message: 'Eligibility check failed' },
  BUSINESS_HANDOFF_REQUIRED: { code: 'BUS_7005', status: 422, message: 'Professional assistance required' },

  // System (9xxx)
  INTERNAL_ERROR: { code: 'SYS_9001', status: 500, message: 'Internal server error' },
  DATABASE_ERROR: { code: 'SYS_9002', status: 500, message: 'Database error' },
  CONFIGURATION_ERROR: { code: 'SYS_9003', status: 500, message: 'Configuration error' },
  MAINTENANCE_MODE: { code: 'SYS_9004', status: 503, message: 'System under maintenance' },
} as const

// ============================================================================
// CUSTOM ERROR CLASSES
// ============================================================================

export class AppError extends Error {
  public readonly code: string
  public readonly statusCode: number
  public readonly details?: any
  public readonly field?: string
  public readonly requestId?: string

  constructor(
    code: keyof typeof ERROR_CODES,
    message?: string,
    details?: any,
    field?: string,
    requestId?: string
  ) {
    const errorConfig = ERROR_CODES[code]
    super(message || errorConfig.message)
    this.name = 'AppError'
    this.code = errorConfig.code
    this.statusCode = errorConfig.status
    this.details = details
    this.field = field
    this.requestId = requestId
  }
}

// Specific error classes for better type safety
export class ValidationError extends AppError {
  constructor(field?: string, message?: string, details?: any) {
    super('VALIDATION_FAILED', message, details, field)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(code: keyof typeof ERROR_CODES = 'AUTH_INVALID_CREDENTIALS', message?: string) {
    super(code, message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends AppError {
  constructor(code: keyof typeof ERROR_CODES = 'PERMISSION_DENIED', message?: string) {
    super(code, message)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super('RESOURCE_NOT_FOUND', `${resource} not found`)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super('RESOURCE_ALREADY_EXISTS', message)
    this.name = 'ConflictError'
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, details?: any) {
    super('EXTERNAL_SERVICE_ERROR', `${service} service error`, details)
    this.name = 'ExternalServiceError'
  }
}

export class RateLimitError extends AppError {
  constructor(retryAfter?: number) {
    super('RATE_LIMIT_EXCEEDED', 'Rate limit exceeded', { retryAfter })
    this.name = 'RateLimitError'
  }
}

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

export function isAppError(error: any): error is AppError {
  return error instanceof AppError
}

export function getErrorMessage(error: any): string {
  if (isAppError(error)) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}

export function getErrorCode(error: any): string {
  if (isAppError(error)) {
    return error.code
  }
  return 'UNKNOWN_ERROR'
}

export function getErrorStatus(error: any): number {
  if (isAppError(error)) {
    return error.statusCode
  }
  return 500
}

// ============================================================================
// ERROR BOUNDARY COMPONENT
// ============================================================================

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo })

    // Log error
    console.error('Error Boundary caught an error:', error, errorInfo)

    // Call onError callback if provided
    this.props.onError?.(error, errorInfo)

    // In production, you might want to send this to an error reporting service
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      ;(window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack,
          },
        },
      })
    }
  }

  retry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return React.createElement(FallbackComponent, {
          error: this.state.error!,
          retry: this.retry,
        })
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="max-w-md w-full bg-card rounded-lg p-6 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={this.retry}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Try Again
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm">Error Details</summary>
                <pre className="text-xs mt-2 p-2 bg-muted rounded overflow-auto">
                  {this.state.error.message}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// ============================================================================
// API ERROR HANDLER
// ============================================================================

export function handleApiError(error: any): AppError {
  // Handle fetch errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return new ExternalServiceError('Network')
  }

  // Handle HTTP errors with error response
  if (error.status && error.response) {
    const status = error.status
    const responseData = error.response

    // Try to extract error code and message from response
    if (responseData?.error?.code) {
      // Find matching error code
      const errorEntry = Object.entries(ERROR_CODES).find(
        ([, config]) => config.code === responseData.error.code
      )

      if (errorEntry) {
        const [errorKey] = errorEntry
        return new AppError(errorKey as keyof typeof ERROR_CODES, responseData.error.message)
      }
    }

    // Fallback to status-based errors
    switch (status) {
      case 400:
        return new ValidationError(undefined, responseData?.error?.message)
      case 401:
        return new AuthenticationError('AUTH_TOKEN_INVALID', responseData?.error?.message)
      case 403:
        return new AuthorizationError('PERMISSION_DENIED', responseData?.error?.message)
      case 404:
        return new NotFoundError()
      case 409:
        return new ConflictError(responseData?.error?.message)
      case 429:
        return new RateLimitError(responseData?.error?.details?.retryAfter)
      case 502:
      case 503:
      case 504:
        return new ExternalServiceError('External Service', responseData)
      default:
        return new AppError('INTERNAL_ERROR', responseData?.error?.message)
    }
  }

  // Handle network errors
  if (!navigator.onLine) {
    return new ExternalServiceError('Network', 'No internet connection')
  }

  // Default to internal error
  return new AppError('INTERNAL_ERROR', error.message || 'An unexpected error occurred')
}

// ============================================================================
// HOOK FOR ERROR HANDLING
// ============================================================================

import { useState, useCallback } from 'react'

export function useErrorHandler() {
  const [error, setError] = useState<AppError | null>(null)

  const handleError = useCallback((error: any) => {
    const appError = error instanceof AppError ? error : handleApiError(error)
    setError(appError)

    // Log error for monitoring
    console.error('Error handled:', appError)

    // In production, send to error reporting service
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      ;(window as any).Sentry.captureException(appError)
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    error,
    handleError,
    clearError,
    hasError: error !== null,
  }
}

// ============================================================================
// REACT QUERY ERROR HANDLER
// ============================================================================

export function createQueryErrorHandler(onError?: (error: AppError) => void) {
  return (error: any) => {
    const appError = handleApiError(error)

    // Handle authentication errors by redirecting to login
    if (appError.statusCode === 401) {
      // In a real app, you'd redirect to login or refresh token
      console.warn('Authentication error:', appError.message)
    }

    // Handle rate limiting
    if (appError.statusCode === 429) {
      console.warn('Rate limit exceeded:', appError.message)
    }

    onError?.(appError)
  }
}

// ============================================================================
// NOTIFICATION SYSTEM INTEGRATION
// ============================================================================

export function createErrorNotification(error: AppError) {
  const getSeverity = (statusCode: number): 'error' | 'warning' | 'info' => {
    if (statusCode >= 500) return 'error'
    if (statusCode >= 400) return 'warning'
    return 'info'
  }

  return {
    type: getSeverity(error.statusCode),
    title: getErrorTitle(error),
    message: error.message,
    duration: error.statusCode >= 500 ? 0 : 5000, // Persist server errors
  }
}

function getErrorTitle(error: AppError): string {
  const statusCode = error.statusCode

  if (statusCode >= 500) return 'Server Error'
  if (statusCode === 429) return 'Rate Limit Exceeded'
  if (statusCode === 401) return 'Authentication Required'
  if (statusCode === 403) return 'Access Denied'
  if (statusCode === 404) return 'Not Found'
  if (statusCode === 409) return 'Conflict'
  if (statusCode >= 400) return 'Request Error'

  return 'Error'
}