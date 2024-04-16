import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { LOGGER_TOKEN } from 'src/infrastructure/logging/logger.token';
import { USER_REPO_TOKEN } from 'src/modules/users/users.constants';
import {
  PASSWORD_HASHING_TOKEN,
  PASSWORD_RESET_MANAGER_TOKEN,
  USER_SESSION_MANAGER_TOKEN,
} from '../domain/auth.constants';
import { EVENT_TOKEN } from 'src/infrastructure/events/event.token';
import { UserDomainService } from 'src/modules/users/domain/services/user.domain.service';
import { User } from 'src/modules/users/domain/model/User';
import { UserResponseDto } from 'src/modules/users/dto/user-response.dto';
import {
  mockUserDomainService,
  mockUserRepository,
  mockUserSessionManager,
} from 'src/tests/mocks/user.mocks';
import {
  mockPasswordHashingService,
  mockPasswordResetManager,
} from 'src/tests/mocks/auth.mocks';
import { mockEventPublisher, mockLogger } from 'src/tests/mocks/infra.mocks';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: LOGGER_TOKEN, useValue: mockLogger },
        { provide: USER_REPO_TOKEN, useValue: mockUserRepository },
        { provide: EVENT_TOKEN, useValue: mockEventPublisher },
        {
          provide: PASSWORD_HASHING_TOKEN,
          useValue: mockPasswordHashingService,
        },
        {
          provide: USER_SESSION_MANAGER_TOKEN,
          useValue: mockUserSessionManager,
        },
        {
          provide: PASSWORD_RESET_MANAGER_TOKEN,
          useValue: mockPasswordResetManager,
        },
        {
          provide: UserDomainService,
          useValue: mockUserDomainService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return null even if getUserByEmail throws an error', async () => {
      jest
        .spyOn(mockUserRepository, 'getUserByEmail')
        .mockRejectedValue(new Error('User not found'));
      const result = await service.validateUser(
        'nonexistent@test.com',
        'password',
      );
      expect(result).toBeNull();
    });

    it('should return null if user does not exist', async () => {
      jest.spyOn(mockUserRepository, 'getUserByEmail').mockResolvedValue(null);
      const result = await service.validateUser(
        'nonexistent@test.com',
        'password',
      );
      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      const user = new User({
        id: '1',
        email: 'test@test.com',
        firstName: 'test',
        lastName: 'test',
        passwordHash: 'hashedpassword',
      });
      jest.spyOn(mockUserRepository, 'getUserByEmail').mockResolvedValue(user);
      jest
        .spyOn(mockPasswordHashingService, 'compare')
        .mockResolvedValue(false);

      const result = await service.validateUser(
        'test@test.com',
        'wrongpassword',
      );
      expect(result).toBeNull();
    });

    it('should return a UserResponseDto if user exists and password is valid', async () => {
      const user = new User({
        id: '1',
        email: 'test@test.com',
        firstName: 'test',
        lastName: 'test',
        passwordHash: 'correctpassword',
      });
      const expectedDto = new UserResponseDto(user);

      jest.spyOn(mockUserRepository, 'getUserByEmail').mockResolvedValue(user);
      jest.spyOn(mockPasswordHashingService, 'compare').mockResolvedValue(true);

      const result = await service.validateUser(
        'test@test.com',
        'correctpassword',
      );
      expect(result).toBeInstanceOf(UserResponseDto);
      expect(result).toEqual(expectedDto);
    });
  });
});
