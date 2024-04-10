import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { ILogger } from '../logging/logger.interface';
import { LOGGER_TOKEN } from '../logging/logger.token';
import Stripe from 'stripe';
import { EnvService } from '../env/env.service';
import { IJobService } from '../jobs/jobs.interface';
import { JOBS_TOKEN } from '../jobs/jobs.token';
import { STRIPE_QUEUE, StripeJobPayload } from '../jobs/jobs.types';

@Injectable()
export class StripeWebhookService {
  private stripe: Stripe;

  constructor(
    @Inject(JOBS_TOKEN) private jobService: IJobService,
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
    const acceptedEvents = ['payment_intent.succeeded'];

    if (!acceptedEvents.includes(event.type)) {
      this.logger.warn(`Unhandled Stripe Webhook Event: ${event.type}`, {
        id: event.id,
        type: event.type,
      });

      return true;
    }

    try {
      // Add the job
      await this.jobService.addJob<StripeJobPayload['processEvent']>(
        STRIPE_QUEUE,
        'processEvent',
        {
          id: event.id,
          type: event.type,
          event,
        },
        {
          jobId: event.id,
          removeOnComplete: true,
        },
      );

      // await this.stripeQueue.add(
      //   'processEvent',
      //   {
      //     id: event.id,
      //     type: event.type,
      //     event,
      //   },
      //   {
      //     jobId: event.id,
      //     attempts: 1,
      //   },
      // );
    } catch (error) {
      this.logger.error('Failed to add job to queue.', {
        error,
        eventId: event.id,
      });
    }

    return {
      returned: true,
    };
  }
}
