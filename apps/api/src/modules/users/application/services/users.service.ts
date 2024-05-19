import ms from 'ms';
import { Inject, Injectable } from '@nestjs/common';
import { USER_REPO_TOKEN } from '../users.constants';
import { IUsersRepository } from '../../domain/interfaces/IUsersRepository';
import { SubscriptionsService } from 'src/modules/subscriptions/application/subscriptions.service';
import { UserResponseDto } from '../../dto/user-response.dto';
import { SubscriptionResponseDto } from 'src/modules/subscriptions/dto/subscription-response.dto';
import { AccessService } from 'src/modules/access/application/access.service';
import { AccessResponseDto } from 'src/modules/access/dto/access-response.dto';
import { EnvService } from 'src/infrastructure/env/env.service';
import { Subscription } from 'src/modules/subscriptions/domain/model/Subscription';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { RequestWithUser } from 'src/utils/types';
import { MFAService } from 'src/modules/mfa/mfa.service';

@Injectable()
export class UsersService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(USER_REPO_TOKEN) private readonly userRepository: IUsersRepository,
    private subscriptionService: SubscriptionsService,
    private accessService: AccessService,
    private envService: EnvService,
    private mfaService: MFAService,
  ) {}

  private cacheKey(userId: string) {
    return `user-${userId}`;
  }

  async invalidateCache(userId: string): Promise<void> {
    await this.cacheManager.del(this.cacheKey(userId));
  }

  async getCurrentUser(user: RequestWithUser['user']) {
    const mfa = await this.mfaService.getAllActiveMFAForUser(user.id);
    const filteredMfa = mfa.map((m) => ({
      type: m.type,
      createdAt: m.createdAt,
    }));

    return {
      ...user,
      mfa: filteredMfa,
    };
  }

  async getUserDetails(userId: string) {
    const cacheKey = this.cacheKey(userId);
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
}
