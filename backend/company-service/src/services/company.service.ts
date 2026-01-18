import { PrismaClient } from '@prisma/client'
import {
  Company,
  CompanyMember,
  Officer,
  Shareholder,
  ShareClass,
  Shareholding,
  CompanyStats,
  IncorporationData,
  IncorporationResult,
  UpdateCompanyRequest,
  CreateCompanyMemberRequest,
  UpdateCompanyMemberRequest,
  CreateOfficerRequest,
  CreateShareholderRequest,
  CreateShareClassRequest,
  CompanyService,
  CompanySearchFilters,
  Address
} from '../types/company'

export class CompanyServiceImpl implements CompanyService {
  constructor(private prisma: PrismaClient) {}

  // ============================================================================
  // COMPANY CRUD OPERATIONS
  // ============================================================================

  async getCompany(id: string): Promise<Company | null> {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        registeredAddress: true,
        businessAddress: true
      }
    })

    if (!company) return null

    return {
      id: company.id,
      name: company.name,
      tradingName: company.tradingName || undefined,
      companyNumber: company.companyNumber || undefined,
      companyType: company.companyType,
      companyStatus: company.companyStatus,
      incorporationDate: company.incorporationDate?.toISOString(),
      accountingReferenceDate: company.accountingReferenceDate || undefined,
      firstAccountsDue: company.firstAccountsDue || undefined,
      nextAccountsDue: company.nextAccountsDue || undefined,
      nextConfirmationStatementDue: company.nextConfirmationStatementDue || undefined,
      registeredAddress: {
        line1: company.registeredAddress.line1,
        line2: company.registeredAddress.line2 || undefined,
        city: company.registeredAddress.city,
        county: company.registeredAddress.county || undefined,
        postcode: company.registeredAddress.postcode,
        country: company.registeredAddress.country
      },
      businessAddress: company.businessAddress ? {
        line1: company.businessAddress.line1,
        line2: company.businessAddress.line2 || undefined,
        city: company.businessAddress.city,
        county: company.businessAddress.county || undefined,
        postcode: company.businessAddress.postcode,
        country: company.businessAddress.country
      } : undefined,
      sicCodes: company.sicCodes,
      natureOfBusiness: company.natureOfBusiness || undefined,
      industry: company.industry || undefined,
      sector: company.sector || undefined,
      corporationTaxReference: company.corporationTaxReference || undefined,
      vatNumber: company.vatNumber || undefined,
      vatRegistered: company.vatRegistered,
      payeReference: company.payeReference || undefined,
      payeRegistered: company.payeRegistered,
      seisEligible: company.seisEligible || undefined,
      seisAdvanceAssuranceStatus: company.seisAdvanceAssuranceStatus || undefined,
      seisAdvanceAssuranceDate: company.seisAdvanceAssuranceDate?.toISOString(),
      seisAllocationRemaining: company.seisAllocationRemaining,
      eisEligible: company.eisEligible || undefined,
      eisAdvanceAssuranceStatus: company.eisAdvanceAssuranceStatus || undefined,
      eisAdvanceAssuranceDate: company.eisAdvanceAssuranceDate?.toISOString(),
      currentCashBalance: company.currentCashBalance || undefined,
      monthlyBurnRate: company.monthlyBurnRate || undefined,
      runwayMonths: company.runwayMonths || undefined,
      totalFundingRaised: company.totalFundingRaised,
      lastValuation: company.lastValuation || undefined,
      lastValuationDate: company.lastValuationDate?.toISOString(),
      defaultCurrency: company.defaultCurrency,
      financialYearEndMonth: company.financialYearEndMonth,
      createdAt: company.createdAt.toISOString(),
      updatedAt: company.updatedAt.toISOString()
    }
  }

  async getUserCompanies(userId: string): Promise<Company[]> {
    const memberships = await this.prisma.companyMember.findMany({
      where: {
        userId,
        isActive: true
      },
      include: {
        company: {
          include: {
            registeredAddress: true,
            businessAddress: true
          }
        }
      }
    })

    return memberships.map(membership => ({
      id: membership.company.id,
      name: membership.company.name,
      tradingName: membership.company.tradingName || undefined,
      companyNumber: membership.company.companyNumber || undefined,
      companyType: membership.company.companyType,
      companyStatus: membership.company.companyStatus,
      incorporationDate: membership.company.incorporationDate?.toISOString(),
      accountingReferenceDate: membership.company.accountingReferenceDate || undefined,
      firstAccountsDue: membership.company.firstAccountsDue || undefined,
      nextAccountsDue: membership.company.nextAccountsDue || undefined,
      nextConfirmationStatementDue: membership.company.nextConfirmationStatementDue || undefined,
      registeredAddress: {
        line1: membership.company.registeredAddress.line1,
        line2: membership.company.registeredAddress.line2 || undefined,
        city: membership.company.registeredAddress.city,
        county: membership.company.registeredAddress.county || undefined,
        postcode: membership.company.registeredAddress.postcode,
        country: membership.company.registeredAddress.country
      },
      businessAddress: membership.company.businessAddress ? {
        line1: membership.company.businessAddress.line1,
        line2: membership.company.businessAddress.line2 || undefined,
        city: membership.company.businessAddress.city,
        county: membership.company.businessAddress.county || undefined,
        postcode: membership.company.businessAddress.postcode,
        country: membership.company.businessAddress.country
      } : undefined,
      sicCodes: membership.company.sicCodes,
      natureOfBusiness: membership.company.natureOfBusiness || undefined,
      industry: membership.company.industry || undefined,
      sector: membership.company.sector || undefined,
      corporationTaxReference: membership.company.corporationTaxReference || undefined,
      vatNumber: membership.company.vatNumber || undefined,
      vatRegistered: membership.company.vatRegistered,
      payeReference: membership.company.payeReference || undefined,
      payeRegistered: membership.company.payeRegistered,
      seisEligible: membership.company.seisEligible || undefined,
      seisAdvanceAssuranceStatus: membership.company.seisAdvanceAssuranceStatus || undefined,
      seisAdvanceAssuranceDate: membership.company.seisAdvanceAssuranceDate?.toISOString(),
      seisAllocationRemaining: membership.company.seisAllocationRemaining,
      eisEligible: membership.company.eisEligible || undefined,
      eisAdvanceAssuranceStatus: membership.company.eisAdvanceAssuranceStatus || undefined,
      eisAdvanceAssuranceDate: membership.company.eisAdvanceAssuranceDate?.toISOString(),
      currentCashBalance: membership.company.currentCashBalance || undefined,
      monthlyBurnRate: membership.company.monthlyBurnRate || undefined,
      runwayMonths: membership.company.runwayMonths || undefined,
      totalFundingRaised: membership.company.totalFundingRaised,
      lastValuation: membership.company.lastValuation || undefined,
      lastValuationDate: membership.company.lastValuationDate?.toISOString(),
      defaultCurrency: membership.company.defaultCurrency,
      financialYearEndMonth: membership.company.financialYearEndMonth,
      createdAt: membership.company.createdAt.toISOString(),
      updatedAt: membership.company.updatedAt.toISOString()
    }))
  }

  async createCompany(userId: string, companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<Company> {
    const company = await this.prisma.company.create({
      data: {
        ...companyData,
        registeredAddress: {
          create: companyData.registeredAddress
        },
        businessAddress: companyData.businessAddress ? {
          create: companyData.businessAddress
        } : undefined
      },
      include: {
        registeredAddress: true,
        businessAddress: true
      }
    })

    // Add the creator as the first member
    await this.prisma.companyMember.create({
      data: {
        companyId: company.id,
        userId,
        role: 'owner',
        isActive: true
      }
    })

    return {
      id: company.id,
      name: company.name,
      tradingName: company.tradingName || undefined,
      companyNumber: company.companyNumber || undefined,
      companyType: company.companyType,
      companyStatus: company.companyStatus,
      incorporationDate: company.incorporationDate?.toISOString(),
      accountingReferenceDate: company.accountingReferenceDate || undefined,
      firstAccountsDue: company.firstAccountsDue || undefined,
      nextAccountsDue: company.nextAccountsDue || undefined,
      nextConfirmationStatementDue: company.nextConfirmationStatementDue || undefined,
      registeredAddress: {
        line1: company.registeredAddress.line1,
        line2: company.registeredAddress.line2 || undefined,
        city: company.registeredAddress.city,
        county: company.registeredAddress.county || undefined,
        postcode: company.registeredAddress.postcode,
        country: company.registeredAddress.country
      },
      businessAddress: company.businessAddress ? {
        line1: company.businessAddress.line1,
        line2: company.businessAddress.line2 || undefined,
        city: company.businessAddress.city,
        county: company.businessAddress.county || undefined,
        postcode: company.businessAddress.postcode,
        country: company.businessAddress.country
      } : undefined,
      sicCodes: company.sicCodes,
      natureOfBusiness: company.natureOfBusiness || undefined,
      industry: company.industry || undefined,
      sector: company.sector || undefined,
      corporationTaxReference: company.corporationTaxReference || undefined,
      vatNumber: company.vatNumber || undefined,
      vatRegistered: company.vatRegistered,
      payeReference: company.payeReference || undefined,
      payeRegistered: company.payeRegistered,
      seisEligible: company.seisEligible || undefined,
      seisAdvanceAssuranceStatus: company.seisAdvanceAssuranceStatus || undefined,
      seisAdvanceAssuranceDate: company.seisAdvanceAssuranceDate?.toISOString(),
      seisAllocationRemaining: company.seisAllocationRemaining,
      eisEligible: company.eisEligible || undefined,
      eisAdvanceAssuranceStatus: company.eisAdvanceAssuranceStatus || undefined,
      eisAdvanceAssuranceDate: company.eisAdvanceAssuranceDate?.toISOString(),
      currentCashBalance: company.currentCashBalance || undefined,
      monthlyBurnRate: company.monthlyBurnRate || undefined,
      runwayMonths: company.runwayMonths || undefined,
      totalFundingRaised: company.totalFundingRaised,
      lastValuation: company.lastValuation || undefined,
      lastValuationDate: company.lastValuationDate?.toISOString(),
      defaultCurrency: company.defaultCurrency,
      financialYearEndMonth: company.financialYearEndMonth,
      createdAt: company.createdAt.toISOString(),
      updatedAt: company.updatedAt.toISOString()
    }
  }

  async updateCompany(id: string, updates: UpdateCompanyRequest): Promise<Company> {
    const updateData: any = { ...updates }

    // Handle address updates
    if (updates.registeredAddress) {
      updateData.registeredAddress = {
        update: updates.registeredAddress
      }
    }

    if (updates.businessAddress) {
      updateData.businessAddress = {
        upsert: {
          create: updates.businessAddress,
          update: updates.businessAddress
        }
      }
    }

    const company = await this.prisma.company.update({
      where: { id },
      data: updateData,
      include: {
        registeredAddress: true,
        businessAddress: true
      }
    })

    return {
      id: company.id,
      name: company.name,
      tradingName: company.tradingName || undefined,
      companyNumber: company.companyNumber || undefined,
      companyType: company.companyType,
      companyStatus: company.companyStatus,
      incorporationDate: company.incorporationDate?.toISOString(),
      accountingReferenceDate: company.accountingReferenceDate || undefined,
      firstAccountsDue: company.firstAccountsDue || undefined,
      nextAccountsDue: company.nextAccountsDue || undefined,
      nextConfirmationStatementDue: company.nextConfirmationStatementDue || undefined,
      registeredAddress: {
        line1: company.registeredAddress.line1,
        line2: company.registeredAddress.line2 || undefined,
        city: company.registeredAddress.city,
        county: company.registeredAddress.county || undefined,
        postcode: company.registeredAddress.postcode,
        country: company.registeredAddress.country
      },
      businessAddress: company.businessAddress ? {
        line1: company.businessAddress.line1,
        line2: company.businessAddress.line2 || undefined,
        city: company.businessAddress.city,
        county: company.businessAddress.county || undefined,
        postcode: company.businessAddress.postcode,
        country: company.businessAddress.country
      } : undefined,
      sicCodes: company.sicCodes,
      natureOfBusiness: company.natureOfBusiness || undefined,
      industry: company.industry || undefined,
      sector: company.sector || undefined,
      corporationTaxReference: company.corporationTaxReference || undefined,
      vatNumber: company.vatNumber || undefined,
      vatRegistered: company.vatRegistered,
      payeReference: company.payeReference || undefined,
      payeRegistered: company.payeRegistered,
      seisEligible: company.seisEligible || undefined,
      seisAdvanceAssuranceStatus: company.seisAdvanceAssuranceStatus || undefined,
      seisAdvanceAssuranceDate: company.seisAdvanceAssuranceDate?.toISOString(),
      seisAllocationRemaining: company.seisAllocationRemaining,
      eisEligible: company.eisEligible || undefined,
      eisAdvanceAssuranceStatus: company.eisAdvanceAssuranceStatus || undefined,
      eisAdvanceAssuranceDate: company.eisAdvanceAssuranceDate?.toISOString(),
      currentCashBalance: company.currentCashBalance || undefined,
      monthlyBurnRate: company.monthlyBurnRate || undefined,
      runwayMonths: company.runwayMonths || undefined,
      totalFundingRaised: company.totalFundingRaised,
      lastValuation: company.lastValuation || undefined,
      lastValuationDate: company.lastValuationDate?.toISOString(),
      defaultCurrency: company.defaultCurrency,
      financialYearEndMonth: company.financialYearEndMonth,
      createdAt: company.createdAt.toISOString(),
      updatedAt: company.updatedAt.toISOString()
    }
  }

  async deleteCompany(id: string): Promise<void> {
    await this.prisma.company.delete({
      where: { id }
    })
  }

  // ============================================================================
  // INCORPORATION
  // ============================================================================

  async incorporateCompany(userId: string, incorporationData: IncorporationData): Promise<IncorporationResult> {
    // This would integrate with Companies House API
    // For now, return a mock result
    const mockResult: IncorporationResult = {
      companyNumber: `COMP${Date.now()}`,
      incorporationDate: new Date().toISOString(),
      status: 'incorporated'
    }

    // Update company with incorporation details
    await this.prisma.company.updateMany({
      where: {
        name: incorporationData.name,
        companyMembers: {
          some: {
            userId,
            role: 'owner'
          }
        }
      },
      data: {
        companyNumber: mockResult.companyNumber,
        incorporationDate: new Date(mockResult.incorporationDate),
        companyStatus: 'active'
      }
    })

    return mockResult
  }

  async getIncorporationStatus(companyId: string): Promise<IncorporationResult | null> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: {
        companyNumber: true,
        incorporationDate: true,
        companyStatus: true
      }
    })

    if (!company || !company.companyNumber) return null

    return {
      companyNumber: company.companyNumber,
      incorporationDate: company.incorporationDate!.toISOString(),
      status: 'incorporated'
    }
  }

  // ============================================================================
  // COMPANY MEMBERS
  // ============================================================================

  async getCompanyMembers(companyId: string): Promise<CompanyMember[]> {
    const members = await this.prisma.companyMember.findMany({
      where: { companyId },
      include: { user: true },
      orderBy: { appointmentDate: 'asc' }
    })

    return members.map(member => ({
      id: member.id,
      companyId: member.companyId,
      userId: member.userId,
      role: member.role,
      title: member.title || undefined,
      appointmentDate: member.appointmentDate.toISOString(),
      resignationDate: member.resignationDate?.toISOString(),
      isActive: member.isActive,
      shareholdingPercentage: member.shareholdingPercentage || undefined,
      votingRights: member.votingRights || undefined,
      salary: member.salary || undefined,
      equityStake: member.equityStake || undefined,
      createdAt: member.createdAt.toISOString(),
      updatedAt: member.updatedAt.toISOString()
    }))
  }

  async addCompanyMember(companyId: string, memberData: CreateCompanyMemberRequest): Promise<CompanyMember> {
    const member = await this.prisma.companyMember.create({
      data: {
        companyId,
        ...memberData,
        appointmentDate: new Date(),
        isActive: true
      },
      include: { user: true }
    })

    return {
      id: member.id,
      companyId: member.companyId,
      userId: member.userId,
      role: member.role,
      title: member.title || undefined,
      appointmentDate: member.appointmentDate.toISOString(),
      resignationDate: member.resignationDate?.toISOString(),
      isActive: member.isActive,
      shareholdingPercentage: member.shareholdingPercentage || undefined,
      votingRights: member.votingRights || undefined,
      salary: member.salary || undefined,
      equityStake: member.equityStake || undefined,
      createdAt: member.createdAt.toISOString(),
      updatedAt: member.updatedAt.toISOString()
    }
  }

  async updateCompanyMember(id: string, updates: UpdateCompanyMemberRequest): Promise<CompanyMember> {
    const member = await this.prisma.companyMember.update({
      where: { id },
      data: {
        ...updates,
        updatedAt: new Date()
      },
      include: { user: true }
    })

    return {
      id: member.id,
      companyId: member.companyId,
      userId: member.userId,
      role: member.role,
      title: member.title || undefined,
      appointmentDate: member.appointmentDate.toISOString(),
      resignationDate: member.resignationDate?.toISOString(),
      isActive: member.isActive,
      shareholdingPercentage: member.shareholdingPercentage || undefined,
      votingRights: member.votingRights || undefined,
      salary: member.salary || undefined,
      equityStake: member.equityStake || undefined,
      createdAt: member.createdAt.toISOString(),
      updatedAt: member.updatedAt.toISOString()
    }
  }

  async removeCompanyMember(id: string): Promise<void> {
    await this.prisma.companyMember.update({
      where: { id },
      data: {
        isActive: false,
        resignationDate: new Date(),
        updatedAt: new Date()
      }
    })
  }

  // ============================================================================
  // OFFICERS
  // ============================================================================

  async getCompanyOfficers(companyId: string): Promise<Officer[]> {
    const officers = await this.prisma.officer.findMany({
      where: { companyId },
      include: { user: true },
      orderBy: { appointmentDate: 'asc' }
    })

    return officers.map(officer => ({
      id: officer.id,
      companyId: officer.companyId,
      userId: officer.userId || undefined,
      name: officer.name,
      role: officer.role,
      appointmentDate: officer.appointmentDate.toISOString(),
      resignationDate: officer.resignationDate?.toISOString(),
      isActive: officer.isActive,
      nationality: officer.nationality || undefined,
      occupation: officer.occupation || undefined,
      countryOfResidence: officer.countryOfResidence || undefined,
      serviceAddress: officer.serviceAddress ? {
        line1: officer.serviceAddress.line1,
        line2: officer.serviceAddress.line2 || undefined,
        city: officer.serviceAddress.city,
        county: officer.serviceAddress.county || undefined,
        postcode: officer.serviceAddress.postcode,
        country: officer.serviceAddress.country
      } : undefined,
      createdAt: officer.createdAt.toISOString(),
      updatedAt: officer.updatedAt.toISOString()
    }))
  }

  async addCompanyOfficer(companyId: string, officerData: CreateOfficerRequest): Promise<Officer> {
    const officer = await this.prisma.officer.create({
      data: {
        companyId,
        ...officerData,
        appointmentDate: new Date(),
        isActive: true,
        serviceAddress: officerData.serviceAddress ? {
          create: officerData.serviceAddress
        } : undefined
      },
      include: { user: true }
    })

    return {
      id: officer.id,
      companyId: officer.companyId,
      userId: officer.userId || undefined,
      name: officer.name,
      role: officer.role,
      appointmentDate: officer.appointmentDate.toISOString(),
      resignationDate: officer.resignationDate?.toISOString(),
      isActive: officer.isActive,
      nationality: officer.nationality || undefined,
      occupation: officer.occupation || undefined,
      countryOfResidence: officer.countryOfResidence || undefined,
      serviceAddress: officer.serviceAddress ? {
        line1: officer.serviceAddress.line1,
        line2: officer.serviceAddress.line2 || undefined,
        city: officer.serviceAddress.city,
        county: officer.serviceAddress.county || undefined,
        postcode: officer.serviceAddress.postcode,
        country: officer.serviceAddress.country
      } : undefined,
      createdAt: officer.createdAt.toISOString(),
      updatedAt: officer.updatedAt.toISOString()
    }
  }

  async updateCompanyOfficer(id: string, updates: Partial<Officer>): Promise<Officer> {
    const updateData: any = { ...updates }

    if (updates.serviceAddress) {
      updateData.serviceAddress = {
        upsert: {
          create: updates.serviceAddress,
          update: updates.serviceAddress
        }
      }
    }

    const officer = await this.prisma.officer.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: { user: true }
    })

    return {
      id: officer.id,
      companyId: officer.companyId,
      userId: officer.userId || undefined,
      name: officer.name,
      role: officer.role,
      appointmentDate: officer.appointmentDate.toISOString(),
      resignationDate: officer.resignationDate?.toISOString(),
      isActive: officer.isActive,
      nationality: officer.nationality || undefined,
      occupation: officer.occupation || undefined,
      countryOfResidence: officer.countryOfResidence || undefined,
      serviceAddress: officer.serviceAddress ? {
        line1: officer.serviceAddress.line1,
        line2: officer.serviceAddress.line2 || undefined,
        city: officer.serviceAddress.city,
        county: officer.serviceAddress.county || undefined,
        postcode: officer.serviceAddress.postcode,
        country: officer.serviceAddress.country
      } : undefined,
      createdAt: officer.createdAt.toISOString(),
      updatedAt: officer.updatedAt.toISOString()
    }
  }

  async removeCompanyOfficer(id: string): Promise<void> {
    await this.prisma.officer.update({
      where: { id },
      data: {
        isActive: false,
        resignationDate: new Date(),
        updatedAt: new Date()
      }
    })
  }

  // ============================================================================
  // SHAREHOLDERS
  // ============================================================================

  async getCompanyShareholders(companyId: string): Promise<Shareholder[]> {
    const shareholders = await this.prisma.shareholder.findMany({
      where: { companyId },
      include: { shareClass: true, user: true },
      orderBy: { issueDate: 'asc' }
    })

    return shareholders.map(shareholder => ({
      id: shareholder.id,
      companyId: shareholder.companyId,
      userId: shareholder.userId || undefined,
      name: shareholder.name,
      shareholderType: shareholder.shareholderType,
      shareClassId: shareholder.shareClassId,
      numberOfShares: shareholder.numberOfShares,
      percentageOwnership: shareholder.percentageOwnership,
      issueDate: shareholder.issueDate.toISOString(),
      certificateNumber: shareholder.certificateNumber || undefined,
      address: shareholder.address ? {
        line1: shareholder.address.line1,
        line2: shareholder.address.line2 || undefined,
        city: shareholder.address.city,
        county: shareholder.address.county || undefined,
        postcode: shareholder.address.postcode,
        country: shareholder.address.country
      } : undefined,
      nationality: shareholder.nationality || undefined,
      createdAt: shareholder.createdAt.toISOString(),
      updatedAt: shareholder.updatedAt.toISOString()
    }))
  }

  async addCompanyShareholder(companyId: string, shareholderData: CreateShareholderRequest): Promise<Shareholder> {
    const shareholder = await this.prisma.shareholder.create({
      data: {
        companyId,
        ...shareholderData,
        issueDate: new Date(),
        percentageOwnership: 0, // Will be calculated
        address: shareholderData.address ? {
          create: shareholderData.address
        } : undefined
      },
      include: { shareClass: true, user: true }
    })

    // Recalculate ownership percentages
    await this.recalculateOwnershipPercentages(companyId)

    return {
      id: shareholder.id,
      companyId: shareholder.companyId,
      userId: shareholder.userId || undefined,
      name: shareholder.name,
      shareholderType: shareholder.shareholderType,
      shareClassId: shareholder.shareClassId,
      numberOfShares: shareholder.numberOfShares,
      percentageOwnership: shareholder.percentageOwnership,
      issueDate: shareholder.issueDate.toISOString(),
      certificateNumber: shareholder.certificateNumber || undefined,
      address: shareholder.address ? {
        line1: shareholder.address.line1,
        line2: shareholder.address.line2 || undefined,
        city: shareholder.address.city,
        county: shareholder.address.county || undefined,
        postcode: shareholder.address.postcode,
        country: shareholder.address.country
      } : undefined,
      nationality: shareholder.nationality || undefined,
      createdAt: shareholder.createdAt.toISOString(),
      updatedAt: shareholder.updatedAt.toISOString()
    }
  }

  async updateCompanyShareholder(id: string, updates: Partial<Shareholder>): Promise<Shareholder> {
    const updateData: any = { ...updates }

    if (updates.address) {
      updateData.address = {
        upsert: {
          create: updates.address,
          update: updates.address
        }
      }
    }

    const shareholder = await this.prisma.shareholder.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      include: { shareClass: true, user: true }
    })

    // Recalculate ownership percentages if shares changed
    if (updates.numberOfShares !== undefined) {
      await this.recalculateOwnershipPercentages(shareholder.companyId)
    }

    return {
      id: shareholder.id,
      companyId: shareholder.companyId,
      userId: shareholder.userId || undefined,
      name: shareholder.name,
      shareholderType: shareholder.shareholderType,
      shareClassId: shareholder.shareClassId,
      numberOfShares: shareholder.numberOfShares,
      percentageOwnership: shareholder.percentageOwnership,
      issueDate: shareholder.issueDate.toISOString(),
      certificateNumber: shareholder.certificateNumber || undefined,
      address: shareholder.address ? {
        line1: shareholder.address.line1,
        line2: shareholder.address.line2 || undefined,
        city: shareholder.address.city,
        county: shareholder.address.county || undefined,
        postcode: shareholder.address.postcode,
        country: shareholder.address.country
      } : undefined,
      nationality: shareholder.nationality || undefined,
      createdAt: shareholder.createdAt.toISOString(),
      updatedAt: shareholder.updatedAt.toISOString()
    }
  }

  async removeCompanyShareholder(id: string): Promise<void> {
    const shareholder = await this.prisma.shareholder.findUnique({
      where: { id },
      select: { companyId: true }
    })

    await this.prisma.shareholder.delete({
      where: { id }
    })

    // Recalculate ownership percentages
    if (shareholder) {
      await this.recalculateOwnershipPercentages(shareholder.companyId)
    }
  }

  // ============================================================================
  // SHARE CLASSES
  // ============================================================================

  async getCompanyShareClasses(companyId: string): Promise<ShareClass[]> {
    const shareClasses = await this.prisma.shareClass.findMany({
      where: { companyId },
      orderBy: { createdAt: 'asc' }
    })

    return shareClasses.map(shareClass => ({
      id: shareClass.id,
      companyId: shareClass.companyId,
      name: shareClass.name,
      code: shareClass.code,
      totalShares: shareClass.totalShares,
      nominalValue: shareClass.nominalValue,
      currency: shareClass.currency,
      votingRights: shareClass.votingRights,
      dividendRights: shareClass.dividendRights,
      liquidationPreference: shareClass.liquidationPreference || undefined,
      conversionRights: shareClass.conversionRights || undefined,
      redemptionRights: shareClass.redemptionRights || undefined,
      createdAt: shareClass.createdAt.toISOString(),
      updatedAt: shareClass.updatedAt.toISOString()
    }))
  }

  async createShareClass(companyId: string, shareClassData: CreateShareClassRequest): Promise<ShareClass> {
    const shareClass = await this.prisma.shareClass.create({
      data: {
        companyId,
        ...shareClassData
      }
    })

    return {
      id: shareClass.id,
      companyId: shareClass.companyId,
      name: shareClass.name,
      code: shareClass.code,
      totalShares: shareClass.totalShares,
      nominalValue: shareClass.nominalValue,
      currency: shareClass.currency,
      votingRights: shareClass.votingRights,
      dividendRights: shareClass.dividendRights,
      liquidationPreference: shareClass.liquidationPreference || undefined,
      conversionRights: shareClass.conversionRights || undefined,
      redemptionRights: shareClass.redemptionRights || undefined,
      createdAt: shareClass.createdAt.toISOString(),
      updatedAt: shareClass.updatedAt.toISOString()
    }
  }

  async updateShareClass(id: string, updates: Partial<ShareClass>): Promise<ShareClass> {
    const shareClass = await this.prisma.shareClass.update({
      where: { id },
      data: {
        ...updates,
        updatedAt: new Date()
      }
    })

    return {
      id: shareClass.id,
      companyId: shareClass.companyId,
      name: shareClass.name,
      code: shareClass.code,
      totalShares: shareClass.totalShares,
      nominalValue: shareClass.nominalValue,
      currency: shareClass.currency,
      votingRights: shareClass.votingRights,
      dividendRights: shareClass.dividendRights,
      liquidationPreference: shareClass.liquidationPreference || undefined,
      conversionRights: shareClass.conversionRights || undefined,
      redemptionRights: shareClass.redemptionRights || undefined,
      createdAt: shareClass.createdAt.toISOString(),
      updatedAt: shareClass.updatedAt.toISOString()
    }
  }

  async deleteShareClass(id: string): Promise<void> {
    await this.prisma.shareClass.delete({
      where: { id }
    })
  }

  // ============================================================================
  // SHAREHOLDINGS
  // ============================================================================

  async getShareholdings(shareholderId: string): Promise<Shareholding[]> {
    const shareholdings = await this.prisma.shareholding.findMany({
      where: { shareholderId },
      include: { shareholder: true, shareClass: true },
      orderBy: { issueDate: 'asc' }
    })

    return shareholdings.map(holding => ({
      id: holding.id,
      shareholderId: holding.shareholderId,
      shareClassId: holding.shareClassId,
      numberOfShares: holding.numberOfShares,
      percentageOwnership: holding.percentageOwnership,
      issueDate: holding.issueDate.toISOString(),
      certificateNumber: holding.certificateNumber || undefined,
      createdAt: holding.createdAt.toISOString(),
      updatedAt: holding.updatedAt.toISOString()
    }))
  }

  async transferShares(shareholdingId: string, newShareholderId: string, numberOfShares: number): Promise<Shareholding> {
    // This would implement share transfer logic
    // For now, return a mock result
    const shareholding = await this.prisma.shareholding.findUnique({
      where: { id: shareholdingId }
    })

    if (!shareholding) {
      throw new Error('Shareholding not found')
    }

    // Mock implementation - in reality this would be more complex
    const newHolding = await this.prisma.shareholding.create({
      data: {
        shareholderId: newShareholderId,
        shareClassId: shareholding.shareClassId,
        numberOfShares,
        percentageOwnership: 0, // Would be calculated
        issueDate: new Date()
      }
    })

    return {
      id: newHolding.id,
      shareholderId: newHolding.shareholderId,
      shareClassId: newHolding.shareClassId,
      numberOfShares: newHolding.numberOfShares,
      percentageOwnership: newHolding.percentageOwnership,
      issueDate: newHolding.issueDate.toISOString(),
      certificateNumber: newHolding.certificateNumber || undefined,
      createdAt: newHolding.createdAt.toISOString(),
      updatedAt: newHolding.updatedAt.toISOString()
    }
  }

  // ============================================================================
  // STATS AND ANALYTICS
  // ============================================================================

  async getCompanyStats(companyId: string): Promise<CompanyStats> {
    const [
      members,
      officers,
      shareholders,
      shareClasses,
      complianceTasks,
      company
    ] = await Promise.all([
      this.prisma.companyMember.count({ where: { companyId, isActive: true } }),
      this.prisma.officer.count({ where: { companyId, isActive: true } }),
      this.prisma.shareholder.count({ where: { companyId } }),
      this.prisma.shareClass.findMany({ where: { companyId } }),
      this.prisma.complianceTask.count({
        where: {
          companyId,
          status: { in: ['pending', 'in_progress', 'overdue'] }
        }
      }),
      this.prisma.company.findUnique({
        where: { id: companyId },
        select: {
          incorporationDate: true,
          createdAt: true
        }
      })
    ])

    const totalShares = shareClasses.reduce((sum, sc) => sum + sc.totalShares, 0)
    const companyAge = company?.incorporationDate
      ? Math.floor((Date.now() - company.incorporationDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
      : 0

    return {
      totalMembers: members,
      totalOfficers: officers,
      totalShareholders: shareholders,
      totalShares,
      shareClassesCount: shareClasses.length,
      activeComplianceTasks: complianceTasks,
      overdueComplianceTasks: 0, // Would need separate query
      lastAccountsFiled: undefined, // Would need to query documents
      nextAccountsDue: undefined, // Would need to calculate
      companyAge
    }
  }

  // ============================================================================
  // SEARCH AND DISCOVERY
  // ============================================================================

  async searchCompanies(query: string, filters?: CompanySearchFilters): Promise<Company[]> {
    const where: any = {
      status: { not: 'deleted' }
    }

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { tradingName: { contains: query, mode: 'insensitive' } },
        { natureOfBusiness: { contains: query, mode: 'insensitive' } }
      ]
    }

    if (filters) {
      if (filters.companyType?.length) {
        where.companyType = { in: filters.companyType }
      }
      if (filters.companyStatus?.length) {
        where.companyStatus = { in: filters.companyStatus }
      }
      if (filters.industry?.length) {
        where.industry = { in: filters.industry }
      }
      // Add more filters as needed
    }

    const companies = await this.prisma.company.findMany({
      where,
      include: {
        registeredAddress: true,
        businessAddress: true
      },
      take: 50
    })

    return companies.map(company => ({
      id: company.id,
      name: company.name,
      tradingName: company.tradingName || undefined,
      companyNumber: company.companyNumber || undefined,
      companyType: company.companyType,
      companyStatus: company.companyStatus,
      incorporationDate: company.incorporationDate?.toISOString(),
      accountingReferenceDate: company.accountingReferenceDate || undefined,
      firstAccountsDue: company.firstAccountsDue || undefined,
      nextAccountsDue: company.nextAccountsDue || undefined,
      nextConfirmationStatementDue: company.nextConfirmationStatementDue || undefined,
      registeredAddress: {
        line1: company.registeredAddress.line1,
        line2: company.registeredAddress.line2 || undefined,
        city: company.registeredAddress.city,
        county: company.registeredAddress.county || undefined,
        postcode: company.registeredAddress.postcode,
        country: company.registeredAddress.country
      },
      businessAddress: company.businessAddress ? {
        line1: company.businessAddress.line1,
        line2: company.businessAddress.line2 || undefined,
        city: company.businessAddress.city,
        county: company.businessAddress.county || undefined,
        postcode: company.businessAddress.postcode,
        country: company.businessAddress.country
      } : undefined,
      sicCodes: company.sicCodes,
      natureOfBusiness: company.natureOfBusiness || undefined,
      industry: company.industry || undefined,
      sector: company.sector || undefined,
      corporationTaxReference: company.corporationTaxReference || undefined,
      vatNumber: company.vatNumber || undefined,
      vatRegistered: company.vatRegistered,
      payeReference: company.payeReference || undefined,
      payeRegistered: company.payeRegistered,
      seisEligible: company.seisEligible || undefined,
      seisAdvanceAssuranceStatus: company.seisAdvanceAssuranceStatus || undefined,
      seisAdvanceAssuranceDate: company.seisAdvanceAssuranceDate?.toISOString(),
      seisAllocationRemaining: company.seisAllocationRemaining,
      eisEligible: company.eisEligible || undefined,
      eisAdvanceAssuranceStatus: company.eisAdvanceAssuranceStatus || undefined,
      eisAdvanceAssuranceDate: company.eisAdvanceAssuranceDate?.toISOString(),
      currentCashBalance: company.currentCashBalance || undefined,
      monthlyBurnRate: company.monthlyBurnRate || undefined,
      runwayMonths: company.runwayMonths || undefined,
      totalFundingRaised: company.totalFundingRaised,
      lastValuation: company.lastValuation || undefined,
      lastValuationDate: company.lastValuationDate?.toISOString(),
      defaultCurrency: company.defaultCurrency,
      financialYearEndMonth: company.financialYearEndMonth,
      createdAt: company.createdAt.toISOString(),
      updatedAt: company.updatedAt.toISOString()
    }))
  }

  async getRecommendedCompanies(userId: string, limit: number = 10): Promise<Company[]> {
    // Simple recommendation based on user's existing companies
    const userCompanies = await this.getUserCompanies(userId)
    const industries = [...new Set(userCompanies.map(c => c.industry).filter(Boolean))]

    if (industries.length === 0) return []

    const recommended = await this.prisma.company.findMany({
      where: {
        id: { notIn: userCompanies.map(c => c.id) },
        industry: { in: industries },
        status: 'active'
      },
      include: {
        registeredAddress: true,
        businessAddress: true
      },
      take: limit
    })

    return recommended.map(company => ({
      id: company.id,
      name: company.name,
      tradingName: company.tradingName || undefined,
      companyNumber: company.companyNumber || undefined,
      companyType: company.companyType,
      companyStatus: company.companyStatus,
      incorporationDate: company.incorporationDate?.toISOString(),
      accountingReferenceDate: company.accountingReferenceDate || undefined,
      firstAccountsDue: company.firstAccountsDue || undefined,
      nextAccountsDue: company.nextAccountsDue || undefined,
      nextConfirmationStatementDue: company.nextConfirmationStatementDue || undefined,
      registeredAddress: {
        line1: company.registeredAddress.line1,
        line2: company.registeredAddress.line2 || undefined,
        city: company.registeredAddress.city,
        county: company.registeredAddress.county || undefined,
        postcode: company.registeredAddress.postcode,
        country: company.registeredAddress.country
      },
      businessAddress: company.businessAddress ? {
        line1: company.businessAddress.line1,
        line2: company.businessAddress.line2 || undefined,
        city: company.businessAddress.city,
        county: company.businessAddress.county || undefined,
        postcode: company.businessAddress.postcode,
        country: company.businessAddress.country
      } : undefined,
      sicCodes: company.sicCodes,
      natureOfBusiness: company.natureOfBusiness || undefined,
      industry: company.industry || undefined,
      sector: company.sector || undefined,
      corporationTaxReference: company.corporationTaxReference || undefined,
      vatNumber: company.vatNumber || undefined,
      vatRegistered: company.vatRegistered,
      payeReference: company.payeReference || undefined,
      payeRegistered: company.payeRegistered,
      seisEligible: company.seisEligible || undefined,
      seisAdvanceAssuranceStatus: company.seisAdvanceAssuranceStatus || undefined,
      seisAdvanceAssuranceDate: company.seisAdvanceAssuranceDate?.toISOString(),
      seisAllocationRemaining: company.seisAllocationRemaining,
      eisEligible: company.eisEligible || undefined,
      eisAdvanceAssuranceStatus: company.eisAdvanceAssuranceStatus || undefined,
      eisAdvanceAssuranceDate: company.eisAdvanceAssuranceDate?.toISOString(),
      currentCashBalance: company.currentCashBalance || undefined,
      monthlyBurnRate: company.monthlyBurnRate || undefined,
      runwayMonths: company.runwayMonths || undefined,
      totalFundingRaised: company.totalFundingRaised,
      lastValuation: company.lastValuation || undefined,
      lastValuationDate: company.lastValuationDate?.toISOString(),
      defaultCurrency: company.defaultCurrency,
      financialYearEndMonth: company.financialYearEndMonth,
      createdAt: company.createdAt.toISOString(),
      updatedAt: company.updatedAt.toISOString()
    }))
  }

  // ============================================================================
  // EXTERNAL INTEGRATIONS
  // ============================================================================

  async syncWithCompaniesHouse(companyId: string): Promise<void> {
    // Integration with Companies House API would go here
    console.log(`Syncing company ${companyId} with Companies House`)
  }

  async syncWithHMRC(companyId: string): Promise<void> {
    // Integration with HMRC API would go here
    console.log(`Syncing company ${companyId} with HMRC`)
  }

  async validateCompanyDetails(companyDetails: Partial<Company>): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = []

    // Basic validation
    if (!companyDetails.name?.trim()) {
      errors.push('Company name is required')
    }

    if (!companyDetails.registeredAddress) {
      errors.push('Registered address is required')
    } else {
      const addr = companyDetails.registeredAddress
      if (!addr.line1?.trim()) errors.push('Address line 1 is required')
      if (!addr.city?.trim()) errors.push('City is required')
      if (!addr.postcode?.trim()) errors.push('Postcode is required')
      if (!addr.country?.trim()) errors.push('Country is required')
    }

    if (!companyDetails.sicCodes?.length) {
      errors.push('At least one SIC code is required')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  private async recalculateOwnershipPercentages(companyId: string): Promise<void> {
    // Recalculate ownership percentages for all shareholders
    // This is a simplified implementation
    const shareholders = await this.prisma.shareholder.findMany({
      where: { companyId },
      include: { shareClass: true }
    })

    for (const shareholder of shareholders) {
      const totalShares = shareholder.shareClass.totalShares
      const percentage = (shareholder.numberOfShares / totalShares) * 100

      await this.prisma.shareholder.update({
        where: { id: shareholder.id },
        data: { percentageOwnership: percentage }
      })
    }
  }
}