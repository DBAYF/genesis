import { PrismaClient } from '@prisma/client'
import {
  User,
  UserProfile,
  UserExperience,
  UserEducation,
  UserCertification,
  UserLanguage,
  UserPreferences,
  UserActivity,
  UserStats,
  UpdateUserRequest,
  UpdateUserProfileRequest,
  UpdateUserPreferencesRequest,
  UserService,
  UserSearchFilters
} from '../types/user'

export class UserServiceImpl implements UserService {
  constructor(private prisma: PrismaClient) {}

  // ============================================================================
  // USER CRUD OPERATIONS
  // ============================================================================

  async getUser(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id }
    })

    if (!user) return null

    return {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      phone: user.phone || undefined,
      phoneVerified: user.phoneVerified,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      avatarUrl: user.avatarUrl || undefined,
      timezone: user.timezone,
      locale: user.locale,
      onboardingCompleted: user.onboardingCompleted,
      onboardingStep: user.onboardingStep || undefined,
      pulseEnabled: user.pulseEnabled,
      pulsePreferredChannel: user.pulsePreferredChannel,
      pulseActiveHoursStart: user.pulseActiveHoursStart,
      pulseActiveHoursEnd: user.pulseActiveHoursEnd,
      pulseDigestTime: user.pulseDigestTime,
      status: user.status,
      lastActiveAt: user.lastActiveAt?.toISOString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email }
    })

    if (!user) return null

    return {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      phone: user.phone || undefined,
      phoneVerified: user.phoneVerified,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      avatarUrl: user.avatarUrl || undefined,
      timezone: user.timezone,
      locale: user.locale,
      onboardingCompleted: user.onboardingCompleted,
      onboardingStep: user.onboardingStep || undefined,
      pulseEnabled: user.pulseEnabled,
      pulsePreferredChannel: user.pulsePreferredChannel,
      pulseActiveHoursStart: user.pulseActiveHoursStart,
      pulseActiveHoursEnd: user.pulseActiveHoursEnd,
      pulseDigestTime: user.pulseDigestTime,
      status: user.status,
      lastActiveAt: user.lastActiveAt?.toISOString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    }
  }

  async updateUser(id: string, updates: UpdateUserRequest): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...updates,
        updatedAt: new Date()
      }
    })

    return {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      phone: user.phone || undefined,
      phoneVerified: user.phoneVerified,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      avatarUrl: user.avatarUrl || undefined,
      timezone: user.timezone,
      locale: user.locale,
      onboardingCompleted: user.onboardingCompleted,
      onboardingStep: user.onboardingStep || undefined,
      pulseEnabled: user.pulseEnabled,
      pulsePreferredChannel: user.pulsePreferredChannel,
      pulseActiveHoursStart: user.pulseActiveHoursStart,
      pulseActiveHoursEnd: user.pulseActiveHoursEnd,
      pulseDigestTime: user.pulseDigestTime,
      status: user.status,
      lastActiveAt: user.lastActiveAt?.toISOString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    }
  }

  async deleteUser(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        status: 'deleted',
        updatedAt: new Date()
      }
    })
  }

  // ============================================================================
  // USER PROFILE MANAGEMENT
  // ============================================================================

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
      include: {
        experiences: true,
        education: true,
        certifications: true,
        languages: true
      }
    })

    if (!profile) return null

    return {
      id: profile.id,
      userId: profile.userId,
      bio: profile.bio || undefined,
      location: profile.location || undefined,
      website: profile.website || undefined,
      linkedinUrl: profile.linkedinUrl || undefined,
      twitterUrl: profile.twitterUrl || undefined,
      githubUrl: profile.githubUrl || undefined,
      skills: profile.skills,
      interests: profile.interests,
      experience: profile.experiences.map(exp => ({
        id: exp.id,
        userId: exp.userId,
        companyName: exp.companyName,
        position: exp.position,
        description: exp.description || undefined,
        startDate: exp.startDate.toISOString(),
        endDate: exp.endDate?.toISOString(),
        isCurrent: exp.isCurrent,
        location: exp.location || undefined,
        createdAt: exp.createdAt.toISOString(),
        updatedAt: exp.updatedAt.toISOString()
      })),
      education: profile.education.map(edu => ({
        id: edu.id,
        userId: edu.userId,
        institution: edu.institution,
        degree: edu.degree,
        fieldOfStudy: edu.fieldOfStudy || undefined,
        startDate: edu.startDate.toISOString(),
        endDate: edu.endDate?.toISOString(),
        grade: edu.grade || undefined,
        activities: edu.activities || undefined,
        createdAt: edu.createdAt.toISOString(),
        updatedAt: edu.updatedAt.toISOString()
      })),
      certifications: profile.certifications.map(cert => ({
        id: cert.id,
        userId: cert.userId,
        name: cert.name,
        issuer: cert.issuer,
        issueDate: cert.issueDate.toISOString(),
        expiryDate: cert.expiryDate?.toISOString(),
        credentialId: cert.credentialId || undefined,
        credentialUrl: cert.credentialUrl || undefined,
        createdAt: cert.createdAt.toISOString(),
        updatedAt: cert.updatedAt.toISOString()
      })),
      languages: profile.languages.map(lang => ({
        id: lang.id,
        userId: lang.userId,
        language: lang.language,
        proficiency: lang.proficiency,
        createdAt: lang.createdAt.toISOString(),
        updatedAt: lang.updatedAt.toISOString()
      })),
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString()
    }
  }

  async createUserProfile(
    userId: string,
    profileData: Omit<UserProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<UserProfile> {
    const profile = await this.prisma.userProfile.create({
      data: {
        userId,
        ...profileData
      },
      include: {
        experiences: true,
        education: true,
        certifications: true,
        languages: true
      }
    })

    return {
      id: profile.id,
      userId: profile.userId,
      bio: profile.bio || undefined,
      location: profile.location || undefined,
      website: profile.website || undefined,
      linkedinUrl: profile.linkedinUrl || undefined,
      twitterUrl: profile.twitterUrl || undefined,
      githubUrl: profile.githubUrl || undefined,
      skills: profile.skills,
      interests: profile.interests,
      experience: profile.experiences.map(exp => ({
        id: exp.id,
        userId: exp.userId,
        companyName: exp.companyName,
        position: exp.position,
        description: exp.description || undefined,
        startDate: exp.startDate.toISOString(),
        endDate: exp.endDate?.toISOString(),
        isCurrent: exp.isCurrent,
        location: exp.location || undefined,
        createdAt: exp.createdAt.toISOString(),
        updatedAt: exp.updatedAt.toISOString()
      })),
      education: profile.education.map(edu => ({
        id: edu.id,
        userId: edu.userId,
        institution: edu.institution,
        degree: edu.degree,
        fieldOfStudy: edu.fieldOfStudy || undefined,
        startDate: edu.startDate.toISOString(),
        endDate: edu.endDate?.toISOString(),
        grade: edu.grade || undefined,
        activities: edu.activities || undefined,
        createdAt: edu.createdAt.toISOString(),
        updatedAt: edu.updatedAt.toISOString()
      })),
      certifications: profile.certifications.map(cert => ({
        id: cert.id,
        userId: cert.userId,
        name: cert.name,
        issuer: cert.issuer,
        issueDate: cert.issueDate.toISOString(),
        expiryDate: cert.expiryDate?.toISOString(),
        credentialId: cert.credentialId || undefined,
        credentialUrl: cert.credentialUrl || undefined,
        createdAt: cert.createdAt.toISOString(),
        updatedAt: cert.updatedAt.toISOString()
      })),
      languages: profile.languages.map(lang => ({
        id: lang.id,
        userId: lang.userId,
        language: lang.language,
        proficiency: lang.proficiency,
        createdAt: lang.createdAt.toISOString(),
        updatedAt: lang.updatedAt.toISOString()
      })),
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString()
    }
  }

  async updateUserProfile(userId: string, updates: UpdateUserProfileRequest): Promise<UserProfile> {
    const profile = await this.prisma.userProfile.update({
      where: { userId },
      data: {
        ...updates,
        updatedAt: new Date()
      },
      include: {
        experiences: true,
        education: true,
        certifications: true,
        languages: true
      }
    })

    return {
      id: profile.id,
      userId: profile.userId,
      bio: profile.bio || undefined,
      location: profile.location || undefined,
      website: profile.website || undefined,
      linkedinUrl: profile.linkedinUrl || undefined,
      twitterUrl: profile.twitterUrl || undefined,
      githubUrl: profile.githubUrl || undefined,
      skills: profile.skills,
      interests: profile.interests,
      experience: profile.experiences.map(exp => ({
        id: exp.id,
        userId: exp.userId,
        companyName: exp.companyName,
        position: exp.position,
        description: exp.description || undefined,
        startDate: exp.startDate.toISOString(),
        endDate: exp.endDate?.toISOString(),
        isCurrent: exp.isCurrent,
        location: exp.location || undefined,
        createdAt: exp.createdAt.toISOString(),
        updatedAt: exp.updatedAt.toISOString()
      })),
      education: profile.education.map(edu => ({
        id: edu.id,
        userId: edu.userId,
        institution: edu.institution,
        degree: edu.degree,
        fieldOfStudy: edu.fieldOfStudy || undefined,
        startDate: edu.startDate.toISOString(),
        endDate: edu.endDate?.toISOString(),
        grade: edu.grade || undefined,
        activities: edu.activities || undefined,
        createdAt: edu.createdAt.toISOString(),
        updatedAt: edu.updatedAt.toISOString()
      })),
      certifications: profile.certifications.map(cert => ({
        id: cert.id,
        userId: cert.userId,
        name: cert.name,
        issuer: cert.issuer,
        issueDate: cert.issueDate.toISOString(),
        expiryDate: cert.expiryDate?.toISOString(),
        credentialId: cert.credentialId || undefined,
        credentialUrl: cert.credentialUrl || undefined,
        createdAt: cert.createdAt.toISOString(),
        updatedAt: cert.updatedAt.toISOString()
      })),
      languages: profile.languages.map(lang => ({
        id: lang.id,
        userId: lang.userId,
        language: lang.language,
        proficiency: lang.proficiency,
        createdAt: lang.createdAt.toISOString(),
        updatedAt: lang.updatedAt.toISOString()
      })),
      createdAt: profile.createdAt.toISOString(),
      updatedAt: profile.updatedAt.toISOString()
    }
  }

  // ============================================================================
  // EXPERIENCE MANAGEMENT
  // ============================================================================

  async addUserExperience(
    userId: string,
    experience: Omit<UserExperience, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<UserExperience> {
    const exp = await this.prisma.userExperience.create({
      data: {
        userId,
        ...experience
      }
    })

    return {
      id: exp.id,
      userId: exp.userId,
      companyName: exp.companyName,
      position: exp.position,
      description: exp.description || undefined,
      startDate: exp.startDate.toISOString(),
      endDate: exp.endDate?.toISOString(),
      isCurrent: exp.isCurrent,
      location: exp.location || undefined,
      createdAt: exp.createdAt.toISOString(),
      updatedAt: exp.updatedAt.toISOString()
    }
  }

  async updateUserExperience(id: string, updates: Partial<UserExperience>): Promise<UserExperience> {
    const exp = await this.prisma.userExperience.update({
      where: { id },
      data: {
        ...updates,
        updatedAt: new Date()
      }
    })

    return {
      id: exp.id,
      userId: exp.userId,
      companyName: exp.companyName,
      position: exp.position,
      description: exp.description || undefined,
      startDate: exp.startDate.toISOString(),
      endDate: exp.endDate?.toISOString(),
      isCurrent: exp.isCurrent,
      location: exp.location || undefined,
      createdAt: exp.createdAt.toISOString(),
      updatedAt: exp.updatedAt.toISOString()
    }
  }

  async deleteUserExperience(id: string): Promise<void> {
    await this.prisma.userExperience.delete({
      where: { id }
    })
  }

  async getUserExperiences(userId: string): Promise<UserExperience[]> {
    const experiences = await this.prisma.userExperience.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' }
    })

    return experiences.map(exp => ({
      id: exp.id,
      userId: exp.userId,
      companyName: exp.companyName,
      position: exp.position,
      description: exp.description || undefined,
      startDate: exp.startDate.toISOString(),
      endDate: exp.endDate?.toISOString(),
      isCurrent: exp.isCurrent,
      location: exp.location || undefined,
      createdAt: exp.createdAt.toISOString(),
      updatedAt: exp.updatedAt.toISOString()
    }))
  }

  // ============================================================================
  // EDUCATION MANAGEMENT
  // ============================================================================

  async addUserEducation(
    userId: string,
    education: Omit<UserEducation, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<UserEducation> {
    const edu = await this.prisma.userEducation.create({
      data: {
        userId,
        ...education
      }
    })

    return {
      id: edu.id,
      userId: edu.userId,
      institution: edu.institution,
      degree: edu.degree,
      fieldOfStudy: edu.fieldOfStudy || undefined,
      startDate: edu.startDate.toISOString(),
      endDate: edu.endDate?.toISOString(),
      grade: edu.grade || undefined,
      activities: edu.activities || undefined,
      createdAt: edu.createdAt.toISOString(),
      updatedAt: edu.updatedAt.toISOString()
    }
  }

  async updateUserEducation(id: string, updates: Partial<UserEducation>): Promise<UserEducation> {
    const edu = await this.prisma.userEducation.update({
      where: { id },
      data: {
        ...updates,
        updatedAt: new Date()
      }
    })

    return {
      id: edu.id,
      userId: edu.userId,
      institution: edu.institution,
      degree: edu.degree,
      fieldOfStudy: edu.fieldOfStudy || undefined,
      startDate: edu.startDate.toISOString(),
      endDate: edu.endDate?.toISOString(),
      grade: edu.grade || undefined,
      activities: edu.activities || undefined,
      createdAt: edu.createdAt.toISOString(),
      updatedAt: edu.updatedAt.toISOString()
    }
  }

  async deleteUserEducation(id: string): Promise<void> {
    await this.prisma.userEducation.delete({
      where: { id }
    })
  }

  async getUserEducation(userId: string): Promise<UserEducation[]> {
    const education = await this.prisma.userEducation.findMany({
      where: { userId },
      orderBy: { startDate: 'desc' }
    })

    return education.map(edu => ({
      id: edu.id,
      userId: edu.userId,
      institution: edu.institution,
      degree: edu.degree,
      fieldOfStudy: edu.fieldOfStudy || undefined,
      startDate: edu.startDate.toISOString(),
      endDate: edu.endDate?.toISOString(),
      grade: edu.grade || undefined,
      activities: edu.activities || undefined,
      createdAt: edu.createdAt.toISOString(),
      updatedAt: edu.updatedAt.toISOString()
    }))
  }

  // ============================================================================
  // CERTIFICATION MANAGEMENT
  // ============================================================================

  async addUserCertification(
    userId: string,
    certification: Omit<UserCertification, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<UserCertification> {
    const cert = await this.prisma.userCertification.create({
      data: {
        userId,
        ...certification
      }
    })

    return {
      id: cert.id,
      userId: cert.userId,
      name: cert.name,
      issuer: cert.issuer,
      issueDate: cert.issueDate.toISOString(),
      expiryDate: cert.expiryDate?.toISOString(),
      credentialId: cert.credentialId || undefined,
      credentialUrl: cert.credentialUrl || undefined,
      createdAt: cert.createdAt.toISOString(),
      updatedAt: cert.updatedAt.toISOString()
    }
  }

  async updateUserCertification(id: string, updates: Partial<UserCertification>): Promise<UserCertification> {
    const cert = await this.prisma.userCertification.update({
      where: { id },
      data: {
        ...updates,
        updatedAt: new Date()
      }
    })

    return {
      id: cert.id,
      userId: cert.userId,
      name: cert.name,
      issuer: cert.issuer,
      issueDate: cert.issueDate.toISOString(),
      expiryDate: cert.expiryDate?.toISOString(),
      credentialId: cert.credentialId || undefined,
      credentialUrl: cert.credentialUrl || undefined,
      createdAt: cert.createdAt.toISOString(),
      updatedAt: cert.updatedAt.toISOString()
    }
  }

  async deleteUserCertification(id: string): Promise<void> {
    await this.prisma.userCertification.delete({
      where: { id }
    })
  }

  async getUserCertifications(userId: string): Promise<UserCertification[]> {
    const certifications = await this.prisma.userCertification.findMany({
      where: { userId },
      orderBy: { issueDate: 'desc' }
    })

    return certifications.map(cert => ({
      id: cert.id,
      userId: cert.userId,
      name: cert.name,
      issuer: cert.issuer,
      issueDate: cert.issueDate.toISOString(),
      expiryDate: cert.expiryDate?.toISOString(),
      credentialId: cert.credentialId || undefined,
      credentialUrl: cert.credentialUrl || undefined,
      createdAt: cert.createdAt.toISOString(),
      updatedAt: cert.updatedAt.toISOString()
    }))
  }

  // ============================================================================
  // LANGUAGE MANAGEMENT
  // ============================================================================

  async addUserLanguage(
    userId: string,
    language: Omit<UserLanguage, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<UserLanguage> {
    const lang = await this.prisma.userLanguage.create({
      data: {
        userId,
        ...language
      }
    })

    return {
      id: lang.id,
      userId: lang.userId,
      language: lang.language,
      proficiency: lang.proficiency,
      createdAt: lang.createdAt.toISOString(),
      updatedAt: lang.updatedAt.toISOString()
    }
  }

  async updateUserLanguage(id: string, updates: Partial<UserLanguage>): Promise<UserLanguage> {
    const lang = await this.prisma.userLanguage.update({
      where: { id },
      data: {
        ...updates,
        updatedAt: new Date()
      }
    })

    return {
      id: lang.id,
      userId: lang.userId,
      language: lang.language,
      proficiency: lang.proficiency,
      createdAt: lang.createdAt.toISOString(),
      updatedAt: lang.updatedAt.toISOString()
    }
  }

  async deleteUserLanguage(id: string): Promise<void> {
    await this.prisma.userLanguage.delete({
      where: { id }
    })
  }

  async getUserLanguages(userId: string): Promise<UserLanguage[]> {
    const languages = await this.prisma.userLanguage.findMany({
      where: { userId },
      orderBy: { language: 'asc' }
    })

    return languages.map(lang => ({
      id: lang.id,
      userId: lang.userId,
      language: lang.language,
      proficiency: lang.proficiency,
      createdAt: lang.createdAt.toISOString(),
      updatedAt: lang.updatedAt.toISOString()
    }))
  }

  // ============================================================================
  // USER PREFERENCES
  // ============================================================================

  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    const prefs = await this.prisma.userPreferences.findUnique({
      where: { userId }
    })

    if (!prefs) return null

    return {
      id: prefs.id,
      userId: prefs.userId,
      theme: prefs.theme,
      language: prefs.language,
      timezone: prefs.timezone,
      dateFormat: prefs.dateFormat,
      currency: prefs.currency,
      notificationSettings: prefs.notificationSettings as any,
      privacySettings: prefs.privacySettings as any,
      createdAt: prefs.createdAt.toISOString(),
      updatedAt: prefs.updatedAt.toISOString()
    }
  }

  async updateUserPreferences(userId: string, updates: UpdateUserPreferencesRequest): Promise<UserPreferences> {
    const prefs = await this.prisma.userPreferences.upsert({
      where: { userId },
      update: {
        ...updates,
        updatedAt: new Date()
      },
      create: {
        userId,
        theme: updates.theme || 'system',
        language: updates.language || 'en',
        timezone: updates.timezone || 'UTC',
        dateFormat: updates.dateFormat || 'DD/MM/YYYY',
        currency: updates.currency || 'GBP',
        notificationSettings: updates.notificationSettings || {
          email: true,
          sms: false,
          push: true,
          marketing: false,
          productUpdates: true,
          securityAlerts: true,
          weeklyDigest: true
        },
        privacySettings: updates.privacySettings || {
          profileVisibility: 'public',
          showEmail: false,
          showPhone: false,
          showLocation: true,
          allowMessaging: true,
          allowConnections: true
        }
      }
    })

    return {
      id: prefs.id,
      userId: prefs.userId,
      theme: prefs.theme,
      language: prefs.language,
      timezone: prefs.timezone,
      dateFormat: prefs.dateFormat,
      currency: prefs.currency,
      notificationSettings: prefs.notificationSettings as any,
      privacySettings: prefs.privacySettings as any,
      createdAt: prefs.createdAt.toISOString(),
      updatedAt: prefs.updatedAt.toISOString()
    }
  }

  // ============================================================================
  // ACTIVITY TRACKING
  // ============================================================================

  async logUserActivity(activity: Omit<UserActivity, 'id' | 'createdAt'>): Promise<void> {
    await this.prisma.userActivity.create({
      data: activity
    })
  }

  async getUserActivity(userId: string, limit: number = 50): Promise<UserActivity[]> {
    const activities = await this.prisma.userActivity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    return activities.map(activity => ({
      id: activity.id,
      userId: activity.userId,
      action: activity.action,
      resourceType: activity.resourceType,
      resourceId: activity.resourceId,
      metadata: activity.metadata as any,
      ipAddress: activity.ipAddress,
      userAgent: activity.userAgent,
      createdAt: activity.createdAt.toISOString()
    }))
  }

  // ============================================================================
  // USER STATS
  // ============================================================================

  async getUserStats(userId: string): Promise<UserStats> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        createdAt: true,
        lastActiveAt: true,
        _count: {
          select: {
            connections: true,
            projects: true,
            messages: true
          }
        }
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Calculate profile completeness
    const profile = await this.prisma.userProfile.findUnique({
      where: { userId },
      select: {
        bio: true,
        location: true,
        skills: true,
        experiences: { select: { id: true } },
        education: { select: { id: true } }
      }
    })

    let completeness = 0
    if (profile) {
      if (profile.bio) completeness += 20
      if (profile.location) completeness += 15
      if (profile.skills.length > 0) completeness += 20
      if (profile.experiences.length > 0) completeness += 25
      if (profile.education.length > 0) completeness += 20
    }

    const accountAge = Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24))

    return {
      totalConnections: user._count.connections,
      totalProjects: user._count.projects,
      totalMessages: user._count.messages,
      profileCompleteness: completeness,
      lastActiveAt: user.lastActiveAt?.toISOString() || user.createdAt.toISOString(),
      accountAge
    }
  }

  // ============================================================================
  // SEARCH AND DISCOVERY
  // ============================================================================

  async searchUsers(query: string, filters?: UserSearchFilters): Promise<User[]> {
    const where: any = {
      status: 'active'
    }

    if (query) {
      where.OR = [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } }
      ]
    }

    if (filters) {
      if (filters.skills && filters.skills.length > 0) {
        where.profile = {
          skills: { hasSome: filters.skills }
        }
      }
      if (filters.location) {
        where.profile = {
          ...where.profile,
          location: { contains: filters.location, mode: 'insensitive' }
        }
      }
    }

    const users = await this.prisma.user.findMany({
      where,
      include: {
        profile: true
      },
      take: 50
    })

    return users.map(user => ({
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      phone: user.phone || undefined,
      phoneVerified: user.phoneVerified,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      avatarUrl: user.avatarUrl || undefined,
      timezone: user.timezone,
      locale: user.locale,
      onboardingCompleted: user.onboardingCompleted,
      onboardingStep: user.onboardingStep || undefined,
      pulseEnabled: user.pulseEnabled,
      pulsePreferredChannel: user.pulsePreferredChannel,
      pulseActiveHoursStart: user.pulseActiveHoursStart,
      pulseActiveHoursEnd: user.pulseActiveHoursEnd,
      pulseDigestTime: user.pulseDigestTime,
      status: user.status,
      lastActiveAt: user.lastActiveAt?.toISOString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    }))
  }

  async getRecommendedConnections(userId: string, limit: number = 10): Promise<User[]> {
    // Simple recommendation based on shared skills and location
    const userProfile = await this.prisma.userProfile.findUnique({
      where: { userId },
      select: { skills: true, location: true }
    })

    if (!userProfile) return []

    const recommended = await this.prisma.user.findMany({
      where: {
        id: { not: userId },
        status: 'active',
        profile: {
          OR: [
            { skills: { hasSome: userProfile.skills } },
            { location: userProfile.location ? { contains: userProfile.location.split(',')[0] } : undefined }
          ]
        }
      },
      include: { profile: true },
      take: limit
    })

    return recommended.map(user => ({
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      phone: user.phone || undefined,
      phoneVerified: user.phoneVerified,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      avatarUrl: user.avatarUrl || undefined,
      timezone: user.timezone,
      locale: user.locale,
      onboardingCompleted: user.onboardingCompleted,
      onboardingStep: user.onboardingStep || undefined,
      pulseEnabled: user.pulseEnabled,
      pulsePreferredChannel: user.pulsePreferredChannel,
      pulseActiveHoursStart: user.pulseActiveHoursStart,
      pulseActiveHoursEnd: user.pulseActiveHoursEnd,
      pulseDigestTime: user.pulseDigestTime,
      status: user.status,
      lastActiveAt: user.lastActiveAt?.toISOString(),
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString()
    }))
  }
}