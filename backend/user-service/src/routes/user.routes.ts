import { FastifyInstance } from 'fastify'
import { UserServiceImpl } from '../services/user.service'
import { prisma } from '../utils/prisma'
import { z } from 'zod'

const userService = new UserServiceImpl(prisma)

export async function userRoutes(app: FastifyInstance) {
  // ============================================================================
  // USER CRUD ROUTES
  // ============================================================================

  // Get user by ID
  app.get('/users/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      response: {
        200: z.object({
          success: z.boolean(),
          data: z.any()
        })
      }
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const user = await userService.getUser(id)

    if (!user) {
      return reply.status(404).send({
        success: false,
        error: 'User not found'
      })
    }

    return {
      success: true,
      data: user
    }
  })

  // Update user
  app.put('/users/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: z.object({
        firstName: z.string().optional(),
        lastName: z.string().optional(),
        phone: z.string().optional(),
        avatarUrl: z.string().url().optional(),
        timezone: z.string().optional(),
        locale: z.string().optional()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const updates = request.body as any

    try {
      const user = await userService.updateUser(id, updates)
      return {
        success: true,
        data: user
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'User not found'
      })
    }
  })

  // Delete user (soft delete)
  app.delete('/users/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    try {
      await userService.deleteUser(id)
      return {
        success: true,
        message: 'User deleted successfully'
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'User not found'
      })
    }
  })

  // ============================================================================
  // USER PROFILE ROUTES
  // ============================================================================

  // Get user profile
  app.get('/users/:userId/profile', {
    schema: {
      params: z.object({
        userId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { userId } = request.params as { userId: string }
    const profile = await userService.getUserProfile(userId)

    if (!profile) {
      return reply.status(404).send({
        success: false,
        error: 'Profile not found'
      })
    }

    return {
      success: true,
      data: profile
    }
  })

  // Create user profile
  app.post('/users/:userId/profile', {
    schema: {
      params: z.object({
        userId: z.string().uuid()
      }),
      body: z.object({
        bio: z.string().optional(),
        location: z.string().optional(),
        website: z.string().url().optional(),
        linkedinUrl: z.string().url().optional(),
        twitterUrl: z.string().url().optional(),
        githubUrl: z.string().url().optional(),
        skills: z.array(z.string()).default([]),
        interests: z.array(z.string()).default([])
      })
    }
  }, async (request, reply) => {
    const { userId } = request.params as { userId: string }
    const profileData = request.body as any

    try {
      const profile = await userService.createUserProfile(userId, profileData)
      return reply.status(201).send({
        success: true,
        data: profile
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to create profile'
      })
    }
  })

  // Update user profile
  app.put('/users/:userId/profile', {
    schema: {
      params: z.object({
        userId: z.string().uuid()
      }),
      body: z.object({
        bio: z.string().optional(),
        location: z.string().optional(),
        website: z.string().url().optional(),
        linkedinUrl: z.string().url().optional(),
        twitterUrl: z.string().url().optional(),
        githubUrl: z.string().url().optional(),
        skills: z.array(z.string()).optional(),
        interests: z.array(z.string()).optional()
      })
    }
  }, async (request, reply) => {
    const { userId } = request.params as { userId: string }
    const updates = request.body as any

    try {
      const profile = await userService.updateUserProfile(userId, updates)
      return {
        success: true,
        data: profile
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Profile not found'
      })
    }
  })

  // ============================================================================
  // EXPERIENCE ROUTES
  // ============================================================================

  // Add user experience
  app.post('/users/:userId/experience', {
    schema: {
      params: z.object({
        userId: z.string().uuid()
      }),
      body: z.object({
        companyName: z.string(),
        position: z.string(),
        description: z.string().optional(),
        startDate: z.string(),
        endDate: z.string().optional(),
        isCurrent: z.boolean().default(false),
        location: z.string().optional()
      })
    }
  }, async (request, reply) => {
    const { userId } = request.params as { userId: string }
    const experienceData = request.body as any

    try {
      const experience = await userService.addUserExperience(userId, {
        ...experienceData,
        startDate: new Date(experienceData.startDate),
        endDate: experienceData.endDate ? new Date(experienceData.endDate) : undefined
      })
      return reply.status(201).send({
        success: true,
        data: experience
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to add experience'
      })
    }
  })

  // Update user experience
  app.put('/users/experience/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: z.object({
        companyName: z.string().optional(),
        position: z.string().optional(),
        description: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        isCurrent: z.boolean().optional(),
        location: z.string().optional()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const updates = request.body as any

    try {
      const experience = await userService.updateUserExperience(id, {
        ...updates,
        startDate: updates.startDate ? new Date(updates.startDate) : undefined,
        endDate: updates.endDate ? new Date(updates.endDate) : undefined
      })
      return {
        success: true,
        data: experience
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Experience not found'
      })
    }
  })

  // Delete user experience
  app.delete('/users/experience/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    try {
      await userService.deleteUserExperience(id)
      return {
        success: true,
        message: 'Experience deleted successfully'
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Experience not found'
      })
    }
  })

  // Get user experiences
  app.get('/users/:userId/experience', {
    schema: {
      params: z.object({
        userId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { userId } = request.params as { userId: string }
    const experiences = await userService.getUserExperiences(userId)

    return {
      success: true,
      data: experiences
    }
  })

  // ============================================================================
  // EDUCATION ROUTES
  // ============================================================================

  // Add user education
  app.post('/users/:userId/education', {
    schema: {
      params: z.object({
        userId: z.string().uuid()
      }),
      body: z.object({
        institution: z.string(),
        degree: z.string(),
        fieldOfStudy: z.string().optional(),
        startDate: z.string(),
        endDate: z.string().optional(),
        grade: z.string().optional(),
        activities: z.string().optional()
      })
    }
  }, async (request, reply) => {
    const { userId } = request.params as { userId: string }
    const educationData = request.body as any

    try {
      const education = await userService.addUserEducation(userId, {
        ...educationData,
        startDate: new Date(educationData.startDate),
        endDate: educationData.endDate ? new Date(educationData.endDate) : undefined
      })
      return reply.status(201).send({
        success: true,
        data: education
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to add education'
      })
    }
  })

  // Update user education
  app.put('/users/education/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: z.object({
        institution: z.string().optional(),
        degree: z.string().optional(),
        fieldOfStudy: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        grade: z.string().optional(),
        activities: z.string().optional()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const updates = request.body as any

    try {
      const education = await userService.updateUserEducation(id, {
        ...updates,
        startDate: updates.startDate ? new Date(updates.startDate) : undefined,
        endDate: updates.endDate ? new Date(updates.endDate) : undefined
      })
      return {
        success: true,
        data: education
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Education not found'
      })
    }
  })

  // Delete user education
  app.delete('/users/education/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    try {
      await userService.deleteUserEducation(id)
      return {
        success: true,
        message: 'Education deleted successfully'
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Education not found'
      })
    }
  })

  // Get user education
  app.get('/users/:userId/education', {
    schema: {
      params: z.object({
        userId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { userId } = request.params as { userId: string }
    const education = await userService.getUserEducation(userId)

    return {
      success: true,
      data: education
    }
  })

  // ============================================================================
  // CERTIFICATION ROUTES
  // ============================================================================

  // Add user certification
  app.post('/users/:userId/certifications', {
    schema: {
      params: z.object({
        userId: z.string().uuid()
      }),
      body: z.object({
        name: z.string(),
        issuer: z.string(),
        issueDate: z.string(),
        expiryDate: z.string().optional(),
        credentialId: z.string().optional(),
        credentialUrl: z.string().url().optional()
      })
    }
  }, async (request, reply) => {
    const { userId } = request.params as { userId: string }
    const certificationData = request.body as any

    try {
      const certification = await userService.addUserCertification(userId, {
        ...certificationData,
        issueDate: new Date(certificationData.issueDate),
        expiryDate: certificationData.expiryDate ? new Date(certificationData.expiryDate) : undefined
      })
      return reply.status(201).send({
        success: true,
        data: certification
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to add certification'
      })
    }
  })

  // Update user certification
  app.put('/users/certifications/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: z.object({
        name: z.string().optional(),
        issuer: z.string().optional(),
        issueDate: z.string().optional(),
        expiryDate: z.string().optional(),
        credentialId: z.string().optional(),
        credentialUrl: z.string().url().optional()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const updates = request.body as any

    try {
      const certification = await userService.updateUserCertification(id, {
        ...updates,
        issueDate: updates.issueDate ? new Date(updates.issueDate) : undefined,
        expiryDate: updates.expiryDate ? new Date(updates.expiryDate) : undefined
      })
      return {
        success: true,
        data: certification
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Certification not found'
      })
    }
  })

  // Delete user certification
  app.delete('/users/certifications/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    try {
      await userService.deleteUserCertification(id)
      return {
        success: true,
        message: 'Certification deleted successfully'
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Certification not found'
      })
    }
  })

  // Get user certifications
  app.get('/users/:userId/certifications', {
    schema: {
      params: z.object({
        userId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { userId } = request.params as { userId: string }
    const certifications = await userService.getUserCertifications(userId)

    return {
      success: true,
      data: certifications
    }
  })

  // ============================================================================
  // LANGUAGE ROUTES
  // ============================================================================

  // Add user language
  app.post('/users/:userId/languages', {
    schema: {
      params: z.object({
        userId: z.string().uuid()
      }),
      body: z.object({
        language: z.string(),
        proficiency: z.enum(['beginner', 'intermediate', 'advanced', 'native'])
      })
    }
  }, async (request, reply) => {
    const { userId } = request.params as { userId: string }
    const languageData = request.body as any

    try {
      const language = await userService.addUserLanguage(userId, languageData)
      return reply.status(201).send({
        success: true,
        data: language
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to add language'
      })
    }
  })

  // Update user language
  app.put('/users/languages/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: z.object({
        language: z.string().optional(),
        proficiency: z.enum(['beginner', 'intermediate', 'advanced', 'native']).optional()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const updates = request.body as any

    try {
      const language = await userService.updateUserLanguage(id, updates)
      return {
        success: true,
        data: language
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Language not found'
      })
    }
  })

  // Delete user language
  app.delete('/users/languages/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    try {
      await userService.deleteUserLanguage(id)
      return {
        success: true,
        message: 'Language deleted successfully'
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Language not found'
      })
    }
  })

  // Get user languages
  app.get('/users/:userId/languages', {
    schema: {
      params: z.object({
        userId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { userId } = request.params as { userId: string }
    const languages = await userService.getUserLanguages(userId)

    return {
      success: true,
      data: languages
    }
  })

  // ============================================================================
  // PREFERENCES ROUTES
  // ============================================================================

  // Get user preferences
  app.get('/users/:userId/preferences', {
    schema: {
      params: z.object({
        userId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { userId } = request.params as { userId: string }
    const preferences = await userService.getUserPreferences(userId)

    if (!preferences) {
      return reply.status(404).send({
        success: false,
        error: 'Preferences not found'
      })
    }

    return {
      success: true,
      data: preferences
    }
  })

  // Update user preferences
  app.put('/users/:userId/preferences', {
    schema: {
      params: z.object({
        userId: z.string().uuid()
      }),
      body: z.object({
        theme: z.enum(['light', 'dark', 'system']).optional(),
        language: z.string().optional(),
        timezone: z.string().optional(),
        dateFormat: z.string().optional(),
        currency: z.string().optional(),
        notificationSettings: z.object({
          email: z.boolean().optional(),
          sms: z.boolean().optional(),
          push: z.boolean().optional(),
          marketing: z.boolean().optional(),
          productUpdates: z.boolean().optional(),
          securityAlerts: z.boolean().optional(),
          weeklyDigest: z.boolean().optional()
        }).optional(),
        privacySettings: z.object({
          profileVisibility: z.enum(['public', 'private', 'connections']).optional(),
          showEmail: z.boolean().optional(),
          showPhone: z.boolean().optional(),
          showLocation: z.boolean().optional(),
          allowMessaging: z.boolean().optional(),
          allowConnections: z.boolean().optional()
        }).optional()
      })
    }
  }, async (request, reply) => {
    const { userId } = request.params as { userId: string }
    const updates = request.body as any

    try {
      const preferences = await userService.updateUserPreferences(userId, updates)
      return {
        success: true,
        data: preferences
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to update preferences'
      })
    }
  })

  // ============================================================================
  // ACTIVITY ROUTES
  // ============================================================================

  // Get user activity
  app.get('/users/:userId/activity', {
    schema: {
      params: z.object({
        userId: z.string().uuid()
      }),
      querystring: z.object({
        limit: z.string().transform(Number).default(50)
      })
    }
  }, async (request, reply) => {
    const { userId } = request.params as { userId: string }
    const { limit } = request.query as { limit: number }
    const activities = await userService.getUserActivity(userId, limit)

    return {
      success: true,
      data: activities
    }
  })

  // ============================================================================
  // STATS ROUTES
  // ============================================================================

  // Get user stats
  app.get('/users/:userId/stats', {
    schema: {
      params: z.object({
        userId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { userId } = request.params as { userId: string }
    const stats = await userService.getUserStats(userId)

    return {
      success: true,
      data: stats
    }
  })

  // ============================================================================
  // SEARCH ROUTES
  // ============================================================================

  // Search users
  app.get('/users/search', {
    schema: {
      querystring: z.object({
        q: z.string(),
        skills: z.string().optional(),
        location: z.string().optional(),
        industry: z.string().optional(),
        experienceLevel: z.enum(['entry', 'mid', 'senior', 'executive']).optional(),
        availability: z.enum(['available', 'busy', 'unavailable']).optional()
      })
    }
  }, async (request, reply) => {
    const query = request.query as any

    const filters = {
      skills: query.skills?.split(','),
      location: query.location,
      industry: query.industry,
      experienceLevel: query.experienceLevel,
      availability: query.availability
    }

    const users = await userService.searchUsers(query.q, filters)

    return {
      success: true,
      data: users
    }
  })

  // Get recommended connections
  app.get('/users/:userId/recommendations', {
    schema: {
      params: z.object({
        userId: z.string().uuid()
      }),
      querystring: z.object({
        limit: z.string().transform(Number).default(10)
      })
    }
  }, async (request, reply) => {
    const { userId } = request.params as { userId: string }
    const { limit } = request.query as { limit: number }
    const recommendations = await userService.getRecommendedConnections(userId, limit)

    return {
      success: true,
      data: recommendations
    }
  })
}