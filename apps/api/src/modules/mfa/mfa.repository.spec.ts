import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { mockEnv, mockLogger } from 'src/tests/mocks/infra.mocks';
import { decrypt } from 'src/utils/tokens';
import { LOGGER_TOKEN } from 'src/infrastructure/logging/logger.token';
import { UserMFARepository } from './mfa.repository';
import { EnvService } from 'src/infrastructure/env/env.service';
import { MFAType } from '@prisma/client';
import { InternalServerErrorException } from '@nestjs/common';

jest.mock('src/utils/tokens', () => ({
  decrypt: jest.fn(() => 'decryptedSecret'),
}));

describe('UserMFARepository', () => {
  let repository: UserMFARepository;
  let mockPrismaService: any;

  beforeEach(async () => {
    mockPrismaService = {
      userMFA: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        upsert: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserMFARepository,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: LOGGER_TOKEN, useValue: mockLogger },
        { provide: EnvService, useValue: mockEnv },
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

  describe('upsert', () => {
    it('should successfully upsert a User MFA record', async () => {
      const input = {
        userId: 'user1',
        type: MFAType.TOTP,
        secret: 'encryptedsecret',
        iv: 'iv',
        authTag: 'authTag',
        isEnabled: true,
      };
      mockPrismaService.userMFA.upsert.mockResolvedValue(input);

      const result = await repository.upsert(input);

      expect(mockPrismaService.userMFA.upsert).toHaveBeenCalledWith({
        where: { userId_type: { userId: 'user1', type: MFAType.TOTP } },
        create: input,
        update: { isEnabled: true },
      });
      expect(result).toBe(input);
    });

    it('should log and throw on upsert failure', async () => {
      const error = new Error('DB error');
      mockPrismaService.userMFA.upsert.mockRejectedValue(error);
      const input = {
        userId: 'user1',
        type: MFAType.TOTP,
        secret: 'encryptedsecret',
        iv: 'iv',
        authTag: 'authTag',
        isEnabled: true,
      };

      await expect(repository.upsert(input)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to upsert User MFA record',
        {
          error,
          data: input,
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
