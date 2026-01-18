'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Bot,
  Send,
  Loader2,
  Sparkles,
  Brain,
  MessageSquare,
  Lightbulb,
} from 'lucide-react'
import { useOpenAIEnabled, useAnthropicEnabled } from '@/hooks/useConfig'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  suggestions?: string[]
}

interface AIAssistantProps {
  context?: 'general' | 'financial' | 'legal' | 'compliance' | 'nexus'
  compact?: boolean
}

export function AIAssistant({ context = 'general', compact = false }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: getWelcomeMessage(context),
      timestamp: new Date(),
      suggestions: getSuggestions(context),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const openaiEnabled = useOpenAIEnabled()
  const anthropicEnabled = useAnthropicEnabled()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      // Simulate AI response (in real implementation, this would call the API)
      await new Promise(resolve => setTimeout(resolve, 1500))

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateAIResponse(input.trim(), context),
        timestamp: new Date(),
        suggestions: getFollowUpSuggestions(context),
      }

      setMessages(prev => [...prev, aiResponse])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion)
  }

  const getAIProvider = () => {
    if (openaiEnabled) return 'OpenAI'
    if (anthropicEnabled) return 'Anthropic'
    return 'AI'
  }

  if (compact) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <CardTitle className="text-lg">AI Assistant</CardTitle>
            <Badge variant="outline" className="text-xs">
              {getAIProvider()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Ask me anything..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isLoading}
                size="sm"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            {messages[messages.length - 1]?.suggestions && (
              <div className="flex flex-wrap gap-2">
                {messages[messages.length - 1].suggestions!.slice(0, 3).map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="text-xs"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full h-[600px] flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            <CardTitle>AI Assistant</CardTitle>
            <Badge variant="outline">{getAIProvider()}</Badge>
          </div>
          <Badge variant="secondary" className="capitalize">
            {context} Mode
          </Badge>
        </div>
        <CardDescription>
          Ask me questions about your business, finances, or compliance
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {message.role === 'assistant' ? (
                    <Bot className="h-4 w-4" />
                  ) : (
                    <MessageSquare className="h-4 w-4" />
                  )}
                  <span className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {messages[messages.length - 1]?.suggestions && !isLoading && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4" />
              <span className="text-sm font-medium">Suggested questions:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {messages[messages.length - 1].suggestions!.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="text-xs"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Type your question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper functions
function getWelcomeMessage(context: string): string {
  const messages = {
    general: "Hello! I'm your AI assistant. I can help you with business advice, analyze your data, and answer questions about Genesis Engine.",
    financial: "Welcome to the financial assistant! I can help you understand your financial projections, analyze cash flow, and provide insights about your business metrics.",
    legal: "Legal assistant here! I can help you understand compliance requirements, review contracts, and provide guidance on business law.",
    compliance: "Compliance assistant at your service! I can help you stay on top of regulatory requirements, filing deadlines, and compliance best practices.",
    nexus: "Network assistant ready! I can help you find connections, understand relationship dynamics, and optimize your networking strategy.",
  }

  return messages[context as keyof typeof messages] || messages.general
}

function getSuggestions(context: string): string[] {
  const suggestions = {
    general: [
      "What's my current runway?",
      "Show me recent transactions",
      "How is my compliance status?",
    ],
    financial: [
      "Analyze my cash flow",
      "What are my key financial metrics?",
      "Optimize my pricing strategy",
    ],
    legal: [
      "Review my shareholder agreement",
      "What are my incorporation requirements?",
      "Update my terms of service",
    ],
    compliance: [
      "When is my next filing due?",
      "Check VAT compliance",
      "Prepare for HMRC audit",
    ],
    nexus: [
      "Find potential investors",
      "Who should I connect with?",
      "Analyze my network strength",
    ],
  }

  return suggestions[context as keyof typeof suggestions] || suggestions.general
}

function getFollowUpSuggestions(context: string): string[] {
  const suggestions = {
    general: ["Tell me more", "Show me details", "What are my options?"],
    financial: ["Show me the numbers", "Compare to industry average", "What if scenarios"],
    legal: ["What are the risks?", "Show me similar cases", "What documents do I need?"],
    compliance: ["What's the deadline?", "Who can help me?", "What are the penalties?"],
    nexus: ["How do I connect?", "What's their background?", "Schedule a meeting"],
  }

  return suggestions[context as keyof typeof suggestions] || suggestions.general
}

function generateAIResponse(input: string, context: string): string {
  // Simulate AI responses based on context
  const responses = {
    general: [
      "Based on your business data, I recommend focusing on cash flow optimization. Your current runway suggests you have 5 months before needing additional funding.",
      "Your recent transaction patterns show strong growth in the last quarter. Consider scaling your marketing efforts to capitalize on this momentum.",
      "I've analyzed your compliance status and everything looks good. Your next major deadline is the annual accounts filing in December.",
    ],
    financial: [
      "Your financial projections show a healthy growth trajectory. The key driver is your recurring revenue stream, which provides stability.",
      "I've identified potential cost savings of £2,500/month in your current expenses. The largest opportunity is in software subscriptions.",
      "Your cash flow analysis indicates you should plan for additional funding in Q2 to support the projected customer acquisition costs.",
    ],
    legal: [
      "Based on your company structure, I recommend reviewing your shareholder agreement annually. Your current setup looks solid for growth.",
      "Your incorporation documents are up to date. Consider adding drag-along rights to your term sheet for the next funding round.",
      "From a legal perspective, your current IP protection strategy is adequate, but you might benefit from trademark registration for your brand.",
    ],
    compliance: [
      "Your HMRC filings are current. Remember to submit your Q4 VAT return by January 31st. I can help you prepare the documentation.",
      "Your confirmation statement is due in 2 months. Make sure your registered office address is still correct.",
      "Your compliance score is excellent. The system shows all regulatory requirements are being met according to current standards.",
    ],
    nexus: [
      "I've identified 3 potential investors who match your profile. Two are in your geographic area and one has invested in similar companies before.",
      "Your network analysis shows strong connections in the fintech sector. Consider expanding into adjacent industries like healthtech.",
      "Based on your profile, I recommend attending the upcoming TechCrunch event. I've found 5 relevant contacts who will be there.",
    ],
  }

  const contextResponses = responses[context as keyof typeof responses] || responses.general
  return contextResponses[Math.floor(Math.random() * contextResponses.length)]
}