import { Module } from '@nestjs/common';
import { EMAIL_TOKEN } from './email.token';
import { MailcatcherEmailService } from './mailcatcher.email.service';

@Module({
  providers: [
    {
      provide: EMAIL_TOKEN,
      useClass: MailcatcherEmailService,
    },
  ],
  exports: [EMAIL_TOKEN],
})
export class EmailModule {}
