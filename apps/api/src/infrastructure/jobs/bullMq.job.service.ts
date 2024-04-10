import { InjectQueue } from '@nestjs/bullmq';
import { IJobService } from './jobs.interface';
import { STRIPE_QUEUE } from './jobs.types';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class BullJobService implements IJobService {
  private queueMap: { [key: string]: Queue };

  constructor(@InjectQueue(STRIPE_QUEUE) readonly stripeQueue: Queue) {
    this.queueMap = {
      [STRIPE_QUEUE]: stripeQueue,
    };
  }

  async addJob<T>(queueName: string, jobName: string, data: T): Promise<void> {
    const queue = this.queueMap[queueName];

    if (!queue) {
      throw new Error(`Queue ${queueName} is not registered.`);
    }

    await queue.add(jobName, data);
  }
}
