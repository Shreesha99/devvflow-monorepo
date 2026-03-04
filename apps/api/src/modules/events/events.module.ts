import { Module } from '@nestjs/common';
import { TaskEngineService } from './task-engine.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [PrismaModule, RealtimeModule],
  providers: [TaskEngineService],
  exports: [TaskEngineService],
})
export class EventsModule {}
