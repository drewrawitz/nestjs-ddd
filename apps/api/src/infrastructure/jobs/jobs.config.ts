import { InjectQueue } from '@nestjs/bullmq';
import Stripe from 'stripe';

export const STRIPE_QUEUE = 'STRIPE_QUEUE';

export const InjectStripeQueue = (): ParameterDecorator =>
  InjectQueue(STRIPE_QUEUE);

export type StripeJobTypes = {
  processEvent: {
    id: string;
    type: string;
    event: Stripe.Event;
  };
};

export type JobTypes = StripeJobTypes;
