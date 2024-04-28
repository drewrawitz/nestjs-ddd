import { Test, TestingModule } from '@nestjs/testing';
import { MFAService } from './mfa.service';
import { mockEnv } from 'src/tests/mocks/infra.mocks';
import { EnvService } from 'src/infrastructure/env/env.service';
import { USER_MFA_REPO_TOKEN } from './mfa.constants';
import { mockUserMfaRepository } from 'src/tests/mocks/mfa.mocks';
import speakeasy from 'speakeasy';
import { ForbiddenException } from '@nestjs/common';
import { MFAType } from '@prisma/client';

const TOTP_SECRET = 'secret123';
const TOTP_URL = 'url123';
const QRCODE_URL = 'data:image/png;base64,qrcodedata';

jest.mock('qrcode', () => ({
  toDataURL: jest.fn(() => Promise.resolve(QRCODE_URL)),
}));

jest.mock('src/utils/tokens', () => ({
  generateBase64Key: jest.fn(() => 'base64Key'),
  generateTOTPSecret: jest.fn(() => ({
    base32: TOTP_SECRET,
    otpauth_url: TOTP_URL,
  })),
  encrypt: jest.fn(() => ({
    ciphertext: 'ciphertext',
    iv: 'iv',
    authTag: 'authTag',
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
    jest.spyOn(service, 'generateBackupCode').mockReturnValue({
      raw: 'backup123',
      encrypted: {
        ciphertext: 'encrypted123',
        iv: 'iv123',
        authTag: 'authTag123',
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clears usage data and mock implementations
    jest.restoreAllMocks(); // Restores original implementations and clears mocks
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllActiveMFAForUser', () => {
    it('should return a list of all active MFA entries for a user (empty)', async () => {
      jest
        .spyOn(mockUserMfaRepository, 'getAllActiveMFAForUser')
        .mockResolvedValue([]);

      const result = await service.getAllActiveMFAForUser('user123');
      expect(result).toEqual([]);
    });

    it('should return a list of all active MFA entries for a user (results)', async () => {
      const results = [{ id: 1, type: 'TOTP' }];
      jest
        .spyOn(mockUserMfaRepository, 'getAllActiveMFAForUser')
        .mockResolvedValue(results);

      const result = await service.getAllActiveMFAForUser('user123');
      expect(result).toEqual(results);
    });
  });

  describe('setupTotp', () => {
    it('should generate a key, URL, and QR code', async () => {
      const result = await service.setupTotp();

      expect(result.key).toEqual(TOTP_SECRET);
      expect(result.url).toEqual(TOTP_URL);
      expect(result.qrcode).toEqual(QRCODE_URL);
    });
  });

  describe('verifyTotpToken', () => {
    it('should return true for a valid token', async () => {
      jest.spyOn(speakeasy.totp, 'verify').mockReturnValue(true);

      const secret = TOTP_SECRET;
      const token = '123456';
      const result = await service.verifyTotpToken(secret, token);

      expect(result).toBe(true);
    });

    it('should throw an exception for an invalid token', async () => {
      jest.spyOn(speakeasy.totp, 'verify').mockReturnValue(false);

      const secret = TOTP_SECRET;
      const token = 'invalid';

      await expect(service.verifyTotpToken(secret, token)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('activateTotp', () => {
    it('should activate TOTP for the user', async () => {
      jest.spyOn(service, 'verifyTotpToken').mockResolvedValue(true);
      jest
        .spyOn(mockUserMfaRepository, 'checkIfUserIsAuthenticatedWithType')
        .mockResolvedValue(false);
      jest
        .spyOn(mockUserMfaRepository, 'setupUserMfaWithBackupCode')
        .mockResolvedValue(undefined);

      const userId = 'user1';
      const dto = { totp: '123456', key: TOTP_SECRET };

      const activate = await service.activateTotp(userId, dto);

      expect(service.generateBackupCode).toHaveBeenCalled();
      expect(
        mockUserMfaRepository.setupUserMfaWithBackupCode,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          type: MFAType.TOTP,
          secret: {
            authTag: 'authTag',
            iv: 'iv',
            code: 'ciphertext',
          },
        }),
      );

      expect(activate).toEqual({
        backupCode: 'backup123',
      });
    });

    it('should throw if TOTP is already enabled', async () => {
      jest.spyOn(service, 'verifyTotpToken').mockResolvedValue(true);
      jest
        .spyOn(mockUserMfaRepository, 'checkIfUserIsAuthenticatedWithType')
        .mockResolvedValue(true);

      const userId = 'user1';
      const dto = { totp: '123456', key: TOTP_SECRET };

      await expect(service.activateTotp(userId, dto)).rejects.toThrow(
        ForbiddenException,
      );
      expect(service.generateBackupCode).not.toHaveBeenCalled();
      expect(service.verifyTotpToken).not.toHaveBeenCalled();
      expect(
        mockUserMfaRepository.setupUserMfaWithBackupCode,
      ).not.toHaveBeenCalled();
    });

    it('should throw if the TOTP code is invalid', async () => {
      jest
        .spyOn(mockUserMfaRepository, 'checkIfUserIsAuthenticatedWithType')
        .mockResolvedValue(false);

      const userId = 'user1';
      const dto = { totp: '123456', key: TOTP_SECRET };

      await expect(service.activateTotp(userId, dto)).rejects.toThrow(
        ForbiddenException,
      );

      expect(service.generateBackupCode).not.toHaveBeenCalled();
      expect(
        mockUserMfaRepository.setupUserMfaWithBackupCode,
      ).not.toHaveBeenCalled();
    });
  });

  describe('verifyUserTotpToken', () => {
    it('should return false if no secret is found', async () => {
      jest
        .spyOn(mockUserMfaRepository, 'getSecretForUser')
        .mockResolvedValue(null);

      const result = await service.verifyUserTotpToken('user1', '123456');

      expect(result).toBe(false);
    });

    it('should verify the token correctly if secret is found', async () => {
      jest
        .spyOn(mockUserMfaRepository, 'getSecretForUser')
        .mockResolvedValue(TOTP_SECRET);
      jest.spyOn(service, 'verifyTotpToken').mockResolvedValue(true);

      const result = await service.verifyUserTotpToken('user1', '123456');

      expect(result).toBe(true);
    });
  });
});
