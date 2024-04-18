import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User as PrismaUser } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { User as DomainUser } from './domain/model/User';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersRepository } from './users.repository';

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
      });
      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result.id).toEqual(createdPrismaUser.id);
      expect(result.email).toEqual(createdPrismaUser.email);
      expect(result.fullName).toEqual(
        `${createdPrismaUser.firstName} ${createdPrismaUser.lastName}`,
      );
    });
  });
});
