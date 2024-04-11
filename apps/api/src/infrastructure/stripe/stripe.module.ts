import { Module } from '@nestjs/common';
import { PrismaModule } from '../database/prisma.module';
import { EventModule } from '../events/event.module';
import { JobsModule } from '../jobs/jobs.module';
import { StripeRepository } from './stripe.repository';
import { StripeService } from './stripe.service';
import { STRIPE_REPO_TOKEN, STRIPE_TOKEN } from './stripe.token';
import { StripeWebhookController } from './stripe.webhook.controller';
import { StripeProcessor } from './stripe.webhook.processor';
import { StripeWebhookService } from './stripe.webhook.service';

@Module({
  imports: [JobsModule, EventModule, PrismaModule],
  controllers: [StripeWebhookController],
  providers: [
    StripeWebhookService,
    StripeProcessor,
    {
      provide: STRIPE_TOKEN,
      useClass: StripeService,
    },
    {
      provide: STRIPE_REPO_TOKEN,
      useClass: StripeRepository,
    },
  ],
  exports: [STRIPE_TOKEN, STRIPE_REPO_TOKEN],
})
export class StripeModule {}
