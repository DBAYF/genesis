export interface Company {
  id: string
  name: string
  tradingName?: string
  companyNumber?: string
  companyType: 'ltd' | 'plc' | 'llp' | 'partnership' | 'sole_trader' | 'cic' | 'charity'
  companyStatus: 'pre_incorporation' | 'active' | 'dormant' | 'dissolved' | 'liquidation'
  incorporationDate?: string
  accountingReferenceDate?: string
  firstAccountsDue?: string
  nextAccountsDue?: string
  nextConfirmationStatementDue?: string
  registeredAddress: Address
  businessAddress?: Address
  sicCodes: string[]
  natureOfBusiness?: string
  industry?: string
  sector?: string
  corporationTaxReference?: string
  vatNumber?: string
  vatRegistered: boolean
  payeReference?: string
  payeRegistered: boolean
  seisEligible?: boolean
  seisAdvanceAssuranceStatus?: string
  seisAdvanceAssuranceDate?: string
  seisAllocationRemaining: number
  eisEligible?: boolean
  eisAdvanceAssuranceStatus?: string
  eisAdvanceAssuranceDate?: string
  currentCashBalance?: number
  monthlyBurnRate?: number
  runwayMonths?: number
  totalFundingRaised: number
  lastValuation?: number
  lastValuationDate?: string
  defaultCurrency: string
  financialYearEndMonth: number
  createdAt: string
  updatedAt: string
}

export interface Address {
  line1: string
  line2?: string
  city: string
  county?: string
  postcode: string
  country: string
}

export interface CompanyMember {
  id: string
  companyId: string
  userId: string
  role: 'owner' | 'director' | 'shareholder' | 'employee' | 'advisor' | 'consultant'
  title?: string
  appointmentDate: string
  resignationDate?: string
  isActive: boolean
  shareholdingPercentage?: number
  votingRights?: boolean
  salary?: number
  equityStake?: number
  createdAt: string
  updatedAt: string
}

export interface Officer {
  id: string
  companyId: string
  userId?: string
  name: string
  role: 'director' | 'secretary' | 'llp_member' | 'llp_designated_member' | 'judicial_factor'
  appointmentDate: string
  resignationDate?: string
  isActive: boolean
  nationality?: string
  occupation?: string
  countryOfResidence?: string
  serviceAddress?: Address
  createdAt: string
  updatedAt: string
}

export interface Shareholder {
  id: string
  companyId: string
  userId?: string
  name: string
  shareholderType: 'individual' | 'corporate' | 'trust' | 'partnership'
  shareClassId: string
  numberOfShares: number
  percentageOwnership: number
  issueDate: string
  certificateNumber?: string
  address?: Address
  nationality?: string
  createdAt: string
  updatedAt: string
}

export interface ShareClass {
  id: string
  companyId: string
  name: string
  code: string
  totalShares: number
  nominalValue: number
  currency: string
  votingRights: boolean
  dividendRights: boolean
  liquidationPreference?: number
  conversionRights?: boolean
  redemptionRights?: boolean
  createdAt: string
  updatedAt: string
}

export interface Shareholding {
  id: string
  shareholderId: string
  shareClassId: string
  numberOfShares: number
  percentageOwnership: number
  issueDate: string
  certificateNumber?: string
  createdAt: string
  updatedAt: string
}

export interface CompanyStats {
  totalMembers: number
  totalOfficers: number
  totalShareholders: number
  totalShares: number
  shareClassesCount: number
  activeComplianceTasks: number
  overdueComplianceTasks: number
  lastAccountsFiled?: string
  nextAccountsDue?: string
  companyAge: number // in months
}

export interface IncorporationData {
  name: string
  companyType: Company['companyType']
  registeredAddress: Address
  businessAddress?: Address
  sicCodes: string[]
  directors: IncorporationDirector[]
  shareholders: IncorporationShareholder[]
  shareClasses: IncorporationShareClass[]
  memorandum?: string
  articles?: string
}

export interface IncorporationDirector {
  name: string
  address: Address
  nationality: string
  occupation: string
  dateOfBirth: string
  serviceAddress?: Address
}

export interface IncorporationShareholder {
  name: string
  address: Address
  nationality?: string
  shareClass: string
  numberOfShares: number
}

export interface IncorporationShareClass {
  name: string
  totalShares: number
  nominalValue: number
  currency: string
}

export interface IncorporationResult {
  companyNumber: string
  incorporationDate: string
  certificateUrl?: string
  memorandumUrl?: string
  articlesUrl?: string
  status: 'pending' | 'approved' | 'rejected' | 'incorporated'
}

export interface CompanySearchFilters {
  companyType?: Company['companyType'][]
  companyStatus?: Company['companyStatus'][]
  industry?: string[]
  location?: string
  sicCode?: string[]
  incorporationDateFrom?: string
  incorporationDateTo?: string
  hasFunding?: boolean
  fundingRange?: {
    min: number
    max: number
  }
}

export interface UpdateCompanyRequest {
  name?: string
  tradingName?: string
  companyType?: Company['companyType']
  companyStatus?: Company['companyStatus']
  registeredAddress?: Address
  businessAddress?: Address
  sicCodes?: string[]
  natureOfBusiness?: string
  industry?: string
  sector?: string
  corporationTaxReference?: string
  vatNumber?: string
  vatRegistered?: boolean
  payeReference?: string
  payeRegistered?: boolean
  currentCashBalance?: number
  monthlyBurnRate?: number
  totalFundingRaised?: number
  lastValuation?: number
  lastValuationDate?: string
  defaultCurrency?: string
  financialYearEndMonth?: number
}

export interface CreateCompanyMemberRequest {
  userId: string
  role: CompanyMember['role']
  title?: string
  shareholdingPercentage?: number
  votingRights?: boolean
  salary?: number
  equityStake?: number
}

export interface UpdateCompanyMemberRequest {
  role?: CompanyMember['role']
  title?: string
  shareholdingPercentage?: number
  votingRights?: boolean
  salary?: number
  equityStake?: number
  isActive?: boolean
}

export interface CreateOfficerRequest {
  userId?: string
  name: string
  role: Officer['role']
  nationality?: string
  occupation?: string
  countryOfResidence?: string
  serviceAddress?: Address
}

export interface CreateShareholderRequest {
  userId?: string
  name: string
  shareholderType: Shareholder['shareholderType']
  shareClassId: string
  numberOfShares: number
  address?: Address
  nationality?: string
}

export interface CreateShareClassRequest {
  name: string
  code: string
  totalShares: number
  nominalValue: number
  currency: string
  votingRights: boolean
  dividendRights: boolean
  liquidationPreference?: number
  conversionRights?: boolean
  redemptionRights?: boolean
}

export interface CompanyService {
  // Company CRUD
  getCompany(id: string): Promise<Company | null>
  getUserCompanies(userId: string): Promise<Company[]>
  createCompany(userId: string, companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<Company>
  updateCompany(id: string, updates: UpdateCompanyRequest): Promise<Company>
  deleteCompany(id: string): Promise<void>

  // Incorporation
  incorporateCompany(userId: string, incorporationData: IncorporationData): Promise<IncorporationResult>
  getIncorporationStatus(companyId: string): Promise<IncorporationResult | null>

  // Company Members
  getCompanyMembers(companyId: string): Promise<CompanyMember[]>
  addCompanyMember(companyId: string, memberData: CreateCompanyMemberRequest): Promise<CompanyMember>
  updateCompanyMember(id: string, updates: UpdateCompanyMemberRequest): Promise<CompanyMember>
  removeCompanyMember(id: string): Promise<void>

  // Officers
  getCompanyOfficers(companyId: string): Promise<Officer[]>
  addCompanyOfficer(companyId: string, officerData: CreateOfficerRequest): Promise<Officer>
  updateCompanyOfficer(id: string, updates: Partial<Officer>): Promise<Officer>
  removeCompanyOfficer(id: string): Promise<void>

  // Shareholders
  getCompanyShareholders(companyId: string): Promise<Shareholder[]>
  addCompanyShareholder(companyId: string, shareholderData: CreateShareholderRequest): Promise<Shareholder>
  updateCompanyShareholder(id: string, updates: Partial<Shareholder>): Promise<Shareholder>
  removeCompanyShareholder(id: string): Promise<void>

  // Share Classes
  getCompanyShareClasses(companyId: string): Promise<ShareClass[]>
  createShareClass(companyId: string, shareClassData: CreateShareClassRequest): Promise<ShareClass>
  updateShareClass(id: string, updates: Partial<ShareClass>): Promise<ShareClass>
  deleteShareClass(id: string): Promise<void>

  // Shareholdings
  getShareholdings(shareholderId: string): Promise<Shareholding[]>
  transferShares(shareholdingId: string, newShareholderId: string, numberOfShares: number): Promise<Shareholding>

  // Stats and Analytics
  getCompanyStats(companyId: string): Promise<CompanyStats>

  // Search and Discovery
  searchCompanies(query: string, filters?: CompanySearchFilters): Promise<Company[]>
  getRecommendedCompanies(userId: string, limit?: number): Promise<Company[]>

  // External Integrations
  syncWithCompaniesHouse(companyId: string): Promise<void>
  syncWithHMRC(companyId: string): Promise<void>
  validateCompanyDetails(companyDetails: Partial<Company>): Promise<{ valid: boolean; errors: string[] }>
}