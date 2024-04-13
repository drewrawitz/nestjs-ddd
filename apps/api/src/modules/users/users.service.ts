import ms from 'ms';
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
import { AccessService } from '../access/application/access.service';
import { AccessResponseDto } from '../access/dto/access-response.dto';
import { EnvService } from 'src/infrastructure/env/env.service';
import { Subscription } from '../subscriptions/domain/model/Subscription';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class UsersService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(LOGGER_TOKEN) private readonly logger: ILogger,
    @Inject(USER_REPO_TOKEN) private readonly userRepository: IUsersRepository,
    private userDomainService: UserDomainService,
    private subscriptionService: SubscriptionsService,
    private accessService: AccessService,
    private envService: EnvService,
    @Inject(EVENT_TOKEN) private eventPublisher: IEventPublisher,
  ) {}

  async invalidateCache(userId: string): Promise<void> {
    const cacheKey = `user-${userId}`;
    await this.cacheManager.del(cacheKey);
  }

  async getUserDetails(userId: string) {
    const cacheKey = `user-${userId}`;
    const userData = await this.cacheManager.get<any>(cacheKey);

    if (userData) {
      return JSON.parse(userData);
    }

    const user = await this.fetchUserDetails(userId);
    const subscription = await this.fetchSubscriptionDetails(
      user.stripeCustomerId,
    );
    const accessDetails = await this.evaluateUserAccess(userId, subscription);

    const data = {
      user: new UserResponseDto(user),
      subscription: subscription
        ? new SubscriptionResponseDto(subscription)
        : null,
      ...accessDetails,
    };
    await this.cacheManager.set(cacheKey, JSON.stringify(data), ms('24h'));

    return data;
  }

  private async fetchUserDetails(userId: string) {
    return this.userRepository.getUserById(userId);
  }

  private async fetchSubscriptionDetails(stripeCustomerId?: string | null) {
    return stripeCustomerId
      ? await this.subscriptionService.getLatestSubscriptionForUser(
          stripeCustomerId,
        )
      : null;
  }

  private async evaluateUserAccess(
    userId: string,
    subscription: Subscription | null,
  ) {
    const accessArray = await this.accessService.getAccessForUser(userId);
    const grantedAccess = accessArray
      .map((access) => new AccessResponseDto(access))
      .filter((obj) => obj.isActive);

    const hasAccessToSubscription = Boolean(
      (subscription && ['active', 'trialing'].includes(subscription.status)) ||
        grantedAccess.some(
          (obj) =>
            obj.productId ===
            this.envService.get('STRIPE_SUBSCRIPTION_PRODUCT_ID'),
        ),
    );

    return { grantedAccess, hasAccessToSubscription };
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
