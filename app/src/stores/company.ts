import { create } from 'zustand'
import { Company, FinancialProjection, Transaction, Document, ComplianceTask } from '@/types'

interface CompanyState {
  currentCompany: Company | null
  companies: Company[]
  financialProjections: FinancialProjection[]
  transactions: Transaction[]
  documents: Document[]
  complianceTasks: ComplianceTask[]
  isLoading: boolean
}

interface CompanyActions {
  setCurrentCompany: (company: Company | null) => void
  addCompany: (company: Company) => void
  updateCompany: (id: string, updates: Partial<Company>) => void
  deleteCompany: (id: string) => void
  addFinancialProjection: (projection: FinancialProjection) => void
  updateFinancialProjection: (id: string, updates: Partial<FinancialProjection>) => void
  addTransaction: (transaction: Transaction) => void
  updateTransaction: (id: string, updates: Partial<Transaction>) => void
  addDocument: (document: Document) => void
  updateDocument: (id: string, updates: Partial<Document>) => void
  addComplianceTask: (task: ComplianceTask) => void
  updateComplianceTask: (id: string, updates: Partial<ComplianceTask>) => void
  setLoading: (loading: boolean) => void
}

type CompanyStore = CompanyState & CompanyActions

export const useCompanyStore = create<CompanyStore>((set, get) => ({
  // Initial state
  currentCompany: null,
  companies: [],
  financialProjections: [],
  transactions: [],
  documents: [],
  complianceTasks: [],
  isLoading: false,

  // Actions
  setCurrentCompany: (company: Company | null) => set({ currentCompany: company }),

  addCompany: (company: Company) =>
    set((state) => ({
      companies: [...state.companies, company],
    })),

  updateCompany: (id: string, updates: Partial<Company>) =>
    set((state) => ({
      companies: state.companies.map((c) =>
        c.id === id ? { ...c, ...updates } : c
      ),
      currentCompany: state.currentCompany?.id === id
        ? { ...state.currentCompany, ...updates }
        : state.currentCompany,
    })),

  deleteCompany: (id: string) =>
    set((state) => ({
      companies: state.companies.filter((c) => c.id !== id),
      currentCompany: state.currentCompany?.id === id ? null : state.currentCompany,
    })),

  addFinancialProjection: (projection: FinancialProjection) =>
    set((state) => ({
      financialProjections: [...state.financialProjections, projection],
    })),

  updateFinancialProjection: (id: string, updates: Partial<FinancialProjection>) =>
    set((state) => ({
      financialProjections: state.financialProjections.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),

  addTransaction: (transaction: Transaction) =>
    set((state) => ({
      transactions: [...state.transactions, transaction],
    })),

  updateTransaction: (id: string, updates: Partial<Transaction>) =>
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),

  addDocument: (document: Document) =>
    set((state) => ({
      documents: [...state.documents, document],
    })),

  updateDocument: (id: string, updates: Partial<Document>) =>
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      ),
    })),

  addComplianceTask: (task: ComplianceTask) =>
    set((state) => ({
      complianceTasks: [...state.complianceTasks, task],
    })),

  updateComplianceTask: (id: string, updates: Partial<ComplianceTask>) =>
    set((state) => ({
      complianceTasks: state.complianceTasks.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}))