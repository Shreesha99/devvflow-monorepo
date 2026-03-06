import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.project.findMany({
      include: {
        tasks: true,
        organization: true,
      },
    });
  }

  async findByOrganization(orgId: string) {
    return this.prisma.project.findMany({
      where: {
        organizationId: orgId,
      },
    });
  }

  async create(data: { name: string; organizationId: string }) {
    return this.prisma.project.create({
      data,
    });
  }

  async connectGithubRepo(projectId: string, owner: string, repo: string) {
    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        githubRepoOwner: owner,
        githubRepoName: repo,
      },
    });
  }
}
