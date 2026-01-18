import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { captureException, addBreadcrumb } from '../utils/sentry'

// ============================================================================
// ERROR CODES
// ============================================================================

export const ERROR_CODES = {
  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  ALREADY_EXISTS: 'ALREADY_EXISTS',

  // Service errors
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',

  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Generic errors
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
} as const

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]

// ============================================================================
// BASE ERROR CLASS
// ============================================================================

export class AppError extends Error {
  public readonly code: ErrorCode
  public readonly statusCode: number
  public readonly isOperational: boolean

  constructor(
    message: string,
    code: ErrorCode = ERROR_CODES.INTERNAL_SERVER_ERROR,
    statusCode: number = 500
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.isOperational = true

    Error.captureStackTrace(this, this.constructor)
  }
}

// ============================================================================
// ERROR HANDLER
// ============================================================================

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Log the error
  request.log.error({
    err: error,
    url: request.url,
    method: request.method,
    params: request.params,
    query: request.query,
    body: request.body,
    headers: request.headers,
  })

  // Add breadcrumb for error context
  addBreadcrumb({
    message: `Error in ${request.method} ${request.url}`,
    level: 'error',
    category: 'error',
    data: {
      method: request.method,
      url: request.url,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
      userId: request.headers['x-user-id'] as string,
      requestId: request.id as string
    }
  })

  // Capture error in Sentry (only for non-validation and non-auth errors)
  if (!(error instanceof AppError) &&
      error.name !== 'ZodError' &&
      !error.name?.includes('Token') &&
      error.statusCode !== 429) {
    captureException(error, {
      method: request.method,
      url: request.url,
      userId: request.headers['x-user-id'] as string,
      requestId: request.id as string
    })
  }

  // Handle known AppErrors
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: {
        code: error.code,
        message: error.message,
        timestamp: new Date().toISOString(),
        requestId: request.id,
      },
    })
  }

  // Handle Zod validation errors
  if (error.name === 'ZodError') {
    return reply.status(400).send({
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: 'Validation failed',
        details: (error as any).issues?.map((issue: any) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
        timestamp: new Date().toISOString(),
        requestId: request.id,
      },
    })
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return reply.status(401).send({
      error: {
        code: ERROR_CODES.UNAUTHORIZED,
        message: 'Invalid token',
        timestamp: new Date().toISOString(),
        requestId: request.id,
      },
    })
  }

  if (error.name === 'TokenExpiredError') {
    return reply.status(401).send({
      error: {
        code: ERROR_CODES.TOKEN_EXPIRED,
        message: 'Token expired',
        timestamp: new Date().toISOString(),
        requestId: request.id,
      },
    })
  }

  // Handle rate limiting errors
  if (error.statusCode === 429) {
    return reply.status(429).send({
      error: {
        code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
        message: error.message || 'Rate limit exceeded',
        timestamp: new Date().toISOString(),
        requestId: request.id,
      },
    })
  }

  // Handle other Fastify errors
  if (error.statusCode) {
    return reply.status(error.statusCode).send({
      error: {
        code: getErrorCodeFromStatus(error.statusCode),
        message: error.message,
        timestamp: new Date().toISOString(),
        requestId: request.id,
      },
    })
  }

  // Handle unknown errors
  reply.status(500).send({
    error: {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : error.message,
      timestamp: new Date().toISOString(),
      requestId: request.id,
    },
  })
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getErrorCodeFromStatus(statusCode: number): ErrorCode {
  switch (statusCode) {
    case 400:
      return ERROR_CODES.BAD_REQUEST
    case 401:
      return ERROR_CODES.UNAUTHORIZED
    case 403:
      return ERROR_CODES.FORBIDDEN
    case 404:
      return ERROR_CODES.NOT_FOUND
    case 409:
      return ERROR_CODES.CONFLICT
    case 429:
      return ERROR_CODES.RATE_LIMIT_EXCEEDED
    case 503:
      return ERROR_CODES.SERVICE_UNAVAILABLE
    default:
      return ERROR_CODES.INTERNAL_SERVER_ERROR
  }
}

// ============================================================================
// COMMON ERROR INSTANCES
// ============================================================================

export const Errors = {
  Unauthorized: (message = 'Authentication required') =>
    new AppError(message, ERROR_CODES.UNAUTHORIZED, 401),

  Forbidden: (message = 'Access denied') =>
    new AppError(message, ERROR_CODES.FORBIDDEN, 403),

  NotFound: (resource = 'Resource') =>
    new AppError(`${resource} not found`, ERROR_CODES.NOT_FOUND, 404),

  Conflict: (message = 'Resource conflict') =>
    new AppError(message, ERROR_CODES.CONFLICT, 409),

  ValidationError: (message = 'Validation failed') =>
    new AppError(message, ERROR_CODES.VALIDATION_ERROR, 400),

  ServiceUnavailable: (service = 'Service') =>
    new AppError(`${service} is currently unavailable`, ERROR_CODES.SERVICE_UNAVAILABLE, 503),

  InternalServerError: (message = 'Internal server error') =>
    new AppError(message, ERROR_CODES.INTERNAL_SERVER_ERROR, 500),
}