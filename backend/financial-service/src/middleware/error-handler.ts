import { FastifyReply, FastifyRequest } from 'fastify'

export function errorHandler(
  error: any,
  request: FastifyRequest,
  reply: FastifyReply
) {
  request.log.error(error)

  if (error.validation) {
    return reply.status(400).send({
      success: false,
      error: 'Validation Error',
      details: error.validation
    })
  }

  if (error.code === 'P2002') {
    return reply.status(409).send({
      success: false,
      error: 'Resource already exists'
    })
  }

  if (error.code === 'P2025') {
    return reply.status(404).send({
      success: false,
      error: 'Resource not found'
    })
  }

  const statusCode = error.statusCode || 500
  const message = error.message || 'Internal Server Error'

  reply.status(statusCode).send({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  })
}