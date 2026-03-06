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

    const repoFullName = payload.repository?.full_name;

    if (!repoFullName) {
      this.logger.warn('Webhook ignored: no repository info');
      return { ignored: true };
    }

    const [owner, repo] = repoFullName.split('/');

    const project = await this.githubService.findProjectByRepo(owner, repo);

    if (!project) {
      this.logger.warn(`Webhook ignored: repo ${owner}/${repo} not linked`);
      return { ignored: true };
    }

    await this.githubService.processEvent(
      event,
      payload,
      signature,
      project.id,
    );

    return { received: true };
  }
}
