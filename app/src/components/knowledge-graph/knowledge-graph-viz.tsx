'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Network,
  Search,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Filter,
  Users,
  Building2,
  User,
  Target,
} from 'lucide-react'
import { mockData } from '@/data/mockData'
import { Entity, Relationship } from '@/types'

interface GraphNode {
  id: string
  x: number
  y: number
  entity: Entity
  connections: number
}

interface GraphEdge {
  id: string
  source: GraphNode
  target: GraphNode
  relationship: Relationship
}

const entityIcons = {
  company: Building2,
  investor: Users,
  person: User,
  advisor: Target,
  partner: Users, // Add partner mapping
} as const

const entityColors = {
  company: 'bg-blue-500',
  investor: 'bg-green-500',
  person: 'bg-purple-500',
  advisor: 'bg-orange-500',
  partner: 'bg-indigo-500',
} as const

export function KnowledgeGraphViz() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null)
  const [zoom, setZoom] = useState(1)
  const [filter, setFilter] = useState<string>('all')

  const entities = mockData.entities
  const relationships = mockData.relationships

  // Generate graph layout (simple circular layout for demo)
  const graphData = useMemo(() => {
    const filteredEntities = entities.filter(entity =>
      filter === 'all' || entity.type === filter
    ).filter(entity =>
      !searchTerm || entity.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const centerX = 400
    const centerY = 300
    const radius = 200

    const nodes: GraphNode[] = filteredEntities.map((entity, index) => {
      const angle = (index / filteredEntities.length) * 2 * Math.PI
      const connections = relationships.filter(
        r => r.fromEntityId === entity.id || r.toEntityId === entity.id
      ).length

      return {
        id: entity.id,
        x: centerX + Math.cos(angle) * radius * (1 + connections * 0.1),
        y: centerY + Math.sin(angle) * radius * (1 + connections * 0.1),
        entity,
        connections,
      }
    })

    const edges: GraphEdge[] = relationships
      .map(rel => {
        const sourceNode = nodes.find(n => n.id === rel.fromEntityId)
        const targetNode = nodes.find(n => n.id === rel.toEntityId)

        if (!sourceNode || !targetNode) return null

        return {
          id: rel.id,
          source: sourceNode,
          target: targetNode,
          relationship: rel,
        }
      })
      .filter(Boolean) as GraphEdge[]

    return { nodes, edges }
  }, [entities, relationships, searchTerm, filter])

  const handleNodeClick = (node: GraphNode) => {
    setSelectedEntity(node.entity)
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5))
  const handleReset = () => {
    setZoom(1)
    setSelectedEntity(null)
  }

  const getEntityIcon = (type: Entity['type']) => {
    const IconComponent = entityIcons[type] || User
    return <IconComponent className="h-4 w-4" />
  }

  const getEntityColor = (type: Entity['type']) => {
    return entityColors[type] || 'bg-gray-500'
  }

  const entityTypes = ['all', ...Array.from(new Set(entities.map(e => e.type)))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Graph</h1>
          <p className="text-muted-foreground">
            Explore relationships and connections in your business network
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search entities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border rounded-md text-sm"
              >
                {entityTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Graph Visualization */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Network Visualization</CardTitle>
              <CardDescription>
                Interactive graph showing entity relationships
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative h-96 bg-gray-50 rounded-lg overflow-hidden">
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 800 600"
                  style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
                >
                  {/* Edges */}
                  {graphData.edges.map(edge => (
                    <line
                      key={edge.id}
                      x1={edge.source.x}
                      y1={edge.source.y}
                      x2={edge.target.x}
                      y2={edge.target.y}
                      stroke="#94a3b8"
                      strokeWidth="2"
                      opacity="0.6"
                    />
                  ))}

                  {/* Nodes */}
                  {graphData.nodes.map(node => {
                    const isSelected = selectedEntity?.id === node.id
                    const size = Math.max(20, Math.min(40, 20 + node.connections * 2))

                    return (
                      <g key={node.id}>
                        {/* Node circle */}
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={size}
                          fill={getEntityColor(node.entity.type)}
                          stroke={isSelected ? '#3b82f6' : '#ffffff'}
                          strokeWidth={isSelected ? '3' : '2'}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleNodeClick(node)}
                        />

                        {/* Node icon */}
                        <foreignObject
                          x={node.x - size/2}
                          y={node.y - size/2}
                          width={size}
                          height={size}
                          className="cursor-pointer"
                          onClick={() => handleNodeClick(node)}
                        >
                          <div className="w-full h-full flex items-center justify-center text-white">
                            {getEntityIcon(node.entity.type)}
                          </div>
                        </foreignObject>

                        {/* Node label */}
                        <text
                          x={node.x}
                          y={node.y + size + 15}
                          textAnchor="middle"
                          fontSize="12"
                          fill="#374151"
                          className="pointer-events-none"
                        >
                          {node.entity.name.length > 15
                            ? node.entity.name.substring(0, 15) + '...'
                            : node.entity.name
                          }
                        </text>
                      </g>
                    )
                  })}
                </svg>

                {graphData.nodes.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No entities found matching your criteria</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Entity Details */}
        <div className="space-y-4">
          {selectedEntity ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${getEntityColor(selectedEntity.type)}`}>
                      {getEntityIcon(selectedEntity.type)}
                    </div>
                    {selectedEntity.name}
                  </CardTitle>
                  <CardDescription>
                    {selectedEntity.type.charAt(0).toUpperCase() + selectedEntity.type.slice(1)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{selectedEntity.description}</p>

                  {/* Properties */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Properties</h4>
                    {Object.entries(selectedEntity.properties).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Relationships */}
              <Card>
                <CardHeader>
                  <CardTitle>Relationships</CardTitle>
                  <CardDescription>
                    Connected entities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {relationships
                      .filter(r => r.fromEntityId === selectedEntity.id || r.toEntityId === selectedEntity.id)
                      .map(rel => {
                        const otherEntityId = rel.fromEntityId === selectedEntity.id
                          ? rel.toEntityId
                          : rel.fromEntityId
                        const otherEntity = entities.find(e => e.id === otherEntityId)

                        if (!otherEntity) return null

                        return (
                          <div key={rel.id} className="flex items-center gap-3 p-2 border rounded">
                            <div className={`p-1 rounded ${getEntityColor(otherEntity.type)}`}>
                              {getEntityIcon(otherEntity.type)}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{otherEntity.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {rel.type} • Strength: {rel.strength}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </CardContent>
              </Card>
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

          {/* Graph Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Graph Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Entities:</span>
                  <span className="font-medium">{entities.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Relationships:</span>
                  <span className="font-medium">{relationships.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Entity Types:</span>
                  <span className="font-medium">{entityTypes.length - 1}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Filtered:</span>
                  <span className="font-medium">{graphData.nodes.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}