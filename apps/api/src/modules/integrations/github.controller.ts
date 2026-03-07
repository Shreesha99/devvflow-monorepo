import { Controller, Post, Headers, Body, Get, Patch } from '@nestjs/common';
import { githubEventsQueue } from '../../queues/github-events.queue';
import { GithubService } from './github/github.service';
import { decrypt } from 'src/utils/crypto';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('webhooks/github')
export class GithubController {
  constructor(
    private githubService: GithubService,
    private prisma: PrismaService,
  ) {}

  @Post()
  async handleWebhook(
    @Headers('x-github-event') event: string,
    @Body() payload: any,
  ) {
    console.log('Webhook event:', event);
    console.log('Payload keys:', Object.keys(payload || {}));

    await githubEventsQueue.add('github-event', {
      event,
      payload,
    });

    return { received: true };
  }

  @Get('repos')
  async getRepos() {
    const integration = await this.prisma.integration.findFirst({
      where: {
        type: 'github',
      },
    });

    if (!integration || !integration.config) {
      throw new Error('GitHub not connected');
    }

    const token = decrypt((integration.config as any).accessToken);

    const res = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
      },
    });

    return res.data.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      private: repo.private,
      created_at: repo.created_at,
      owner: {
        login: repo.owner.login,
        avatar_url: repo.owner.avatar_url,
        type: repo.owner.type,
      },
    }));
  }

  @Patch('connect-repo')
  async connectRepo(@Body() body: { owner: string; repo: string }) {
    const { owner, repo } = body;

    const integration = await this.prisma.integration.findFirst({
      where: {
        type: 'github',
      },
    });

    if (!integration || !integration.config) {
      throw new Error('GitHub not connected');
    }

    const token = decrypt((integration.config as any).accessToken);

    const project = await this.prisma.project.create({
      data: {
        name: repo,
        githubRepoOwner: owner,
        githubRepoName: repo,
        organizationId: integration.organizationId,
      },
    });

    return project;
  }
}
