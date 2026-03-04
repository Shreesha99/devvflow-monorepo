import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ActivityService } from './activity.service';

@Controller('activity')
export class ActivityController {
  constructor(private activityService: ActivityService) {}

  @Post()
  async createActivity(
    @Body() body: { taskId: number; type: string; payload?: any },
  ) {
    return this.activityService.create(body);
  }

  @Get('task/:taskId')
  async getTaskActivity(@Param('taskId') taskId: string) {
    return this.activityService.getTaskActivity(Number(taskId));
  }
}
