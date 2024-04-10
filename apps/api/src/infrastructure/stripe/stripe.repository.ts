import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/modules/database/prisma.service';
import { ICreateStripeEvent, IStripeRepository } from './stripe.interface';

@Injectable()
export class StripeRepository implements IStripeRepository {
  constructor(private db: PrismaService) {}

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
}
