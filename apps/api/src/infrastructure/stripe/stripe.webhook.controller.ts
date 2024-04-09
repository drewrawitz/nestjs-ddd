import {
  BadRequestException,
  Controller,
  Header,
  Headers,
  Post,
  Request,
  RawBodyRequest,
} from '@nestjs/common';
import { StripeWebhookService } from './stripe.webhook.service';

@Controller('v1/webhooks/stripe')
export class StripeWebhookController {
  constructor(private readonly webhookService: StripeWebhookService) {}

  @Post()
  @Header('content-type', 'application/json')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Request() request: RawBodyRequest<any>,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }

    const event = await this.webhookService.constructEventFromPayload(
      signature,
      request.rawBody,
    );

    console.log({ event });

    return {
      event,
    };
  }
}
