import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EMAIL_TOKEN } from 'src/infrastructure/email/email.token';
import { IEmailService } from 'src/infrastructure/email/email.interface';
import { ForgotPasswordEvent } from '../events/forgot-password.event';

@Injectable()
export class ForgotPasswordListener {
  constructor(@Inject(EMAIL_TOKEN) private emailService: IEmailService) {}

  @OnEvent('auth.forgotPassword')
  async handleForgotPasswordEvent(event: ForgotPasswordEvent) {
    const { email, token } = event;

    await this.emailService.sendEmail({
      to: email,
      from: '"The Class Digital Studio" <no-reply@theclass.com>',
      subject: 'Forgot Password?',
      message: `<strong>Code:</strong> ${token}`,
    });
  }
}
