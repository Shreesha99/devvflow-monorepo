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

  async connectRepo(accessToken: string, owner: string, repo: string) {
    // 1. find or create organization using repo owner
    let organization = await this.prisma.organization.findFirst({
      where: { name: owner },
    });

    if (!organization) {
      organization = await this.prisma.organization.create({
        data: {
          name: owner,
        },
      });
    }

    // 2. find project
    let project = await this.prisma.project.findFirst({
      where: {
        githubRepoOwner: owner,
        githubRepoName: repo,
      },
    });

    // 3. create project if missing
    if (!project) {
      project = await this.prisma.project.create({
        data: {
          name: repo,
          githubRepoOwner: owner,
          githubRepoName: repo,
          organizationId: organization.id,
        },
      });
    }

    console.log('Webhook URL:', process.env.WEBHOOK_URL);

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
      if (
        err.response?.data?.errors?.[0]?.message ===
        'Hook already exists on this repository'
      ) {
        console.log('Webhook already installed');
      } else {
        throw err;
      }
    }

    return project;
  }
}
