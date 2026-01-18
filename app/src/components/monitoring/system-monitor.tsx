'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Activity,
  Database,
  Server,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  HardDrive,
  Cpu,
  Wifi,
  Shield,
} from 'lucide-react'
import { useConfig } from '@/hooks/useConfig'
import { useFeatureStatusSummary } from '@/hooks/useFeatures'

interface SystemMetrics {
  uptime: number
  cpu: number
  memory: number
  disk: number
  network: number
  responseTime: number
  activeUsers: number
  totalRequests: number
  errorRate: number
}

interface ServiceStatus {
  name: string
  status: 'healthy' | 'warning' | 'error' | 'offline'
  uptime: number
  responseTime: number
  lastChecked: Date
}

export function SystemMonitor() {
  const config = useConfig()
  const featureStatus = useFeatureStatusSummary()
  const [metrics, setMetrics] = useState<SystemMetrics>({
    uptime: 99.9,
    cpu: 45,
    memory: 67,
    disk: 23,
    network: 12,
    responseTime: 120,
    activeUsers: 42,
    totalRequests: 12543,
    errorRate: 0.1,
  })

  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: 'API Gateway',
      status: 'healthy',
      uptime: 99.9,
      responseTime: 45,
      lastChecked: new Date(),
    },
    {
      name: 'Authentication Service',
      status: 'healthy',
      uptime: 99.8,
      responseTime: 67,
      lastChecked: new Date(),
    },
    {
      name: 'Database (PostgreSQL)',
      status: 'healthy',
      uptime: 99.9,
      responseTime: 23,
      lastChecked: new Date(),
    },
    {
      name: 'Knowledge Graph (Neo4j)',
      status: 'healthy',
      uptime: 99.7,
      responseTime: 89,
      lastChecked: new Date(),
    },
    {
      name: 'Cache (Redis)',
      status: 'healthy',
      uptime: 99.9,
      responseTime: 12,
      lastChecked: new Date(),
    },
    {
      name: 'Search (Elasticsearch)',
      status: 'warning',
      uptime: 98.5,
      responseTime: 234,
      lastChecked: new Date(),
    },
  ])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        cpu: Math.max(0, Math.min(100, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(0, Math.min(100, prev.memory + (Math.random() - 0.5) * 5)),
        responseTime: Math.max(50, Math.min(500, prev.responseTime + (Math.random() - 0.5) * 50)),
        activeUsers: Math.max(0, prev.activeUsers + Math.floor((Math.random() - 0.5) * 10)),
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'healthy':
        return 'text-green-500'
      case 'warning':
        return 'text-yellow-500'
      case 'error':
        return 'text-red-500'
      case 'offline':
        return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />
      case 'error':
        return <AlertTriangle className="h-4 w-4" />
      case 'offline':
        return <Clock className="h-4 w-4" />
    }
  }

  const getProgressColor = (value: number) => {
    if (value < 50) return 'bg-green-500'
    if (value < 80) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Monitor</h1>
          <p className="text-muted-foreground">
            Real-time system health and performance metrics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Shield className="h-4 w-4 mr-2" />
            Health Check
          </Button>
        </div>
      </div>

      {/* System Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.uptime}%</div>
            <p className="text-xs text-muted-foreground">
              30-day average
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Currently online
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.responseTime}ms</div>
            <p className="text-xs text-muted-foreground">
              Average API response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.errorRate}%</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resource Usage */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Resource Usage</CardTitle>
            <CardDescription>
              Current system resource utilization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Cpu className="h-4 w-4" />
                  CPU Usage
                </span>
                <span>{metrics.cpu.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.cpu} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4" />
                  Memory Usage
                </span>
                <span>{metrics.memory.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.memory} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Disk Usage
                </span>
                <span>{metrics.disk.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.disk} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <Wifi className="h-4 w-4" />
                  Network I/O
                </span>
                <span>{metrics.network.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.network} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Feature Status</CardTitle>
            <CardDescription>
              Availability of system features and integrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Core Features</span>
                <Badge variant="outline">
                  {featureStatus.enabledCount}/{featureStatus.totalCount} enabled
                </Badge>
              </div>

              <div className="space-y-2">
                {featureStatus.summary.slice(0, 6).map((feature) => (
                  <div key={feature.feature} className="flex items-center justify-between">
                    <span className="text-sm capitalize">
                      {feature.feature.replace('-', ' ')}
                    </span>
                    <div className="flex items-center gap-2">
                      {feature.enabled ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      )}
                      <Badge variant={feature.enabled ? 'default' : 'secondary'} className="text-xs">
                        {feature.enabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span>Overall Health</span>
                  <Badge variant={featureStatus.criticalFeaturesEnabled ? 'default' : 'destructive'}>
                    {featureStatus.criticalFeaturesEnabled ? 'Healthy' : 'Issues'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle>Service Status</CardTitle>
          <CardDescription>
            Health status of all system services and integrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div key={service.name} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{service.name}</h3>
                  <div className={`flex items-center gap-1 ${getStatusColor(service.status)}`}>
                    {getStatusIcon(service.status)}
                  </div>
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge
                      variant={
                        service.status === 'healthy' ? 'default' :
                        service.status === 'warning' ? 'secondary' : 'destructive'
                      }
                      className="text-xs"
                    >
                      {service.status}
                    </Badge>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Uptime:</span>
                    <span>{service.uptime}%</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Response:</span>
                    <span>{service.responseTime}ms</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monitoring Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Monitoring Configuration</CardTitle>
          <CardDescription>
            Status of monitoring and observability services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${
                  config.monitoring.sentry ? 'bg-green-500' : 'bg-gray-400'
                }`} />
                <span className="text-sm">Sentry</span>
              </div>
              <Badge variant={config.monitoring.sentry ? 'default' : 'secondary'} className="text-xs">
                {config.monitoring.sentry ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${
                  config.monitoring.datadog ? 'bg-green-500' : 'bg-gray-400'
                }`} />
                <span className="text-sm">Datadog</span>
              </div>
              <Badge variant={config.monitoring.datadog ? 'default' : 'secondary'} className="text-xs">
                {config.monitoring.datadog ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${
                  config.monitoring.logtail ? 'bg-green-500' : 'bg-gray-400'
                }`} />
                <span className="text-sm">LogTail</span>
              </div>
              <Badge variant={config.monitoring.logtail ? 'default' : 'secondary'} className="text-xs">
                {config.monitoring.logtail ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded">
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${
                  config.system.queue ? 'bg-green-500' : 'bg-gray-400'
                }`} />
                <span className="text-sm">Queue System</span>
              </div>
              <Badge variant={config.system.queue ? 'default' : 'secondary'} className="text-xs">
                {config.system.queue ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}