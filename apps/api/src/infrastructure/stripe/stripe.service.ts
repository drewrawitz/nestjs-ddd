import { Inject } from '@nestjs/common';
import Stripe from 'stripe';
import {
  ICreateStripeCustomer,
  IStripeService,
} from '../../application/interfaces/IStripeService';
import { ILogger } from '../logging/logger.interface';
import { LOGGER_TOKEN } from '../logging/logger.token';
import { EnvService } from '../env/env.service';

export class StripeService implements IStripeService {
  private stripe: Stripe;

  constructor(
    private envService: EnvService,
    @Inject(LOGGER_TOKEN) private readonly logger: ILogger,
  ) {
    this.stripe = new Stripe(this.envService.get('STRIPE_SECRET_KEY'), {
      apiVersion: '2023-10-16',
    });
  }

  async createCustomer(props: ICreateStripeCustomer) {
    const { email, name, internalUserId } = props;

    try {
      const customer = await this.stripe.customers.create({
        email,
        ...(name && {
          name,
        }),
        ...(internalUserId && {
          metadata: {
            internalUserId,
          },
        }),
      });

      const customerId = customer.id;

      this.logger.log(`Successfully created Stripe Customer: ${customerId}`);

      return customerId;
    } catch (error) {
      this.logger.error('Failed to create Stripe Customer', {
        error,
        body: {
          email,
          name,
        },
      });
    }
  }
}
