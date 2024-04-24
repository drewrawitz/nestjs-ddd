import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { IStripeService } from 'src/infrastructure/stripe/stripe.interface';
import { EMAIL_TOKEN } from 'src/infrastructure/email/email.token';
import { STRIPE_TOKEN } from 'src/infrastructure/stripe/stripe.token';
import { IEmailService } from 'src/infrastructure/email/email.interface';
import { UserCreatedEvent } from '../events/user-created.event';
import { USER_REPO_TOKEN } from '../../application/users.constants';
import { IUsersRepository } from '../interfaces/IUsersRepository';

@Injectable()
export class UserCreatedListener {
  constructor(
    @Inject(STRIPE_TOKEN) private stripeService: IStripeService,
    @Inject(EMAIL_TOKEN) private emailService: IEmailService,
    @Inject(USER_REPO_TOKEN) private readonly userRepository: IUsersRepository,
  ) {}

  @OnEvent('user.created')
  async handleUserCreatedEvent(event: UserCreatedEvent) {
    const { id, email, fullName } = event.user;

    const stripeCustomerId = await this.stripeService.createCustomer({
      email,
      name: fullName,
      internalUserId: id,
    });

    if (stripeCustomerId) {
      await this.userRepository.updateUserWithStripeCustomerId(
        id,
        stripeCustomerId,
      );
    }

    await this.emailService.sendEmail({
      to: email,
      from: '"The Class Digital Studio" <no-reply@theclass.com>',
      subject: 'Welcome to The Class',
      message:
        '<strong>Welcome!</strong><br /><br />We are so happy to have you.',
    });
  }
}
