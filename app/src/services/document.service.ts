// ============================================================================
// GENESIS ENGINE - DOCUMENT SERVICE
// ============================================================================

import { config } from '@/config'
import { aiService } from './ai.service'

export interface DocumentTemplate {
  id: string
  name: string
  type: 'legal' | 'business' | 'financial' | 'marketing'
  category: string
  description: string
  requiredFields: string[]
  templateContent: string
  aiPrompt: string
}

export interface DocumentGenerationRequest {
  templateId: string
  companyId: string
  data: Record<string, any>
  format?: 'pdf' | 'docx' | 'html'
  customization?: Record<string, any>
}

export interface GeneratedDocument {
  id: string
  templateId: string
  companyId: string
  title: string
  content: string
  format: string
  url?: string
  metadata: Record<string, any>
  createdAt: string
}

export class DocumentService {
  private templates: Map<string, DocumentTemplate> = new Map()

  constructor() {
    this.initializeTemplates()
  }

  async generateDocument(request: DocumentGenerationRequest): Promise<GeneratedDocument> {
    const template = this.templates.get(request.templateId)
    if (!template) {
      throw new Error(`Template not found: ${request.templateId}`)
    }

    // Validate required fields
    const missingFields = template.requiredFields.filter(field => !request.data[field])
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
    }

    // Generate content using AI
    const content = await this.generateContent(template, request.data, request.customization)

    // Format document
    const formattedContent = await this.formatDocument(content, request.format || 'html')

    const document: GeneratedDocument = {
      id: `doc-${Date.now()}`,
      templateId: request.templateId,
      companyId: request.companyId,
      title: this.generateTitle(template, request.data),
      content: formattedContent,
      format: request.format || 'html',
      metadata: {
        template: template.name,
        generatedAt: new Date().toISOString(),
        data: request.data,
      },
      createdAt: new Date().toISOString(),
    }

    // In a real implementation, save to storage and generate URL
    // For now, just return the document
    return document
  }

  async getTemplates(type?: string, category?: string): Promise<DocumentTemplate[]> {
    let templates = Array.from(this.templates.values())

    if (type) {
      templates = templates.filter(t => t.type === type)
    }

    if (category) {
      templates = templates.filter(t => t.category === category)
    }

    return templates
  }

  async getTemplate(id: string): Promise<DocumentTemplate | null> {
    return this.templates.get(id) || null
  }

  private async generateContent(
    template: DocumentTemplate,
    data: Record<string, any>,
    customization?: Record<string, any>
  ): Promise<string> {
    // Build prompt with data
    let prompt = template.aiPrompt

    // Replace placeholders with actual data
    Object.entries(data).forEach(([key, value]) => {
      prompt = prompt.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
    })

    // Add customization if provided
    if (customization) {
      prompt += '\n\nAdditional requirements:\n' +
        Object.entries(customization).map(([key, value]) =>
          `${key}: ${value}`
        ).join('\n')
    }

    // Generate content using AI
    const result = await aiService.generate({
      prompt,
      model: 'gpt-4', // Use best model for document generation
      maxTokens: 4000,
    })

    return result.content
  }

  private async formatDocument(content: string, format: string): Promise<string> {
    // In a real implementation, this would convert to different formats
    // For now, just return HTML-formatted content
    if (format === 'html') {
      return `<div class="document-content">\n${content}\n</div>`
    }

    return content
  }

  private generateTitle(template: DocumentTemplate, data: Record<string, any>): string {
    const companyName = data.companyName || 'Company'
    const date = new Date().toLocaleDateString()

    return `${template.name} - ${companyName} - ${date}`
  }

  private initializeTemplates(): void {
    // Legal Templates
    this.templates.set('articles-of-association', {
      id: 'articles-of-association',
      name: 'Articles of Association',
      type: 'legal',
      category: 'incorporation',
      description: 'Standard articles of association for UK companies',
      requiredFields: ['companyName', 'registeredOffice', 'shareStructure'],
      templateContent: '',
      aiPrompt: `Generate professional Articles of Association for a UK company with the following details:

Company Name: {{companyName}}
Registered Office: {{registeredOffice}}
Share Structure: {{shareStructure}}

Include standard clauses for:
- Company purpose and powers
- Share capital and rights
- Directors' powers and responsibilities
- Shareholder meetings and voting
- Dividends and distributions
- Winding up procedures

Format as a formal legal document with proper numbering and structure.`,
    })

    this.templates.set('shareholders-agreement', {
      id: 'shareholders-agreement',
      name: 'Shareholders Agreement',
      type: 'legal',
      category: 'equity',
      description: 'Comprehensive shareholders agreement template',
      requiredFields: ['companyName', 'shareholders', 'shareClasses', 'vestingSchedule'],
      templateContent: '',
      aiPrompt: `Create a comprehensive Shareholders Agreement for:

Company: {{companyName}}
Shareholders: {{shareholders}}
Share Classes: {{shareClasses}}
Vesting Schedule: {{vestingSchedule}}

Include sections for:
- Shareholder rights and obligations
- Board composition and decisions
- Dividend policy
- Transfer restrictions
- Drag-along and tag-along rights
- Dispute resolution
- Exit provisions

Ensure the agreement is legally sound and protects all parties' interests.`,
    })

    this.templates.set('employment-contract', {
      id: 'employment-contract',
      name: 'Employment Contract',
      type: 'legal',
      category: 'hr',
      description: 'Standard employment contract template',
      requiredFields: ['employeeName', 'position', 'salary', 'startDate'],
      templateContent: '',
      aiPrompt: `Generate a professional Employment Contract for:

Employee: {{employeeName}}
Position: {{position}}
Salary: {{salary}}
Start Date: {{startDate}}

Include standard clauses for:
- Job description and responsibilities
- Compensation and benefits
- Working hours and location
- Holiday and leave entitlement
- Confidentiality and IP assignment
- Notice periods and termination
- Governing law

Format as a formal legal document.`,
    })

    // Business Templates
    this.templates.set('business-plan', {
      id: 'business-plan',
      name: 'Business Plan',
      type: 'business',
      category: 'planning',
      description: 'Comprehensive business plan template',
      requiredFields: ['companyName', 'industry', 'targetMarket', 'financialProjections'],
      templateContent: '',
      aiPrompt: `Create a comprehensive Business Plan for:

Company: {{companyName}}
Industry: {{industry}}
Target Market: {{targetMarket}}
Financial Projections: {{financialProjections}}

Structure the plan with:
- Executive Summary
- Company Description
- Market Analysis
- Organization and Management
- Products and Services
- Marketing and Sales Strategy
- Funding Request
- Financial Projections
- Appendix

Make it professional and investor-ready.`,
    })

    this.templates.set('pitch-deck', {
      id: 'pitch-deck',
      name: 'Investor Pitch Deck',
      type: 'business',
      category: 'funding',
      description: 'Professional investor pitch deck template',
      requiredFields: ['companyName', 'problem', 'solution', 'marketSize', 'team'],
      templateContent: '',
      aiPrompt: `Create an investor pitch deck outline and content for:

Company: {{companyName}}
Problem: {{problem}}
Solution: {{solution}}
Market Size: {{marketSize}}
Team: {{team}}

Structure the deck with these slides:
1. Title Slide
2. Problem
3. Solution
4. Market Opportunity
5. Product
6. Traction
7. Business Model
8. Competition
9. Team
10. Financials
11. Ask
12. Contact

Provide detailed content for each slide that tells a compelling story.`,
    })

    // Financial Templates
    this.templates.set('financial-model', {
      id: 'financial-model',
      name: 'Financial Model',
      type: 'financial',
      category: 'forecasting',
      description: 'Comprehensive financial model template',
      requiredFields: ['revenueModel', 'costStructure', 'growthAssumptions'],
      templateContent: '',
      aiPrompt: `Create a detailed Financial Model specification for:

Revenue Model: {{revenueModel}}
Cost Structure: {{costStructure}}
Growth Assumptions: {{growthAssumptions}}

Include:
- Income Statement (3-5 years)
- Cash Flow Statement
- Balance Sheet
- Key Assumptions and Drivers
- Break-even Analysis
- Unit Economics
- Scenario Planning

Provide a complete Excel/Google Sheets model structure with formulas and calculations.`,
    })

    // Marketing Templates
    this.templates.set('brand-guidelines', {
      id: 'brand-guidelines',
      name: 'Brand Guidelines',
      type: 'marketing',
      category: 'branding',
      description: 'Comprehensive brand identity guidelines',
      requiredFields: ['companyName', 'brandColors', 'brandFonts', 'brandVoice'],
      templateContent: '',
      aiPrompt: `Create comprehensive Brand Guidelines for:

Company: {{companyName}}
Brand Colors: {{brandColors}}
Brand Fonts: {{brandFonts}}
Brand Voice: {{brandVoice}}

Include sections for:
- Brand Overview and Mission
- Logo Usage Guidelines
- Color Palette
- Typography
- Imagery Style
- Brand Voice and Tone
- Do's and Don'ts
- Brand Applications

Make it professional and easy to follow.`,
    })

    this.templates.set('go-to-market-plan', {
      id: 'go-to-market-plan',
      name: 'Go-to-Market Plan',
      type: 'business',
      category: 'strategy',
      description: 'Detailed market entry and customer acquisition plan',
      requiredFields: ['targetMarket', 'customerPersonas', 'marketingChannels', 'salesStrategy'],
      templateContent: '',
      aiPrompt: `Develop a comprehensive Go-to-Market Plan for:

Target Market: {{targetMarket}}
Customer Personas: {{customerPersonas}}
Marketing Channels: {{marketingChannels}}
Sales Strategy: {{salesStrategy}}

Include:
- Market Analysis and Segmentation
- Competitive Analysis
- Positioning and Messaging
- Marketing Strategy and Tactics
- Sales Plan and Process
- Customer Acquisition Channels
- Budget and Timeline
- Success Metrics and KPIs

Make it actionable and measurable.`,
    })
  }
}

// Export singleton instance
export const documentService = new DocumentService()