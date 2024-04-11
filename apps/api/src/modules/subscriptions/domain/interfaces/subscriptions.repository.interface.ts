import { Subscription } from '../model/Subscription';

export interface ISubscriptionsRepository {
  getSubscriptionsForUser(stripeCustomerId: string): Promise<Subscription[]>;
}
