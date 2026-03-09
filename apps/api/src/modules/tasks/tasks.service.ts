import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { TaskStatus } from '@prisma/client';

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
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        activities: {
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
  }

  async create(data: {
    title: string;
    description?: string;
    projectId: string;
    assigneeId?: string;
  }) {
    const result = await this.prisma.task.aggregate({
      where: {
        projectId: data.projectId,
      },
      _max: {
        number: true,
      },
    });

    const nextNumber = (result._max.number ?? 0) + 1;

    console.log(
      'Creating task for project:',
      data.projectId,
      'next:',
      nextNumber,
    );

    const task = await this.prisma.task.create({
      data: {
        ...data,
        number: nextNumber,
      },
      include: {
        activities: true,
      },
    });

    RealtimeGateway.io.emit('task.created', task);

    return task;
  }

  async updateStatus(id: number, status: TaskStatus) {
    const task = await this.prisma.task.update({
      where: { id },
      data: { status },
    });

    RealtimeGateway.io.emit('task.updated', {
      taskId: task.id,
      status: task.status,
    });

    return task;
  }
}
