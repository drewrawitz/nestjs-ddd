import { StripeSubscription } from '@prisma/client';
import { SubscriptionStatus } from '../model/SubscriptionStatus';
import { PlanFrequency } from '../model/PlanFrequency';
import { Subscription } from '../model/Subscription';
import { isDateBefore } from 'src/utils/dates';

export class SubscriptionFactory {
  static computeSubscriptionStatus(
    sub: StripeSubscription,
  ): SubscriptionStatus {
    const isActiveSub =
      sub.endDate && isDateBefore(new Date(Date.now()), new Date(sub.endDate));

    if (sub.status === 'canceled') {
      return SubscriptionStatus.Canceled;
    }

    if (sub.status === 'paused') {
      return SubscriptionStatus.Paused;
    }

    if (sub.isPausedIndefinitely && !isActiveSub) {
      return SubscriptionStatus.Paused;
    }

    if (
      sub.pauseResumesAt &&
      isDateBefore(new Date(Date.now()), sub.pauseResumesAt) &&
      !isActiveSub
    ) {
      return SubscriptionStatus.Paused;
    }

    if (sub.status === 'trialing') {
      return SubscriptionStatus.Trialing;
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
      cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
      cancelAtDate: sub.cancelAtDate,
      startDate: sub.startDate,
      endDate: sub.endDate,
      isPausedIndefinitely: sub.isPausedIndefinitely,
      pauseResumesAt: sub.pauseResumesAt,
    });
  }
}
