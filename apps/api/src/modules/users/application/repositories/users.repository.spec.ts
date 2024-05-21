import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User as PrismaUser } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { User as DomainUser } from '../../domain/model/User';
import { UserResponseDto } from '../../dto/user-response.dto';
import { UsersRepository } from './users.repository';
import { Email } from '../../domain/model/Email';
import { mockLogger } from 'src/tests/mocks/infra.mocks';
import { LOGGER_TOKEN } from 'src/infrastructure/logging/logger.token';

describe('UsersRepository', () => {
  let repository: UsersRepository;
  let mockPrismaService: any;

  beforeEach(async () => {
    mockPrismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersRepository,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: LOGGER_TOKEN, useValue: mockLogger },
      ],
    }).compile();

    repository = module.get<UsersRepository>(UsersRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserIdFromStripeCustomerId', () => {
    it('should get the correct user ID from a valid stripe customer ID', async () => {
      const prismaUser = {
        id: '999',
        email: 'test@example.com',
        passwordHash: 'hash',
        firstName: 'Test',
        lastName: 'User',
        stripeCustomerId: 'cus_123',
      };
      mockPrismaService.user.findUnique.mockResolvedValue(prismaUser);

      const result = await repository.getUserIdFromStripeCustomerId('cus_123');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { stripeCustomerId: 'cus_123' },
        select: { id: true },
      });
      expect(result).toBe('999');
    });

    it('should return null when there is no match', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.getUserIdFromStripeCustomerId('cus_123');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { stripeCustomerId: 'cus_123' },
        select: { id: true },
      });
      expect(result).toBeNull();
    });

    it('should handle database errors gracefully', async () => {
      const errorMsg = 'Database connection error';
      mockPrismaService.user.findUnique.mockImplementation(() => {
        throw new Error(errorMsg);
      });

      try {
        await repository.getUserIdFromStripeCustomerId('cus_123');
        throw new Error('Test failed: Expected method to throw.');
      } catch (error) {
        expect(error.message).toBe(errorMsg);
      }
    });
  });

  describe('existsByEmail', () => {
    it('should return true if a user with the email exists', async () => {
      const prismaUser = {
        id: '1',
        email: 'test@example.com',
        passwordHash: 'hash',
        firstName: 'Test',
        lastName: 'User',
        stripeCustomerId: null,
      };
      mockPrismaService.user.findUnique.mockResolvedValue(prismaUser);

      const result = await repository.existsByEmail('test@example.com');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        select: { id: true },
      });
      expect(result).toBe(true);
    });

    it('should return false if a user with the email does not exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await repository.existsByEmail('test@example.com');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        select: { id: true },
      });
      expect(result).toBe(false);
    });
  });

  describe('getUserById', () => {
    it('should return a domain user object if user is found', async () => {
      const prismaUser = {
        id: '1',
        email: 'test@example.com',
        passwordHash: 'hash',
        firstName: 'Test',
        lastName: 'User',
        stripeCustomerId: null,
      };
      mockPrismaService.user.findUnique.mockResolvedValue(prismaUser);

      const result = await repository.getUserById('1');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
        include: {
          mfa: {
            where: {
              isEnabled: true,
            },
          },
        },
      });
      expect(result).toBeInstanceOf(DomainUser);
      expect(result.id).toEqual('1');
    });

    it('should throw a NotFoundException if no user is found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(repository.getUserById('1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getUserByEmail', () => {
    it('should return a domain user object if user is found', async () => {
      const prismaUser = {
        id: '2',
        email: 'ok@ok.com',
        passwordHash: 'hash',
        firstName: 'Test',
        lastName: 'User',
        stripeCustomerId: null,
      };
      mockPrismaService.user.findUnique.mockResolvedValue(prismaUser);

      const result = await repository.getUserByEmail('ok@ok.com');

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'ok@ok.com' },
        include: {
          mfa: {
            where: {
              isEnabled: true,
            },
          },
        },
      });
      expect(result).toBeInstanceOf(DomainUser);
      expect(result.email).toBeInstanceOf(Email);
      expect(result.email.getValue()).toEqual('ok@ok.com');
    });

    it('should throw a NotFoundException if no user is found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(repository.getUserByEmail('ok@ok.com')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createUser', () => {
    it('should create a new user and return a UserResponseDto', async () => {
      const domainUser = new DomainUser({
        id: undefined, // id is undefined before creation
        email: 'create@example.com',
        passwordHash: 'hash',
        firstName: 'Create',
        lastName: 'User',
      });
      const createdPrismaUser: PrismaUser = {
        id: '1',
        email: 'create@example.com',
        passwordHash: 'hash',
        firstName: 'Create',
        lastName: 'User',
        stripeCustomerId: null,
        emailVerifiedAt: null,
        createdAt: new Date(),
      };
      mockPrismaService.user.create.mockResolvedValue(createdPrismaUser);

      const result = await repository.createUser(domainUser);

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: domainUser.email.getValue(),
          passwordHash: domainUser.passwordHash,
          firstName: domainUser.firstName,
          lastName: domainUser.lastName,
        },
        include: {
          mfa: {
            where: {
              isEnabled: true,
            },
          },
        },
      });
      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result.id).toEqual(createdPrismaUser.id);
      expect(result.email).toEqual(createdPrismaUser.email);
      expect(result.fullName).toEqual(
        `${createdPrismaUser.firstName} ${createdPrismaUser.lastName}`,
      );
    });
  });

  describe('updateUserWithStripeCustomerId', () => {
    it('should update the user with a stripe customer ID', async () => {
      const userId = '123';
      const stripeCustomerId = 'cus_abc123';

      await repository.updateUserWithStripeCustomerId(userId, stripeCustomerId);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { stripeCustomerId },
      });
      expect(mockLogger.log).toHaveBeenCalled();
      expect(mockLogger.error).not.toHaveBeenCalled();
    });

    it('should log an error if the update operation fails', async () => {
      const userId = '123';
      const stripeCustomerId = 'cus_abc123';
      const error = new Error('Database error');

      mockPrismaService.user.update.mockRejectedValue(error);

      await repository.updateUserWithStripeCustomerId(userId, stripeCustomerId);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { stripeCustomerId },
      });
      expect(mockLogger.log).not.toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to update user with Stripe Customer ID',
        {
          error,
          params: { userId, stripeCustomerId },
        },
      );
    });
  });
});
