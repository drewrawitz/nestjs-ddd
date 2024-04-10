import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { STRIPE_QUEUE, StripeJobPayload } from '../jobs/jobs.types';
import { StripeWebhookService } from './stripe.webhook.service';
// import Stripe from 'stripe';
import { Inject } from '@nestjs/common';
import { LOGGER_TOKEN } from '../logging/logger.token';
import { ILogger } from '../logging/logger.interface';

@Processor(STRIPE_QUEUE, {
  concurrency: 5,
})
export class StripeProcessor extends WorkerHost {
  constructor(
    @Inject(LOGGER_TOKEN) private readonly logger: ILogger,
    private readonly webhookService: StripeWebhookService,
  ) {
    super();
  }

  async process(job: Job<any, any, keyof StripeJobPayload>): Promise<any> {
    switch (job.name) {
      case 'processEvent':
        return this.processEvent(job.data as StripeJobPayload['processEvent']);
      default:
        this.logger.error(`Unknown job name: ${job.name}`);
    }
  }

  async processEvent(data: StripeJobPayload['processEvent']) {
    this.logger.log(`Processing event: ${data.type}`);
    // switch (data.type) {
    //   case 'payment_intent.succeeded':
    //     return this.webhookService.onPaymentIntentSucceeded(
    //       data.event as Stripe.PaymentIntentSucceededEvent,
    //     );
    // }
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: Job) {
    const jobData = job.data as StripeJobPayload['processEvent'];

    if (!jobData?.event) {
      return;
    }

    return this.webhookService.addStripeEvent(jobData);
  }

  @OnWorkerEvent('failed')
  async onFail(job: Job) {
    const jobData = job.data as StripeJobPayload['processEvent'];

    if (!jobData?.event) {
      return;
    }

    this.logger.error('Job failed', {
      id: job.id,
      name: job.name,
      data: jobData,
    });
  }
}
