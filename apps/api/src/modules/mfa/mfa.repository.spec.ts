import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { mockEnv, mockLogger } from 'src/tests/mocks/infra.mocks';
import { decrypt } from 'src/utils/tokens';
import { LOGGER_TOKEN } from 'src/infrastructure/logging/logger.token';
import { UserMFARepository } from './mfa.repository';
import { EnvService } from 'src/infrastructure/env/env.service';
import { MFAType } from '@prisma/client';
import { InternalServerErrorException } from '@nestjs/common';
import { PASSWORD_HASHING_TOKEN } from '../auth/domain/auth.constants';
import { mockPasswordHashingService } from 'src/tests/mocks/auth.mocks';

jest.mock('src/utils/tokens', () => ({
  decrypt: jest.fn(() => 'decryptedSecret'),
}));

const txMock = {
  userMFA: {
    upsert: jest.fn().mockResolvedValue(true),
  },
  userBackupCode: {
    upsert: jest.fn().mockResolvedValue(true),
  },
};

describe('UserMFARepository', () => {
  let repository: UserMFARepository;
  let mockPrismaService: any;

  beforeEach(async () => {
    mockPrismaService = {
      $transaction: jest.fn((callback) => callback(txMock)),
      userMFA: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        upsert: jest.fn(),
      },
      userBackupCode: {
        upsert: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserMFARepository,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: LOGGER_TOKEN, useValue: mockLogger },
        { provide: EnvService, useValue: mockEnv },
        {
          provide: PASSWORD_HASHING_TOKEN,
          useValue: mockPasswordHashingService,
        },
      ],
    }).compile();

    repository = module.get<UserMFARepository>(UserMFARepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllActiveMFAForUser', () => {
    it('should get a list of active MFA rows for a user', async () => {
      const rows = [
        {
          id: 1,
          userId: 'user123',
          type: 'TOTP',
          secret: 'secret123',
        },
      ];
      mockPrismaService.userMFA.findMany.mockResolvedValue(rows);

      const result = await repository.getAllActiveMFAForUser('user123');

      expect(mockPrismaService.userMFA.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user123',
          isEnabled: true,
        },
      });
      expect(result).toBe(rows);
    });
  });

  describe('setupUserMfaWithBackupCode', () => {
    const input = {
      userId: 'user1',
      type: MFAType.TOTP,
      secret: {
        code: 'encryptedsecret',
        iv: 'iv',
        authTag: 'authTag',
      },
      backup: {
        code: 'backupCode',
      },
    };

    it('should successfully upsert a User MFA record and backup code', async () => {
      const hashedCode = 'hashedCode123';

      jest
        .spyOn(mockPasswordHashingService, 'hash')
        .mockResolvedValue(hashedCode);
      await repository.setupUserMfaWithBackupCode(input);

      expect(mockPasswordHashingService.hash).toHaveBeenCalled();
      expect(txMock.userMFA.upsert).toHaveBeenCalledWith({
        where: { userId_type: { userId: input.userId, type: MFAType.TOTP } },
        create: {
          userId: input.userId,
          type: input.type,
          secret: input.secret.code,
          iv: input.secret.iv,
          authTag: input.secret.authTag,
          isEnabled: true,
        },
        update: {
          secret: input.secret.code,
          iv: input.secret.iv,
          authTag: input.secret.authTag,
          isEnabled: true,
        },
      });
      expect(txMock.userBackupCode.upsert).toHaveBeenCalledWith({
        where: { userId: input.userId },
        create: {
          userId: input.userId,
          hashedCode,
        },
        update: {
          hashedCode,
        },
      });
    });

    it('should log and throw on upsert failure', async () => {
      const error = new Error('DB error');
      txMock.userMFA.upsert.mockRejectedValue(error);

      await expect(
        repository.setupUserMfaWithBackupCode(input),
      ).rejects.toThrow(InternalServerErrorException);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to setup MFA for user',
        {
          error,
          userId: input.userId,
        },
      );
    });
  });

  describe('checkIfUserIsAuthenticatedWithType', () => {
    it('should return true if user has enabled MFA of specified type', async () => {
      mockPrismaService.userMFA.findFirst.mockResolvedValue({ id: 1 });
      const result = await repository.checkIfUserIsAuthenticatedWithType(
        'user1',
        MFAType.TOTP,
      );
      expect(result).toBeTruthy();
      expect(mockPrismaService.userMFA.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user1', type: MFAType.TOTP, isEnabled: true },
      });
    });

    it('should return false if no MFA is found for user of specified type', async () => {
      mockPrismaService.userMFA.findFirst.mockResolvedValue(null);
      const result = await repository.checkIfUserIsAuthenticatedWithType(
        'user1',
        MFAType.TOTP,
      );
      expect(result).toBeFalsy();
    });
  });

  describe('getSecretForUser', () => {
    it('should return decrypted secret for a user', async () => {
      const findResult = {
        secret: 'encrypted',
        iv: 'iv',
        authTag: 'authTag',
      };
      mockPrismaService.userMFA.findFirst.mockResolvedValue(findResult);
      jest.spyOn(mockEnv, 'get').mockReturnValue('encryptionKey');

      const result = await repository.getSecretForUser('user1', MFAType.TOTP);

      expect(decrypt).toHaveBeenCalledWith(
        'encryptionKey',
        'encrypted',
        'iv',
        'authTag',
      );
      expect(result).toEqual('decryptedSecret');
    });

    it('should return null if no secret is found', async () => {
      mockPrismaService.userMFA.findFirst.mockResolvedValue(null);

      const result = await repository.getSecretForUser('user1', MFAType.TOTP);

      expect(result).toBeNull();
    });
  });
});
