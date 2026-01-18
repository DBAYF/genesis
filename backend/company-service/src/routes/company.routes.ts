import { FastifyInstance } from 'fastify'
import { CompanyServiceImpl } from '../services/company.service'
import { prisma } from '../utils/prisma'
import { z } from 'zod'

const companyService = new CompanyServiceImpl(prisma)

// ============================================================================
// COMPANY CRUD ROUTES
// ============================================================================

export async function companyRoutes(app: FastifyInstance) {
  // Get company by ID
  app.get('/companies/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const company = await companyService.getCompany(id)

    if (!company) {
      return reply.status(404).send({
        success: false,
        error: 'Company not found'
      })
    }

    return {
      success: true,
      data: company
    }
  })

  // Get user's companies
  app.get('/users/:userId/companies', {
    schema: {
      params: z.object({
        userId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { userId } = request.params as { userId: string }
    const companies = await companyService.getUserCompanies(userId)

    return {
      success: true,
      data: companies
    }
  })

  // Create company
  app.post('/companies', {
    schema: {
      body: z.object({
        userId: z.string().uuid(),
        name: z.string(),
        tradingName: z.string().optional(),
        companyType: z.enum(['ltd', 'plc', 'llp', 'partnership', 'sole_trader', 'cic', 'charity']),
        registeredAddress: z.object({
          line1: z.string(),
          line2: z.string().optional(),
          city: z.string(),
          county: z.string().optional(),
          postcode: z.string(),
          country: z.string()
        }),
        businessAddress: z.object({
          line1: z.string(),
          line2: z.string().optional(),
          city: z.string(),
          county: z.string().optional(),
          postcode: z.string(),
          country: z.string()
        }).optional(),
        sicCodes: z.array(z.string()),
        natureOfBusiness: z.string().optional(),
        industry: z.string().optional(),
        sector: z.string().optional(),
        defaultCurrency: z.string().default('GBP'),
        financialYearEndMonth: z.number().min(1).max(12).default(12)
      })
    }
  }, async (request, reply) => {
    const companyData = request.body as any

    try {
      const company = await companyService.createCompany(companyData.userId, {
        name: companyData.name,
        tradingName: companyData.tradingName,
        companyType: companyData.companyType,
        companyStatus: 'pre_incorporation',
        registeredAddress: companyData.registeredAddress,
        businessAddress: companyData.businessAddress,
        sicCodes: companyData.sicCodes,
        natureOfBusiness: companyData.natureOfBusiness,
        industry: companyData.industry,
        sector: companyData.sector,
        vatRegistered: false,
        payeRegistered: false,
        seisAllocationRemaining: 0,
        totalFundingRaised: 0,
        defaultCurrency: companyData.defaultCurrency,
        financialYearEndMonth: companyData.financialYearEndMonth
      })

      return reply.status(201).send({
        success: true,
        data: company
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to create company'
      })
    }
  })

  // Update company
  app.put('/companies/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: z.object({
        name: z.string().optional(),
        tradingName: z.string().optional(),
        companyType: z.enum(['ltd', 'plc', 'llp', 'partnership', 'sole_trader', 'cic', 'charity']).optional(),
        companyStatus: z.enum(['pre_incorporation', 'active', 'dormant', 'dissolved', 'liquidation']).optional(),
        registeredAddress: z.object({
          line1: z.string(),
          line2: z.string().optional(),
          city: z.string(),
          county: z.string().optional(),
          postcode: z.string(),
          country: z.string()
        }).optional(),
        businessAddress: z.object({
          line1: z.string(),
          line2: z.string().optional(),
          city: z.string(),
          county: z.string().optional(),
          postcode: z.string(),
          country: z.string()
        }).optional(),
        sicCodes: z.array(z.string()).optional(),
        natureOfBusiness: z.string().optional(),
        industry: z.string().optional(),
        sector: z.string().optional(),
        corporationTaxReference: z.string().optional(),
        vatNumber: z.string().optional(),
        vatRegistered: z.boolean().optional(),
        payeReference: z.string().optional(),
        payeRegistered: z.boolean().optional(),
        currentCashBalance: z.number().optional(),
        monthlyBurnRate: z.number().optional(),
        totalFundingRaised: z.number().optional(),
        lastValuation: z.number().optional(),
        lastValuationDate: z.string().optional(),
        defaultCurrency: z.string().optional(),
        financialYearEndMonth: z.number().min(1).max(12).optional()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const updates = request.body as any

    // Convert date strings to Date objects
    if (updates.lastValuationDate) {
      updates.lastValuationDate = new Date(updates.lastValuationDate)
    }

    try {
      const company = await companyService.updateCompany(id, updates)
      return {
        success: true,
        data: company
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Company not found'
      })
    }
  })

  // Delete company
  app.delete('/companies/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    try {
      await companyService.deleteCompany(id)
      return {
        success: true,
        message: 'Company deleted successfully'
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Company not found'
      })
    }
  })

  // ============================================================================
  // INCORPORATION ROUTES
  // ============================================================================

  // Incorporate company
  app.post('/companies/:id/incorporate', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: z.object({
        userId: z.string().uuid(),
        name: z.string(),
        companyType: z.enum(['ltd', 'plc', 'llp', 'partnership', 'sole_trader', 'cic', 'charity']),
        registeredAddress: z.object({
          line1: z.string(),
          line2: z.string().optional(),
          city: z.string(),
          county: z.string().optional(),
          postcode: z.string(),
          country: z.string()
        }),
        businessAddress: z.object({
          line1: z.string(),
          line2: z.string().optional(),
          city: z.string(),
          county: z.string().optional(),
          postcode: z.string(),
          country: z.string()
        }).optional(),
        sicCodes: z.array(z.string()),
        directors: z.array(z.object({
          name: z.string(),
          address: z.object({
            line1: z.string(),
            line2: z.string().optional(),
            city: z.string(),
            county: z.string().optional(),
            postcode: z.string(),
            country: z.string()
          }),
          nationality: z.string(),
          occupation: z.string(),
          dateOfBirth: z.string(),
          serviceAddress: z.object({
            line1: z.string(),
            line2: z.string().optional(),
            city: z.string(),
            county: z.string().optional(),
            postcode: z.string(),
            country: z.string()
          }).optional()
        })),
        shareholders: z.array(z.object({
          name: z.string(),
          address: z.object({
            line1: z.string(),
            line2: z.string().optional(),
            city: z.string(),
            county: z.string().optional(),
            postcode: z.string(),
            country: z.string()
          }),
          nationality: z.string().optional(),
          shareClass: z.string(),
          numberOfShares: z.number()
        })),
        shareClasses: z.array(z.object({
          name: z.string(),
          totalShares: z.number(),
          nominalValue: z.number(),
          currency: z.string(),
          votingRights: z.boolean(),
          dividendRights: z.boolean(),
          liquidationPreference: z.number().optional(),
          conversionRights: z.boolean().optional(),
          redemptionRights: z.boolean().optional()
        })),
        memorandum: z.string().optional(),
        articles: z.string().optional()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const incorporationData = request.body as any

    try {
      const result = await companyService.incorporateCompany(incorporationData.userId, incorporationData)
      return {
        success: true,
        data: result
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Incorporation failed'
      })
    }
  })

  // Get incorporation status
  app.get('/companies/:id/incorporation', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const status = await companyService.getIncorporationStatus(id)

    if (!status) {
      return reply.status(404).send({
        success: false,
        error: 'Incorporation not found'
      })
    }

    return {
      success: true,
      data: status
    }
  })

  // ============================================================================
  // COMPANY MEMBERS ROUTES
  // ============================================================================

  // Get company members
  app.get('/companies/:companyId/members', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const members = await companyService.getCompanyMembers(companyId)

    return {
      success: true,
      data: members
    }
  })

  // Add company member
  app.post('/companies/:companyId/members', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.object({
        userId: z.string().uuid(),
        role: z.enum(['owner', 'director', 'shareholder', 'employee', 'advisor', 'consultant']),
        title: z.string().optional(),
        shareholdingPercentage: z.number().optional(),
        votingRights: z.boolean().optional(),
        salary: z.number().optional(),
        equityStake: z.number().optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const memberData = request.body as any

    try {
      const member = await companyService.addCompanyMember(companyId, memberData)
      return reply.status(201).send({
        success: true,
        data: member
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to add member'
      })
    }
  })

  // Update company member
  app.put('/companies/members/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: z.object({
        role: z.enum(['owner', 'director', 'shareholder', 'employee', 'advisor', 'consultant']).optional(),
        title: z.string().optional(),
        shareholdingPercentage: z.number().optional(),
        votingRights: z.boolean().optional(),
        salary: z.number().optional(),
        equityStake: z.number().optional(),
        isActive: z.boolean().optional()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const updates = request.body as any

    try {
      const member = await companyService.updateCompanyMember(id, updates)
      return {
        success: true,
        data: member
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Member not found'
      })
    }
  })

  // Remove company member
  app.delete('/companies/members/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    try {
      await companyService.removeCompanyMember(id)
      return {
        success: true,
        message: 'Member removed successfully'
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Member not found'
      })
    }
  })

  // ============================================================================
  // OFFICERS ROUTES
  // ============================================================================

  // Get company officers
  app.get('/companies/:companyId/officers', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const officers = await companyService.getCompanyOfficers(companyId)

    return {
      success: true,
      data: officers
    }
  })

  // Add company officer
  app.post('/companies/:companyId/officers', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.object({
        userId: z.string().uuid().optional(),
        name: z.string(),
        role: z.enum(['director', 'secretary', 'llp_member', 'llp_designated_member', 'judicial_factor']),
        nationality: z.string().optional(),
        occupation: z.string().optional(),
        countryOfResidence: z.string().optional(),
        serviceAddress: z.object({
          line1: z.string(),
          line2: z.string().optional(),
          city: z.string(),
          county: z.string().optional(),
          postcode: z.string(),
          country: z.string()
        }).optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const officerData = request.body as any

    try {
      const officer = await companyService.addCompanyOfficer(companyId, officerData)
      return reply.status(201).send({
        success: true,
        data: officer
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to add officer'
      })
    }
  })

  // Update company officer
  app.put('/companies/officers/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: z.object({
        userId: z.string().uuid().optional(),
        name: z.string().optional(),
        role: z.enum(['director', 'secretary', 'llp_member', 'llp_designated_member', 'judicial_factor']).optional(),
        nationality: z.string().optional(),
        occupation: z.string().optional(),
        countryOfResidence: z.string().optional(),
        serviceAddress: z.object({
          line1: z.string(),
          line2: z.string().optional(),
          city: z.string(),
          county: z.string().optional(),
          postcode: z.string(),
          country: z.string()
        }).optional()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const updates = request.body as any

    try {
      const officer = await companyService.updateCompanyOfficer(id, updates)
      return {
        success: true,
        data: officer
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Officer not found'
      })
    }
  })

  // Remove company officer
  app.delete('/companies/officers/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    try {
      await companyService.removeCompanyOfficer(id)
      return {
        success: true,
        message: 'Officer removed successfully'
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Officer not found'
      })
    }
  })

  // ============================================================================
  // SHAREHOLDERS ROUTES
  // ============================================================================

  // Get company shareholders
  app.get('/companies/:companyId/shareholders', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const shareholders = await companyService.getCompanyShareholders(companyId)

    return {
      success: true,
      data: shareholders
    }
  })

  // Add company shareholder
  app.post('/companies/:companyId/shareholders', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.object({
        userId: z.string().uuid().optional(),
        name: z.string(),
        shareholderType: z.enum(['individual', 'corporate', 'trust', 'partnership']),
        shareClassId: z.string().uuid(),
        numberOfShares: z.number(),
        address: z.object({
          line1: z.string(),
          line2: z.string().optional(),
          city: z.string(),
          county: z.string().optional(),
          postcode: z.string(),
          country: z.string()
        }).optional(),
        nationality: z.string().optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const shareholderData = request.body as any

    try {
      const shareholder = await companyService.addCompanyShareholder(companyId, shareholderData)
      return reply.status(201).send({
        success: true,
        data: shareholder
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to add shareholder'
      })
    }
  })

  // Update company shareholder
  app.put('/companies/shareholders/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: z.object({
        userId: z.string().uuid().optional(),
        name: z.string().optional(),
        shareholderType: z.enum(['individual', 'corporate', 'trust', 'partnership']).optional(),
        shareClassId: z.string().uuid().optional(),
        numberOfShares: z.number().optional(),
        address: z.object({
          line1: z.string(),
          line2: z.string().optional(),
          city: z.string(),
          county: z.string().optional(),
          postcode: z.string(),
          country: z.string()
        }).optional(),
        nationality: z.string().optional()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const updates = request.body as any

    try {
      const shareholder = await companyService.updateCompanyShareholder(id, updates)
      return {
        success: true,
        data: shareholder
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Shareholder not found'
      })
    }
  })

  // Remove company shareholder
  app.delete('/companies/shareholders/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    try {
      await companyService.removeCompanyShareholder(id)
      return {
        success: true,
        message: 'Shareholder removed successfully'
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Shareholder not found'
      })
    }
  })

  // ============================================================================
  // SHARE CLASSES ROUTES
  // ============================================================================

  // Get company share classes
  app.get('/companies/:companyId/share-classes', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const shareClasses = await companyService.getCompanyShareClasses(companyId)

    return {
      success: true,
      data: shareClasses
    }
  })

  // Create share class
  app.post('/companies/:companyId/share-classes', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      }),
      body: z.object({
        name: z.string(),
        code: z.string(),
        totalShares: z.number(),
        nominalValue: z.number(),
        currency: z.string(),
        votingRights: z.boolean(),
        dividendRights: z.boolean(),
        liquidationPreference: z.number().optional(),
        conversionRights: z.boolean().optional(),
        redemptionRights: z.boolean().optional()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const shareClassData = request.body as any

    try {
      const shareClass = await companyService.createShareClass(companyId, shareClassData)
      return reply.status(201).send({
        success: true,
        data: shareClass
      })
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Failed to create share class'
      })
    }
  })

  // Update share class
  app.put('/companies/share-classes/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      }),
      body: z.object({
        name: z.string().optional(),
        code: z.string().optional(),
        totalShares: z.number().optional(),
        nominalValue: z.number().optional(),
        currency: z.string().optional(),
        votingRights: z.boolean().optional(),
        dividendRights: z.boolean().optional(),
        liquidationPreference: z.number().optional(),
        conversionRights: z.boolean().optional(),
        redemptionRights: z.boolean().optional()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }
    const updates = request.body as any

    try {
      const shareClass = await companyService.updateShareClass(id, updates)
      return {
        success: true,
        data: shareClass
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Share class not found'
      })
    }
  })

  // Delete share class
  app.delete('/companies/share-classes/:id', {
    schema: {
      params: z.object({
        id: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { id } = request.params as { id: string }

    try {
      await companyService.deleteShareClass(id)
      return {
        success: true,
        message: 'Share class deleted successfully'
      }
    } catch (error) {
      return reply.status(404).send({
        success: false,
        error: 'Share class not found'
      })
    }
  })

  // ============================================================================
  // SHAREHOLDINGS ROUTES
  // ============================================================================

  // Get shareholdings for shareholder
  app.get('/shareholders/:shareholderId/shareholdings', {
    schema: {
      params: z.object({
        shareholderId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { shareholderId } = request.params as { shareholderId: string }
    const shareholdings = await companyService.getShareholdings(shareholderId)

    return {
      success: true,
      data: shareholdings
    }
  })

  // Transfer shares
  app.post('/shareholdings/:shareholdingId/transfer', {
    schema: {
      params: z.object({
        shareholdingId: z.string().uuid()
      }),
      body: z.object({
        newShareholderId: z.string().uuid(),
        numberOfShares: z.number()
      })
    }
  }, async (request, reply) => {
    const { shareholdingId } = request.params as { shareholdingId: string }
    const { newShareholderId, numberOfShares } = request.body as any

    try {
      const shareholding = await companyService.transferShares(shareholdingId, newShareholderId, numberOfShares)
      return {
        success: true,
        data: shareholding
      }
    } catch (error) {
      return reply.status(400).send({
        success: false,
        error: 'Share transfer failed'
      })
    }
  })

  // ============================================================================
  // STATS ROUTES
  // ============================================================================

  // Get company stats
  app.get('/companies/:companyId/stats', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }
    const stats = await companyService.getCompanyStats(companyId)

    return {
      success: true,
      data: stats
    }
  })

  // ============================================================================
  // SEARCH ROUTES
  // ============================================================================

  // Search companies
  app.get('/companies/search', {
    schema: {
      querystring: z.object({
        q: z.string(),
        companyType: z.string().optional(),
        companyStatus: z.string().optional(),
        industry: z.string().optional(),
        location: z.string().optional(),
        sicCode: z.string().optional(),
        incorporationDateFrom: z.string().optional(),
        incorporationDateTo: z.string().optional(),
        hasFunding: z.string().transform(val => val === 'true').optional(),
        fundingRangeMin: z.string().transform(Number).optional(),
        fundingRangeMax: z.string().transform(Number).optional()
      })
    }
  }, async (request, reply) => {
    const query = request.query as any

    const filters = {
      companyType: query.companyType?.split(','),
      companyStatus: query.companyStatus?.split(','),
      industry: query.industry?.split(','),
      location: query.location,
      sicCode: query.sicCode?.split(','),
      incorporationDateFrom: query.incorporationDateFrom,
      incorporationDateTo: query.incorporationDateTo,
      hasFunding: query.hasFunding,
      fundingRange: query.fundingRangeMin && query.fundingRangeMax ? {
        min: query.fundingRangeMin,
        max: query.fundingRangeMax
      } : undefined
    }

    const companies = await companyService.searchCompanies(query.q, filters)

    return {
      success: true,
      data: companies
    }
  })

  // Get recommended companies
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
    const recommendations = await companyService.getRecommendedCompanies(userId, limit)

    return {
      success: true,
      data: recommendations
    }
  })

  // ============================================================================
  // VALIDATION ROUTES
  // ============================================================================

  // Validate company details
  app.post('/companies/validate', {
    schema: {
      body: z.object({
        name: z.string().optional(),
        tradingName: z.string().optional(),
        companyType: z.enum(['ltd', 'plc', 'llp', 'partnership', 'sole_trader', 'cic', 'charity']).optional(),
        registeredAddress: z.object({
          line1: z.string(),
          line2: z.string().optional(),
          city: z.string(),
          county: z.string().optional(),
          postcode: z.string(),
          country: z.string()
        }).optional(),
        businessAddress: z.object({
          line1: z.string(),
          line2: z.string().optional(),
          city: z.string(),
          county: z.string().optional(),
          postcode: z.string(),
          country: z.string()
        }).optional(),
        sicCodes: z.array(z.string()).optional(),
        natureOfBusiness: z.string().optional(),
        industry: z.string().optional(),
        sector: z.string().optional()
      })
    }
  }, async (request, reply) => {
    const companyDetails = request.body as any
    const validation = await companyService.validateCompanyDetails(companyDetails)

    return {
      success: true,
      data: validation
    }
  })

  // ============================================================================
  // EXTERNAL INTEGRATION ROUTES
  // ============================================================================

  // Sync with Companies House
  app.post('/companies/:companyId/sync/companies-house', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }

    try {
      await companyService.syncWithCompaniesHouse(companyId)
      return {
        success: true,
        message: 'Sync with Companies House completed'
      }
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: 'Sync failed'
      })
    }
  })

  // Sync with HMRC
  app.post('/companies/:companyId/sync/hmrc', {
    schema: {
      params: z.object({
        companyId: z.string().uuid()
      })
    }
  }, async (request, reply) => {
    const { companyId } = request.params as { companyId: string }

    try {
      await companyService.syncWithHMRC(companyId)
      return {
        success: true,
        message: 'Sync with HMRC completed'
      }
    } catch (error) {
      return reply.status(500).send({
        success: false,
        error: 'Sync failed'
      })
    }
  })
}