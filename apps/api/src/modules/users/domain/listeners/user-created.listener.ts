import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { IStripeService } from 'src/application/interfaces/IStripeService';
import { EMAIL_TOKEN } from 'src/infrastructure/email/email.token';
import { STRIPE_TOKEN } from 'src/infrastructure/stripe/stripe.token';
import { IEmailService } from '../../../../application/interfaces/IEmailService';
import { UsersRepository } from '../../users.repository';
import { UserCreatedEvent } from '../events/user-created.event';

@Injectable()
export class UserCreatedListener {
  constructor(
    @Inject(STRIPE_TOKEN) private stripeService: IStripeService,
    @Inject(EMAIL_TOKEN) private emailService: IEmailService,
    private readonly userRepo: UsersRepository,
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
      await this.userRepo.updateUserWithStripeCustomerId(id, stripeCustomerId);
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
