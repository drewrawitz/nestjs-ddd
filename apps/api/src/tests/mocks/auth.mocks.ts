export const mockPasswordHashingService = {
  hash: jest.fn(),
  compare: jest.fn(),
};

export const mockPasswordResetManager = {
  saveForgotPasswordToken: jest.fn(),
  invalidateForgotPasswordToken: jest.fn(),
  getEmailFromForgotPasswordToken: jest.fn(),
  removeForgotPasswordTokens: jest.fn(),
};

export const mockAuthChallengeManager = {
  saveAuthChallengeToken: jest.fn(),
  verifyAuthChallengeToken: jest.fn(),
};
