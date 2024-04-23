import { Inject, Injectable } from '@nestjs/common';
import { IEmailLogRepository, ISendEmailProps } from './email.interface';
import { EmailLog, EmailStatus } from '@prisma/client';
import { EMAIL_LOG_REPO_TOKEN } from './email.token';

@Injectable()
export class EmailLogService {
  constructor(
    @Inject(EMAIL_LOG_REPO_TOKEN)
    private readonly emailLogRepo: IEmailLogRepository,
  ) {}

  async createLog(emailDetails: ISendEmailProps): Promise<EmailLog> {
    return await this.emailLogRepo.createEmailLog(emailDetails);
  }

  async updateStatus(id: number, status: EmailStatus): Promise<void> {
    return await this.emailLogRepo.updateEmailStatus(id, status);
  }
}
