import {
  Controller,
  Post,
  Headers,
  Body,
  Get,
  Patch,
  Query,
} from '@nestjs/common';
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
    @Headers('x-github-delivery') deliveryId: string,
    @Body() payload: any,
  ) {
    await githubEventsQueue.add(
      'github-event',
      {
        event,
        payload,
      },
      {
        jobId: deliveryId,
      },
    );

    return { received: true };
  }

  @Get('repos')
  async getRepos(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '30',
  ) {
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    const integration = await this.prisma.integration.findFirst({
      where: { type: 'github' },
    });

    if (!integration || !integration.config) {
      throw new Error('GitHub not connected');
    }

    const token = decrypt((integration.config as any).accessToken);

    const res = await axios.get('https://api.github.com/user/repos', {
      params: {
        per_page: limitNumber,
        page: pageNumber,
        sort: 'full_name',
        direction: 'asc',
      },
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
      where: { type: 'github' },
    });

    if (!integration || !integration.config) {
      throw new Error('GitHub not connected');
    }

    const token = decrypt((integration.config as any).accessToken);

    let project = await this.prisma.project.findFirst({
      where: {
        githubRepoOwner: owner,
        githubRepoName: repo,
        organizationId: integration.organizationId,
      },
    });

    if (!project) {
      project = await this.prisma.project.create({
        data: {
          name: repo,
          githubRepoOwner: owner,
          githubRepoName: repo,
          organizationId: integration.organizationId,
        },
      });
    }

    // Create GitHub webhook automatically
    try {
      await axios.post(
        `https://api.github.com/repos/${owner}/${repo}/hooks`,
        {
          name: 'web',
          active: true,
          events: ['push', 'pull_request', 'issues', 'issue_comment'],
          config: {
            url: `${process.env.API_URL}/webhooks/github`,
            content_type: 'json',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github+json',
          },
        },
      );
    } catch (err) {}

    return project;
  }
}
