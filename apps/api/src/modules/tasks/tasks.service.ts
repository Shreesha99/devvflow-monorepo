import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

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
    const task = await this.prisma.task.create({
      data,
    });

    console.log('NEW TASK CREATED:', task.id);

    RealtimeGateway.io.emit('task.created', task);

    return task;
  }

  async updateStatus(id: number, status: string) {
    return this.prisma.task.update({
      where: { id },
      data: { status: status as any },
    });
  }
}
