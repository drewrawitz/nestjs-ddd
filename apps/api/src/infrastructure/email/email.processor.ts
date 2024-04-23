import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { EmailStatus } from '@prisma/client';
import { Job } from 'bullmq';
import { EMAIL_QUEUE, EmailJobPayload } from '../jobs/jobs.types';
import { ILogger } from '../logging/logger.interface';
import { LOGGER_TOKEN } from '../logging/logger.token';
import { EMAIL_SERVICE_TOKEN } from './email.token';
import { IEmailService } from './email.interface';
import { EmailLogService } from './email-log.service';

@Processor(EMAIL_QUEUE, {
  concurrency: 5,
})
export class EmailProcessor extends WorkerHost {
  constructor(
    @Inject(LOGGER_TOKEN) private readonly logger: ILogger,
    @Inject(EMAIL_SERVICE_TOKEN) private readonly emailService: IEmailService,
    private readonly emailLogService: EmailLogService,
  ) {
    super();
  }

  async process(job: Job<any, any, keyof EmailJobPayload>): Promise<any> {
    this.logger.log(`Processing event: ${job.name}`, {
      id: job.id,
      data: job.data,
    });
    switch (job.name) {
      case 'sendEmail':
        return this.sendEmail(job.data as EmailJobPayload['sendEmail']);
      default:
        this.logger.error(`Unknown job name: ${job.name}`);
    }
  }

  async sendEmail(data: EmailJobPayload['sendEmail']) {
    try {
      await this.emailService.sendEmail(data.props);
      await this.emailLogService.updateStatus(data.logId, EmailStatus.SENT);
    } catch (error) {
      await this.emailLogService.updateStatus(data.logId, EmailStatus.FAILED);
      throw error;
    }
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: Job) {
    const jobData = job.data as EmailJobPayload['sendEmail'];

    this.logger.log(`Job completed: sendEmail (${job.id})`, {
      id: job.id,
      name: job.name,
      data: jobData,
    });
  }

  @OnWorkerEvent('failed')
  async onFail(job: Job) {
    const jobData = job.data as EmailJobPayload['sendEmail'];

    this.logger.error('Job failed', {
      id: job.id,
      name: job.name,
      data: jobData,
    });
  }
}
