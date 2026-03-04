import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  async create(data: { taskId: number; type: string; payload?: any }) {
    return this.prisma.activityEvent.create({
      data,
    });
  }

  async getTaskActivity(taskId: number) {
    return this.prisma.activityEvent.findMany({
      where: { taskId },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
