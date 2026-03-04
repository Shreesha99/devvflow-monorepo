import { Module } from '@nestjs/common';
import { GithubWebhookController } from './github.controller';

@Module({
  controllers: [GithubWebhookController],
})
export class IntegrationsModule {}
