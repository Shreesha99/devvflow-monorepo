import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.organization.findMany({
      include: {
        projects: true,
      },
    });
  }

  async create(name: string) {
    return this.prisma.organization.create({
      data: { name },
    });
  }
}
