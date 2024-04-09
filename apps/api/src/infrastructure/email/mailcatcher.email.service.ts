import { IEmailService } from '../../application/interfaces/IEmailService';
import * as nodemailer from 'nodemailer';

export class MailcatcherEmailService implements IEmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'localhost',
      port: 1025, // Default Mailcatcher port
    });
  }

  async sendWelcomeEmail(recipient: string): Promise<void> {
    await this.transporter.sendMail({
      from: '"Example" <example@example.com>',
      to: recipient,
      subject: 'Welcome!',
      text: 'Welcome to our service!',
      html: '<b>Welcome to our service!</b>',
    });
  }
}
