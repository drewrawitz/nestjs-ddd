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
      startDate: Date;
      endDate: Date | null;
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

  get currentPeriodEnd() {
    return this.props.endDate;
  }

  get cancelAtPeriodEnd(): boolean {
    return this.props.cancelAtPeriodEnd ?? false;
  }

  get pauseStartDate(): Date | null {
    if (this.props.isPausedIndefinitely) {
      return this.props.endDate;
    }

    return null;
  }

  get pauseEndDate(): Date | null {
    return this.props.pauseResumesAt ?? null;
  }

  get isCanceling(): boolean {
    return Boolean(
      this.props.cancelAtPeriodEnd ||
        (this.props.cancelAtDate && isDateInFuture(this.props.cancelAtDate)),
    );
  }
}
