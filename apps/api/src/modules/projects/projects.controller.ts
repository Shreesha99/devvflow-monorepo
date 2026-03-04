import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private projectService: ProjectsService) {}

  @Get()
  async getProjects() {
    return this.projectService.findAll();
  }

  @Get('organization/:orgId')
  async getByOrganization(@Param('orgId') orgId: string) {
    return this.projectService.findByOrganization(orgId);
  }

  @Post()
  async createProject(@Body() body: { name: string; organizationId: string }) {
    return this.projectService.create(body);
  }
}
