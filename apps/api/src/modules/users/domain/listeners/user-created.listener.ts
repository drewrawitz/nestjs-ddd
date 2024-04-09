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
    await this.emailService.sendWelcomeEmail(event.user.email);
  }
}
