import { Controller, Get, Post, Body } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';

@Controller('organizations')
export class OrganizationsController {
  constructor(private orgService: OrganizationsService) {}

  @Get()
  async getOrganizations() {
    return this.orgService.findAll();
  }

  @Post()
  async createOrganization(@Body() body: { name: string }) {
    return this.orgService.create(body.name);
  }
}
