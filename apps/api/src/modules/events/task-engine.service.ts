import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class TaskEngineService {
  constructor(
    private prisma: PrismaService,
    private realtime: RealtimeGateway,
  ) {}

  async handleCommit(taskId: number, commit: any, projectId: string) {
    const task = await this.prisma.task.findUnique({
      where: {
        id: taskId,
        projectId: projectId,
      },
    });

    if (!task) return;

    // Only move to IN_PROGRESS if still BACKLOG
    if (task.status === 'BACKLOG') {
      await this.prisma.task.update({
        where: { id: taskId },
        data: { status: 'IN_PROGRESS' },
      });

      this.realtime.emitTaskUpdate(taskId, 'IN_PROGRESS');
    }

    const activity = await this.prisma.activityEvent.create({
      data: {
        taskId,
        type: 'commit_pushed',
        payload: {
          message: commit.message,
          author: commit.author?.name,
        },
      },
    });
    RealtimeGateway.io.emit('activity.created', {
      taskId,
      activity,
    });

    this.realtime.emitActivity(taskId, activity);
  }
}
