// Firebase Company Service
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  writeBatch
} from 'firebase/firestore'
import { db, COLLECTIONS } from '../firebase-config'

export interface Company {
  id: string
  name: string
  type: 'llc' | 'plc' | 'ltd' | 'lp' | 'other'
  jurisdiction: string
  status: 'draft' | 'incorporating' | 'active' | 'dissolved'
  registeredAddress: Address
  businessAddress?: Address
  sicCode?: string
  incorporationDate?: Date
  registrationNumber?: string
  taxNumber?: string
  ownerId: string
  directors: Officer[]
  shareholders: Shareholder[]
  createdAt: Date
  updatedAt: Date
}

export interface Address {
  line1: string
  line2?: string
  city: string
  postcode: string
  country: string
}

export interface Officer {
  id: string
  firstName: string
  lastName: string
  position: 'director' | 'secretary' | 'ceo' | 'cfo' | 'other'
  email: string
  phone?: string
  address: Address
  appointedDate: Date
  resignedDate?: Date
}

export interface Shareholder {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  address: Address
  shareClass: string
  shares: number
  shareValue: number
  percentage: number
  joinedDate: Date
}

export interface CompanyMember {
  id: string
  userId: string
  companyId: string
  role: 'owner' | 'admin' | 'member'
  permissions: string[]
  joinedAt: Date
  invitedBy?: string
}

export class FirebaseCompanyService {
  // Create company
  async createCompany(companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<Company> {
    try {
      const companyId = `company_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const company: Company = {
        ...companyData,
        id: companyId,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Create company document
      await setDoc(doc(db, COLLECTIONS.COMPANIES, companyId), {
        ...company,
        createdAt: Timestamp.fromDate(company.createdAt),
        updatedAt: Timestamp.fromDate(company.updatedAt)
      })

      // Add owner as company member
      await this.addCompanyMember({
        userId: companyData.ownerId,
        companyId,
        role: 'owner',
        permissions: ['*'], // Full access
        joinedAt: new Date()
      })

      return company
    } catch (error: any) {
      throw new Error(`Failed to create company: ${error.message}`)
    }
  }

  // Get company by ID
  async getCompany(companyId: string): Promise<Company | null> {
    try {
      const companyDoc = await getDoc(doc(db, COLLECTIONS.COMPANIES, companyId))
      if (!companyDoc.exists()) return null

      const data = companyDoc.data()
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        incorporationDate: data.incorporationDate?.toDate(),
        directors: data.directors?.map((director: any) => ({
          ...director,
          appointedDate: director.appointedDate?.toDate(),
          resignedDate: director.resignedDate?.toDate()
        })),
        shareholders: data.shareholders?.map((shareholder: any) => ({
          ...shareholder,
          joinedDate: shareholder.joinedDate?.toDate()
        }))
      } as Company
    } catch (error: any) {
      throw new Error(`Failed to get company: ${error.message}`)
    }
  }

  // Update company
  async updateCompany(companyId: string, updates: Partial<Company>): Promise<void> {
    try {
      const updateData: any = {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date())
      }

      // Convert dates to Firestore timestamps
      if (updates.incorporationDate) {
        updateData.incorporationDate = Timestamp.fromDate(updates.incorporationDate)
      }

      if (updates.directors) {
        updateData.directors = updates.directors.map(director => ({
          ...director,
          appointedDate: Timestamp.fromDate(director.appointedDate),
          resignedDate: director.resignedDate ? Timestamp.fromDate(director.resignedDate) : null
        }))
      }

      if (updates.shareholders) {
        updateData.shareholders = updates.shareholders.map(shareholder => ({
          ...shareholder,
          joinedDate: Timestamp.fromDate(shareholder.joinedDate)
        }))
      }

      await updateDoc(doc(db, COLLECTIONS.COMPANIES, companyId), updateData)
    } catch (error: any) {
      throw new Error(`Failed to update company: ${error.message}`)
    }
  }

  // Delete company
  async deleteCompany(companyId: string): Promise<void> {
    try {
      const batch = writeBatch(db)

      // Delete company document
      batch.delete(doc(db, COLLECTIONS.COMPANIES, companyId))

      // Delete all company members
      const membersQuery = query(
        collection(db, COLLECTIONS.COMPANY_MEMBERS),
        where('companyId', '==', companyId)
      )
      const membersSnapshot = await getDocs(membersQuery)
      membersSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref)
      })

      await batch.commit()
    } catch (error: any) {
      throw new Error(`Failed to delete company: ${error.message}`)
    }
  }

  // List companies for user
  async getUserCompanies(userId: string): Promise<Company[]> {
    try {
      // Get company memberships
      const membershipsQuery = query(
        collection(db, COLLECTIONS.COMPANY_MEMBERS),
        where('userId', '==', userId)
      )
      const membershipsSnapshot = await getDocs(membershipsQuery)

      const companyIds = membershipsSnapshot.docs.map(doc => doc.data().companyId)

      if (companyIds.length === 0) return []

      // Get companies
      const companies: Company[] = []
      for (const companyId of companyIds) {
        const company = await this.getCompany(companyId)
        if (company) companies.push(company)
      }

      return companies
    } catch (error: any) {
      throw new Error(`Failed to get user companies: ${error.message}`)
    }
  }

  // Search companies
  async searchCompanies(searchTerm: string, limitCount: number = 20): Promise<Company[]> {
    try {
      const companiesQuery = query(
        collection(db, COLLECTIONS.COMPANIES),
        where('status', '==', 'active'),
        orderBy('name'),
        limit(limitCount)
      )

      const snapshot = await getDocs(companiesQuery)
      const companies: Company[] = []

      snapshot.docs.forEach(doc => {
        const data = doc.data()
        companies.push({
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          incorporationDate: data.incorporationDate?.toDate(),
          directors: data.directors?.map((director: any) => ({
            ...director,
            appointedDate: director.appointedDate?.toDate(),
            resignedDate: director.resignedDate?.toDate()
          })),
          shareholders: data.shareholders?.map((shareholder: any) => ({
            ...shareholder,
            joinedDate: shareholder.joinedDate?.toDate()
          }))
        } as Company)
      })

      return companies.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    } catch (error: any) {
      throw new Error(`Failed to search companies: ${error.message}`)
    }
  }

  // Company members management
  async addCompanyMember(memberData: Omit<CompanyMember, 'id'>): Promise<void> {
    try {
      const memberId = `member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const member: CompanyMember = {
        ...memberData,
        id: memberId
      }

      await setDoc(doc(db, COLLECTIONS.COMPANY_MEMBERS, memberId), {
        ...member,
        joinedAt: Timestamp.fromDate(member.joinedAt)
      })
    } catch (error: any) {
      throw new Error(`Failed to add company member: ${error.message}`)
    }
  }

  async getCompanyMembers(companyId: string): Promise<CompanyMember[]> {
    try {
      const membersQuery = query(
        collection(db, COLLECTIONS.COMPANY_MEMBERS),
        where('companyId', '==', companyId),
        orderBy('joinedAt')
      )

      const snapshot = await getDocs(membersQuery)
      return snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          ...data,
          joinedAt: data.joinedAt?.toDate() || new Date()
        } as CompanyMember
      })
    } catch (error: any) {
      throw new Error(`Failed to get company members: ${error.message}`)
    }
  }

  async updateCompanyMember(memberId: string, updates: Partial<CompanyMember>): Promise<void> {
    try {
      const updateData: any = { ...updates }
      if (updates.joinedAt) {
        updateData.joinedAt = Timestamp.fromDate(updates.joinedAt)
      }

      await updateDoc(doc(db, COLLECTIONS.COMPANY_MEMBERS, memberId), updateData)
    } catch (error: any) {
      throw new Error(`Failed to update company member: ${error.message}`)
    }
  }

  async removeCompanyMember(memberId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.COMPANY_MEMBERS, memberId))
    } catch (error: any) {
      throw new Error(`Failed to remove company member: ${error.message}`)
    }
  }

  // Company incorporation workflow
  async startIncorporation(companyId: string, incorporationData: {
    jurisdiction: string
    directors: Officer[]
    shareholders: Shareholder[]
  }): Promise<void> {
    try {
      await updateDoc(doc(db, COLLECTIONS.COMPANIES, companyId), {
        status: 'incorporating',
        jurisdiction: incorporationData.jurisdiction,
        directors: incorporationData.directors.map(director => ({
          ...director,
          appointedDate: Timestamp.fromDate(director.appointedDate),
          resignedDate: director.resignedDate ? Timestamp.fromDate(director.resignedDate) : null
        })),
        shareholders: incorporationData.shareholders.map(shareholder => ({
          ...shareholder,
          joinedDate: Timestamp.fromDate(shareholder.joinedDate)
        })),
        updatedAt: Timestamp.fromDate(new Date())
      })
    } catch (error: any) {
      throw new Error(`Failed to start incorporation: ${error.message}`)
    }
  }

  async completeIncorporation(companyId: string, registrationData: {
    registrationNumber: string
    incorporationDate: Date
    taxNumber?: string
  }): Promise<void> {
    try {
      await updateDoc(doc(db, COLLECTIONS.COMPANIES, companyId), {
        status: 'active',
        registrationNumber: registrationData.registrationNumber,
        incorporationDate: Timestamp.fromDate(registrationData.incorporationDate),
        taxNumber: registrationData.taxNumber,
        updatedAt: Timestamp.fromDate(new Date())
      })
    } catch (error: any) {
      throw new Error(`Failed to complete incorporation: ${error.message}`)
    }
  }
}

// Export singleton instance
export const firebaseCompanyService = new FirebaseCompanyService()