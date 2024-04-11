import { Injectable } from '@nestjs/common';
import { StripeSubscription as PrismaSubscription } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { ISubscriptionsRepository } from '../domain/interfaces/subscriptions.repository.interface';
import { Subscription as DomainSubscription } from '../domain/model/Subscription';
import { SubscriptionFactory } from '../domain/factories/subscriptions.factory';

@Injectable()
export class SubscriptionsRepository implements ISubscriptionsRepository {
  constructor(private db: PrismaService) {}

  private toDomain(subscription: PrismaSubscription): DomainSubscription {
    return SubscriptionFactory.createFromSchema(subscription);
  }

  async getLatestSubscriptionForUser(stripeCustomerId: string) {
    const sub = await this.db.stripeSubscription.findFirst({
      where: {
        stripeCustomerId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!sub) {
      return null;
    }

    return this.toDomain(sub);
  }
}
