import { buildApp } from '../src/index'
import { FastifyInstance } from 'fastify'

describe('Health Check Integration Tests', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await buildApp()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('GET /health', () => {
    it('should return healthy status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.payload)

      expect(body.status).toBe('ok')
      expect(body.service).toBe('api-gateway')
      expect(body.version).toBe('1.0.0')
      expect(body.timestamp).toBeDefined()
      expect(body.uptime).toBeDefined()
      expect(body.environment).toBeDefined()
    })

    it('should include proper headers', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health'
      })

      expect(response.headers['content-type']).toBe('application/json; charset=utf-8')
    })
  })

  describe('GET /ready', () => {
    it('should return ready status', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/ready'
      })

      expect(response.statusCode).toBe(200)
      const body = JSON.parse(response.payload)

      expect(body.status).toBe('ready')
    })
  })

  describe('GET /metrics', () => {
    it('should return Prometheus metrics', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/metrics'
      })

      expect(response.statusCode).toBe(200)
      expect(response.headers['content-type']).toContain('text/plain')

      const metrics = response.payload
      expect(metrics).toContain('# HELP')
      expect(metrics).toContain('# TYPE')
      expect(metrics).toContain('http_requests_total')
    })
  })
})