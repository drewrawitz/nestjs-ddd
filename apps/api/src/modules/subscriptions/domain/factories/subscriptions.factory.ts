import { StripeSubscription } from '@prisma/client';
import { SubscriptionStatus } from '../model/SubscriptionStatus';
import { PlanFrequency } from '../model/PlanFrequency';
import { Subscription } from '../model/Subscription';

export class SubscriptionFactory {
  static computeSubscriptionStatus(
    sub: StripeSubscription,
  ): SubscriptionStatus {
    if (sub.status === 'trialing') {
      return SubscriptionStatus.Trialing;
    }

    if (sub.status === 'canceled') {
      return SubscriptionStatus.Canceled;
    }

    return SubscriptionStatus.Active;
  }

  static computePlanFrequency(sub: StripeSubscription): PlanFrequency {
    if (sub.interval === 'year') {
      return PlanFrequency.Annual;
    }

    if (sub.interval === 'month') {
      return sub.intervalCount === 3
        ? PlanFrequency.Quarterly
        : PlanFrequency.Monthly;
    }

    return PlanFrequency.Unknown;
  }

  static createFromSchema(sub: StripeSubscription): Subscription {
    const status = this.computeSubscriptionStatus(sub);
    const plan = this.computePlanFrequency(sub);

    return new Subscription({
      subscriptionId: sub.id,
      stripeCustomerId: sub.stripeCustomerId,
      status,
      plan,
    });
  }
}
