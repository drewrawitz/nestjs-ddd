import { Injectable } from '@nestjs/common';
import { StripeSubscription as PrismaSubscription } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { ISubscriptionsRepository } from './interfaces/subscriptions.repository.interface';
import { Subscription as DomainSubscription } from './model/Subscription';
import { SubscriptionFactory } from './factories/subscriptions.factory';

@Injectable()
export class SubscriptionsRepository implements ISubscriptionsRepository {
  constructor(private db: PrismaService) {}

  private toDomain(subscription: PrismaSubscription): DomainSubscription {
    return SubscriptionFactory.createFromSchema(subscription);
  }

  async getSubscriptionsForUser(stripeCustomerId: string) {
    const subs = await this.db.stripeSubscription.findMany({
      where: {
        stripeCustomerId,
      },
    });

    return Promise.all(subs.map((sub) => this.toDomain(sub)));
  }
}
