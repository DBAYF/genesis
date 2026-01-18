// ============================================================================
// GENESIS ENGINE - NEO4J KNOWLEDGE GRAPH SCHEMA
// ============================================================================
// Cypher commands to initialize the Neo4j knowledge graph schema
// ============================================================================

// ============================================================================
// CONSTRAINTS
// ============================================================================

// Entity constraints
CREATE CONSTRAINT entity_id IF NOT EXISTS FOR (e:Entity) REQUIRE e.id IS UNIQUE;
CREATE CONSTRAINT entity_type_id IF NOT EXISTS FOR (e:Entity) REQUIRE (e.type, e.externalId) IS UNIQUE WHERE e.externalId IS NOT NULL;

// Relationship constraints
CREATE CONSTRAINT relationship_id IF NOT EXISTS FOR ()-[r:RELATES_TO]-() REQUIRE r.id IS UNIQUE;

// ============================================================================
// INDEXES
// ============================================================================

// Entity indexes
CREATE INDEX entity_type IF NOT EXISTS FOR (e:Entity) ON (e.type);
CREATE INDEX entity_name IF NOT EXISTS FOR (e:Entity) ON (e.name);
CREATE INDEX entity_company IF NOT EXISTS FOR (e:Entity) ON (e.companyId);
CREATE INDEX entity_created IF NOT EXISTS FOR (e:Entity) ON (e.createdAt);

// Relationship indexes
CREATE INDEX relationship_type IF NOT EXISTS FOR ()-[r:RELATES_TO]-() ON (r.type);
CREATE INDEX relationship_strength IF NOT EXISTS FOR ()-[r:RELATES_TO]-() ON (r.strength);
CREATE INDEX relationship_created IF NOT EXISTS FOR ()-[r:RELATES_TO]-() ON (r.createdAt);

// ============================================================================
// NODE TYPES (LABELS)
// ============================================================================

// Core entity types
CALL db.createLabel('Entity');
CALL db.createLabel('Company');
CALL db.createLabel('Person');
CALL db.createLabel('Investor');
CALL db.createLabel('Advisor');
CALL db.createLabel('Partner');
CALL db.createLabel('Employee');
CALL db.createLabel('Customer');
CALL db.createLabel('Supplier');
CALL db.createLabel('Document');
CALL db.createLabel('Contract');
CALL db.createLabel('Project');
CALL db.createLabel('Task');
CALL db.createLabel('Event');
CALL db.createLabel('Location');
CALL db.createLabel('Industry');
CALL db.createLabel('Technology');
CALL db.createLabel('Skill');
CALL db.createLabel('Concept');
CALL db.createLabel('Resource');

// ============================================================================
// RELATIONSHIP TYPES
// ============================================================================

// Core relationship types
CALL db.createRelationshipType('RELATES_TO');
CALL db.createRelationshipType('WORKS_FOR');
CALL db.createRelationshipType('INVESTED_IN');
CALL db.createRelationshipType('ADVISED_BY');
CALL db.createRelationshipType('PARTNERED_WITH');
CALL db.createRelationshipType('EMPLOYED');
CALL db.createRelationshipType('SUPPLIES_TO');
CALL db.createRelationshipType('SERVES');
CALL db.createRelationshipType('LOCATED_IN');
CALL db.createRelationshipType('BELONGS_TO_INDUSTRY');
CALL db.createRelationshipType('USES_TECHNOLOGY');
CALL db.createRelationshipType('HAS_SKILL');
CALL db.createRelationshipType('REFERENCES_CONCEPT');
CALL db.createRelationshipType('CREATED_DOCUMENT');
CALL db.createRelationshipType('SIGNED_CONTRACT');
CALL db.createRelationshipType('ATTENDED_EVENT');
CALL db.createRelationshipType('CONNECTED_TO');

// ============================================================================
// ENTITY NODE STRUCTURE
// ============================================================================

// Example entity creation patterns:

// Company node
/*
CREATE (c:Entity:Company {
  id: 'company-uuid',
  type: 'company',
  name: 'Genesis Engine Ltd',
  description: 'AI-powered startup automation platform',
  companyId: 'company-uuid',
  externalId: '12345678', // Companies House number
  industry: 'Technology',
  sector: 'SaaS',
  stage: 'Seed',
  foundedDate: datetime('2024-01-01'),
  location: 'London, UK',
  website: 'https://genesis-engine.com',
  linkedin: 'https://linkedin.com/company/genesis-engine',
  metadata: {
    employeeCount: 5,
    fundingRaised: 500000,
    lastValuation: 2000000
  },
  createdAt: datetime(),
  updatedAt: datetime()
})
*/

// Person node
/*
CREATE (p:Entity:Person {
  id: 'person-uuid',
  type: 'person',
  name: 'John Smith',
  title: 'CEO',
  email: 'john@genesis-engine.com',
  phone: '+44 20 1234 5678',
  linkedin: 'https://linkedin.com/in/johnsmith',
  location: 'London, UK',
  bio: 'Experienced entrepreneur with 10+ years in tech startups',
  skills: ['Leadership', 'Strategy', 'Fundraising'],
  companyId: 'company-uuid',
  externalId: null,
  metadata: {
    experience: 10,
    education: 'MBA, Oxford University'
  },
  createdAt: datetime(),
  updatedAt: datetime()
})
*/

// ============================================================================
// RELATIONSHIP STRUCTURE
// ============================================================================

// Example relationship creation patterns:

// Employment relationship
/*
MATCH (p:Entity {id: 'person-uuid'}), (c:Entity {id: 'company-uuid'})
CREATE (p)-[r:RELATES_TO {
  id: 'relationship-uuid',
  type: 'WORKS_FOR',
  role: 'CEO',
  startDate: datetime('2024-01-01'),
  isCurrent: true,
  strength: 1.0,
  metadata: {
    salary: 150000,
    equity: 0.1
  },
  createdAt: datetime(),
  updatedAt: datetime()
}]->(c)
*/

// Investment relationship
/*
MATCH (i:Entity {id: 'investor-uuid'}), (c:Entity {id: 'company-uuid'})
CREATE (i)-[r:RELATES_TO {
  id: 'investment-uuid',
  type: 'INVESTED_IN',
  amount: 100000,
  currency: 'GBP',
  date: datetime('2024-03-01'),
  round: 'Seed',
  equity: 0.05,
  strength: 0.9,
  metadata: {
    terms: 'Standard seed terms',
    leadInvestor: true
  },
  createdAt: datetime(),
  updatedAt: datetime()
}]->(c)
*/

// ============================================================================
// COMMON QUERIES
// ============================================================================

// Find all entities connected to a company
/*
MATCH (c:Entity {id: $companyId})-[r:RELATES_TO]-(e:Entity)
RETURN e, r
ORDER BY r.strength DESC, r.updatedAt DESC
*/

// Find shortest path between two entities
/*
MATCH path = shortestPath(
  (start:Entity {id: $startId})-[*..10]-(end:Entity {id: $endId})
)
RETURN path
*/

// Find entities by semantic similarity (using embeddings)
/*
MATCH (e:Entity)
WHERE e.embedding IS NOT NULL
WITH e, gds.similarity.cosine(e.embedding, $queryEmbedding) AS similarity
WHERE similarity > 0.7
RETURN e, similarity
ORDER BY similarity DESC
LIMIT 10
*/

// ============================================================================
// VECTOR INDEXES (for semantic search)
// ============================================================================

// Create vector index for embeddings (Neo4j 5.0+)
/*
CREATE VECTOR INDEX entity_embedding IF NOT EXISTS
FOR (e:Entity)
ON (e.embedding)
OPTIONS {
  indexConfig: {
    `vector.dimensions`: 1536,
    `vector.similarity_function`: 'cosine'
  }
}
*/

// ============================================================================
// FULL-TEXT INDEXES
// ============================================================================

// Full-text index for entity content
/*
CREATE FULLTEXT INDEX entity_content IF NOT EXISTS
FOR (e:Entity)
ON EACH [e.name, e.description, e.content]
*/

// Full-text index for relationships
/*
CREATE FULLTEXT INDEX relationship_content IF NOT EXISTS
FOR ()-[r:RELATES_TO]-()
ON EACH [r.description, r.notes]
*/