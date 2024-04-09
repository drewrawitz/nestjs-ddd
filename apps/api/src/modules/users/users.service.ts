import { Inject, Injectable } from '@nestjs/common';
import { CreateUserRequestDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';
import { User } from './domain/model/User';
import { UserDomainService } from './domain/services/user.domain.service';
import { ILogger } from '../../infrastructure/logging/logger.interface';
import { LOGGER_TOKEN } from 'src/infrastructure/logging/logger.token';
import { UserCreatedEvent } from './domain/events/user-created.event';
import { EVENT_TOKEN } from 'src/infrastructure/events/event.token';
import { IEventPublisher } from 'src/application/interfaces/IEventPublisher';

@Injectable()
export class UsersService {
  constructor(
    @Inject(LOGGER_TOKEN) private readonly logger: ILogger,
    private userRepository: UsersRepository,
    private userDomainService: UserDomainService,
    @Inject(EVENT_TOKEN) private eventPublisher: IEventPublisher,
  ) {}

  async createUser(body: CreateUserRequestDto) {
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

      this.eventPublisher.publish(
        'user.created',
        new UserCreatedEvent(createUser),
      );

      return createUser;
    } catch (err) {
      this.logger.error('error: createUser()', err.stack, { body });

      throw err;
    }
  }
}
