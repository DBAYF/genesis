import natural from 'natural'
import compromise from 'compromise'
import { IntentAnalysis } from '../types/pulse'

// ============================================================================
// INTENT ANALYZER SERVICE
// ============================================================================

export class IntentAnalyzer {
  private tokenizer = new natural.WordTokenizer()
  private stemmer = natural.PorterStemmer
  private classifier = new natural.BayesClassifier()

  constructor() {
    this.trainClassifier()
  }

  private trainClassifier(): void {
    // Train the classifier with common startup/messaging intents
    // In a production system, this would be trained on a large dataset

    // Scheduling intents
    this.classifier.addDocument('schedule meeting', 'schedule_meeting')
    this.classifier.addDocument('book appointment', 'schedule_meeting')
    this.classifier.addDocument('set up call', 'schedule_meeting')
    this.classifier.addDocument('arrange meeting', 'schedule_meeting')
    this.classifier.addDocument('meet tomorrow', 'schedule_meeting')
    this.classifier.addDocument('call next week', 'schedule_meeting')

    // Profile update intents
    this.classifier.addDocument('update my profile', 'update_profile')
    this.classifier.addDocument('change my information', 'update_profile')
    this.classifier.addDocument('edit my details', 'update_profile')
    this.classifier.addDocument('update email', 'update_profile')
    this.classifier.addDocument('change phone number', 'update_profile')

    // Help intents
    this.classifier.addDocument('help me', 'get_help')
    this.classifier.addDocument('i need assistance', 'get_help')
    this.classifier.addDocument('can you help', 'get_help')
    this.classifier.addDocument('what can you do', 'get_help')
    this.classifier.addDocument('how does this work', 'get_help')

    // Financial intents
    this.classifier.addDocument('financial status', 'financial_info')
    this.classifier.addDocument('burn rate', 'financial_info')
    this.classifier.addDocument('runway', 'financial_info')
    this.classifier.addDocument('funding', 'financial_info')
    this.classifier.addDocument('revenue', 'financial_info')

    // Document intents
    this.classifier.addDocument('create document', 'document_request')
    this.classifier.addDocument('generate report', 'document_request')
    this.classifier.addDocument('pitch deck', 'document_request')
    this.classifier.addDocument('business plan', 'document_request')

    // Task intents
    this.classifier.addDocument('add task', 'task_management')
    this.classifier.addDocument('create todo', 'task_management')
    this.classifier.addDocument('remind me', 'task_management')
    this.classifier.addDocument('deadline', 'task_management')

    // Knowledge intents
    this.classifier.addDocument('what is', 'knowledge_query')
    this.classifier.addDocument('explain', 'knowledge_query')
    this.classifier.addDocument('how to', 'knowledge_query')
    this.classifier.addDocument('tell me about', 'knowledge_query')

    // Networking intents
    this.classifier.addDocument('connect me', 'networking')
    this.classifier.addDocument('find investor', 'networking')
    this.classifier.addDocument('introduce me', 'networking')
    this.classifier.addDocument('networking', 'networking')

    // Compliance intents
    this.classifier.addDocument('compliance', 'compliance_check')
    this.classifier.addDocument('regulatory', 'compliance_check')
    this.classifier.addDocument('filing due', 'compliance_check')
    this.classifier.addDocument('tax deadline', 'compliance_check')

    this.classifier.train()
  }

  // ============================================================================
  // INTENT ANALYSIS
  // ============================================================================

  async analyze(content: string): Promise<IntentAnalysis> {
    // Preprocess the content
    const processedContent = this.preprocessContent(content)

    // Classify intent
    const intent = this.classifier.classify(processedContent)
    const classifications = this.classifier.getClassifications(processedContent)

    // Get confidence score
    const topClassification = classifications[0]
    const confidence = topClassification ? topClassification.value : 0

    // Extract entities using compromise
    const entities = this.extractEntities(content)

    // Analyze sentiment
    const sentiment = this.analyzeSentiment(content)

    return {
      intent,
      confidence,
      entities,
      sentiment,
    }
  }

  private preprocessContent(content: string): string {
    // Convert to lowercase
    let processed = content.toLowerCase()

    // Remove punctuation
    processed = processed.replace(/[^\w\s]/g, ' ')

    // Tokenize and stem
    const tokens = this.tokenizer.tokenize(processed) || []
    const stemmedTokens = tokens.map(token => this.stemmer.stem(token))

    return stemmedTokens.join(' ')
  }

  private extractEntities(content: string): Record<string, any> {
    const doc = compromise(content)

    const entities: Record<string, any> = {}

    // Extract dates
    const dates = doc.dates().out('array')
    if (dates.length > 0) {
      entities.dates = dates
    }

    // Extract times
    const times = doc.times().out('array')
    if (times.length > 0) {
      entities.times = times
    }

    // Extract monetary values
    const money = doc.money().out('array')
    if (money.length > 0) {
      entities.money = money
    }

    // Extract numbers
    const numbers = doc.numbers().out('array')
    if (numbers.length > 0) {
      entities.numbers = numbers
    }

    // Extract organizations
    const organizations = doc.organizations().out('array')
    if (organizations.length > 0) {
      entities.organizations = organizations
    }

    // Extract people
    const people = doc.people().out('array')
    if (people.length > 0) {
      entities.people = people
    }

    // Extract email addresses
    const emails = content.match(/[^\s@]+@[^\s@]+\.[^\s@]+/g)
    if (emails) {
      entities.emails = emails
    }

    // Extract phone numbers
    const phones = content.match(/\+?[\d\s\-\(\)]{10,}/g)
    if (phones) {
      entities.phones = phones
    }

    return entities
  }

  private analyzeSentiment(content: string): 'positive' | 'negative' | 'neutral' {
    const doc = compromise(content)

    // Simple sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'fantastic', 'love', 'like', 'awesome']
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'dislike', 'worst', 'horrible', 'suck']

    const tokens = this.tokenizer.tokenize(content.toLowerCase()) || []

    let positiveScore = 0
    let negativeScore = 0

    tokens.forEach(token => {
      if (positiveWords.includes(token)) positiveScore++
      if (negativeWords.includes(token)) negativeScore++
    })

    if (positiveScore > negativeScore) return 'positive'
    if (negativeScore > positiveScore) return 'negative'
    return 'neutral'
  }

  // ============================================================================
  // INTENT LEARNING
  // ============================================================================

  async learnFromFeedback(content: string, correctIntent: string): Promise<void> {
    // Add the corrected classification to improve the model
    this.classifier.addDocument(content, correctIntent)
    this.classifier.train()
  }

  // ============================================================================
  // BATCH PROCESSING
  // ============================================================================

  async analyzeBatch(contents: string[]): Promise<IntentAnalysis[]> {
    const results: IntentAnalysis[] = []

    for (const content of contents) {
      const analysis = await this.analyze(content)
      results.push(analysis)
    }

    return results
  }

  // ============================================================================
  // INTENT VALIDATION
  // ============================================================================

  validateIntent(intent: string): boolean {
    const validIntents = [
      'schedule_meeting',
      'update_profile',
      'get_help',
      'financial_info',
      'document_request',
      'task_management',
      'knowledge_query',
      'networking',
      'compliance_check',
    ]

    return validIntents.includes(intent)
  }

  getIntentDescription(intent: string): string {
    const descriptions: Record<string, string> = {
      'schedule_meeting': 'User wants to schedule a meeting or call',
      'update_profile': 'User wants to update their profile information',
      'get_help': 'User is asking for help or information',
      'financial_info': 'User is asking about financial information',
      'document_request': 'User wants to create or generate a document',
      'task_management': 'User wants to manage tasks or todos',
      'knowledge_query': 'User is asking a knowledge-based question',
      'networking': 'User wants networking or introduction help',
      'compliance_check': 'User is asking about compliance or regulatory matters',
    }

    return descriptions[intent] || 'Unknown intent'
  }
}