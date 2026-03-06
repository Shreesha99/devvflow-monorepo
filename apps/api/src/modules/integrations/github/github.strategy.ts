import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: 'http://localhost:3000/auth/github/callback',
      scope: ['repo', 'user'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    return {
      githubId: profile.id,
      username: profile.username,
      avatarUrl: profile.photos?.[0]?.value,
      accessToken,
    };
  }
}
