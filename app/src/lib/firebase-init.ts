// Firebase initialization for the frontend
// This file provides a unified interface that switches between mock and real implementations

const useMockFirebase = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true'

// Create mock implementations
const mockAuth = {
  currentUser: null,
  onAuthStateChanged: (callback: Function) => {
    callback(null)
    return () => {}
  },
  signInWithEmailAndPassword: async () => {
    throw new Error('Use apiClient for auth')
  }
}

const mockDb = {
  collection: () => ({
    doc: () => ({
      get: async () => ({ exists: false, data: () => null }),
      set: async () => {},
      update: async () => {},
      delete: async () => {}
    }),
    get: async () => ({ docs: [] }),
    add: async () => ({ id: `mock-${Date.now()}` })
  })
}

const mockRealtimeDb = {
  ref: () => ({
    on: () => {},
    off: () => {},
    set: async () => {},
    push: () => ({ key: `mock-${Date.now()}` })
  })
}

const mockStorage = {
  ref: () => ({
    put: async () => ({ ref: { getDownloadURL: async () => 'mock-url' } }),
    getDownloadURL: async () => 'mock-url'
  })
}

const mockLovableAPIService = {
  executeRequest: async () => ({ success: true })
}

// Export the appropriate implementations
export const auth = useMockFirebase ? mockAuth : null
export const db = useMockFirebase ? mockDb : null
export const realtimeDb = useMockFirebase ? mockRealtimeDb : null
export const storage = useMockFirebase ? mockStorage : null
export const lovableAPIService = useMockFirebase ? mockLovableAPIService : null

if (useMockFirebase) {
  console.log('🎭 Mock Firebase initialized for prototyping')
}