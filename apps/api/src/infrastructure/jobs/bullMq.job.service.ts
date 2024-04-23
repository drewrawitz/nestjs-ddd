import { InjectQueue } from '@nestjs/bullmq';
import { IGenericJobOptions, IJobService } from './jobs.interface';
import { EMAIL_QUEUE, STRIPE_QUEUE } from './jobs.types';
import { Injectable } from '@nestjs/common';
import { JobsOptions, Queue } from 'bullmq';

@Injectable()
export class BullJobService implements IJobService {
  private queueMap: { [key: string]: Queue };

  constructor(
    @InjectQueue(STRIPE_QUEUE) readonly stripeQueue: Queue,
    @InjectQueue(EMAIL_QUEUE) readonly emailQueue: Queue,
  ) {
    this.queueMap = {
      [STRIPE_QUEUE]: stripeQueue,
      [EMAIL_QUEUE]: emailQueue,
    };
  }

  async addJob<T>(
    queueName: string,
    jobName: string,
    data: T,
    opts?: IGenericJobOptions,
  ): Promise<string | undefined> {
    const queue = this.queueMap[queueName];

    if (!queue) {
      throw new Error(`Queue ${queueName} is not registered.`);
    }

    const bullOpts = this.mapGenericOptionsToBullOptions(opts);

    const job = await queue.add(jobName, data, bullOpts);

    return job.id;
  }

  private mapGenericOptionsToBullOptions(
    opts?: IGenericJobOptions,
  ): JobsOptions {
    // Translate generic options to BullMQ options
    const bullOpts: JobsOptions = {};

    if (opts?.jobId) bullOpts.jobId = opts.jobId;
    if (opts?.attempts) bullOpts.attempts = opts.attempts;
    if (opts?.removeOnComplete)
      bullOpts.removeOnComplete = opts.removeOnComplete;

    return bullOpts;
  }
}
