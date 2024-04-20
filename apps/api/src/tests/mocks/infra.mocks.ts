export const mockLogger = {
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

export const mockEventPublisher = {
  publish: jest.fn(),
};

export const mockCache = {
  del: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
};

export const mockEnv = {
  get: jest.fn(),
};
