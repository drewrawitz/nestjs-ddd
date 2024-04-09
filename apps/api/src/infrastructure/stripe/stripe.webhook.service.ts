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
    console.log('constructEventFromPayload', { signature, payload });

    if (!payload) {
      throw new BadRequestException('Missing payload');
    }

    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
  }
}
