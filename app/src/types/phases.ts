// ============================================================================
// GENESIS ENGINE - PHASE MANAGEMENT TYPES
// ============================================================================

export interface Phase {
  id: string
  name: string
  order: number
  description: string
  modules: string[]
  automationLevel: number // 0-1
  typicalDuration: string
  prerequisites: string[]
  outcomes: string[]
  status?: PhaseStatus
  progress?: number // 0-100
  startedAt?: string
  completedAt?: string
}

export type PhaseStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked'

export interface Module {
  id: string
  name: string
  description: string
  phaseId: string
  type: ModuleType
  estimatedDuration: string
  prerequisites: string[]
  outcomes: string[]
  automationLevel: number
  status?: ModuleStatus
  progress?: number
  data?: Record<string, any>
  completedAt?: string
}

export type ModuleType = 'form' | 'analysis' | 'generation' | 'validation' | 'integration'
export type ModuleStatus = 'locked' | 'available' | 'in_progress' | 'completed' | 'failed'

export interface PhaseExecutionContext {
  companyId: string
  currentPhaseId: string
  completedModules: string[]
  moduleData: Record<string, any>
  metadata: Record<string, any>
}

export interface ModuleExecutionResult {
  success: boolean
  data?: any
  errors?: string[]
  nextModules?: string[]
}

export interface ModuleStep {
  id: string
  name: string
  type: 'ai_research' | 'ai_generate' | 'document_create' | 'external_api' | 'user_input' | 'approval' | 'handoff' | 'validation'
  description: string
  promptTemplate?: string
  sources?: string[]
  maxTokens?: number
  storeAs?: string
  requiresHandoff?: boolean
  handoffCriteria?: string[]
}

export interface StepResult {
  stepId: string
  success: boolean
  data?: any
  error?: string
  requiresHandoff?: boolean
  handoff?: HandoffRequest
  duration: number
}

export interface HandoffRequest {
  type: 'legal' | 'accounting' | 'technical' | 'design' | 'marketing'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  description: string
  requiredSkills: string[]
  estimatedHours: number
  deadline?: string
}

export interface ModuleResult {
  moduleId: string
  status: 'completed' | 'handoff_required' | 'failed'
  results: StepResult[]
  handoff?: HandoffRequest
  duration: number
  completedAt: string
}

export interface CompanyContext {
  company: {
    id: string
    name: string
    industry: string
    description: string
    stage: string
  }
  user: {
    id: string
    name: string
    email: string
  }
  currentPhase: string
  completedModules: string[]
  knowledgeGraph: any[]
}

// ============================================================================
// PHASE DEFINITIONS
// ============================================================================

export const PHASES: Record<string, Phase> = {
  DISCOVERY: {
    id: 'discovery',
    name: 'Discovery & Validation',
    order: 1,
    description: 'Validate your idea with market research and competitor analysis',
    modules: [
      'idea_capture',
      'market_research',
      'competitor_analysis',
      'customer_discovery',
      'value_proposition',
    ],
    automationLevel: 0.8,
    typicalDuration: '2-4 weeks',
    prerequisites: [],
    outcomes: [
      'validated_problem',
      'target_customer_profile',
      'competitive_landscape',
      'initial_value_prop',
    ],
  },

  ARCHITECTURE: {
    id: 'architecture',
    name: 'Business Architecture',
    order: 2,
    description: 'Design your business model, pricing, and go-to-market strategy',
    modules: [
      'business_model_canvas',
      'pricing_strategy',
      'revenue_model',
      'go_to_market',
      'unit_economics',
    ],
    automationLevel: 0.7,
    typicalDuration: '2-3 weeks',
    prerequisites: ['discovery'],
    outcomes: [
      'business_model',
      'pricing_structure',
      'gtm_plan',
      'unit_economics_model',
    ],
  },

  LEGAL_FOUNDATION: {
    id: 'legal',
    name: 'Legal Foundation',
    order: 3,
    description: 'Incorporate your company and set up legal infrastructure',
    modules: [
      'company_formation',
      'articles_of_association',
      'shareholders_agreement',
      'founder_vesting',
      'ip_assignment',
      'employment_contracts',
    ],
    automationLevel: 0.6,
    typicalDuration: '1-2 weeks',
    prerequisites: ['architecture'],
    outcomes: [
      'incorporated_company',
      'legal_documents',
      'cap_table',
      'ip_protection',
    ],
  },

  FINANCIAL: {
    id: 'financial',
    name: 'Financial Infrastructure',
    order: 4,
    description: 'Set up financial systems and create projections',
    modules: [
      'banking_setup',
      'accounting_setup',
      'financial_model',
      'cash_flow_forecast',
      'kpi_dashboard',
      'tax_registration',
    ],
    automationLevel: 0.65,
    typicalDuration: '1-2 weeks',
    prerequisites: ['legal'],
    outcomes: [
      'bank_account',
      'accounting_system',
      'financial_model',
      'tax_registrations',
    ],
  },

  OPERATIONAL: {
    id: 'operational',
    name: 'Operational Setup',
    order: 5,
    description: 'Build your operational foundation and processes',
    modules: [
      'team_structure',
      'hiring_plan',
      'policies_procedures',
      'compliance_calendar',
      'tool_stack',
      'data_protection',
    ],
    automationLevel: 0.7,
    typicalDuration: '2-3 weeks',
    prerequisites: ['financial'],
    outcomes: [
      'org_structure',
      'policies',
      'compliance_system',
      'operational_tools',
    ],
  },

  MVP: {
    id: 'mvp',
    name: 'MVP Development',
    order: 3,
    description: 'Build and test your minimum viable product',
    modules: [
      'mvp_specification',
      'technical_architecture',
      'prototype_development',
      'user_testing',
      'iteration_planning',
    ],
    automationLevel: 0.4,
    typicalDuration: '4-8 weeks',
    prerequisites: ['architecture'],
    outcomes: [
      'mvp_spec',
      'technical_design',
      'working_prototype',
      'user_feedback',
      'iteration_plan',
    ],
  },

  LAUNCH: {
    id: 'launch',
    name: 'Launch Preparation',
    order: 6,
    description: 'Prepare brand, website, and go to market',
    modules: [
      'brand_identity',
      'website_mvp',
      'marketing_foundation',
      'sales_infrastructure',
      'customer_success',
      'launch_checklist',
    ],
    automationLevel: 0.5,
    typicalDuration: '4-6 weeks',
    prerequisites: ['operational'],
    outcomes: [
      'brand_assets',
      'website',
      'marketing_channels',
      'sales_process',
    ],
  },

  FUNDING: {
    id: 'funding',
    name: 'Funding & Growth',
    order: 7,
    description: 'Prepare for and execute fundraising',
    modules: [
      'funding_strategy',
      'investor_materials',
      'pitch_deck',
      'data_room',
      'investor_outreach',
      'due_diligence',
      'term_negotiation',
    ],
    automationLevel: 0.6,
    typicalDuration: '3-6 months',
    prerequisites: ['launch'],
    outcomes: [
      'pitch_deck',
      'data_room',
      'investor_pipeline',
      'funding_raised',
    ],
  },
}

// ============================================================================
// MODULE DEFINITIONS
// ============================================================================

export const MODULES: Record<string, Module> = {
  // Discovery Phase Modules
  idea_capture: {
    id: 'idea_capture',
    name: 'Idea Capture',
    description: 'Document your business idea, problem statement, and initial hypothesis',
    phaseId: 'discovery',
    type: 'form',
    estimatedDuration: '2-3 hours',
    prerequisites: [],
    outcomes: ['idea_documented', 'problem_defined'],
    automationLevel: 0.9,
  },

  market_research: {
    id: 'market_research',
    name: 'Market Research',
    description: 'Analyze market size, trends, and opportunities',
    phaseId: 'discovery',
    type: 'analysis',
    estimatedDuration: '1-2 weeks',
    prerequisites: ['idea_capture'],
    outcomes: ['market_size', 'market_trends', 'opportunities'],
    automationLevel: 0.7,
  },

  competitor_analysis: {
    id: 'competitor_analysis',
    name: 'Competitor Analysis',
    description: 'Identify and analyze direct and indirect competitors',
    phaseId: 'discovery',
    type: 'analysis',
    estimatedDuration: '3-5 days',
    prerequisites: ['market_research'],
    outcomes: ['competitor_landscape', 'competitive_advantages'],
    automationLevel: 0.8,
  },

  customer_discovery: {
    id: 'customer_discovery',
    name: 'Customer Discovery',
    description: 'Identify and validate target customer segments',
    phaseId: 'discovery',
    type: 'analysis',
    estimatedDuration: '1-2 weeks',
    prerequisites: ['idea_capture'],
    outcomes: ['customer_segments', 'customer_needs', 'customer_journey'],
    automationLevel: 0.6,
  },

  value_proposition: {
    id: 'value_proposition',
    name: 'Value Proposition Design',
    description: 'Craft and validate your unique value proposition',
    phaseId: 'discovery',
    type: 'generation',
    estimatedDuration: '3-5 days',
    prerequisites: ['customer_discovery', 'competitor_analysis'],
    outcomes: ['value_proposition', 'unique_selling_points'],
    automationLevel: 0.7,
  },

  // Launch Phase Modules
  brand_identity: {
    id: 'brand_identity',
    name: 'Brand Identity Development',
    description: 'Create brand guidelines, logo, and visual identity',
    phaseId: 'launch',
    type: 'generation',
    estimatedDuration: '1-2 weeks',
    prerequisites: [],
    outcomes: ['brand_guidelines', 'logo', 'visual_identity', 'brand_assets'],
    automationLevel: 0.5,
  },

  website_mvp: {
    id: 'website_mvp',
    name: 'Website MVP Development',
    description: 'Build minimum viable product website and landing page',
    phaseId: 'launch',
    type: 'integration',
    estimatedDuration: '2-4 weeks',
    prerequisites: ['brand_identity'],
    outcomes: ['website', 'landing_page', 'web_application'],
    automationLevel: 0.3,
  },

  marketing_foundation: {
    id: 'marketing_foundation',
    name: 'Marketing Foundation',
    description: 'Set up marketing channels and content strategy',
    phaseId: 'launch',
    type: 'generation',
    estimatedDuration: '1-2 weeks',
    prerequisites: ['brand_identity'],
    outcomes: ['marketing_strategy', 'content_calendar', 'social_media_setup'],
    automationLevel: 0.6,
  },

  sales_infrastructure: {
    id: 'sales_infrastructure',
    name: 'Sales Infrastructure',
    description: 'Configure CRM, sales pipeline, and lead generation',
    phaseId: 'launch',
    type: 'integration',
    estimatedDuration: '1-2 weeks',
    prerequisites: ['marketing_foundation'],
    outcomes: ['crm_system', 'sales_pipeline', 'lead_generation'],
    automationLevel: 0.7,
  },

  customer_success: {
    id: 'customer_success',
    name: 'Customer Success Setup',
    description: 'Establish customer onboarding and support processes',
    phaseId: 'launch',
    type: 'generation',
    estimatedDuration: '1-2 weeks',
    prerequisites: ['sales_infrastructure'],
    outcomes: ['onboarding_process', 'customer_support', 'success_metrics'],
    automationLevel: 0.6,
  },

  launch_checklist: {
    id: 'launch_checklist',
    name: 'Launch Readiness Checklist',
    description: 'Comprehensive checklist to ensure launch readiness',
    phaseId: 'launch',
    type: 'validation',
    estimatedDuration: '3-5 days',
    prerequisites: ['website_mvp', 'marketing_foundation', 'sales_infrastructure', 'customer_success'],
    outcomes: ['launch_readiness', 'go_live_checklist', 'post_launch_plan'],
    automationLevel: 0.9,
  },

  // Funding Phase Modules
  funding_strategy: {
    id: 'funding_strategy',
    name: 'Funding Strategy Development',
    description: 'Develop comprehensive fundraising strategy and timeline',
    phaseId: 'funding',
    type: 'generation',
    estimatedDuration: '1-2 weeks',
    prerequisites: [],
    outcomes: ['funding_strategy', 'fundraising_timeline', 'target_investors'],
    automationLevel: 0.7,
  },

  investor_materials: {
    id: 'investor_materials',
    name: 'Investor Materials Preparation',
    description: 'Create investor presentation and marketing materials',
    phaseId: 'funding',
    type: 'generation',
    estimatedDuration: '2-3 weeks',
    prerequisites: ['funding_strategy'],
    outcomes: ['investor_presentation', 'one_pager', 'marketing_materials'],
    automationLevel: 0.6,
  },

  pitch_deck: {
    id: 'pitch_deck',
    name: 'Pitch Deck Creation',
    description: 'Build professional investor pitch deck',
    phaseId: 'funding',
    type: 'generation',
    estimatedDuration: '1-2 weeks',
    prerequisites: ['investor_materials'],
    outcomes: ['pitch_deck', 'investor_pitch', 'presentation_materials'],
    automationLevel: 0.5,
  },

  data_room: {
    id: 'data_room',
    name: 'Data Room Setup',
    description: 'Configure secure data room for due diligence',
    phaseId: 'funding',
    type: 'integration',
    estimatedDuration: '1-2 weeks',
    prerequisites: ['pitch_deck'],
    outcomes: ['data_room', 'due_diligence_materials', 'investor_portal'],
    automationLevel: 0.8,
  },

  investor_outreach: {
    id: 'investor_outreach',
    name: 'Investor Outreach Campaign',
    description: 'Execute systematic investor outreach and networking',
    phaseId: 'funding',
    type: 'integration',
    estimatedDuration: '4-8 weeks',
    prerequisites: ['data_room'],
    outcomes: ['investor_meetings', 'term_sheet_requests', 'funding_interest'],
    automationLevel: 0.4,
  },

  due_diligence: {
    id: 'due_diligence',
    name: 'Due Diligence Management',
    description: 'Manage investor due diligence process and responses',
    phaseId: 'funding',
    type: 'integration',
    estimatedDuration: '2-4 weeks',
    prerequisites: ['investor_outreach'],
    outcomes: ['due_diligence_responses', 'legal_reviews', 'investment_commitments'],
    automationLevel: 0.6,
  },

  term_negotiation: {
    id: 'term_negotiation',
    name: 'Term Sheet Negotiation',
    description: 'Negotiate and finalize investment terms',
    phaseId: 'funding',
    type: 'integration',
    estimatedDuration: '2-4 weeks',
    prerequisites: ['due_diligence'],
    outcomes: ['term_sheet', 'investment_agreement', 'funding_closed'],
    automationLevel: 0.4,
  },

  // Architecture Phase Modules
  business_model_canvas: {
    id: 'business_model_canvas',
    name: 'Business Model Canvas',
    description: 'Define your business model using the lean canvas approach',
    phaseId: 'architecture',
    type: 'form',
    estimatedDuration: '1-2 days',
    prerequisites: [],
    outcomes: ['business_model', 'key_partners', 'value_streams'],
    automationLevel: 0.8,
  },

  pricing_strategy: {
    id: 'pricing_strategy',
    name: 'Pricing Strategy',
    description: 'Develop pricing models and revenue optimization strategies',
    phaseId: 'architecture',
    type: 'analysis',
    estimatedDuration: '3-5 days',
    prerequisites: ['business_model_canvas'],
    outcomes: ['pricing_model', 'revenue_projections'],
    automationLevel: 0.6,
  },

  revenue_model: {
    id: 'revenue_model',
    name: 'Revenue Model',
    description: 'Design sustainable revenue streams and monetization strategies',
    phaseId: 'architecture',
    type: 'analysis',
    estimatedDuration: '2-3 days',
    prerequisites: ['pricing_strategy'],
    outcomes: ['revenue_streams', 'monetization_strategy'],
    automationLevel: 0.7,
  },

  go_to_market: {
    id: 'go_to_market',
    name: 'Go-to-Market Strategy',
    description: 'Develop comprehensive market entry and customer acquisition strategy',
    phaseId: 'architecture',
    type: 'generation',
    estimatedDuration: '1-2 weeks',
    prerequisites: ['revenue_model'],
    outcomes: ['market_entry_plan', 'acquisition_channels', 'marketing_strategy'],
    automationLevel: 0.5,
  },

  unit_economics: {
    id: 'unit_economics',
    name: 'Unit Economics',
    description: 'Calculate and optimize customer acquisition cost and lifetime value',
    phaseId: 'architecture',
    type: 'analysis',
    estimatedDuration: '3-5 days',
    prerequisites: ['pricing_strategy'],
    outcomes: ['customer_acquisition_cost', 'customer_lifetime_value', 'unit_profitability'],
    automationLevel: 0.8,
  },

  // Legal Foundation Phase Modules
  company_formation: {
    id: 'company_formation',
    name: 'Company Formation',
    description: 'Incorporate your company through Companies House',
    phaseId: 'legal',
    type: 'integration',
    estimatedDuration: '3-5 days',
    prerequisites: [],
    outcomes: ['incorporated_company', 'company_number', 'certificate'],
    automationLevel: 0.9,
  },

  articles_of_association: {
    id: 'articles_of_association',
    name: 'Articles of Association',
    description: 'Generate company constitution and governing documents',
    phaseId: 'legal',
    type: 'generation',
    estimatedDuration: '1-2 days',
    prerequisites: ['company_formation'],
    outcomes: ['articles_of_association', 'memorandum'],
    automationLevel: 0.8,
  },

  shareholders_agreement: {
    id: 'shareholders_agreement',
    name: 'Shareholders Agreement',
    description: 'Create legal agreement between company shareholders',
    phaseId: 'legal',
    type: 'generation',
    estimatedDuration: '3-5 days',
    prerequisites: ['articles_of_association'],
    outcomes: ['shareholders_agreement', 'share_structure'],
    automationLevel: 0.6,
  },

  founder_vesting: {
    id: 'founder_vesting',
    name: 'Founder Vesting Agreement',
    description: 'Implement equity vesting schedules for founders',
    phaseId: 'legal',
    type: 'generation',
    estimatedDuration: '2-3 days',
    prerequisites: ['shareholders_agreement'],
    outcomes: ['vesting_schedule', 'founder_equity'],
    automationLevel: 0.7,
  },

  ip_assignment: {
    id: 'ip_assignment',
    name: 'IP Assignment Agreement',
    description: 'Transfer intellectual property rights to the company',
    phaseId: 'legal',
    type: 'generation',
    estimatedDuration: '1-2 days',
    prerequisites: ['company_formation'],
    outcomes: ['ip_assignment', 'ip_protection'],
    automationLevel: 0.8,
  },

  employment_contracts: {
    id: 'employment_contracts',
    name: 'Employment Contracts',
    description: 'Generate employment agreements and contracts',
    phaseId: 'legal',
    type: 'generation',
    estimatedDuration: '2-3 days',
    prerequisites: ['company_formation'],
    outcomes: ['employment_contracts', 'director_service_agreements'],
    automationLevel: 0.7,
  },

  // Financial Phase Modules
  banking_setup: {
    id: 'banking_setup',
    name: 'Business Banking Setup',
    description: 'Open business bank account and set up financial infrastructure',
    phaseId: 'financial',
    type: 'integration',
    estimatedDuration: '3-5 days',
    prerequisites: [],
    outcomes: ['business_bank_account', 'banking_relationship'],
    automationLevel: 0.5,
  },

  accounting_setup: {
    id: 'accounting_setup',
    name: 'Accounting System Setup',
    description: 'Configure accounting software and financial processes',
    phaseId: 'financial',
    type: 'integration',
    estimatedDuration: '2-3 days',
    prerequisites: ['banking_setup'],
    outcomes: ['accounting_software', 'chart_of_accounts', 'accounting_processes'],
    automationLevel: 0.7,
  },

  financial_model: {
    id: 'financial_model',
    name: 'Financial Model Creation',
    description: 'Build comprehensive financial projections and models',
    phaseId: 'financial',
    type: 'generation',
    estimatedDuration: '1-2 weeks',
    prerequisites: ['accounting_setup'],
    outcomes: ['financial_model', 'profit_loss_forecast', 'balance_sheet_forecast'],
    automationLevel: 0.6,
  },

  cash_flow_forecast: {
    id: 'cash_flow_forecast',
    name: 'Cash Flow Forecasting',
    description: 'Create detailed cash flow projections and burn rate analysis',
    phaseId: 'financial',
    type: 'analysis',
    estimatedDuration: '3-5 days',
    prerequisites: ['financial_model'],
    outcomes: ['cash_flow_forecast', 'burn_rate_analysis', 'runway_projection'],
    automationLevel: 0.8,
  },

  kpi_dashboard: {
    id: 'kpi_dashboard',
    name: 'KPI Dashboard Setup',
    description: 'Configure financial KPIs and dashboard reporting',
    phaseId: 'financial',
    type: 'integration',
    estimatedDuration: '2-3 days',
    prerequisites: ['financial_model'],
    outcomes: ['kpi_dashboard', 'financial_reporting', 'performance_metrics'],
    automationLevel: 0.7,
  },

  tax_registration: {
    id: 'tax_registration',
    name: 'Tax Registration',
    description: 'Register for necessary tax schemes and obligations',
    phaseId: 'financial',
    type: 'integration',
    estimatedDuration: '1-2 weeks',
    prerequisites: ['company_formation'],
    outcomes: ['vat_registration', 'paye_registration', 'corporation_tax_registration'],
    automationLevel: 0.8,
  },

  // Operational Phase Modules
  team_structure: {
    id: 'team_structure',
    name: 'Team Structure Design',
    description: 'Design organizational structure and reporting lines',
    phaseId: 'operational',
    type: 'generation',
    estimatedDuration: '3-5 days',
    prerequisites: [],
    outcomes: ['org_chart', 'job_descriptions', 'reporting_structure'],
    automationLevel: 0.7,
  },

  hiring_plan: {
    id: 'hiring_plan',
    name: 'Hiring Plan Development',
    description: 'Create recruitment strategy and hiring timeline',
    phaseId: 'operational',
    type: 'generation',
    estimatedDuration: '1-2 weeks',
    prerequisites: ['team_structure'],
    outcomes: ['hiring_plan', 'recruitment_strategy', 'compensation_structure'],
    automationLevel: 0.6,
  },

  policies_procedures: {
    id: 'policies_procedures',
    name: 'Policies & Procedures',
    description: 'Develop company policies and operational procedures',
    phaseId: 'operational',
    type: 'generation',
    estimatedDuration: '1-2 weeks',
    prerequisites: ['team_structure'],
    outcomes: ['employee_handbook', 'operational_procedures', 'code_of_conduct'],
    automationLevel: 0.8,
  },

  compliance_calendar: {
    id: 'compliance_calendar',
    name: 'Compliance Calendar',
    description: 'Set up compliance tracking and deadline management',
    phaseId: 'operational',
    type: 'integration',
    estimatedDuration: '3-5 days',
    prerequisites: ['policies_procedures'],
    outcomes: ['compliance_calendar', 'regulatory_deadlines', 'compliance_tracking'],
    automationLevel: 0.9,
  },

  tool_stack: {
    id: 'tool_stack',
    name: 'Tool Stack Setup',
    description: 'Configure productivity and operational tools',
    phaseId: 'operational',
    type: 'integration',
    estimatedDuration: '1-2 weeks',
    prerequisites: ['team_structure'],
    outcomes: ['productivity_tools', 'communication_tools', 'operational_software'],
    automationLevel: 0.5,
  },

  data_protection: {
    id: 'data_protection',
    name: 'Data Protection Setup',
    description: 'Implement GDPR compliance and data protection measures',
    phaseId: 'operational',
    type: 'integration',
    estimatedDuration: '1-2 weeks',
    prerequisites: ['policies_procedures'],
    outcomes: ['gdpr_compliance', 'privacy_policy', 'data_processing_register'],
    automationLevel: 0.7,
  },
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function getPhaseById(phaseId: string): Phase | undefined {
  return PHASES[phaseId.toUpperCase() as keyof typeof PHASES]
}

export function getModuleById(moduleId: string): Module | undefined {
  return MODULES[moduleId]
}

export function getModulesForPhase(phaseId: string): Module[] {
  return Object.values(MODULES).filter(module => module.phaseId === phaseId)
}

export function getNextPhase(currentPhaseId: string): Phase | null {
  const currentPhase = getPhaseById(currentPhaseId)
  if (!currentPhase) return null

  const nextPhaseOrder = currentPhase.order + 1
  return Object.values(PHASES).find(phase => phase.order === nextPhaseOrder) || null
}

export function getPhaseProgress(phase: Phase, completedModules: string[]): number {
  if (phase.modules.length === 0) return 0
  const completed = phase.modules.filter(id => completedModules.includes(id)).length
  return Math.round((completed / phase.modules.length) * 100)
}

export function canAccessPhase(phaseId: string, completedPhases: string[]): boolean {
  const phase = getPhaseById(phaseId)
  if (!phase) return false

  // First phase is always accessible
  if (phase.prerequisites.length === 0) return true

  // Check if all prerequisites are completed
  return phase.prerequisites.every(prereq => completedPhases.includes(prereq))
}

export function canAccessModule(moduleId: string, completedModules: string[]): boolean {
  const module = getModuleById(moduleId)
  if (!module) return false

  // Check if all prerequisites are completed
  return module.prerequisites.every(prereq => completedModules.includes(prereq))
}