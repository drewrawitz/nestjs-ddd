import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/infrastructure/database/prisma.module';
import { EmailModule } from 'src/infrastructure/email/email.module';
import { EventModule } from 'src/infrastructure/events/event.module';
import { StripeModule } from 'src/infrastructure/stripe/stripe.module';
import { StripeSubscriptionChangeListener } from './domain/listeners/stripe-subscription-change.listener';
import { UserCreatedListener } from './domain/listeners/user-created.listener';
import { UserDomainService } from './domain/services/user.domain.service';
import { USER_REPO_TOKEN } from './users.constants';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { SubscriptionsModule } from '../subscriptions/application/subscriptions.module';
import { AccessModule } from '../access/application/access.module';

@Module({
  imports: [
    PrismaModule,
    EventModule,
    EmailModule,
    StripeModule,
    SubscriptionsModule,
    AccessModule,
  ],
  controllers: [UsersController],
  providers: [
    {
      provide: USER_REPO_TOKEN,
      useClass: UsersRepository,
    },
    UserCreatedListener,
    StripeSubscriptionChangeListener,
    UsersService,
    UserDomainService,
  ],
  exports: [UserDomainService, USER_REPO_TOKEN],
})
export class UsersModule {}
