import { Module } from '@nestjs/common';
import {
  EMAIL_LOG_REPO_TOKEN,
  EMAIL_SERVICE_TOKEN,
  EMAIL_TOKEN,
} from './email.token';
import { MailcatcherEmailService } from './mailcatcher.email.service';
import { JobsModule } from '../jobs/jobs.module';
import { QueuedEmailServiceDecorator } from './queued.email.service.decorator';
import { EmailProcessor } from './email.processor';
import { EmailLogService } from './email-log.service';
import { EmailLogRepository } from './email-log.repository';
import { PrismaModule } from '../database/prisma.module';

@Module({
  imports: [JobsModule, PrismaModule],
  providers: [
    {
      provide: EMAIL_TOKEN,
      useClass: QueuedEmailServiceDecorator,
    },
    {
      provide: EMAIL_SERVICE_TOKEN,
      useClass: MailcatcherEmailService,
    },
    {
      provide: EMAIL_LOG_REPO_TOKEN,
      useClass: EmailLogRepository,
    },
    EmailProcessor,
    EmailLogService,
  ],
  exports: [EMAIL_TOKEN, EMAIL_SERVICE_TOKEN, EMAIL_LOG_REPO_TOKEN],
})
export class EmailModule {}
