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
import { UserCreatedEvent } from 'src/modules/users/domain/events/user-created.event';

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
    jest.clearAllMocks(); // Clears usage data and mock implementations
    jest.restoreAllMocks(); // Restores original implementations and clears mocks
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

  describe('signup', () => {
    const signupDto = {
      email: 'newuser@test.com',
      password: 'password',
      firstName: 'First',
      lastName: 'Last',
    };

    it('should throw an error if a user with this email already exists', async () => {
      jest
        .spyOn(mockUserDomainService, 'validateCreateUser')
        .mockRejectedValue(new Error('User exists'));

      await expect(
        service.signup({
          email: 'taken@test.com',
          password: 'password',
          firstName: 'test',
          lastName: 'test',
        }),
      ).rejects.toThrow('User exists');
    });

    it('should successfully create a new user', async () => {
      jest
        .spyOn(mockUserDomainService, 'validateCreateUser')
        .mockResolvedValue(undefined);
      jest.spyOn(mockUserRepository, 'createUser').mockResolvedValue({
        ...signupDto,
        id: '1',
      });
      jest.spyOn(mockEventPublisher, 'publish').mockImplementation(() => {});

      const result = await service.signup(signupDto);

      expect(mockUserRepository.createUser).toHaveBeenCalled();
      expect(result.email).toEqual(signupDto.email);
      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        'user.created',
        expect.any(UserCreatedEvent),
      );
    });

    it('should log and rethrow the error if user creation fails', async () => {
      const error = new Error('Database failure');
      jest
        .spyOn(mockUserDomainService, 'validateCreateUser')
        .mockResolvedValue(undefined);
      jest.spyOn(mockUserRepository, 'createUser').mockRejectedValue(error);

      await expect(service.signup(signupDto)).rejects.toThrow(
        'Database failure',
      );
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to create user', {
        error,
        body: signupDto,
      });
    });
  });
});
