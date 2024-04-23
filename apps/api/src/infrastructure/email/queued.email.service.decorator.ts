import { Inject } from '@nestjs/common';
import { IJobService } from '../jobs/jobs.interface';
import { JOBS_TOKEN } from '../jobs/jobs.token';
import { EMAIL_QUEUE, EmailJobPayload } from '../jobs/jobs.types';
import { ILogger } from '../logging/logger.interface';
import { LOGGER_TOKEN } from '../logging/logger.token';
import { EmailLogService } from './email-log.service';
import { IEmailJobQueue, ISendEmailProps } from './email.interface';

export class QueuedEmailServiceDecorator implements IEmailJobQueue {
  constructor(
    @Inject(LOGGER_TOKEN) private readonly logger: ILogger,
    @Inject(JOBS_TOKEN) private jobService: IJobService,
    private readonly emailLogService: EmailLogService,
  ) {}

  async sendEmail(props: ISendEmailProps): Promise<void> {
    try {
      const logEntry = await this.emailLogService.createLog(props);

      // Add the job
      const job = await this.jobService.addJob<EmailJobPayload['sendEmail']>(
        EMAIL_QUEUE,
        'sendEmail',
        {
          logId: logEntry.id,
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
