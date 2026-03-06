import {
  Controller,
  Post,
  Headers,
  Req,
  HttpCode,
  Logger,
} from '@nestjs/common';
import type { Request } from 'express';
import { GithubWebhookService } from './github.webhook.service';

@Controller('webhooks/github')
export class GithubWebhookController {
  private readonly logger = new Logger(GithubWebhookController.name);

  constructor(private readonly githubService: GithubWebhookService) {}

  @Post()
  @HttpCode(200)
  async handleWebhook(
    @Headers('x-github-event') event: string,
    @Headers('x-hub-signature-256') signature: string,
    @Req() req: Request,
  ) {
    const payload = req.body;

    this.logger.log(`Received GitHub event: ${event}`);

    await this.githubService.processEvent(event, payload, signature);

    return { received: true };
  }
}
