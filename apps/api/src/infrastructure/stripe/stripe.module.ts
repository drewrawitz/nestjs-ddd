import { Module } from '@nestjs/common';
import { STRIPE_TOKEN } from './stripe.token';
import { StripeService } from './stripe.service';
import { StripeWebhookController } from './stripe.webhook.controller';
import { StripeWebhookService } from './stripe.webhook.service';
import { STRIPE_QUEUE } from '../jobs/jobs.config';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.registerQueue({
      name: STRIPE_QUEUE,
    }),
  ],
  controllers: [StripeWebhookController],
  providers: [
    StripeWebhookService,
    {
      provide: STRIPE_TOKEN,
      useClass: StripeService,
    },
  ],
  exports: [STRIPE_TOKEN],
})
export class StripeModule {}
