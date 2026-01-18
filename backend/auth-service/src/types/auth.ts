// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  phoneVerified: boolean
  emailVerified: boolean
  passwordHash: string
  role: UserRole
  isActive: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  PREMIUM = 'PREMIUM',
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
}

export interface AuthResponse {
  user: Omit<User, 'passwordHash'>
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface RefreshTokenRequest {
  refreshToken: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  token: string
  password: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface VerifyEmailRequest {
  token: string
}

// ============================================================================
// TOKEN TYPES
// ============================================================================

export interface JWTPayload {
  userId: string
  email: string
  role: UserRole
  iat?: number
  exp?: number
}

export interface RefreshTokenPayload {
  userId: string
  tokenId: string
  iat?: number
  exp?: number
}

// ============================================================================
// EMAIL TYPES
// ============================================================================

export interface EmailVerificationToken {
  userId: string
  email: string
  expiresAt: Date
}

export interface PasswordResetToken {
  userId: string
  email: string
  expiresAt: Date
}