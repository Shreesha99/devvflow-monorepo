import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import axios from 'axios';

@Injectable()
export class TaskEngineService {
  constructor(
    private prisma: PrismaService,
    private realtime: RealtimeGateway,
  ) {}

  async handleCommit(taskNumber: number, commit: any, projectId: string) {
    const match = commit.message.match(/TASK-(\d+)/);
    console.log('FILES RECEIVED:', commit.files);

    if (match) {
      taskNumber = Number(match[1]);
    }
    const task = await this.prisma.task.findFirst({
      where: {
        projectId: projectId,
        number: taskNumber,
      },
      include: {
        project: true,
      },
    });

    if (!task) return;

    if (task.status === 'BACKLOG') {
      await this.prisma.task.update({
        where: { id: task.id },
        data: { status: 'IN_PROGRESS' },
      });

      this.realtime.emitTaskUpdate(task.id, 'IN_PROGRESS');
    }

    if (commit.message.startsWith('Merge pull request')) return;

    const repoOwner = task.project.githubRepoOwner;
    const repoName = task.project.githubRepoName;

    let files = commit.files || [];

    const activity = await this.prisma.activityEvent.create({
      data: {
        taskId: task.id,
        type: 'commit_pushed',
        payload: {
          sha: commit.sha,
          message: commit.message,
          author: commit.author,
          branch: commit.branch,
          files: files,
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
