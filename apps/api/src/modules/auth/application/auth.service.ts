import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { IEventPublisher } from 'src/infrastructure/events/event.interface';
import { EVENT_TOKEN } from 'src/infrastructure/events/event.token';
import { ILogger } from 'src/infrastructure/logging/logger.interface';
import { USER_REPO_TOKEN } from 'src/modules/users/application/users.constants';
import { UserCreatedEvent } from 'src/modules/users/domain/events/user-created.event';
import { IUsersRepository } from 'src/modules/users/domain/interfaces/IUsersRepository';
import { User } from 'src/modules/users/domain/model/User';
import { UserDomainService } from 'src/modules/users/domain/services/user.domain.service';
import { UserResponseDto } from 'src/modules/users/dto/user-response.dto';
import { getClientIp } from 'src/utils/ip';
import { generateToken, hashToken } from 'src/utils/tokens';
import { RequestWithUser } from 'src/utils/types';
import { LOGGER_TOKEN } from '../../../infrastructure/logging/logger.token';
import {
  AUTH_CHALLENGE_MANAGER_TOKEN,
  PASSWORD_HASHING_TOKEN,
  PASSWORD_RESET_MANAGER_TOKEN,
  USER_SESSION_MANAGER_TOKEN,
} from '../domain/auth.constants';
import { ChangedPasswordEvent } from '../domain/events/changed-password.event';
import { ForgotPasswordEvent } from '../domain/events/forgot-password.event';
import { IPasswordHashingService } from '../domain/interfaces/IPasswordHashingService';
import { IPasswordResetManager } from '../domain/interfaces/IPasswordResetManager';
import { IUserSessionManager } from '../domain/interfaces/IUserSessionManager';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { SignupDto } from '../dto/signup.dto';
import { AuthChallengeDto } from '../dto/auth-challenge.dto';
import { IAuthChallengeManager } from '../domain/interfaces/IAuthChallengeManager';

@Injectable()
export class AuthService {
  constructor(
    @Inject(LOGGER_TOKEN) private readonly logger: ILogger,
    @Inject(USER_SESSION_MANAGER_TOKEN)
    private readonly userSessionManager: IUserSessionManager,
    @Inject(PASSWORD_RESET_MANAGER_TOKEN)
    private readonly passwordResetManager: IPasswordResetManager,
    @Inject(USER_REPO_TOKEN) private readonly userRepository: IUsersRepository,
    @Inject(EVENT_TOKEN) private eventPublisher: IEventPublisher,
    @Inject(PASSWORD_HASHING_TOKEN)
    private passwordHashingService: IPasswordHashingService,
    private userDomainService: UserDomainService,
    @Inject(AUTH_CHALLENGE_MANAGER_TOKEN)
    private readonly authChallengeManager: IAuthChallengeManager,
  ) {}

  async getUserById(userId: string) {
    const user = await this.userRepository.getUserById(userId);

    if (!user) {
      return null;
    }

    return new UserResponseDto(user);
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserResponseDto | null> {
    const user = await this.userRepository
      .getUserByEmail(email)
      .catch(() => null);

    if (!user) {
      return null;
    }

    const isValid = await user.validatePassword(
      password,
      this.passwordHashingService,
    );

    if (!isValid) {
      return null;
    }

    return new UserResponseDto(user);
  }

  async signup(body: SignupDto) {
    const { email, password, firstName, lastName } = body;
    const user = new User({
      id: undefined,
      email,
      firstName,
      lastName,
    });

    await user.setPassword(password, this.passwordHashingService);

    try {
      await this.userDomainService.validateCreateUser(user);
      const createUser = await this.userRepository.createUser(user);
      this.logger.log('Successfully created user', { user: createUser });

      this.eventPublisher.publish(
        'user.created',
        new UserCreatedEvent(createUser),
      );

      return createUser;
    } catch (error) {
      this.logger.error('Failed to create user', { error, body });

      throw error;
    }
  }

  async login(req: RequestWithUser, user: UserResponseDto) {
    await new Promise((resolve, reject) => {
      req.login(user, (err) => {
        if (err) {
          this.logger.error('Failed to log in', { error: err });
          reject(
            new InternalServerErrorException("Couldn't log in after signup."),
          );
        }
        resolve(true);
      });
    });
    await this.loginSuccess(req);

    return user;
  }

  async logout(req: RequestWithUser): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      req.session.destroy(async (err) => {
        if (err) {
          // Handle error scenario by logging and rejecting the promise
          this.logger.error('Failed to destroy session', { error: err });
          return reject(err);
        }

        if (!req?.user?.id) {
          return resolve();
        }

        this.logger.log(`User has logged out: ${req.user.email}`, {
          userId: req.user.id,
        });

        await this.userSessionManager.removeSessionFromRedis(
          req.user.id,
          req.sessionID,
        );

        return resolve();
      });
    });
  }

  async loginSuccess(req: RequestWithUser) {
    this.logger.log(`User has logged in successfully: ${req.user.email}`, {
      userId: req.user.id,
      email: req.user.email,
    });
    const userAgent = req.useragent
      ? {
          os: req.useragent.os,
          platform: req.useragent.platform,
          version: req.useragent.version,
          browser: req.useragent.browser,
          source: req.useragent.source,
        }
      : {};

    await this.userSessionManager.saveUserSession(req.user.id, req.sessionID, {
      userAgent,
      ipAddress: getClientIp(req),
    });
  }

  async forgotPassword(rawEmail: string) {
    const email = rawEmail.toLowerCase().trim();
    this.logger.log(`Password reset requested for email: ${email}`);

    const doesUserExist = await this.userRepository.existsByEmail(email);

    if (doesUserExist) {
      const token = generateToken();
      await this.passwordResetManager.invalidateForgotPasswordToken(email);
      await this.passwordResetManager.saveForgotPasswordToken(email, token);

      this.eventPublisher.publish(
        'auth.forgotPassword',
        new ForgotPasswordEvent(email, token),
      );
    }

    return {
      message:
        'If that email address is in our database, we will send you an email to reset your password.',
    };
  }

  async verifyResetToken(token: string) {
    const email =
      await this.passwordResetManager.getEmailFromForgotPasswordToken(token);

    return {
      isValidToken: Boolean(email),
      email,
    };
  }

  async resetPassword(body: ResetPasswordDto) {
    const { email, token, password } = body;
    const normalizedEmail = email.toLowerCase().trim();
    const hashedToken = await hashToken(token);

    const isValidToken = await this.validateResetToken(
      hashedToken,
      normalizedEmail,
    );
    if (!isValidToken) {
      throw new ForbiddenException('Invalid or expired token.');
    }

    const user = await this.userRepository.getUserByEmail(normalizedEmail);
    if (!user) {
      this.logger.error(
        'User failed to reset their password. Account not found.',
        { email: normalizedEmail },
      );
      throw new NotFoundException('User not found.');
    }

    await this.updateUserPassword(user, password);
    await this.cleanupAfterPasswordReset(user.id!, email, hashedToken);
  }

  async initiateChallenge(userId: string, body: AuthChallengeDto) {
    return this.authChallengeManager.saveAuthChallengeToken(
      userId,
      body.action,
    );
  }

  private async validateResetToken(
    hashedToken: string,
    email: string,
  ): Promise<boolean> {
    const { isValidToken, email: tokenEmail } =
      await this.verifyResetToken(hashedToken);
    return isValidToken && tokenEmail === email;
  }

  private async updateUserPassword(
    user: User,
    newPassword: string,
  ): Promise<void> {
    await user.setPassword(newPassword, this.passwordHashingService);
    await this.userRepository.updateUserPassword(user.id!, user.passwordHash!);

    this.eventPublisher.publish(
      'auth.changedPassword',
      new ChangedPasswordEvent(user.email.getValue()),
    );
  }

  private async cleanupAfterPasswordReset(
    userId: string,
    email: string,
    token: string,
  ) {
    await Promise.all([
      this.passwordResetManager.removeForgotPasswordTokens(email, token),
      this.userSessionManager.removeAllUserSessions(userId),
    ]);
  }
}
