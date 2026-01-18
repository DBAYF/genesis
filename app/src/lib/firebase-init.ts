// Firebase initialization for the frontend
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getDatabase } from 'firebase/database'
import { getStorage } from 'firebase/storage'
import { connectAuthEmulator, connectFirestoreEmulator, connectDatabaseEmulator, connectStorageEmulator } from 'firebase/firestore'
import { config } from '@/config'

// Firebase configuration
const firebaseConfig = {
  apiKey: config.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: config.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: config.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: config.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: config.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: config.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: config.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  databaseURL: config.NEXT_PUBLIC_FIREBASE_DATABASE_URL
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const realtimeDb = getDatabase(app)
export const storage = getStorage(app)

// Use emulators in development
if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === 'true') {
  try {
    connectAuthEmulator(auth, 'http://localhost:9099')
    connectFirestoreEmulator(db, 'localhost', 8080)
    connectDatabaseEmulator(realtimeDb, 'localhost', 9000)
    connectStorageEmulator(storage, 'localhost', 9199)
    console.log('🔥 Firebase emulators connected')
  } catch (error) {
    console.warn('Firebase emulators already connected or failed to connect:', error)
  }
}

// Export the app for use in other Firebase services
export default app

// Initialize Lovable API service (for external integrations)
import { lovableAPIService } from '../../../lovable/lovable-api'

export { lovableAPIService }