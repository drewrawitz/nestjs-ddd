import {
  BadRequestException,
  Controller,
  Headers,
  Post,
  Request,
  RawBodyRequest,
} from '@nestjs/common';
import { StripeWebhookService } from './stripe.webhook.service';
import { Request as ExpressRequest } from 'express';

@Controller('v1/webhooks/stripe')
export class StripeWebhookController {
  constructor(private readonly webhookService: StripeWebhookService) {}

  @Post()
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Request() request: RawBodyRequest<ExpressRequest>,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    const event = await this.webhookService.constructEventFromPayload(
      signature,
      request.rawBody,
    );

    return this.webhookService.handleWebhookEvent(event);
  }
}
