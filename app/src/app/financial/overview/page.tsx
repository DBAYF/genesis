'use client'

import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Download,
  Plus,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { mockData } from '@/data/mockData'
import { useCompanyStore } from '@/stores/company'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function FinancialOverviewPage() {
  const { currentCompany } = useCompanyStore()
  const company = currentCompany || mockData.companies[0]
  const projections = mockData.financialProjections.filter(p => p.companyId === company.id)
  const transactions = mockData.transactions.filter(t => t.companyId === company.id)

  // Prepare chart data
  const revenueData = projections.map(p => ({
    month: formatDate(p.period + '-01', { month: 'short', year: '2-digit' }),
    revenue: p.revenue,
    costs: p.costs,
    profit: p.netProfit,
  }))

  // Transaction categories
  const categoryData = transactions.reduce((acc, t) => {
    const category = t.category
    if (!acc[category]) {
      acc[category] = { name: category, value: 0, type: t.type }
    }
    acc[category].value += Math.abs(t.amount)
    return acc
  }, {} as Record<string, any>)

  const pieData = Object.values(categoryData)

  // Cash flow projection
  const cashFlowData = projections.map(p => ({
    month: formatDate(p.period + '-01', { month: 'short', year: '2-digit' }),
    cashFlow: p.cashFlow,
    cumulative: projections
      .filter(proj => proj.period <= p.period)
      .reduce((sum, proj) => sum + proj.cashFlow, company.currentCashBalance || 0),
  }))

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Financial Overview</h1>
            <p className="text-muted-foreground">
              Comprehensive view of your financial performance and projections
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Cash</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(company.currentCashBalance || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Last updated: {formatDate(new Date().toISOString())}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Burn</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(company.monthlyBurnRate || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Based on last 3 months
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Runway</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {company.runwayMonths ? `${company.runwayMonths} months` : '∞'}
              </div>
              <p className="text-xs text-muted-foreground">
                Months of operation remaining
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Funding</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(company.totalFundingRaised)}
              </div>
              <p className="text-xs text-muted-foreground">
                All-time raised capital
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue vs Costs Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs Costs Projection</CardTitle>
            <CardDescription>
              Monthly projections for the next 12 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(value) => value ? [formatCurrency(value as number), ''] : ['£0', '']}
                    labelStyle={{ color: '#000' }}
                  />
                  <Bar dataKey="revenue" fill="#0088FE" name="Revenue" />
                  <Bar dataKey="costs" fill="#FF8042" name="Costs" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Profit & Loss and Cash Flow */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Profit & Loss */}
          <Card>
            <CardHeader>
              <CardTitle>Profit & Loss</CardTitle>
              <CardDescription>
                Monthly profit projections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value) => value ? [formatCurrency(value as number), 'Profit'] : ['£0', 'Profit']}
                      labelStyle={{ color: '#000' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#00C49F"
                      strokeWidth={3}
                      dot={{ fill: '#00C49F', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Cash Flow */}
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Projection</CardTitle>
              <CardDescription>
                Cumulative cash position over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `£${(value / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value) => value ? [formatCurrency(value as number), 'Cash Balance'] : ['£0', 'Cash Balance']}
                      labelStyle={{ color: '#000' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="cumulative"
                      stroke="#FFBB28"
                      strokeWidth={3}
                      dot={{ fill: '#FFBB28', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Expense Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Breakdown</CardTitle>
            <CardDescription>
              Distribution of expenses by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData.filter(d => d.type === 'expense')}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {pieData.filter(d => d.type === 'expense').map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => value ? formatCurrency(value as number) : '£0'} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Expense Categories</h4>
                {pieData.filter(d => d.type === 'expense').map((category, index) => (
                  <div key={category.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm">{category.name}</span>
                    </div>
                    <span className="text-sm font-medium">
                      {formatCurrency(category.value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Latest financial transactions and their impact
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`h-2 w-2 rounded-full ${
                      transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(transaction.date)} • {transaction.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {transaction.reconciled ? 'Reconciled' : 'Pending'}
                    </Badge>
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