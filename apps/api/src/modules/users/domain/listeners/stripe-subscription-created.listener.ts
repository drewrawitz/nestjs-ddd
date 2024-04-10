import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ILogger } from 'src/infrastructure/logging/logger.interface';
import { LOGGER_TOKEN } from 'src/infrastructure/logging/logger.token';
import { IStripeRepository } from 'src/infrastructure/stripe/stripe.interface';
import { STRIPE_REPO_TOKEN } from 'src/infrastructure/stripe/stripe.token';
import Stripe from 'stripe';
import { USER_REPO_TOKEN } from '../../users.constants';
import { IUsersRepository } from '../interfaces/users.repository.interface';

@Injectable()
export class StripeSubscriptionCreatedListener {
  constructor(
    @Inject(USER_REPO_TOKEN) private readonly userRepository: IUsersRepository,
    @Inject(LOGGER_TOKEN) private readonly logger: ILogger,
    @Inject(STRIPE_REPO_TOKEN) private readonly stripeRepo: IStripeRepository,
  ) {}

  private convertUnixTimestampToDate(unix: number) {
    return new Date(unix * 1000);
  }

  @OnEvent('stripe.subscription.created')
  async handleStripeSubscriptionCreated(
    event: Stripe.CustomerSubscriptionCreatedEvent,
  ) {
    const subscription = event.data.object;
    const { customer } = subscription;
    const user = await this.userRepository.existsByStripeCustomerId(
      String(customer),
    );

    if (!user) {
      this.logger.warn(`User not found for Stripe customer ID: ${customer}`);
      return;
    }

    await this.stripeRepo.createStripeSubscription({
      id: subscription.id,
      status: subscription.status,
      stripeCustomerId: String(customer),
      createdAt: this.convertUnixTimestampToDate(subscription.created),
      startDate: this.convertUnixTimestampToDate(
        subscription.current_period_start,
      ),
      endDate: this.convertUnixTimestampToDate(subscription.current_period_end),
      ...(subscription.trial_start && {
        trialStartDate: this.convertUnixTimestampToDate(
          subscription.trial_start,
        ),
      }),
      ...(subscription.trial_end && {
        trialEndDate: this.convertUnixTimestampToDate(subscription.trial_end),
      }),
    });
  }
}
