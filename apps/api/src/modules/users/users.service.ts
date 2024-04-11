import { Inject, Injectable } from '@nestjs/common';
import { IEventPublisher } from 'src/infrastructure/events/event.interface';
import { EVENT_TOKEN } from 'src/infrastructure/events/event.token';
import { LOGGER_TOKEN } from 'src/infrastructure/logging/logger.token';
import { ILogger } from '../../infrastructure/logging/logger.interface';
import { UserCreatedEvent } from './domain/events/user-created.event';
import { User } from './domain/model/User';
import { UserDomainService } from './domain/services/user.domain.service';
import { CreateUserRequestDto } from './dto/create-user.dto';
import { USER_REPO_TOKEN } from './users.constants';
import { IUsersRepository } from './domain/interfaces/users.repository.interface';
import { SubscriptionsService } from '../subscriptions/application/subscriptions.service';
import { UserResponseDto } from './dto/user-response.dto';
import { SubscriptionResponseDto } from '../subscriptions/dto/subscription-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(LOGGER_TOKEN) private readonly logger: ILogger,
    @Inject(USER_REPO_TOKEN) private readonly userRepository: IUsersRepository,
    private userDomainService: UserDomainService,
    private subscriptionService: SubscriptionsService,
    @Inject(EVENT_TOKEN) private eventPublisher: IEventPublisher,
  ) {}

  async getUserById(userId: string) {
    const user = await this.userRepository.getUserById(userId);
    const subscription = user.stripeCustomerId
      ? await this.subscriptionService.getLatestSubscriptionForUser(
          user.stripeCustomerId,
        )
      : null;

    return {
      user: new UserResponseDto(user),
      subscription: subscription
        ? new SubscriptionResponseDto(subscription)
        : null,
    };
  }

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
