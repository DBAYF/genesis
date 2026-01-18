import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'

// ============================================================================
// ERROR CODES
// ============================================================================

export const ERROR_CODES = {
  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  INVALID_TOKEN: 'INVALID_TOKEN',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_EMAIL: 'INVALID_EMAIL',
  WEAK_PASSWORD: 'WEAK_PASSWORD',

  // User errors
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  USER_INACTIVE: 'USER_INACTIVE',
  EMAIL_ALREADY_VERIFIED: 'EMAIL_ALREADY_VERIFIED',
  INVALID_RESET_TOKEN: 'INVALID_RESET_TOKEN',
  RESET_TOKEN_EXPIRED: 'RESET_TOKEN_EXPIRED',

  // Service errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  REDIS_ERROR: 'REDIS_ERROR',
  EMAIL_ERROR: 'EMAIL_ERROR',

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

export class AuthError extends Error {
  public readonly code: ErrorCode
  public readonly statusCode: number
  public readonly isOperational: boolean

  constructor(
    message: string,
    code: ErrorCode = ERROR_CODES.INTERNAL_SERVER_ERROR,
    statusCode: number = 500
  ) {
    super(message)
    this.name = 'AuthError'
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

  // Handle known AuthErrors
  if (error instanceof AuthError) {
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
        code: ERROR_CODES.INVALID_TOKEN,
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

  // Handle Prisma errors
  if (error.name === 'PrismaClientKnownRequestError') {
    return reply.status(400).send({
      error: {
        code: ERROR_CODES.DATABASE_ERROR,
        message: 'Database operation failed',
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
      return ERROR_CODES.USER_NOT_FOUND
    case 409:
      return ERROR_CODES.USER_ALREADY_EXISTS
    case 429:
      return ERROR_CODES.RATE_LIMIT_EXCEEDED
    default:
      return ERROR_CODES.INTERNAL_SERVER_ERROR
  }
}

// ============================================================================
// COMMON ERROR INSTANCES
// ============================================================================

export const AuthErrors = {
  Unauthorized: (message = 'Authentication required') =>
    new AuthError(message, ERROR_CODES.UNAUTHORIZED, 401),

  Forbidden: (message = 'Access denied') =>
    new AuthError(message, ERROR_CODES.FORBIDDEN, 403),

  InvalidCredentials: (message = 'Invalid email or password') =>
    new AuthError(message, ERROR_CODES.INVALID_CREDENTIALS, 401),

  UserNotFound: (message = 'User not found') =>
    new AuthError(message, ERROR_CODES.USER_NOT_FOUND, 404),

  UserAlreadyExists: (message = 'User already exists with this email') =>
    new AuthError(message, ERROR_CODES.USER_ALREADY_EXISTS, 409),

  UserInactive: (message = 'Account is inactive') =>
    new AuthError(message, ERROR_CODES.USER_INACTIVE, 403),

  InvalidToken: (message = 'Invalid or expired token') =>
    new AuthError(message, ERROR_CODES.INVALID_TOKEN, 401),

  TokenExpired: (message = 'Token has expired') =>
    new AuthError(message, ERROR_CODES.TOKEN_EXPIRED, 401),

  WeakPassword: (message = 'Password does not meet requirements') =>
    new AuthError(message, ERROR_CODES.WEAK_PASSWORD, 400),

  ValidationError: (message = 'Validation failed') =>
    new AuthError(message, ERROR_CODES.VALIDATION_ERROR, 400),

  InternalServerError: (message = 'Internal server error') =>
    new AuthError(message, ERROR_CODES.INTERNAL_SERVER_ERROR, 500),
}