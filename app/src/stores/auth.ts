import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
  setUser: (user: User) => void
  setToken: (token: string) => void
  setError: (error: string | null) => void
  setLoading: (loading: boolean) => void
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        try {
          // Mock login - in real app this would call API
          await new Promise(resolve => setTimeout(resolve, 1000))

          const mockUser: User = {
            id: 'user-1',
            email,
            emailVerified: true,
            phoneVerified: false,
            firstName: 'John',
            lastName: 'Doe',
            timezone: 'Europe/London',
            locale: 'en-GB',
            onboardingCompleted: true,
            pulseEnabled: true,
            pulsePreferredChannel: 'whatsapp',
            pulseActiveHoursStart: '08:00',
            pulseActiveHoursEnd: '22:00',
            pulseDigestTime: '07:00',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }

          const mockToken = 'mock-jwt-token'

          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({
            error: 'Login failed',
            isLoading: false,
          })
        }
      },

      register: async (userData: any) => {
        set({ isLoading: true, error: null })
        try {
          // Mock registration
          await new Promise(resolve => setTimeout(resolve, 1500))

          const mockUser: User = {
            id: 'user-' + Date.now(),
            email: userData.email,
            emailVerified: false,
            phoneVerified: false,
            firstName: userData.firstName,
            lastName: userData.lastName,
            timezone: 'Europe/London',
            locale: 'en-GB',
            onboardingCompleted: false,
            pulseEnabled: true,
            pulsePreferredChannel: 'whatsapp',
            pulseActiveHoursStart: '08:00',
            pulseActiveHoursEnd: '22:00',
            pulseDigestTime: '07:00',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }

          const mockToken = 'mock-jwt-token'

          set({
            user: mockUser,
            token: mockToken,
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          set({
            error: 'Registration failed',
            isLoading: false,
          })
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        })
      },

      refreshToken: async () => {
        // Mock token refresh
        await new Promise(resolve => setTimeout(resolve, 500))
        // In real app, this would call refresh endpoint
      },

      setUser: (user: User) => set({ user }),
      setToken: (token: string) => set({ token, isAuthenticated: true }),
      setError: (error: string | null) => set({ error }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'genesis-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)