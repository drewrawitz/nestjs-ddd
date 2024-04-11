import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  ICreateStripeEvent,
  ICreateStripeSubscription,
  IStripeRepository,
} from './stripe.interface';

@Injectable()
export class StripeRepository implements IStripeRepository {
  constructor(private db: PrismaService) {}

  async existsByEventId(stripeEventId: string) {
    const find = await this.db.stripeEvent.findUnique({
      where: {
        stripeEventId,
      },
      select: {
        stripeEventId: true,
      },
    });

    return Boolean(find);
  }

  async createStripeEvent(body: ICreateStripeEvent) {
    const { eventId, type, payload } = body;

    return await this.db.stripeEvent.upsert({
      where: {
        stripeEventId: eventId,
      },
      create: {
        stripeEventId: eventId,
        type,
        payload,
      },
      update: {},
    });
  }

  async upsertStripeSubscription(body: ICreateStripeSubscription) {
    return await this.db.stripeSubscription.upsert({
      where: {
        id: body.id,
      },
      create: {
        ...body,
      },
      update: {
        ...body,
      },
    });
  }
}
