export const mockPasswordHashingService = {
  hash: jest.fn(),
  compare: jest.fn(),
};

export const mockPasswordResetManager = {
  saveForgotPasswordToken: jest.fn(),
  invalidateForgotPasswordToken: jest.fn(),
};
