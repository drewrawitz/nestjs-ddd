import { Subscription } from '../model/Subscription';

export interface ISubscriptionsRepository {
  getLatestSubscriptionForUser(
    stripeCustomerId: string,
  ): Promise<Subscription | null>;
}
