import { Worker } from 'bullmq';
import { extractTaskId } from '../utils/commit-parser';
import { TaskEngineService } from '../modules/events/task-engine.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../modules/realtime/realtime.gateway';

const prisma = new PrismaService();
const realtime = new RealtimeGateway();
const taskEngine = new TaskEngineService(prisma, realtime);

export const githubWorker = new Worker(
  'github-events',
  async (job) => {
    console.log('Worker picked up job:', job.data);
    const payload = job.data.payload || job.data;
    const event = job.data.event || 'pull_request';

    // Handle push commits
    if (event === 'push') {
      const commits = payload.commits || [];

      for (const commit of commits) {
        console.log('Processing commit:', commit.message);

        const taskId = extractTaskId(commit.message);

        console.log('Extracted taskId:', taskId);

        if (!taskId) continue;

        await taskEngine.handleCommit(taskId, commit);
      }
    }

    // Handle pull request opened
    if (event === 'pull_request' && payload.action === 'opened') {
      const title = payload.pull_request.title;
      const taskId = extractTaskId(title);

      if (!taskId) return;

      await prisma.task.update({
        where: { id: taskId },
        data: { status: 'REVIEW' },
      });

      await prisma.activityEvent.create({
        data: {
          taskId,
          type: 'pull_request_opened',
          payload: {
            title,
            url: payload.pull_request.html_url,
          },
        },
      });

      realtime.emitTaskUpdate(taskId, 'REVIEW');
    }

    // Handle pull request merged
    if (
      event === 'pull_request' &&
      payload.action === 'closed' &&
      payload.pull_request.merged === true
    ) {
      const title = payload.pull_request.title;
      const taskId = extractTaskId(title);

      if (!taskId) return;

      await prisma.task.update({
        where: { id: taskId },
        data: { status: 'DONE' },
      });

      await prisma.activityEvent.create({
        data: {
          taskId,
          type: 'pull_request_merged',
          payload: {
            title,
            url: payload.pull_request.html_url,
          },
        },
      });

      realtime.emitTaskUpdate(taskId, 'DONE');
    }
  },
  {
    connection: {
      host: '127.0.0.1',
      port: 6379,
    },
  },
);
