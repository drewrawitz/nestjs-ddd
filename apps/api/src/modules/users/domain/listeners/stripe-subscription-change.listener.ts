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
export class StripeSubscriptionChangeListener {
  constructor(
    @Inject(USER_REPO_TOKEN) private readonly userRepository: IUsersRepository,
    @Inject(LOGGER_TOKEN) private readonly logger: ILogger,
    @Inject(STRIPE_REPO_TOKEN) private readonly stripeRepo: IStripeRepository,
  ) {}

  private convertUnixTimestampToDate(unix: number | null) {
    if (!unix) {
      return null;
    }

    return new Date(unix * 1000);
  }

  private async handleStripeSubscriptionUpsert(
    event:
      | Stripe.CustomerSubscriptionCreatedEvent
      | Stripe.CustomerSubscriptionUpdatedEvent
      | Stripe.CustomerSubscriptionDeletedEvent,
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

    const plan = subscription.items.data?.[0]?.plan;

    if (!plan) {
      this.logger.error(`Plan not found for Subscription: ${subscription.id}`);
      return;
    }

    await this.stripeRepo.upsertStripeSubscription({
      id: subscription.id,
      status: subscription.status,
      stripeCustomerId: String(customer),
      planId: plan.id,
      currency: plan.currency,
      interval: plan.interval,
      intervalCount: plan.interval_count,
      productId: String(plan.product),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      cancelAtDate: this.convertUnixTimestampToDate(subscription.cancel_at),
      canceledAtDate: this.convertUnixTimestampToDate(subscription.canceled_at),
      createdAt: this.convertUnixTimestampToDate(subscription.created)!,
      startDate: this.convertUnixTimestampToDate(
        subscription.current_period_start,
      )!,
      endDate: this.convertUnixTimestampToDate(
        subscription.current_period_end,
      )!,
      trialStartDate: this.convertUnixTimestampToDate(subscription.trial_start),
      trialEndDate: this.convertUnixTimestampToDate(subscription.trial_end),
    });
  }

  @OnEvent('stripe.subscription.created')
  async handleStripeSubscriptionCreated(
    event: Stripe.CustomerSubscriptionCreatedEvent,
  ) {
    await this.handleStripeSubscriptionUpsert(event);
  }

  @OnEvent('stripe.subscription.updated')
  async handleStripeSubscriptionUpdated(
    event: Stripe.CustomerSubscriptionUpdatedEvent,
  ) {
    await this.handleStripeSubscriptionUpsert(event);
  }

  @OnEvent('stripe.subscription.deleted')
  async handleStripeSubscriptionDeleted(
    event: Stripe.CustomerSubscriptionDeletedEvent,
  ) {
    await this.handleStripeSubscriptionUpsert(event);
  }
}
