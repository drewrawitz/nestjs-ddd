import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { IEventPublisher } from '../events/event.interface';
import { EVENT_TOKEN } from '../events/event.token';
import { STRIPE_QUEUE, StripeJobPayload } from '../jobs/jobs.types';
import { ILogger } from '../logging/logger.interface';
import { LOGGER_TOKEN } from '../logging/logger.token';
import { StripeWebhookService } from './stripe.webhook.service';

@Processor(STRIPE_QUEUE, {
  concurrency: 5,
})
export class StripeProcessor extends WorkerHost {
  constructor(
    @Inject(EVENT_TOKEN) private eventPublisher: IEventPublisher,
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

    // Map a Stripe event to our app listeners
    const eventMap: { [key: string]: string } = {
      'customer.subscription.created': 'stripe.subscription.created',
      'customer.subscription.updated': 'stripe.subscription.updated',
      'customer.subscription.deleted': 'stripe.subscription.deleted',
    };

    const publishName = eventMap[data.type];
    if (publishName) {
      return this.eventPublisher.publish(publishName, data.event);
    } else {
      this.logger.warn(`Unknown event type: ${data.type}`);
      return null;
    }
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: Job) {
    const jobData = job.data as StripeJobPayload['processEvent'];

    if (!jobData?.event) {
      return;
    }

    return await this.webhookService.addStripeEvent(jobData);
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
