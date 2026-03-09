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

    let org = await this.prisma.organization.findFirst();

    if (!org) {
      org = await this.prisma.organization.create({
        data: {
          name: `${user.username}'s Organization`,
        },
      });
    }

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

    // Detect frontend automatically
    const referer = req.headers.referer;
    const origin = referer
      ? new URL(referer).origin
      : process.env.FRONTEND_URL || 'http://localhost:3001';

    const redirectUrl = `${origin}/dashboard?token=${user.accessToken}`;

    return res.redirect(redirectUrl);
  }
}
