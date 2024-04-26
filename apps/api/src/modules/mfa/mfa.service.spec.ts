import { Test, TestingModule } from '@nestjs/testing';
import { MFAService } from './mfa.service';
import { mockEnv } from 'src/tests/mocks/infra.mocks';
import { EnvService } from 'src/infrastructure/env/env.service';
import { USER_MFA_REPO_TOKEN } from './mfa.constants';
import { mockUserMfaRepository } from 'src/tests/mocks/mfa.mocks';

const TOTP_SECRET = 'secret123';
const TOTP_URL = 'url123';
const QRCODE_URL = 'data:image/png;base64,qrcodedata';

jest.mock('qrcode', () => ({
  toDataURL: jest.fn(() => Promise.resolve(QRCODE_URL)),
}));

jest.mock('src/utils/tokens', () => ({
  generateTOTPSecret: jest.fn(() => ({
    base32: TOTP_SECRET,
    otpauth_url: TOTP_URL,
  })),
}));

describe('MFAService', () => {
  let service: MFAService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MFAService,
        { provide: USER_MFA_REPO_TOKEN, useValue: mockUserMfaRepository },
        { provide: EnvService, useValue: mockEnv },
      ],
    }).compile();

    service = module.get<MFAService>(MFAService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clears usage data and mock implementations
    jest.restoreAllMocks(); // Restores original implementations and clears mocks
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('setupTotp', () => {
    it('should generate a key, URL, and QR code', async () => {
      const result = await service.setupTotp();

      expect(result.key).toEqual(TOTP_SECRET);
      expect(result.url).toEqual(TOTP_URL);
      expect(result.qrcode).toEqual(QRCODE_URL);
    });
  });
});
