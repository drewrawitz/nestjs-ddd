export const mockUserMfaRepository = {
  getAllActiveMFAForUser: jest.fn(),
  upsert: jest.fn(),
  getSecretForUser: jest.fn(),
  checkIfUserIsAuthenticatedWithType: jest.fn(),
};
