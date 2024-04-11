export interface ICreateStripeCustomer {
  email: string;
  name: string | null;
  internalUserId?: string;
}

export interface IStripeService {
  createCustomer(props: ICreateStripeCustomer): Promise<string | undefined>; // Returns Stripe Customer ID
}

export interface ICreateStripeEvent {
  eventId: string;
  type: string;
  payload: any;
}

export interface ICreateStripeSubscription {
  id: string;
  status: string;
  stripeCustomerId: string;
  currency: string;
  planId: string;
  productId: string;
  interval: string;
  intervalCount: number;
  startDate: Date;
  endDate: Date;
  cancelAtDate: Date | null;
  canceledAtDate: Date | null;
  cancelAtPeriodEnd: boolean;
  trialStartDate: Date | null;
  trialEndDate: Date | null;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface IStripeRepository {
  existsByEventId(eventId: string): Promise<boolean>;
  createStripeEvent(props: ICreateStripeEvent): Promise<any>;
  upsertStripeSubscription(props: ICreateStripeSubscription): Promise<any>;
}
