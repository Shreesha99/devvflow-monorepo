import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class GithubWebhookService {
  private readonly logger = new Logger(GithubWebhookService.name);

  constructor(
    @InjectQueue('github-events') private githubQueue: Queue,
    private prisma: PrismaService,
  ) {}

  async processEvent(
    event: string,
    payload: any,
    signature: string,
    projectId: string,
  ) {
    this.logger.log(`Processing GitHub event ${event}`);

    await this.githubQueue.add('github-event', {
      event,
      payload,
      projectId,
    });
  }
  async findProjectByRepo(owner: string, repo: string) {
    return this.prisma.project.findFirst({
      where: {
        githubRepoOwner: owner,
        githubRepoName: repo,
      },
    });
  }
}
