import { Queue } from 'bullmq';

export const githubEventsQueue = new Queue('github-events', {
  connection: {
    host: '127.0.0.1',
    port: 6379,
  },
});
