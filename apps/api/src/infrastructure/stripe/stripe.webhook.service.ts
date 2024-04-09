import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ILogger } from '../logging/logger.interface';
import { LOGGER_TOKEN } from '../logging/logger.token';
import Stripe from 'stripe';
import { EnvService } from '../env/env.service';

@Injectable()
export class StripeWebhookService {
  private stripe: Stripe;

  constructor(
    @Inject(LOGGER_TOKEN) private readonly logger: ILogger,
    private envService: EnvService,
  ) {
    this.stripe = new Stripe(this.envService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  async constructEventFromPayload(signature: string, payload?: Buffer) {
    const webhookSecret = this.envService.get('STRIPE_WEBHOOK_SECRET');

    if (!payload) {
      this.logger.error(
        'Error constructing event from payload (Stripe Webhook). Missing payload.',
      );
      throw new BadRequestException('Missing payload');
    }

    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
  }

  async handleWebhookEvent(event: Stripe.Event) {
    switch (event.type) {
      case 'payment_intent.succeeded':
        return this.onPaymentIntentSucceeded(event);

      default:
        this.logger.warn(`Unhandled Stripe Webhook Event: ${event.type}`, {
          id: event.id,
          type: event.type,
        });

        return;
    }
  }

  private async onPaymentIntentSucceeded(
    event: Stripe.PaymentIntentSucceededEvent,
  ) {
    const data = event.data.object;

    console.log('Handle event', data);

    // TODO: do something with this
    return {
      data,
    };
  }
}
