// ============================================================================
// GENESIS ENGINE - API CLIENT SWITCHER
// ============================================================================

import { firebaseAPI } from './firebase-api'
import { mockFirebaseAPI } from './mock-firebase-api'

// Determine which API client to use based on environment
const isDevelopment = process.env.NODE_ENV === 'development'
const useMockAPI = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true' || isDevelopment

// Export the appropriate API client
export const apiClient = useMockAPI ? mockFirebaseAPI : firebaseAPI

// Re-export for backward compatibility
export default apiClient