import { Module } from '@nestjs/common';
import { EmailModule } from 'src/infrastructure/email/email.module';
import { EventModule } from 'src/infrastructure/events/event.module';
import { StripeModule } from 'src/infrastructure/stripe/stripe.module';
import { PrismaModule } from '../database/prisma.module';
import { UserCreatedListener } from './domain/listeners/user-created.listener';
import { StripeSubscriptionChangeListener } from './domain/listeners/stripe-subscription-change.listener';
import { UserDomainService } from './domain/services/user.domain.service';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './users.service';
import { USER_REPO_TOKEN } from './users.constants';

@Module({
  imports: [PrismaModule, EventModule, EmailModule, StripeModule],
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
})
export class UsersModule {}
