import { buildApp } from '../src/index'
import { FastifyInstance } from 'fastify'
import nock from 'nock'

describe('Authentication Integration Tests', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await buildApp()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('POST /api/auth/login', () => {
    it('should forward login request to auth service', async () => {
      // Mock the auth service response
      const authServiceMock = nock('http://auth-service:3002')
        .post('/api/v1/auth/login')
        .reply(200, {
          success: true,
          data: {
            accessToken: 'mock-jwt-token',
            refreshToken: 'mock-refresh-token',
            user: {
              id: 'user-123',
              email: 'test@example.com',
              firstName: 'Test',
              lastName: 'User'
            }
          }
        })

      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'test@example.com',
          password: 'password123'
        }
      })

      expect(response.statusCode).toBe(200)

      const body = JSON.parse(response.payload)
      expect(body.success).toBe(true)
      expect(body.data.accessToken).toBe('mock-jwt-token')
      expect(body.data.user.email).toBe('test@example.com')

      expect(authServiceMock.isDone()).toBe(true)
    })

    it('should handle auth service errors', async () => {
      const authServiceMock = nock('http://auth-service:3002')
        .post('/api/v1/auth/login')
        .reply(401, {
          success: false,
          error: 'Invalid credentials'
        })

      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'test@example.com',
          password: 'wrongpassword'
        }
      })

      expect(response.statusCode).toBe(401)

      const body = JSON.parse(response.payload)
      expect(body.success).toBe(false)
      expect(body.error).toBe('Invalid credentials')

      expect(authServiceMock.isDone()).toBe(true)
    })

    it('should validate request payload', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'invalid-email',
          // missing password
        }
      })

      expect(response.statusCode).toBe(400)

      const body = JSON.parse(response.payload)
      expect(body.success).toBe(false)
      expect(body.error).toContain('Validation')
    })
  })

  describe('POST /api/auth/register', () => {
    it('should forward registration request to auth service', async () => {
      const authServiceMock = nock('http://auth-service:3002')
        .post('/api/v1/auth/register')
        .reply(201, {
          success: true,
          data: {
            user: {
              id: 'user-456',
              email: 'newuser@example.com',
              firstName: 'New',
              lastName: 'User'
            },
            message: 'User registered successfully'
          }
        })

      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: {
          email: 'newuser@example.com',
          password: 'securepassword123',
          firstName: 'New',
          lastName: 'User'
        }
      })

      expect(response.statusCode).toBe(201)

      const body = JSON.parse(response.payload)
      expect(body.success).toBe(true)
      expect(body.data.user.email).toBe('newuser@example.com')

      expect(authServiceMock.isDone()).toBe(true)
    })
  })

  describe('Circuit Breaker', () => {
    it('should handle service unavailability', async () => {
      // Simulate auth service being down
      const authServiceMock = nock('http://auth-service:3002')
        .post('/api/v1/auth/login')
        .replyWithError('Connection timeout')

      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'test@example.com',
          password: 'password123'
        }
      })

      expect(response.statusCode).toBe(502)

      const body = JSON.parse(response.payload)
      expect(body.success).toBe(false)
      expect(body.error).toBe('Service request failed')
      expect(body.service).toBe('auth-service')
    })
  })
})