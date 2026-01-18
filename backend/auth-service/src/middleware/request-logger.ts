import { FastifyRequest, FastifyReply } from 'fastify'

// ============================================================================
// REQUEST LOGGER
// ============================================================================

export async function requestLogger(request: FastifyRequest, reply: FastifyReply) {
  const startTime = Date.now()

  // Log incoming request
  request.log.info({
    type: 'request',
    method: request.method,
    url: request.url,
    params: request.params,
    query: request.query,
    headers: {
      'user-agent': request.headers['user-agent'],
      'content-type': request.headers['content-type'],
      'x-request-id': request.headers['x-request-id'],
      'authorization': request.headers.authorization ? '[REDACTED]' : undefined,
    },
    body: shouldLogBody(request) ? sanitizeBody(request.body) : '[BODY]',
  })

  // Log response when finished
  reply.raw.on('finish', () => {
    const duration = Date.now() - startTime
    const statusCode = reply.statusCode

    request.log.info({
      type: 'response',
      method: request.method,
      url: request.url,
      statusCode,
      duration: `${duration}ms`,
      requestId: request.id,
    })
  })
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function shouldLogBody(request: FastifyRequest): boolean {
  // Don't log bodies for sensitive endpoints
  const sensitivePaths = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/reset-password',
    '/api/auth/change-password',
  ]

  return !sensitivePaths.some(path => request.url.includes(path)) &&
         request.method !== 'GET' &&
         request.headers['content-type']?.includes('application/json')
}

function sanitizeBody(body: any): any {
  if (!body || typeof body !== 'object') {
    return body
  }

  const sensitiveFields = [
    'password',
    'currentPassword',
    'newPassword',
    'confirmPassword',
    'token',
    'refreshToken',
    'secret',
    'apiKey',
    'privateKey',
  ]

  const sanitized = { ...body }

  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]'
    }
  })

  return sanitized
}