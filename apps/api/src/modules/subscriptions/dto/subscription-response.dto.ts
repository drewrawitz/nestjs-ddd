import { PlanFrequency } from '../domain/model/PlanFrequency';
import { Subscription } from '../domain/model/Subscription';
import { SubscriptionStatus } from '../domain/model/SubscriptionStatus';

export class SubscriptionResponseDto {
  id: string;
  status: SubscriptionStatus;
  plan: PlanFrequency;
  isCanceling: boolean;
  pauseStartDate: Date | null;
  pauseEndDate: Date | null;
  currentPeriodEnd: Date | null;

  constructor(sub: Subscription) {
    this.id = sub.subscriptionId;
    this.status = sub.status;
    this.plan = sub.plan;
    this.isCanceling = sub.isCanceling;
    this.currentPeriodEnd = sub.currentPeriodEnd;
    this.pauseStartDate = sub.pauseStartDate;
    this.pauseEndDate = sub.pauseEndDate;
  }
}
