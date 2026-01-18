// Firebase Auth Service
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  OAuthProvider,
  sendEmailVerification,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth'
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db, COLLECTIONS } from '../firebase-config'

export interface UserProfile {
  uid: string
  email: string
  firstName: string
  lastName: string
  phoneNumber?: string
  photoURL?: string
  emailVerified: boolean
  phoneVerified: boolean
  timezone: string
  locale: string
  onboardingCompleted: boolean
  companyId?: string
  role: 'user' | 'admin' | 'company_admin'
  createdAt: Date
  updatedAt: Date
}

export interface AuthResult {
  user: User
  profile: UserProfile
  token: string
}

export class FirebaseAuthService {
  // Sign up with email and password
  async signUp(email: string, password: string, firstName: string, lastName: string): Promise<AuthResult> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const { user } = userCredential

      // Create user profile
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        firstName,
        lastName,
        emailVerified: false,
        phoneVerified: false,
        timezone: 'Europe/London',
        locale: 'en-GB',
        onboardingCompleted: false,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Save to Firestore
      await setDoc(doc(db, COLLECTIONS.USERS, user.uid), userProfile)

      // Send email verification
      await sendEmailVerification(user)

      const token = await user.getIdToken()

      return {
        user,
        profile: userProfile,
        token
      }
    } catch (error: any) {
      throw new Error(`Sign up failed: ${error.message}`)
    }
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const { user } = userCredential

      // Get user profile
      const profile = await this.getUserProfile(user.uid)
      const token = await user.getIdToken()

      return {
        user,
        profile,
        token
      }
    } catch (error: any) {
      throw new Error(`Sign in failed: ${error.message}`)
    }
  }

  // Sign in with Google
  async signInWithGoogle(): Promise<AuthResult> {
    try {
      const provider = new GoogleAuthProvider()
      provider.addScope('email')
      provider.addScope('profile')

      const result = await signInWithPopup(auth, provider)
      const { user } = result

      // Check if user profile exists, create if not
      let profile = await this.getUserProfile(user.uid)

      if (!profile) {
        const names = user.displayName?.split(' ') || ['', '']
        profile = {
          uid: user.uid,
          email: user.email!,
          firstName: names[0] || '',
          lastName: names.slice(1).join(' ') || '',
          photoURL: user.photoURL || undefined,
          emailVerified: user.emailVerified,
          phoneVerified: false,
          timezone: 'Europe/London',
          locale: 'en-GB',
          onboardingCompleted: false,
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date()
        }

        await setDoc(doc(db, COLLECTIONS.USERS, user.uid), profile)
      }

      const token = await user.getIdToken()

      return {
        user,
        profile,
        token
      }
    } catch (error: any) {
      throw new Error(`Google sign in failed: ${error.message}`)
    }
  }

  // Sign in with LinkedIn
  async signInWithLinkedIn(): Promise<AuthResult> {
    try {
      const provider = new OAuthProvider('linkedin.com')
      provider.addScope('r_emailaddress')
      provider.addScope('r_liteprofile')

      const result = await signInWithPopup(auth, provider)
      const { user } = result

      // Check if user profile exists, create if not
      let profile = await this.getUserProfile(user.uid)

      if (!profile) {
        const names = user.displayName?.split(' ') || ['', '']
        profile = {
          uid: user.uid,
          email: user.email!,
          firstName: names[0] || '',
          lastName: names.slice(1).join(' ') || '',
          photoURL: user.photoURL || undefined,
          emailVerified: user.emailVerified,
          phoneVerified: false,
          timezone: 'Europe/London',
          locale: 'en-GB',
          onboardingCompleted: false,
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date()
        }

        await setDoc(doc(db, COLLECTIONS.USERS, user.uid), profile)
      }

      const token = await user.getIdToken()

      return {
        user,
        profile,
        token
      }
    } catch (error: any) {
      throw new Error(`LinkedIn sign in failed: ${error.message}`)
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await signOut(auth)
    } catch (error: any) {
      throw new Error(`Sign out failed: ${error.message}`)
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error: any) {
      throw new Error(`Password reset failed: ${error.message}`)
    }
  }

  // Update password
  async updatePassword(newPassword: string, currentPassword: string): Promise<void> {
    try {
      const user = auth.currentUser
      if (!user || !user.email) {
        throw new Error('No authenticated user')
      }

      // Reauthenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)

      // Update password
      await updatePassword(user, newPassword)
    } catch (error: any) {
      throw new Error(`Password update failed: ${error.message}`)
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<UserProfile>): Promise<void> {
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error('No authenticated user')
      }

      // Update Firebase Auth profile
      if (updates.firstName || updates.lastName || updates.photoURL) {
        await updateProfile(user, {
          displayName: `${updates.firstName} ${updates.lastName}`.trim(),
          photoURL: updates.photoURL
        })
      }

      // Update Firestore profile
      const profileRef = doc(db, COLLECTIONS.USERS, user.uid)
      await updateDoc(profileRef, {
        ...updates,
        updatedAt: new Date()
      })
    } catch (error: any) {
      throw new Error(`Profile update failed: ${error.message}`)
    }
  }

  // Get user profile
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const profileDoc = await getDoc(doc(db, COLLECTIONS.USERS, uid))
      if (profileDoc.exists()) {
        const data = profileDoc.data()
        return {
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as UserProfile
      }
      return null
    } catch (error: any) {
      throw new Error(`Failed to get user profile: ${error.message}`)
    }
  }

  // Get current user profile
  async getCurrentUserProfile(): Promise<UserProfile | null> {
    const user = auth.currentUser
    if (!user) return null
    return this.getUserProfile(user.uid)
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null, profile: UserProfile | null) => void) {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        const profile = await this.getUserProfile(user.uid)
        callback(user, profile)
      } else {
        callback(null, null)
      }
    })
  }

  // Verify email
  async verifyEmail(): Promise<void> {
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error('No authenticated user')
      }

      await sendEmailVerification(user)
    } catch (error: any) {
      throw new Error(`Email verification failed: ${error.message}`)
    }
  }

  // Refresh token
  async refreshToken(): Promise<string | null> {
    try {
      const user = auth.currentUser
      if (!user) return null

      return await user.getIdToken(true)
    } catch (error: any) {
      throw new Error(`Token refresh failed: ${error.message}`)
    }
  }
}

// Export singleton instance
export const firebaseAuthService = new FirebaseAuthService()