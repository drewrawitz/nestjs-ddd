import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { EMAIL_QUEUE, EmailJobPayload } from '../jobs/jobs.types';
import { ILogger } from '../logging/logger.interface';
import { LOGGER_TOKEN } from '../logging/logger.token';
import { EMAIL_SERVICE_TOKEN } from './email.token';
import { IEmailService } from './email.interface';

@Processor(EMAIL_QUEUE, {
  concurrency: 5,
})
export class EmailProcessor extends WorkerHost {
  constructor(
    @Inject(LOGGER_TOKEN) private readonly logger: ILogger,
    @Inject(EMAIL_SERVICE_TOKEN) private readonly emailService: IEmailService,
  ) {
    super();
  }

  async process(job: Job<any, any, keyof EmailJobPayload>): Promise<any> {
    switch (job.name) {
      case 'sendEmail':
        return this.sendEmail(job.data as EmailJobPayload['sendEmail']);
      default:
        this.logger.error(`Unknown job name: ${job.name}`);
    }
  }

  async sendEmail(data: EmailJobPayload['sendEmail']) {
    this.logger.log(`Processing event: sendEmail`, data);
  }

  @OnWorkerEvent('completed')
  async onCompleted(job: Job) {
    const jobData = job.data as EmailJobPayload['sendEmail'];

    if (!jobData?.props) {
      return;
    }

    return await this.emailService.sendEmail(jobData.props);
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
