export interface User {
  id: string
  email: string
  emailVerified: boolean
  phone?: string
  phoneVerified: boolean
  firstName?: string
  lastName?: string
  avatarUrl?: string
  timezone: string
  locale: string
  onboardingCompleted: boolean
  onboardingStep?: string
  pulseEnabled: boolean
  pulsePreferredChannel: 'sms' | 'whatsapp' | 'telegram' | 'email'
  pulseActiveHoursStart: string
  pulseActiveHoursEnd: string
  pulseDigestTime: string
  status: 'active' | 'suspended' | 'deleted'
  lastActiveAt?: string
  createdAt: string
  updatedAt: string
}

export interface UserProfile {
  id: string
  userId: string
  bio?: string
  location?: string
  website?: string
  linkedinUrl?: string
  twitterUrl?: string
  githubUrl?: string
  skills: string[]
  interests: string[]
  experience: UserExperience[]
  education: UserEducation[]
  certifications: UserCertification[]
  languages: UserLanguage[]
  createdAt: string
  updatedAt: string
}

export interface UserExperience {
  id: string
  userId: string
  companyName: string
  position: string
  description?: string
  startDate: string
  endDate?: string
  isCurrent: boolean
  location?: string
  createdAt: string
  updatedAt: string
}

export interface UserEducation {
  id: string
  userId: string
  institution: string
  degree: string
  fieldOfStudy?: string
  startDate: string
  endDate?: string
  grade?: string
  activities?: string
  createdAt: string
  updatedAt: string
}

export interface UserCertification {
  id: string
  userId: string
  name: string
  issuer: string
  issueDate: string
  expiryDate?: string
  credentialId?: string
  credentialUrl?: string
  createdAt: string
  updatedAt: string
}

export interface UserLanguage {
  id: string
  userId: string
  language: string
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'native'
  createdAt: string
  updatedAt: string
}

export interface UserPreferences {
  id: string
  userId: string
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  dateFormat: string
  currency: string
  notificationSettings: NotificationSettings
  privacySettings: PrivacySettings
  createdAt: string
  updatedAt: string
}

export interface NotificationSettings {
  email: boolean
  sms: boolean
  push: boolean
  marketing: boolean
  productUpdates: boolean
  securityAlerts: boolean
  weeklyDigest: boolean
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'connections'
  showEmail: boolean
  showPhone: boolean
  showLocation: boolean
  allowMessaging: boolean
  allowConnections: boolean
}

export interface UserActivity {
  id: string
  userId: string
  action: string
  resourceType: string
  resourceId: string
  metadata: Record<string, any>
  ipAddress: string
  userAgent: string
  createdAt: string
}

export interface UserStats {
  totalConnections: number
  totalProjects: number
  totalMessages: number
  profileCompleteness: number
  lastActiveAt: string
  accountAge: number // in days
}

export interface UpdateUserRequest {
  firstName?: string
  lastName?: string
  phone?: string
  avatarUrl?: string
  timezone?: string
  locale?: string
}

export interface UpdateUserProfileRequest {
  bio?: string
  location?: string
  website?: string
  linkedinUrl?: string
  twitterUrl?: string
  githubUrl?: string
  skills?: string[]
  interests?: string[]
}

export interface UpdateUserPreferencesRequest {
  theme?: 'light' | 'dark' | 'system'
  language?: string
  timezone?: string
  dateFormat?: string
  currency?: string
  notificationSettings?: Partial<NotificationSettings>
  privacySettings?: Partial<PrivacySettings>
}

export interface UserService {
  // User CRUD
  getUser(id: string): Promise<User | null>
  getUserByEmail(email: string): Promise<User | null>
  updateUser(id: string, updates: UpdateUserRequest): Promise<User>
  deleteUser(id: string): Promise<void>

  // Profile management
  getUserProfile(userId: string): Promise<UserProfile | null>
  createUserProfile(userId: string, profile: Omit<UserProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<UserProfile>
  updateUserProfile(userId: string, updates: UpdateUserProfileRequest): Promise<UserProfile>

  // Experience management
  addUserExperience(userId: string, experience: Omit<UserExperience, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<UserExperience>
  updateUserExperience(id: string, updates: Partial<UserExperience>): Promise<UserExperience>
  deleteUserExperience(id: string): Promise<void>
  getUserExperiences(userId: string): Promise<UserExperience[]>

  // Education management
  addUserEducation(userId: string, education: Omit<UserEducation, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<UserEducation>
  updateUserEducation(id: string, updates: Partial<UserEducation>): Promise<UserEducation>
  deleteUserEducation(id: string): Promise<void>
  getUserEducation(userId: string): Promise<UserEducation[]>

  // Certification management
  addUserCertification(userId: string, certification: Omit<UserCertification, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<UserCertification>
  updateUserCertification(id: string, updates: Partial<UserCertification>): Promise<UserCertification>
  deleteUserCertification(id: string): Promise<void>
  getUserCertifications(userId: string): Promise<UserCertification[]>

  // Language management
  addUserLanguage(userId: string, language: Omit<UserLanguage, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<UserLanguage>
  updateUserLanguage(id: string, updates: Partial<UserLanguage>): Promise<UserLanguage>
  deleteUserLanguage(id: string): Promise<void>
  getUserLanguages(userId: string): Promise<UserLanguage[]>

  // Preferences
  getUserPreferences(userId: string): Promise<UserPreferences | null>
  updateUserPreferences(userId: string, updates: UpdateUserPreferencesRequest): Promise<UserPreferences>

  // Activity tracking
  logUserActivity(activity: Omit<UserActivity, 'id' | 'createdAt'>): Promise<void>
  getUserActivity(userId: string, limit?: number): Promise<UserActivity[]>

  // Stats
  getUserStats(userId: string): Promise<UserStats>

  // Search and discovery
  searchUsers(query: string, filters?: UserSearchFilters): Promise<User[]>
  getRecommendedConnections(userId: string, limit?: number): Promise<User[]>
}

export interface UserSearchFilters {
  skills?: string[]
  location?: string
  industry?: string
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive'
  availability?: 'available' | 'busy' | 'unavailable'
}