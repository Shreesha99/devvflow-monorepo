import { Module } from '@nestjs/common';
import { GithubController } from './github.controller';
import { GithubWebhookController } from './github/github.webhook.controller';
import { GithubService } from './github/github.service';
import { GithubWebhookService } from './github/github.webhook.service';
import { QueuesModule } from '../../queues/queues.module';

@Module({
  imports: [QueuesModule],
  controllers: [GithubController, GithubWebhookController],
  providers: [GithubService, GithubWebhookService],
  exports: [GithubService],
})
export class IntegrationsModule {}
