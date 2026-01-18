import { FastifyInstance } from 'fastify'
import axios from 'axios'
import { loadConfig } from '../config/loader'
import { Errors } from '../middleware/error-handler'

// ============================================================================
// NEXUS ROUTES (Networking & Funding)
// ============================================================================

export async function nexusRoutes(app: FastifyInstance) {
  const config = loadConfig()
  const nexusServiceUrl = config.NEXUS_URL

  // ============================================================================
  // NETWORK MANAGEMENT
  // ============================================================================

  app.get('/users/:userId/network', async (request, reply) => {
    try {
      const { userId } = request.params as { userId: string }
      const response = await axios.get(`${nexusServiceUrl}/api/nexus/users/${userId}/network`, {
        headers: {
          'x-request-id': request.id as string,
          'authorization': request.headers.authorization,
        },
      })

      reply.send(response.data)
    } catch (error: any) {
      if (error.response) {
        reply.status(error.response.status).send(error.response.data)
      } else {
        throw Errors.ServiceUnavailable('Nexus Service')
      }
    }
  })

  // ============================================================================
  // INTRODUCTIONS
  // ============================================================================

  app.get('/users/:userId/introductions', async (request, reply) => {
    try {
      const { userId } = request.params as { userId: string }
      const response = await axios.get(`${nexusServiceUrl}/api/nexus/users/${userId}/introductions`, {
        params: request.query,
        headers: {
          'x-request-id': request.id as string,
          'authorization': request.headers.authorization,
        },
      })

      reply.send(response.data)
    } catch (error: any) {
      if (error.response) {
        reply.status(error.response.status).send(error.response.data)
      } else {
        throw Errors.ServiceUnavailable('Nexus Service')
      }
    }
  })

  app.post('/introductions', async (request, reply) => {
    try {
      const response = await axios.post(`${nexusServiceUrl}/api/nexus/introductions`, request.body, {
        headers: {
          'x-request-id': request.id as string,
          'authorization': request.headers.authorization,
        },
      })

      reply.send(response.data)
    } catch (error: any) {
      if (error.response) {
        reply.status(error.response.status).send(error.response.data)
      } else {
        throw Errors.ServiceUnavailable('Nexus Service')
      }
    }
  })

  app.post('/introductions/:introductionId/respond', async (request, reply) => {
    try {
      const { introductionId } = request.params as { introductionId: string }
      const response = await axios.post(`${nexusServiceUrl}/api/nexus/introductions/${introductionId}/respond`, request.body, {
        headers: {
          'x-request-id': request.id as string,
          'authorization': request.headers.authorization,
        },
      })

      reply.send(response.data)
    } catch (error: any) {
      if (error.response) {
        reply.status(error.response.status).send(error.response.data)
      } else {
        throw Errors.ServiceUnavailable('Nexus Service')
      }
    }
  })

  // ============================================================================
  // FUNDING APPLICATIONS
  // ============================================================================

  app.get('/companies/:companyId/funding/applications', async (request, reply) => {
    try {
      const { companyId } = request.params as { companyId: string }
      const response = await axios.get(`${nexusServiceUrl}/api/nexus/companies/${companyId}/funding/applications`, {
        headers: {
          'x-request-id': request.id as string,
          'authorization': request.headers.authorization,
        },
      })

      reply.send(response.data)
    } catch (error: any) {
      if (error.response) {
        reply.status(error.response.status).send(error.response.data)
      } else {
        throw Errors.ServiceUnavailable('Nexus Service')
      }
    }
  })

  app.post('/companies/:companyId/funding/applications', async (request, reply) => {
    try {
      const { companyId } = request.params as { companyId: string }
      const response = await axios.post(`${nexusServiceUrl}/api/nexus/companies/${companyId}/funding/applications`, request.body, {
        headers: {
          'x-request-id': request.id as string,
          'authorization': request.headers.authorization,
        },
      })

      reply.send(response.data)
    } catch (error: any) {
      if (error.response) {
        reply.status(error.response.status).send(error.response.data)
      } else {
        throw Errors.ServiceUnavailable('Nexus Service')
      }
    }
  })

  app.put('/companies/:companyId/funding/applications/:applicationId', async (request, reply) => {
    try {
      const { companyId, applicationId } = request.params as { companyId: string; applicationId: string }
      const response = await axios.put(`${nexusServiceUrl}/api/nexus/companies/${companyId}/funding/applications/${applicationId}`, request.body, {
        headers: {
          'x-request-id': request.id as string,
          'authorization': request.headers.authorization,
        },
      })

      reply.send(response.data)
    } catch (error: any) {
      if (error.response) {
        reply.status(error.response.status).send(error.response.data)
      } else {
        throw Errors.ServiceUnavailable('Nexus Service')
      }
    }
  })

  // ============================================================================
  // INVESTOR PROFILES
  // ============================================================================

  app.get('/investors', async (request, reply) => {
    try {
      const response = await axios.get(`${nexusServiceUrl}/api/nexus/investors`, {
        params: request.query,
        headers: {
          'x-request-id': request.id as string,
          'authorization': request.headers.authorization,
        },
      })

      reply.send(response.data)
    } catch (error: any) {
      if (error.response) {
        reply.status(error.response.status).send(error.response.data)
      } else {
        throw Errors.ServiceUnavailable('Nexus Service')
      }
    }
  })

  // ============================================================================
  // INVESTOR MATCHING
  // ============================================================================

  app.get('/companies/:companyId/matches/:type', async (request, reply) => {
    try {
      const { companyId, type } = request.params as { companyId: string; type: string }
      const response = await axios.get(`${nexusServiceUrl}/api/nexus/companies/${companyId}/matches/${type}`, {
        headers: {
          'x-request-id': request.id as string,
          'authorization': request.headers.authorization,
        },
      })

      reply.send(response.data)
    } catch (error: any) {
      if (error.response) {
        reply.status(error.response.status).send(error.response.data)
      } else {
        throw Errors.ServiceUnavailable('Nexus Service')
      }
    }
  })
}