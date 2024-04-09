import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EMAIL_TOKEN } from 'src/infrastructure/email/email.token';
import { IEmailService } from '../../../../application/interfaces/IEmailService';
import { UserCreatedEvent } from '../events/user-created.event';

@Injectable()
export class UserCreatedListener {
  constructor(@Inject(EMAIL_TOKEN) private emailService: IEmailService) {}

  @OnEvent('user.created')
  async handleUserCreatedEvent(event: UserCreatedEvent) {
    const to = event.user.email;

    await this.emailService.sendEmail({
      to,
      from: '"The Class Digital Studio" <no-reply@theclass.com>',
      subject: 'Welcome to The Class',
      message:
        '<strong>Welcome!</strong><br /><br />We are so happy to have you.',
    });
  }
}
