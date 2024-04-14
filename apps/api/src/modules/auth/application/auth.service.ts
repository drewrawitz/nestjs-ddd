import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { LOGGER_TOKEN } from 'src/infrastructure/logging/logger.token';
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
  SESSION_STORE_TOKEN,
} from '../domain/auth.constants';
import { IPasswordHashingService } from '../domain/interfaces/password-hashing.interface';
import { UserResponseDto } from 'src/modules/users/dto/user-response.dto';
import { RequestWithUser } from 'src/utils/types';
import { IUserSessionStore } from '../domain/interfaces/session-store.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject(LOGGER_TOKEN) private readonly logger: ILogger,
    @Inject(SESSION_STORE_TOKEN)
    private readonly sessionStore: IUserSessionStore,
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
          console.error(err);
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

        await this.sessionStore.removeSessionFromRedis(
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
    await this.sessionStore.saveUserSession(req.user.id, req.sessionID);
  }
}
