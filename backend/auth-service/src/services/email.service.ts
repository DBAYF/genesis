import nodemailer from 'nodemailer'
import { loadConfig } from '../config/loader'

// ============================================================================
// EMAIL SERVICE
// ============================================================================

export class EmailService {
  private config = loadConfig()
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: this.config.SMTP_HOST,
      port: this.config.SMTP_PORT,
      secure: this.config.SMTP_PORT === 465,
      auth: {
        user: this.config.SMTP_USER,
        pass: this.config.SMTP_PASS,
      },
    })
  }

  // ============================================================================
  // EMAIL VERIFICATION
  // ============================================================================

  async sendEmailVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${this.config.FRONTEND_URL}/verify-email?token=${token}`

    const mailOptions = {
      from: this.config.FROM_EMAIL,
      to: email,
      subject: 'Verify Your Email - Genesis Engine',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Genesis Engine!</h2>
          <p>Please verify your email address to complete your registration.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}"
               style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create an account, you can safely ignore this email.</p>
        </div>
      `,
      text: `
        Welcome to Genesis Engine!

        Please verify your email address by visiting: ${verificationUrl}

        This link will expire in 24 hours.

        If you didn't create an account, you can safely ignore this email.
      `,
    }

    await this.transporter.sendMail(mailOptions)
  }

  // ============================================================================
  // PASSWORD RESET
  // ============================================================================

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${this.config.FRONTEND_URL}/reset-password?token=${token}`

    const mailOptions = {
      from: this.config.FROM_EMAIL,
      to: email,
      subject: 'Reset Your Password - Genesis Engine',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>You requested a password reset for your Genesis Engine account.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}"
               style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p>This link will expire in 30 minutes.</p>
          <p>If you didn't request this reset, you can safely ignore this email.</p>
        </div>
      `,
      text: `
        Reset Your Password

        You requested a password reset for your Genesis Engine account.

        Visit this link to reset your password: ${resetUrl}

        This link will expire in 30 minutes.

        If you didn't request this reset, you can safely ignore this email.
      `,
    }

    await this.transporter.sendMail(mailOptions)
  }

  // ============================================================================
  // WELCOME EMAIL
  // ============================================================================

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    const mailOptions = {
      from: this.config.FROM_EMAIL,
      to: email,
      subject: 'Welcome to Genesis Engine!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Genesis Engine, ${firstName}!</h2>
          <p>Thank you for joining Genesis Engine. We're excited to help you build your startup journey.</p>
          <p>Here's what you can do next:</p>
          <ul>
            <li>Complete your company profile</li>
            <li>Explore our AI-powered tools</li>
            <li>Connect with investors and partners</li>
            <li>Access financial planning tools</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${this.config.FRONTEND_URL}/dashboard"
               style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Get Started
            </a>
          </div>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Best regards,<br>The Genesis Engine Team</p>
        </div>
      `,
      text: `
        Welcome to Genesis Engine, ${firstName}!

        Thank you for joining Genesis Engine. We're excited to help you build your startup journey.

        Visit ${this.config.FRONTEND_URL}/dashboard to get started.

        If you have any questions, feel free to reach out to our support team.

        Best regards,
        The Genesis Engine Team
      `,
    }

    await this.transporter.sendMail(mailOptions)
  }
}