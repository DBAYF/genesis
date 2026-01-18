'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  User,
  Building2,
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  DollarSign,
} from 'lucide-react'
import { mockData } from '@/data/mockData'
import { Contact, Deal } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function CRMPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)

  const contacts = mockData.contacts
  const deals = mockData.deals

  const filteredContacts = contacts.filter(contact =>
    contact.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getContactTypeIcon = (type: Contact['type']) => {
    switch (type) {
      case 'customer':
        return User
      case 'investor':
        return TrendingUp
      case 'supplier':
        return Building2
      default:
        return Users
    }
  }

  const getContactTypeColor = (type: Contact['type']) => {
    switch (type) {
      case 'customer':
        return 'bg-blue-500'
      case 'investor':
        return 'bg-green-500'
      case 'supplier':
        return 'bg-purple-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getDealStageColor = (stage: Deal['stage']) => {
    switch (stage) {
      case 'closed_won':
        return 'bg-green-500'
      case 'closed_lost':
        return 'bg-red-500'
      case 'negotiation':
        return 'bg-yellow-500'
      case 'proposal':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  const totalDealValue = deals.reduce((sum, deal) => sum + deal.value, 0)
  const wonDeals = deals.filter(deal => deal.stage === 'closed_won')
  const wonValue = wonDeals.reduce((sum, deal) => sum + deal.value, 0)

  const contactDeals = selectedContact
    ? deals.filter(deal => deal.contactId === selectedContact.id)
    : []

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">CRM Dashboard</h1>
            <p className="text-muted-foreground">
              Manage contacts, relationships, and deal pipeline
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contacts.length}</div>
              <p className="text-xs text-muted-foreground">
                Across all categories
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {deals.filter(d => !d.stage.includes('closed')).length}
              </div>
              <p className="text-xs text-muted-foreground">
                In pipeline
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pipeline Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalDealValue)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total deal value
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {deals.length > 0 ? ((wonDeals.length / deals.length) * 100).toFixed(1) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {wonValue > 0 ? formatCurrency(wonValue) + ' won' : 'No wins yet'}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Contacts List */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Contacts</CardTitle>
                <CardDescription>
                  Manage your business relationships
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search contacts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>

                  {/* Contact List */}
                  <div className="space-y-2">
                    {filteredContacts.map((contact) => {
                      const IconComponent = getContactTypeIcon(contact.type)
                      return (
                        <div
                          key={contact.id}
                          className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors ${
                            selectedContact?.id === contact.id ? 'bg-accent' : ''
                          }`}
                          onClick={() => setSelectedContact(contact)}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${getContactTypeColor(contact.type)}`}>
                              <IconComponent className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <h3 className="font-medium">
                                {contact.firstName} {contact.lastName}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {contact.company || 'No company'}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                  {contact.type}
                                </Badge>
                                {contact.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {contact.email && (
                              <Button variant="ghost" size="sm">
                                <Mail className="h-4 w-4" />
                              </Button>
                            )}
                            {contact.phone && (
                              <Button variant="ghost" size="sm">
                                <Phone className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Details / Deal Pipeline */}
          <div className="space-y-4">
            {selectedContact ? (
              <>
                {/* Contact Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {selectedContact.firstName} {selectedContact.lastName}
                    </CardTitle>
                    <CardDescription>
                      {selectedContact.position} at {selectedContact.company}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedContact.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{selectedContact.email}</span>
                        </div>
                      )}

                      {selectedContact.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{selectedContact.phone}</span>
                        </div>
                      )}

                      {selectedContact.lastContactedAt && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            Last contacted: {formatDate(selectedContact.lastContactedAt)}
                          </span>
                        </div>
                      )}

                      <div className="pt-4">
                        <Button className="w-full" variant="outline">
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Deals */}
                <Card>
                  <CardHeader>
                    <CardTitle>Related Deals</CardTitle>
                    <CardDescription>
                      Deals associated with this contact
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {contactDeals.length > 0 ? (
                      <div className="space-y-3">
                        {contactDeals.map((deal) => (
                          <div key={deal.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-sm">{deal.title}</h4>
                              <Badge
                                variant="outline"
                                className={`text-xs ${getDealStageColor(deal.stage) === 'bg-green-500' ? 'border-green-500 text-green-700' : ''}`}
                              >
                                {deal.stage.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {formatCurrency(deal.value)} • {deal.probability}% probability
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No deals associated with this contact
                      </p>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a contact to view details</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Deal Pipeline */}
        <Card>
          <CardHeader>
            <CardTitle>Deal Pipeline</CardTitle>
            <CardDescription>
              Track your sales pipeline and deal progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deals.map((deal) => {
                const contact = contacts.find(c => c.id === deal.contactId)
                return (
                  <div key={deal.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`h-3 w-3 rounded-full ${getDealStageColor(deal.stage)}`} />
                      <div>
                        <h4 className="font-medium">{deal.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {contact?.firstName} {contact?.lastName} • {contact?.company}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(deal.value)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {deal.stage.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {deal.probability}% win rate
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}