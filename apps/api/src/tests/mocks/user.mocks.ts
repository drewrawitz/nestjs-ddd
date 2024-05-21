export const mockUserRepository = {
  existsByEmail: jest.fn(),
  getUserIdFromStripeCustomerId: jest.fn(),
  getUserById: jest.fn(),
  getUserByEmail: jest.fn(),
  createUser: jest.fn(),
  updateUserWithStripeCustomerId: jest.fn(),
  updateUserPassword: jest.fn(),
};

export const mockUserDomainService = {
  validateCreateUser: jest.fn(),
};

export const mockUserSessionManager = {
  saveUserSession: jest.fn(),
  getMfaSession: jest.fn(),
  saveMfaSession: jest.fn(),
  removeMfaSession: jest.fn(),
  removeSessionFromRedis: jest.fn(),
  removeAllUserSessions: jest.fn(),
};
