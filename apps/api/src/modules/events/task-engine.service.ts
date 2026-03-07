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

    let files = [];

    try {
      const res = await axios.get(
        `https://api.github.com/repos/${repoOwner}/${repoName}/commits/${commit.id}`,
      );

      files =
        res.data.files?.map((f: any) => ({
          path: f.filename,
          additions: f.additions,
          deletions: f.deletions,
          patch: f.patch || null,
        })) || [];
    } catch (err) {
      console.log('Failed to fetch commit files');
    }

    const activity = await this.prisma.activityEvent.create({
      data: {
        taskId: task.id,
        type: 'commit_pushed',
        payload: {
          sha: commit.id,
          message: commit.message,
          author: commit.author?.name,
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
