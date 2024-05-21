import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EVENT_TOKEN } from 'src/infrastructure/events/event.token';
import { LOGGER_TOKEN } from 'src/infrastructure/logging/logger.token';
import { USER_REPO_TOKEN } from 'src/modules/users/application/users.constants';
import { UserCreatedEvent } from 'src/modules/users/domain/events/user-created.event';
import { User } from 'src/modules/users/domain/model/User';
import { UserDomainService } from 'src/modules/users/domain/services/user.domain.service';
import { UserResponseDto } from 'src/modules/users/dto/user-response.dto';
import {
  mockAuthChallengeManager,
  mockPasswordHashingService,
  mockPasswordResetManager,
} from 'src/tests/mocks/auth.mocks';
import { mockEventPublisher, mockLogger } from 'src/tests/mocks/infra.mocks';
import {
  mockUserDomainService,
  mockUserRepository,
  mockUserSessionManager,
} from 'src/tests/mocks/user.mocks';
import {
  AUTH_CHALLENGE_MANAGER_TOKEN,
  PASSWORD_HASHING_TOKEN,
  PASSWORD_RESET_MANAGER_TOKEN,
  USER_SESSION_MANAGER_TOKEN,
} from '../domain/auth.constants';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { AuthService } from './auth.service';
import { AppWebsocketsGateway } from 'src/infrastructure/websockets/websockets.gateway';
import { mockWebsockets } from 'src/tests/mocks/websockets.mock';

jest.mock('src/utils/tokens', () => ({
  generateToken: jest.fn(() => 'securetoken123'),
  hashToken: jest.fn(() => 'hashedToken123'),
}));

jest.mock('src/utils/ip', () => ({
  getClientIp: jest.fn(() => '192.168.1.1'),
}));

describe('AuthService', () => {
  let service: AuthService;
  let mockReq: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: LOGGER_TOKEN, useValue: mockLogger },
        { provide: USER_REPO_TOKEN, useValue: mockUserRepository },
        { provide: EVENT_TOKEN, useValue: mockEventPublisher },
        {
          provide: AUTH_CHALLENGE_MANAGER_TOKEN,
          useValue: mockAuthChallengeManager,
        },
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
        {
          provide: AppWebsocketsGateway,
          useValue: mockWebsockets,
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

    it('should handle errors during password hashing', async () => {
      jest
        .spyOn(User.prototype, 'setPassword')
        .mockRejectedValue(new Error('Hashing failed'));

      await expect(service.signup(signupDto)).rejects.toThrow('Hashing failed');
      expect(mockUserDomainService.validateCreateUser).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    beforeEach(() => {
      mockReq = {
        user: new UserResponseDto(
          new User({
            id: '123',
            email: 'login@login.com',
            firstName: 'login',
            lastName: 'login',
            passwordHash: 'hashedlogin',
          }),
        ),
        login: jest.fn((_, callback) => callback(null)),
      };

      jest.spyOn(service, 'loginSuccess').mockResolvedValue(undefined);
    });

    it('should log in the user successfully', async () => {
      const result = await service.login(mockReq, mockReq.user);
      expect(mockReq.login).toHaveBeenCalledWith(
        mockReq.user,
        expect.any(Function),
      );
      expect(service.loginSuccess).toHaveBeenCalledWith(mockReq);
      expect(result).toEqual(mockReq.user);
    });

    it('should throw an error if login fails', async () => {
      mockReq.login = jest.fn((_, callback) =>
        callback(new Error('Login failed')),
      );

      await expect(service.login(mockReq, mockReq.user)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockReq.login).toHaveBeenCalledWith(
        mockReq.user,
        expect.any(Function),
      );
      expect(service.loginSuccess).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      mockReq = {
        user: {
          id: '123',
          email: 'user@example.com',
        },
        sessionID: 'session123',
        session: {
          destroy: jest.fn((callback) => callback(null)),
        },
      };
    });

    it('should successfully logout the user', async () => {
      await service.logout(mockReq);
      expect(mockReq.session.destroy).toHaveBeenCalled();

      expect(mockLogger.log).toHaveBeenCalledWith(
        `User has logged out: ${mockReq.user.email}`,
        {
          userId: mockReq.user.id,
        },
      );
      expect(
        mockUserSessionManager.removeSessionFromRedis,
      ).toHaveBeenCalledWith(mockReq.user.id, mockReq.sessionID);
    });

    it('should handle errors when session destruction fails', async () => {
      const error = new Error('Session destruction failed');
      mockReq.session.destroy = jest.fn((callback) => callback(error));

      await expect(service.logout(mockReq)).rejects.toThrow(error);
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to destroy session',
        { error },
      );
      expect(
        mockUserSessionManager.removeSessionFromRedis,
      ).not.toHaveBeenCalled();
    });

    it('should resolve without error if no user is on the request', async () => {
      delete mockReq.user;

      await service.logout(mockReq);
      expect(mockReq.session.destroy).toHaveBeenCalled();
      expect(mockLogger.log).not.toHaveBeenCalled();
    });
  });

  describe('forgotPassword', () => {
    it('should transform all email inputs to lowercase', async () => {
      await service.forgotPassword('TEST@test.com');
      expect(mockUserRepository.existsByEmail).toHaveBeenCalledWith(
        'test@test.com',
      );
    });

    it('should send a password reset email to existing users', async () => {
      mockUserRepository.existsByEmail.mockResolvedValue(true);
      const result = await service.forgotPassword('test@example.com');

      expect(mockUserRepository.existsByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(
        mockPasswordResetManager.invalidateForgotPasswordToken,
      ).toHaveBeenCalledWith('test@example.com');
      expect(
        mockPasswordResetManager.saveForgotPasswordToken,
      ).toHaveBeenCalledWith('test@example.com', 'securetoken123');
      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        'auth.forgotPassword',
        expect.objectContaining({
          email: 'test@example.com',
          token: 'securetoken123',
        }),
      );
      expect(result.message).toContain(
        'If that email address is in our database, we will send you an email to reset your password.',
      );
    });

    it('should return a generic message when the user does not exist', async () => {
      mockUserRepository.existsByEmail.mockResolvedValue(false);

      const result = await service.forgotPassword('unknown@example.com');

      expect(mockUserRepository.existsByEmail).toHaveBeenCalledWith(
        'unknown@example.com',
      );
      expect(
        mockPasswordResetManager.invalidateForgotPasswordToken,
      ).not.toHaveBeenCalled();
      expect(mockEventPublisher.publish).not.toHaveBeenCalled();
      expect(result.message).toContain(
        'If that email address is in our database, we will send you an email to reset your password.',
      );
    });
  });

  describe('verifyResetToken', () => {
    it('should return valid token information when the token is valid', async () => {
      const token = 'token';
      const expectedEmail = 'email@test.com';
      mockPasswordResetManager.getEmailFromForgotPasswordToken.mockResolvedValue(
        expectedEmail,
      );

      const result = await service.verifyResetToken(token);

      expect(
        mockPasswordResetManager.getEmailFromForgotPasswordToken,
      ).toHaveBeenCalledWith(token);
      expect(result).toEqual({
        isValidToken: true,
        email: expectedEmail,
      });
    });

    it('should return invalid token information when the token is invalid', async () => {
      const token = 'badtoken';
      mockPasswordResetManager.getEmailFromForgotPasswordToken.mockResolvedValue(
        null,
      );

      const result = await service.verifyResetToken(token);

      expect(
        mockPasswordResetManager.getEmailFromForgotPasswordToken,
      ).toHaveBeenCalledWith(token);
      expect(result).toEqual({
        isValidToken: false,
        email: null,
      });
    });
  });

  describe('loginSuccess', () => {
    beforeEach(() => {
      mockReq = {
        user: {
          id: '123',
          email: 'user@example.com',
        },
        sessionID: 'session123',
        useragent: {
          os: 'Windows',
          platform: 'Desktop',
          version: '10',
          browser: 'Chrome',
          source: 'Mozilla/5.0 etc',
        },
        session: {
          destroy: jest.fn((callback) => callback(null)),
        },
      };
    });

    it('should log successful login', async () => {
      await service.loginSuccess(mockReq);
      expect(mockLogger.log).toHaveBeenCalledWith(
        `User has logged in successfully: ${mockReq.user.email}`,
        {
          userId: mockReq.user.id,
          email: mockReq.user.email,
        },
      );
    });

    it('should save the user session with user agent and IP address', async () => {
      await service.loginSuccess(mockReq);
      expect(mockUserSessionManager.saveUserSession).toHaveBeenCalledWith(
        mockReq.user.id,
        mockReq.sessionID,
        {
          userAgent: {
            os: 'Windows',
            platform: 'Desktop',
            version: '10',
            browser: 'Chrome',
            source: 'Mozilla/5.0 etc',
          },
          ipAddress: '192.168.1.1',
        },
      );
    });

    it('should handle missing user agent data', async () => {
      delete mockReq.useragent; // Simulate missing user agent
      await service.loginSuccess(mockReq);
      expect(mockUserSessionManager.saveUserSession).toHaveBeenCalledWith(
        mockReq.user.id,
        mockReq.sessionID,
        {
          userAgent: {},
          ipAddress: '192.168.1.1',
        },
      );
    });
  });

  describe('resetPassword', () => {
    it('should throw a ForbiddenException if token validation fails', async () => {
      const body: ResetPasswordDto = {
        email: 'test@example.com',
        token: 'invalid-token',
        password: 'new-password',
        confirmPassword: 'new-password',
      };
      mockPasswordResetManager.getEmailFromForgotPasswordToken.mockResolvedValue(
        null,
      );

      await expect(service.resetPassword(body)).rejects.toThrow(
        new ForbiddenException('Invalid or expired token.'),
      );
      expect(mockEventPublisher.publish).not.toHaveBeenCalled();
    });

    it('should throw a NotFoundException if no user is found', async () => {
      const body: ResetPasswordDto = {
        email: 'test@example.com',
        token: 'valid-token',
        password: 'new-password',
        confirmPassword: 'new-password',
      };
      mockPasswordResetManager.getEmailFromForgotPasswordToken.mockResolvedValue(
        'test@example.com',
      );
      jest.spyOn(mockUserRepository, 'getUserByEmail').mockResolvedValue(null);

      await expect(service.resetPassword(body)).rejects.toThrow(
        new NotFoundException('User not found.'),
      );

      expect(mockLogger.error).toHaveBeenCalled();
      expect(mockEventPublisher.publish).not.toHaveBeenCalled();
    });

    it('should reset the user password and cleanup after successful token validation', async () => {
      const body: ResetPasswordDto = {
        email: 'test@example.com',
        token: 'valid-token',
        password: 'new-password',
        confirmPassword: 'new-password',
      };
      const user = new User({
        id: '1',
        email: body.email,
        firstName: 'test',
        lastName: 'test',
        passwordHash: 'hashedpassword',
      });
      mockPasswordResetManager.getEmailFromForgotPasswordToken.mockResolvedValue(
        'test@example.com',
      );
      jest.spyOn(mockUserRepository, 'getUserByEmail').mockResolvedValue(user);

      await service.resetPassword(body);
      expect(mockUserRepository.updateUserPassword).toHaveBeenCalledWith(
        user.id,
        user.passwordHash,
      );
      expect(
        mockPasswordResetManager.removeForgotPasswordTokens,
      ).toHaveBeenCalledWith(body.email, 'hashedToken123');
      expect(mockUserSessionManager.removeAllUserSessions).toHaveBeenCalledWith(
        user.id,
      );
      expect(mockEventPublisher.publish).toHaveBeenCalledWith(
        'auth.changedPassword',
        expect.objectContaining({
          email: body.email,
        }),
      );
    });
  });
});
