'use client'

import { useState } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  PoundSterling,
  FileText,
  Edit,
  Save,
  X,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { mockData } from '@/data/mockData'
import { useCompanyStore } from '@/stores/company'

export default function CompanyProfilePage() {
  const { currentCompany, updateCompany } = useCompanyStore()
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<any>({})

  const company = currentCompany || mockData.companies[0]

  const handleEdit = () => {
    setEditData({ ...company })
    setIsEditing(true)
  }

  const handleSave = () => {
    updateCompany(company.id, editData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditData({})
  }

  const updateField = (field: string, value: any) => {
    setEditData((prev: any) => ({ ...prev, [field]: value }))
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Company Profile</h1>
            <p className="text-muted-foreground">
              Manage your company information and settings
            </p>
          </div>
          {!isEditing ? (
            <Button onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Core company details and registration information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Company Name</label>
                {isEditing ? (
                  <Input
                    value={editData.name || ''}
                    onChange={(e) => updateField('name', e.target.value)}
                  />
                ) : (
                  <p className="text-sm">{company.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Trading Name</label>
                {isEditing ? (
                  <Input
                    value={editData.tradingName || ''}
                    onChange={(e) => updateField('tradingName', e.target.value)}
                  />
                ) : (
                  <p className="text-sm">{company.tradingName || 'Not set'}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Company Number</label>
                <p className="text-sm font-mono">{company.companyNumber}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Company Type</label>
                <Badge variant="outline">{company.companyType.toUpperCase()}</Badge>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Incorporation Date</label>
                <p className="text-sm">{company.incorporationDate ? formatDate(company.incorporationDate) : 'Not incorporated'}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Company Status</label>
                <Badge
                  variant={company.companyStatus === 'active' ? 'default' : 'secondary'}
                >
                  {company.companyStatus.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Addresses */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Registered Office */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Registered Office
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="text-sm">{company.registeredAddress.line1}</p>
                {company.registeredAddress.line2 && (
                  <p className="text-sm">{company.registeredAddress.line2}</p>
                )}
                <p className="text-sm">{company.registeredAddress.city}</p>
                <p className="text-sm">{company.registeredAddress.postcode}</p>
                <p className="text-sm">{company.registeredAddress.country}</p>
              </div>
            </CardContent>
          </Card>

          {/* Business Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Business Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              {company.businessAddress ? (
                <div className="space-y-1">
                  <p className="text-sm">{company.businessAddress.line1}</p>
                  {company.businessAddress.line2 && (
                    <p className="text-sm">{company.businessAddress.line2}</p>
                  )}
                  <p className="text-sm">{company.businessAddress.city}</p>
                  <p className="text-sm">{company.businessAddress.postcode}</p>
                  <p className="text-sm">{company.businessAddress.country}</p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Same as registered office</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Financial Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PoundSterling className="h-5 w-5" />
              Financial Overview
            </CardTitle>
            <CardDescription>
              Current financial status and key metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Cash Balance</label>
                <p className="text-2xl font-bold">
                  {formatCurrency(company.currentCashBalance || 0)}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Monthly Burn Rate</label>
                <p className="text-2xl font-bold">
                  {formatCurrency(company.monthlyBurnRate || 0)}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Runway</label>
                <p className="text-2xl font-bold">
                  {company.runwayMonths ? `${company.runwayMonths} months` : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tax & Compliance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Tax & Compliance
            </CardTitle>
            <CardDescription>
              Tax references and compliance status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Corporation Tax Ref</label>
                <p className="text-sm font-mono">{company.corporationTaxReference}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">VAT Number</label>
                <p className="text-sm font-mono">{company.vatNumber}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">PAYE Reference</label>
                <p className="text-sm font-mono">{company.payeReference}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">VAT Registered</label>
                <Badge variant={company.vatRegistered ? 'default' : 'secondary'}>
                  {company.vatRegistered ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SEIS/EIS Status */}
        <Card>
          <CardHeader>
            <CardTitle>SEIS/EIS Relief Status</CardTitle>
            <CardDescription>
              Tax relief scheme eligibility and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">SEIS Eligible</span>
                  <Badge variant={company.seisEligible ? 'default' : 'secondary'}>
                    {company.seisEligible ? 'Eligible' : 'Not Eligible'}
                  </Badge>
                </div>

                {company.seisEligible && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">SEIS Advance Assurance</span>
                      <Badge variant="outline">
                        {company.seisAdvanceAssuranceStatus || 'Not Applied'}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm">Remaining SEIS Allocation</span>
                      <span className="font-medium">
                        {formatCurrency(company.seisAllocationRemaining)}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">EIS Eligible</span>
                  <Badge variant={company.eisEligible ? 'default' : 'secondary'}>
                    {company.eisEligible ? 'Eligible' : 'Not Eligible'}
                  </Badge>
                </div>

                {company.eisEligible && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">EIS Advance Assurance</span>
                    <Badge variant="outline">
                      {company.eisAdvanceAssuranceStatus || 'Not Applied'}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}