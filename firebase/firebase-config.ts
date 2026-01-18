// Firebase Configuration for Genesis Engine
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getDatabase } from 'firebase/database'
import { getFunctions } from 'firebase/functions'

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export const realtimeDb = getDatabase(app)
export const functions = getFunctions(app)

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  COMPANIES: 'companies',
  COMPANY_MEMBERS: 'companyMembers',
  FINANCIAL_PROJECTIONS: 'financialProjections',
  TRANSACTIONS: 'transactions',
  COMPLIANCE_TASKS: 'complianceTasks',
  CRM_CONTACTS: 'crmContacts',
  CRM_DEALS: 'crmDeals',
  CALENDAR_EVENTS: 'calendarEvents',
  MESSAGES: 'messages',
  CONVERSATIONS: 'conversations',
  NOTIFICATIONS: 'notifications',
  AUDIT_LOGS: 'auditLogs',
  SETTINGS: 'settings',
  SUBSCRIPTIONS: 'subscriptions',
  INVOICES: 'invoices'
} as const

// Realtime database paths
export const REALTIME_PATHS = {
  PRESENCE: 'presence',
  TYPING: 'typing',
  NOTIFICATIONS: 'notifications',
  MESSAGES: 'messages'
} as const

export default app