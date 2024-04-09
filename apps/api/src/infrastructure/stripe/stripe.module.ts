import { Module } from '@nestjs/common';
import { STRIPE_TOKEN } from './stripe.token';
import { StripeService } from './stripe.service';

@Module({
  providers: [
    {
      provide: STRIPE_TOKEN,
      useClass: StripeService,
    },
  ],
  exports: [STRIPE_TOKEN],
})
export class StripeModule {}
