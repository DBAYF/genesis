'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Code,
  FileText,
  Play,
  Copy,
  Search,
  Database,
  Shield,
  Zap,
  Network,
  MessageSquare,
} from 'lucide-react'
import { config } from '@/config'

interface APIEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  path: string
  description: string
  parameters?: APIParameter[]
  response?: any
  auth?: boolean
}

interface APIParameter {
  name: string
  type: string
  required: boolean
  description: string
}

interface GraphQLType {
  name: string
  kind: 'OBJECT' | 'INPUT_OBJECT' | 'ENUM' | 'SCALAR'
  description?: string
  fields?: GraphQLField[]
}

interface GraphQLField {
  name: string
  type: string
  description?: string
  args?: GraphQLArgument[]
}

interface GraphQLArgument {
  name: string
  type: string
  description?: string
}

// Mock API documentation data based on the technical spec
const apiEndpoints: APIEndpoint[] = [
  // Authentication
  {
    method: 'POST',
    path: '/api/auth/login',
    description: 'Authenticate user and return JWT token',
    parameters: [
      { name: 'email', type: 'string', required: true, description: 'User email address' },
      { name: 'password', type: 'string', required: true, description: 'User password' },
    ],
    response: { token: 'string', user: 'User', refreshToken: 'string' },
  },
  {
    method: 'POST',
    path: '/api/auth/register',
    description: 'Register a new user account',
    parameters: [
      { name: 'email', type: 'string', required: true, description: 'User email address' },
      { name: 'password', type: 'string', required: true, description: 'User password' },
      { name: 'firstName', type: 'string', required: true, description: 'User first name' },
      { name: 'lastName', type: 'string', required: true, description: 'User last name' },
    ],
    response: { token: 'string', user: 'User', refreshToken: 'string' },
  },
  {
    method: 'POST',
    path: '/api/auth/refresh',
    description: 'Refresh JWT access token',
    auth: true,
    response: { token: 'string', refreshToken: 'string' },
  },

  // Companies
  {
    method: 'GET',
    path: '/api/companies',
    description: 'Get list of user companies',
    auth: true,
    response: { data: 'Company[]', pagination: 'Pagination' },
  },
  {
    method: 'POST',
    path: '/api/companies',
    description: 'Create a new company',
    auth: true,
    parameters: [
      { name: 'name', type: 'string', required: true, description: 'Company name' },
      { name: 'companyType', type: 'CompanyType', required: true, description: 'Type of company' },
    ],
    response: { data: 'Company' },
  },
  {
    method: 'GET',
    path: '/api/companies/{id}',
    description: 'Get company details',
    auth: true,
    response: { data: 'Company' },
  },

  // Financial
  {
    method: 'GET',
    path: '/api/companies/{companyId}/financial/projections',
    description: 'Get financial projections for a company',
    auth: true,
    response: { data: 'FinancialProjection[]' },
  },
  {
    method: 'POST',
    path: '/api/companies/{companyId}/financial/projections',
    description: 'Create financial projection',
    auth: true,
    parameters: [
      { name: 'scenario', type: 'FinancialScenario', required: true, description: 'Projection scenario' },
      { name: 'period', type: 'string', required: true, description: 'Period (YYYY-MM)' },
    ],
    response: { data: 'FinancialProjection' },
  },

  // Knowledge Graph
  {
    method: 'GET',
    path: '/api/knowledge/entities',
    description: 'Get knowledge graph entities',
    auth: true,
    response: { data: 'Entity[]' },
  },
  {
    method: 'POST',
    path: '/api/knowledge/entities',
    description: 'Create new entity',
    auth: true,
    parameters: [
      { name: 'type', type: 'EntityType', required: true, description: 'Entity type' },
      { name: 'name', type: 'string', required: true, description: 'Entity name' },
    ],
    response: { data: 'Entity' },
  },

  // Nexus
  {
    method: 'POST',
    path: '/api/nexus/introductions',
    description: 'Request introduction between users',
    auth: true,
    parameters: [
      { name: 'fromUserId', type: 'string', required: true, description: 'Requesting user ID' },
      { name: 'toUserId', type: 'string', required: true, description: 'Target user ID' },
      { name: 'message', type: 'string', required: true, description: 'Introduction message' },
    ],
    response: { data: 'IntroductionRequest' },
  },

  // Pulse
  {
    method: 'POST',
    path: '/api/pulse/messages',
    description: 'Send message via Pulse',
    auth: true,
    parameters: [
      { name: 'channel', type: 'MessageChannel', required: true, description: 'Communication channel' },
      { name: 'recipient', type: 'string', required: true, description: 'Recipient identifier' },
      { name: 'content', type: 'string', required: true, description: 'Message content' },
    ],
    response: { data: 'Message' },
  },
]

const graphqlTypes: GraphQLType[] = [
  {
    name: 'User',
    kind: 'OBJECT',
    description: 'User account information',
    fields: [
      { name: 'id', type: 'ID!', description: 'Unique user identifier' },
      { name: 'email', type: 'String!', description: 'User email address' },
      { name: 'firstName', type: 'String', description: 'User first name' },
      { name: 'lastName', type: 'String', description: 'User last name' },
      { name: 'avatarUrl', type: 'String', description: 'Profile picture URL' },
    ],
  },
  {
    name: 'Company',
    kind: 'OBJECT',
    description: 'Company information and details',
    fields: [
      { name: 'id', type: 'ID!', description: 'Unique company identifier' },
      { name: 'name', type: 'String!', description: 'Company name' },
      { name: 'companyNumber', type: 'String', description: 'Companies House number' },
      { name: 'companyType', type: 'CompanyType!', description: 'Type of company' },
      { name: 'companyStatus', type: 'CompanyStatus!', description: 'Current company status' },
      { name: 'incorporationDate', type: 'DateTime', description: 'Date of incorporation' },
    ],
  },
  {
    name: 'Entity',
    kind: 'OBJECT',
    description: 'Knowledge graph entity',
    fields: [
      { name: 'id', type: 'ID!', description: 'Unique entity identifier' },
      { name: 'type', type: 'EntityType!', description: 'Type of entity' },
      { name: 'name', type: 'String!', description: 'Entity name' },
      { name: 'description', type: 'String', description: 'Entity description' },
      { name: 'properties', type: 'JSONObject', description: 'Additional properties' },
    ],
  },
]

export function APIDocumentation() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEndpoint, setSelectedEndpoint] = useState<APIEndpoint | null>(null)

  const filteredEndpoints = apiEndpoints.filter(endpoint =>
    endpoint.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    endpoint.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getMethodColor = (method: APIEndpoint['method']) => {
    switch (method) {
      case 'GET':
        return 'bg-green-500'
      case 'POST':
        return 'bg-blue-500'
      case 'PUT':
        return 'bg-yellow-500'
      case 'PATCH':
        return 'bg-purple-500'
      case 'DELETE':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Documentation</h1>
          <p className="text-muted-foreground">
            Complete API reference for Genesis Engine
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-xs">
            Version {config.NEXT_PUBLIC_APP_VERSION}
          </Badge>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* API Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">REST Endpoints</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apiEndpoints.length}</div>
            <p className="text-xs text-muted-foreground">
              Available endpoints
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">GraphQL Types</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{graphqlTypes.length}</div>
            <p className="text-xs text-muted-foreground">
              Schema definitions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Authentication</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">JWT</div>
            <p className="text-xs text-muted-foreground">
              Bearer token auth
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Base URL</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-mono truncate">
              {config.NEXT_PUBLIC_API_URL}
            </div>
            <p className="text-xs text-muted-foreground">
              API endpoint
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="rest" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="rest">REST API</TabsTrigger>
          <TabsTrigger value="graphql">GraphQL</TabsTrigger>
        </TabsList>

        {/* REST API Tab */}
        <TabsContent value="rest" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Endpoint List */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Endpoints</CardTitle>
                  <CardDescription>
                    Available API endpoints
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search endpoints..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>

                    <ScrollArea className="h-96">
                      <div className="space-y-1">
                        {filteredEndpoints.map((endpoint, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedEndpoint(endpoint)}
                            className={`w-full text-left p-3 rounded-lg border transition-colors ${
                              selectedEndpoint === endpoint
                                ? 'bg-accent border-primary'
                                : 'hover:bg-accent/50'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                className={`text-xs text-white ${getMethodColor(endpoint.method)}`}
                              >
                                {endpoint.method}
                              </Badge>
                              {endpoint.auth && (
                                <Shield className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                            <div className="text-sm font-medium truncate">
                              {endpoint.path}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {endpoint.description}
                            </div>
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Endpoint Details */}
            <div className="lg:col-span-2">
              {selectedEndpoint ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={`text-white ${getMethodColor(selectedEndpoint.method)}`}>
                          {selectedEndpoint.method}
                        </Badge>
                        <div>
                          <CardTitle className="font-mono text-lg">
                            {selectedEndpoint.path}
                          </CardTitle>
                          <CardDescription>
                            {selectedEndpoint.description}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {selectedEndpoint.auth && (
                          <Badge variant="outline">
                            <Shield className="h-3 w-3 mr-1" />
                            Auth Required
                          </Badge>
                        )}
                        <Button variant="outline" size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Test
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Parameters */}
                    {selectedEndpoint.parameters && selectedEndpoint.parameters.length > 0 && (
                      <div>
                        <h3 className="font-medium mb-3">Parameters</h3>
                        <div className="space-y-2">
                          {selectedEndpoint.parameters.map((param, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded">
                              <div className="flex items-center gap-3">
                                <code className="text-sm font-mono">{param.name}</code>
                                <Badge variant="outline" className="text-xs">
                                  {param.type}
                                </Badge>
                                {param.required && (
                                  <Badge variant="destructive" className="text-xs">
                                    Required
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground flex-1 ml-4">
                                {param.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Response */}
                    {selectedEndpoint.response && (
                      <div>
                        <h3 className="font-medium mb-3">Response</h3>
                        <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
                          {JSON.stringify(selectedEndpoint.response, null, 2)}
                        </pre>
                      </div>
                    )}

                    {/* Example Request */}
                    <div>
                      <h3 className="font-medium mb-3">Example Request</h3>
                      <div className="bg-muted p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`text-white ${getMethodColor(selectedEndpoint.method)}`}>
                            {selectedEndpoint.method}
                          </Badge>
                          <code className="text-sm">
                            {config.NEXT_PUBLIC_API_URL}{selectedEndpoint.path}
                          </code>
                        </div>
                        {selectedEndpoint.parameters && (
                          <pre className="text-sm">
                            {JSON.stringify(
                              selectedEndpoint.parameters.reduce((acc, param) => {
                                acc[param.name] = param.type === 'string' ? 'example_value' : param.type
                                return acc
                              }, {} as any),
                              null,
                              2
                            )}
                          </pre>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center text-muted-foreground">
                      <Code className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Select an endpoint to view details</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* GraphQL Tab */}
        <TabsContent value="graphql" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>GraphQL Endpoint</CardTitle>
                <CardDescription>
                  Primary GraphQL API for complex queries and mutations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Network className="h-4 w-4" />
                    <code className="text-sm">
                      {config.NEXT_PUBLIC_API_URL}/graphql
                    </code>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    GraphQL playground available at{' '}
                    <code>{config.NEXT_PUBLIC_API_URL}/docs</code>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schema Types</CardTitle>
                <CardDescription>
                  Available GraphQL types and their fields
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {graphqlTypes.map((type, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{type.kind}</Badge>
                        <h3 className="font-medium font-mono">{type.name}</h3>
                      </div>
                      {type.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {type.description}
                        </p>
                      )}
                      {type.fields && (
                        <div className="space-y-1">
                          {type.fields.slice(0, 5).map((field, fieldIndex) => (
                            <div key={fieldIndex} className="flex items-center gap-2 text-sm">
                              <code className="text-blue-600">{field.name}</code>
                              <span className="text-muted-foreground">:</span>
                              <code className="text-green-600">{field.type}</code>
                              {field.description && (
                                <span className="text-muted-foreground text-xs">
                                  - {field.description}
                                </span>
                              )}
                            </div>
                          ))}
                          {type.fields.length > 5 && (
                            <p className="text-xs text-muted-foreground">
                              ... and {type.fields.length - 5} more fields
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}