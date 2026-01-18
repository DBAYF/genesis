// ============================================================================
// GENESIS ENGINE - KNOWLEDGE GRAPH SERVICE
// ============================================================================

import { config } from '@/config'
import { mockData } from '@/data/mockData'
import { Entity, Relationship } from '@/types'


export interface SemanticSearchResult {
  entityId: string
  content: string
  score: number
  metadata: Record<string, any>
}

export interface KnowledgeGraphQuery {
  entities?: string[]
  relationships?: string[]
  filters?: Record<string, any>
  companyId?: string
  limit?: number
  offset?: number
}

export class KnowledgeGraphService {
  private neo4jUrl?: string
  private neo4jAuth?: string

  constructor() {
    this.neo4jUrl = config.NEXT_PUBLIC_DB_NEO4J_ENABLED ? config.NEXT_PUBLIC_NEO4J_URL : undefined
    this.neo4jAuth = config.NEXT_PUBLIC_NEO4J_USER && config.NEXT_PUBLIC_NEO4J_PASSWORD
      ? `Basic ${btoa(`${config.NEXT_PUBLIC_NEO4J_USER}:${config.NEXT_PUBLIC_NEO4J_PASSWORD}`)}`
      : undefined
  }

  async getCompanyContext(companyId: string): Promise<any> {
    // Get all entities and relationships related to a company
    const entities = await this.getEntities({ companyId })
    const relationships = await this.getRelationships({ companyId })

    return {
      company: entities.find(e => e.id === companyId),
      relatedEntities: entities.filter(e => e.id !== companyId),
      relationships,
    }
  }

  async getEntities(query: KnowledgeGraphQuery = {}): Promise<Entity[]> {
    // In a real implementation, this would query Neo4j
    // For now, return mock data filtered by query
    let entities = [...mockData.entities]

    if (query.entities) {
      entities = entities.filter(e => query.entities!.includes(e.id))
    }

    if (query.filters?.companyId) {
      // Filter entities related to company
      entities = entities.filter(e => e.properties.companyId === query.filters!.companyId)
    }

    if (query.limit) {
      entities = entities.slice(query.offset || 0, (query.offset || 0) + query.limit)
    }

    return entities
  }

  async getEntity(id: string): Promise<Entity | null> {
    const entities = await this.getEntities({ entities: [id] })
    return entities[0] || null
  }

  async createEntity(entity: Omit<Entity, 'id' | 'createdAt' | 'updatedAt'>): Promise<Entity> {
    const newEntity: Entity = {
      ...entity,
      id: `entity-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // In real implementation, save to Neo4j
    mockData.entities.push(newEntity)

    return newEntity
  }

  async updateEntity(id: string, updates: Partial<Entity>): Promise<Entity | null> {
    const entities = mockData.entities
    const index = entities.findIndex(e => e.id === id)

    if (index === -1) return null

    entities[index] = {
      ...entities[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    return entities[index]
  }

  async deleteEntity(id: string): Promise<boolean> {
    const entities = mockData.entities
    const index = entities.findIndex(e => e.id === id)

    if (index === -1) return false

    entities.splice(index, 1)
    return true
  }

  async getRelationships(query: KnowledgeGraphQuery = {}): Promise<Relationship[]> {
    // In a real implementation, this would query Neo4j
    let relationships = [...mockData.relationships]

    if (query.relationships) {
      relationships = relationships.filter(r => query.relationships!.includes(r.id))
    }

    if (query.filters?.companyId) {
      // Get relationships where either entity is related to company
      const companyEntities = mockData.entities
        .filter(e => e.properties.companyId === query.filters!.companyId)
        .map(e => e.id)

      relationships = relationships.filter(r =>
        companyEntities.includes(r.fromEntityId) || companyEntities.includes(r.toEntityId)
      )
    }

    if (query.limit) {
      relationships = relationships.slice(query.offset || 0, (query.offset || 0) + query.limit)
    }

    return relationships
  }

  async getRelationship(id: string): Promise<Relationship | null> {
    const relationships = await this.getRelationships({ relationships: [id] })
    return relationships[0] || null
  }

  async createRelationship(relationship: Omit<Relationship, 'id' | 'createdAt'>): Promise<Relationship> {
    const newRelationship: Relationship = {
      ...relationship,
      id: `relationship-${Date.now()}`,
      createdAt: new Date().toISOString(),
    }

    // In real implementation, save to Neo4j
    mockData.relationships.push(newRelationship)

    return newRelationship
  }

  async updateRelationship(id: string, updates: Partial<Relationship>): Promise<Relationship | null> {
    const relationships = mockData.relationships
    const index = relationships.findIndex(r => r.id === id)

    if (index === -1) return null

    relationships[index] = {
      ...relationships[index],
      ...updates,
    }

    return relationships[index]
  }

  async semanticSearch(
    query: string,
    companyId?: string,
    options: { limit?: number } = {}
  ): Promise<SemanticSearchResult[]> {
    // In a real implementation, this would use Neo4j's full-text search and embeddings
    // For now, do a simple text search on mock data

    const entities = await this.getEntities(companyId ? { filters: { companyId } } : {})
    const results: SemanticSearchResult[] = []

    entities.forEach(entity => {
      // Simple text matching - in real implementation would use embeddings
      const content = `${entity.name} ${entity.description} ${JSON.stringify(entity.properties)}`
      const score = this.calculateSimilarity(query.toLowerCase(), content.toLowerCase())

      if (score > 0.1) { // Basic threshold
        results.push({
          entityId: entity.id,
          content: content.substring(0, 500), // Truncate for summary
          score,
          metadata: {
            type: entity.type,
            name: entity.name,
          },
        })
      }
    })

    // Sort by score and limit
    results.sort((a, b) => b.score - a.score)
    return results.slice(0, options.limit || 10)
  }

  async findRelatedEntities(
    entityId: string,
    relationshipTypes?: string[],
    maxDepth: number = 2
  ): Promise<{ entities: Entity[]; relationships: Relationship[]; paths: any[] }> {
    // In a real implementation, this would use Neo4j graph algorithms
    // For now, return direct relationships

    const relationships = mockData.relationships.filter(r =>
      r.fromEntityId === entityId || r.toEntityId === entityId
    )

    const relatedEntityIds = new Set<string>()
    relationships.forEach(r => {
      relatedEntityIds.add(r.fromEntityId)
      relatedEntityIds.add(r.toEntityId)
    })
    relatedEntityIds.delete(entityId)

    const entities = mockData.entities.filter(e => relatedEntityIds.has(e.id))

    return {
      entities,
      relationships,
      paths: [], // Would contain path information in real implementation
    }
  }

  async getEntityInsights(entityId: string): Promise<{
    centrality: number
    clusters: string[]
    recommendations: string[]
  }> {
    // In a real implementation, this would use graph analytics
    // For now, return mock insights

    const relationships = mockData.relationships.filter(r =>
      r.fromEntityId === entityId || r.toEntityId === entityId
    )

    return {
      centrality: relationships.length,
      clusters: ['startup_ecosystem', 'investor_network'],
      recommendations: [
        'Consider connecting with similar companies in your sector',
        'Explore partnership opportunities with related businesses',
      ],
    }
  }

  private calculateSimilarity(query: string, content: string): number {
    // Very simple similarity calculation - in real implementation would use embeddings
    const queryWords = query.split(' ').filter(w => w.length > 2)
    const contentWords = content.split(' ').filter(w => w.length > 2)

    let matches = 0
    queryWords.forEach(word => {
      if (contentWords.some(contentWord => contentWord.includes(word))) {
        matches++
      }
    })

    return matches / queryWords.length
  }

  // Neo4j-specific methods (would be used in real implementation)
  private async runNeo4jQuery(query: string, params: Record<string, any> = {}): Promise<any[]> {
    if (!this.neo4jUrl || !this.neo4jAuth) {
      throw new Error('Neo4j not configured')
    }

    const response = await fetch(`${this.neo4jUrl}/db/neo4j/tx/commit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.neo4jAuth,
      },
      body: JSON.stringify({
        statements: [{
          statement: query,
          parameters: params,
        }],
      }),
    })

    if (!response.ok) {
      throw new Error(`Neo4j query failed: ${response.statusText}`)
    }

    const result = await response.json()
    return result.results[0]?.data || []
  }
}

// Export singleton instance
export const knowledgeGraphService = new KnowledgeGraphService()