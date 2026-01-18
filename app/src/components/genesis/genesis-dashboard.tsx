'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CheckCircle,
  Circle,
  Lock,
  Play,
  Target,
  TrendingUp,
  Users,
  Lightbulb,
  Cog,
  Rocket,
  BarChart3,
  Zap,
  Award,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { usePhaseStore } from '@/stores/phases'
import { PHASES, getPhaseById, MODULES } from '@/types/phases'
import { moduleEngine } from '@/services/module-engine.service'

const phaseIcons = {
  discovery: Lightbulb,
  architecture: Cog,
  mvp: Target,
  funding: TrendingUp,
  launch: Rocket,
  scale: BarChart3,
  optimize: Award,
}

const phaseColors = {
  discovery: 'bg-blue-500',
  architecture: 'bg-purple-500',
  mvp: 'bg-green-500',
  funding: 'bg-yellow-500',
  launch: 'bg-orange-500',
  scale: 'bg-red-500',
  optimize: 'bg-indigo-500',
}

export function GenesisDashboard() {
  const {
    currentPhaseId,
    completedPhases,
    completedModules,
    phaseProgress,
    getAvailablePhases,
    getPhaseStatus,
    setCurrentPhase,
    startPhase,
    completeModule,
  } = usePhaseStore()

  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(currentPhaseId)
  const [executingModule, setExecutingModule] = useState<string | null>(null)
  const [executionError, setExecutionError] = useState<string | null>(null)

  const availablePhases = getAvailablePhases()
  const currentPhase = currentPhaseId ? getPhaseById(currentPhaseId) : null
  const selectedPhase = selectedPhaseId ? getPhaseById(selectedPhaseId) : null

  const getPhaseIcon = (phaseId: string) => {
    const IconComponent = phaseIcons[phaseId as keyof typeof phaseIcons] || Circle
    return <IconComponent className="h-5 w-5" />
  }

  const getPhaseColor = (phaseId: string) => {
    return phaseColors[phaseId as keyof typeof phaseColors] || 'bg-gray-500'
  }

  const getStatusIcon = (phaseId: string) => {
    const status = getPhaseStatus(phaseId)

    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'in_progress':
        return <Play className="h-5 w-5 text-blue-500" />
      case 'blocked':
        return <Lock className="h-5 w-5 text-gray-400" />
      default:
        return <Circle className="h-5 w-5 text-gray-300" />
    }
  }

  const getOverallProgress = () => {
    const totalPhases = Object.keys(PHASES).length
    const completedCount = completedPhases.length
    const currentProgress = currentPhaseId ? (phaseProgress[currentPhaseId] || 0) / 100 : 0
    return Math.round(((completedCount + currentProgress) / totalPhases) * 100)
  }

  const executeModule = async (moduleId: string) => {
    setExecutingModule(moduleId)
    setExecutionError(null)

    try {
      // In a real implementation, get company ID from auth store
      const companyId = 'company-1' // Mock company ID

      const result = await moduleEngine.executeModule(companyId, moduleId)

      if (result.status === 'completed') {
        // Mark module as completed
        completeModule(moduleId, result)
        console.log('Module completed successfully:', result)
      } else if (result.status === 'handoff_required') {
        // Handle handoff - in real implementation, this would trigger a handoff workflow
        console.log('Module requires handoff:', result.handoff)
        setExecutionError(`Module requires expert assistance: ${result.handoff?.description}`)
      } else {
        setExecutionError('Module execution failed')
      }
    } catch (error) {
      console.error('Module execution error:', error)
      setExecutionError(error instanceof Error ? error.message : 'Unknown error occurred')
    } finally {
      setExecutingModule(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Genesis Engine</h1>
          <p className="text-muted-foreground">
            Your guided journey from idea to successful business
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold">{getOverallProgress()}%</div>
            <div className="text-sm text-muted-foreground">Complete</div>
          </div>
          <div className="w-16 h-16 relative">
            <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="m18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeDasharray={`${getOverallProgress()}, 100`}
                className="text-primary"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>
      </div>

      <Tabs value={selectedPhaseId || ''} onValueChange={setSelectedPhaseId}>
        {/* Phase Navigation */}
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Your Journey</h2>
            <Badge variant="outline" className="text-xs">
              {completedPhases.length} of {Object.keys(PHASES).length} phases completed
            </Badge>
          </div>

          {/* Phase Timeline */}
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute top-8 left-0 right-0 h-0.5 bg-border" />

            <div className="flex justify-between relative">
              {Object.values(PHASES).map((phase, index) => {
                const isAvailable = availablePhases.some(p => p.id === phase.id)
                const isCompleted = completedPhases.includes(phase.id)
                const isCurrent = currentPhaseId === phase.id
                const status = getPhaseStatus(phase.id)
                const progress = phaseProgress[phase.id] || 0

                return (
                  <div key={phase.id} className="flex flex-col items-center">
                    {/* Phase Node */}
                    <button
                      onClick={() => isAvailable && setSelectedPhaseId(phase.id)}
                      disabled={!isAvailable}
                      className={`relative w-16 h-16 rounded-full border-4 flex items-center justify-center transition-all ${
                        isCompleted
                          ? 'bg-green-500 border-green-500 text-white'
                          : isCurrent
                          ? 'bg-blue-500 border-blue-500 text-white animate-pulse'
                          : isAvailable
                          ? 'bg-white border-gray-300 text-gray-600 hover:border-primary'
                          : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {getPhaseIcon(phase.id)}
                      {status === 'completed' && (
                        <CheckCircle className="absolute -top-1 -right-1 h-5 w-5 text-white bg-green-500 rounded-full" />
                      )}
                    </button>

                    {/* Phase Info */}
                    <div className="mt-3 text-center max-w-24">
                      <div className="text-xs font-medium truncate">{phase.name}</div>
                      <div className="text-xs text-muted-foreground">{phase.typicalDuration}</div>
                      {progress > 0 && progress < 100 && (
                        <div className="mt-1">
                          <Progress value={progress} className="h-1 w-full" />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Phase Details */}
        {selectedPhase && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getPhaseColor(selectedPhase.id)}`}>
                    {getPhaseIcon(selectedPhase.id)}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{selectedPhase.name}</CardTitle>
                    <CardDescription>{selectedPhase.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    Phase {selectedPhase.order} of {Object.keys(PHASES).length}
                  </Badge>
                  {getPhaseStatus(selectedPhase.id) === 'not_started' && (
                    <Button onClick={() => startPhase(selectedPhase.id)}>
                      <Play className="h-4 w-4 mr-2" />
                      Start Phase
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="overview">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="modules">Modules</TabsTrigger>
                  <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <h3 className="font-medium">Phase Details</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Duration:</span>
                          <span>{selectedPhase.typicalDuration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Automation:</span>
                          <span>{Math.round(selectedPhase.automationLevel * 100)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Modules:</span>
                          <span>{selectedPhase.modules.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Prerequisites:</span>
                          <span>
                            {selectedPhase.prerequisites.length > 0
                              ? selectedPhase.prerequisites.map(id => getPhaseById(id)?.name).join(', ')
                              : 'None'
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium">Progress</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Phase Progress</span>
                          <span>{phaseProgress[selectedPhase.id] || 0}%</span>
                        </div>
                        <Progress value={phaseProgress[selectedPhase.id] || 0} className="h-2" />
                        <div className="text-xs text-muted-foreground">
                          {completedModules.filter(id =>
                            selectedPhase.modules.includes(id)
                          ).length} of {selectedPhase.modules.length} modules completed
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedPhase.prerequisites.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Prerequisites</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedPhase.prerequisites.map(prereqId => {
                          const prereqPhase = getPhaseById(prereqId)
                          const isCompleted = completedPhases.includes(prereqId)
                          return (
                            <Badge
                              key={prereqId}
                              variant={isCompleted ? 'default' : 'secondary'}
                              className="flex items-center gap-1"
                            >
                              {isCompleted && <CheckCircle className="h-3 w-3" />}
                              {prereqPhase?.name}
                            </Badge>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="modules" className="space-y-4">
                  {executionError && (
                    <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <div>
                          <h4 className="font-medium text-red-800">Execution Error</h4>
                          <p className="text-sm text-red-600">{executionError}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-4">
                    {selectedPhase.modules.map(moduleId => {
                      const module = MODULES[moduleId]
                      if (!module) return null

                      const isCompleted = completedModules.includes(moduleId)
                      const isExecuting = executingModule === moduleId
                      const canExecute = !isCompleted && !isExecuting

                      return (
                        <Card key={moduleId} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {isCompleted ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                              ) : isExecuting ? (
                                <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                              ) : (
                                <Circle className="h-5 w-5 text-gray-400" />
                              )}
                              <div className="flex-1">
                                <h4 className="font-medium">{module.name}</h4>
                                <p className="text-sm text-muted-foreground">{module.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {module.automationLevel * 100}% Automated
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {module.estimatedDuration}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => canExecute && executeModule(moduleId)}
                              disabled={!canExecute}
                            >
                              {isExecuting ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Executing...
                                </>
                              ) : isCompleted ? (
                                'Review'
                              ) : (
                                <>
                                  <Play className="h-4 w-4 mr-2" />
                                  Start
                                </>
                              )}
                            </Button>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="outcomes" className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-3">Expected Outcomes</h3>
                    <div className="grid gap-2">
                      {selectedPhase.outcomes.map((outcome, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm capitalize">
                            {outcome.replace('_', ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </Tabs>
    </div>
  )
}