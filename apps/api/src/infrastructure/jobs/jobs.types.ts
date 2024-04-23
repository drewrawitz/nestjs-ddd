import Stripe from 'stripe';
import { ISendEmailProps } from '../email/email.interface';

export const STRIPE_QUEUE = 'STRIPE_QUEUE';
export const EMAIL_QUEUE = 'EMAIL_QUEUE';

export type StripeJobPayload = {
  processEvent: {
    id: string;
    type: string;
    event: Stripe.Event;
  };
};

export type EmailJobPayload = {
  sendEmail: {
    logId: number;
    props: ISendEmailProps;
  };
};
