import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'github-events',
    }),
  ],
  exports: [BullModule],
})
export class QueuesModule {}
