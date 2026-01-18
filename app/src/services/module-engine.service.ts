// ============================================================================
// GENESIS ENGINE - MODULE EXECUTION ENGINE
// ============================================================================

import {
  ModuleExecutionResult,
  ModuleStep,
  StepResult,
  ModuleResult,
  CompanyContext,
  HandoffRequest,
  MODULES,
  PHASES,
} from '@/types/phases'
import { aiService, ResearchParams } from './ai.service'
import { knowledgeGraphService } from './knowledge-graph.service'
import { documentService } from './document.service'
import { config } from '@/config'

export class ModuleEngine {
  constructor(
    private readonly kg: typeof knowledgeGraphService,
    private readonly ai: typeof aiService,
    private readonly documents: typeof documentService
  ) {}

  async executeModule(
    companyId: string,
    moduleId: string,
    params: Record<string, any> = {}
  ): Promise<ModuleResult> {
    const module = MODULES[moduleId]
    if (!module) {
      throw new Error(`Module not found: ${moduleId}`)
    }

    const startTime = Date.now()
    const results: StepResult[] = []

    try {
      // Check prerequisites
      await this.checkPrerequisites(companyId, module.prerequisites)

      // Get company context
      const context = await this.getCompanyContext(companyId)

      // Get module steps (in real implementation, this would be stored in database)
      const steps = this.getModuleSteps(moduleId)

      // Execute module steps
      for (const step of steps) {
        const stepResult = await this.executeStep(step, context, params, results)
        results.push(stepResult)

        // Check if handoff is needed
        if (stepResult.requiresHandoff) {
          return {
            moduleId,
            status: 'handoff_required',
            results,
            handoff: stepResult.handoff,
            duration: Date.now() - startTime,
            completedAt: new Date().toISOString(),
          }
        }
      }

      // Update knowledge graph with results
      await this.updateKnowledgeGraph(companyId, moduleId, results)

      return {
        moduleId,
        status: 'completed',
        results,
        duration: Date.now() - startTime,
        completedAt: new Date().toISOString(),
      }
    } catch (error) {
      console.error(`Module execution failed: ${moduleId}`, error)
      return {
        moduleId,
        status: 'failed',
        results: [...results, {
          stepId: 'error',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          duration: Date.now() - startTime,
        }],
        duration: Date.now() - startTime,
        completedAt: new Date().toISOString(),
      }
    }
  }

  private async checkPrerequisites(companyId: string, prerequisites: string[]): Promise<void> {
    // In a real implementation, check completed modules from database
    // For now, assume prerequisites are met
    if (prerequisites.length > 0) {
      console.log(`Checking prerequisites for ${companyId}:`, prerequisites)
    }
  }

  private async getCompanyContext(companyId: string): Promise<CompanyContext> {
    // Get company data from knowledge graph
    const context = await this.kg.getCompanyContext(companyId)

    return {
      company: {
        id: companyId,
        name: context?.company?.name || 'Unknown Company',
        industry: context?.company?.industry || 'Unknown',
        description: context?.company?.description || '',
        stage: 'startup', // Would be determined from phase progress
      },
      user: {
        id: 'user-1', // Would come from auth context
        name: 'John Doe', // Would come from auth context
        email: 'john@example.com', // Would come from auth context
      },
      currentPhase: 'discovery', // Would be determined from phase store
      completedModules: [], // Would come from phase store
      knowledgeGraph: context?.relatedEntities || [],
    }
  }

  private getModuleSteps(moduleId: string): ModuleStep[] {
    // In a real implementation, these would be stored in database
    // For now, return predefined steps based on module type

    const module = MODULES[moduleId]
    if (!module) return []

    switch (module.type) {
      case 'form':
        return [{
          id: `${moduleId}-form`,
          name: 'Collect Information',
          type: 'user_input',
          description: `Collect required information for ${module.name}`,
        }]

      case 'analysis':
        return [
          {
            id: `${moduleId}-research`,
            name: 'Research & Analysis',
            type: 'ai_research',
            description: `Research and analyze data for ${module.name}`,
            sources: ['knowledge_graph', 'web'],
            maxTokens: 2000,
          },
          {
            id: `${moduleId}-generate`,
            name: 'Generate Insights',
            type: 'ai_generate',
            description: `Generate insights and recommendations for ${module.name}`,
            maxTokens: 1500,
          }
        ]

      case 'generation':
        return [
          {
            id: `${moduleId}-research`,
            name: 'Gather Context',
            type: 'ai_research',
            description: `Gather context and information for ${module.name}`,
            sources: ['knowledge_graph'],
            maxTokens: 1000,
          },
          {
            id: `${moduleId}-generate`,
            name: 'Generate Content',
            type: 'ai_generate',
            description: `Generate the ${module.name} content`,
            maxTokens: 3000,
          },
          {
            id: `${moduleId}-validate`,
            name: 'Validate Output',
            type: 'validation',
            description: `Validate the generated ${module.name}`,
          }
        ]

      case 'validation':
        return [{
          id: `${moduleId}-validate`,
          name: 'Validation Check',
          type: 'validation',
          description: `Validate ${module.name} requirements`,
        }]

      case 'integration':
        return [
          {
            id: `${moduleId}-setup`,
            name: 'Setup Integration',
            type: 'external_api',
            description: `Set up integration for ${module.name}`,
          },
          {
            id: `${moduleId}-test`,
            name: 'Test Integration',
            type: 'validation',
            description: `Test the ${module.name} integration`,
          }
        ]

      default:
        return [{
          id: `${moduleId}-default`,
          name: 'Execute Module',
          type: 'ai_generate',
          description: `Execute ${module.name}`,
        }]
    }
  }

  private async executeStep(
    step: ModuleStep,
    context: CompanyContext,
    params: Record<string, any>,
    previousResults: StepResult[]
  ): Promise<StepResult> {
    const startTime = Date.now()

    try {
      switch (step.type) {
        case 'ai_research':
          return await this.executeAIResearch(step, context, params, startTime)

        case 'ai_generate':
          return await this.executeAIGenerate(step, context, params, previousResults, startTime)

        case 'document_create':
          return await this.executeDocumentCreate(step, context, params, startTime)

        case 'external_api':
          return await this.executeExternalAPI(step, context, params, startTime)

        case 'user_input':
          return await this.requestUserInput(step, context, params, startTime)

        case 'approval':
          return await this.requestApproval(step, context, params, startTime)

        case 'validation':
          return await this.executeValidation(step, context, params, previousResults, startTime)

        case 'handoff':
          return await this.createHandoff(step, context, params, startTime)

        default:
          throw new Error(`Unknown step type: ${step.type}`)
      }
    } catch (error) {
      return {
        stepId: step.id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
      }
    }
  }

  private async executeAIResearch(
    step: ModuleStep,
    context: CompanyContext,
    params: Record<string, any>,
    startTime: number
  ): Promise<StepResult> {
    const prompt = this.buildPrompt(step.promptTemplate || `Research ${step.name} for ${context.company.name}`, context, params)

    const researchParams: ResearchParams = {
      prompt,
      sources: step.sources || ['knowledge_graph', 'web'],
      maxTokens: step.maxTokens || 2000,
      companyId: context.company.id,
    }

    const result = await this.ai.research(researchParams)

    // Store research results in knowledge graph
    if (step.storeAs) {
      await this.kg.createEntity({
        type: 'company',
        name: `${step.name} Research`,
        description: `Research results for ${step.name}`,
        properties: {
          companyId: context.company.id,
          stepId: step.id,
          content: result.content,
          sources: result.sources,
        },
        relationships: [],
      })
    }

    return {
      stepId: step.id,
      success: true,
      data: {
        content: result.content,
        sources: result.sources,
        tokensUsed: result.tokensUsed,
      },
      duration: Date.now() - startTime,
    }
  }

  private async executeAIGenerate(
    step: ModuleStep,
    context: CompanyContext,
    params: Record<string, any>,
    previousResults: StepResult[],
    startTime: number
  ): Promise<StepResult> {
    const prompt = this.buildPrompt(step.promptTemplate || `Generate ${step.name} for ${context.company.name}`, context, params, previousResults)

    const result = await this.ai.generate({
      prompt,
      model: 'gpt-4',
      maxTokens: step.maxTokens || 2000,
      companyId: context.company.id,
    })

    return {
      stepId: step.id,
      success: true,
      data: {
        content: result.content,
        tokensUsed: result.tokensUsed,
        model: result.model,
      },
      duration: Date.now() - startTime,
    }
  }

  private async executeDocumentCreate(
    step: ModuleStep,
    context: CompanyContext,
    params: Record<string, any>,
    startTime: number
  ): Promise<StepResult> {
    // This would integrate with document service to generate specific documents
    // For now, return success
    return {
      stepId: step.id,
      success: true,
      data: { message: 'Document creation completed' },
      duration: Date.now() - startTime,
    }
  }

  private async executeExternalAPI(
    step: ModuleStep,
    context: CompanyContext,
    params: Record<string, any>,
    startTime: number
  ): Promise<StepResult> {
    // This would handle external API integrations (Companies House, Stripe, etc.)
    // For now, return success
    return {
      stepId: step.id,
      success: true,
      data: { message: 'External API integration completed' },
      duration: Date.now() - startTime,
    }
  }

  private async requestUserInput(
    step: ModuleStep,
    context: CompanyContext,
    params: Record<string, any>,
    startTime: number
  ): Promise<StepResult> {
    // In a real implementation, this would trigger a UI flow to collect user input
    // For now, return success assuming input was collected
    return {
      stepId: step.id,
      success: true,
      data: { message: 'User input collected' },
      duration: Date.now() - startTime,
    }
  }

  private async requestApproval(
    step: ModuleStep,
    context: CompanyContext,
    params: Record<string, any>,
    startTime: number
  ): Promise<StepResult> {
    // This would trigger an approval workflow
    // For now, return success
    return {
      stepId: step.id,
      success: true,
      data: { message: 'Approval granted' },
      duration: Date.now() - startTime,
    }
  }

  private async executeValidation(
    step: ModuleStep,
    context: CompanyContext,
    params: Record<string, any>,
    previousResults: StepResult[],
    startTime: number
  ): Promise<StepResult> {
    // Validate the results of previous steps
    const hasErrors = previousResults.some(r => !r.success)

    if (hasErrors) {
      return {
        stepId: step.id,
        success: false,
        error: 'Validation failed due to previous step errors',
        duration: Date.now() - startTime,
      }
    }

    return {
      stepId: step.id,
      success: true,
      data: { message: 'Validation passed' },
      duration: Date.now() - startTime,
    }
  }

  private async createHandoff(
    step: ModuleStep,
    context: CompanyContext,
    params: Record<string, any>,
    startTime: number
  ): Promise<StepResult> {
    // Determine if handoff is needed based on step criteria
    const requiresHandoff = step.requiresHandoff || this.shouldCreateHandoff(step, context, params)

    if (requiresHandoff) {
      const handoff: HandoffRequest = {
        type: this.determineHandoffType(step),
        priority: 'medium',
        description: `Handoff required for ${step.name} in ${context.company.name}`,
        requiredSkills: this.determineRequiredSkills(step),
        estimatedHours: 4,
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week
      }

      return {
        stepId: step.id,
        success: true,
        data: { message: 'Handoff created' },
        requiresHandoff: true,
        handoff,
        duration: Date.now() - startTime,
      }
    }

    return {
      stepId: step.id,
      success: true,
      data: { message: 'No handoff required' },
      duration: Date.now() - startTime,
    }
  }

  private buildPrompt(
    template: string,
    context: CompanyContext,
    params: Record<string, any>,
    previousResults?: StepResult[]
  ): string {
    let prompt = template

    // Replace context placeholders
    prompt = prompt.replace(/{{company\.name}}/g, context.company.name)
    prompt = prompt.replace(/{{company\.industry}}/g, context.company.industry)
    prompt = prompt.replace(/{{company\.description}}/g, context.company.description)
    prompt = prompt.replace(/{{user\.name}}/g, context.user.name)

    // Replace parameter placeholders
    Object.entries(params).forEach(([key, value]) => {
      prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
    })

    // Include previous results if available
    if (previousResults && previousResults.length > 0) {
      const resultsContext = previousResults
        .filter(r => r.success && r.data)
        .map(r => `${r.stepId}: ${JSON.stringify(r.data)}`)
        .join('\n')

      if (resultsContext) {
        prompt += `\n\nPrevious step results:\n${resultsContext}`
      }
    }

    return prompt
  }

  private async updateKnowledgeGraph(
    companyId: string,
    moduleId: string,
    results: StepResult[]
  ): Promise<void> {
    // Store module execution results in knowledge graph
    const entity = await this.kg.createEntity({
      type: 'company',
      name: `Module: ${moduleId}`,
      description: `Execution results for module ${moduleId}`,
      properties: {
        companyId,
        moduleId,
        results: results.map(r => ({
          stepId: r.stepId,
          success: r.success,
          data: r.data,
          duration: r.duration,
        })),
        completedAt: new Date().toISOString(),
      },
      relationships: [],
    })

    console.log(`Stored module results in knowledge graph: ${entity.id}`)
  }

  private shouldCreateHandoff(step: ModuleStep, context: CompanyContext, params: Record<string, any>): boolean {
    // Logic to determine if handoff is needed
    // This could be based on step configuration, context, or AI analysis
    return false // For now, don't create handoffs automatically
  }

  private determineHandoffType(step: ModuleStep): HandoffRequest['type'] {
    // Determine handoff type based on step
    if (step.id.includes('legal')) return 'legal'
    if (step.id.includes('financial') || step.id.includes('accounting')) return 'accounting'
    if (step.id.includes('technical')) return 'technical'
    if (step.id.includes('design')) return 'design'
    return 'legal' // Default
  }

  private determineRequiredSkills(step: ModuleStep): string[] {
    // Determine required skills for handoff
    if (step.id.includes('legal')) return ['corporate law', 'company formation']
    if (step.id.includes('financial')) return ['accounting', 'financial modeling']
    if (step.id.includes('technical')) return ['software development', 'system integration']
    return ['business expertise']
  }
}

// Export singleton instance
export const moduleEngine = new ModuleEngine(
  knowledgeGraphService,
  aiService,
  documentService
)