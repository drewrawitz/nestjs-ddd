import { SubscriptionStatus } from './SubscriptionStatus';
import { PlanFrequency } from './PlanFrequency';
import { isDateInFuture } from 'src/utils/dates';

export class Subscription {
  constructor(
    public readonly props: {
      subscriptionId: string;
      stripeCustomerId: string;
      status: SubscriptionStatus;
      plan?: PlanFrequency;
      cancelAtPeriodEnd?: boolean;
      pauseResumesAt?: Date | null;
      isPausedIndefinitely?: boolean;
      cancelAtDate?: Date | null;
    },
  ) {}

  get subscriptionId(): string {
    return this.props.subscriptionId;
  }

  get stripeCustomerId(): string {
    return this.props.stripeCustomerId;
  }

  get status(): SubscriptionStatus {
    return this.props.status;
  }

  get plan(): PlanFrequency {
    return this.props.plan ?? PlanFrequency.Unknown;
  }

  get cancelAtPeriodEnd(): boolean {
    return this.props.cancelAtPeriodEnd ?? false;
  }

  get isCanceling(): boolean {
    return Boolean(
      this.props.cancelAtPeriodEnd ||
        (this.props.cancelAtDate && isDateInFuture(this.props.cancelAtDate)),
    );
  }
}
