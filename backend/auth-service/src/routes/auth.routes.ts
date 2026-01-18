import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { AuthService } from '../services/auth.service'
import { AuthErrors } from '../middleware/error-handler'

// ============================================================================
// REQUEST SCHEMAS
// ============================================================================

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const refreshTokenSchema = z.object({
  refreshToken: z.string(),
})

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
})

const changePasswordSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8),
})

const verifyEmailSchema = z.object({
  token: z.string(),
})

// ============================================================================
// AUTH ROUTES
// ============================================================================

export async function authRoutes(app: FastifyInstance) {
  const authService = new AuthService()

  // ============================================================================
  // REGISTER
  // ============================================================================

  app.post('/register', {
    schema: {
      body: registerSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                phone: { type: 'string' },
                phoneVerified: { type: 'boolean' },
                emailVerified: { type: 'boolean' },
                role: { type: 'string' },
                isActive: { type: 'boolean' },
                lastLoginAt: { type: 'string', format: 'date-time' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
            expiresIn: { type: 'number' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const result = await authService.register(request.body as z.infer<typeof registerSchema>)
      reply.status(201).send(result)
    } catch (error) {
      if (error instanceof Error && error.message === 'User already exists with this email') {
        throw AuthErrors.UserAlreadyExists()
      }
      throw error
    }
  })

  // ============================================================================
  // LOGIN
  // ============================================================================

  app.post('/login', {
    schema: {
      body: loginSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                phone: { type: 'string' },
                phoneVerified: { type: 'boolean' },
                emailVerified: { type: 'boolean' },
                role: { type: 'string' },
                isActive: { type: 'boolean' },
                lastLoginAt: { type: 'string', format: 'date-time' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
            expiresIn: { type: 'number' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const result = await authService.login(request.body as z.infer<typeof loginSchema>)
      reply.send(result)
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid credentials') {
        throw AuthErrors.InvalidCredentials()
      }
      if (error instanceof Error && error.message === 'User not found or inactive') {
        throw AuthErrors.InvalidCredentials()
      }
      throw error
    }
  })

  // ============================================================================
  // LOGOUT
  // ============================================================================

  app.post('/logout', {
    preHandler: [app.authenticate],
  }, async (request, reply) => {
    try {
      const { refreshToken } = request.body as { refreshToken?: string }
      const userId = (request as any).user.userId

      await authService.logout(userId, refreshToken)
      reply.send({ message: 'Logged out successfully' })
    } catch (error) {
      throw error
    }
  })

  // ============================================================================
  // REFRESH TOKEN
  // ============================================================================

  app.post('/refresh', {
    schema: {
      body: refreshTokenSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                phone: { type: 'string' },
                phoneVerified: { type: 'boolean' },
                emailVerified: { type: 'boolean' },
                role: { type: 'string' },
                isActive: { type: 'boolean' },
                lastLoginAt: { type: 'string', format: 'date-time' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
            expiresIn: { type: 'number' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const result = await authService.refreshToken(request.body as z.infer<typeof refreshTokenSchema>)
      reply.send(result)
    } catch (error) {
      throw AuthErrors.InvalidToken()
    }
  })

  // ============================================================================
  // FORGOT PASSWORD
  // ============================================================================

  app.post('/forgot-password', {
    schema: {
      body: forgotPasswordSchema,
    },
  }, async (request, reply) => {
    try {
      await authService.forgotPassword(request.body as z.infer<typeof forgotPasswordSchema>)
      reply.send({ message: 'Password reset email sent' })
    } catch (error) {
      // Don't reveal if email exists or not for security
      reply.send({ message: 'Password reset email sent' })
    }
  })

  // ============================================================================
  // RESET PASSWORD
  // ============================================================================

  app.post('/reset-password', {
    schema: {
      body: resetPasswordSchema,
    },
  }, async (request, reply) => {
    try {
      await authService.resetPassword(request.body as z.infer<typeof resetPasswordSchema>)
      reply.send({ message: 'Password reset successfully' })
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid or expired')) {
        throw AuthErrors.InvalidToken()
      }
      throw error
    }
  })

  // ============================================================================
  // CHANGE PASSWORD
  // ============================================================================

  app.post('/change-password', {
    preHandler: [app.authenticate],
    schema: {
      body: changePasswordSchema,
    },
  }, async (request, reply) => {
    try {
      const userId = (request as any).user.userId
      await authService.changePassword(userId, request.body as z.infer<typeof changePasswordSchema>)
      reply.send({ message: 'Password changed successfully' })
    } catch (error) {
      if (error instanceof Error && error.message === 'Current password is incorrect') {
        throw AuthErrors.InvalidCredentials()
      }
      throw error
    }
  })

  // ============================================================================
  // VERIFY EMAIL
  // ============================================================================

  app.post('/verify-email', {
    schema: {
      body: verifyEmailSchema,
    },
  }, async (request, reply) => {
    try {
      await authService.verifyEmail(request.body as z.infer<typeof verifyEmailSchema>)
      reply.send({ message: 'Email verified successfully' })
    } catch (error) {
      if (error instanceof Error && error.message.includes('Invalid or expired')) {
        throw AuthErrors.InvalidToken()
      }
      throw error
    }
  })

  // ============================================================================
  // GET PROFILE (Authenticated)
  // ============================================================================

  app.get('/profile', {
    preHandler: [app.authenticate],
  }, async (request, reply) => {
    try {
      const userId = (request as any).user.userId
      const user = await app.prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw AuthErrors.UserNotFound()
      }

      reply.send({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          phoneVerified: user.phoneVerified,
          emailVerified: user.emailVerified,
          role: user.role,
          isActive: user.isActive,
          lastLoginAt: user.lastLoginAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      })
    } catch (error) {
      throw error
    }
  })
}