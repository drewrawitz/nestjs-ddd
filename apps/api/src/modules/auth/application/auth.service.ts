import { Inject, Injectable } from '@nestjs/common';
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

@Injectable()
export class AuthService {
  constructor(
    @Inject(LOGGER_TOKEN) private readonly logger: ILogger,
    @Inject(USER_REPO_TOKEN) private readonly userRepository: IUsersRepository,
    @Inject(EVENT_TOKEN) private eventPublisher: IEventPublisher,
    private userDomainService: UserDomainService,
  ) {}

  async signup(body: SignupDto) {
    const { email, firstName, lastName } = body;
    const user = new User({
      id: undefined,
      email,
      firstName,
      lastName,
    });

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
}
