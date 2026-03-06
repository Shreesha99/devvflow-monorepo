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
    const task = await this.prisma.task.findFirst({
      where: {
        projectId: projectId,
        number: taskId,
      },
    });

    if (!task) return;

    // Only move to IN_PROGRESS if still BACKLOG
    if (task.status === 'BACKLOG') {
      await this.prisma.task.update({
        where: { id: task.id },
        data: { status: 'IN_PROGRESS' },
      });

      this.realtime.emitTaskUpdate(task.id, 'IN_PROGRESS');
    }

    const activity = await this.prisma.activityEvent.create({
      data: {
        taskId: task.id,
        type: 'commit_pushed',
        payload: {
          message: commit.message,
          author: commit.author?.name,
        },
      },
    });
    RealtimeGateway.io.emit('activity.created', {
      taskId: task.id,
      activity,
    });
    this.realtime.emitActivity(task.id, activity);
  }
}
