import { Injectable, Inject } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserCreatedEvent } from '../events/user-created.event';
import { IEmailService } from '../../../../application/interfaces/IEmailService';
import { EMAIL_TOKEN } from 'src/infrastructure/email/email.token';

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
