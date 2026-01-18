'use client'

import { useEffect } from 'react'
import { MainLayout } from '@/components/layout/main-layout'
import { GenesisDashboard } from '@/components/genesis/genesis-dashboard'
import { usePhaseStore } from '@/stores/phases'
import { useCompanyStore } from '@/stores/company'
import { mockData } from '@/data/mockData'

export default function Dashboard() {
  const { currentCompany } = useCompanyStore()
  const { initializeForCompany, companyId } = usePhaseStore()

  const company = currentCompany || mockData.companies[0]

  // Initialize phase management for the company
  useEffect(() => {
    if (company.id && company.id !== companyId) {
      initializeForCompany(company.id)
    }
  }, [company.id, companyId, initializeForCompany])

  return (
    <MainLayout>
      <GenesisDashboard />
    </MainLayout>
  )
}