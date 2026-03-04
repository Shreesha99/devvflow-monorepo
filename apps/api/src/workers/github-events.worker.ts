import { Worker } from 'bullmq';

export const githubWorker = new Worker(
  'github-events',
  async (job) => {
    const { event, payload } = job.data;

    console.log('Processing GitHub event:', event);

    if (event === 'push') {
      console.log(payload.commits);
    }
  },
  {
    connection: {
      host: '127.0.0.1',
      port: 6379,
    },
  },
);
