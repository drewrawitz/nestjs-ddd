import { Module } from '@nestjs/common';
import { JobsModule } from '../jobs/jobs.module';
import { StripeWebhookController } from './stripe.webhook.controller';
import { StripeProcessor } from './stripe.webhook.processor';
import { StripeWebhookService } from './stripe.webhook.service';

@Module({
  imports: [JobsModule],
  controllers: [StripeWebhookController],
  providers: [StripeWebhookService, StripeProcessor],
})
export class StripeModule {}
