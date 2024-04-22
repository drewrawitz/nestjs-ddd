import {
  NotFoundException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { LOGGER_TOKEN } from '../../../infrastructure/logging/logger.token';
import { UserDomainService } from 'src/modules/users/domain/services/user.domain.service';
import { USER_REPO_TOKEN } from 'src/modules/users/users.constants';
import { IUsersRepository } from 'src/modules/users/domain/interfaces/users.repository.interface';
import { EVENT_TOKEN } from 'src/infrastructure/events/event.token';
import { IEventPublisher } from 'src/infrastructure/events/event.interface';
import { SignupDto } from '../dto/signup.dto';
import { ILogger } from 'src/infrastructure/logging/logger.interface';
import { UserCreatedEvent } from 'src/modules/users/domain/events/user-created.event';
import { User } from 'src/modules/users/domain/model/User';
import {
  PASSWORD_HASHING_TOKEN,
  PASSWORD_RESET_MANAGER_TOKEN,
  USER_SESSION_MANAGER_TOKEN,
} from '../domain/auth.constants';
import { IPasswordHashingService } from '../domain/interfaces/IPasswordHashingService';
import { UserResponseDto } from 'src/modules/users/dto/user-response.dto';
import { RequestWithUser } from 'src/utils/types';
import { IUserSessionManager } from '../domain/interfaces/IUserSessionManager';
import { getClientIp } from 'src/utils/ip';
import { generateToken } from 'src/utils/generate-token';
import { IPasswordResetManager } from '../domain/interfaces/IPasswordResetManager';
import { ForgotPasswordEvent } from '../domain/events/forgot-password.event';
import { ResetPasswordDto } from '../dto/reset-password.dto';

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
  ) {}

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

  async resetPassword(userId: string, body: ResetPasswordDto) {
    const userEmail = body.email.toLowerCase().trim();

    // Check if the token is a valid token
    const { isValidToken, email: tokenEmail } = await this.verifyResetToken(
      body.token,
    );

    if (!isValidToken || tokenEmail !== userEmail) {
      throw new ForbiddenException('Invalid token.');
    }

    const user = await this.userRepository.getUserById(userId);

    if (!user) {
      this.logger.error(
        'User failed to reset their password. Account not found.',
        { userId, email: userEmail },
      );
      throw new NotFoundException('User not found.');
    }

    try {
      await user.setPassword(body.password, this.passwordHashingService);
      await this.userRepository.updateUserPassword(userId, user.passwordHash!);

      await Promise.all([
        this.passwordResetManager.removeForgotPasswordTokens(
          body.email,
          body.token,
        ),
        this.userSessionManager.removeAllUserSessions(userId),
      ]);

      return {
        success: true,
      };
    } catch (err) {
      throw new InternalServerErrorException('Failed to reset password.');
    }
  }
}
