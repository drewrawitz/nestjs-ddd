import { Module } from '@nestjs/common';
import { JobsModule } from '../jobs/jobs.module';
import { EmailProcessor } from './email.processor';
import { EmailLogService } from './email-log.service';

@Module({
  imports: [JobsModule],
  providers: [EmailProcessor, EmailLogService],
})
export class EmailModule {}
