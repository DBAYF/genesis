'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  CheckSquare,
  AlertTriangle,
  Calendar,
  FileText,
  TrendingUp,
  X,
  Check,
  Clock,
} from 'lucide-react'
import { mockData } from '@/data/mockData'
import { ComplianceTask } from '@/types'
import { formatDate } from '@/lib/utils'

export default function CompliancePage() {
  const complianceTasks = mockData.complianceTasks
  const complianceRecords = mockData.complianceRecords

  const getStatusColor = (status: ComplianceTask['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'in_progress':
        return 'bg-blue-500'
      case 'overdue':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusBadgeVariant = (status: ComplianceTask['status']) => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'in_progress':
        return 'secondary'
      case 'overdue':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getPriorityColor = (priority: ComplianceTask['priority']) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600'
      case 'high':
        return 'text-orange-600'
      case 'medium':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  const upcomingTasks = complianceTasks
    .filter(task => new Date(task.dueDate) > new Date())
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5)

  const overdueTasks = complianceTasks.filter(
    task => new Date(task.dueDate) < new Date() && task.status !== 'completed'
  )

  const completedTasks = complianceTasks.filter(task => task.status === 'completed')

  const completionRate = (completedTasks.length / complianceTasks.length) * 100

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Compliance Dashboard</h1>
            <p className="text-muted-foreground">
              Track compliance tasks, deadlines, and regulatory requirements
            </p>
          </div>
          <Button>
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{complianceTasks.length}</div>
              <p className="text-xs text-muted-foreground">
                All compliance obligations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <Check className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {completedTasks.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {completionRate.toFixed(1)}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {overdueTasks.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Require immediate attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Due</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {upcomingTasks.length > 0
                  ? formatDate(upcomingTasks[0].dueDate)
                  : 'None'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                {upcomingTasks.length > 0 ? upcomingTasks[0].title : 'All caught up'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Progress</CardTitle>
            <CardDescription>
              Overall completion status across all compliance areas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Completion</span>
                <span className="text-sm text-muted-foreground">
                  {completedTasks.length} of {complianceTasks.length} tasks
                </span>
              </div>
              <Progress value={completionRate} className="h-2" />

              <div className="grid gap-4 md:grid-cols-3 mt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {completedTasks.length}
                  </div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {complianceTasks.filter(t => t.status === 'in_progress').length}
                  </div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {overdueTasks.length}
                  </div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Upcoming Tasks */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
              <CardDescription>
                Compliance tasks due in the next 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`h-3 w-3 rounded-full ${getStatusColor(task.status)}`} />
                      <div>
                        <h4 className="font-medium">{task.title}</h4>
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={getStatusBadgeVariant(task.status)} className="text-xs">
                            {task.status.replace('_', ' ')}
                          </Badge>
                          <span className={`text-xs ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatDate(task.dueDate)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Math.ceil((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Overdue Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Overdue Tasks
              </CardTitle>
              <CardDescription>
                Tasks that require immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {overdueTasks.length > 0 ? (
                <div className="space-y-4">
                  {overdueTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="h-3 w-3 rounded-full bg-red-500" />
                        <div>
                          <h4 className="font-medium text-red-900">{task.title}</h4>
                          <p className="text-sm text-red-700">{task.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="destructive" className="text-xs">
                              overdue
                            </Badge>
                            <span className="text-xs text-red-600">
                              {task.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-red-900">
                          {formatDate(task.dueDate)}
                        </p>
                        <p className="text-xs text-red-700">
                          {Math.abs(Math.ceil((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days overdue
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">No overdue tasks!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Compliance Records */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance History</CardTitle>
            <CardDescription>
              Recent compliance filings and submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {complianceRecords.slice(0, 5).map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`h-3 w-3 rounded-full ${
                      record.status === 'compliant' ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    <div>
                      <h4 className="font-medium">{record.type.replace('_', ' ').toUpperCase()}</h4>
                      <p className="text-sm text-muted-foreground">Reference: {record.reference}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={record.status === 'compliant' ? 'default' : 'secondary'}>
                      {record.status.replace('_', ' ')}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {record.submittedDate ? formatDate(record.submittedDate) : 'Not submitted'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}