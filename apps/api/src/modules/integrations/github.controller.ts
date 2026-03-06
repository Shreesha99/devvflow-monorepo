import { Controller, Post, Headers, Body, Get, Patch } from '@nestjs/common';
import { githubEventsQueue } from '../../queues/github-events.queue';
import { GithubService } from './github/github.service';

@Controller('webhooks/github')
export class GithubController {
  constructor(private githubService: GithubService) {}

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

  @Get('repos')
  async getRepos(@Headers('authorization') auth: string) {
    const token = auth.replace('Bearer ', '');

    return this.githubService.getUserRepos(token);
  }

  @Patch('connect-repo')
  async connectRepo(
    @Headers('authorization') auth: string,
    @Body()
    body: {
      owner: string;
      repo: string;
    },
  ) {
    const token = auth.replace('Bearer ', '');

    return this.githubService.connectRepo(token, body.owner, body.repo);
  }
}
