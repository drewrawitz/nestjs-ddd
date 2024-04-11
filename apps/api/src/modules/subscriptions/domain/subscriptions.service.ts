import { Inject, Injectable } from '@nestjs/common';
import { ISubscriptionsRepository } from './interfaces/subscriptions.repository.interface';
import { SUBSCRIPTIONS_REPO_TOKEN } from './subscriptions.constants';

@Injectable()
export class SubscriptionsService {
  constructor(
    @Inject(SUBSCRIPTIONS_REPO_TOKEN)
    private readonly subscriptionsRepo: ISubscriptionsRepository,
  ) {}

  async getSubscriptionsForUser(stripeCustomerId: string) {
    return await this.subscriptionsRepo.getSubscriptionsForUser(
      stripeCustomerId,
    );
  }
}
