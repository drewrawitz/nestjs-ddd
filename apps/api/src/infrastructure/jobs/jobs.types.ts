import Stripe from 'stripe';

export const STRIPE_QUEUE = 'STRIPE_QUEUE';

export type StripeJobPayload = {
  processEvent: {
    id: string;
    type: string;
    event: Stripe.Event;
  };
};

export type AccountJobPayload = {
  deleteAccount: {
    accountId: string;
  };
};
