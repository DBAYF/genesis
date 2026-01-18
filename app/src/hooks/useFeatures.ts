'use client'

import { useMemo } from 'react'
import {
  useNexusEnabled,
  usePulseEnabled,
  useCommunityRoundsEnabled,
  useRBFEnabled,
  useNeo4jEnabled,
  useElasticsearchEnabled,
  usePineconeEnabled,
  useRedisEnabled,
  useOpenAIEnabled,
  useAnthropicEnabled,
  useCompaniesHouseEnabled,
  useStripeEnabled,
  useTwilioEnabled,
} from './useConfig'

// ============================================================================
// FEATURE AVAILABILITY SYSTEM
// ============================================================================

/**
 * Feature availability combines feature flags with database/service dependencies
 * This ensures features are only enabled when both the flag is set AND required services are available
 */

export interface FeatureAvailability {
  enabled: boolean
  reason?: string
  missingDependencies?: string[]
}

export function useFeatureAvailability(feature: string): FeatureAvailability {
  return useMemo(() => {
    switch (feature) {
      case 'nexus':
        return getNexusAvailability()
      case 'pulse':
        return getPulseAvailability()
      case 'community-rounds':
        return getCommunityRoundsAvailability()
      case 'rbf':
        return getRBFAvailability()
      case 'knowledge-graph':
        return getKnowledgeGraphAvailability()
      case 'search':
        return getSearchAvailability()
      case 'ai-embeddings':
        return getAIEmbeddingsAvailability()
      case 'caching':
        return getCachingAvailability()
      case 'ai-assistant':
        return getAIAssistantAvailability()
      case 'company-incorporation':
        return getCompanyIncorporationAvailability()
      case 'payment-processing':
        return getPaymentProcessingAvailability()
      case 'sms':
        return getSMSAvailability()
      default:
        return { enabled: true }
    }
  }, [feature])
}

function getNexusAvailability(): FeatureAvailability {
  const isEnabled = useNexusEnabled()
  const neo4jEnabled = useNeo4jEnabled()

  if (!isEnabled) {
    return { enabled: false, reason: 'Nexus feature is disabled' }
  }

  if (!neo4jEnabled) {
    return {
      enabled: false,
      reason: 'Neo4j database required for Nexus functionality',
      missingDependencies: ['neo4j']
    }
  }

  return { enabled: true }
}

function getPulseAvailability(): FeatureAvailability {
  const isEnabled = usePulseEnabled()
  const redisEnabled = useRedisEnabled()

  if (!isEnabled) {
    return { enabled: false, reason: 'Pulse feature is disabled' }
  }

  if (!redisEnabled) {
    return {
      enabled: false,
      reason: 'Redis required for Pulse messaging',
      missingDependencies: ['redis']
    }
  }

  return { enabled: true }
}

function getCommunityRoundsAvailability(): FeatureAvailability {
  const isEnabled = useCommunityRoundsEnabled()

  if (!isEnabled) {
    return { enabled: false, reason: 'Community rounds feature is disabled' }
  }

  return { enabled: true }
}

function getRBFAvailability(): FeatureAvailability {
  const isEnabled = useRBFEnabled()

  if (!isEnabled) {
    return { enabled: false, reason: 'RBF matching feature is disabled' }
  }

  return { enabled: true }
}

function getKnowledgeGraphAvailability(): FeatureAvailability {
  const neo4jEnabled = useNeo4jEnabled()

  if (!neo4jEnabled) {
    return {
      enabled: false,
      reason: 'Neo4j database required for knowledge graph',
      missingDependencies: ['neo4j']
    }
  }

  return { enabled: true }
}

function getSearchAvailability(): FeatureAvailability {
  const elasticsearchEnabled = useElasticsearchEnabled()

  if (!elasticsearchEnabled) {
    return {
      enabled: false,
      reason: 'Elasticsearch required for advanced search',
      missingDependencies: ['elasticsearch']
    }
  }

  return { enabled: true }
}

function getAIEmbeddingsAvailability(): FeatureAvailability {
  const pineconeEnabled = usePineconeEnabled()
  const openaiEnabled = useOpenAIEnabled()

  const missingDeps: string[] = []
  if (!pineconeEnabled) missingDeps.push('pinecone')
  if (!openaiEnabled) missingDeps.push('openai')

  if (missingDeps.length > 0) {
    return {
      enabled: false,
      reason: 'Pinecone and OpenAI required for AI embeddings',
      missingDependencies: missingDeps
    }
  }

  return { enabled: true }
}

function getCachingAvailability(): FeatureAvailability {
  const redisEnabled = useRedisEnabled()

  if (!redisEnabled) {
    return {
      enabled: false,
      reason: 'Redis required for caching',
      missingDependencies: ['redis']
    }
  }

  return { enabled: true }
}

function getAIAssistantAvailability(): FeatureAvailability {
  const openaiEnabled = useOpenAIEnabled()
  const anthropicEnabled = useAnthropicEnabled()

  if (!openaiEnabled && !anthropicEnabled) {
    return {
      enabled: false,
      reason: 'OpenAI or Anthropic required for AI assistant',
      missingDependencies: ['openai', 'anthropic']
    }
  }

  return { enabled: true }
}

function getCompanyIncorporationAvailability(): FeatureAvailability {
  const companiesHouseEnabled = useCompaniesHouseEnabled()

  if (!companiesHouseEnabled) {
    return {
      enabled: false,
      reason: 'Companies House API required for incorporation',
      missingDependencies: ['companies-house']
    }
  }

  return { enabled: true }
}

function getPaymentProcessingAvailability(): FeatureAvailability {
  const stripeEnabled = useStripeEnabled()

  if (!stripeEnabled) {
    return {
      enabled: false,
      reason: 'Stripe required for payment processing',
      missingDependencies: ['stripe']
    }
  }

  return { enabled: true }
}

function getSMSAvailability(): FeatureAvailability {
  const twilioEnabled = useTwilioEnabled()

  if (!twilioEnabled) {
    return {
      enabled: false,
      reason: 'Twilio required for SMS functionality',
      missingDependencies: ['twilio']
    }
  }

  return { enabled: true }
}

// ============================================================================
// SPECIFIC FEATURE HOOKS
// ============================================================================

export function useNexusAvailable(): FeatureAvailability {
  return useFeatureAvailability('nexus')
}

export function usePulseAvailable(): FeatureAvailability {
  return useFeatureAvailability('pulse')
}

export function useCommunityRoundsAvailable(): FeatureAvailability {
  return useFeatureAvailability('community-rounds')
}

export function useRBFAvailable(): FeatureAvailability {
  return useFeatureAvailability('rbf')
}

export function useKnowledgeGraphAvailable(): FeatureAvailability {
  return useFeatureAvailability('knowledge-graph')
}

export function useSearchAvailable(): FeatureAvailability {
  return useFeatureAvailability('search')
}

export function useAIEmbeddingsAvailable(): FeatureAvailability {
  return useFeatureAvailability('ai-embeddings')
}

export function useAIAssistantAvailable(): FeatureAvailability {
  return useFeatureAvailability('ai-assistant')
}

export function useCompanyIncorporationAvailable(): FeatureAvailability {
  return useFeatureAvailability('company-incorporation')
}

export function usePaymentProcessingAvailable(): FeatureAvailability {
  return useFeatureAvailability('payment-processing')
}

export function useSMSAvailable(): FeatureAvailability {
  return useFeatureAvailability('sms')
}

export function useCachingAvailable(): FeatureAvailability {
  return useFeatureAvailability('caching')
}

// ============================================================================
// CONDITIONAL RENDERING HOOKS
// ============================================================================

export function useConditionalRender(feature: string) {
  const availability = useFeatureAvailability(feature)

  return {
    shouldRender: availability.enabled,
    fallbackReason: availability.reason,
    missingDeps: availability.missingDependencies,
  }
}

// ============================================================================
// FEATURE STATUS SUMMARY
// ============================================================================

export function useFeatureStatusSummary() {
  const features = [
    'nexus',
    'pulse',
    'community-rounds',
    'rbf',
    'knowledge-graph',
    'search',
    'ai-embeddings',
    'ai-assistant',
    'company-incorporation',
    'payment-processing',
    'sms',
    'caching',
  ]

  return useMemo(() => {
    const status = features.map(feature => ({
      feature,
      ...useFeatureAvailability(feature),
    }))

    const enabledCount = status.filter(s => s.enabled).length
    const totalCount = status.length

    return {
      summary: status,
      enabledCount,
      totalCount,
      availabilityPercentage: (enabledCount / totalCount) * 100,
      criticalFeaturesEnabled: status
        .filter(s => ['nexus', 'pulse', 'knowledge-graph'].includes(s.feature))
        .every(s => s.enabled),
    }
  }, [])
}