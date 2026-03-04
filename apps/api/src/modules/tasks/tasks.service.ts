import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.task.findMany({
      include: {
        project: true,
        activities: true,
      },
    });
  }

  async findByProject(projectId: string) {
    return this.prisma.task.findMany({
      where: {
        projectId,
      },
    });
  }

  async create(data: {
    title: string;
    description?: string;
    projectId: string;
    assigneeId?: string;
  }) {
    return this.prisma.task.create({
      data,
    });
  }

  async updateStatus(id: number, status: string) {
    return this.prisma.task.update({
      where: { id },
      data: { status: status as any },
    });
  }
}
