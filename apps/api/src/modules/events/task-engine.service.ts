import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class TaskEngineService {
  constructor(
    private prisma: PrismaService,
    private realtime: RealtimeGateway,
  ) {}

  async handleCommit(taskId: number, commit: any) {
    // update task status
    await this.prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'IN_PROGRESS',
      },
    });

    console.log('Emitting websocket event for task:', taskId);

    // emit websocket event
    this.realtime.emitTaskUpdate(taskId, 'IN_PROGRESS');

    // create activity event
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

    // emit activity realtime
    this.realtime.emitActivity(taskId, activity);
  }
}
