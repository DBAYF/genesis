// ============================================================================
// GENESIS ENGINE - GRAPHQL CLIENT
// ============================================================================

import { config } from '@/config'

// ============================================================================
// GRAPHQL CLIENT CONFIGURATION
// ============================================================================

export interface GraphQLResponse<T = any> {
  data?: T
  errors?: GraphQLError[]
  extensions?: any
}

export interface GraphQLError {
  message: string
  locations?: { line: number; column: number }[]
  path?: string[]
  extensions?: any
}

class GraphQLClient {
  private endpoint: string
  private defaultHeaders: Record<string, string>

  constructor(endpoint?: string) {
    this.endpoint = endpoint || `${config.NEXT_PUBLIC_API_URL}/graphql`
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    }
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    // Get auth token from localStorage or auth store
    const token = localStorage.getItem('auth_token')
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  async request<T = any>(
    query: string,
    variables?: Record<string, any>,
    operationName?: string
  ): Promise<GraphQLResponse<T>> {
    const authHeaders = await this.getAuthHeaders()

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        ...this.defaultHeaders,
        ...authHeaders,
      },
      body: JSON.stringify({
        query,
        variables,
        operationName,
      }),
    })

    if (!response.ok) {
      throw new Error(`GraphQL request failed: ${response.status} ${response.statusText}`)
    }

    const result: GraphQLResponse<T> = await response.json()

    if (result.errors && result.errors.length > 0) {
      // Handle GraphQL errors
      const error = result.errors[0]
      throw new Error(error.message)
    }

    return result
  }

  // Convenience methods for common operations
  async query<T = any>(
    query: string,
    variables?: Record<string, any>
  ): Promise<T> {
    const response = await this.request<T>(query, variables)
    return response.data!
  }

  async mutate<T = any>(
    mutation: string,
    variables?: Record<string, any>
  ): Promise<T> {
    const response = await this.request<T>(mutation, variables)
    return response.data!
  }
}

// ============================================================================
// GRAPHQL CLIENT INSTANCES
// ============================================================================

export const graphqlClient = new GraphQLClient()

// Service-specific clients (for different GraphQL endpoints if needed)
export const authGraphQLClient = new GraphQLClient(`${config.NEXT_PUBLIC_AUTH_SERVICE_URL}/graphql`)
export const companyGraphQLClient = new GraphQLClient(`${config.NEXT_PUBLIC_COMPANY_SERVICE_URL}/graphql`)
export const knowledgeGraphQLClient = new GraphQLClient(`${config.NEXT_PUBLIC_KNOWLEDGE_GRAPH_URL}/graphql`)
export const nexusGraphQLClient = new GraphQLClient(`${config.NEXT_PUBLIC_NEXUS_URL}/graphql`)
export const pulseGraphQLClient = new GraphQLClient(`${config.NEXT_PUBLIC_PULSE_URL}/graphql`)

// ============================================================================
// GRAPHQL QUERY BUILDERS
// ============================================================================

export const gql = (strings: TemplateStringsArray, ...values: any[]): string => {
  let result = strings[0]
  for (let i = 0; i < values.length; i++) {
    result += values[i] + strings[i + 1]
  }
  return result
}

// ============================================================================
// COMMON GRAPHQL FRAGMENTS
// ============================================================================

export const USER_FRAGMENT = gql`
  fragment UserFields on User {
    id
    email
    emailVerified
    firstName
    lastName
    avatarUrl
    timezone
    locale
    onboardingCompleted
    onboardingStep
    pulseEnabled
    pulsePreferredChannel
    pulseActiveHoursStart
    pulseActiveHoursEnd
    pulseDigestTime
    status
    lastActiveAt
    createdAt
    updatedAt
  }
`

export const COMPANY_FRAGMENT = gql`
  fragment CompanyFields on Company {
    id
    name
    tradingName
    companyNumber
    companyType
    companyStatus
    incorporationDate
    accountingReferenceDate
    firstAccountsDue
    nextAccountsDue
    nextConfirmationStatementDue
    registeredAddress {
      line1
      line2
      city
      county
      postcode
      country
    }
    businessAddress {
      line1
      line2
      city
      county
      postcode
      country
    }
    sicCodes
    natureOfBusiness
    industry
    sector
    corporationTaxReference
    vatNumber
    vatRegistered
    payeReference
    payeRegistered
    seisEligible
    seisAdvanceAssuranceStatus
    seisAdvanceAssuranceDate
    seisAllocationRemaining
    eisEligible
    eisAdvanceAssuranceStatus
    eisAdvanceAssuranceDate
    currentCashBalance
    monthlyBurnRate
    runwayMonths
    totalFundingRaised
    lastValuation
    lastValuationDate
    defaultCurrency
    financialYearEndMonth
    createdAt
    updatedAt
  }
`

export const ENTITY_FRAGMENT = gql`
  fragment EntityFields on Entity {
    id
    type
    name
    description
    properties
    createdAt
    updatedAt
  }
`

export const RELATIONSHIP_FRAGMENT = gql`
  fragment RelationshipFields on Relationship {
    id
    fromEntityId
    toEntityId
    type
    properties
    strength
    createdAt
  }
`

// ============================================================================
// AUTH QUERIES & MUTATIONS
// ============================================================================

export const AUTH_QUERIES = {
  ME: gql`
    query Me {
      me {
        ...UserFields
      }
    }
    ${USER_FRAGMENT}
  `,

  VALIDATE_TOKEN: gql`
    query ValidateToken {
      validateToken {
        valid
        user {
          ...UserFields
        }
      }
    }
    ${USER_FRAGMENT}
  `,
}

export const AUTH_MUTATIONS = {
  LOGIN: gql`
    mutation Login($email: String!, $password: String!) {
      login(email: $email, password: $password) {
        token
        user {
          ...UserFields
        }
        refreshToken
      }
    }
    ${USER_FRAGMENT}
  `,

  REGISTER: gql`
    mutation Register($input: RegisterInput!) {
      register(input: $input) {
        token
        user {
          ...UserFields
        }
        refreshToken
      }
    }
    ${USER_FRAGMENT}
  `,

  REFRESH_TOKEN: gql`
    mutation RefreshToken($refreshToken: String!) {
      refreshToken(refreshToken: $refreshToken) {
        token
        refreshToken
      }
    }
  `,

  LOGOUT: gql`
    mutation Logout {
      logout {
        success
      }
    }
  `,
}

// ============================================================================
// COMPANY QUERIES & MUTATIONS
// ============================================================================

export const COMPANY_QUERIES = {
  COMPANIES: gql`
    query Companies($limit: Int, $offset: Int) {
      companies(limit: $limit, offset: $offset) {
        ...CompanyFields
        totalCount
      }
    }
    ${COMPANY_FRAGMENT}
  `,

  COMPANY: gql`
    query Company($id: ID!) {
      company(id: $id) {
        ...CompanyFields
      }
    }
    ${COMPANY_FRAGMENT}
  `,

  SEARCH_COMPANIES: gql`
    query SearchCompanies($query: String!, $limit: Int) {
      searchCompanies(query: $query, limit: $limit) {
        ...CompanyFields
      }
    }
    ${COMPANY_FRAGMENT}
  `,
}

export const COMPANY_MUTATIONS = {
  CREATE_COMPANY: gql`
    mutation CreateCompany($input: CreateCompanyInput!) {
      createCompany(input: $input) {
        ...CompanyFields
      }
    }
    ${COMPANY_FRAGMENT}
  `,

  UPDATE_COMPANY: gql`
    mutation UpdateCompany($id: ID!, $input: UpdateCompanyInput!) {
      updateCompany(id: $id, input: $input) {
        ...CompanyFields
      }
    }
    ${COMPANY_FRAGMENT}
  `,

  INCORPORATE_COMPANY: gql`
    mutation IncorporateCompany($id: ID!, $input: IncorporationInput!) {
      incorporateCompany(id: $id, input: $input) {
        ...CompanyFields
        incorporationResult {
          success
          companyNumber
          certificateUrl
          errors
        }
      }
    }
    ${COMPANY_FRAGMENT}
  `,
}

// ============================================================================
// KNOWLEDGE GRAPH QUERIES & MUTATIONS
// ============================================================================

export const KNOWLEDGE_GRAPH_QUERIES = {
  ENTITIES: gql`
    query Entities($limit: Int, $offset: Int, $type: EntityType) {
      entities(limit: $limit, offset: $offset, type: $type) {
        ...EntityFields
        relationships {
          ...RelationshipFields
        }
      }
    }
    ${ENTITY_FRAGMENT}
    ${RELATIONSHIP_FRAGMENT}
  `,

  ENTITY: gql`
    query Entity($id: ID!) {
      entity(id: $id) {
        ...EntityFields
        relationships {
          ...RelationshipFields
        }
      }
    }
    ${ENTITY_FRAGMENT}
    ${RELATIONSHIP_FRAGMENT}
  `,

  SEARCH_ENTITIES: gql`
    query SearchEntities($query: String!, $type: EntityType, $limit: Int) {
      searchEntities(query: $query, type: $type, limit: $limit) {
        ...EntityFields
      }
    }
    ${ENTITY_FRAGMENT}
  `,

  RELATIONSHIPS: gql`
    query Relationships($entityId: ID, $type: String) {
      relationships(entityId: $entityId, type: $type) {
        ...RelationshipFields
      }
    }
    ${RELATIONSHIP_FRAGMENT}
  `,
}

export const KNOWLEDGE_GRAPH_MUTATIONS = {
  CREATE_ENTITY: gql`
    mutation CreateEntity($input: CreateEntityInput!) {
      createEntity(input: $input) {
        ...EntityFields
      }
    }
    ${ENTITY_FRAGMENT}
  `,

  UPDATE_ENTITY: gql`
    mutation UpdateEntity($id: ID!, $input: UpdateEntityInput!) {
      updateEntity(id: $id, input: $input) {
        ...EntityFields
      }
    }
    ${ENTITY_FRAGMENT}
  `,

  CREATE_RELATIONSHIP: gql`
    mutation CreateRelationship($input: CreateRelationshipInput!) {
      createRelationship(input: $input) {
        ...RelationshipFields
      }
    }
    ${RELATIONSHIP_FRAGMENT}
  `,

  UPDATE_RELATIONSHIP: gql`
    mutation UpdateRelationship($id: ID!, $input: UpdateRelationshipInput!) {
      updateRelationship(id: $id, input: $input) {
        ...RelationshipFields
      }
    }
    ${RELATIONSHIP_FRAGMENT}
  `,
}

// ============================================================================
// NEXUS QUERIES & MUTATIONS
// ============================================================================

export const NEXUS_QUERIES = {
  NETWORK_CONNECTIONS: gql`
    query NetworkConnections($userId: ID!, $limit: Int) {
      networkConnections(userId: $userId, limit: $limit) {
        id
        fromUserId
        toUserId
        status
        introductionType
        priority
        message
        createdAt
        respondedAt
      }
    }
  `,

  FUNDING_APPLICATIONS: gql`
    query FundingApplications($companyId: ID!) {
      fundingApplications(companyId: $companyId) {
        id
        fundingType
        amount
        status
        submittedAt
        approvedAt
        fundedAt
        useOfFunds
        createdAt
      }
    }
  `,

  INVESTOR_PROFILES: gql`
    query InvestorProfiles($limit: Int, $filters: InvestorFilters) {
      investorProfiles(limit: $limit, filters: $filters) {
        id
        userId
        investmentFocus
        typicalInvestmentSize {
          min
          max
        }
        investmentStage
        geography
        sectors
        portfolioCompanies
        createdAt
      }
    }
  `,
}

export const NEXUS_MUTATIONS = {
  REQUEST_INTRODUCTION: gql`
    mutation RequestIntroduction($input: IntroductionRequestInput!) {
      requestIntroduction(input: $input) {
        id
        status
        createdAt
      }
    }
  `,

  RESPOND_TO_INTRODUCTION: gql`
    mutation RespondToIntroduction($introductionId: ID!, $response: IntroductionResponse!) {
      respondToIntroduction(introductionId: $introductionId, response: $response) {
        id
        status
        respondedAt
      }
    }
  `,

  CREATE_FUNDING_APPLICATION: gql`
    mutation CreateFundingApplication($input: FundingApplicationInput!) {
      createFundingApplication(input: $input) {
        id
        status
        submittedAt
      }
    }
  `,
}

// ============================================================================
// PULSE QUERIES & MUTATIONS
// ============================================================================

export const PULSE_QUERIES = {
  CONVERSATIONS: gql`
    query Conversations($userId: ID!) {
      conversations(userId: $userId) {
        id
        lastMessageAt
        unreadCount
        status
        createdAt
        contact {
          id
          name
          email
          phone
        }
      }
    }
  `,

  MESSAGES: gql`
    query Messages($conversationId: ID!, $limit: Int, $offset: Int) {
      messages(conversationId: $conversationId, limit: $limit, offset: $offset) {
        id
        userId
        channel
        direction
        content
        status
        sentAt
        deliveredAt
        readAt
        metadata
      }
    }
  `,
}

export const PULSE_MUTATIONS = {
  SEND_MESSAGE: gql`
    mutation SendMessage($input: SendMessageInput!) {
      sendMessage(input: $input) {
        id
        status
        sentAt
      }
    }
  `,

  CREATE_CONVERSATION: gql`
    mutation CreateConversation($input: CreateConversationInput!) {
      createConversation(input: $input) {
        id
        status
        createdAt
      }
    }
  `,

  MARK_AS_READ: gql`
    mutation MarkAsRead($conversationId: ID!) {
      markAsRead(conversationId: $conversationId) {
        success
        unreadCount
      }
    }
  `,
}

// ============================================================================
// REACT QUERY INTEGRATION
// ============================================================================

// These would be used with React Query for caching and state management
export const graphqlHooks = {
  // Auth hooks
  useMe: () => ({ data: null, isLoading: false }), // Placeholder
  useLogin: () => ({ mutate: () => {}, isLoading: false }), // Placeholder

  // Company hooks
  useCompanies: () => ({ data: [], isLoading: false }), // Placeholder
  useCompany: (id: string) => ({ data: null, isLoading: false }), // Placeholder

  // Knowledge Graph hooks
  useEntities: () => ({ data: [], isLoading: false }), // Placeholder
  useEntity: (id: string) => ({ data: null, isLoading: false }), // Placeholder

  // Nexus hooks
  useNetworkConnections: (userId: string) => ({ data: [], isLoading: false }), // Placeholder

  // Pulse hooks
  useConversations: (userId: string) => ({ data: [], isLoading: false }), // Placeholder
}

export default graphqlClient