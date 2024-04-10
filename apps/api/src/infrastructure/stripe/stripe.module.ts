import { Module } from '@nestjs/common';
import { STRIPE_REPO_TOKEN, STRIPE_TOKEN } from './stripe.token';
import { StripeService } from './stripe.service';
import { StripeWebhookController } from './stripe.webhook.controller';
import { StripeWebhookService } from './stripe.webhook.service';
import { JobsModule } from '../jobs/jobs.module';
import { StripeRepository } from './stripe.repository';
import { PrismaModule } from 'src/modules/database/prisma.module';
import { StripeProcessor } from './stripe.webhook.processor';

@Module({
  imports: [JobsModule, PrismaModule],
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
  exports: [STRIPE_TOKEN],
})
export class StripeModule {}
