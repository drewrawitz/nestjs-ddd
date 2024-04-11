import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/infrastructure/database/prisma.module';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsRepository } from './subscriptions.repository';
import { SUBSCRIPTIONS_REPO_TOKEN } from './subscriptions.constants';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: SUBSCRIPTIONS_REPO_TOKEN,
      useClass: SubscriptionsRepository,
    },
    SubscriptionsService,
  ],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
