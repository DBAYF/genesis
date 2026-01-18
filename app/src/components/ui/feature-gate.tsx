'use client'

import { ReactNode } from 'react'
import { useFeatureAvailability } from '@/hooks/useFeatures'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'
import { Badge } from './badge'
import { AlertTriangle, Database, Settings } from 'lucide-react'

interface FeatureGateProps {
  feature: string
  children: ReactNode
  fallback?: ReactNode
  showFallback?: boolean
  className?: string
}

/**
 * FeatureGate conditionally renders children based on feature availability
 * Shows fallback content or nothing when feature is disabled
 */
export function FeatureGate({
  feature,
  children,
  fallback,
  showFallback = true,
  className = '',
}: FeatureGateProps) {
  const availability = useFeatureAvailability(feature)

  if (availability.enabled) {
    return <div className={className}>{children}</div>
  }

  if (!showFallback) {
    return null
  }

  if (fallback) {
    return <div className={className}>{fallback}</div>
  }

  // Default fallback
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Feature Unavailable
        </CardTitle>
        <CardDescription>
          {availability.reason || `${feature} is currently unavailable`}
        </CardDescription>
      </CardHeader>
      {availability.missingDependencies && availability.missingDependencies.length > 0 && (
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm font-medium">Missing Dependencies:</p>
            <div className="flex flex-wrap gap-2">
              {availability.missingDependencies.map((dep) => (
                <Badge key={dep} variant="outline" className="flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  {dep}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

// ============================================================================
// PRESET FEATURE GATES
// ============================================================================

export function NexusGate({ children, ...props }: Omit<FeatureGateProps, 'feature'>) {
  return (
    <FeatureGate feature="nexus" {...props}>
      {children}
    </FeatureGate>
  )
}

export function PulseGate({ children, ...props }: Omit<FeatureGateProps, 'feature'>) {
  return (
    <FeatureGate feature="pulse" {...props}>
      {children}
    </FeatureGate>
  )
}

export function KnowledgeGraphGate({ children, ...props }: Omit<FeatureGateProps, 'feature'>) {
  return (
    <FeatureGate feature="knowledge-graph" {...props}>
      {children}
    </FeatureGate>
  )
}

export function SearchGate({ children, ...props }: Omit<FeatureGateProps, 'feature'>) {
  return (
    <FeatureGate feature="search" {...props}>
      {children}
    </FeatureGate>
  )
}

export function AIEmbeddingsGate({ children, ...props }: Omit<FeatureGateProps, 'feature'>) {
  return (
    <FeatureGate feature="ai-embeddings" {...props}>
      {children}
    </FeatureGate>
  )
}

export function AIAssistantGate({ children, ...props }: Omit<FeatureGateProps, 'feature'>) {
  return (
    <FeatureGate feature="ai-assistant" {...props}>
      {children}
    </FeatureGate>
  )
}

export function CompanyIncorporationGate({ children, ...props }: Omit<FeatureGateProps, 'feature'>) {
  return (
    <FeatureGate feature="company-incorporation" {...props}>
      {children}
    </FeatureGate>
  )
}

export function PaymentProcessingGate({ children, ...props }: Omit<FeatureGateProps, 'feature'>) {
  return (
    <FeatureGate feature="payment-processing" {...props}>
      {children}
    </FeatureGate>
  )
}

export function SMSGate({ children, ...props }: Omit<FeatureGateProps, 'feature'>) {
  return (
    <FeatureGate feature="sms" {...props}>
      {children}
    </FeatureGate>
  )
}

// ============================================================================
// FEATURE STATUS INDICATOR
// ============================================================================

interface FeatureStatusProps {
  feature: string
  showDetails?: boolean
  className?: string
}

export function FeatureStatus({ feature, showDetails = false, className = '' }: FeatureStatusProps) {
  const availability = useFeatureAvailability(feature)

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`h-2 w-2 rounded-full ${
          availability.enabled ? 'bg-green-500' : 'bg-red-500'
        }`}
      />
      <span className="text-sm capitalize">{feature.replace('-', ' ')}</span>
      {showDetails && !availability.enabled && (
        <Badge variant="outline" className="text-xs">
          <Settings className="h-3 w-3 mr-1" />
          Disabled
        </Badge>
      )}
    </div>
  )
}

// ============================================================================
// FEATURE REQUIREMENTS CHECKER
// ============================================================================

interface FeatureRequirementsProps {
  features: string[]
  children: ReactNode
  requireAll?: boolean
  fallback?: ReactNode
}

export function FeatureRequirements({
  features,
  children,
  requireAll = true,
  fallback,
}: FeatureRequirementsProps) {
  const availabilities = features.map(feature => useFeatureAvailability(feature))

  const allEnabled = requireAll
    ? availabilities.every(a => a.enabled)
    : availabilities.some(a => a.enabled)

  const missingFeatures = availabilities
    .filter(a => !a.enabled)
    .map((a, index) => features[index])

  if (allEnabled) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Features Unavailable
        </CardTitle>
        <CardDescription>
          The following features are required but not available:
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {missingFeatures.map((feature) => (
            <FeatureStatus key={feature} feature={feature} showDetails />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}