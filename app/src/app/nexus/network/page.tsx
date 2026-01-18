'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MainLayout } from '@/components/layout/main-layout'
import { NexusService } from '@/services/nexus.service'
import { Search, Target, Network, MessageSquare, Handshake, TrendingUp, DollarSign, Users, Building, User } from 'lucide-react'
import { Entity, InvestorMatch } from '@/types'
import { FundingApplication } from '@/services/nexus.service'
import { aiService } from '@/services/ai.service'
import { knowledgeGraphService } from '@/services/knowledge-graph.service'

export default function NexusNetworkPage() {
  const [activeTab, setActiveTab] = useState<'network' | 'investors' | 'funding'>('network')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null)
  const [entities, setEntities] = useState<Entity[]>([])
  const [investorMatches, setInvestorMatches] = useState<InvestorMatch[]>([])
  const [fundingApplications, setFundingApplications] = useState<FundingApplication[]>([])
  const [loading, setLoading] = useState(false)

  const nexusService = new NexusService(aiService, knowledgeGraphService)

  useEffect(() => {
    loadEntities()
  }, [])

  const loadEntities = async () => {
    setLoading(true)
    try {
      // Mock data for now
      const mockEntities: Entity[] = [
        {
          id: '1',
          name: 'TechCorp Inc.',
          type: 'company',
          description: 'Leading technology company in AI and machine learning',
          properties: {},
          relationships: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          type: 'person',
          description: 'Experienced entrepreneur and investor',
          properties: {},
          relationships: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Venture Capital Partners',
          type: 'investor',
          description: 'Early-stage venture capital firm',
          properties: {},
          relationships: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]
      setEntities(mockEntities)
    } catch (error) {
      console.error('Failed to load entities:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadInvestorMatches = async () => {
    setLoading(true)
    try {
      // Mock data for now
      const mockMatches: InvestorMatch[] = [
        {
          name: 'John Smith',
          firm: 'Angel Investments LLC',
          score: 0.85,
          investmentFocus: ['SaaS', 'AI', 'FinTech'],
          investmentCriteria: {
            ticketSize: { min: 50000, max: 250000 }
          }
        },
        {
          name: 'Emily Chen',
          firm: 'Growth Ventures',
          score: 0.78,
          investmentFocus: ['B2B', 'Enterprise Software'],
          investmentCriteria: {
            ticketSize: { min: 100000, max: 500000 }
          }
        }
      ]
      setInvestorMatches(mockMatches)
    } catch (error) {
      console.error('Failed to load investor matches:', error)
    } finally {
      setLoading(false)
    }
  }

  const createFundingApplication = async (type: string, amount: number, useOfFunds: string[]) => {
    try {
      const application = await nexusService.createFundingApplication(
        'current-company-id', // Would come from auth context
        type as any,
        amount,
        useOfFunds
      )
      setFundingApplications(prev => [...prev, application])
    } catch (error) {
      console.error('Failed to create funding application:', error)
    }
  }

  const requestIntroduction = async (targetId: string, message: string) => {
    try {
      await nexusService.requestIntroduction(
        'current-user-id', // Would come from auth context
        targetId,
        { message }
      )
      // Update UI to show pending status
    } catch (error) {
      console.error('Failed to request introduction:', error)
    }
  }

  const getEntityIcon = (type: Entity['type']) => {
    const entityIcons = {
      company: Building,
      person: User,
      investor: TrendingUp,
      advisor: Users,
      partner: Users
    }
    return entityIcons[type] || Building
  }

  const getEntityRelationships = (entityId: string) => {
    // Mock relationships
    return entities.filter(e => e.id !== entityId).slice(0, 2)
  }

  const filteredEntities = entities.filter(entity =>
    entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entity.type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const introductions: any[] = [] // Mock for now

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Nexus Network</h1>
          <p className="text-muted-foreground">
            Connect with investors, partners, and industry experts
          </p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('network')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'network'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Network
          </button>
          <button
            onClick={() => setActiveTab('investors')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'investors'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Investors
          </button>
          <button
            onClick={() => setActiveTab('funding')}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'funding'
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Funding
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'network' && (
          <div className="space-y-6">
            {/* Network Tab Search */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="md:col-span-3">
                <CardContent className="pt-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search entities, companies, or people..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{entities.length}</div>
                    <p className="text-xs text-muted-foreground">Total Entities</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Network Tab Content */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="md:col-span-3">
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Investor Matching</h3>
                    <p className="text-muted-foreground mb-4">
                      AI-powered matching with investors based on your company profile
                    </p>
                    {investorMatches.length === 0 && !loading && (
                      <Button onClick={loadInvestorMatches}>
                        Find Investor Matches
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{investorMatches.length}</div>
                    <p className="text-xs text-muted-foreground">Matches Found</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Entity List */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Network Entities</CardTitle>
                    <CardDescription>
                      Companies, investors, and individuals in your network
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {filteredEntities.map((entity) => {
                      const IconComponent = getEntityIcon(entity.type)
                      const entityRelationships = getEntityRelationships(entity.id)
                      const pendingIntroductions = introductions.filter(
                        (intro) => intro.targetId === entity.id && intro.status === 'pending'
                      ).length

                      return (
                        <div
                          key={entity.id}
                          className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                          onClick={() => setSelectedEntity(entity)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-muted rounded-lg">
                                <IconComponent className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="font-medium">{entity.name}</h3>
                                <p className="text-sm text-muted-foreground capitalize">
                                  {entity.type}
                                </p>
                                {entityRelationships.length > 0 && (
                                  <p className="text-xs text-muted-foreground">
                                    {entityRelationships.length} connection{entityRelationships.length !== 1 ? 's' : ''}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {pendingIntroductions > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                  {pendingIntroductions} pending
                                </Badge>
                              )}
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost">
                                  <MessageSquare className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    requestIntroduction(entity.id, `I'd like to connect with ${entity.name}`)
                                  }}
                                >
                                  <Handshake className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
              </div>

              {/* Entity Details */}
              <div className="space-y-4">
                {selectedEntity ? (
                  <>
                    {/* Selected Entity Info */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {(() => {
                            const IconComponent = getEntityIcon(selectedEntity.type)
                            return <IconComponent className="h-5 w-5" />
                          })()}
                          {selectedEntity.name}
                        </CardTitle>
                        <CardDescription>
                          {selectedEntity.type.charAt(0).toUpperCase() + selectedEntity.type.slice(1)}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="font-medium">Type:</span>{' '}
                            <span className="text-muted-foreground capitalize">{selectedEntity.type}</span>
                          </div>
                          {selectedEntity.description && (
                            <div>
                              <span className="font-medium">Description:</span>{' '}
                              <span className="text-muted-foreground">{selectedEntity.description}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button className="flex-1" variant="outline">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Send Message
                          </Button>
                          <Button className="flex-1" variant="outline">
                            <Handshake className="h-4 w-4 mr-2" />
                            Request Introduction
                          </Button>
                          <Button className="flex-1" variant="outline">
                            <Network className="h-4 w-4 mr-2" />
                            View Full Network
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Investor Matches */}
                    {investorMatches.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Investor Matches</CardTitle>
                          <CardDescription>
                            Potential investors interested in your company
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {investorMatches.slice(0, 3).map((match, index) => (
                            <div key={index} className="p-3 border rounded-lg">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-medium">{match.name}</h4>
                                  <p className="text-sm text-muted-foreground">{match.firm}</p>
                                </div>
                                <Badge variant="secondary" className="text-xs">
                                  {Math.round(match.score * 100)}% match
                                </Badge>
                              </div>
                              <div className="space-y-1 text-xs text-muted-foreground mb-3">
                                <div>
                                  <span className="font-medium">Focus:</span>{' '}
                                  {match.investmentFocus.join(', ')}
                                </div>
                                <div>
                                  <span className="font-medium">Investment Range:</span>{' '}
                                  £{match.investmentCriteria.ticketSize.min.toLocaleString()} - £{match.investmentCriteria.ticketSize.max.toLocaleString()}
                                </div>
                              </div>
                              <Button size="sm" variant="outline">
                                Request Introduction
                              </Button>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center text-muted-foreground">
                        <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Select an entity to view details</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'investors' && (
          <div className="space-y-6">
            {/* Investors Tab Header */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="md:col-span-3">
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Investor Discovery</h3>
                    <p className="text-muted-foreground mb-4">
                      Find and connect with investors who match your funding needs
                    </p>
                    <Button onClick={loadInvestorMatches}>
                      Discover Investors
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{investorMatches.length}</div>
                    <p className="text-xs text-muted-foreground">Matches Found</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Investors List */}
            {investorMatches.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Investor Matches</CardTitle>
                  <CardDescription>
                    Potential investors based on your company profile and funding needs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {investorMatches.map((match, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium">{match.name}</h3>
                          <p className="text-sm text-muted-foreground">{match.firm}</p>
                        </div>
                        <Badge variant="secondary">
                          {Math.round(match.score * 100)}% match
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm mb-3">
                        <div>
                          <span className="font-medium">Investment Focus:</span>{' '}
                          {match.investmentFocus.join(', ')}
                        </div>
                        <div>
                          <span className="font-medium">Investment Range:</span>{' '}
                          £{match.investmentCriteria.ticketSize.min.toLocaleString()} - £{match.investmentCriteria.ticketSize.max.toLocaleString()}
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="w-full">
                        <Handshake className="h-4 w-4 mr-2" />
                        Request Introduction
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'funding' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Funding Applications</CardTitle>
                  <CardDescription>
                    Track and manage your funding applications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {fundingApplications.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No funding applications yet.</p>
                      <p className="text-sm">Create your first application below.</p>
                    </div>
                  ) : (
                    fundingApplications.map((application) => (
                      <div key={application.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-medium capitalize">{application.fundingType.replace('_', ' ')}</h3>
                            <p className="text-sm text-muted-foreground">
                              £{application.amount.toLocaleString()}
                            </p>
                          </div>
                          <Badge variant={
                            application.status === 'approved' ? 'default' :
                            application.status === 'submitted' ? 'secondary' : 'outline'
                          }>
                            {application.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p><span className="font-medium">Use of Funds:</span> {application.useOfFunds.join(', ')}</p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Create Funding Application</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-medium">Company Stage:</span>{' '}
                      <span className="text-muted-foreground">Seed</span>
                    </div>
                    <div>
                      <span className="font-medium">Industry:</span>{' '}
                      <span className="text-muted-foreground">Technology</span>
                    </div>
                    <div>
                      <span className="font-medium">Geography:</span>{' '}
                      <span className="text-muted-foreground">UK</span>
                    </div>
                    <div>
                      <span className="font-medium">Funding Amount:</span>{' '}
                      <span className="text-muted-foreground">£100K - £500K</span>
                    </div>
                  </div>
                  <Button
                    className="w-full mt-4"
                    onClick={() => createFundingApplication('seed', 250000, ['Product development', 'Marketing', 'Team expansion'])}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Create Seed Funding Application
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Application Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>• Be specific about your use of funds</p>
                  <p>• Highlight your traction and milestones</p>
                  <p>• Prepare a clear investment thesis</p>
                  <p>• Network with investors before applying</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}