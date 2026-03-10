import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from '../../prisma/prisma.service';
import { encrypt } from '../../utils/crypto';
import { randomUUID } from 'crypto';

@Controller('auth')
export class AuthController {
  constructor(private prisma: PrismaService) {}

  @Get('exchange')
  async exchange(@Req() req) {
    const code = req.query.code;

    const store = global['oauthTempStore'] || {};
    const token = store[code];

    if (!token) {
      return { error: 'Invalid code' };
    }

    delete store[code];

    return { token };
  }

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
    // const referer = req.headers.referer;
    // const origin = referer
    //   ? new URL(referer).origin
    //   : process.env.FRONTEND_URL || 'http://localhost:3001';

    // const redirectUrl = `${origin}/dashboard?token=${user.accessToken}`;

    const code = randomUUID();

    global['oauthTempStore'] = global['oauthTempStore'] || {};
    global['oauthTempStore'][code] = user.accessToken;

    const redirectUrl = `${process.env.FRONTEND_URL}/dashboard?code=${code}`;

    return res.redirect(redirectUrl);
  }
}
