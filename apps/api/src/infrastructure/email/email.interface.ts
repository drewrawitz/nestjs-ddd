import { EmailLog, EmailStatus } from '@prisma/client';

export interface ISendEmailProps {
  to: string;
  from: string;
  subject: string;
  message: string;
}

export interface IEmailService {
  sendEmail(props: ISendEmailProps): Promise<void>;
}

export interface IEmailJobQueue {
  sendEmail(props: ISendEmailProps): Promise<void>;
}

export interface IEmailLogRepository {
  createEmailLog(props: ISendEmailProps): Promise<EmailLog>;
  updateEmailStatus(id: number, status: EmailStatus): Promise<void>;
}
