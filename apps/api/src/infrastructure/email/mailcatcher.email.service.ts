import { Inject } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { IEmailService, ISendEmailProps } from './email.interface';
import { ILogger } from '../logging/logger.interface';
import { LOGGER_TOKEN } from '../logging/logger.token';

export class MailcatcherEmailService implements IEmailService {
  private transporter;

  constructor(@Inject(LOGGER_TOKEN) private readonly logger: ILogger) {
    this.transporter = nodemailer.createTransport({
      host: 'localhost',
      port: 1025, // Default Mailcatcher port
    });
  }

  async sendEmail(props: ISendEmailProps): Promise<void> {
    const { from, to, subject, message } = props;

    try {
      throw new Error('failed to send email');
      await this.transporter.sendMail({
        from,
        to,
        subject,
        html: message,
      });
      this.logger.log(`Email sent to ${to} with subject "${subject}"`);
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}: ${err.message}`, {
        err,
        subject,
      });
      throw err;
    }
  }
}
