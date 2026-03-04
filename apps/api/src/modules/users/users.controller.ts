import { Controller, Get, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getUsers() {
    return this.usersService.findAll();
  }

  @Post()
  async createUser(
    @Body()
    body: {
      githubId: string;
      username: string;
      email?: string;
      avatarUrl?: string;
    },
  ) {
    return this.usersService.create(body);
  }
}
