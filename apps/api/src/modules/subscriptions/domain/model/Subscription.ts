import { SubscriptionStatus } from './SubscriptionStatus';
import { PlanFrequency } from './PlanFrequency';

export class Subscription {
  subscriptionId: string;
  stripeCustomerId: string;
  status?: SubscriptionStatus;
  plan?: PlanFrequency;

  constructor(props: {
    subscriptionId: string;
    stripeCustomerId: string;
    status?: SubscriptionStatus;
    plan?: PlanFrequency;
  }) {
    this.subscriptionId = props.subscriptionId;
    this.stripeCustomerId = props.stripeCustomerId;
    this.status = props.status;
    this.plan = props.plan;
  }
}
