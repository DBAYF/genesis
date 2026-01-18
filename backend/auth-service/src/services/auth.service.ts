import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import { loadConfig } from '../config/loader'
import { prisma } from '../utils/prisma'
import {
  User,
  UserRole,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  VerifyEmailRequest,
  JWTPayload,
  RefreshTokenPayload,
} from '../types/auth'
import { EmailService } from './email.service'
import { RedisService } from './redis.service'

// ============================================================================
// AUTH SERVICE
// ============================================================================

export class AuthService {
  private config = loadConfig()
  private emailService = new EmailService()
  private redisService = new RedisService()

  // ============================================================================
  // USER REGISTRATION
  // ============================================================================

  async register(request: RegisterRequest): Promise<AuthResponse> {
    const { email, password, firstName, lastName, phone } = request

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      throw new Error('User already exists with this email')
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        phone,
        phoneVerified: false,
        emailVerified: false,
        role: UserRole.USER,
        isActive: true,
      },
    })

    // Send email verification
    await this.sendEmailVerification(user)

    // Generate tokens
    const tokens = await this.generateTokens(user)

    // Store refresh token
    await this.storeRefreshToken(user.id, tokens.refreshToken)

    return {
      user: this.sanitizeUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: this.getTokenExpirationTime(),
    }
  }

  // ============================================================================
  // USER LOGIN
  // ============================================================================

  async login(request: LoginRequest): Promise<AuthResponse> {
    const { email, password } = request

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user || !user.isActive) {
      throw new Error('Invalid credentials')
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    if (!isValidPassword) {
      throw new Error('Invalid credentials')
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    // Generate tokens
    const tokens = await this.generateTokens(user)

    // Store refresh token
    await this.storeRefreshToken(user.id, tokens.refreshToken)

    return {
      user: this.sanitizeUser(user),
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresIn: this.getTokenExpirationTime(),
    }
  }

  // ============================================================================
  // TOKEN REFRESH
  // ============================================================================

  async refreshToken(request: RefreshTokenRequest): Promise<AuthResponse> {
    const { refreshToken } = request

    try {
      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken,
        this.config.JWT_REFRESH_SECRET
      ) as RefreshTokenPayload

      // Check if refresh token exists in Redis
      const storedToken = await this.redisService.get(`refresh:${decoded.tokenId}`)
      if (!storedToken || storedToken !== refreshToken) {
        throw new Error('Invalid refresh token')
      }

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      })

      if (!user || !user.isActive) {
        throw new Error('User not found or inactive')
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user)

      // Remove old refresh token and store new one
      await this.redisService.del(`refresh:${decoded.tokenId}`)
      await this.storeRefreshToken(user.id, tokens.refreshToken)

      return {
        user: this.sanitizeUser(user),
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: this.getTokenExpirationTime(),
      }
    } catch (error) {
      throw new Error('Invalid refresh token')
    }
  }

  // ============================================================================
  // LOGOUT
  // ============================================================================

  async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      try {
        const decoded = jwt.verify(
          refreshToken,
          this.config.JWT_REFRESH_SECRET
        ) as RefreshTokenPayload

        await this.redisService.del(`refresh:${decoded.tokenId}`)
      } catch (error) {
        // Token might already be invalid, continue
      }
    }

    // Remove all refresh tokens for user
    const keys = await this.redisService.keys(`refresh:*`)
    for (const key of keys) {
      const token = await this.redisService.get(key)
      if (token) {
        try {
          const decoded = jwt.verify(
            token,
            this.config.JWT_REFRESH_SECRET
          ) as RefreshTokenPayload

          if (decoded.userId === userId) {
            await this.redisService.del(key)
          }
        } catch (error) {
          // Invalid token, remove it
          await this.redisService.del(key)
        }
      }
    }
  }

  // ============================================================================
  // PASSWORD RESET
  // ============================================================================

  async forgotPassword(request: ForgotPasswordRequest): Promise<void> {
    const { email } = request

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      // Don't reveal if email exists or not
      return
    }

    // Generate reset token
    const resetToken = uuidv4()
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes

    // Store reset token in Redis
    await this.redisService.setex(
      `reset:${resetToken}`,
      30 * 60, // 30 minutes
      JSON.stringify({
        userId: user.id,
        email: user.email,
        expiresAt: expiresAt.toISOString(),
      })
    )

    // Send reset email
    await this.emailService.sendPasswordResetEmail(user.email, resetToken)
  }

  async resetPassword(request: ResetPasswordRequest): Promise<void> {
    const { token, password } = request

    // Get reset token data
    const tokenDataStr = await this.redisService.get(`reset:${token}`)
    if (!tokenDataStr) {
      throw new Error('Invalid or expired reset token')
    }

    const tokenData = JSON.parse(tokenDataStr)
    const expiresAt = new Date(tokenData.expiresAt)

    if (expiresAt < new Date()) {
      await this.redisService.del(`reset:${token}`)
      throw new Error('Reset token expired')
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12)

    // Update user password
    await prisma.user.update({
      where: { id: tokenData.userId },
      data: { passwordHash },
    })

    // Remove reset token
    await this.redisService.del(`reset:${token}`)

    // Logout all sessions
    await this.logout(tokenData.userId)
  }

  // ============================================================================
  // PASSWORD CHANGE
  // ============================================================================

  async changePassword(userId: string, request: ChangePasswordRequest): Promise<void> {
    const { currentPassword, newPassword } = request

    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isValidPassword) {
      throw new Error('Current password is incorrect')
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12)

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    })

    // Logout all other sessions
    await this.logout(userId)
  }

  // ============================================================================
  // EMAIL VERIFICATION
  // ============================================================================

  async sendEmailVerification(user: User): Promise<void> {
    const verificationToken = uuidv4()

    // Store verification token in Redis
    await this.redisService.setex(
      `verify:${verificationToken}`,
      24 * 60 * 60, // 24 hours
      JSON.stringify({
        userId: user.id,
        email: user.email,
      })
    )

    // Send verification email
    await this.emailService.sendEmailVerificationEmail(user.email, verificationToken)
  }

  async verifyEmail(request: VerifyEmailRequest): Promise<void> {
    const { token } = request

    // Get verification token data
    const tokenDataStr = await this.redisService.get(`verify:${token}`)
    if (!tokenDataStr) {
      throw new Error('Invalid or expired verification token')
    }

    const tokenData = JSON.parse(tokenDataStr)

    // Update user email verification status
    await prisma.user.update({
      where: { id: tokenData.userId },
      data: { emailVerified: true },
    })

    // Remove verification token
    await this.redisService.del(`verify:${token}`)
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    }

    const accessToken = jwt.sign(payload, this.config.JWT_SECRET, {
      expiresIn: this.config.JWT_EXPIRES_IN,
    })

    const refreshTokenId = uuidv4()
    const refreshPayload: RefreshTokenPayload = {
      userId: user.id,
      tokenId: refreshTokenId,
    }

    const refreshToken = jwt.sign(refreshPayload, this.config.JWT_REFRESH_SECRET, {
      expiresIn: this.config.JWT_REFRESH_EXPIRES_IN,
    })

    return { accessToken, refreshToken }
  }

  private async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const decoded = jwt.verify(
      refreshToken,
      this.config.JWT_REFRESH_SECRET
    ) as RefreshTokenPayload

    // Store refresh token with 7 day expiration
    await this.redisService.setex(
      `refresh:${decoded.tokenId}`,
      7 * 24 * 60 * 60, // 7 days
      refreshToken
    )
  }

  private getTokenExpirationTime(): number {
    // Parse JWT_EXPIRES_IN to get seconds
    const expiresIn = this.config.JWT_EXPIRES_IN
    const match = expiresIn.match(/^(\d+)([smhd])$/)
    if (!match) return 900 // 15 minutes default

    const value = parseInt(match[1])
    const unit = match[2]

    switch (unit) {
      case 's': return value
      case 'm': return value * 60
      case 'h': return value * 60 * 60
      case 'd': return value * 60 * 60 * 24
      default: return 900
    }
  }

  private sanitizeUser(user: User): Omit<User, 'passwordHash'> {
    const { passwordHash, ...sanitizedUser } = user
    return sanitizedUser
  }
}