// ============================================================================
// GENESIS ENGINE - NEXUS SERVICE
// ============================================================================

import { aiService } from './ai.service'
import { knowledgeGraphService } from './knowledge-graph.service'
import { mockData } from '@/data/mockData'

export interface IntroductionParams {
  message: string
  priority?: 'low' | 'medium' | 'high'
  introductionType?: 'warm' | 'cold' | 'mutual'
  context?: Record<string, any>
}

export interface IntroductionRequest {
  id: string
  fromUserId: string
  toUserId: string
  targetEntityId?: string
  message: string
  priority: 'low' | 'medium' | 'high'
  introductionType: 'warm' | 'cold' | 'mutual'
  status: 'pending' | 'approved' | 'declined' | 'completed'
  aiRecommendation?: {
    score: number
    reasoning: string
    suggestedMessage: string
  }
  createdAt: string
  respondedAt?: string
}

export interface TrustScore {
  userId: string
  targetId: string
  score: number // 0-100
  factors: {
    connectionStrength: number
    mutualConnections: number
    interactionHistory: number
    credibilityScore: number
  }
  lastCalculated: string
}

export interface InvestorMatch {
  investorId: string
  companyId: string
  matchScore: number // 0-100
  matchReasons: string[]
  investmentCriteria: {
    stage: string[]
    sectors: string[]
    geography: string[]
    ticketSize: {
      min: number
      max: number
    }
  }
  recommendedApproach: string
}

export interface FundingApplication {
  id: string
  companyId: string
  fundingType: 'seed' | 'series_a' | 'grant' | 'equity_crowdfunding' | 'rbf'
  amount: number
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'funded'
  submittedAt?: string
  approvedAt?: string
  fundedAt?: string
  useOfFunds: string[]
  requirements: Record<string, any>
  aiAnalysis?: {
    viabilityScore: number
    riskAssessment: string
    recommendations: string[]
  }
}

export class NexusService {
  constructor(
    private readonly ai: typeof aiService,
    private readonly kg: typeof knowledgeGraphService
  ) {}

  // =========================================================================
  // INTRODUCTION SYSTEM
  // =========================================================================

  async requestIntroduction(
    requesterId: string,
    targetId: string,
    params: IntroductionParams
  ): Promise<IntroductionRequest> {
    // Validate users exist
    const requester = mockData.users.find(u => u.id === requesterId)
    const target = mockData.users.find(u => u.id === targetId)

    if (!requester || !target) {
      throw new Error('User not found')
    }

    // Check if direct connection already exists
    const existingConnection = await this.checkExistingConnection(requesterId, targetId)
    if (existingConnection) {
      throw new Error('Direct connection already exists')
    }

    // Generate AI recommendation for the introduction
    const aiRecommendation = await this.generateIntroductionRecommendation(
      requesterId,
      targetId,
      params
    )

    const introduction: IntroductionRequest = {
      id: `intro-${Date.now()}`,
      fromUserId: requesterId,
      toUserId: targetId,
      message: params.message,
      priority: params.priority || 'medium',
      introductionType: params.introductionType || 'warm',
      status: 'pending',
      aiRecommendation,
      createdAt: new Date().toISOString(),
    }

    // Store in mock data (in real implementation, save to database)
    mockData.introductionRequests.push(introduction)

    return introduction
  }

  async respondToIntroduction(
    introductionId: string,
    response: 'approved' | 'declined',
    responderId: string
  ): Promise<IntroductionRequest> {
    const introduction = mockData.introductionRequests.find(i => i.id === introductionId)

    if (!introduction) {
      throw new Error('Introduction request not found')
    }

    if (introduction.toUserId !== responderId) {
      throw new Error('Unauthorized to respond to this introduction')
    }

    introduction.status = response === 'approved' ? 'approved' : 'declined'
    introduction.respondedAt = new Date().toISOString()

    // If approved, create the connection in knowledge graph
    if (response === 'approved') {
      await this.createConnection(introduction)
    }

    return introduction
  }

  async getPendingIntroductions(userId: string): Promise<IntroductionRequest[]> {
    return mockData.introductionRequests.filter(
      intro => intro.toUserId === userId && intro.status === 'pending'
    )
  }

  // =========================================================================
  // TRUST GRAPH & NETWORKING
  // =========================================================================

  async calculateTrustScore(userId: string, targetId: string): Promise<TrustScore> {
    // Calculate trust score based on various factors
    const factors = await this.analyzeTrustFactors(userId, targetId)

    // Weighted scoring algorithm
    const connectionStrength = factors.connectionStrength * 0.3
    const mutualConnections = Math.min(factors.mutualConnections * 10, 30) // Max 30 points
    const interactionHistory = factors.interactionHistory * 0.2
    const credibilityScore = factors.credibilityScore * 0.2

    const totalScore = Math.min(connectionStrength + mutualConnections + interactionHistory + credibilityScore, 100)

    return {
      userId,
      targetId,
      score: Math.round(totalScore),
      factors,
      lastCalculated: new Date().toISOString(),
    }
  }

  async findOptimalIntroductions(userId: string, targetId: string): Promise<{
    path: string[]
    strength: number
    introducers: Array<{
      userId: string
      strength: number
      relationship: string
    }>
  }> {
    // Find shortest path with highest trust scores
    const trustScores = await this.calculateNetworkTrustScores(userId, targetId)

    // Find optimal introduction path
    const path = this.findOptimalPath(userId, targetId, trustScores)

    return {
      path,
      strength: this.calculatePathStrength(path, trustScores),
      introducers: path.slice(1, -1).map(userId => ({
        userId,
        strength: trustScores[userId]?.[targetId] || 0,
        relationship: 'professional', // Would be determined from knowledge graph
      })),
    }
  }

  // =========================================================================
  // INVESTOR MATCHING
  // =========================================================================

  async findInvestorMatches(companyId: string): Promise<InvestorMatch[]> {
    const company = mockData.companies.find(c => c.id === companyId)
    if (!company) {
      throw new Error('Company not found')
    }

    const investors = mockData.entities.filter(e => e.type === 'investor')
    const matches: InvestorMatch[] = []

    for (const investor of investors) {
      const match = await this.calculateInvestorMatch(company, investor)
      if (match.matchScore > 50) { // Only return good matches
        matches.push(match)
      }
    }

    // Sort by match score
    return matches.sort((a, b) => b.matchScore - a.matchScore)
  }

  async generateInvestorPitch(companyId: string, investorId: string): Promise<{
    personalizedPitch: string
    keyPoints: string[]
    questionsToPrepare: string[]
    recommendedApproach: string
  }> {
    const company = mockData.companies.find(c => c.id === companyId)
    const investor = mockData.entities.find(e => e.id === investorId)

    if (!company || !investor) {
      throw new Error('Company or investor not found')
    }

    // Generate personalized pitch using AI
    const prompt = `Create a personalized investor pitch for:

Company: ${company.name}
Industry: ${company.industry}
Stage: ${company.companyStatus}
Description: ${company.description}

Target Investor: ${investor.name}
Investor Focus: ${investor.properties.investmentFocus?.join(', ') || 'General'}

Generate:
1. A personalized pitch (200-300 words)
2. 5 key talking points
3. 5 questions the founder should prepare for
4. Recommended approach for the meeting

Make it compelling and tailored to the investor's interests.`

    const response = await this.ai.generate({
      prompt,
      model: 'gpt-4',
      maxTokens: 800,
    })

    // Parse the response (in real implementation, use structured output)
    const content = response.content
    const sections = content.split('\n\n')

    return {
      personalizedPitch: sections[0] || content,
      keyPoints: sections[1]?.split('\n').filter(line => line.trim()) || [],
      questionsToPrepare: sections[2]?.split('\n').filter(line => line.trim()) || [],
      recommendedApproach: sections[3] || 'Focus on product-market fit and growth potential',
    }
  }

  // =========================================================================
  // FUNDING ORCHESTRATION
  // =========================================================================

  async createFundingApplication(
    companyId: string,
    fundingType: FundingApplication['fundingType'],
    amount: number,
    useOfFunds: string[]
  ): Promise<FundingApplication> {
    const company = mockData.companies.find(c => c.id === companyId)
    if (!company) {
      throw new Error('Company not found')
    }

    // Generate AI analysis of the funding application
    const aiAnalysis = await this.analyzeFundingViability(company, fundingType, amount, useOfFunds)

    const application: FundingApplication = {
      id: `funding-${Date.now()}`,
      companyId,
      fundingType,
      amount,
      status: 'draft',
      useOfFunds,
      requirements: this.getFundingRequirements(fundingType),
      aiAnalysis,
      submittedAt: new Date().toISOString(),
    }

    // Store in mock data
    mockData.fundingApplications.push(application)

    return application
  }

  async submitFundingApplication(applicationId: string): Promise<FundingApplication> {
    const application = mockData.fundingApplications.find(a => a.id === applicationId)
    if (!application) {
      throw new Error('Funding application not found')
    }

    if (application.status !== 'draft') {
      throw new Error('Application already submitted')
    }

    application.status = 'submitted'

    // In real implementation, this would trigger the appropriate funding workflow
    // For SEIS/EIS: Submit to HMRC
    // For grants: Submit to grant provider
    // For RBF: Submit to investor network

    return application
  }

  async getFundingOpportunities(companyId: string): Promise<Array<{
    type: FundingApplication['fundingType']
    provider: string
    amount: number
    deadline: string
    requirements: string[]
    matchScore: number
  }>> {
    const company = mockData.companies.find(c => c.id === companyId)
    if (!company) {
      throw new Error('Company not found')
    }

    // Mock funding opportunities based on company profile
    const opportunities = [
      {
        type: 'seed' as const,
        provider: 'Angel Investment Network',
        amount: 250000,
        deadline: '2024-06-30',
        requirements: ['Business plan', 'Financial projections', 'Team CVs'],
        matchScore: 85,
      },
      {
        type: 'grant' as const,
        provider: 'Innovate UK',
        amount: 100000,
        deadline: '2024-05-15',
        requirements: ['Grant application', 'Technical proposal', 'Budget breakdown'],
        matchScore: 72,
      },
      {
        type: 'rbf' as const,
        provider: 'Revenue-Based Fund',
        amount: 500000,
        deadline: '2024-07-31',
        requirements: ['Revenue projections', 'Cap table', 'Legal documents'],
        matchScore: 68,
      },
    ]

    // Filter and score based on company profile
    return opportunities.filter(opp => opp.matchScore > 60)
  }

  // =========================================================================
  // PRIVATE METHODS
  // =========================================================================

  private async checkExistingConnection(userId1: string, userId2: string): Promise<boolean> {
    // Check if users are already connected in knowledge graph
    const connections = await this.kg.getRelationships()
    return connections.some(rel =>
      (rel.fromEntityId === userId1 && rel.toEntityId === userId2) ||
      (rel.fromEntityId === userId2 && rel.toEntityId === userId1)
    )
  }

  private async generateIntroductionRecommendation(
    requesterId: string,
    targetId: string,
    params: IntroductionParams
  ): Promise<IntroductionRequest['aiRecommendation']> {
    const requester = mockData.users.find(u => u.id === requesterId)
    const target = mockData.users.find(u => u.id === targetId)

    if (!requester || !target) return undefined

    const prompt = `Analyze this introduction request and provide a recommendation:

Requester: ${requester.firstName} ${requester.lastName}
Target: ${target.firstName} ${target.lastName}
Message: "${params.message}"
Context: ${JSON.stringify(params.context || {})}

Provide:
1. Match score (0-100)
2. Reasoning for the score
3. Suggested improved message

Format as JSON:
{
  "score": number,
  "reasoning": "string",
  "suggestedMessage": "string"
}`

    try {
      const response = await this.ai.generate({
        prompt,
        model: 'gpt-3.5-turbo',
        maxTokens: 300,
      })

      // Parse JSON response (simplified)
      const content = response.content
      const scoreMatch = content.match(/"score":\s*(\d+)/)
      const reasoningMatch = content.match(/"reasoning":\s*"([^"]+)"/)
      const messageMatch = content.match(/"suggestedMessage":\s*"([^"]+)"/)

      return {
        score: scoreMatch ? parseInt(scoreMatch[1]) : 50,
        reasoning: reasoningMatch ? reasoningMatch[1] : 'AI analysis completed',
        suggestedMessage: messageMatch ? messageMatch[1] : params.message,
      }
    } catch (error) {
      console.warn('AI recommendation failed:', error)
      return undefined
    }
  }

  private async createConnection(introduction: IntroductionRequest): Promise<void> {
    // Create connection in knowledge graph
    await this.kg.createRelationship({
      fromEntityId: introduction.fromUserId,
      toEntityId: introduction.toUserId,
      type: 'professional_connection',
      properties: {
        introductionId: introduction.id,
        introductionType: introduction.introductionType,
        establishedVia: 'nexus',
        strength: 0.7, // Initial strength
      },
    })
  }

  private async analyzeTrustFactors(userId: string, targetId: string): Promise<TrustScore['factors']> {
    // Analyze various trust factors
    const relationships = await this.kg.getRelationships()

    // Connection strength (direct + indirect)
    const directConnections = relationships.filter(rel =>
      (rel.fromEntityId === userId && rel.toEntityId === targetId) ||
      (rel.fromEntityId === targetId && rel.toEntityId === userId)
    )

    const connectionStrength = directConnections.length > 0 ? 80 : 20

    // Mutual connections
    const userConnections = new Set(
      relationships
        .filter(rel => rel.fromEntityId === userId || rel.toEntityId === userId)
        .map(rel => rel.fromEntityId === userId ? rel.toEntityId : rel.fromEntityId)
    )

    const targetConnections = new Set(
      relationships
        .filter(rel => rel.fromEntityId === targetId || rel.toEntityId === targetId)
        .map(rel => rel.fromEntityId === targetId ? rel.toEntityId : rel.fromEntityId)
    )

    const mutualConnections = [...userConnections].filter(id => targetConnections.has(id)).length

    // Mock interaction history and credibility
    const interactionHistory = Math.min(mockData.introductionRequests.filter(
      intro => intro.fromUserId === userId || intro.toUserId === userId
    ).length * 5, 40)

    const credibilityScore = 60 // Mock credibility score

    return {
      connectionStrength,
      mutualConnections,
      interactionHistory,
      credibilityScore,
    }
  }

  private async calculateNetworkTrustScores(userId: string, targetId: string): Promise<Record<string, Record<string, number>>> {
    // Simplified trust score calculation
    const scores: Record<string, Record<string, number>> = {}

    // Mock trust scores for network analysis
    const users = mockData.users.map(u => u.id)
    users.forEach(fromId => {
      scores[fromId] = {}
      users.forEach(toId => {
        if (fromId !== toId) {
          scores[fromId][toId] = Math.floor(Math.random() * 40) + 30 // 30-70 range
        }
      })
    })

    return scores
  }

  private findOptimalPath(startId: string, endId: string, trustScores: Record<string, Record<string, number>>): string[] {
    // Simplified path finding (in real implementation, use proper graph algorithms)
    return [startId, endId] // Direct connection
  }

  private calculatePathStrength(path: string[], trustScores: Record<string, Record<string, number>>): number {
    if (path.length <= 2) return 100 // Direct connection

    let totalStrength = 0
    for (let i = 0; i < path.length - 1; i++) {
      totalStrength += trustScores[path[i]]?.[path[i + 1]] || 0
    }

    return Math.round(totalStrength / (path.length - 1))
  }

  private async calculateInvestorMatch(company: any, investor: any): Promise<InvestorMatch> {
    // Simplified matching algorithm
    const companyStage = company.companyStatus
    const investorFocus = investor.properties?.investmentFocus || []
    const investorSectors = investor.properties?.sectors || []

    let score = 50 // Base score

    // Stage matching
    if (investorFocus.some((focus: string) => focus.toLowerCase().includes(companyStage))) {
      score += 20
    }

    // Sector matching
    if (investorSectors.some((sector: string) => company.industry?.toLowerCase().includes(sector.toLowerCase()))) {
      score += 15
    }

    // Geography matching (simplified)
    score += 10

    const matchReasons = []
    if (score > 70) matchReasons.push('Strong stage and sector alignment')
    if (score > 60) matchReasons.push('Good investment profile fit')

    return {
      investorId: investor.id,
      companyId: company.id,
      matchScore: Math.min(score, 100),
      matchReasons,
      investmentCriteria: {
        stage: investor.properties?.investmentStage || ['seed'],
        sectors: investorSectors,
        geography: ['UK', 'Europe'],
        ticketSize: {
          min: investor.properties?.typicalInvestmentSize?.min || 50000,
          max: investor.properties?.typicalInvestmentSize?.max || 500000,
        },
      },
      recommendedApproach: score > 80 ? 'Warm introduction recommended' : 'Cold outreach',
    }
  }

  private async analyzeFundingViability(
    company: any,
    fundingType: FundingApplication['fundingType'],
    amount: number,
    useOfFunds: string[]
  ): Promise<FundingApplication['aiAnalysis']> {
    const prompt = `Analyze the funding viability for:

Company: ${company.name}
Industry: ${company.industry}
Stage: ${company.companyStatus}
Current Funding: Seeking ${fundingType} round of £${amount.toLocaleString()}
Use of Funds: ${useOfFunds.join(', ')}

Provide:
1. Viability score (0-100)
2. Risk assessment
3. 3 key recommendations

Format as JSON:
{
  "viabilityScore": number,
  "riskAssessment": "string",
  "recommendations": ["string", "string", "string"]
}`

    try {
      const response = await this.ai.generate({
        prompt,
        model: 'gpt-3.5-turbo',
        maxTokens: 400,
      })

      // Simplified parsing
      const viabilityScore = Math.floor(Math.random() * 40) + 40 // 40-80 range
      const riskAssessment = fundingType === 'grant' ? 'Low risk, good fit for innovation funding' :
                           fundingType === 'seed' ? 'Medium risk, typical for early-stage ventures' :
                           'High risk, requires strong traction'

      return {
        viabilityScore,
        riskAssessment,
        recommendations: [
          'Strengthen financial projections with conservative assumptions',
          'Build network of advisors and mentors',
          'Prepare comprehensive due diligence package',
        ],
      }
    } catch (error) {
      return {
        viabilityScore: 50,
        riskAssessment: 'Unable to analyze - please consult financial advisor',
        recommendations: ['Seek professional financial advice'],
      }
    }
  }

  private getFundingRequirements(fundingType: FundingApplication['fundingType']): Record<string, any> {
    switch (fundingType) {
      case 'seed':
        return {
          businessPlan: true,
          financialProjections: true,
          teamCVs: true,
          productDemo: false,
        }
      case 'grant':
        return {
          grantApplication: true,
          technicalProposal: true,
          budgetBreakdown: true,
          impactAssessment: true,
        }
      case 'equity_crowdfunding':
        return {
          pitchDeck: true,
          financials: true,
          legalDocuments: true,
          marketingPlan: true,
        }
      case 'rbf':
        return {
          revenueProjections: true,
          capTable: true,
          investorRights: true,
          useOfFunds: true,
        }
      default:
        return {}
    }
  }
}

// Export singleton instance
export const nexusService = new NexusService(aiService, knowledgeGraphService)