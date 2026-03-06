import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class GithubService {
  constructor(private prisma: PrismaService) {}

  async getUserRepos(accessToken: string) {
    const response = await axios.get('https://api.github.com/user/repos', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
      },
    });

    return response.data.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      private: repo.private,
    }));
  }

  async connectRepo(
    accessToken: string,
    projectId: string,
    owner: string,
    repo: string,
  ) {
    // save mapping
    await this.prisma.project.update({
      where: { id: projectId },
      data: {
        githubRepoOwner: owner,
        githubRepoName: repo,
      },
    });
    console.log('Webhook URL:', process.env.WEBHOOK_URL);

    // install webhook
    try {
      await axios.post(
        `https://api.github.com/repos/${owner}/${repo}/hooks`,
        {
          name: 'web',
          active: true,
          events: ['push', 'pull_request'],
          config: {
            url: process.env.WEBHOOK_URL,
            content_type: 'json',
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/vnd.github+json',
          },
        },
      );
    } catch (err: any) {
      // Ignore "hook already exists"
      if (
        err.response?.data?.errors?.[0]?.message ===
        'Hook already exists on this repository'
      ) {
        console.log('Webhook already installed');
      } else {
        throw err;
      }
    }

    return { connected: true };
  }
}
