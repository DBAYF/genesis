// Jest setup file
require('dotenv').config({ path: '.env.test' })

// Mock external services
jest.mock('ioredis')
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    company: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    }
  }))
}))

// Global test utilities
global.testUtils = {
  // Helper to create test users
  createTestUser: (overrides = {}) => ({
    id: 'test-user-id',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    phoneVerified: true,
    emailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }),

  // Helper to create test companies
  createTestCompany: (overrides = {}) => ({
    id: 'test-company-id',
    name: 'Test Company',
    type: 'llc',
    jurisdiction: 'uk',
    registeredAddress: {
      line1: '123 Test Street',
      city: 'London',
      postcode: 'SW1A 1AA',
      country: 'GB'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  }),

  // Helper to create test requests
  createTestRequest: (overrides = {}) => ({
    id: 'test-request-id',
    method: 'GET',
    url: '/test',
    headers: {
      'content-type': 'application/json',
      'authorization': 'Bearer test-token'
    },
    params: {},
    query: {},
    body: {},
    ip: '127.0.0.1',
    log: {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn()
    },
    ...overrides
  }),

  // Helper to create test replies
  createTestReply: () => ({
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    header: jest.fn().mockReturnThis()
  })
}

// Setup and teardown
beforeAll(async () => {
  // Global setup
})

afterAll(async () => {
  // Global cleanup
})

beforeEach(() => {
  // Reset mocks before each test
  jest.clearAllMocks()
})

afterEach(() => {
  // Cleanup after each test
})