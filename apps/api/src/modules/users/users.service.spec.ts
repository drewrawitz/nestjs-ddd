import ms from 'ms';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { LOGGER_TOKEN } from 'src/infrastructure/logging/logger.token';
import { USER_REPO_TOKEN } from 'src/modules/users/users.constants';
import { EVENT_TOKEN } from 'src/infrastructure/events/event.token';
import { UserDomainService } from 'src/modules/users/domain/services/user.domain.service';
import {
  mockUserDomainService,
  mockUserRepository,
} from 'src/tests/mocks/user.mocks';
import {
  mockEventPublisher,
  mockLogger,
  mockCache,
  mockEnv,
} from 'src/tests/mocks/infra.mocks';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { mockSubscriptionsService } from 'src/tests/mocks/subscriptions.mock';
import { SubscriptionsService } from '../subscriptions/application/subscriptions.service';
import { AccessService } from '../access/application/access.service';
import { mockAccessService } from 'src/tests/mocks/access.mocks';
import { EnvService } from 'src/infrastructure/env/env.service';
import { UserResponseDto } from './dto/user-response.dto';
import { User as DomainUser } from './domain/model/User';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: LOGGER_TOKEN, useValue: mockLogger },
        { provide: CACHE_MANAGER, useValue: mockCache },
        { provide: USER_REPO_TOKEN, useValue: mockUserRepository },
        { provide: EVENT_TOKEN, useValue: mockEventPublisher },
        { provide: SubscriptionsService, useValue: mockSubscriptionsService },
        { provide: AccessService, useValue: mockAccessService },
        { provide: EnvService, useValue: mockEnv },
        {
          provide: UserDomainService,
          useValue: mockUserDomainService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clears usage data and mock implementations
    jest.restoreAllMocks(); // Restores original implementations and clears mocks
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('invalidateCache', () => {
    it(`should call the cache manager to delete the user's cache`, async () => {
      await service.invalidateCache('user123');
      expect(mockCache.del).toHaveBeenCalledWith('user-user123');
    });
  });

  describe('getUserDetails', () => {
    it('should return cached data if available', async () => {
      const userId = 'user123';
      const cachedData = JSON.stringify({ user: 'cachedUserDetails' });
      mockCache.get.mockResolvedValue(cachedData);

      const result = await service.getUserDetails(userId);

      expect(mockCache.get).toHaveBeenCalledWith(`user-${userId}`);
      expect(result).toEqual(JSON.parse(cachedData));
    });

    it('should fetch data from the repository if not cached', async () => {
      const userId = 'user123';
      const user = {
        id: userId,
        email: 'test@test.com',
        passwordHash: 'test123',
        firstName: 'Test',
        lastName: 'Test',
        stripeCustomerId: 'cust123',
      };

      const domainUser = new DomainUser(user);
      const accessDetails = {
        grantedAccess: [],
        hasAccessToSubscription: false,
      };

      mockCache.get.mockResolvedValue(null);
      mockUserRepository.getUserById.mockResolvedValue(domainUser);
      mockSubscriptionsService.getLatestSubscriptionForUser.mockResolvedValue(
        null,
      );
      mockAccessService.getAccessForUser.mockResolvedValue([]);

      const result = await service.getUserDetails(userId);

      expect(mockUserRepository.getUserById).toHaveBeenCalledWith(userId);
      expect(
        mockSubscriptionsService.getLatestSubscriptionForUser,
      ).toHaveBeenCalledWith(user.stripeCustomerId);
      expect(mockAccessService.getAccessForUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual({
        user: new UserResponseDto(domainUser),
        subscription: null,
        ...accessDetails,
      });
    });

    it('should cache new data if not previously cached', async () => {
      const userId = 'user123';
      const user = {
        id: userId,
        email: 'test@test.com',
        passwordHash: 'test123',
        firstName: 'Test',
        lastName: 'Test',
        stripeCustomerId: 'cust123',
      };
      const domainUser = new DomainUser(user);
      const accessDetails = {
        grantedAccess: [],
        hasAccessToSubscription: false,
      };

      mockCache.get.mockResolvedValue(null);
      mockUserRepository.getUserById.mockResolvedValue(domainUser);
      mockSubscriptionsService.getLatestSubscriptionForUser.mockResolvedValue(
        null,
      );
      mockAccessService.getAccessForUser.mockResolvedValue([]);

      await service.getUserDetails(userId);

      expect(mockCache.set).toHaveBeenCalledWith(
        `user-${userId}`,
        JSON.stringify({
          user: new UserResponseDto(domainUser),
          subscription: null,
          ...accessDetails,
        }),
        ms('24h'),
      );
    });
  });
});
