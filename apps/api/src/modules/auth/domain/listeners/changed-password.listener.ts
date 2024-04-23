import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EMAIL_TOKEN } from 'src/infrastructure/email/email.token';
import { IEmailService } from 'src/infrastructure/email/email.interface';
import { ChangedPasswordEvent } from '../events/changed-password.event';

@Injectable()
export class ChangedPasswordListener {
  constructor(@Inject(EMAIL_TOKEN) private emailService: IEmailService) {}

  @OnEvent('auth.changedPassword')
  async handleChangedPasswordEvent(event: ChangedPasswordEvent) {
    const { email } = event;

    await this.emailService.sendEmail({
      to: email,
      from: '"The Class Digital Studio" <no-reply@theclass.com>',
      subject: 'Your password has been changed',
      message: `If this was not you, please contact us immediately.`,
    });
  }
}
