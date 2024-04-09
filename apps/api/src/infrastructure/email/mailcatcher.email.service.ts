import {
  IEmailService,
  SendEmailProps,
} from '../../application/interfaces/IEmailService';
import * as nodemailer from 'nodemailer';

export class MailcatcherEmailService implements IEmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'localhost',
      port: 1025, // Default Mailcatcher port
    });
  }

  async sendEmail(props: SendEmailProps): Promise<void> {
    const { from, to, subject, message } = props;
    await this.transporter.sendMail({
      from,
      to,
      subject,
      html: message,
    });
  }
}
