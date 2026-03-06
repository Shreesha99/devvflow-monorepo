import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { GithubStrategy } from '../integrations/github/github.strategy';

@Module({
  imports: [PassportModule],
  controllers: [AuthController],
  providers: [GithubStrategy],
})
export class AuthModule {}
