import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../../prisma/prisma.service';
import { encrypt } from '../../utils/crypto';

@Controller('auth')
export class AuthController {
  constructor(private prisma: PrismaService) {}

  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubLogin() {
    // redirects to GitHub
  }

  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubCallback(@Req() req, @Res() res) {
    const user = req.user;

    const encryptedToken = encrypt(user.accessToken);

    // TEMP: get first organization
    const org = await this.prisma.organization.findFirst();

    if (org) {
      await this.prisma.integration.upsert({
        where: {
          organizationId_type: {
            organizationId: org.id,
            type: 'github',
          },
        },
        update: {
          config: {
            accessToken: encryptedToken,
          },
        },
        create: {
          organizationId: org.id,
          type: 'github',
          config: {
            accessToken: encryptedToken,
          },
        },
      });
    }

    const redirectUrl = `http://localhost:3001/dashboard?token=${user.accessToken}`;
    return res.redirect(redirectUrl);
  }
}
