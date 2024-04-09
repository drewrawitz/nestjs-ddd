import {
  BadRequestException,
  Controller,
  Headers,
  Post,
  Request,
  RawBodyRequest,
} from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { StripeWebhookService } from './stripe.webhook.service';

@Controller('v1/webhooks/stripe')
export class StripeWebhookController {
  constructor(private readonly webhookService: StripeWebhookService) {}

  @Post()
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Request() request: RawBodyRequest<FastifyRequest>,
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
