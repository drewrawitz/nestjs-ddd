export const mockUserMfaRepository = {
  getAllActiveMFAForUser: jest.fn(),
  setupUserMfaWithBackupCode: jest.fn(),
  getSecretForUser: jest.fn(),
  checkIfUserIsAuthenticatedWithType: jest.fn(),
};
