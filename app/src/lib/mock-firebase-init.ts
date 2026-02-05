// Mock Firebase initialization for development/prototyping
// This file provides mock Firebase services without requiring real Firebase credentials

// Mock Firebase Auth
export const auth = {
  currentUser: null,
  onAuthStateChanged: (callback: Function) => {
    // Mock auth state - always return null (not authenticated)
    callback(null)
    return () => {} // unsubscribe function
  },
  signInWithEmailAndPassword: async () => {
    throw new Error('Mock Firebase Auth: Use apiClient instead')
  },
  createUserWithEmailAndPassword: async () => {
    throw new Error('Mock Firebase Auth: Use apiClient instead')
  },
  signOut: async () => {
    throw new Error('Mock Firebase Auth: Use apiClient instead')
  }
}

// Mock Firestore
export const db = {
  collection: () => ({
    doc: () => ({
      get: async () => ({ exists: false, data: () => null }),
      set: async () => {},
      update: async () => {},
      delete: async () => {}
    }),
    where: () => ({
      get: async () => ({ docs: [] })
    }),
    get: async () => ({ docs: [] }),
    add: async () => ({ id: `mock-${Date.now()}` })
  })
}

// Mock Realtime Database
export const realtimeDb = {
  ref: () => ({
    on: () => {},
    off: () => {},
    set: async () => {},
    push: () => ({ key: `mock-${Date.now()}` }),
    remove: async () => {}
  })
}

// Mock Storage
export const storage = {
  ref: () => ({
    put: async () => ({ ref: { getDownloadURL: async () => 'mock-url' } }),
    getDownloadURL: async () => 'mock-url'
  })
}

// Mock Lovable API service
export const lovableAPIService = {
  executeRequest: async () => {
    throw new Error('Mock Lovable API: Not implemented for prototyping')
  }
}

console.log('🎭 Mock Firebase initialized for prototyping')