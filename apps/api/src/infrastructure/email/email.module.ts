import { Module } from '@nestjs/common';
import { EMAIL_SERVICE_TOKEN, EMAIL_TOKEN } from './email.token';
import { MailcatcherEmailService } from './mailcatcher.email.service';
import { JobsModule } from '../jobs/jobs.module';
import { QueuedEmailServiceDecorator } from './queued.email.service.decorator';
import { EmailProcessor } from './email.processor';

@Module({
  imports: [JobsModule],
  providers: [
    {
      provide: EMAIL_TOKEN,
      useClass: QueuedEmailServiceDecorator,
    },
    {
      provide: EMAIL_SERVICE_TOKEN,
      useClass: MailcatcherEmailService,
    },
    EmailProcessor,
  ],
  exports: [EMAIL_TOKEN, EMAIL_SERVICE_TOKEN],
})
export class EmailModule {}
