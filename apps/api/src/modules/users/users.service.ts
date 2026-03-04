import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany();
  }

  async create(data: {
    githubId: string;
    username: string;
    email?: string;
    avatarUrl?: string;
  }) {
    return this.prisma.user.create({
      data,
    });
  }
}
