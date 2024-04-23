import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { IEmailLogRepository, ISendEmailProps } from './email.interface';
import { EmailStatus } from '@prisma/client';

@Injectable()
export class EmailLogRepository implements IEmailLogRepository {
  constructor(private db: PrismaService) {}

  async createEmailLog(body: ISendEmailProps) {
    const { to, subject } = body;

    return await this.db.emailLog.create({
      data: {
        to,
        subject,
        status: EmailStatus.PENDING,
      },
    });
  }

  async updateEmailStatus(id: number, status: EmailStatus) {
    await this.db.emailLog.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  }
}
