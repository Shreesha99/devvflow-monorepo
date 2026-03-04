import { Controller, Post, Headers, Body } from '@nestjs/common';
import { githubEventsQueue } from '../../queues/github-events.queue';

@Controller('webhooks/github')
export class GithubWebhookController {
  @Post()
  async handleWebhook(
    @Headers('x-github-event') event: string,
    @Body() payload: any,
  ) {
    await githubEventsQueue.add('github-event', {
      event,
      payload,
    });

    return { received: true };
  }
}
