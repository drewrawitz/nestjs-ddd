import { Module } from '@nestjs/common';
import { EmailModule } from 'src/infrastructure/email/email.module';
import { StripeModule } from 'src/infrastructure/stripe/stripe.module';
import { AccessModule } from '../../access/application/access.module';
import { SubscriptionsModule } from '../../subscriptions/application/subscriptions.module';
import { StripeSubscriptionChangeListener } from '../domain/listeners/stripe-subscription-change.listener';
import { UserCreatedListener } from '../domain/listeners/user-created.listener';
import { UserDomainService } from '../domain/services/user.domain.service';
import { UsersController } from './users.controller';
import { UsersService } from './services/users.service';
import { MFAService } from 'src/modules/mfa/mfa.service';

@Module({
  imports: [EmailModule, StripeModule, SubscriptionsModule, AccessModule],
  controllers: [UsersController],
  providers: [
    UserCreatedListener,
    StripeSubscriptionChangeListener,
    UsersService,
    MFAService,
    UserDomainService,
  ],
  exports: [UsersService, UserDomainService],
})
export class UsersModule {}
