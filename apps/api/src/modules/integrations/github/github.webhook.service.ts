import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

@Injectable()
export class GithubWebhookService {
  private readonly logger = new Logger(GithubWebhookService.name);

  constructor(@InjectQueue('github-events') private githubQueue: Queue) {}

  async processEvent(event: string, payload: any, signature: string) {
    this.logger.log(`Processing GitHub event ${event}`);

    await this.githubQueue.add('github-event', {
      event,
      payload,
    });
  }
}
