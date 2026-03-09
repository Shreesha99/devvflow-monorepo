import { Worker } from 'bullmq';
import { extractTaskNumber } from '../utils/commit-parser';
import { TaskEngineService } from '../modules/events/task-engine.service';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../modules/realtime/realtime.gateway';
import axios from 'axios';
import { decrypt } from 'src/utils/crypto';

const prisma = new PrismaService();
const realtime = new RealtimeGateway();
const taskEngine = new TaskEngineService(prisma, realtime);

export const githubWorker = new Worker(
  'github-events',
  async (job) => {
    console.log('Worker picked up job:', job.data);
    const payload = job.data.payload || job.data;
    console.log('Worker payload keys:', Object.keys(payload || {}));
    const event = job.data.event || 'pull_request';
    const owner = payload.repository?.owner?.login;
    const repo = payload.repository?.name;

    const project = await prisma.project.findFirst({
      where: {
        githubRepoOwner: owner,
        githubRepoName: repo,
      },
    });

    if (!project) {
      console.log('No project found for repo:', owner, repo);
      return;
    }

    const projectId = project.id;

    console.log('Resolved projectId:', projectId);

    console.log('Worker projectId:', projectId);

    // Handle push commits
    if (event === 'push') {
      const commits = payload.commits || [];

      for (const commit of commits) {
        console.log('Processing commit:', commit.message);

        const taskId = extractTaskNumber(commit.message);

        console.log('Extracted taskId:', taskId);

        if (!taskId) continue;

        let files: any[] = [];

        try {
          const integration = await prisma.integration.findFirst({
            where: {
              type: 'github',
            },
          });

          if (!integration) {
            console.log('No GitHub integration found');
            return;
          }
          if (!integration.config) {
            console.log('Integration config missing');
            return;
          }

          const token = decrypt((integration.config as any).accessToken);

          const commitDetails = await axios.get(
            `https://api.github.com/repos/${owner}/${repo}/commits/${commit.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/vnd.github+json',
              },
            },
          );

          files =
            commitDetails.data.files?.map((f: any) => ({
              path: f.filename,
              additions: f.additions,
              deletions: f.deletions,
              patch: f.patch,
            })) || [];
        } catch (err) {
          console.log('Failed to fetch commit files:', err.message);
        }

        const enrichedCommit = {
          sha: commit.id,
          message: commit.message,
          author: commit.author?.name,
          branch: payload.ref?.replace('refs/heads/', ''),
          files,
        };

        await taskEngine.handleCommit(taskId, enrichedCommit, projectId);
      }
    }

    // Handle pull request opened
    if (event === 'pull_request' && payload.action === 'opened') {
      const title = payload.pull_request.title;
      const taskId = extractTaskNumber(title);

      if (!taskId) return;
      const task = await prisma.task.findFirst({
        where: {
          projectId,
          number: taskId,
        },
      });

      if (!task) return;

      await prisma.task.update({
        where: { id: task.id },
        data: { status: 'REVIEW' },
      });

      const activity = await prisma.activityEvent.create({
        data: {
          taskId: task.id,
          type: 'pull_request_opened',
          payload: {
            title,
            url: payload.pull_request.html_url,
            status: 'open',
            headSha: payload.pull_request.head.sha,
            branch: payload.pull_request.head.ref,
          },
        },
      });

      realtime.emitTaskUpdate(task.id, 'REVIEW');

      RealtimeGateway.io.emit('activity.created', {
        taskId: task.id,
        activity,
      });
    }

    // Handle pull request merged
    if (
      event === 'pull_request' &&
      payload.action === 'closed' &&
      payload.pull_request.merged === true
    ) {
      const title = payload.pull_request.title;
      const taskId = extractTaskNumber(title);

      if (!taskId) return;

      const task = await prisma.task.findFirst({
        where: {
          projectId,
          number: taskId,
        },
      });

      if (!task) return;

      await prisma.task.update({
        where: { id: task.id },
        data: { status: 'DONE' },
      });

      const activity = await prisma.activityEvent.create({
        data: {
          taskId: task.id,
          type: 'pull_request_merged',
          payload: {
            title,
            url: payload.pull_request.html_url,
            status: 'merged',
            headSha: payload.pull_request.head.sha,
            branch: payload.pull_request.head.ref,
          },
        },
      });

      realtime.emitTaskUpdate(task.id, 'DONE');

      RealtimeGateway.io.emit('activity.created', {
        taskId: task.id,
        activity,
      });
    }

    if (
      event === 'pull_request' &&
      payload.action === 'closed' &&
      payload.pull_request.merged === false
    ) {
      const title = payload.pull_request.title;
      const taskId = extractTaskNumber(title);

      if (!taskId) return;

      const task = await prisma.task.findFirst({
        where: {
          projectId,
          number: taskId,
        },
      });

      if (!task) return;

      const activity = await prisma.activityEvent.create({
        data: {
          taskId: task.id,
          type: 'pull_request_closed',
          payload: {
            title,
            url: payload.pull_request.html_url,
            status: 'closed',
            headSha: payload.pull_request.head.sha,
            branch: payload.pull_request.head.ref,
          },
        },
      });

      RealtimeGateway.io.emit('activity.created', {
        taskId: task.id,
        activity,
      });
    }

    if (event === 'pull_request' && payload.action === 'reopened') {
      const title = payload.pull_request.title;
      const taskId = extractTaskNumber(title);

      if (!taskId) return;

      const task = await prisma.task.findFirst({
        where: {
          projectId,
          number: taskId,
        },
      });

      if (!task) return;

      const activity = await prisma.activityEvent.create({
        data: {
          taskId: task.id,
          type: 'pull_request_reopened',
          payload: {
            title,
            url: payload.pull_request.html_url,
            status: 'open',
            headSha: payload.pull_request.head.sha,
            branch: payload.pull_request.head.ref,
          },
        },
      });

      RealtimeGateway.io.emit('activity.created', {
        taskId: task.id,
        activity,
      });
    }
  },
  {
    connection: {
      url: process.env.REDIS_URL,
      tls: {},
    },
  },
);
