import { Inject } from '@nestjs/common';
import { IEmailJobQueue, ISendEmailProps } from './email.interface';
import { JOBS_TOKEN } from '../jobs/jobs.token';
import { IJobService } from '../jobs/jobs.interface';
import { LOGGER_TOKEN } from '../logging/logger.token';
import { ILogger } from '../logging/logger.interface';
import { EMAIL_QUEUE, EmailJobPayload } from '../jobs/jobs.types';

export class QueuedEmailServiceDecorator implements IEmailJobQueue {
  constructor(
    @Inject(LOGGER_TOKEN) private readonly logger: ILogger,
    @Inject(JOBS_TOKEN) private jobService: IJobService,
  ) {}

  async sendEmail(props: ISendEmailProps): Promise<void> {
    try {
      // Add the job
      const job = await this.jobService.addJob<EmailJobPayload['sendEmail']>(
        EMAIL_QUEUE,
        'sendEmail',
        {
          props,
        },
        {
          removeOnComplete: true,
          attempts: 3,
        },
      );
      this.logger.log(`Job added to the Email Queue: ${job}`);
    } catch (error) {
      this.logger.error('Failed to add job to Email Queue.', {
        error,
      });
    }
  }
}
