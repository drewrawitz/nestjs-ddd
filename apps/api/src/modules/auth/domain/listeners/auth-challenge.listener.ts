import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EMAIL_TOKEN } from 'src/infrastructure/email/email.token';
import { IEmailService } from 'src/infrastructure/email/email.interface';
import { AuthChallengeInitEvent } from '../events/auth-challenge.event';
import { AuthChallengeType } from '@app/shared';

@Injectable()
export class AuthChallengeInitListener {
  constructor(@Inject(EMAIL_TOKEN) private emailService: IEmailService) {}

  @OnEvent('auth.challengeInit')
  async handleAuthChallengeInitEvent(event: AuthChallengeInitEvent) {
    const { user, token, body } = event;

    if (body.type === AuthChallengeType.Email) {
      await this.emailService.sendEmail({
        to: user.email,
        from: '"App Name" <no-reply@myapp.com>',
        subject: 'Your verification link',
        message: `<strong>Code:</strong> ${token}`,
      });
    }
  }
}
