export const mockUserRepository = {
  existsByEmail: jest.fn(),
  getUserIdFromStripeCustomerId: jest.fn(),
  getUserById: jest.fn(),
  getUserByEmail: jest.fn(),
  createUser: jest.fn(),
  updateUserWithStripeCustomerId: jest.fn(),
};

export const mockUserDomainService = {
  validateCreateUser: jest.fn(),
};

export const mockUserSessionManager = {
  saveUserSession: jest.fn(),
  removeSessionFromRedis: jest.fn(),
};
